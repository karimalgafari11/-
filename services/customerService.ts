/**
 * Customer Service - خدمة العملاء
 * التعامل مع جدول customers في Supabase مباشرة
 * متوافق مع Supabase Schema
 */

import { supabase } from '../lib/supabaseClient';
import type { Customer, InsertType } from '../types/supabase-types';

export const CustomerService = {
    /**
     * جلب جميع العملاء
     */
    async getCustomers(companyId: string): Promise<Customer[]> {
        try {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .eq('company_id', companyId)
                .is('is_active', true)
                .order('name');

            if (error) {
                console.error('❌ خطأ في جلب العملاء:', error);
                return [];
            }

            return data || [];
        } catch (err) {
            console.error('❌ استثناء في جلب العملاء:', err);
            return [];
        }
    },

    /**
     * جلب عميل واحد
     */
    async getCustomer(id: string): Promise<Customer | null> {
        try {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('❌ خطأ في جلب العميل:', error);
                return null;
            }

            return data;
        } catch (err) {
            console.error('❌ استثناء في جلب العميل:', err);
            return null;
        }
    },

    /**
     * إنشاء عميل جديد
     */
    async createCustomer(
        companyId: string,
        customer: Omit<InsertType<Customer>, 'company_id'>
    ): Promise<Customer | null> {
        console.log('🚀 CustomerService.createCustomer called', { companyId, customer });
        try {
            const payload = {
                ...customer,
                company_id: companyId,
                is_active: true
            };
            console.log('📦 Payload sending to Supabase:', payload);

            const { data, error } = await supabase
                .from('customers')
                .insert(payload)
                .select()
                .single();

            if (error) {
                console.error('❌ Supabase Error in createCustomer:', error);
                console.error('Error details:', JSON.stringify(error, null, 2));
                return null;
            }

            console.log('✅ Customer created successfully:', data);
            return data;
        } catch (err) {
            console.error('❌ Exception in createCustomer:', err);
            return null;
        }
    },

    /**
     * تحديث بيانات عميل
     */
    async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
        try {
            const { data, error } = await supabase
                .from('customers')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('❌ خطأ في تحديث العميل:', error);
                return null;
            }

            console.log('✅ تم تحديث العميل:', id);
            return data;
        } catch (err) {
            console.error('❌ استثناء في تحديث العميل:', err);
            return null;
        }
    },

    /**
     * حذف عميل (soft delete)
     */
    async deleteCustomer(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('customers')
                .update({ is_active: false })
                .eq('id', id);

            if (error) {
                console.error('❌ خطأ في حذف العميل:', error);
                return false;
            }

            console.log('✅ تم تعطيل العميل:', id);
            return true;
        } catch (err) {
            console.error('❌ استثناء في حذف العميل:', err);
            return false;
        }
    },

    /**
     * البحث عن العملاء
     */
    async searchCustomers(companyId: string, query: string): Promise<Customer[]> {
        try {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .eq('company_id', companyId)
                .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
                .limit(20);

            if (error) {
                console.error('❌ خطأ في البحث عن العملاء:', error);
                return [];
            }

            return data || [];
        } catch (err) {
            console.error('❌ استثناء في البحث عن العملاء:', err);
            return [];
        }
    }
};

export default CustomerService;
