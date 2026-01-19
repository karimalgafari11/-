/**
 * Returns Service - خدمة المرتجعات
 * CRUD للمرتجعات (مبيعات ومشتريات) مع Supabase
 */

import { supabase } from '../lib/supabaseClient';
import type { Return, InsertType } from '../types/supabase-types';

export const returnsService = {
    /**
     * جلب جميع المرتجعات
     */
    async getAll(companyId: string): Promise<Return[]> {
        try {
            const { data, error } = await supabase
                .from('returns')
                .select('*')
                .eq('company_id', companyId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ خطأ في جلب المرتجعات:', error);
                return [];
            }
            return data || [];
        } catch (err) {
            console.error('❌ استثناء في جلب المرتجعات:', err);
            return [];
        }
    },

    /**
     * جلب مرتجعات المبيعات
     */
    async getSalesReturns(companyId: string): Promise<Return[]> {
        try {
            const { data, error } = await supabase
                .from('returns')
                .select('*')
                .eq('company_id', companyId)
                .eq('return_type', 'sales')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ خطأ في جلب مرتجعات المبيعات:', error);
                return [];
            }
            return data || [];
        } catch (err) {
            console.error('❌ استثناء في جلب مرتجعات المبيعات:', err);
            return [];
        }
    },

    /**
     * جلب مرتجعات المشتريات
     */
    async getPurchaseReturns(companyId: string): Promise<Return[]> {
        try {
            const { data, error } = await supabase
                .from('returns')
                .select('*')
                .eq('company_id', companyId)
                .eq('return_type', 'purchase')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ خطأ في جلب مرتجعات المشتريات:', error);
                return [];
            }
            return data || [];
        } catch (err) {
            console.error('❌ استثناء في جلب مرتجعات المشتريات:', err);
            return [];
        }
    },

    /**
     * جلب مرتجع واحد
     */
    async getById(id: string): Promise<Return | null> {
        try {
            const { data, error } = await supabase
                .from('returns')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (err) {
            console.error('❌ خطأ في جلب المرتجع:', err);
            return null;
        }
    },

    /**
     * إنشاء مرتجع جديد
     */
    async create(
        companyId: string,
        returnData: Omit<InsertType<Return>, 'company_id' | 'return_number'>
    ): Promise<Return | null> {
        try {
            const returnNumber = await this.generateNumber(companyId, returnData.return_type as 'sales' | 'purchase');

            const { data, error } = await supabase
                .from('returns')
                .insert({
                    ...returnData,
                    company_id: companyId,
                    return_number: returnNumber
                })
                .select()
                .single();

            if (error) throw error;
            console.log('✅ تم إنشاء مرتجع جديد:', data.id);
            return data;
        } catch (err) {
            console.error('❌ خطأ في إنشاء المرتجع:', err);
            return null;
        }
    },

    /**
     * تحديث مرتجع
     */
    async update(id: string, updates: Partial<Return>): Promise<Return | null> {
        try {
            const { data, error } = await supabase
                .from('returns')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            console.log('✅ تم تحديث المرتجع:', id);
            return data;
        } catch (err) {
            console.error('❌ خطأ في تحديث المرتجع:', err);
            return null;
        }
    },

    /**
     * تغيير حالة المرتجع
     */
    async updateStatus(id: string, status: Return['status']): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('returns')
                .update({
                    status: status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;
            console.log('✅ تم تحديث حالة المرتجع:', id);
            return true;
        } catch (err) {
            console.error('❌ خطأ في تحديث حالة المرتجع:', err);
            return false;
        }
    },

    /**
     * توليد رقم مرتجع
     */
    async generateNumber(companyId: string, type: 'sales' | 'purchase'): Promise<string> {
        const prefix = type === 'sales' ? 'SR' : 'PR';
        const year = new Date().getFullYear();

        const { count } = await supabase
            .from('returns')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .eq('return_type', type);

        const number = ((count || 0) + 1).toString().padStart(5, '0');
        return `${prefix}-${year}-${number}`;
    }
};

export default returnsService;
