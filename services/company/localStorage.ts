/**
 * Company Local Storage - التخزين المحلي للشركات
 */

import { CompanyData } from './types';

// مفاتيح التخزين المحلي
export const COMPANIES_KEY = 'alzhra_local_companies';
export const CURRENT_COMPANY_KEY = 'alzhra_current_company_id';

/**
 * الحصول على الشركات من التخزين المحلي
 */
export function getLocalCompanies(): CompanyData[] {
    try {
        const stored = localStorage.getItem(COMPANIES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

/**
 * حفظ الشركات في التخزين المحلي
 */
export function saveLocalCompanies(companies: CompanyData[]): void {
    localStorage.setItem(COMPANIES_KEY, JSON.stringify(companies));
}

/**
 * الحصول على معرف الشركة الحالية من التخزين المحلي
 */
export function getCurrentCompanyId(): string | null {
    return localStorage.getItem(CURRENT_COMPANY_KEY);
}

/**
 * حفظ معرف الشركة الحالية
 */
export function setCurrentCompanyId(companyId: string): void {
    localStorage.setItem(CURRENT_COMPANY_KEY, companyId);
}

/**
 * مسح معرف الشركة الحالية
 */
export function clearCurrentCompanyId(): void {
    localStorage.removeItem(CURRENT_COMPANY_KEY);
}

/**
 * حذف شركة من التخزين المحلي
 */
export function deleteLocalCompany(companyId: string): void {
    const companies = getLocalCompanies();
    const filtered = companies.filter(c => c.id !== companyId);
    saveLocalCompanies(filtered);
}

/**
 * تحديث شركة في التخزين المحلي
 */
export function updateLocalCompany(companyId: string, updates: Partial<CompanyData>): CompanyData | null {
    const companies = getLocalCompanies();
    const index = companies.findIndex(c => c.id === companyId);

    if (index === -1) return null;

    companies[index] = { ...companies[index], ...updates };
    saveLocalCompanies(companies);

    return companies[index];
}

/**
 * إضافة شركة جديدة للتخزين المحلي
 */
export function addLocalCompany(company: CompanyData): void {
    const companies = getLocalCompanies();
    companies.push(company);
    saveLocalCompanies(companies);
}
