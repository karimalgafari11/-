/**
 * Payment Methods Service - خدمة طرق الدفع
 * CRUD operations for payment_methods table
 */

import { supabase } from '../lib/supabaseClient';
import { companyService } from './companyService';
import type { PaymentMethod, Insert, Update, PaymentMethodType } from '../types/supabase-helpers';

export const paymentMethodsService = {
    /**
     * جلب جميع طرق الدفع
     */
    async getAll(): Promise<PaymentMethod[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) {
                console.warn('No company ID found');
                return [];
            }

            const { data, error } = await (supabase as any)
                .from('payment_methods')
                .select('*')
                .eq('company_id', companyId)
                .eq('is_active', true)
                .order('name');

            if (error) {
                console.error('Error fetching payment methods:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getAll payment methods:', error);
            return [];
        }
    },

    /**
     * جلب طريقة دفع واحدة
     */
    async getById(id: string): Promise<PaymentMethod | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('payment_methods')
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
     * جلب طرق الدفع حسب النوع
     */
    async getByType(type: PaymentMethodType): Promise<PaymentMethod[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return [];

            const { data, error } = await (supabase as any)
                .from('payment_methods')
                .select('*')
                .eq('company_id', companyId)
                .eq('type', type)
                .eq('is_active', true)
                .order('name');

            if (error) return [];
            return data || [];
        } catch {
            return [];
        }
    },

    /**
     * جلب طريقة الدفع النقدي الافتراضية
     */
    async getDefaultCash(): Promise<PaymentMethod | null> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return null;

            const { data, error } = await (supabase as any)
                .from('payment_methods')
                .select('*')
                .eq('company_id', companyId)
                .eq('type', 'cash')
                .eq('is_active', true)
                .limit(1)
                .single();

            if (error) return null;
            return data;
        } catch {
            return null;
        }
    },

    /**
     * إنشاء طريقة دفع جديدة
     */
    async create(method: Omit<Insert<'payment_methods'>, 'company_id'>): Promise<PaymentMethod | null> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) {
                console.error('No company ID found');
                return null;
            }

            const { data, error } = await (supabase as any)
                .from('payment_methods')
                .insert({
                    ...method,
                    company_id: companyId
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating payment method:', error);
                return null;
            }

            console.log('✅ Payment method created:', data.id);
            return data;
        } catch (error) {
            console.error('Error in create payment method:', error);
            return null;
        }
    },

    /**
     * تحديث طريقة دفع
     */
    async update(id: string, updates: Update<'payment_methods'>): Promise<PaymentMethod | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('payment_methods')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating payment method:', error);
                return null;
            }

            return data;
        } catch {
            return null;
        }
    },

    /**
     * حذف طريقة دفع (soft delete)
     */
    async delete(id: string): Promise<boolean> {
        try {
            const { error } = await (supabase as any)
                .from('payment_methods')
                .update({ is_active: false })
                .eq('id', id);

            if (error) {
                console.error('Error deleting payment method:', error);
                return false;
            }

            return true;
        } catch {
            return false;
        }
    }
};

export default paymentMethodsService;
