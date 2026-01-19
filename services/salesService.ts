/**
 * Sales Service - خدمة المبيعات
 * متوافق مع Supabase Schema
 */

import { supabase } from '../lib/supabaseClient';
import { ActivityLogger } from './activityLogger';
import type { Sale, SaleItem, InsertType } from '../types/supabase-types';

export interface SaleWithItems extends Sale {
    items: SaleItem[];
}

export interface CreateSaleData {
    sale: Omit<InsertType<Sale>, 'company_id' | 'items'>;
    items: SaleItem[];
}

export const SalesService = {
    /**
     * جلب جميع المبيعات
     */
    async getSales(companyId: string): Promise<Sale[]> {
        try {
            const { data, error } = await supabase
                .from('sales')
                .select('*')
                .eq('company_id', companyId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ خطأ في جلب المبيعات:', error);
                return [];
            }

            return data || [];
        } catch (err) {
            console.error('❌ استثناء في جلب المبيعات:', err);
            return [];
        }
    },

    /**
     * جلب مبيعات عميل
     */
    async getSalesByCustomer(companyId: string, customerId: string): Promise<Sale[]> {
        try {
            const { data, error } = await supabase
                .from('sales')
                .select('*')
                .eq('company_id', companyId)
                .eq('customer_id', customerId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('❌ خطأ في جلب مبيعات العميل:', err);
            return [];
        }
    },

    /**
     * جلب فاتورة واحدة
     */
    async getSaleById(id: string): Promise<Sale | null> {
        try {
            const { data, error } = await supabase
                .from('sales')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (err) {
            console.error('❌ خطأ في جلب الفاتورة:', err);
            return null;
        }
    },

    /**
     * إنشاء فاتورة مبيعات
     */
    async createSale(
        data: CreateSaleData,
        context: { userId: string; companyId: string; userName?: string }
    ): Promise<Sale | null> {
        const now = new Date().toISOString();

        // حساب المجاميع
        let subtotal = 0;
        let taxTotal = 0;

        const items: SaleItem[] = data.items.map(item => {
            const lineTotal = item.quantity * item.unit_price - (item.discount || 0);
            const taxAmount = lineTotal * 0.15; // 15% ضريبة
            subtotal += lineTotal;
            taxTotal += taxAmount;

            return {
                ...item,
                total: lineTotal + taxAmount
            };
        });

        const newSale: Sale = {
            id: `sale_${Date.now()}`,
            company_id: context.companyId,
            user_id: context.userId,
            customer_id: data.sale.customer_id,
            invoice_number: data.sale.invoice_number || await this.generateInvoiceNumber(context.companyId),
            total: subtotal,
            discount: data.sale.discount || 0,
            tax: taxTotal,
            net_total: subtotal + taxTotal - (data.sale.discount || 0),
            paid: data.sale.paid || 0,
            payment_method: data.sale.payment_method || 'cash',
            status: data.sale.status || 'completed',
            notes: data.sale.notes,
            items: items,
            created_at: now,
            updated_at: now
        };

        try {
            const { data: result, error } = await supabase
                .from('sales')
                .insert(newSale)
                .select()
                .single();

            if (error) throw error;

            // تسجيل النشاط
            ActivityLogger.log({
                action: 'create',
                entityType: 'sale',
                entityId: result.id,
                entityName: `فاتورة ${result.invoice_number}`,
                userId: context.userId,
                userName: context.userName || 'مستخدم',
                organizationId: context.companyId,
                branchId: '',
                newData: result as unknown as Record<string, unknown>
            });

            console.log('✅ تم إنشاء الفاتورة:', result.id);
            return result;
        } catch (err) {
            console.error('❌ خطأ في إنشاء الفاتورة:', err);
            return null;
        }
    },

    /**
     * تحديث فاتورة
     */
    async updateSale(id: string, updates: Partial<Sale>): Promise<Sale | null> {
        try {
            const { data, error } = await supabase
                .from('sales')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            console.log('✅ تم تحديث الفاتورة:', id);
            return data;
        } catch (err) {
            console.error('❌ خطأ في تحديث الفاتورة:', err);
            return null;
        }
    },

    /**
     * تسجيل دفعة
     */
    async recordPayment(id: string, amount: number): Promise<boolean> {
        try {
            const sale = await this.getSaleById(id);
            if (!sale) return false;

            const newPaid = (sale.paid || 0) + amount;
            const newStatus = newPaid >= sale.net_total ? 'paid' : 'partial';

            const { error } = await supabase
                .from('sales')
                .update({
                    paid: newPaid,
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;
            console.log('✅ تم تسجيل دفعة:', amount);
            return true;
        } catch (err) {
            console.error('❌ خطأ في تسجيل الدفعة:', err);
            return false;
        }
    },

    /**
     * إلغاء فاتورة
     */
    async cancelSale(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('sales')
                .update({ status: 'cancelled' })
                .eq('id', id);

            if (error) throw error;
            console.log('✅ تم إلغاء الفاتورة:', id);
            return true;
        } catch (err) {
            console.error('❌ خطأ في إلغاء الفاتورة:', err);
            return false;
        }
    },

    /**
     * توليد رقم فاتورة
     */
    async generateInvoiceNumber(companyId: string): Promise<string> {
        const year = new Date().getFullYear();
        const { count } = await supabase
            .from('sales')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId);

        const number = ((count || 0) + 1).toString().padStart(5, '0');
        return `INV-${year}-${number}`;
    },

    /**
     * إحصائيات المبيعات
     */
    async getStats(companyId: string): Promise<{
        totalSales: number;
        totalAmount: number;
        totalPaid: number;
        pending: number;
    }> {
        try {
            const { data, error } = await supabase
                .from('sales')
                .select('net_total, paid, status')
                .eq('company_id', companyId);

            if (error) throw error;

            return (data || []).reduce((acc, s) => ({
                totalSales: acc.totalSales + 1,
                totalAmount: acc.totalAmount + (s.net_total || 0),
                totalPaid: acc.totalPaid + (s.paid || 0),
                pending: acc.pending + (s.status === 'pending' ? 1 : 0)
            }), {
                totalSales: 0,
                totalAmount: 0,
                totalPaid: 0,
                pending: 0
            });
        } catch (err) {
            console.error('❌ خطأ في الإحصائيات:', err);
            return { totalSales: 0, totalAmount: 0, totalPaid: 0, pending: 0 };
        }
    }
};

export default SalesService;
