/**
 * Organization Context - سياق الشركة
 * إدارة الشركة والمستخدمين بشكل مبسط
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Company, CompanyUser, UserRole, Branch, BranchDataSharing, Organization } from '../types/organization';
import { OrganizationService } from '../services/organizationService';

interface OrganizationContextValue {
    // الشركة
    company: Company | null;
    updateCompany: (updates: Partial<Company>) => void;

    // المستخدمين
    users: CompanyUser[];
    addUser: (params: { name: string; email?: string; phone?: string; role: UserRole }) => CompanyUser;
    updateUser: (id: string, updates: Partial<CompanyUser>) => void;
    removeUser: (id: string) => boolean;

    // Legacy API للتوافق
    organization: Organization | null;
    branches: Branch[];
    currentBranch: Branch | null;
    updateOrganization: (updates: Partial<Organization>) => void;
    addBranch: (params: { name: string; address?: string }) => Branch;
    updateBranch: (id: string, updates: Partial<Branch>) => void;
    deleteBranch: (id: string) => boolean;
    switchBranch: (branchId: string) => void;
    updateDataSharing: (branchId: string, settings: Partial<BranchDataSharing>) => void;

    // إعادة تحميل
    refresh: () => void;
}

const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [company, setCompany] = useState<Company | null>(null);
    const [users, setUsers] = useState<CompanyUser[]>([]);

    // تحميل البيانات
    const loadData = useCallback(() => {
        let comp = OrganizationService.getCompany();

        // إنشاء شركة افتراضية إذا لم تكن موجودة
        if (!comp) {
            comp = OrganizationService.createCompany({
                name: 'شركتي',
                nameEn: 'My Company'
            });
        }

        setCompany(comp);
        setUsers(OrganizationService.getUsers());
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // =================== الشركة ===================

    const updateCompany = useCallback((updates: Partial<Company>) => {
        const updated = OrganizationService.updateCompany(updates);
        if (updated) setCompany(updated);
    }, []);

    // =================== المستخدمين ===================

    const addUser = useCallback((params: { name: string; email?: string; phone?: string; role: UserRole }): CompanyUser => {
        const user = OrganizationService.addUser(params);
        setUsers(OrganizationService.getUsers());
        return user;
    }, []);

    const updateUser = useCallback((id: string, updates: Partial<CompanyUser>) => {
        OrganizationService.updateUser(id, updates);
        setUsers(OrganizationService.getUsers());
    }, []);

    const removeUser = useCallback((id: string): boolean => {
        const result = OrganizationService.removeUser(id);
        if (result) setUsers(OrganizationService.getUsers());
        return result;
    }, []);

    // =================== Legacy API ===================

    const organization = company as unknown as Organization | null;
    const branches = OrganizationService.getBranches();
    const currentBranch = branches[0] || null;

    const updateOrganization = useCallback((updates: Partial<Organization>) => {
        updateCompany(updates as Partial<Company>);
    }, [updateCompany]);

    const addBranch = useCallback((params: { name: string; address?: string }): Branch => {
        return branches[0]!;
    }, [branches]);

    const updateBranch = useCallback((id: string, updates: Partial<Branch>) => {
        // لا شيء للتنفيذ
    }, []);

    const deleteBranch = useCallback((id: string): boolean => {
        return false;
    }, []);

    const switchBranch = useCallback((branchId: string) => {
        // لا شيء للتنفيذ
    }, []);

    const updateDataSharing = useCallback((branchId: string, settings: Partial<BranchDataSharing>) => {
        // لا شيء للتنفيذ
    }, []);

    const value: OrganizationContextValue = {
        // New API
        company,
        updateCompany,
        users,
        addUser,
        updateUser,
        removeUser,

        // Legacy API
        organization,
        branches,
        currentBranch,
        updateOrganization,
        addBranch,
        updateBranch,
        deleteBranch,
        switchBranch,
        updateDataSharing,

        refresh: loadData
    };

    return (
        <OrganizationContext.Provider value={value}>
            {children}
        </OrganizationContext.Provider>
    );
};

export const useOrganization = () => {
    const context = useContext(OrganizationContext);
    if (!context) throw new Error('useOrganization must be used within OrganizationProvider');
    return context;
};
