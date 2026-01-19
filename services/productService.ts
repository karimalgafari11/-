/**
 * Product Service - خدمة المنتجات
 * التعامل مع جدول products في Supabase مباشرة
 * متوافق مع Supabase Schema
 */

import { supabase } from '../lib/supabaseClient';
import type { Product, InsertType } from '../types/supabase-types';

export const ProductService = {
    // ========================================
    // PRODUCTS
    // ========================================

    /**
     * جلب جميع المنتجات
     */
    async getProducts(companyId: string): Promise<Product[]> {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('company_id', companyId)
                .order('name');

            if (error) {
                console.error('❌ خطأ في جلب المنتجات:', error);
                return [];
            }

            return data || [];
        } catch (err) {
            console.error('❌ استثناء في جلب المنتجات:', err);
            return [];
        }
    },

    /**
     * جلب منتج واحد
     */
    async getProduct(id: string): Promise<Product | null> {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('❌ خطأ في جلب المنتج:', error);
                return null;
            }

            return data;
        } catch (err) {
            console.error('❌ استثناء في جلب المنتج:', err);
            return null;
        }
    },

    /**
     * إنشاء منتج جديد
     */
    async createProduct(
        companyId: string,
        product: Omit<InsertType<Product>, 'company_id'>
    ): Promise<Product | null> {
        console.log('🚀 ProductService.createProduct called', { companyId, product });
        try {
            const payload = {
                ...product,
                company_id: companyId,
                is_active: true
            };
            console.log('📦 Payload sending to Supabase:', payload);

            const { data, error } = await supabase
                .from('products')
                .insert(payload)
                .select()
                .single();

            if (error) {
                console.error('❌ Supabase Error in createProduct:', error);
                console.error('Error details:', JSON.stringify(error, null, 2));
                return null;
            }

            console.log('✅ Product created successfully:', data);
            return data;
        } catch (err) {
            console.error('❌ Exception in createProduct:', err);
            return null;
        }
    },

    /**
     * تحديث منتج
     */
    async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
        try {
            const { data, error } = await supabase
                .from('products')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('❌ خطأ في تحديث المنتج:', error);
                return null;
            }

            console.log('✅ تم تحديث المنتج:', id);
            return data;
        } catch (err) {
            console.error('❌ استثناء في تحديث المنتج:', err);
            return null;
        }
    },

    /**
     * حذف منتج (soft delete)
     */
    async deleteProduct(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('products')
                .update({ is_active: false })
                .eq('id', id);

            if (error) {
                console.error('❌ خطأ في حذف المنتج:', error);
                return false;
            }

            console.log('✅ تم تعطيل المنتج:', id);
            return true;
        } catch (err) {
            console.error('❌ استثناء في حذف المنتج:', err);
            return false;
        }
    },

    /**
     * البحث عن المنتجات
     */
    async searchProducts(companyId: string, query: string): Promise<Product[]> {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('company_id', companyId)
                .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
                .limit(20);

            if (error) {
                console.error('❌ خطأ في البحث عن المنتجات:', error);
                return [];
            }

            return data || [];
        } catch (err) {
            console.error('❌ استثناء في البحث عن المنتجات:', err);
            return [];
        }
    }
};

export default ProductService;
