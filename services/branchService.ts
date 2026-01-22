/**
 * Branch Service - خدمة الفروع
 * إدارة فروع الشركة
 */

import { supabase } from '../lib/supabaseClient';
import type { Branch, InsertType, UpdateType } from '../types/supabase-types';

export const BranchService = {
    /**
     * جلب كافة فروع الشركة
     */
    async getBranches(companyId: string): Promise<Branch[]> {
        const { data, error } = await (supabase as any)
            .from('branches')
            .select('*')
            .eq('company_id', companyId)
            // .eq('is_active', true) // يمكننا جلب الكل والفلترة في الواجهة إذا أردنا عرض الفروع المؤرشفة
            .order('created_at');

        if (error) throw error;
        return data || [];
    },

    /**
     * جلب فرع محدد بواسطة المعرف
     */
    async getBranch(id: string): Promise<Branch | null> {
        const { data, error } = await (supabase as any)
            .from('branches')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * إضافة فرع جديد
     */
    async addBranch(branch: InsertType<Branch>): Promise<Branch> {
        const { data, error } = await (supabase as any)
            .from('branches')
            .insert(branch)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * تحديث بيانات فرع
     */
    async updateBranch(id: string, updates: UpdateType<Branch>): Promise<Branch> {
        const { data, error } = await (supabase as any)
            .from('branches')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * حذف أو تعطيل فرع
     */
    async deleteBranch(id: string): Promise<void> {
        // نفضل التعطيل soft delete بدلاً من الحذف النهائي للحفاظ على ترابط البيانات التاريخية
        const { error } = await (supabase as any)
            .from('branches')
            .update({ is_active: false })
            .eq('id', id);

        if (error) throw error;
    }
};
