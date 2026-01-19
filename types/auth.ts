/**
 * Auth Types - أنواع المصادقة (مبسط)
 * النظام المبسط لا يحتاج مصادقة متقدمة
 */

import { Company, CompanyUser, UserRole } from './organization';

// المستخدم المصادق (مبسط)
export interface AuthUser {
    id: string;
    companyId: string;
    email?: string;
    name: string;
    avatar?: string;
    phone?: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    lastLoginAt?: string;
}

// جلسة المستخدم الحالية (مبسط)
export interface UserSession {
    user: AuthUser;
    company: Company;
    accessToken?: string;
    expiresAt?: string;
}

// بيانات تسجيل الدخول
export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}

// بيانات التسجيل
export interface RegisterData {
    email: string;
    password: string;
    name: string;
    phone?: string;
    companyName: string;
}

// حالة المصادقة
export type AuthStatus =
    | 'loading'
    | 'authenticated'
    | 'unauthenticated'
    | 'error';

// خطأ المصادقة
export interface AuthError {
    code: string;
    message: string;
    field?: string;
}

// ==========================================
// Legacy exports for backward compatibility
// ==========================================

import { Branch, Organization } from './organization';
import { OrganizationMember } from './permissions';

export interface LegacyUserSession {
    user: AuthUser;
    membership: OrganizationMember;
    organization: Organization;
    currentBranch: Branch;
    availableBranches: Branch[];
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: string;
}

export interface JoinOrganizationData {
    invitationCode: string;
    email: string;
    password: string;
    name: string;
}
