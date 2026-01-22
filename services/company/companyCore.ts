/**
 * Company Core - العمليات الأساسية للشركات
 */

import { supabase, generateUUID, getCurrentTimestamp, currentStorageMode } from '../../lib/supabaseClient';
import { authService } from '../authService';
import { profileService } from '../profileService';
import { CompanyData, CreateCompanyData, DEFAULT_COMPANY_SETTINGS } from './types';
import { mapSupabaseCompany } from './mappers';
import {
    getLocalCompanies,
    saveLocalCompanies,
    getCurrentCompanyId as getStoredCompanyId,
    setCurrentCompanyId,
    addLocalCompany
} from './localStorage';
import {
    getCachedCompany,
    setCachedCompany,
    getCachedProfile,
    setCachedProfile,
    clearCache
} from './cache';

/**
 * الحصول على جميع شركات المستخدم
 */
export async function getUserCompanies(): Promise<CompanyData[]> {
    try {
        const user = await authService.getCurrentUser();
        if (!user) {
            console.warn('⚠️ getUserCompanies: No authenticated user');
            return [];
        }

        if (currentStorageMode === 'cloud') {
            console.log('🔍 Fetching companies for user:', user.id);

            const { data: ucrData, error: ucrError } = await (supabase as any)
                .from('user_company_roles')
                .select('company_id')
                .eq('user_id', user.id)
                .eq('is_active', true) as { data: any[]; error: any };

            if (ucrError) {
                console.error('❌ Error fetching user_company_roles:', ucrError);
            }

            const { data, error } = await (supabase as any)
                .from('companies')
                .select('*') as { data: any[]; error: any };

            if (error) {
                console.error('❌ Error fetching companies:', error);
                return [];
            }

            if (!data || data.length === 0) {
                console.warn('⚠️ No companies found for user');
                const { data: profile } = await (supabase as any)
                    .from('profiles')
                    .select('company_id')
                    .eq('id', user.id)
                    .single() as { data: any };

                if (profile?.company_id) {
                    const { data: companyData } = await (supabase as any)
                        .from('companies')
                        .select('*')
                        .eq('id', profile.company_id)
                        .single() as { data: any };

                    if (companyData) {
                        console.log('✅ Found company via profile:', companyData.name);
                        return [mapSupabaseCompany(companyData)];
                    }
                }
                return [];
            }

            console.log('✅ Found', data.length, 'companies');
            return data.map((c: any) => mapSupabaseCompany(c));
        } else {
            const memberships = await profileService.getUserMemberships(user.id);
            const companies = getLocalCompanies();

            return companies.filter(c =>
                memberships.some(m => m.company_id === c.id) || c.owner_id === user.id
            );
        }
    } catch (error) {
        console.error('❌ Error getting user companies:', error);
        return [];
    }
}

/**
 * الحصول على الشركة الحالية للمستخدم
 */
export async function getCurrentCompany(
    createCompanyFn: (data: CreateCompanyData) => Promise<CompanyData | null>
): Promise<CompanyData | null> {
    const cached = getCachedCompany();
    if (cached) return cached;

    try {
        const user = await authService.getCurrentUser();
        if (!user) return null;

        const savedCompanyId = getStoredCompanyId();
        const companies = await getUserCompanies();

        if (companies.length === 0) {
            const newCompany = await createCompanyFn({
                name: 'شركتي',
                name_en: 'My Company'
            });
            if (newCompany) {
                setCachedCompany(newCompany);
                return newCompany;
            }
            return null;
        }

        const company = savedCompanyId
            ? companies.find(c => c.id === savedCompanyId) || companies[0]
            : companies[0];

        setCachedCompany(company);
        return company;
    } catch (error) {
        console.error('Error getting current company:', error);
        return null;
    }
}

/**
 * الحصول على معرف الشركة الحالية
 */
export async function getCompanyId(
    getCurrentCompanyFn: () => Promise<CompanyData | null>
): Promise<string | null> {
    try {
        const user = await authService.getCurrentUser();
        if (user?.companyId && user.companyId !== 'default-company-id') {
            console.log('✅ Got company ID from user:', user.companyId);
            return user.companyId;
        }

        if (user) {
            try {
                const timeoutPromise = new Promise<null>((resolve) =>
                    setTimeout(() => resolve(null), 5000)
                );

                const profilePromise = (supabase as any)
                    .from('profiles')
                    .select('company_id')
                    .eq('id', user.id)
                    .single();

                const result = await Promise.race([profilePromise, timeoutPromise]);

                if (result && 'data' in result && (result.data as any)?.company_id) {
                    console.log('✅ Got company ID from profile:', (result.data as any).company_id);
                    return (result.data as any).company_id;
                }
            } catch (err) {
                console.warn('⚠️ Could not get company ID from profile:', err);
            }
        }

        const company = await getCurrentCompanyFn();
        if (company?.id) {
            console.log('✅ Got company ID from getCurrentCompany:', company.id);
            return company.id;
        }

        console.error('❌ getCompanyId: Could not get current company. Data operations will fail!');
        return null;
    } catch (error) {
        console.error('❌ Error in getCompanyId:', error);
        return null;
    }
}

/**
 * إنشاء شركة جديدة
 */
export async function createCompany(data: CreateCompanyData): Promise<CompanyData | null> {
    try {
        const user = await authService.getCurrentUser();
        if (!user) return null;

        const now = getCurrentTimestamp();
        const newCompanyId = generateUUID();

        const newCompany: CompanyData = {
            id: newCompanyId,
            name: data.name,
            name_en: data.name_en,
            phone: data.phone,
            email: data.email,
            address: data.address,
            logo: data.logo,
            tax_number: data.tax_number,
            commercial_register: data.commercial_register,
            owner_id: user.id,
            is_active: true,
            settings: DEFAULT_COMPANY_SETTINGS,
            created_at: now,
            updated_at: now
        };

        if (currentStorageMode === 'cloud') {
            const { error } = await (supabase as any).from('companies').insert({
                id: newCompany.id,
                name: newCompany.name,
                name_en: newCompany.name_en,
                phone: newCompany.phone,
                email: newCompany.email,
                address: newCompany.address,
                tax_number: newCompany.tax_number,
                created_at: now,
                updated_at: now
            });

            if (error) {
                console.error('Error creating company in cloud:', error);
                return null;
            }

            // إضافة user_company_roles
            const { data: adminRole } = await (supabase as any)
                .from('roles')
                .select('id')
                .eq('name', 'admin')
                .eq('is_system', true)
                .single() as { data: any };

            const adminRoleId = adminRole?.id || '00000000-0000-0000-0000-000000000002';

            await (supabase as any).from('user_company_roles').insert({
                id: generateUUID(),
                user_id: user.id,
                company_id: newCompany.id,
                role_id: adminRoleId,
                is_default: true,
                is_owner: true,
                is_active: true
            });

            // تحديث profile
            await (supabase as any)
                .from('profiles')
                .update({ company_id: newCompany.id })
                .eq('id', user.id);

            console.log('✅ Created company with user_company_roles entry');
        } else {
            addLocalCompany(newCompany);
        }

        // إنشاء بروفايل للمالك
        await profileService.createProfile({
            user_id: user.id,
            company_id: newCompany.id,
            name: user.name || user.email || 'مستخدم',
            email: user.email,
            role: 'admin'
        });

        setCurrentCompanyId(newCompany.id);
        setCachedCompany(newCompany);

        console.log('✅ تم إنشاء الشركة:', newCompany.name);
        return newCompany;
    } catch (error) {
        console.error('Error creating company:', error);
        return null;
    }
}

/**
 * تحديث الشركة
 */
export async function updateCompany(id: string, updates: Partial<CompanyData>): Promise<CompanyData | null> {
    try {
        const now = getCurrentTimestamp();

        if (currentStorageMode === 'cloud') {
            const { data, error } = await (supabase as any)
                .from('companies')
                .update({ ...updates, updated_at: now })
                .eq('id', id)
                .select()
                .single() as { data: any; error: any };

            if (error || !data) return null;

            const updatedCompany = mapSupabaseCompany(data);
            const cached = getCachedCompany();
            if (cached?.id === id) {
                setCachedCompany(updatedCompany);
            }
            return updatedCompany;
        } else {
            const companies = getLocalCompanies();
            const index = companies.findIndex(c => c.id === id);

            if (index === -1) return null;

            companies[index] = {
                ...companies[index],
                ...updates,
                updated_at: now
            };

            saveLocalCompanies(companies);

            const cached = getCachedCompany();
            if (cached?.id === id) {
                setCachedCompany(companies[index]);
            }

            return companies[index];
        }
    } catch (error) {
        console.error('Error updating company:', error);
        return null;
    }
}

/**
 * التبديل بين الشركات
 */
export async function switchCompany(companyId: string): Promise<boolean> {
    try {
        const user = await authService.getCurrentUser();
        if (!user) return false;

        const isMember = await profileService.isMember(user.id, companyId);
        if (!isMember) {
            console.error('User is not a member of this company');
            return false;
        }

        setCurrentCompanyId(companyId);
        clearCache();

        console.log('✅ تم التبديل إلى الشركة:', companyId);
        return true;
    } catch (error) {
        console.error('Error switching company:', error);
        return false;
    }
}

// إعادة تصدير clearCache
export { clearCache };
