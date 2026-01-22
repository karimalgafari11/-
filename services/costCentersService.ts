/**
 * Cost Centers Service - خدمة مراكز التكلفة
 * CRUD operations for cost_centers table
 */

import { supabase } from '../lib/supabaseClient';
import { companyService } from './companyService';
import type { CostCenter, Insert, Update } from '../types/supabase-helpers';

export const costCentersService = {
    /**
     * جلب جميع مراكز التكلفة
     */
    async getAll(): Promise<CostCenter[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) {
                console.warn('No company ID found');
                return [];
            }

            const { data, error } = await supabase
                .from('cost_centers')
                .select('*')
                .eq('company_id', companyId)
                .eq('is_active', true)
                .order('code');

            if (error) {
                console.error('Error fetching cost centers:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getAll cost centers:', error);
            return [];
        }
    },

    /**
     * جلب مركز تكلفة واحد
     */
    async getById(id: string): Promise<CostCenter | null> {
        try {
            const { data, error } = await supabase
                .from('cost_centers')
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
     * جلب مراكز التكلفة الرئيسية (بدون parent_id)
     */
    async getRootCenters(): Promise<CostCenter[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return [];

            const { data, error } = await supabase
                .from('cost_centers')
                .select('*')
                .eq('company_id', companyId)
                .eq('is_active', true)
                .is('parent_id', null)
                .order('code');

            if (error) return [];
            return data || [];
        } catch {
            return [];
        }
    },

    /**
     * جلب مراكز التكلفة الفرعية
     */
    async getChildren(parentId: string): Promise<CostCenter[]> {
        try {
            const { data, error } = await supabase
                .from('cost_centers')
                .select('*')
                .eq('parent_id', parentId)
                .eq('is_active', true)
                .order('code');

            if (error) return [];
            return data || [];
        } catch {
            return [];
        }
    },

    /**
     * جلب شجرة مراكز التكلفة بشكل هرمي
     */
    async getTree(): Promise<(CostCenter & { children?: CostCenter[] })[]> {
        try {
            const allCenters = await this.getAll();

            // Build tree structure
            const rootCenters = allCenters.filter(c => !c.parent_id);

            const buildTree = (parentId: string | null): (CostCenter & { children?: CostCenter[] })[] => {
                return allCenters
                    .filter(c => c.parent_id === parentId)
                    .map(center => ({
                        ...center,
                        children: buildTree(center.id)
                    }));
            };

            return rootCenters.map(center => ({
                ...center,
                children: buildTree(center.id)
            }));
        } catch {
            return [];
        }
    },

    /**
     * إنشاء مركز تكلفة جديد
     */
    async create(costCenter: Omit<Insert<'cost_centers'>, 'company_id'>): Promise<CostCenter | null> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) {
                console.error('No company ID found');
                return null;
            }

            const { data, error } = await supabase
                .from('cost_centers')
                .insert({
                    ...costCenter,
                    company_id: companyId
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating cost center:', error);
                return null;
            }

            console.log('✅ Cost center created:', data.id);
            return data;
        } catch (error) {
            console.error('Error in create cost center:', error);
            return null;
        }
    },

    /**
     * تحديث مركز تكلفة
     */
    async update(id: string, updates: Update<'cost_centers'>): Promise<CostCenter | null> {
        try {
            const { data, error } = await supabase
                .from('cost_centers')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating cost center:', error);
                return null;
            }

            return data;
        } catch {
            return null;
        }
    },

    /**
     * حذف مركز تكلفة (soft delete)
     */
    async delete(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('cost_centers')
                .update({ is_active: false })
                .eq('id', id);

            if (error) {
                console.error('Error deleting cost center:', error);
                return false;
            }

            return true;
        } catch {
            return false;
        }
    }
};

export default costCentersService;
