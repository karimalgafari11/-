/**
 * Settings Context
 * سياق الإعدادات الشامل للتحكم في جميع إعدادات التطبيق
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import {
    Currency,
    ExchangeRateRecord,
    DEFAULT_CURRENCIES,
    User
} from '../types/common';
import {
    Branch,
    FiscalPeriod,
    InsertType,
    UpdateType
} from '../types/supabase-types';
import {
    AppSettingsExtended,
    CompanyInfo,
    CurrencySettings,
    TaxSettings,
    InvoiceSettings,
    SalesSettings,
    PurchaseSettings,
    InventorySettings,
    ProductSettings,
    ThemeSettings,
    PrintSettings,
    UserSettings,
    IntegrationSettings,
    AISettings,
    WebhookSettings,
    Webhook,
    WebhookEvent,
    Role,
    DEFAULT_THEME_SETTINGS,
    DEFAULT_ROLES,
    SYSTEM_MODULES,
    Permission,
    PermissionAction
} from '../types/settings-extended';
import { SafeStorage } from '../utils/storage';
import { logger } from '../lib/logger';
import { CurrencyService } from '../services/currencyService';
import { BranchService } from '../services/branchService';
import { FiscalPeriodService } from '../services/fiscalPeriodService';
import { NotificationService } from '../services/notificationService'; // Optional if needed here

// ===================== الواجهة =====================
interface SettingsContextValue {
    settings: AppSettingsExtended;
    isLoading: boolean;

    // ===== الشركات =====
    companies: CompanyInfo[];
    activeCompany: CompanyInfo | null;
    addCompany: (company: Omit<CompanyInfo, 'id' | 'createdAt'>) => void;
    updateCompany: (company: CompanyInfo) => void;
    deleteCompany: (id: string) => void;
    switchCompany: (id: string) => void;

    // ===== الفروع (جديد) =====
    branches: Branch[];
    addBranch: (branch: InsertType<Branch>) => Promise<void>;
    updateBranch: (id: string, branch: UpdateType<Branch>) => Promise<void>;
    deleteBranch: (id: string) => Promise<void>;

    // ===== الفترات المالية (جديد) =====
    fiscalPeriods: FiscalPeriod[];
    addFiscalPeriod: (period: InsertType<FiscalPeriod>) => Promise<void>;
    updateFiscalPeriod: (id: string, period: UpdateType<FiscalPeriod>) => Promise<void>;
    closeFiscalPeriod: (id: string) => Promise<void>;

    // ===== العملات =====
    currencies: Currency[];
    addCurrency: (currency: Omit<Currency, 'createdAt'>) => Promise<void>;
    updateCurrency: (currency: Currency) => Promise<void>;
    deleteCurrency: (code: string) => Promise<void>;
    setDefaultCurrency: (code: string) => void;
    getCurrency: (code: string) => Currency | undefined;

    // ===== أسعار الصرف =====
    exchangeRates: ExchangeRateRecord[]; // Keeping compatible type for now
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
    refreshData: () => Promise<void>; // To manually trigger fetch
}

// ===================== القيم الافتراضية =====================
const getDefaultCompany = (): CompanyInfo => ({
    id: '',
    name: '',
    nameEn: '',
    address: '',
    phone: '',
    baseCurrency: 'SAR',
    fiscalYearStart: '01-01',
    createdAt: new Date().toISOString()
});

const getDefaultCurrencySettings = (): CurrencySettings => ({
    currencies: DEFAULT_CURRENCIES,
    defaultCurrency: 'SAR',
    exchangeRates: [],
    lastUpdate: new Date().toISOString()
});

const getDefaultTaxSettings = (): TaxSettings => ({
    enabled: true,
    defaultRate: 0,
    includedInPrice: false,
    taxName: 'ضريبة القيمة المضافة',
    taxNameEn: 'VAT',
    customRates: [],
    showOnInvoice: true
});

const getDefaultInvoiceSettings = (): InvoiceSettings => ({
    salesPrefix: 'INV-',
    salesNextNumber: 1,
    purchasePrefix: 'PO-',
    purchaseNextNumber: 1,
    returnPrefix: 'RET-',
    returnNextNumber: 1,
    quotePrefix: 'QT-',
    quoteNextNumber: 1,
    showLogo: true,
    logoSize: 'medium',
    showQRCode: true,
    showBarcode: false,
    showNotes: true,
    showPaymentTerms: true,
    showSignature: false,
    defaultDueDays: 30,
    template: 'modern',
    showBankDetails: false
});

const getDefaultSalesSettings = (): SalesSettings => ({
    allowNegativeStock: false,
    requireCustomer: false,
    defaultPaymentMethod: 'cash',
    autoGenerateInvoice: true,
    allowDiscount: true,
    maxDiscountPercent: 100,
    roundTotal: false,
    roundMethod: 'nearest',
    roundTo: 1,
    notifyOnLowStock: true,
    lowStockThreshold: 10,
    notifyOnSale: false
});

const getDefaultPurchaseSettings = (): PurchaseSettings => ({
    requireSupplier: true,
    requirePurchaseOrder: false,
    autoUpdateCost: true,
    costUpdateMethod: 'average',
    defaultPaymentTerms: 30,
    notifyOnArrival: false,
    autoReceive: false
});

const getDefaultInventorySettings = (): InventorySettings => ({
    trackByWarehouse: true,
    trackBatches: false,
    trackExpiry: false,
    trackSerialNumbers: false,
    reorderLevel: 10,
    autoReorder: false,
    valuationMethod: 'average',
    allowNegativeStock: false,
    requireCountApproval: false,
    allowAdjustments: true,
    adjustmentRequiresApproval: false,
    requireTransferApproval: false,
    autoReceiveTransfers: true
});

const getDefaultProductSettings = (): ProductSettings => ({
    requireSKU: false,
    autoGenerateSKU: true,
    skuPrefix: 'SKU-',
    skuFormat: 'numeric',
    skuLength: 6,
    requireCategory: false,
    allowVariants: false,
    trackCost: true,
    defaultUnit: 'قطعة',
    units: ['قطعة', 'كرتون', 'كيلو', 'لتر', 'متر', 'علبة', 'حزمة'],
    requireImage: false,
    maxImages: 5,
    autoGenerateBarcode: false,
    barcodeType: 'EAN13'
});

const getDefaultPrintSettings = (): PrintSettings => ({
    paperSize: 'A4',
    orientation: 'portrait',
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    showLogo: true,
    logoSize: 'medium',
    fontSize: 12,
    fontFamily: 'Cairo',
    thermalWidth: 80,
    thermalCopies: 1,
    autoPrint: false,
    reportHeader: true,
    reportFooter: true,
    pageNumbers: true
});

const getDefaultUserSettings = (): UserSettings => ({
    roles: [],
    defaultRole: 'viewer',
    requireTwoFactor: false,
    sessionTimeout: 60,
    maxSessions: 3,
    passwordPolicy: {
        minLength: 8,
        requireUppercase: false,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
        expiryDays: 0,
        preventReuse: 0
    },
    loginAttempts: {
        maxAttempts: 5,
        lockoutDuration: 15
    }
});

const getDefaultIntegrations = (): IntegrationSettings => ({
    whatsapp: {
        enabled: false,
        provider: 'twilio',
        notifyOnSale: false,
        notifyOnPurchase: false,
        sendInvoice: false,
        sendPaymentReminder: false
    },
    telegram: {
        enabled: false,
        notifyOnSale: false,
        notifyOnPurchase: false,
        notifyOnLowStock: false,
        notifyOnPayment: false,
        dailyReport: false,
        weeklyReport: false
    },
    email: {
        enabled: false,
        provider: 'smtp',
        smtpSecure: true,
        fromEmail: '',
        fromName: '',
        sendInvoices: true,
        sendReports: false,
        sendStatements: false,
        sendReminders: false,
        headerColor: '#2563eb'
    }
});

const getDefaultAISettings = (): AISettings => ({
    enabled: false,
    provider: 'gemini',
    maxTokens: 2048,
    temperature: 0.7,
    language: 'ar',
    features: {
        chatAssistant: true,
        invoiceAnalysis: false,
        reportGeneration: false,
        suggestions: true,
        dataInsights: false,
        autoDescription: false,
        priceAnalysis: false
    },
    currentUsage: 0
});

const getDefaultWebhookSettings = (): WebhookSettings => ({
    webhooks: [],
    logs: [],
    retryPolicy: {
        maxRetries: 3,
        retryDelay: 60,
        exponentialBackoff: true
    },
    logging: true,
    logRetention: 30
});

const getDefaultBackupSettings = () => ({
    autoBackup: false,
    frequency: 'weekly' as const,
    time: '02:00',
    keepCount: 5,
    location: 'local' as const,
    encryptBackups: false,
    includeSettings: true,
    includeMedia: false,
    backups: []
});

const getDefaultSettings = (): AppSettingsExtended => ({
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    company: getDefaultCompany(),
    currency: getDefaultCurrencySettings(),
    tax: getDefaultTaxSettings(),
    invoice: getDefaultInvoiceSettings(),
    sales: getDefaultSalesSettings(),
    purchase: getDefaultPurchaseSettings(),
    inventory: getDefaultInventorySettings(),
    product: getDefaultProductSettings(),
    theme: DEFAULT_THEME_SETTINGS,
    print: getDefaultPrintSettings(),
    users: getDefaultUserSettings(),
    integrations: getDefaultIntegrations(),
    ai: getDefaultAISettings(),
    webhooks: getDefaultWebhookSettings(),
    backup: getDefaultBackupSettings(),
    language: 'ar',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '12h',
    timezone: 'Asia/Aden',
    numberFormat: 'standard',
    debug: false,
    analytics: true
});

// ===================== Context =====================
const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

// ===================== Provider =====================
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<AppSettingsExtended>(() =>
        SafeStorage.get('alzhra_settings_v2', getDefaultSettings())
    );
    // Companies now managed via Supabase (fetched on load) - keeping local state for UI consistency momentarily
    const [companies, setCompanies] = useState<CompanyInfo[]>(() =>
        SafeStorage.get('alzhra_companies', [getDefaultCompany()])
    );
    const [activeCompanyId, setActiveCompanyId] = useState<string>(() =>
        SafeStorage.get('alzhra_active_company', 'default')
    );

    // New States for Backend Data
    const [branches, setBranches] = useState<Branch[]>([]);
    const [fiscalPeriods, setFiscalPeriods] = useState<FiscalPeriod[]>([]);
    const [backendCurrencies, setBackendCurrencies] = useState<Currency[]>([]);

    const [isLoading, setIsLoading] = useState(false);

    // Initial Data Fetch
    const refreshData = useCallback(async () => {
        // Skip if no company ID or if it's the default placeholder (not a valid UUID)
        const isValidUUID = activeCompanyId &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(activeCompanyId);

        if (!isValidUUID) {
            // Don't make API calls with invalid company ID
            return;
        }
        setIsLoading(true);
        try {
            // 1. Fetch Branches
            const fetchedBranches = await BranchService.getBranches(activeCompanyId);
            setBranches(fetchedBranches);

            // 2. Fetch Fiscal Periods
            const fetchedPeriods = await FiscalPeriodService.getFiscalPeriods(activeCompanyId);
            setFiscalPeriods(fetchedPeriods);

            // 3. Fetch Currencies
            const allCurrencies = await CurrencyService.getAllCurrencies();

            // Update settings.currency with backed data if available
            if (allCurrencies.length > 0) {
                setSettings(prev => ({
                    ...prev,
                    currency: {
                        ...prev.currency,
                        currencies: allCurrencies.map(c => ({
                            code: c.code,
                            nameAr: c.name_ar,
                            nameEn: c.name_en,
                            symbol: c.symbol,
                            decimalPlaces: c.decimal_places || 2,
                            isActive: c.is_active || true,
                            isDefault: c.is_base || false, // Assuming is_base means default/base
                            createdAt: c.created_at || new Date().toISOString(),
                            position: 'after' // Default or fetch if exists
                        })) as any
                    }
                }));
            }

        } catch (error: any) {
            // Silently handle errors - the app can still function with cached/default settings
            // Only log non-abort errors in development
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

    // حفظ الإعدادات عند التغيير (Local Preferences and non-cloud settings)
    useEffect(() => {
        SafeStorage.set('alzhra_settings_v2', settings);
        logger.debug('Settings saved');
    }, [settings]);

    useEffect(() => {
        SafeStorage.set('alzhra_companies', companies);
    }, [companies]);

    useEffect(() => {
        SafeStorage.set('alzhra_active_company', activeCompanyId);
    }, [activeCompanyId]);

    // الشركة النشطة
    const activeCompany = useMemo(() =>
        companies.find(c => c.id === activeCompanyId) || companies[0] || null
        , [companies, activeCompanyId]);

    // ===== إدارة الفروع (Implementation) =====
    const addBranch = useCallback(async (branch: InsertType<Branch>) => {
        try {
            const newBranch = await BranchService.addBranch(branch);
            setBranches(prev => [...prev, newBranch]);
            logger.info('Branch added', { id: newBranch.id });
        } catch (error) {
            logger.error('Failed to add branch', error as Error);
            throw error;
        }
    }, []);

    const updateBranch = useCallback(async (id: string, branch: UpdateType<Branch>) => {
        try {
            const updated = await BranchService.updateBranch(id, branch);
            setBranches(prev => prev.map(b => b.id === id ? updated : b));
            logger.info('Branch updated', { id });
        } catch (error) {
            logger.error('Failed to update branch', error as Error);
            throw error;
        }
    }, []);

    const deleteBranch = useCallback(async (id: string) => {
        try {
            await BranchService.deleteBranch(id);
            setBranches(prev => prev.filter(b => b.id !== id)); // Or mark as inactive
            logger.info('Branch deleted', { id });
        } catch (error) {
            logger.error('Failed to delete branch', error as Error);
            throw error;
        }
    }, []);

    // ===== الفترات المالية (Implementation) =====
    const addFiscalPeriod = useCallback(async (period: InsertType<FiscalPeriod>) => {
        try {
            const newPeriod = await FiscalPeriodService.addFiscalPeriod(period);
            setFiscalPeriods(prev => [...prev, newPeriod]);
        } catch (error) {
            logger.error('Failed to add fiscal period', error as Error);
            throw error;
        }
    }, []);

    const updateFiscalPeriod = useCallback(async (id: string, period: UpdateType<FiscalPeriod>) => {
        try {
            const updated = await FiscalPeriodService.updateFiscalPeriod(id, period);
            setFiscalPeriods(prev => prev.map(p => p.id === id ? updated : p));
        } catch (error) {
            logger.error('Failed to update fiscal period', error as Error);
            throw error;
        }
    }, []);

    const closeFiscalPeriod = useCallback(async (id: string) => {
        try {
            await FiscalPeriodService.closePeriod(id);
            setFiscalPeriods(prev => prev.map(p => p.id === id ? { ...p, status: 'closed' } : p));
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

    const updateCompany = useCallback((company: CompanyInfo) => {
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
            if (!activeCompanyId) return;

            // 1. Call Service
            await CurrencyService.setExchangeRate({
                company_id: activeCompanyId,
                from_currency: rate.fromCurrency,
                to_currency: rate.toCurrency,
                rate: rate.rate,
                valid_from: rate.date
            } as any);

            // 2. Update Local State
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
            logger.info('Exchange rate added', { from: rate.fromCurrency, to: rate.toCurrency, rate: rate.rate });
        } catch (e) { console.error(e); }
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
        // For now, we assume 'admin' access or check a stored role
        const savedUser = SafeStorage.get<{ role?: string }>('alzhra_user', {});
        const userRole = savedUser.role || 'viewer';

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
