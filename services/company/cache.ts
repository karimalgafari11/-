/**
 * Company Cache - كاش بيانات الشركة
 */

import { CompanyData, UserProfile } from './types';

// كاش للشركة الحالية
let currentCompany: CompanyData | null = null;
let currentProfile: UserProfile | null = null;

/**
 * الحصول على الشركة المخزنة في الكاش
 */
export function getCachedCompany(): CompanyData | null {
    return currentCompany;
}

/**
 * تعيين الشركة في الكاش
 */
export function setCachedCompany(company: CompanyData | null): void {
    currentCompany = company;
}

/**
 * الحصول على الملف الشخصي المخزن في الكاش
 */
export function getCachedProfile(): UserProfile | null {
    return currentProfile;
}

/**
 * تعيين الملف الشخصي في الكاش
 */
export function setCachedProfile(profile: UserProfile | null): void {
    currentProfile = profile;
}

/**
 * مسح الكاش
 */
export function clearCache(): void {
    currentCompany = null;
    currentProfile = null;
}
