/**
 * Units Service - خدمة وحدات القياس
 * CRUD operations for units table
 */

import { supabase } from '../lib/supabaseClient';
import { companyService } from './companyService';
import type { Unit, Insert, Update } from '../types/supabase-helpers';

export const unitsService = {
    /**
     * جلب جميع الوحدات
     */
    async getAll(): Promise<Unit[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) {
                console.warn('No company ID found');
                return [];
            }

            const { data, error } = await supabase
                .from('units')
                .select('*')
                .eq('company_id', companyId)
                .order('name');

            if (error) {
                console.error('Error fetching units:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getAll units:', error);
            return [];
        }
    },

    /**
     * جلب وحدة واحدة
     */
    async getById(id: string): Promise<Unit | null> {
        try {
            const { data, error } = await supabase
                .from('units')
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
     * جلب الوحدات الأساسية (بدون base_unit_id)
     */
    async getBaseUnits(): Promise<Unit[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return [];

            const { data, error } = await supabase
                .from('units')
                .select('*')
                .eq('company_id', companyId)
                .is('base_unit_id', null)
                .order('name');

            if (error) return [];
            return data || [];
        } catch {
            return [];
        }
    },

    /**
     * جلب الوحدات الفرعية لوحدة أساسية
     */
    async getSubUnits(baseUnitId: string): Promise<Unit[]> {
        try {
            const { data, error } = await supabase
                .from('units')
                .select('*')
                .eq('base_unit_id', baseUnitId)
                .order('conversion_factor');

            if (error) return [];
            return data || [];
        } catch {
            return [];
        }
    },

    /**
     * إنشاء وحدة جديدة
     */
    async create(unit: Omit<Insert<'units'>, 'company_id'>): Promise<Unit | null> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) {
                console.error('No company ID found');
                return null;
            }

            const { data, error } = await supabase
                .from('units')
                .insert({
                    ...unit,
                    company_id: companyId
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating unit:', error);
                return null;
            }

            console.log('✅ Unit created:', data.id);
            return data;
        } catch (error) {
            console.error('Error in create unit:', error);
            return null;
        }
    },

    /**
     * تحديث وحدة
     */
    async update(id: string, updates: Update<'units'>): Promise<Unit | null> {
        try {
            const { data, error } = await supabase
                .from('units')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating unit:', error);
                return null;
            }

            return data;
        } catch {
            return null;
        }
    },

    /**
     * حذف وحدة
     */
    async delete(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('units')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting unit:', error);
                return false;
            }

            return true;
        } catch {
            return false;
        }
    },

    /**
     * تحويل الكمية بين وحدتين
     */
    async convertQuantity(
        quantity: number,
        fromUnitId: string,
        toUnitId: string
    ): Promise<number | null> {
        try {
            const fromUnit = await this.getById(fromUnitId);
            const toUnit = await this.getById(toUnitId);

            if (!fromUnit || !toUnit) return null;

            // Get base unit for both
            const fromBaseFactor = fromUnit.conversion_factor || 1;
            const toBaseFactor = toUnit.conversion_factor || 1;

            // Convert: quantity * fromFactor / toFactor
            return (quantity * fromBaseFactor) / toBaseFactor;
        } catch {
            return null;
        }
    }
};

export default unitsService;
