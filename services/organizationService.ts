/**
 * Organization Service - خدمة الشركة والمستخدمين
 * نظام مبسط: شركة واحدة مع مستخدمين
 */

import {
    Company,
    CompanyUser,
    CompanySettings,
    DEFAULT_COMPANY_SETTINGS,
    UserRole,
    // Legacy types for backward compatibility
    Organization,
    Branch,
    DEFAULT_DATA_SHARING,
    BranchInvitation
} from '../types/organization';
import { SafeStorage } from '../utils/storage';

const COMPANY_KEY = 'alzhra_company';
const USERS_KEY = 'alzhra_company_users';

// Legacy keys
const ORGANIZATION_KEY = 'alzhra_organization';
const BRANCHES_KEY = 'alzhra_branches';
const CURRENT_BRANCH_KEY = 'alzhra_current_branch';
const INVITATIONS_KEY = 'alzhra_invitations';

/**
 * توليد معرف فريد
 */
const generateId = (): string => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * خدمة الشركة
 */
export const OrganizationService = {
    // =================== الشركة ===================

    /**
     * إنشاء شركة جديدة
     */
    createCompany: (params: {
        name: string;
        nameEn?: string;
    }): Company => {
        const company: Company = {
            id: generateId(),
            name: params.name,
            nameEn: params.nameEn,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            settings: DEFAULT_COMPANY_SETTINGS
        };

        SafeStorage.set(COMPANY_KEY, company);
        return company;
    },

    /**
     * الحصول على الشركة
     */
    getCompany: (): Company | null => {
        return SafeStorage.get<Company | null>(COMPANY_KEY, null);
    },

    /**
     * تحديث الشركة
     */
    updateCompany: (updates: Partial<Company>): Company | null => {
        const company = OrganizationService.getCompany();
        if (!company) return null;

        const updated = { ...company, ...updates, updatedAt: new Date().toISOString() };
        SafeStorage.set(COMPANY_KEY, updated);
        return updated;
    },

    // =================== المستخدمين ===================

    /**
     * الحصول على جميع المستخدمين
     */
    getUsers: (): CompanyUser[] => {
        return SafeStorage.get<CompanyUser[]>(USERS_KEY, []);
    },

    /**
     * إضافة مستخدم
     */
    addUser: (params: {
        name: string;
        email?: string;
        phone?: string;
        role: UserRole;
    }): CompanyUser => {
        const users = OrganizationService.getUsers();

        const user: CompanyUser = {
            id: generateId(),
            name: params.name,
            email: params.email,
            phone: params.phone,
            role: params.role,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        users.push(user);
        SafeStorage.set(USERS_KEY, users);
        return user;
    },

    /**
     * تحديث مستخدم
     */
    updateUser: (id: string, updates: Partial<CompanyUser>): CompanyUser | null => {
        const users = OrganizationService.getUsers();
        const index = users.findIndex(u => u.id === id);

        if (index === -1) return null;

        users[index] = {
            ...users[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        SafeStorage.set(USERS_KEY, users);
        return users[index];
    },

    /**
     * حذف مستخدم
     */
    removeUser: (id: string): boolean => {
        const users = OrganizationService.getUsers();
        const filtered = users.filter(u => u.id !== id);

        if (filtered.length === users.length) return false;

        SafeStorage.set(USERS_KEY, filtered);
        return true;
    },

    /**
     * الحصول على مستخدم محدد
     */
    getUser: (id: string): CompanyUser | null => {
        return OrganizationService.getUsers().find(u => u.id === id) || null;
    },

    // =================== Legacy API للتوافق ===================

    /**
     * @deprecated استخدم getCompany بدلاً منها
     */
    getOrganization: (): Organization | null => {
        const company = OrganizationService.getCompany();
        if (!company) return null;

        // تحويل إلى الشكل القديم
        return {
            ...company,
            ownerId: 'default_owner',
            settings: {
                ...company.settings,
                allowBranchTransfers: false
            }
        } as unknown as Organization;
    },

    /**
     * @deprecated استخدم updateCompany بدلاً منها
     */
    updateOrganization: (updates: Partial<Organization>): Organization | null => {
        const result = OrganizationService.updateCompany(updates as Partial<Company>);
        if (!result) return null;
        return OrganizationService.getOrganization();
    },

    /**
     * @deprecated لم يعد هناك فروع
     */
    createOrganization: (params: { name: string; nameEn?: string; ownerId: string }): Organization => {
        const company = OrganizationService.createCompany(params);
        return OrganizationService.getOrganization()!;
    },

    /**
     * @deprecated لم يعد هناك فروع
     */
    getBranches: (): Branch[] => {
        // إرجاع فرع وهمي واحد للتوافق
        const company = OrganizationService.getCompany();
        if (!company) return [];

        return [{
            id: 'main_branch',
            organizationId: company.id,
            name: company.name,
            nameEn: company.nameEn,
            code: 'MAIN',
            address: company.address,
            phone: company.phone,
            email: company.email,
            isMain: true,
            isActive: true,
            createdAt: company.createdAt,
            updatedAt: company.updatedAt,
            dataSharing: DEFAULT_DATA_SHARING
        }];
    },

    /**
     * @deprecated لم يعد هناك فروع
     */
    getBranch: (id: string): Branch | null => {
        const branches = OrganizationService.getBranches();
        return branches[0] || null;
    },

    /**
     * @deprecated لم يعد هناك فروع
     */
    getCurrentBranch: (): Branch | null => {
        return OrganizationService.getBranches()[0] || null;
    },

    /**
     * @deprecated لم يعد هناك فروع
     */
    setCurrentBranch: (branchId: string): void => {
        // لا شيء للتنفيذ
    },

    /**
     * @deprecated لم يعد هناك فروع
     */
    createBranch: (params: any): Branch => {
        return OrganizationService.getBranches()[0]!;
    },

    /**
     * @deprecated لم يعد هناك فروع
     */
    updateBranch: (id: string, updates: any): Branch | null => {
        return OrganizationService.getBranches()[0] || null;
    },

    /**
     * @deprecated لم يعد هناك فروع
     */
    deleteBranch: (id: string): boolean => {
        return false;
    },

    /**
     * @deprecated لم يعد هناك دعوات
     */
    createInvitation: (params: any): BranchInvitation => {
        return {
            id: generateId(),
            branchId: 'main_branch',
            email: params.email,
            roleId: params.roleId,
            invitedBy: params.invitedBy,
            expiresAt: new Date().toISOString(),
            status: 'pending',
            createdAt: new Date().toISOString()
        };
    },

    /**
     * @deprecated لم يعد هناك دعوات
     */
    getInvitations: (): BranchInvitation[] => {
        return [];
    }
};
