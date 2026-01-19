/**
 * Fiscal Period Service - خدمة الفترات المالية
 * إدارة السنوات والمراحل المالية والإغلاقات
 */

import { supabase } from '../lib/supabaseClient';
import type { FiscalPeriod, InsertType, UpdateType } from '../types/supabase-types';

export const FiscalPeriodService = {
    /**
     * جلب كافة الفترات المالية للشركة
     */
    async getFiscalPeriods(companyId: string): Promise<FiscalPeriod[]> {
        const { data, error } = await supabase
            .from('fiscal_periods')
            .select('*')
            .eq('company_id', companyId)
            .order('start_date', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * جلب الفترة المالية الحالية المفتوحة
     */
    async getCurrentOpenPeriod(companyId: string): Promise<FiscalPeriod | null> {
        const now = new Date().toISOString();
        const { data, error } = await supabase
            .from('fiscal_periods')
            .select('*')
            .eq('company_id', companyId)
            .eq('status', 'open')
            .lte('start_date', now)
            .gte('end_date', now)
            .single();

        // قد لا توجد فترة مفتوحة لليوم الحالي، وهذا طبيعي
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    /**
     * إضافة فترة مالية جديدة
     */
    async addFiscalPeriod(period: InsertType<FiscalPeriod>): Promise<FiscalPeriod> {
        const { data, error } = await supabase
            .from('fiscal_periods')
            .insert(period)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * تحديث بيانات فترة مالية
     */
    async updateFiscalPeriod(id: string, updates: UpdateType<FiscalPeriod>): Promise<FiscalPeriod> {
        const { data, error } = await supabase
            .from('fiscal_periods')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * إغلاق فترة مالية
     */
    async closePeriod(id: string): Promise<void> {
        const { error } = await supabase
            .from('fiscal_periods')
            .update({ status: 'closed' })
            .eq('id', id);

        if (error) throw error;
    }
};
