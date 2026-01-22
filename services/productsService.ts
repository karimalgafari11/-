/**
 * Products Service - خدمة المنتجات
 * CRUD operations للمنتجات مع Supabase
 */

import { supabase } from '../lib/supabaseClient';
import { companyService } from './companyService';
import type { Product, Insert, Update } from '../types/supabase-helpers';

export const productsService = {
    /**
     * جلب جميع المنتجات
     */
    async getAll(): Promise<Product[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) {
                console.warn('No company ID found');
                return [];
            }

            const { data, error } = await (supabase as any)
                .from('products')
                .select('*')
                .eq('company_id', companyId)
                .eq('is_active', true)
                .order('name');

            if (error) {
                console.error('Error fetching products:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getAll products:', error);
            return [];
        }
    },

    /**
     * جلب منتج واحد
     */
    async getById(id: string): Promise<Product | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) {
                console.error('Error fetching product:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in getById product:', error);
            return null;
        }
    },

    /**
     * إنشاء منتج جديد
     */
    async create(product: Insert<'products'>): Promise<Product | null> {
        try {
            console.log('🚀 productsService.create() called with:', product.name);

            const companyId = await companyService.getCompanyId();
            if (!companyId) {
                console.error('❌ productsService.create: No company ID found!');
                return null;
            }

            const payload: Insert<'products'> = {
                ...product,
                company_id: companyId
            };

            console.log('📦 Sending to Supabase:', payload);

            const { data, error } = await (supabase as any)
                .from('products')
                .insert(payload)
                .select()
                .single();

            if (error) {
                console.error('❌ Supabase error creating product:', error);
                return null;
            }

            console.log('✅ Product created successfully:', data.id);
            return data;
        } catch (error) {
            console.error('❌ Exception in create product:', error);
            return null;
        }
    },

    /**
     * تحديث منتج
     */
    async update(id: string, updates: Update<'products'>): Promise<Product | null> {
        try {
            const updateData = { ...updates, updated_at: new Date().toISOString() };

            const { data, error } = await (supabase as any)
                .from('products')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating product:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in update product:', error);
            return null;
        }
    },

    /**
     * حذف منتج (soft delete)
     */
    async delete(id: string): Promise<boolean> {
        try {
            const { error } = await (supabase as any)
                .from('products')
                .update({ is_active: false, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) {
                console.error('Error deleting product:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in delete product:', error);
            return false;
        }
    },

    /**
     * تحديث الكمية
     */
    async updateQuantity(id: string, quantityChange: number): Promise<boolean> {
        try {
            const product = await this.getById(id);
            if (!product) return false;

            const newQuantity = Math.max(0, (product.quantity || 0) + quantityChange);

            const { error } = await (supabase as any)
                .from('products')
                .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) {
                console.error('Error updating quantity:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in updateQuantity:', error);
            return false;
        }
    },

    /**
     * البحث عن منتج بالباركود
     */
    async findByBarcode(barcode: string): Promise<Product | null> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return null;

            const { data, error } = await (supabase as any)
                .from('products')
                .select('*')
                .eq('company_id', companyId)
                .eq('barcode', barcode)
                .eq('is_active', true)
                .single();

            if (error || !data) return null;

            return data;
        } catch (error) {
            console.error('Error in findByBarcode:', error);
            return null;
        }
    }
};

export default productsService;
