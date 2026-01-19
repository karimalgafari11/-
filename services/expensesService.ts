/**
 * Expenses Service - خدمة المصروفات
 * CRUD للمصروفات مع Supabase
 */

import { supabase } from '../lib/supabaseClient';
import type { Expense, InsertType } from '../types/supabase-types';

export const expensesService = {
    /**
     * جلب جميع المصروفات
     */
    async getAll(companyId: string): Promise<Expense[]> {
        try {
            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .eq('company_id', companyId)
                .order('expense_date', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('❌ خطأ في جلب المصروفات:', err);
            return [];
        }
    },

    /**
     * جلب مصروفات حسب التصنيف
     */
    async getByCategory(companyId: string, category: string): Promise<Expense[]> {
        try {
            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .eq('company_id', companyId)
                .eq('category', category)
                .order('expense_date', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('❌ خطأ في جلب المصروفات:', err);
            return [];
        }
    },

    /**
     * جلب مصروفات بفترة زمنية
     */
    async getByDateRange(
        companyId: string,
        startDate: string,
        endDate: string
    ): Promise<Expense[]> {
        try {
            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .eq('company_id', companyId)
                .gte('expense_date', startDate)
                .lte('expense_date', endDate)
                .order('expense_date', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('❌ خطأ في جلب المصروفات:', err);
            return [];
        }
    },

    /**
     * إنشاء مصروف جديد
     */
    async create(
        companyId: string,
        expense: Omit<InsertType<Expense>, 'company_id'>
    ): Promise<Expense | null> {
        try {
            const { data, error } = await supabase
                .from('expenses')
                .insert({
                    ...expense,
                    company_id: companyId
                })
                .select()
                .single();

            if (error) throw error;
            console.log('✅ تم إنشاء مصروف جديد:', data.id);
            return data;
        } catch (err) {
            console.error('❌ خطأ في إنشاء المصروف:', err);
            return null;
        }
    },

    /**
     * تحديث مصروف
     */
    async update(id: string, updates: Partial<Expense>): Promise<Expense | null> {
        try {
            const { data, error } = await supabase
                .from('expenses')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            console.log('✅ تم تحديث المصروف:', id);
            return data;
        } catch (err) {
            console.error('❌ خطأ في تحديث المصروف:', err);
            return null;
        }
    },

    /**
     * حذف مصروف
     */
    async delete(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', id);

            if (error) throw error;
            console.log('✅ تم حذف المصروف:', id);
            return true;
        } catch (err) {
            console.error('❌ خطأ في حذف المصروف:', err);
            return false;
        }
    },

    /**
     * إحصائيات المصروفات
     */
    async getStats(companyId: string): Promise<{
        total: number;
        byCategory: Record<string, number>;
        thisMonth: number;
    }> {
        try {
            const { data, error } = await supabase
                .from('expenses')
                .select('amount, category, expense_date')
                .eq('company_id', companyId);

            if (error) throw error;

            const now = new Date();
            const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
                .toISOString().split('T')[0];

            const stats = (data || []).reduce((acc, e) => {
                acc.total += e.amount || 0;
                acc.byCategory[e.category || 'أخرى'] =
                    (acc.byCategory[e.category || 'أخرى'] || 0) + (e.amount || 0);
                if (e.expense_date >= thisMonthStart) {
                    acc.thisMonth += e.amount || 0;
                }
                return acc;
            }, {
                total: 0,
                byCategory: {} as Record<string, number>,
                thisMonth: 0
            });

            return stats;
        } catch (err) {
            console.error('❌ خطأ في الإحصائيات:', err);
            return { total: 0, byCategory: {}, thisMonth: 0 };
        }
    }
};

export default expensesService;
