/**
 * Storage Locations Service - خدمة مواقع التخزين
 * CRUD operations for storage_locations table
 */

import { supabase } from '../lib/supabaseClient';
import type { StorageLocation, Insert, Update } from '../types/supabase-helpers';

export const storageLocationsService = {
    /**
     * جلب جميع مواقع التخزين لمستودع
     */
    async getByWarehouse(warehouseId: string): Promise<StorageLocation[]> {
        try {
            const { data, error } = await supabase
                .from('storage_locations')
                .select('*')
                .eq('warehouse_id', warehouseId)
                .order('code');

            if (error) {
                console.error('Error fetching storage locations:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getByWarehouse storage locations:', error);
            return [];
        }
    },

    /**
     * جلب موقع تخزين واحد
     */
    async getById(id: string): Promise<StorageLocation | null> {
        try {
            const { data, error } = await supabase
                .from('storage_locations')
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
     * جلب موقع تخزين بالكود
     */
    async getByCode(warehouseId: string, code: string): Promise<StorageLocation | null> {
        try {
            const { data, error } = await supabase
                .from('storage_locations')
                .select('*')
                .eq('warehouse_id', warehouseId)
                .eq('code', code)
                .single();

            if (error) return null;
            return data;
        } catch {
            return null;
        }
    },

    /**
     * إنشاء موقع تخزين جديد
     */
    async create(location: Insert<'storage_locations'>): Promise<StorageLocation | null> {
        try {
            const { data, error } = await supabase
                .from('storage_locations')
                .insert(location)
                .select()
                .single();

            if (error) {
                console.error('Error creating storage location:', error);
                return null;
            }

            console.log('✅ Storage location created:', data.id);
            return data;
        } catch (error) {
            console.error('Error in create storage location:', error);
            return null;
        }
    },

    /**
     * تحديث موقع تخزين
     */
    async update(id: string, updates: Update<'storage_locations'>): Promise<StorageLocation | null> {
        try {
            const { data, error } = await supabase
                .from('storage_locations')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating storage location:', error);
                return null;
            }

            return data;
        } catch {
            return null;
        }
    },

    /**
     * حذف موقع تخزين
     */
    async delete(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('storage_locations')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting storage location:', error);
                return false;
            }

            return true;
        } catch {
            return false;
        }
    }
};

export default storageLocationsService;
