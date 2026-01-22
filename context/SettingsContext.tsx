/**
 * Settings Context
 * سياق الإعدادات الشامل للتحكم في جميع إعدادات التطبيق
 * 
 * ⚠️ ملاحظة: تم تقسيم هذا الملف إلى ملفات أصغر في مجلد context/settings/
 * - defaults/ - القيم الافتراضية
 * - hooks/ - الـ Hooks المتخصصة
 * - types.ts - الأنواع
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import {
    Currency,
    ExchangeRateRecord,
    User
} from '../types/common';
import {
    Branch,
    InsertType,
    UpdateType
} from '../types/supabase-types';
import { FiscalYear } from '../types/accounting';
import {
    AppSettingsExtended,
    CompanyInfo,
    ThemeSettings,
    Webhook,
    WebhookEvent,
    Role,
    SYSTEM_MODULES,
    Permission,
    PermissionAction
} from '../types/settings-extended';

// استيراد القيم الافتراضية من المجلد الجديد
import {
    getDefaultSettings,
    getDefaultCompany
} from './settings/defaults';

// استيراد الأنواع من المجلد الجديد
import type { SettingsContextValue } from './settings/types';

import { logger } from '../lib/logger';
import { CurrencyService } from '../services/currencyService';
import { settingsApiService, loadCompanyFromSupabase, loadAllSettings, branchesApi, fiscalPeriodsApi, exchangeRatesApi } from '../services/settingsApiService';
import { useUser } from './app/UserContext';


// ===================== الواجهة =====================
// تم نقل SettingsContextValue إلى: context/settings/types.ts

// ===================== القيم الافتراضية =====================
// تم نقل جميع دوال getDefault* إلى: context/settings/defaults/
// - getDefaultCompany -> companyDefaults.ts
// - getDefaultCurrencySettings -> currencyDefaults.ts
// - getDefaultTaxSettings -> taxDefaults.ts
// - getDefaultInvoiceSettings -> invoiceDefaults.ts
// - getDefaultSalesSettings -> salesDefaults.ts
// - getDefaultPurchaseSettings -> purchaseDefaults.ts
// - getDefaultInventorySettings -> inventoryDefaults.ts
// - getDefaultProductSettings -> productDefaults.ts
// - getDefaultPrintSettings -> printDefaults.ts
// - getDefaultUserSettings -> userDefaults.ts
// - getDefaultIntegrations -> integrationDefaults.ts
// - getDefaultAISettings -> aiDefaults.ts
// - getDefaultWebhookSettings -> webhookDefaults.ts
// - getDefaultBackupSettings -> backupDefaults.ts
// - getDefaultSettings -> defaults/index.ts

// ===================== Context =====================
const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

// ===================== Provider =====================
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, currentCompany } = useUser();
    const [settings, setSettings] = useState<AppSettingsExtended>(getDefaultSettings);
    // Companies now managed via Supabase (fetched on load) - keeping local state for UI consistency momentarily
    const [companies, setCompanies] = useState<CompanyInfo[]>([getDefaultCompany()]);
    const [activeCompanyId, setActiveCompanyId] = useState<string>('default');

    // New States for Backend Data
    const [branches, setBranches] = useState<Branch[]>([]);
    const [fiscalPeriods, setFiscalPeriods] = useState<FiscalYear[]>([]);
    const [backendCurrencies, setBackendCurrencies] = useState<Currency[]>([]);

    const [isLoading, setIsLoading] = useState(false);

    // Load company from Supabase when user's companyId changes
    useEffect(() => {
        const loadCompany = async () => {
            if (!user?.companyId || user.companyId === 'default-company-id') {
                return;
            }

            const companyInfo = await loadCompanyFromSupabase(user.companyId);
            if (companyInfo) {
                console.log('✅ Loaded company from Supabase:', companyInfo.name);
                setCompanies([companyInfo]);
                setActiveCompanyId(companyInfo.id);
            }
        };

        loadCompany();
    }, [user?.companyId]);

    // Initial Data Fetch - Using settingsApiService
    const refreshData = useCallback(async () => {
        if (!settingsApiService.isValidUUID(activeCompanyId)) {
            return;
        }
        setIsLoading(true);
        try {
            const result = await loadAllSettings(activeCompanyId);
            if (result.success) {
                setBranches(result.data.branches);
                setFiscalPeriods(result.data.fiscalPeriods);

                // Update settings with backend data
                if (result.data.currencies.length > 0 || result.data.exchangeRates.length > 0) {
                    setSettings(prev => ({
                        ...prev,
                        currency: {
                            ...prev.currency,
                            currencies: result.data.currencies.length > 0
                                ? result.data.currencies as any
                                : prev.currency.currencies,
                            exchangeRates: result.data.exchangeRates.length > 0
                                ? result.data.exchangeRates
                                : prev.currency.exchangeRates
                        }
                    }));
                }
            }
        } catch (error: any) {
            if (process.env.NODE_ENV === 'development' && error?.name !== 'AbortError') {
                logger.debug('Settings refresh skipped due to backend issue');
            }
        } finally {
            setIsLoading(false);
        }
    }, [activeCompanyId]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    // حفظ الإعدادات عند التغيير
    useEffect(() => {
        logger.debug('Settings saved');
    }, [settings]);

    // الشركة النشطة
    const activeCompany = useMemo(() =>
        companies.find(c => c.id === activeCompanyId) || companies[0] || null
        , [companies, activeCompanyId]);

    // ===== إدارة الفروع - Using branchesApi =====
    const addBranch = useCallback(async (branch: InsertType<Branch>) => {
        try {
            const newBranch = await branchesApi.add(branch);
            setBranches(prev => [...prev, newBranch]);
        } catch (error) {
            logger.error('Failed to add branch', error as Error);
            throw error;
        }
    }, []);

    const updateBranch = useCallback(async (id: string, branch: UpdateType<Branch>) => {
        try {
            const updated = await branchesApi.update(id, branch);
            setBranches(prev => prev.map(b => b.id === id ? updated : b));
        } catch (error) {
            logger.error('Failed to update branch', error as Error);
            throw error;
        }
    }, []);

    const deleteBranch = useCallback(async (id: string) => {
        try {
            await branchesApi.delete(id);
            setBranches(prev => prev.filter(b => b.id !== id));
        } catch (error) {
            logger.error('Failed to delete branch', error as Error);
            throw error;
        }
    }, []);

    // ===== الفترات المالية - Using fiscalPeriodsApi =====
    const addFiscalPeriod = useCallback(async (period: InsertType<FiscalYear>) => {
        try {
            const newYear = await fiscalPeriodsApi.add(period);
            if (newYear) setFiscalPeriods(prev => [...prev, newYear]);
        } catch (error) {
            logger.error('Failed to add fiscal period', error as Error);
            throw error;
        }
    }, []);

    const updateFiscalPeriod = useCallback(async (id: string, period: UpdateType<FiscalYear>) => {
        try {
            const updated = await fiscalPeriodsApi.update(id, period);
            if (updated) setFiscalPeriods(prev => prev.map(y => y.id === id ? updated : y));
        } catch (error) {
            logger.error('Failed to update fiscal period', error as Error);
            throw error;
        }
    }, []);

    const closeFiscalPeriod = useCallback(async (id: string) => {
        try {
            const success = await fiscalPeriodsApi.delete(id);
            if (success) setFiscalPeriods(prev => prev.filter(y => y.id !== id));
        } catch (error) {
            logger.error('Failed to close fiscal period', error as Error);
            throw error;
        }
    }, []);

    // ===== إدارة الشركات (Keep Local wrapper primarily or sync?) =====
    const addCompany = useCallback((company: Omit<CompanyInfo, 'id' | 'createdAt'>) => {
        const newCompany: CompanyInfo = {
            ...company,
            id: `company_${Date.now()}`,
            createdAt: new Date().toISOString()
        };
        setCompanies(prev => [...prev, newCompany]);
        logger.info('Company added', { companyId: newCompany.id });
    }, []);

    const updateCompany = useCallback(async (company: CompanyInfo) => {
        // حفظ في Supabase using settingsApiService
        try {
            await settingsApiService.updateCompany(company);
            logger.info('Company saved to Supabase', { companyId: company.id });
        } catch (error) {
            logger.error('Failed to save company to Supabase');
        }

        // تحديث الحالة المحلية
        setCompanies(prev => prev.map(c => c.id === company.id ? { ...company, updatedAt: new Date().toISOString() } : c));
        logger.info('Company updated', { companyId: company.id });
    }, []);

    const deleteCompany = useCallback((id: string) => {
        if (companies.length <= 1) {
            logger.warn('Cannot delete last company');
            return;
        }
        setCompanies(prev => prev.filter(c => c.id !== id));
        if (activeCompanyId === id) {
            setActiveCompanyId(companies[0]?.id || 'default');
        }
        logger.info('Company deleted', { companyId: id });
    }, [companies, activeCompanyId]);

    const switchCompany = useCallback((id: string) => {
        if (companies.find(c => c.id === id)) {
            setActiveCompanyId(id);
            logger.info('Company switched', { companyId: id });
        }
    }, [companies]);

    // ===== إدارة العملات =====
    const currencies = settings.currency.currencies; // We can use derived state or setting state

    const addCurrency = useCallback(async (currency: Omit<Currency, 'createdAt'>) => {
        try {
            // Note: Creating a currency globally? Or just enabling?
            // Assuming we add to system for now via service if admin
            // const newCurrency = await CurrencyService.addCurrency(currency);

            // For now update local state to reflect UI change immediately
            const newCurrency: Currency = {
                ...currency,
                createdAt: new Date().toISOString()
            };
            setSettings(prev => ({
                ...prev,
                currency: {
                    ...prev.currency,
                    currencies: [...prev.currency.currencies, newCurrency]
                }
            }));
            logger.info('Currency added locally (Service integration pending admin role)', { code: currency.code });
        } catch (error) {
            throw error;
        }
    }, []);

    const updateCurrency = useCallback(async (currency: Currency) => {
        // Update local
        setSettings(prev => ({
            ...prev,
            currency: {
                ...prev.currency,
                currencies: prev.currency.currencies.map(c =>
                    c.code === currency.code ? currency : c
                )
            }
        }));
    }, []);

    const deleteCurrency = useCallback(async (code: string) => {
        if (settings.currency.defaultCurrency === code) {
            logger.warn('Cannot delete default currency');
            return;
        }
        setSettings(prev => ({
            ...prev,
            currency: {
                ...prev.currency,
                currencies: prev.currency.currencies.filter(c => c.code !== code)
            }
        }));
        logger.info('Currency deleted', { code });
    }, [settings.currency.defaultCurrency]);

    const setDefaultCurrency = useCallback((code: string) => {
        setSettings(prev => ({
            ...prev,
            currency: {
                ...prev.currency,
                defaultCurrency: code,
                currencies: prev.currency.currencies.map(c => ({
                    ...c,
                    isDefault: c.code === code
                }))
            }
        }));
        logger.info('Default currency changed', { code });
    }, []);

    const getCurrency = useCallback((code: string) => {
        return currencies.find(c => c.code === code);
    }, [currencies]);

    // ===== أسعار الصرف (Updated to use Service) =====
    const exchangeRates = settings.currency.exchangeRates;

    const addExchangeRate = useCallback(async (rate: Omit<ExchangeRateRecord, 'id' | 'createdAt'>) => {
        try {
            // التحقق من أن معرف الشركة صالح (UUID)
            const isValidUUID = activeCompanyId &&
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(activeCompanyId);

            if (!isValidUUID) {
                console.warn('Cannot save exchange rate: Invalid Company ID', activeCompanyId);
                // يمكن إضافة إشعار للمستخدم هنا إذا كان هناك NotificationContext
                // سنقوم بالتحديث المحلي فقط للاستخدام المؤقت
            } else {
                // 1. Call Service (Only if valid company)
                await CurrencyService.setExchangeRate({
                    company_id: activeCompanyId,
                    from_currency: rate.fromCurrency,
                    to_currency: rate.toCurrency,
                    rate: rate.rate,
                    valid_from: rate.date
                } as any);
                logger.info('Exchange rate saved to backend');
            }

            // 2. Update Local State (Optimistic or always)
            const newRate: ExchangeRateRecord = {
                ...rate,
                id: `rate_${Date.now()}`,
                createdAt: new Date().toISOString()
            };
            setSettings(prev => ({
                ...prev,
                currency: {
                    ...prev.currency,
                    exchangeRates: [newRate, ...prev.currency.exchangeRates],
                    lastUpdate: new Date().toISOString()
                }
            }));
            logger.info('Exchange rate added locally', { from: rate.fromCurrency, to: rate.toCurrency, rate: rate.rate });
        } catch (e) {
            console.error('Failed to add exchange rate:', e);
            // Revert or show error? For now just log.
        }
    }, [activeCompanyId]);

    const getExchangeRate = useCallback((from: string, to: string, date?: string): number => {
        if (from === to) return 1;
        // Fallback to local logic if service calc is needed locally
        const rates = exchangeRates
            .filter(r =>
                (r.fromCurrency === from && r.toCurrency === to) ||
                (r.fromCurrency === to && r.toCurrency === from)
            )
            .filter(r => !date || r.date <= date)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (rates.length === 0) return 1;

        const rate = rates[0];
        if (rate.fromCurrency === from && rate.toCurrency === to) {
            return rate.rate;
        } else {
            return 1 / rate.rate;
        }
    }, [exchangeRates]);

    const getExchangeHistory = useCallback((from: string, to: string, limit = 30) => {
        return exchangeRates
            .filter(r =>
                (r.fromCurrency === from && r.toCurrency === to) ||
                (r.fromCurrency === to && r.toCurrency === from)
            )
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, limit);
    }, [exchangeRates]);

    const convertAmount = useCallback((amount: number, from: string, to: string, date?: string): number => {
        const rate = getExchangeRate(from, to, date);
        return amount * rate;
    }, [getExchangeRate]);

    const formatCurrency = useCallback((amount: number, currencyCode?: string): string => {
        const code = currencyCode || settings.currency.defaultCurrency;
        const currency = getCurrency(code);

        if (!currency) {
            return amount.toLocaleString('ar-SA');
        }

        const formatted = amount.toLocaleString('ar-SA', {
            minimumFractionDigits: currency.decimalPlaces,
            maximumFractionDigits: currency.decimalPlaces
        });

        return currency.position === 'before'
            ? `${currency.symbol}${formatted}`
            : `${formatted} ${currency.symbol}`;
    }, [settings.currency.defaultCurrency, getCurrency]);

    // ===== الصلاحيات =====
    const roles = settings.users.roles;

    const getDefaultPermissions = useCallback((): Permission[] => {
        return SYSTEM_MODULES.map(module => ({
            module: module.id,
            moduleNameAr: module.nameAr,
            moduleNameEn: module.nameEn,
            actions: {
                view: false,
                create: false,
                edit: false,
                delete: false,
                export: false,
                approve: false,
                print: false
            }
        }));
    }, []);

    const addRole = useCallback((role: Omit<Role, 'id' | 'createdAt'>) => {
        const newRole: Role = {
            ...role,
            id: `role_${Date.now()}`,
            createdAt: new Date().toISOString()
        };
        setSettings(prev => ({
            ...prev,
            users: {
                ...prev.users,
                roles: [...prev.users.roles, newRole]
            }
        }));
        logger.info('Role added', { roleId: newRole.id, name: role.name });
    }, []);

    const updateRole = useCallback((role: Role) => {
        setSettings(prev => ({
            ...prev,
            users: {
                ...prev.users,
                roles: prev.users.roles.map(r =>
                    r.id === role.id ? { ...role, updatedAt: new Date().toISOString() } : r
                )
            }
        }));
    }, []);

    const deleteRole = useCallback((id: string) => {
        const role = roles.find(r => r.id === id);
        if (role?.isSystem) {
            logger.warn('Cannot delete system role');
            return;
        }
        setSettings(prev => ({
            ...prev,
            users: {
                ...prev.users,
                roles: prev.users.roles.filter(r => r.id !== id)
            }
        }));
        logger.info('Role deleted', { roleId: id });
    }, [roles]);

    const hasPermission = useCallback((module: string, action: PermissionAction): boolean => {
        // In a real app, this would check the current user's role from AuthContext
        // For now, we assume 'admin' access
        const userRole = 'admin';

        if (userRole === 'admin') return true;

        const role = roles.find(r => r.id === userRole || r.nameEn.toLowerCase() === userRole);
        if (!role) return false;

        const permission = role.permissions.find(p => p.module === module);
        return permission?.actions[action] || false;
    }, [roles]);

    // ===== Webhooks =====
    const webhooks = settings.webhooks.webhooks;

    const addWebhook = useCallback((webhook: Omit<Webhook, 'id' | 'createdAt' | 'successCount' | 'failureCount'>) => {
        const newWebhook: Webhook = {
            ...webhook,
            id: `wh_${Date.now()}`,
            successCount: 0,
            failureCount: 0,
            createdAt: new Date().toISOString()
        };
        setSettings(prev => ({
            ...prev,
            webhooks: {
                ...prev.webhooks,
                webhooks: [...prev.webhooks.webhooks, newWebhook]
            }
        }));
        logger.info('Webhook added', { webhookId: newWebhook.id, url: webhook.url });
    }, []);

    const updateWebhook = useCallback((webhook: Webhook) => {
        setSettings(prev => ({
            ...prev,
            webhooks: {
                ...prev.webhooks,
                webhooks: prev.webhooks.webhooks.map(w =>
                    w.id === webhook.id ? { ...webhook, updatedAt: new Date().toISOString() } : w
                )
            }
        }));
    }, []);

    const deleteWebhook = useCallback((id: string) => {
        setSettings(prev => ({
            ...prev,
            webhooks: {
                ...prev.webhooks,
                webhooks: prev.webhooks.webhooks.filter(w => w.id !== id)
            }
        }));
        logger.info('Webhook deleted', { webhookId: id });
    }, []);

    const triggerWebhook = useCallback(async (event: WebhookEvent, data: any) => {
        const activeWebhooks = webhooks.filter(w => w.isActive && w.events.includes(event));

        for (const webhook of activeWebhooks) {
            try {
                const response = await fetch(webhook.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(webhook.secret && { 'X-Webhook-Secret': webhook.secret }),
                        ...webhook.headers
                    },
                    body: JSON.stringify({ event, data, timestamp: new Date().toISOString() })
                });

                updateWebhook({
                    ...webhook,
                    lastTriggered: new Date().toISOString(),
                    lastStatus: response.ok ? 'success' : 'failed',
                    successCount: response.ok ? webhook.successCount + 1 : webhook.successCount,
                    failureCount: !response.ok ? webhook.failureCount + 1 : webhook.failureCount
                });

                logger.info('Webhook triggered', { webhookId: webhook.id, event, success: response.ok });
            } catch (error) {
                updateWebhook({
                    ...webhook,
                    lastTriggered: new Date().toISOString(),
                    lastStatus: 'failed',
                    lastError: (error as Error).message,
                    failureCount: webhook.failureCount + 1
                });
                logger.error('Webhook failed', error as Error, { webhookId: webhook.id });
            }
        }
    }, [webhooks, updateWebhook]);

    const testWebhook = useCallback(async (id: string): Promise<boolean> => {
        const webhook = webhooks.find(w => w.id === id);
        if (!webhook) return false;

        try {
            const response = await fetch(webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(webhook.secret && { 'X-Webhook-Secret': webhook.secret }),
                    ...webhook.headers
                },
                body: JSON.stringify({
                    event: 'test',
                    data: { message: 'Test webhook from Alzhra' },
                    timestamp: new Date().toISOString()
                })
            });
            return response.ok;
        } catch {
            return false;
        }
    }, [webhooks]);

    // ===== التحديثات العامة =====
    const updateSettings = useCallback(<K extends keyof AppSettingsExtended>(
        section: K,
        values: Partial<AppSettingsExtended[K]>
    ) => {
        setSettings(prev => ({
            ...prev,
            [section]: { ...prev[section] as object, ...values },
            lastUpdated: new Date().toISOString()
        }));
        logger.debug('Settings updated', { section });
    }, []);

    const updateTheme = useCallback((theme: Partial<ThemeSettings>) => {
        setSettings(prev => ({
            ...prev,
            theme: { ...prev.theme, ...theme },
            lastUpdated: new Date().toISOString()
        }));
    }, []);

    const resetSettings = useCallback((section?: keyof AppSettingsExtended) => {
        if (section) {
            const defaults = getDefaultSettings();
            setSettings(prev => ({
                ...prev,
                [section]: defaults[section],
                lastUpdated: new Date().toISOString()
            }));
        } else {
            setSettings(getDefaultSettings());
        }
        logger.info('Settings reset', { section });
    }, []);

    // ===== التصدير والاستيراد =====
    const exportSettings = useCallback(() => {
        return JSON.stringify(settings, null, 2);
    }, [settings]);

    const importSettings = useCallback((json: string): boolean => {
        try {
            const imported = JSON.parse(json) as AppSettingsExtended;
            setSettings({
                ...imported,
                lastUpdated: new Date().toISOString()
            });
            return true;
        } catch (error) {
            logger.error('Failed to import settings', error as Error);
            return false;
        }
    }, []);

    const exportAllData = useCallback(async (): Promise<Blob> => {
        const data = {
            settings,
            companies,
            exportedAt: new Date().toISOString(),
            version: settings.version
        };
        return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    }, [settings, companies]);

    const importAllData = useCallback(async (file: File): Promise<boolean> => {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            if (data.settings) setSettings(data.settings);
            if (data.companies) setCompanies(data.companies);
            return true;
        } catch (error) {
            logger.error('Failed to import data', error as Error);
            return false;
        }
    }, []);

    // ===== تطبيق الثيم =====
    const applyTheme = useCallback(() => {
        const { theme } = settings;
        const root = document.documentElement;

        // تطبيق الألوان
        root.style.setProperty('--color-primary', theme.colors.primary);
        root.style.setProperty('--color-secondary', theme.colors.secondary);
        root.style.setProperty('--color-accent', theme.colors.accent);
        root.style.setProperty('--color-success', theme.colors.success);
        root.style.setProperty('--color-warning', theme.colors.warning);
        root.style.setProperty('--color-error', theme.colors.error);
        root.style.setProperty('--color-info', theme.colors.info);

        // تطبيق الخطوط
        root.style.setProperty('--font-family-ar', theme.fonts.familyAr);
        root.style.setProperty('--font-family-en', theme.fonts.familyEn);
        root.style.setProperty('--font-size-base', `${theme.fonts.sizeBase}px`);

        // تطبيق الحدود
        root.style.setProperty('--border-radius', `${theme.borders.radius}px`);
        root.style.setProperty('--border-radius-lg', `${theme.borders.radiusLarge}px`);

        logger.debug('Theme applied');
    }, [settings]);

    // تطبيق الثيم عند التغيير
    useEffect(() => {
        applyTheme();
    }, [settings.theme, applyTheme]);

    // القيمة
    const value: SettingsContextValue = {
        settings,
        isLoading,

        // الشركات
        companies,
        activeCompany,
        addCompany,
        updateCompany,
        deleteCompany,
        switchCompany,

        // الفروع
        branches,
        addBranch,
        updateBranch,
        deleteBranch,

        // الفترات المالية
        fiscalPeriods,
        addFiscalPeriod,
        updateFiscalPeriod,
        closeFiscalPeriod,

        // العملات
        currencies,
        addCurrency,
        updateCurrency,
        deleteCurrency,
        setDefaultCurrency,
        getCurrency,

        // أسعار الصرف
        exchangeRates,
        addExchangeRate,
        getExchangeRate,
        getExchangeHistory,
        convertAmount,
        formatCurrency,

        // الصلاحيات
        roles,
        addRole,
        updateRole,
        deleteRole,
        hasPermission,
        getDefaultPermissions,

        // Webhooks
        webhooks,
        addWebhook,
        updateWebhook,
        deleteWebhook,
        triggerWebhook,
        testWebhook,

        // عام
        updateSettings,
        updateTheme,
        resetSettings,
        exportSettings,
        importSettings,
        exportAllData,
        importAllData,
        applyTheme,
        refreshData
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

// ===================== Hook =====
export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
};

export default SettingsContext;
