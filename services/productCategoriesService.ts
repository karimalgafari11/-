/**
 * Product Categories Service - خدمة تصنيفات المنتجات
 * CRUD operations for product_categories table
 */

import { supabase } from '../lib/supabaseClient';
import { companyService } from './companyService';
import type { ProductCategory, Insert, Update } from '../types/supabase-helpers';

export const productCategoriesService = {
    /**
     * جلب جميع التصنيفات
     */
    async getAll(): Promise<ProductCategory[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) {
                console.warn('No company ID found');
                return [];
            }

            const { data, error } = await supabase
                .from('product_categories')
                .select('*')
                .eq('company_id', companyId)
                .order('name');

            if (error) {
                console.error('Error fetching product categories:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getAll product categories:', error);
            return [];
        }
    },

    /**
     * جلب تصنيف واحد
     */
    async getById(id: string): Promise<ProductCategory | null> {
        try {
            const { data, error } = await supabase
                .from('product_categories')
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
     * جلب التصنيفات الرئيسية (بدون parent_id)
     */
    async getRootCategories(): Promise<ProductCategory[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return [];

            const { data, error } = await supabase
                .from('product_categories')
                .select('*')
                .eq('company_id', companyId)
                .is('parent_id', null)
                .order('name');

            if (error) return [];
            return data || [];
        } catch {
            return [];
        }
    },

    /**
     * جلب التصنيفات الفرعية
     */
    async getChildren(parentId: string): Promise<ProductCategory[]> {
        try {
            const { data, error } = await supabase
                .from('product_categories')
                .select('*')
                .eq('parent_id', parentId)
                .order('name');

            if (error) return [];
            return data || [];
        } catch {
            return [];
        }
    },

    /**
     * جلب شجرة التصنيفات بشكل هرمي
     */
    async getTree(): Promise<(ProductCategory & { children?: ProductCategory[] })[]> {
        try {
            const allCategories = await this.getAll();

            const buildTree = (parentId: string | null): (ProductCategory & { children?: ProductCategory[] })[] => {
                return allCategories
                    .filter(c => c.parent_id === parentId)
                    .map(category => ({
                        ...category,
                        children: buildTree(category.id)
                    }));
            };

            return buildTree(null);
        } catch {
            return [];
        }
    },

    /**
     * إنشاء تصنيف جديد
     */
    async create(category: Omit<Insert<'product_categories'>, 'company_id'>): Promise<ProductCategory | null> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) {
                console.error('No company ID found');
                return null;
            }

            const { data, error } = await supabase
                .from('product_categories')
                .insert({
                    ...category,
                    company_id: companyId
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating product category:', error);
                return null;
            }

            console.log('✅ Product category created:', data.id);
            return data;
        } catch (error) {
            console.error('Error in create product category:', error);
            return null;
        }
    },

    /**
     * تحديث تصنيف
     */
    async update(id: string, updates: Update<'product_categories'>): Promise<ProductCategory | null> {
        try {
            const { data, error } = await supabase
                .from('product_categories')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating product category:', error);
                return null;
            }

            return data;
        } catch {
            return null;
        }
    },

    /**
     * حذف تصنيف
     */
    async delete(id: string): Promise<boolean> {
        try {
            // Check if category has children
            const children = await this.getChildren(id);
            if (children.length > 0) {
                console.error('Cannot delete category with children');
                return false;
            }

            const { error } = await supabase
                .from('product_categories')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting product category:', error);
                return false;
            }

            return true;
        } catch {
            return false;
        }
    }
};

export default productCategoriesService;
