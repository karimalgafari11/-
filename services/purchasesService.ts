/**
 * Purchases Service - خدمة المشتريات
 * CRUD للمشتريات مع Supabase
 */

import { supabase } from '../lib/supabaseClient';
import type { Purchase, PurchaseItem, InsertType } from '../types/supabase-types';

export const purchasesService = {
    /**
     * جلب جميع المشتريات
     */
    async getAll(companyId: string): Promise<Purchase[]> {
        try {
            const { data, error } = await supabase
                .from('purchases')
                .select('*')
                .eq('company_id', companyId)
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
            const { data, error } = await supabase
                .from('purchases')
                .select('*')
                .eq('company_id', companyId)
                .eq('supplier_id', supplierId)
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
            const { data, error } = await supabase
                .from('purchases')
                .select('*')
                .eq('id', id)
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
        purchase: Omit<InsertType<Purchase>, 'company_id'>
    ): Promise<Purchase | null> {
        try {
            const { data, error } = await supabase
                .from('purchases')
                .insert({
                    ...purchase,
                    company_id: companyId
                })
                .select()
                .single();

            if (error) throw error;
            console.log('✅ تم إنشاء مشترى جديد:', data.id);
            return data;
        } catch (err) {
            console.error('❌ خطأ في إنشاء المشترى:', err);
            return null;
        }
    },

    /**
     * تحديث مشترى
     */
    async update(id: string, updates: Partial<Purchase>): Promise<Purchase | null> {
        try {
            const { data, error } = await supabase
                .from('purchases')
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
     * حذف مشترى (soft delete)
     */
    async delete(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('purchases')
                .update({ status: 'cancelled' })
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

            const newPaid = (purchase.paid || 0) + amount;
            const newStatus = newPaid >= purchase.net_total ? 'completed' : 'partial';

            const { error } = await supabase
                .from('purchases')
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
     * الحصول على إحصائيات المشتريات
     */
    async getStats(companyId: string): Promise<{
        totalPurchases: number;
        totalAmount: number;
        totalPaid: number;
        pending: number;
    }> {
        try {
            const { data, error } = await supabase
                .from('purchases')
                .select('net_total, paid, status')
                .eq('company_id', companyId);

            if (error) throw error;

            const stats = (data || []).reduce((acc, p) => ({
                totalPurchases: acc.totalPurchases + 1,
                totalAmount: acc.totalAmount + (p.net_total || 0),
                totalPaid: acc.totalPaid + (p.paid || 0),
                pending: acc.pending + (p.status === 'pending' ? 1 : 0)
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
