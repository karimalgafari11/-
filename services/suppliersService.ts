/**
 * Suppliers Service - خدمة الموردين
 * CRUD operations للموردين مع Supabase
 */

import { supabase } from '../lib/supabaseClient';
import { Supplier } from '../types';

// تحويل بيانات Supabase لنوع Supplier
const mapToSupplier = (data: any): Supplier => ({
    id: data.id,
    name: data.name, // Added
    companyName: data.name,
    contactName: data.name,
    phone: data.phone || '',
    email: data.email || '',
    address: data.address || '',
    category: data.category || 'عام',
    balance: parseFloat(data.balance) || 0,
    notes: data.notes,
    isActive: data.is_active !== false,
    status: data.is_active ? 'active' : 'inactive', // Added
    taxNumber: data.tax_number || '', // Added
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
                .from('suppliers')
                .select('*')
                .eq('company_id', companyId)
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
                .from('suppliers')
                .select('*')
                .eq('id', id)
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
        console.log('🚀 SuppliersService.createSupplier called', { companyId, supplier });
        try {
            const payload = {
                company_id: companyId,
                name: supplier.companyName || supplier.contactName,
                phone: supplier.phone,
                email: supplier.email,
                address: supplier.address,
                category: supplier.category,
                balance: supplier.balance || 0,
                notes: supplier.notes,
                is_active: supplier.isActive !== false
            };
            console.log('📦 Payload sending to Supabase:', payload);

            const { data, error } = await supabase
                .from('suppliers')
                .insert(payload)
                .select()
                .single();

            if (error) {
                console.error('❌ Supabase Error in createSupplier:', error);
                console.error('Error details:', JSON.stringify(error, null, 2));
                return null;
            }

            console.log('✅ Supplier created successfully:', data);
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
            const updateData: any = { updated_at: new Date().toISOString() };
            if (updates.companyName !== undefined) updateData.name = updates.companyName;
            if (updates.phone !== undefined) updateData.phone = updates.phone;
            if (updates.email !== undefined) updateData.email = updates.email;
            if (updates.address !== undefined) updateData.address = updates.address;
            if (updates.category !== undefined) updateData.category = updates.category;
            if (updates.balance !== undefined) updateData.balance = updates.balance;
            if (updates.notes !== undefined) updateData.notes = updates.notes;
            if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

            const { data, error } = await supabase
                .from('suppliers')
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
            const { error } = await supabase
                .from('suppliers')
                .update({ is_active: false, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) {
                console.error('Error deleting supplier:', error);
                return false;
            }

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

            const { error } = await supabase
                .from('suppliers')
                .update({ balance: newBalance, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) {
                console.error('Error updating balance:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in updateBalance:', error);
            return false;
        }
    }
};

export default suppliersService;
