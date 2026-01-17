/**
 * Sales Service - خدمة المبيعات
 * التعامل مع جداول sales و sale_items
 */

// Supabase disabled - working with local storage only
const isSupabaseConfigured = () => false;
// When Supabase is disabled, return null with proper type assertion
const getSupabaseClient = (): any => null;
import { SafeStorage } from '../utils/storage';
import { ActivityLogger } from './activityLogger';
import { SyncService } from './syncService';
import type { Sale, SaleItem, InsertType, UpdateType } from '../types/database';

const SALES_KEY = 'alzhra_sales';
const SALE_ITEMS_KEY = 'alzhra_sale_items';

export interface SaleWithItems extends Sale {
    items: SaleItem[];
}

export interface CreateSaleData {
    sale: InsertType<Sale>;
    items: InsertType<SaleItem>[];
}

export const SalesService = {
    /**
     * جلب جميع المبيعات
     */
    async getSales(organizationId: string, branchId?: string): Promise<Sale[]> {
        if (isSupabaseConfigured() && navigator.onLine) {
            const client = getSupabaseClient();
            if (client) {
                try {
                    let query = client
                        .from('sales')
                        .select('*')
                        .eq('organization_id', organizationId)
                        .is('deleted_at', null)
                        .order('invoice_date', { ascending: false });

                    if (branchId) {
                        query = query.eq('branch_id', branchId);
                    }

                    const { data, error } = await query;

                    if (!error && data) {
                        SafeStorage.set(SALES_KEY, data);
                        return data;
                    }
                } catch (err) {
                    console.error('Error fetching sales:', err);
                }
            }
        }

        const local = SafeStorage.get<Sale[]>(SALES_KEY, []);
        return local.filter(s =>
            s.organization_id === organizationId &&
            !s.deleted_at &&
            (!branchId || s.branch_id === branchId)
        );
    },

    /**
     * جلب فاتورة مع السطور
     */
    async getSaleWithItems(saleId: string): Promise<SaleWithItems | null> {
        let sale: Sale | null = null;
        let items: SaleItem[] = [];

        if (isSupabaseConfigured() && navigator.onLine) {
            const client = getSupabaseClient();
            if (client) {
                const { data: saleData } = await client
                    .from('sales')
                    .select('*')
                    .eq('id', saleId)
                    .single();

                if (saleData) {
                    sale = saleData;

                    const { data: itemsData } = await client
                        .from('sale_items')
                        .select('*')
                        .eq('sale_id', saleId)
                        .order('line_order');

                    items = itemsData || [];
                }
            }
        }

        if (!sale) {
            const localSales = SafeStorage.get<Sale[]>(SALES_KEY, []);
            sale = localSales.find(s => s.id === saleId) || null;

            if (sale) {
                const localItems = SafeStorage.get<SaleItem[]>(SALE_ITEMS_KEY, []);
                items = localItems.filter(i => i.sale_id === saleId);
            }
        }

        return sale ? { ...sale, items } : null;
    },

    /**
     * إنشاء فاتورة مبيعات جديدة
     */
    async createSale(
        data: CreateSaleData,
        context: { userId: string; branchId: string; userName?: string; organizationId: string }
    ): Promise<SaleWithItems> {
        const now = new Date().toISOString();

        // إنشاء الفاتورة
        const newSale: Sale = {
            ...data.sale,
            id: data.sale.id || `sale_${Date.now()}`,
            organization_id: context.organizationId,
            branch_id: context.branchId,
            created_by: context.userId,
            status: data.sale.status || 'draft',
            created_at: now,
            updated_at: now,
        } as Sale;

        // حساب المجاميع
        let subtotal = 0;
        let taxTotal = 0;

        // إنشاء السطور
        const newItems: SaleItem[] = data.items.map((item, index) => {
            const lineTotal = item.quantity * item.unit_price - (item.discount_amount || 0);
            const taxAmount = lineTotal * ((item.tax_rate || 15) / 100);

            subtotal += lineTotal;
            taxTotal += taxAmount;

            return {
                ...item,
                id: item.id || `si_${Date.now()}_${index}`,
                sale_id: newSale.id,
                line_total: lineTotal,
                tax_amount: taxAmount,
                line_order: index,
                created_at: now,
            } as SaleItem;
        });

        // تحديث المجاميع في الفاتورة
        newSale.subtotal = subtotal;
        newSale.tax_amount = taxTotal;
        newSale.total_amount = subtotal + taxTotal - (newSale.discount_amount || 0);

        // حفظ محلياً
        const localSales = SafeStorage.get<Sale[]>(SALES_KEY, []);
        localSales.push(newSale);
        SafeStorage.set(SALES_KEY, localSales);

        const localItems = SafeStorage.get<SaleItem[]>(SALE_ITEMS_KEY, []);
        localItems.push(...newItems);
        SafeStorage.set(SALE_ITEMS_KEY, localItems);

        // تسجيل النشاط
        ActivityLogger.log({
            action: 'create',
            entityType: 'sale',
            entityId: newSale.id,
            entityName: `فاتورة ${newSale.invoice_number}`,
            userId: context.userId,
            userName: context.userName || 'مستخدم',
            organizationId: context.organizationId,
            branchId: context.branchId,
            newData: { sale: newSale, items: newItems } as unknown as Record<string, unknown>
        });

        // المزامنة
        if (isSupabaseConfigured() && navigator.onLine) {
            const client = getSupabaseClient();
            if (client) {
                try {
                    await client.from('sales').insert(newSale);
                    await client.from('sale_items').insert(newItems);
                } catch (err) {
                    console.error('Error inserting sale:', err);
                    SyncService.addToQueue({
                        operation: 'create',
                        entityType: 'sales',
                        entityId: newSale.id,
                        data: { sale: newSale, items: newItems } as unknown as Record<string, unknown>,
                        userId: context.userId,
                        branchId: context.branchId
                    });
                }
            }
        } else {
            SyncService.addToQueue({
                operation: 'create',
                entityType: 'sales',
                entityId: newSale.id,
                data: { sale: newSale, items: newItems } as unknown as Record<string, unknown>,
                userId: context.userId,
                branchId: context.branchId
            });
        }

        return { ...newSale, items: newItems };
    },

    /**
     * تأكيد فاتورة (تغيير الحالة)
     */
    async confirmSale(
        saleId: string,
        context: { userId: string; branchId: string; userName?: string }
    ): Promise<boolean> {
        return this.updateSaleStatus(saleId, 'confirmed', context);
    },

    /**
     * إكمال فاتورة
     */
    async completeSale(
        saleId: string,
        context: { userId: string; branchId: string; userName?: string }
    ): Promise<boolean> {
        return this.updateSaleStatus(saleId, 'completed', context);
    },

    /**
     * تحديث حالة الفاتورة
     */
    async updateSaleStatus(
        saleId: string,
        status: Sale['status'],
        context: { userId: string; branchId: string; userName?: string }
    ): Promise<boolean> {
        const localSales = SafeStorage.get<Sale[]>(SALES_KEY, []);
        const index = localSales.findIndex(s => s.id === saleId);

        if (index === -1) return false;

        const oldStatus = localSales[index].status;
        localSales[index].status = status;
        localSales[index].updated_at = new Date().toISOString();
        SafeStorage.set(SALES_KEY, localSales);

        ActivityLogger.log({
            action: 'update',
            entityType: 'sale',
            entityId: saleId,
            entityName: `فاتورة ${localSales[index].invoice_number}`,
            userId: context.userId,
            userName: context.userName || 'مستخدم',
            organizationId: localSales[index].organization_id,
            branchId: context.branchId,
            oldData: { status: oldStatus },
            newData: { status }
        });

        if (isSupabaseConfigured() && navigator.onLine) {
            const client = getSupabaseClient();
            if (client) {
                try {
                    await client.from('sales').update({ status }).eq('id', saleId);
                } catch (err) {
                    console.error('Error updating sale status:', err);
                }
            }
        }

        return true;
    },

    /**
     * تسجيل دفعة على الفاتورة
     */
    async recordPayment(
        saleId: string,
        amount: number,
        context: { userId: string; branchId: string; userName?: string }
    ): Promise<boolean> {
        const localSales = SafeStorage.get<Sale[]>(SALES_KEY, []);
        const index = localSales.findIndex(s => s.id === saleId);

        if (index === -1) return false;

        const sale = localSales[index];
        const newPaidAmount = (sale.paid_amount || 0) + amount;

        localSales[index].paid_amount = newPaidAmount;
        localSales[index].updated_at = new Date().toISOString();

        // تحديث الحالة إذا تم الدفع الكامل
        if (newPaidAmount >= sale.total_amount && sale.status === 'confirmed') {
            localSales[index].status = 'completed';
        }

        SafeStorage.set(SALES_KEY, localSales);

        ActivityLogger.log({
            action: 'payment',
            entityType: 'sale',
            entityId: saleId,
            entityName: `فاتورة ${sale.invoice_number}`,
            userId: context.userId,
            userName: context.userName || 'مستخدم',
            organizationId: sale.organization_id,
            branchId: context.branchId,
            newData: { payment_amount: amount, new_paid_amount: newPaidAmount }
        });

        if (isSupabaseConfigured() && navigator.onLine) {
            const client = getSupabaseClient();
            if (client) {
                try {
                    await client.from('sales').update({
                        paid_amount: newPaidAmount,
                        status: localSales[index].status
                    }).eq('id', saleId);
                } catch (err) {
                    console.error('Error recording payment:', err);
                }
            }
        }

        return true;
    },

    /**
     * توليد رقم فاتورة جديد
     */
    generateInvoiceNumber(branchCode: string): string {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `INV-${branchCode}-${year}${month}-${random}`;
    },

    /**
     * جلب إحصائيات المبيعات
     */
    async getSalesStats(
        organizationId: string,
        branchId?: string,
        startDate?: string,
        endDate?: string
    ): Promise<{
        totalSales: number;
        totalAmount: number;
        paidAmount: number;
        pendingAmount: number;
    }> {
        let sales = await this.getSales(organizationId, branchId);

        if (startDate) {
            sales = sales.filter(s => s.invoice_date >= startDate);
        }
        if (endDate) {
            sales = sales.filter(s => s.invoice_date <= endDate);
        }

        const completedSales = sales.filter(s => s.status === 'completed' || s.status === 'confirmed');

        return {
            totalSales: completedSales.length,
            totalAmount: completedSales.reduce((sum, s) => sum + s.total_amount, 0),
            paidAmount: completedSales.reduce((sum, s) => sum + (s.paid_amount || 0), 0),
            pendingAmount: completedSales.reduce((sum, s) => sum + (s.total_amount - (s.paid_amount || 0)), 0)
        };
    }
};
