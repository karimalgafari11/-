/**
 * Tenant Types - أنواع المستأجرين
 */

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    subscription_plan: 'free' | 'basic' | 'pro' | 'enterprise';
    subscription_expires_at?: string;
    settings: TenantSettings;
    created_at: string;
    updated_at: string;
}

export interface TenantSettings {
    theme?: 'light' | 'dark' | 'auto';
    locale?: string;
    timezone?: string;
    features?: string[];
    limits?: {
        max_users?: number;
        max_companies?: number;
        max_storage_mb?: number;
    };
}

export type TenantInsert = Omit<Tenant, 'id' | 'created_at' | 'updated_at'>;
export type TenantUpdate = Partial<TenantInsert>;
