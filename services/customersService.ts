/**
 * Customers Service - خدمة العملاء
 * CRUD operations للعملاء مع Supabase
 */

import { supabase } from '../lib/supabaseClient';
import { companyService } from './companyService';
import type { Partner, Insert, Update } from '../types/supabase-helpers';
import { Customer } from '../types';

// تحويل بيانات Supabase لنوع Customer
const mapToCustomer = (data: Partner): Customer => ({
    id: data.id,
    name: data.contact_person || data.name, // الاسم المسؤول
    companyName: data.name, // اسم الشركة / المؤسسة
    phone: data.phone || '',
    email: data.email || '',
    address: data.address || '',
    category: 'عام', // Partner doesn't have category yet
    balance: data.current_balance || 0,
    // notes: data.notes, // notes not in Partner
    isActive: data.is_active !== false,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    // خصائص الزبون العام
    isGeneral: false,
    cashOnly: false
});

export const customersService = {
    /**
     * جلب جميع العملاء
     */
    async getAll(): Promise<Customer[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) {
                console.warn('No company ID found');
                return [];
            }

            const { data, error } = await (supabase as any)
                .from('partners')
                .select('*')
                .eq('company_id', companyId)
                .eq('type', 'customer')
                .eq('is_active', true)
                .order('name');

            if (error) {
                console.error('Error fetching customers:', error);
                return [];
            }

            return (data || []).map(mapToCustomer);
        } catch (error) {
            console.error('Error in getAll customers:', error);
            return [];
        }
    },

    /**
     * جلب عميل واحد
     */
    async getById(id: string): Promise<Customer | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('partners')
                .select('*')
                .eq('id', id)
                .eq('type', 'customer')
                .single();

            if (error || !data) return null;

            return mapToCustomer(data);
        } catch (error) {
            console.error('Error in getById customer:', error);
            return null;
        }
    },

    /**
     * إنشاء عميل جديد
     */
    async create(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'isGeneral' | 'cashOnly'>): Promise<Customer | null> {
        try {
            console.log('🚀 customersService.create() called with:', customer.name);

            const companyId = await companyService.getCompanyId();
            if (!companyId) {
                console.error('❌ customersService.create: No company ID found!');
                console.log('💡 Run companyService.diagnoseUserSetup() in console to debug');
                return null;
            }

            const payload: Insert<'partners'> = {
                company_id: companyId,
                name: customer.companyName || customer.name, // اسم الشركة هو الأساس
                contact_person: customer.name, // اسم الشخص المسؤول
                phone: customer.phone,
                email: customer.email,
                address: customer.address,
                type: 'customer',
                current_balance: customer.balance || 0,
                // notes: customer.notes,
                is_active: customer.isActive !== false
            };

            console.log('📦 Sending to Supabase:', payload);

            const { data, error } = await (supabase as any)
                .from('partners')
                .insert(payload)
                .select()
                .single();

            if (error) {
                console.error('❌ Supabase error creating customer:', error);
                console.error('Error details:', JSON.stringify(error, null, 2));
                return null;
            }

            console.log('✅ Customer created successfully:', data.id);
            return mapToCustomer(data);
        } catch (error) {
            console.error('❌ Exception in create customer:', error);
            return null;
        }
    },

    /**
     * تحديث عميل
     */
    async update(id: string, updates: Partial<Customer>): Promise<Customer | null> {
        try {
            const updateData: Update<'partners'> = { updated_at: new Date().toISOString() };
            if (updates.name !== undefined) updateData.contact_person = updates.name;
            if (updates.companyName !== undefined) updateData.name = updates.companyName;
            if (updates.phone !== undefined) updateData.phone = updates.phone;
            if (updates.email !== undefined) updateData.email = updates.email;
            if (updates.address !== undefined) updateData.address = updates.address;
            if (updates.balance !== undefined) updateData.current_balance = updates.balance;
            // if (updates.notes !== undefined) updateData.notes = updates.notes;
            if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

            const { data, error } = await (supabase as any)
                .from('partners')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating customer:', error);
                return null;
            }

            return mapToCustomer(data);
        } catch (error) {
            console.error('Error in update customer:', error);
            return null;
        }
    },

    /**
     * حذف عميل (soft delete)
     */
    async delete(id: string): Promise<boolean> {
        try {
            const { error } = await (supabase as any)
                .from('partners')
                .update({ is_active: false, updated_at: new Date().toISOString() } as Update<'partners'>)
                .eq('id', id);

            if (error) {
                console.error('Error deleting customer:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in delete customer:', error);
            return false;
        }
    },

    /**
     * تحديث رصيد العميل
     */
    async updateBalance(id: string, amount: number): Promise<boolean> {
        try {
            const customer = await this.getById(id);
            if (!customer) return false;

            const newBalance = (customer.balance || 0) + amount;

            const { error } = await (supabase as any)
                .from('partners')
                .update({ current_balance: newBalance, updated_at: new Date().toISOString() } as Update<'partners'>)
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

export default customersService;
