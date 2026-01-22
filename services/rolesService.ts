/**
 * Roles Service - خدمة إدارة الأدوار والصلاحيات
 */

import { supabase, currentStorageMode } from '../lib/supabaseClient';
import { Role, Permission, UserCompanyRole, PERMISSIONS, hasPermission } from '../types/roles';

// =================== كاش الصلاحيات ===================
let cachedUserPermissions: Map<string, string[]> = new Map();
let cachedRoles: Role[] | null = null;

export const rolesService = {
    // =================== الأدوار ===================

    /**
     * جلب جميع الأدوار (النظام + المخصصة)
     */
    async getRoles(): Promise<Role[]> {
        if (cachedRoles !== null) return cachedRoles;

        try {
            const { data, error } = await (supabase as any)
                .from('roles')
                .select('*')
                .order('is_system', { ascending: false });

            if (error) {
                console.error('Error fetching roles:', error);
                return [];
            }

            cachedRoles = data || [];
            return cachedRoles || [];
        } catch (error) {
            console.error('Error in getRoles:', error);
            return [];
        }
    },

    /**
     * جلب دور بواسطة ID
     */
    async getRoleById(roleId: string): Promise<Role | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('roles')
                .select('*')
                .eq('id', roleId)
                .single();

            if (error) return null;
            return data;
        } catch {
            return null;
        }
    },

    /**
     * جلب دور بواسطة الاسم
     */
    async getRoleByName(name: string): Promise<Role | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('roles')
                .select('*')
                .eq('name', name)
                .eq('is_system', true)
                .single();

            if (error) return null;
            return data;
        } catch {
            return null;
        }
    },

    /**
     * إنشاء دور مخصص
     */
    async createCustomRole(tenantId: string, role: {
        name: string;
        name_ar: string;
        description?: string;
        permissions: string[];
    }): Promise<Role | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('roles')
                .insert({
                    tenant_id: tenantId,
                    name: role.name,
                    name_ar: role.name_ar,
                    description: role.description,
                    permissions: role.permissions,
                    is_system: false
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating role:', error);
                return null;
            }

            // مسح الكاش
            cachedRoles = null;
            return data;
        } catch (error) {
            console.error('Error in createCustomRole:', error);
            return null;
        }
    },

    // =================== الصلاحيات ===================

    /**
     * جلب جميع الصلاحيات المتاحة
     */
    async getPermissions(): Promise<Permission[]> {
        try {
            const { data, error } = await (supabase as any)
                .from('permissions')
                .select('*')
                .order('module');

            if (error) return [];
            return data || [];
        } catch {
            return [];
        }
    },

    /**
     * جلب صلاحيات وحدة معينة
     */
    async getPermissionsByModule(module: string): Promise<Permission[]> {
        try {
            const { data, error } = await (supabase as any)
                .from('permissions')
                .select('*')
                .eq('module', module);

            if (error) return [];
            return data || [];
        } catch {
            return [];
        }
    },

    // =================== صلاحيات المستخدم ===================

    /**
     * جلب صلاحيات المستخدم في شركة
     */
    async getUserCompanyRole(userId: string, companyId: string): Promise<UserCompanyRole | null> {
        try {
            // First try to find profile by auth_user_id (V6 schema)
            let profileId = userId;
            const { data: profile } = await (supabase as any)
                .from('profiles')
                .select('id')
                .eq('auth_user_id', userId)
                .single();

            if (profile) {
                profileId = profile.id;
            }

            const { data, error } = await (supabase as any)
                .from('user_companies')
                .select(`
                    *,
                    role:roles(*)
                `)
                .eq('user_id', profileId)
                .eq('company_id', companyId)
                .single();

            if (error) return null;
            return data;
        } catch {
            return null;
        }
    },

    /**
     * جلب جميع شركات المستخدم وأدواره
     */
    async getUserCompanies(userId: string): Promise<UserCompanyRole[]> {
        try {
            // First try to find profile by auth_user_id (V6 schema)
            let profileId = userId;
            const { data: profile } = await (supabase as any)
                .from('profiles')
                .select('id')
                .eq('auth_user_id', userId)
                .single();

            if (profile) {
                profileId = profile.id;
            }

            const { data, error } = await (supabase as any)
                .from('user_companies')
                .select(`
                    *,
                    role:roles(*),
                    company:companies(id, name)
                `)
                .eq('user_id', profileId);

            if (error) return [];
            return data || [];
        } catch {
            return [];
        }
    },

    /**
     * تعيين دور للمستخدم في شركة
     */
    async assignUserRole(
        userId: string,
        companyId: string,
        roleId: string,
        options: { isDefault?: boolean; isOwner?: boolean } = {}
    ): Promise<UserCompanyRole | null> {
        try {
            // First try to find profile by auth_user_id (V6 schema)
            let profileId = userId;
            const { data: profile } = await (supabase as any)
                .from('profiles')
                .select('id')
                .eq('auth_user_id', userId)
                .single();

            if (profile) {
                profileId = profile.id;
            }

            const { data, error } = await (supabase as any)
                .from('user_companies')
                .insert({
                    user_id: profileId,
                    company_id: companyId,
                    role_id: roleId,
                    is_default: options.isDefault ?? false,
                    is_owner: options.isOwner ?? false,
                    appointed_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) {
                console.error('Error assigning role:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in assignUserRole:', error);
            return null;
        }
    },

    /**
     * تحديث دور المستخدم
     */
    async updateUserRole(
        userId: string,
        companyId: string,
        updates: { role_id?: string; custom_permissions?: string[] }
    ): Promise<boolean> {
        try {
            // First try to find profile by auth_user_id (V6 schema)
            let profileId = userId;
            const { data: profile } = await (supabase as any)
                .from('profiles')
                .select('id')
                .eq('auth_user_id', userId)
                .single();

            if (profile) {
                profileId = profile.id;
            }

            const { error } = await (supabase as any)
                .from('user_companies')
                .update({
                    ...updates,
                    appointed_at: new Date().toISOString() // updated_at doesn't exist on user_companies in schema, using appointed_at as closest proxy or just skipping
                })
                .eq('user_id', profileId)
                .eq('company_id', companyId);

            if (error) {
                console.error('Error updating user role:', error);
                return false;
            }

            // مسح كاش الصلاحيات
            cachedUserPermissions.delete(`${userId}:${companyId}`);
            return true;
        } catch {
            return false;
        }
    },

    /**
     * إزالة مستخدم من شركة
     */
    async removeUserFromCompany(userId: string, companyId: string): Promise<boolean> {
        try {
            // First try to find profile by auth_user_id (V6 schema)
            let profileId = userId;
            const { data: profile } = await (supabase as any)
                .from('profiles')
                .select('id')
                .eq('auth_user_id', userId)
                .single();

            if (profile) {
                profileId = profile.id;
            }

            const { error } = await (supabase as any)
                .from('user_companies')
                .delete()
                .eq('user_id', profileId)
                .eq('company_id', companyId);

            return !error;
        } catch {
            return false;
        }
    },

    // =================== التحقق من الصلاحيات ===================

    /**
     * التحقق من صلاحية المستخدم الحالي
     */
    async checkPermission(requiredPermission: string): Promise<boolean> {
        try {
            const { data } = await supabase.auth.getUser();
            if (!data?.user) return false;

            const userRole = await this.getUserCompanyRole(data.user.id, await this.getDefaultCompanyId(data.user.id) || '');
            if (!userRole || !userRole.role) return false;

            return hasPermission(
                userRole.custom_permissions || [],
                userRole.role.permissions || [],
                requiredPermission
            );
        } catch {
            return false;
        }
    },

    /**
     * التحقق من عدة صلاحيات (أي واحدة منها)
     */
    async checkAnyPermission(permissions: string[]): Promise<boolean> {
        for (const perm of permissions) {
            if (await this.checkPermission(perm)) return true;
        }
        return false;
    },

    /**
     * التحقق من جميع الصلاحيات (يجب توفر الكل)
     */
    async checkAllPermissions(permissions: string[]): Promise<boolean> {
        for (const perm of permissions) {
            if (!(await this.checkPermission(perm))) return false;
        }
        return true;
    },

    // =================== دوال مساعدة ===================

    /**
     * الحصول على الشركة الافتراضية للمستخدم
     */
    async getDefaultCompanyId(userId: string): Promise<string | null> {
        try {
            // First try to find profile by auth_user_id (V6 schema)
            let profileId = userId;
            const { data: profile } = await (supabase as any)
                .from('profiles')
                .select('id')
                .eq('auth_user_id', userId)
                .single();

            if (profile) {
                profileId = profile.id;
            }

            const { data, error } = await (supabase as any)
                .from('user_companies')
                .select('company_id')
                .eq('user_id', profileId)
                .eq('is_default', true)
                .single();

            if (error) return null;
            return data?.company_id || null;
        } catch {
            return null;
        }
    },

    /**
     * تعيين الشركة الافتراضية
     */
    async setDefaultCompany(userId: string, companyId: string): Promise<boolean> {
        try {
            // First try to find profile by auth_user_id (V6 schema)
            let profileId = userId;
            const { data: profile } = await (supabase as any)
                .from('profiles')
                .select('id')
                .eq('auth_user_id', userId)
                .single();

            if (profile) {
                profileId = profile.id;
            }

            // إلغاء الافتراضي السابق
            await (supabase as any)
                .from('user_companies')
                .update({ is_default: false })
                .eq('user_id', profileId);

            // تعيين الجديد
            const { error } = await (supabase as any)
                .from('user_companies')
                .update({ is_default: true })
                .eq('user_id', profileId)
                .eq('company_id', companyId);

            return !error;
        } catch {
            return false;
        }
    },

    /**
     * مسح الكاش
     */
    clearCache() {
        cachedRoles = null;
        cachedUserPermissions.clear();
    }
};

export default rolesService;
