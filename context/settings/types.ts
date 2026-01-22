/**
 * Settings Context Types - أنواع سياق الإعدادات
 */

import {
    AppSettingsExtended,
    CompanyInfo,
    ThemeSettings,
    Role,
    Webhook,
    WebhookEvent,
    Permission,
    PermissionAction
} from '../../types/settings-extended';
import { Currency, ExchangeRateRecord } from '../../types/common';
import { Branch, InsertType, UpdateType } from '../../types/supabase-types';
import { FiscalYear } from '../../types/accounting';

/**
 * واجهة قيمة سياق الإعدادات
 */
export interface SettingsContextValue {
    settings: AppSettingsExtended;
    isLoading: boolean;

    // ===== الشركات =====
    companies: CompanyInfo[];
    activeCompany: CompanyInfo | null;
    addCompany: (company: Omit<CompanyInfo, 'id' | 'createdAt'>) => void;
    updateCompany: (company: CompanyInfo) => void;
    deleteCompany: (id: string) => void;
    switchCompany: (id: string) => void;

    // ===== الفروع =====
    branches: Branch[];
    addBranch: (branch: InsertType<Branch>) => Promise<void>;
    updateBranch: (id: string, branch: UpdateType<Branch>) => Promise<void>;
    deleteBranch: (id: string) => Promise<void>;

    // ===== الفترات المالية =====
    fiscalPeriods: FiscalYear[];
    addFiscalPeriod: (period: InsertType<FiscalYear>) => Promise<void>;
    updateFiscalPeriod: (id: string, period: UpdateType<FiscalYear>) => Promise<void>;
    closeFiscalPeriod: (id: string) => Promise<void>;

    // ===== العملات =====
    currencies: Currency[];
    addCurrency: (currency: Omit<Currency, 'createdAt'>) => Promise<void>;
    updateCurrency: (currency: Currency) => Promise<void>;
    deleteCurrency: (code: string) => Promise<void>;
    setDefaultCurrency: (code: string) => void;
    getCurrency: (code: string) => Currency | undefined;

    // ===== أسعار الصرف =====
    exchangeRates: ExchangeRateRecord[];
    addExchangeRate: (rate: Omit<ExchangeRateRecord, 'id' | 'createdAt'>) => Promise<void>;
    getExchangeRate: (from: string, to: string, date?: string) => number;
    getExchangeHistory: (from: string, to: string, limit?: number) => ExchangeRateRecord[];
    convertAmount: (amount: number, from: string, to: string, date?: string) => number;
    formatCurrency: (amount: number, currencyCode?: string) => string;

    // ===== الصلاحيات =====
    roles: Role[];
    addRole: (role: Omit<Role, 'id' | 'createdAt'>) => void;
    updateRole: (role: Role) => void;
    deleteRole: (id: string) => void;
    hasPermission: (module: string, action: PermissionAction) => boolean;
    getDefaultPermissions: () => Permission[];

    // ===== Webhooks =====
    webhooks: Webhook[];
    addWebhook: (webhook: Omit<Webhook, 'id' | 'createdAt' | 'successCount' | 'failureCount'>) => void;
    updateWebhook: (webhook: Webhook) => void;
    deleteWebhook: (id: string) => void;
    triggerWebhook: (event: WebhookEvent, data: Record<string, unknown>) => Promise<void>;
    testWebhook: (id: string) => Promise<boolean>;

    // ===== التحديثات العامة =====
    updateSettings: <K extends keyof AppSettingsExtended>(
        section: K,
        values: Partial<AppSettingsExtended[K]>
    ) => void;
    updateTheme: (theme: Partial<ThemeSettings>) => void;
    resetSettings: (section?: keyof AppSettingsExtended) => void;

    // ===== التصدير والاستيراد =====
    exportSettings: () => string;
    importSettings: (json: string) => boolean;
    exportAllData: () => Promise<Blob>;
    importAllData: (file: File) => Promise<boolean>;

    // ===== الثيم =====
    applyTheme: () => void;
    refreshData: () => Promise<void>;
}
