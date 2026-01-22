/**
 * Company Mappers - دوال التحويل
 */

import { CompanyData, DEFAULT_COMPANY_SETTINGS } from './types';

/**
 * تحويل بيانات Supabase للنوع المحلي
 */
export function mapSupabaseCompany(data: any): CompanyData {
    return {
        id: data.id,
        name: data.name || 'شركتي',
        name_en: data.name_en,
        phone: data.phone,
        email: data.email,
        address: data.address,
        logo: data.logo,
        tax_number: data.tax_number,
        commercial_register: data.commercial_register,
        owner_id: data.owner_id || '',
        is_active: data.is_active ?? true,
        settings: data.settings || DEFAULT_COMPANY_SETTINGS,
        created_at: data.created_at,
        updated_at: data.updated_at
    };
}

/**
 * تحويل بيانات الشركة لصيغة Supabase
 */
export function mapToSupabase(data: Partial<CompanyData>): Record<string, any> {
    const result: Record<string, any> = {};

    if (data.name !== undefined) result.name = data.name;
    if (data.name_en !== undefined) result.name_en = data.name_en;
    if (data.phone !== undefined) result.phone = data.phone;
    if (data.email !== undefined) result.email = data.email;
    if (data.address !== undefined) result.address = data.address;
    if (data.logo !== undefined) result.logo = data.logo;
    if (data.tax_number !== undefined) result.tax_number = data.tax_number;
    if (data.commercial_register !== undefined) result.commercial_register = data.commercial_register;
    if (data.is_active !== undefined) result.is_active = data.is_active;
    if (data.settings !== undefined) result.settings = data.settings;

    return result;
}
