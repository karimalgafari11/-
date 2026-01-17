/**
 * Customer Service - خدمة العملاء
 * التعامل مع جدول customers في Supabase
 */

// Supabase disabled - working with local storage only
const isSupabaseConfigured = () => false;
const getSupabaseClient = (): any => null;
import { SafeStorage } from '../utils/storage';
import { ActivityLogger } from './activityLogger';
import { SyncService } from './syncService';
import type { Customer, InsertType, UpdateType } from '../types/database';

const CUSTOMERS_KEY = 'alzhra_customers';

export const CustomerService = {
    /**
     * جلب جميع العملاء
     */
    async getCustomers(organizationId: string): Promise<Customer[]> {
        if (isSupabaseConfigured() && navigator.onLine) {
            const client = getSupabaseClient();
            if (client) {
                try {
                    const { data, error } = await client
                        .from('customers')
                        .select('*')
                        .eq('organization_id', organizationId)
                        .is('deleted_at', null)
                        .order('name');

                    if (!error && data) {
                        SafeStorage.set(CUSTOMERS_KEY, data);
                        return data;
                    }
                } catch (err) {
                    console.error('Error fetching customers:', err);
                }
            }
        }

        const local = SafeStorage.get<Customer[]>(CUSTOMERS_KEY, []);
        return local.filter(c => c.organization_id === organizationId && !c.deleted_at);
    },

    /**
     * جلب عميل واحد
     */
    async getCustomer(id: string): Promise<Customer | null> {
        if (isSupabaseConfigured() && navigator.onLine) {
            const client = getSupabaseClient();
            if (client) {
                const { data } = await client
                    .from('customers')
                    .select('*')
                    .eq('id', id)
                    .single();
                return data;
            }
        }

        const local = SafeStorage.get<Customer[]>(CUSTOMERS_KEY, []);
        return local.find(c => c.id === id) || null;
    },

    /**
     * إنشاء عميل جديد
     */
    async createCustomer(
        customer: InsertType<Customer>,
        context: { userId: string; branchId: string; userName?: string }
    ): Promise<Customer> {
        const now = new Date().toISOString();
        const newCustomer: Customer = {
            ...customer,
            id: customer.id || `cust_${Date.now()}`,
            created_at: now,
            updated_at: now,
        } as Customer;

        // حفظ محلياً
        const local = SafeStorage.get<Customer[]>(CUSTOMERS_KEY, []);
        local.push(newCustomer);
        SafeStorage.set(CUSTOMERS_KEY, local);

        // تسجيل النشاط
        ActivityLogger.log({
            action: 'create',
            entityType: 'customer',
            entityId: newCustomer.id,
            entityName: newCustomer.name,
            userId: context.userId,
            userName: context.userName || 'مستخدم',
            organizationId: newCustomer.organization_id,
            branchId: context.branchId,
            newData: newCustomer as unknown as Record<string, unknown>
        });

        // المزامنة
        if (isSupabaseConfigured() && navigator.onLine) {
            const client = getSupabaseClient();
            if (client) {
                try {
                    await client.from('customers').insert(newCustomer);
                } catch (err) {
                    console.error('Error inserting customer:', err);
                    SyncService.addToQueue({
                        operation: 'create',
                        entityType: 'customers',
                        entityId: newCustomer.id,
                        data: newCustomer as unknown as Record<string, unknown>,
                        userId: context.userId,
                        branchId: context.branchId
                    });
                }
            }
        } else {
            SyncService.addToQueue({
                operation: 'create',
                entityType: 'customers',
                entityId: newCustomer.id,
                data: newCustomer as unknown as Record<string, unknown>,
                userId: context.userId,
                branchId: context.branchId
            });
        }

        return newCustomer;
    },

    /**
     * تحديث عميل
     */
    async updateCustomer(
        id: string,
        updates: UpdateType<Customer>,
        context: { userId: string; branchId: string; userName?: string }
    ): Promise<Customer | null> {
        const local = SafeStorage.get<Customer[]>(CUSTOMERS_KEY, []);
        const index = local.findIndex(c => c.id === id);

        if (index === -1) return null;

        const oldData = { ...local[index] };
        const updatedCustomer: Customer = {
            ...local[index],
            ...updates,
            updated_at: new Date().toISOString()
        };

        local[index] = updatedCustomer;
        SafeStorage.set(CUSTOMERS_KEY, local);

        ActivityLogger.log({
            action: 'update',
            entityType: 'customer',
            entityId: id,
            entityName: updatedCustomer.name,
            userId: context.userId,
            userName: context.userName || 'مستخدم',
            organizationId: updatedCustomer.organization_id,
            branchId: context.branchId,
            oldData: oldData as unknown as Record<string, unknown>,
            newData: updatedCustomer as unknown as Record<string, unknown>
        });

        if (isSupabaseConfigured() && navigator.onLine) {
            const client = getSupabaseClient();
            if (client) {
                try {
                    await client.from('customers').update(updates).eq('id', id);
                } catch (err) {
                    console.error('Error updating customer:', err);
                    SyncService.addToQueue({
                        operation: 'update',
                        entityType: 'customers',
                        entityId: id,
                        data: updates as unknown as Record<string, unknown>,
                        userId: context.userId,
                        branchId: context.branchId
                    });
                }
            }
        } else {
            SyncService.addToQueue({
                operation: 'update',
                entityType: 'customers',
                entityId: id,
                data: updates as unknown as Record<string, unknown>,
                userId: context.userId,
                branchId: context.branchId
            });
        }

        return updatedCustomer;
    },

    /**
     * حذف عميل (Soft Delete)
     */
    async deleteCustomer(
        id: string,
        context: { userId: string; branchId: string; userName?: string }
    ): Promise<boolean> {
        return this.updateCustomer(id, { deleted_at: new Date().toISOString() }, context) !== null;
    },

    /**
     * البحث في العملاء
     */
    async searchCustomers(organizationId: string, query: string): Promise<Customer[]> {
        const allCustomers = await this.getCustomers(organizationId);
        const lowerQuery = query.toLowerCase();

        return allCustomers.filter(c =>
            c.name.toLowerCase().includes(lowerQuery) ||
            (c.phone && c.phone.includes(query)) ||
            (c.email && c.email.toLowerCase().includes(lowerQuery))
        );
    },

    /**
     * جلب رصيد العميل (محسوب)
     */
    async getCustomerBalance(customerId: string): Promise<number> {
        if (isSupabaseConfigured() && navigator.onLine) {
            const client = getSupabaseClient();
            if (client) {
                try {
                    const { data } = await client
                        .from('customer_balances')
                        .select('balance')
                        .eq('id', customerId)
                        .single();
                    return data?.balance || 0;
                } catch {
                    // View might not exist yet
                }
            }
        }

        // حساب محلي
        const sales = SafeStorage.get<{ customer_id: string; total_amount: number; status: string }[]>('alzhra_sales', []);
        const vouchers = SafeStorage.get<{ party_id: string; amount: number; voucher_type: string; status: string }[]>('alzhra_vouchers', []);

        const totalSales = sales
            .filter(s => s.customer_id === customerId && s.status === 'completed')
            .reduce((sum, s) => sum + s.total_amount, 0);

        const totalReceipts = vouchers
            .filter(v => v.party_id === customerId && v.voucher_type === 'receipt' && v.status === 'confirmed')
            .reduce((sum, v) => sum + v.amount, 0);

        return totalSales - totalReceipts;
    }
};
