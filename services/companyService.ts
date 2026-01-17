/**
 * Company Service - خدمة الشركة
 * إدارة الشركة الحالية والتحقق من الصلاحيات
 */

import { supabase } from '../lib/supabaseClient';
import { authService } from './authService';

export interface CompanyData {
    id: string;
    name: string;
    name_en?: string;
    phone?: string;
    email?: string;
    address?: string;
    tax_number?: string;
    commercial_register?: string;
    created_at: string;
    updated_at?: string;
}

export interface UserProfile {
    id: string;
    company_id: string;
    name: string;
    email?: string;
    phone?: string;
    role: 'manager' | 'accountant' | 'employee';
    is_active: boolean;
    created_at: string;
}

// كاش للشركة الحالية
let currentCompany: CompanyData | null = null;
let currentProfile: UserProfile | null = null;

export const companyService = {
    /**
     * الحصول على الشركة الحالية للمستخدم
     */
    async getCurrentCompany(): Promise<CompanyData | null> {
        if (currentCompany) return currentCompany;

        try {
            const user = await authService.getCurrentUser();
            if (!user) return null;

            // جلب الملف الشخصي مع الشركة
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*, companies(*)')
                .eq('id', user.id)
                .single();

            if (profileError || !profile) {
                console.error('Error fetching profile:', profileError);
                return null;
            }

            currentProfile = {
                id: profile.id,
                company_id: profile.company_id,
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                role: profile.role,
                is_active: profile.is_active,
                created_at: profile.created_at
            };

            if (profile.companies) {
                currentCompany = profile.companies as CompanyData;
                return currentCompany;
            }

            return null;
        } catch (error) {
            console.error('Error getting current company:', error);
            return null;
        }
    },

    /**
     * الحصول على معرف الشركة الحالية
     */
    async getCompanyId(): Promise<string | null> {
        const company = await this.getCurrentCompany();
        return company?.id || null;
    },

    /**
     * الحصول على الملف الشخصي الحالي
     */
    async getCurrentProfile(): Promise<UserProfile | null> {
        if (currentProfile) return currentProfile;
        await this.getCurrentCompany();
        return currentProfile;
    },

    /**
     * إنشاء شركة جديدة
     */
    async createCompany(data: Omit<CompanyData, 'id' | 'created_at'>): Promise<CompanyData | null> {
        try {
            const { data: company, error } = await supabase
                .from('companies')
                .insert({
                    name: data.name,
                    name_en: data.name_en,
                    phone: data.phone,
                    email: data.email,
                    address: data.address,
                    tax_number: data.tax_number,
                    commercial_register: data.commercial_register
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating company:', error);
                return null;
            }

            return company as CompanyData;
        } catch (error) {
            console.error('Error creating company:', error);
            return null;
        }
    },

    /**
     * تحديث الشركة
     */
    async updateCompany(id: string, updates: Partial<CompanyData>): Promise<CompanyData | null> {
        try {
            const { data: company, error } = await supabase
                .from('companies')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating company:', error);
                return null;
            }

            currentCompany = company as CompanyData;
            return currentCompany;
        } catch (error) {
            console.error('Error updating company:', error);
            return null;
        }
    },

    /**
     * ربط المستخدم بشركة
     */
    async linkUserToCompany(userId: string, companyId: string, role: 'manager' | 'accountant' | 'employee' = 'employee'): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ company_id: companyId, role })
                .eq('id', userId);

            if (error) {
                console.error('Error linking user to company:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error linking user to company:', error);
            return false;
        }
    },

    /**
     * مسح الكاش
     */
    clearCache() {
        currentCompany = null;
        currentProfile = null;
    },

    /**
     * التحقق من أن المستخدم له صلاحية على الشركة
     */
    async hasAccessToCompany(companyId: string): Promise<boolean> {
        const profile = await this.getCurrentProfile();
        return profile?.company_id === companyId;
    }
};

export default companyService;
