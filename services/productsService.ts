/**
 * Products Service - خدمة المنتجات
 * CRUD operations للمنتجات مع Supabase
 */

import { supabase } from '../lib/supabaseClient';
import { companyService } from './companyService';

// نوع محلي للواجهة
export interface LocalProduct {
    id: string;
    name: string;
    nameEn?: string;
    sku: string;
    barcode?: string;
    category: string;
    unit: string;
    salePrice: number;
    costPrice: number;
    quantity: number;
    minQuantity: number;
    description?: string;
    image?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// تحويل بيانات Supabase لنوع LocalProduct
const mapToLocalProduct = (data: any): LocalProduct => ({
    id: data.id,
    name: data.name,
    nameEn: data.name_en,
    sku: data.sku || '',
    barcode: data.barcode,
    category: data.category || '',
    unit: data.unit || 'قطعة',
    salePrice: parseFloat(data.price) || 0,
    costPrice: parseFloat(data.cost) || 0,
    quantity: data.quantity || 0,
    minQuantity: data.min_quantity || 0,
    description: data.description,
    image: data.image_url,
    isActive: data.is_active !== false,
    createdAt: data.created_at,
    updatedAt: data.updated_at
});

export const productsService = {
    /**
     * جلب جميع المنتجات
     */
    async getAll(): Promise<LocalProduct[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) {
                console.warn('No company ID found');
                return [];
            }

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('company_id', companyId)
                .eq('is_active', true)
                .order('name');

            if (error) {
                console.error('Error fetching products:', error);
                return [];
            }

            return (data || []).map(mapToLocalProduct);
        } catch (error) {
            console.error('Error in getAll products:', error);
            return [];
        }
    },

    /**
     * جلب منتج واحد
     */
    async getById(id: string): Promise<LocalProduct | null> {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) {
                console.error('Error fetching product:', error);
                return null;
            }

            return mapToLocalProduct(data);
        } catch (error) {
            console.error('Error in getById product:', error);
            return null;
        }
    },

    /**
     * إنشاء منتج جديد
     */
    async create(product: Omit<LocalProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<LocalProduct | null> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) {
                console.error('No company ID found');
                return null;
            }

            const { data, error } = await supabase
                .from('products')
                .insert({
                    company_id: companyId,
                    name: product.name,
                    name_en: product.nameEn,
                    sku: product.sku || `SKU-${Date.now()}`,
                    barcode: product.barcode,
                    category: product.category,
                    unit: product.unit || 'قطعة',
                    price: product.salePrice,
                    cost: product.costPrice,
                    quantity: product.quantity,
                    min_quantity: product.minQuantity,
                    description: product.description,
                    image_url: product.image,
                    is_active: product.isActive !== false
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating product:', error);
                return null;
            }

            return mapToLocalProduct(data);
        } catch (error) {
            console.error('Error in create product:', error);
            return null;
        }
    },

    /**
     * تحديث منتج
     */
    async update(id: string, updates: Partial<LocalProduct>): Promise<LocalProduct | null> {
        try {
            const updateData: any = { updated_at: new Date().toISOString() };

            if (updates.name !== undefined) updateData.name = updates.name;
            if (updates.nameEn !== undefined) updateData.name_en = updates.nameEn;
            if (updates.sku !== undefined) updateData.sku = updates.sku;
            if (updates.barcode !== undefined) updateData.barcode = updates.barcode;
            if (updates.category !== undefined) updateData.category = updates.category;
            if (updates.unit !== undefined) updateData.unit = updates.unit;
            if (updates.salePrice !== undefined) updateData.price = updates.salePrice;
            if (updates.costPrice !== undefined) updateData.cost = updates.costPrice;
            if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
            if (updates.minQuantity !== undefined) updateData.min_quantity = updates.minQuantity;
            if (updates.description !== undefined) updateData.description = updates.description;
            if (updates.image !== undefined) updateData.image_url = updates.image;
            if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

            const { data, error } = await supabase
                .from('products')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating product:', error);
                return null;
            }

            return mapToLocalProduct(data);
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
            const { error } = await supabase
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

            const newQuantity = Math.max(0, product.quantity + quantityChange);

            const { error } = await supabase
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
    async findByBarcode(barcode: string): Promise<LocalProduct | null> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return null;

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('company_id', companyId)
                .eq('barcode', barcode)
                .eq('is_active', true)
                .single();

            if (error || !data) return null;

            return mapToLocalProduct(data);
        } catch (error) {
            console.error('Error in findByBarcode:', error);
            return null;
        }
    }
};

export default productsService;
