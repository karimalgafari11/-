/**
 * Categories Service - خدمة الفئات
 * CRUD للفئات مع Supabase
 */

import { supabase } from '../lib/supabaseClient';

export interface ProductCategory {
    id: string;
    company_id: string;
    parent_id?: string;
    name: string;
    name_en?: string;
    code?: string;
    description?: string;
    level: number;
    is_active: boolean;
    created_at: string;
}

export const categoriesService = {
    /**
     * جلب جميع الفئات
     */
    async getAll(companyId: string): Promise<ProductCategory[]> {
        try {
            const { data, error } = await (supabase as any)
                .from('product_categories')
                .select('*')
                .eq('company_id', companyId)
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('❌ خطأ في جلب الفئات:', err);
            return [];
        }
    },

    /**
     * جلب الفئات الرئيسية فقط (بدون parent)
     */
    async getRootCategories(companyId: string): Promise<ProductCategory[]> {
        try {
            const { data, error } = await (supabase as any)
                .from('product_categories')
                .select('*')
                .eq('company_id', companyId)
                .is('parent_id', null)
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('❌ خطأ في جلب الفئات الرئيسية:', err);
            return [];
        }
    },

    /**
     * جلب الفئات الفرعية
     */
    async getSubCategories(companyId: string, parentId: string): Promise<ProductCategory[]> {
        try {
            const { data, error } = await (supabase as any)
                .from('product_categories')
                .select('*')
                .eq('company_id', companyId)
                .eq('parent_id', parentId)
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('❌ خطأ في جلب الفئات الفرعية:', err);
            return [];
        }
    },

    /**
     * إنشاء فئة جديدة
     */
    async create(
        companyId: string,
        category: Omit<ProductCategory, 'id' | 'company_id' | 'created_at'>
    ): Promise<ProductCategory | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('product_categories')
                .insert({
                    ...category,
                    company_id: companyId,
                    level: category.parent_id ? 2 : 1,
                    is_active: true
                })
                .select()
                .single();

            if (error) throw error;
            console.log('✅ تم إنشاء فئة جديدة:', data.id);
            return data;
        } catch (err) {
            console.error('❌ خطأ في إنشاء الفئة:', err);
            return null;
        }
    },

    /**
     * تحديث فئة
     */
    async update(id: string, updates: Partial<ProductCategory>): Promise<ProductCategory | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('product_categories')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            console.log('✅ تم تحديث الفئة:', id);
            return data;
        } catch (err) {
            console.error('❌ خطأ في تحديث الفئة:', err);
            return null;
        }
    },

    /**
     * حذف فئة (soft delete)
     */
    async delete(id: string): Promise<boolean> {
        try {
            const { error } = await (supabase as any)
                .from('product_categories')
                .update({ is_active: false })
                .eq('id', id);

            if (error) throw error;
            console.log('✅ تم حذف الفئة:', id);
            return true;
        } catch (err) {
            console.error('❌ خطأ في حذف الفئة:', err);
            return false;
        }
    },

    /**
     * جلب أسماء الفئات فقط (للـ dropdown)
     */
    async getCategoryNames(companyId: string): Promise<string[]> {
        try {
            const { data, error } = await (supabase as any)
                .from('product_categories')
                .select('name')
                .eq('company_id', companyId)
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            return (data || []).map((c: any) => c.name);
        } catch (err) {
            console.error('❌ خطأ في جلب أسماء الفئات:', err);
            return [];
        }
    }
};

export default categoriesService;
