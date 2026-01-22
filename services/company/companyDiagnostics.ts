/**
 * Company Diagnostics - تشخيص وإصلاح إعدادات الشركة
 */

import { supabase, generateUUID } from '../../lib/supabaseClient';
import { authService } from '../authService';
import { UserSetupDiagnosis } from './types';

/**
 * تشخيص إعداد المستخدم - للتصحيح
 */
export async function diagnoseUserSetup(): Promise<UserSetupDiagnosis> {
    const errors: string[] = [];

    try {
        const user = await authService.getCurrentUser();

        if (!user) {
            return {
                hasUser: false,
                hasProfile: false,
                hasCompany: false,
                hasUserCompanyRole: false,
                companyId: null,
                userId: null,
                errors: ['❌ No authenticated user found. Please log in.']
            };
        }

        console.log('🔍 Diagnosing setup for user:', user.id);

        // Check profile
        const { data: profile, error: profileError } = await (supabase as any)
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single() as { data: any; error: any };

        if (profileError) {
            errors.push(`❌ Profile error: ${profileError.message}`);
        }

        // Check user_company_roles
        const { data: ucr, error: ucrError } = await (supabase as any)
            .from('user_company_roles')
            .select('*, companies(name)')
            .eq('user_id', user.id) as { data: any[]; error: any };

        if (ucrError) {
            errors.push(`❌ user_company_roles error: ${ucrError.message}`);
        }

        const hasProfile = !!profile;
        const hasUserCompanyRole = (ucr?.length || 0) > 0;
        const companyId = profile?.company_id || ucr?.[0]?.company_id || null;

        // Check if company exists
        let hasCompany = false;
        if (companyId) {
            const { data: company } = await (supabase as any)
                .from('companies')
                .select('id, name')
                .eq('id', companyId)
                .single();
            hasCompany = !!company;
        }

        // Build diagnostic report
        console.log('═══════════════════════════════════════');
        console.log('📊 DIAGNOSTIC REPORT');
        console.log('═══════════════════════════════════════');
        console.log('👤 User ID:', user.id);
        console.log('📧 Email:', user.email);
        console.log('📋 Profile:', hasProfile ? '✅ EXISTS' : '❌ MISSING');
        console.log('🏢 Company:', hasCompany ? '✅ EXISTS' : '❌ MISSING');
        console.log('🔗 User-Company Role:', hasUserCompanyRole ? `✅ ${ucr?.length} entry(ies)` : '❌ MISSING');
        console.log('🏷️ Company ID:', companyId || 'N/A');
        if (errors.length > 0) {
            console.log('⚠️ Errors:', errors);
        }
        console.log('═══════════════════════════════════════');

        if (!hasProfile) {
            errors.push('❌ No profile found. The handle_new_user trigger may have failed.');
        }
        if (!hasUserCompanyRole) {
            errors.push('❌ No user_company_roles entry. User cannot access any company data.');
        }
        if (!hasCompany) {
            errors.push('❌ No company found. User needs a company to add data.');
        }

        return {
            hasUser: true,
            hasProfile,
            hasCompany,
            hasUserCompanyRole,
            companyId,
            userId: user.id,
            errors
        };
    } catch (error: any) {
        return {
            hasUser: false,
            hasProfile: false,
            hasCompany: false,
            hasUserCompanyRole: false,
            companyId: null,
            userId: null,
            errors: [`❌ Diagnostic error: ${error.message}`]
        };
    }
}

/**
 * إصلاح تلقائي: إنشاء user_company_roles إذا كان مفقوداً
 * هذا مطلوب لكي تعمل سياسات RLS
 */
export async function ensureUserCompanyRoleExists(): Promise<boolean> {
    try {
        const user = await authService.getCurrentUser();
        if (!user) {
            console.log('❌ ensureUserCompanyRoleExists: No user logged in');
            return false;
        }

        // التحقق من وجود user_company_roles
        const { data: existingRole } = await (supabase as any)
            .from('user_company_roles')
            .select('id, company_id')
            .eq('user_id', user.id)
            .maybeSingle() as { data: any };

        if (existingRole) {
            console.log('✅ user_company_roles exists:', existingRole.company_id);
            return true;
        }

        console.log('⚠️ user_company_roles missing, attempting to fix...');

        // الحصول على company_id من profile
        const { data: profile } = await (supabase as any)
            .from('profiles')
            .select('company_id')
            .eq('id', user.id)
            .single() as { data: any };

        if (!profile?.company_id) {
            console.log('❌ No company_id in profile, cannot fix');
            return false;
        }

        // الحصول على role_id للـ admin
        const { data: adminRole } = await (supabase as any)
            .from('roles')
            .select('id')
            .eq('name', 'admin')
            .eq('is_system', true)
            .single() as { data: any };

        const roleId = adminRole?.id || '00000000-0000-0000-0000-000000000002';

        // إنشاء user_company_roles
        const { error: insertError } = await (supabase as any)
            .from('user_company_roles')
            .insert({
                id: generateUUID(),
                user_id: user.id,
                company_id: profile.company_id,
                role_id: roleId,
                is_default: true,
                is_owner: true,
                is_active: true
            });

        if (insertError) {
            console.error('❌ Failed to create user_company_roles:', insertError);
            return false;
        }

        console.log('✅ Created user_company_roles successfully!');
        console.log('🔄 Please refresh the page to see your data.');
        return true;
    } catch (error) {
        console.error('❌ Error in ensureUserCompanyRoleExists:', error);
        return false;
    }
}
