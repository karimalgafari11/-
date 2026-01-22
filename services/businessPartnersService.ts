/**
 * Business Partners Service - خدمة الشركاء التجاريين (العملاء والموردين)
 * يوحد العملاء والموردين في جدول واحد
 */

import { supabase, generateUUID, getCurrentTimestamp } from '../lib/supabaseClient';
import { companyService } from './companyService';

export type PartnerType = 'customer' | 'supplier' | 'both';

export interface BusinessPartner {
    id: string;
    company_id: string;
    code?: string;
    name: string;
    name_en?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    address?: string;
    city?: string;
    country?: string;
    partner_type: PartnerType;
    category?: string;
    currency?: string;
    credit_limit?: number;
    payment_terms?: number;
    tax_number?: string;
    balance?: number;
    is_active?: boolean;
    is_general?: boolean;
    cash_only?: boolean;
    notes?: string;
    created_at?: string;
}

export type PartnerInsert = Omit<BusinessPartner, 'id' | 'created_at' | 'balance'>;
export type PartnerUpdate = Partial<PartnerInsert>;

export const businessPartnersService = {
    /**
     * جلب جميع الشركاء
     */
    async getAll(type?: PartnerType): Promise<BusinessPartner[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return [];

            let query = (supabase as any)
                .from('partners')
                .select('*')
                .eq('company_id', companyId)
                .eq('is_active', true)
                .order('name');

            if (type) {
                if (type === 'customer') {
                    query = query.in('partner_type', ['customer', 'both']);
                } else if (type === 'supplier') {
                    query = query.in('partner_type', ['supplier', 'both']);
                } else {
                    query = query.eq('partner_type', type);
                }
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching partners:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getAll partners:', error);
            return [];
        }
    },

    /**
     * جلب العملاء فقط
     */
    async getCustomers(): Promise<BusinessPartner[]> {
        return this.getAll('customer');
    },

    /**
     * جلب الموردين فقط
     */
    async getSuppliers(): Promise<BusinessPartner[]> {
        return this.getAll('supplier');
    },

    /**
     * جلب شريك واحد
     */
    async getById(id: string): Promise<BusinessPartner | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('partners')
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
     * إنشاء شريك جديد
     */
    async create(partner: PartnerInsert): Promise<BusinessPartner | null> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return null;

            const { data, error } = await (supabase as any)
                .from('partners')
                .insert({
                    id: generateUUID(),
                    // company_id: companyId, // Included in partner object or will be merged
                    ...partner,
                    company_id: companyId, // Enforce it
                    created_at: getCurrentTimestamp()
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating partner:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in create partner:', error);
            return null;
        }
    },

    /**
     * تحديث شريك
     */
    async update(id: string, updates: PartnerUpdate): Promise<BusinessPartner | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('partners')
                .update({
                    ...updates,
                    updated_at: getCurrentTimestamp()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating partner:', error);
                return null;
            }

            return data;
        } catch {
            return null;
        }
    },

    /**
     * حذف شريك (soft delete)
     */
    async delete(id: string): Promise<boolean> {
        try {
            const { error } = await (supabase as any)
                .from('partners')
                .update({ is_active: false })
                .eq('id', id);

            return !error;
        } catch {
            return false;
        }
    },

    /**
     * البحث عن شركاء
     */
    async search(query: string, type?: PartnerType): Promise<BusinessPartner[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return [];

            let dbQuery = (supabase as any)
                .from('partners')
                .select('*')
                .eq('company_id', companyId)
                .eq('is_active', true)
                .or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
                .limit(20);

            if (type) {
                dbQuery = dbQuery.eq('partner_type', type);
            }

            const { data, error } = await dbQuery;

            if (error) return [];
            return data || [];
        } catch {
            return [];
        }
    }
};

export default businessPartnersService;
