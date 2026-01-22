/**
 * Suppliers Service - خدمة الموردين
 * Refactored for Schema V6 (partners table with is_supplier=true)
 */

import { supabase } from '../lib/supabaseClient';
import { Supplier } from '../types';
import type { Partner, Insert, Update } from '../types/supabase-helpers';

// Helper to map Partner to Supplier
const mapToSupplier = (data: Partner): Supplier => ({
    id: data.id,
    name: data.name,
    companyName: data.name,
    contactName: data.name,
    phone: data.phone || '',
    email: data.email || '',
    address: data.address || '',
    category: 'عام', // Partner doesn't have category yet in V6 schema?
    balance: data.current_balance || 0,
    // notes: data.notes,
    isActive: data.is_active !== false,
    status: data.is_active ? 'active' : 'inactive',
    taxNumber: data.tax_number || '',
    createdAt: data.created_at,
    updatedAt: data.updated_at
});

export const suppliersService = {
    /**
     * جلب جميع الموردين
     */
    async getAll(companyId: string): Promise<Supplier[]> {
        try {
            const { data, error } = await supabase
                .from('partners')
                .select('*')
                .eq('company_id', companyId)
                .eq('type', 'supplier')
                .eq('is_active', true)
                .order('name');

            if (error) {
                console.error('Error fetching suppliers:', error);
                return [];
            }

            return (data || []).map(mapToSupplier);
        } catch (error) {
            console.error('Error in getAll suppliers:', error);
            return [];
        }
    },

    /**
     * جلب مورد واحد
     */
    async getById(id: string): Promise<Supplier | null> {
        try {
            const { data, error } = await supabase
                .from('partners')
                .select('*')
                .eq('id', id)
                .eq('type', 'supplier')
                .single();

            if (error || !data) return null;

            return mapToSupplier(data);
        } catch (error) {
            console.error('Error in getById supplier:', error);
            return null;
        }
    },

    /**
     * إنشاء مورد جديد
     */
    async createSupplier(companyId: string, supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier | null> {
        try {
            const payload: Insert<'partners'> = {
                company_id: companyId,
                name: supplier.companyName || supplier.contactName || 'New Supplier',
                phone: supplier.phone,
                email: supplier.email,
                address: supplier.address,
                type: 'supplier',
                current_balance: supplier.balance || 0,
                // notes: supplier.notes, // Removed as not in schema
                tax_number: supplier.taxNumber,
                is_active: supplier.isActive !== false
            };

            const { data, error } = await (supabase as any)
                .from('partners')
                .insert(payload)
                .select()
                .single();

            if (error) {
                console.error('❌ Supabase Error in createSupplier:', error);
                return null;
            }

            return mapToSupplier(data);
        } catch (error) {
            console.error('❌ Exception in createSupplier:', error);
            return null;
        }
    },

    /**
     * تحديث مورد
     */
    async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier | null> {
        try {
            const updateData: Update<'partners'> = { updated_at: new Date().toISOString() };

            if (updates.companyName !== undefined) updateData.name = updates.companyName;
            if (updates.phone !== undefined) updateData.phone = updates.phone;
            if (updates.email !== undefined) updateData.email = updates.email;
            if (updates.address !== undefined) updateData.address = updates.address;
            if (updates.balance !== undefined) updateData.current_balance = updates.balance;
            // if (updates.notes !== undefined) updateData.notes = updates.notes;
            if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
            if (updates.taxNumber !== undefined) updateData.tax_number = updates.taxNumber;

            const { data, error } = await (supabase as any)
                .from('partners')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating supplier:', error);
                return null;
            }

            return mapToSupplier(data);
        } catch (error) {
            console.error('Error in update supplier:', error);
            return null;
        }
    },

    /**
     * حذف مورد (soft delete)
     */
    async deleteSupplier(id: string): Promise<boolean> {
        try {
            const { error } = await (supabase as any)
                .from('partners')
                .update({ is_active: false, updated_at: new Date().toISOString() } as Update<'partners'>)
                .eq('id', id);

            if (error) return false;
            return true;
        } catch (error) {
            console.error('Error in delete supplier:', error);
            return false;
        }
    },

    /**
     * تحديث رصيد المورد
     */
    async updateBalance(id: string, amount: number): Promise<boolean> {
        try {
            const supplier = await this.getById(id);
            if (!supplier) return false;

            const newBalance = supplier.balance + amount;

            const { error } = await (supabase as any)
                .from('partners')
                .update({ current_balance: newBalance, updated_at: new Date().toISOString() } as Update<'partners'>)
                .eq('id', id);

            if (error) return false;
            return true;
        } catch (error) {
            console.error('Error in updateBalance:', error);
            return false;
        }
    }
};

export default suppliersService;
