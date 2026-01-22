/**
 * Fiscal Years Service - خدمة السنوات المالية
 */

import { supabase, generateUUID, getCurrentTimestamp } from '../lib/supabaseClient';
import { companyService } from './companyService';
import { FiscalYear } from '../types/accounting';

export const fiscalYearsService = {
    /**
     * جلب جميع السنوات المالية
     */
    async getAll(): Promise<FiscalYear[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return [];

            const { data, error } = await (supabase as any)
                .from('fiscal_years')
                .select('*')
                .eq('company_id', companyId)
                .order('start_date', { ascending: false });

            if (error) {
                console.error('Error fetching fiscal years:', error);
                return [];
            }

            return data || [];
        } catch {
            return [];
        }
    },

    /**
     * جلب السنة المالية النشطة
     */
    async getActive(): Promise<FiscalYear | null> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return null;

            const { data, error } = await (supabase as any)
                .from('fiscal_years')
                .select('*')
                .eq('company_id', companyId)
                .eq('is_active', true)
                .single();

            if (error) return null;
            return data;
        } catch {
            return null;
        }
    },

    /**
     * جلب سنة مالية بالمعرف
     */
    async getById(id: string): Promise<FiscalYear | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('fiscal_years')
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
     * إنشاء سنة مالية جديدة
     */
    async create(data: {
        name: string;
        start_date: string;
        end_date: string;
        is_active?: boolean;
    }): Promise<FiscalYear | null> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return null;

            // إذا كانت نشطة، إلغاء تفعيل السنوات الأخرى
            if (data.is_active) {
                await (supabase as any)
                    .from('fiscal_years')
                    .update({ is_active: false })
                    .eq('company_id', companyId);
            }

            const { data: fiscalYear, error } = await (supabase as any)
                .from('fiscal_years')
                .insert({
                    id: generateUUID(),
                    company_id: companyId,
                    name: data.name,
                    start_date: data.start_date,
                    end_date: data.end_date,
                    is_active: data.is_active ?? false,
                    is_closed: false,
                    created_at: getCurrentTimestamp()
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating fiscal year:', error);
                return null;
            }

            return fiscalYear;
        } catch (error) {
            console.error('Error in create fiscal year:', error);
            return null;
        }
    },

    /**
     * تحديث سنة مالية
     */
    async update(id: string, updates: Partial<FiscalYear>): Promise<FiscalYear | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('fiscal_years')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating fiscal year:', error);
                return null;
            }
            return data;
        } catch {
            return null;
        }
    },

    /**
     * حذف سنة مالية
     */
    async delete(id: string): Promise<boolean> {
        try {
            const { error } = await (supabase as any)
                .from('fiscal_years')
                .delete()
                .eq('id', id);
            return !error;
        } catch {
            return false;
        }
    },

    /**
     * تفعيل سنة مالية
     */
    async activate(id: string): Promise<boolean> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return false;

            // إلغاء تفعيل السنوات الأخرى
            await (supabase as any)
                .from('fiscal_years')
                .update({ is_active: false })
                .eq('company_id', companyId);

            // تفعيل السنة المطلوبة
            const { error } = await (supabase as any)
                .from('fiscal_years')
                .update({ is_active: true })
                .eq('id', id)
                .eq('is_closed', false);

            return !error;
        } catch {
            return false;
        }
    },

    /**
     * إغلاق سنة مالية
     */
    async close(id: string): Promise<boolean> {
        try {
            const { error } = await (supabase as any)
                .from('fiscal_years')
                .update({
                    is_closed: true,
                    is_active: false,
                    closed_at: getCurrentTimestamp()
                })
                .eq('id', id);

            return !error;
        } catch {
            return false;
        }
    },

    /**
     * التحقق من وجود سنة مالية للتاريخ
     */
    async getForDate(date: string): Promise<FiscalYear | null> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return null;

            const { data, error } = await (supabase as any)
                .from('fiscal_years')
                .select('*')
                .eq('company_id', companyId)
                .lte('start_date', date)
                .gte('end_date', date)
                .single();

            if (error) return null;
            return data;
        } catch {
            return null;
        }
    }
};

export default fiscalYearsService;
