/**
 * Product Variants Service - خدمة متغيرات المنتجات
 * CRUD operations for product_variants table
 */

import { supabase } from '../lib/supabaseClient';
import type { ProductVariant, Insert, Update } from '../types/supabase-helpers';

export interface VariantAttributes {
    color?: string;
    size?: string;
    weight?: string;
    material?: string;
    [key: string]: string | number | boolean | undefined;
}

export const productVariantsService = {
    /**
     * جلب متغيرات منتج
     */
    async getByProduct(productId: string): Promise<ProductVariant[]> {
        try {
            const { data, error } = await (supabase as any)
                .from('product_variants')
                .select('*')
                .eq('product_id', productId)
                .eq('is_active', true)
                .order('name');

            if (error) {
                console.error('Error fetching product variants:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getByProduct variants:', error);
            return [];
        }
    },

    /**
     * جلب متغير واحد
     */
    async getById(id: string): Promise<ProductVariant | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('product_variants')
                .select('*')
                .eq('id', id)
                .single();

            if (error) return null;
            return data;
        } catch {
            return null;
        }
    },

    /**
     * جلب متغير بالـ SKU
     */
    async getBySku(sku: string): Promise<ProductVariant | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('product_variants')
                .select('*')
                .eq('sku', sku)
                .single();

            if (error) return null;
            return data;
        } catch {
            return null;
        }
    },

    /**
     * إنشاء متغير جديد
     */
    async create(variant: Insert<'product_variants'>): Promise<ProductVariant | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('product_variants')
                .insert(variant)
                .select()
                .single();

            if (error) {
                console.error('Error creating product variant:', error);
                return null;
            }

            console.log('✅ Product variant created:', data.id);
            return data;
        } catch (error) {
            console.error('Error in create product variant:', error);
            return null;
        }
    },

    /**
     * إنشاء متغيرات متعددة
     */
    async createMany(productId: string, variants: Omit<Insert<'product_variants'>, 'product_id'>[]): Promise<ProductVariant[]> {
        try {
            const variantsWithProductId = variants.map(v => ({
                ...v,
                product_id: productId
            }));

            const { data, error } = await (supabase as any)
                .from('product_variants')
                .insert(variantsWithProductId)
                .select();

            if (error) {
                console.error('Error creating product variants:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in createMany product variants:', error);
            return [];
        }
    },

    /**
     * تحديث متغير
     */
    async update(id: string, updates: Update<'product_variants'>): Promise<ProductVariant | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('product_variants')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating product variant:', error);
                return null;
            }

            return data;
        } catch {
            return null;
        }
    },

    /**
     * حذف متغير (soft delete)
     */
    async delete(id: string): Promise<boolean> {
        try {
            const { error } = await (supabase as any)
                .from('product_variants')
                .update({ is_active: false })
                .eq('id', id);

            if (error) {
                console.error('Error deleting product variant:', error);
                return false;
            }

            return true;
        } catch {
            return false;
        }
    },

    /**
     * حذف جميع متغيرات منتج
     */
    async deleteByProduct(productId: string): Promise<boolean> {
        try {
            const { error } = await (supabase as any)
                .from('product_variants')
                .update({ is_active: false })
                .eq('product_id', productId);

            if (error) {
                console.error('Error deleting product variants:', error);
                return false;
            }

            return true;
        } catch {
            return false;
        }
    },

    /**
     * حساب السعر النهائي للمتغير
     */
    calculatePrice(basePrice: number, variant: ProductVariant): number {
        const adjustment = variant.price_adjustment || 0;
        return basePrice + adjustment;
    }
};

export default productVariantsService;
