/**
 * Customers Service - خدمة العملاء
 * CRUD operations للعملاء مع Supabase
 */

import { supabase } from '../lib/supabaseClient';
import { companyService } from './companyService';
import { Customer } from '../types';

// تحويل بيانات Supabase لنوع Customer
const mapToCustomer = (data: any): Customer => ({
    id: data.id,
    name: data.name,
    phone: data.phone || '',
    email: data.email || '',
    address: data.address || '',
    category: data.category || 'عام',
    balance: parseFloat(data.balance) || 0,
    notes: data.notes,
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

            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .eq('company_id', companyId)
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
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .eq('id', id)
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
            const companyId = await companyService.getCompanyId();
            if (!companyId) {
                console.error('No company ID found');
                return null;
            }

            const { data, error } = await supabase
                .from('customers')
                .insert({
                    company_id: companyId,
                    name: customer.name,
                    phone: customer.phone,
                    email: customer.email,
                    address: customer.address,
                    category: customer.category,
                    balance: customer.balance || 0,
                    notes: customer.notes,
                    is_active: customer.isActive !== false
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating customer:', error);
                return null;
            }

            return mapToCustomer(data);
        } catch (error) {
            console.error('Error in create customer:', error);
            return null;
        }
    },

    /**
     * تحديث عميل
     */
    async update(id: string, updates: Partial<Customer>): Promise<Customer | null> {
        try {
            const updateData: any = { updated_at: new Date().toISOString() };
            if (updates.name !== undefined) updateData.name = updates.name;
            if (updates.phone !== undefined) updateData.phone = updates.phone;
            if (updates.email !== undefined) updateData.email = updates.email;
            if (updates.address !== undefined) updateData.address = updates.address;
            if (updates.category !== undefined) updateData.category = updates.category;
            if (updates.balance !== undefined) updateData.balance = updates.balance;
            if (updates.notes !== undefined) updateData.notes = updates.notes;
            if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

            const { data, error } = await supabase
                .from('customers')
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
            const { error } = await supabase
                .from('customers')
                .update({ is_active: false, updated_at: new Date().toISOString() })
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

            const { error } = await supabase
                .from('customers')
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

export default customersService;
