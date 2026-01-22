/**
 * Purchases Service - خدمة المشتريات
 * Refactored to use 'documents' table (type='bill')
 */

import { supabase } from '../lib/supabaseClient';
import type { Document, Insert, Update } from '../types/supabase-helpers';

export type Purchase = Document;

export const purchasesService = {
    /**
     * جلب جميع المشتريات (فواتير المشتريات)
     */
    async getAll(companyId: string): Promise<Purchase[]> {
        try {
            const { data, error } = await (supabase as any)
                .from('documents')
                .select('*, partners(name)')
                .eq('company_id', companyId)
                .eq('type', 'bill')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('❌ خطأ في جلب المشتريات:', err);
            return [];
        }
    },

    /**
     * جلب مشتريات مورد معين
     */
    async getBySupplier(companyId: string, supplierId: string): Promise<Purchase[]> {
        try {
            const { data, error } = await (supabase as any)
                .from('documents')
                .select('*')
                .eq('company_id', companyId)
                .eq('type', 'bill')
                .eq('partner_id', supplierId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('❌ خطأ في جلب مشتريات المورد:', err);
            return [];
        }
    },

    /**
     * جلب مشترى واحد
     */
    async getById(id: string): Promise<Purchase | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('documents')
                .select('*, document_items(*)')
                .eq('id', id)
                .eq('type', 'bill')
                .single();

            if (error) throw error;
            return data;
        } catch (err) {
            console.error('❌ خطأ في جلب المشترى:', err);
            return null;
        }
    },

    /**
     * إنشاء مشترى جديد
     */
    async create(
        companyId: string,
        purchase: any // Using any to facilitate mapping from old Purchase input
    ): Promise<Purchase | null> {
        try {
            // Map old Purchase payload to Document Insert
            const payload: Insert<'documents'> = {
                company_id: companyId,
                type: 'bill',
                document_number: purchase.document_number || `BIL-${Date.now()}`,
                date: purchase.date || new Date().toISOString(),
                partner_id: purchase.supplier_id || purchase.partner_id,
                total_amount: purchase.net_total || purchase.total_amount || 0,
                paid_amount: purchase.paid || purchase.paid_amount || 0,
                // remaining_amount is generated/calculated
                status: purchase.status || 'draft',
                notes: purchase.notes,
                // Add validation/defaults as needed
            };

            const { data, error } = await (supabase as any)
                .from('documents')
                .insert(payload)
                .select()
                .single();

            if (error) {
                console.error('❌ Supabase Error in create purchase:', JSON.stringify(error, null, 2));
                throw error;
            }

            // Handle Items if present in payload (purchase.items)
            if (purchase.items && purchase.items.length > 0) {
                const itemsPayload = purchase.items.map((item: any) => ({
                    document_id: data.id,
                    product_id: item.product_id,
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unit_price || item.cost || 0,
                    total: (item.quantity * (item.unit_price || item.cost || 0))
                }));

                await (supabase as any).from('document_items').insert(itemsPayload);
            }

            console.log('✅ تم إنشاء مشترى جديد:', data.id);
            return data;
        } catch (err) {
            console.error('❌ خطأ في إنشاء المشترى:', err);
            throw err;
        }
    },

    /**
     * تحديث مشترى
     */
    async update(id: string, updates: Partial<Purchase>): Promise<Purchase | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('documents')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            console.log('✅ تم تحديث المشترى:', id);
            return data;
        } catch (err) {
            console.error('❌ خطأ في تحديث المشترى:', err);
            return null;
        }
    },

    /**
     * حذف مشترى (soft delete / cancel)
     */
    async delete(id: string): Promise<boolean> {
        try {
            const { error } = await (supabase as any)
                .from('documents')
                .update({ status: 'cancelled' } as Update<'documents'>)
                .eq('id', id);

            if (error) throw error;
            console.log('✅ تم إلغاء المشترى:', id);
            return true;
        } catch (err) {
            console.error('❌ خطأ في حذف المشترى:', err);
            return false;
        }
    },

    /**
     * تسجيل دفعة
     */
    async recordPayment(id: string, amount: number): Promise<boolean> {
        try {
            const purchase = await this.getById(id);
            if (!purchase) return false;

            const newPaid = (purchase.paid_amount || 0) + amount;
            const total = purchase.total_amount || 0;
            const newStatus = newPaid >= total ? 'paid' : (newPaid > 0 ? 'pending' : purchase.status); // Adjusted logic
            const remaining = total - newPaid;

            const { error } = await (supabase as any)
                .from('documents')
                .update({
                    paid_amount: newPaid,
                    status: newStatus,
                    updated_at: new Date().toISOString()
                } as Update<'documents'>)
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
     * الحصول على إحصائيات المشتريات
     */
    async getStats(companyId: string): Promise<{
        totalPurchases: number;
        totalAmount: number;
        totalPaid: number;
        pending: number;
    }> {
        try {
            const { data, error } = await (supabase as any)
                .from('documents')
                .select('total_amount, paid_amount, status')
                .eq('company_id', companyId)
                .eq('type', 'bill');

            if (error) throw error;

            const stats = (data || []).reduce((acc: any, p: any) => ({
                totalPurchases: acc.totalPurchases + 1,
                totalAmount: acc.totalAmount + (p.total_amount || 0),
                totalPaid: acc.totalPaid + (p.paid_amount || 0),
                pending: acc.pending + (p.status === 'pending' || p.status === 'draft' ? 1 : 0)
            }), {
                totalPurchases: 0,
                totalAmount: 0,
                totalPaid: 0,
                pending: 0
            });

            return stats;
        } catch (err) {
            console.error('❌ خطأ في الإحصائيات:', err);
            return { totalPurchases: 0, totalAmount: 0, totalPaid: 0, pending: 0 };
        }
    }
};

export default purchasesService;

