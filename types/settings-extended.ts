/**
 * Extended Settings Types
 * أنواع الإعدادات الموسعة للتطبيق
 */

import { Currency, ExchangeRateRecord, CurrencyCode } from './common';

// ===================== الشركة =====================
export interface CompanyInfo {
    id: string;
    name: string;
    nameEn?: string;
    logo?: string;
    address: string;
    city?: string;
    country?: string;
    phone: string;
    phone2?: string;
    email?: string;
    website?: string;
    taxNumber?: string;
    commercialRegister?: string;
    baseCurrency: string;
    fiscalYearStart: string;  // بداية السنة المالية (MM-DD)
    industry?: string;
    createdAt: string;
    updatedAt?: string;
}

// ===================== العملات =====================
export interface CurrencySettings {
    currencies: Currency[];
    defaultCurrency: string;
    exchangeRates: ExchangeRateRecord[];
    lastUpdate: string;
}

// ===================== الضرائب =====================
export interface TaxRate {
    id: string;
    name: string;
    nameEn?: string;
    rate: number;
    isDefault: boolean;
    categoryIds?: string[];  // فئات محددة
}

export interface TaxSettings {
    enabled: boolean;
    defaultRate: number;
    includedInPrice: boolean;
    taxNumber?: string;
    taxName: string;  // مثال: ضريبة القيمة المضافة
    taxNameEn?: string;
    customRates: TaxRate[];
    showOnInvoice: boolean;
}

// ===================== الفواتير =====================
export interface InvoiceSettings {
    // الترقيم
    salesPrefix: string;
    salesNextNumber: number;
    purchasePrefix: string;
    purchaseNextNumber: number;
    returnPrefix: string;
    returnNextNumber: number;
    quotePrefix: string;
    quoteNextNumber: number;

    // المظهر
    showLogo: boolean;
    logoSize: 'small' | 'medium' | 'large';
    showQRCode: boolean;
    showBarcode: boolean;
    showNotes: boolean;
    showPaymentTerms: boolean;
    showSignature: boolean;

    // الإعدادات
    defaultDueDays: number;
    template: 'classic' | 'modern' | 'minimal' | 'professional' | 'elegant';

    // النصوص
    headerText?: string;
    footerText?: string;
    termsAndConditions?: string;
    thankYouMessage?: string;

    // البنك
    showBankDetails: boolean;
    bankName?: string;
    bankAccount?: string;
    iban?: string;
}

// ===================== المبيعات =====================
export interface SalesSettings {
    allowNegativeStock: boolean;
    requireCustomer: boolean;
    defaultPaymentMethod: 'cash' | 'credit' | 'bank' | 'check';
    autoGenerateInvoice: boolean;
    allowDiscount: boolean;
    maxDiscountPercent: number;
    requireApprovalAbove?: number;
    roundTotal: boolean;
    roundMethod: 'nearest' | 'up' | 'down';
    roundTo: number;  // 0.5, 1, 5, 10

    // التنبيهات
    notifyOnLowStock: boolean;
    lowStockThreshold: number;
    notifyOnSale: boolean;

    // الافتراضيات
    defaultWarehouse?: string;
    defaultPriceList?: string;
}

// ===================== المشتريات =====================
export interface PurchaseSettings {
    requireSupplier: boolean;
    requirePurchaseOrder: boolean;
    autoUpdateCost: boolean;
    costUpdateMethod: 'replace' | 'average' | 'manual';
    defaultPaymentTerms: number;
    requireApprovalAbove?: number;
    notifyOnArrival: boolean;
    autoReceive: boolean;
    defaultWarehouse?: string;
}

// ===================== المخزون =====================
export interface InventorySettings {
    trackByWarehouse: boolean;
    trackBatches: boolean;
    trackExpiry: boolean;
    trackSerialNumbers: boolean;
    defaultWarehouse?: string;
    reorderLevel: number;
    autoReorder: boolean;
    valuationMethod: 'FIFO' | 'LIFO' | 'average' | 'specific';
    allowNegativeStock: boolean;

    // الجرد
    requireCountApproval: boolean;
    allowAdjustments: boolean;
    adjustmentRequiresApproval: boolean;

    // التحويلات
    requireTransferApproval: boolean;
    autoReceiveTransfers: boolean;
}

// ===================== المنتجات =====================
export interface ProductSettings {
    requireSKU: boolean;
    autoGenerateSKU: boolean;
    skuPrefix: string;
    skuFormat: 'numeric' | 'alphanumeric';
    skuLength: number;
    requireCategory: boolean;
    allowVariants: boolean;
    trackCost: boolean;
    defaultUnit: string;
    units: string[];

    // الصور
    requireImage: boolean;
    maxImages: number;

    // الباركود
    autoGenerateBarcode: boolean;
    barcodeType: 'EAN13' | 'EAN8' | 'CODE128' | 'CODE39';
}

// ===================== المظهر والثيمات المتقدم =====================
export interface ThemeColors {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    info: string;
}

export interface ThemeBackgrounds {
    page: string;
    card: string;
    sidebar: string;
    header: string;
    modal: string;
    input: string;
}

export interface ThemeTextColors {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
    link: string;
}

export interface ThemeFonts {
    familyAr: string;
    familyEn: string;
    sizeBase: number;
    sizeScale: 'small' | 'medium' | 'large';
    lineHeight: number;
    weightNormal: number;
    weightBold: number;
}

export interface ThemeBorders {
    radius: number;
    radiusLarge: number;
    width: number;
    color: string;
}

export interface ThemeShadows {
    enabled: boolean;
    intensity: 'none' | 'light' | 'medium' | 'strong';
    color: string;
}

export interface ThemeEffects {
    animations: boolean;
    animationSpeed: 'slow' | 'normal' | 'fast';
    blur: boolean;
    blurAmount: number;
    glassmorphism: boolean;
}

export interface ThemeSettings {
    mode: 'light' | 'dark' | 'system';
    preset: 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'custom';
    colors: ThemeColors;
    backgrounds: ThemeBackgrounds;
    textColors: ThemeTextColors;
    fonts: ThemeFonts;
    borders: ThemeBorders;
    shadows: ThemeShadows;
    effects: ThemeEffects;

    // تخصيص المكونات
    components: {
        cardRounding: number;
        buttonRounding: number;
        inputRounding: number;
        sidebarWidth: number;
        headerHeight: number;
        gridDensity: 'compact' | 'comfortable' | 'spacious';
        showSidebarIcons: boolean;
    };

    // تفضيلات العرض
    display: {
        showDashboardStats: boolean;
        showDashboardCharts: boolean;
        showRecentTransactions: boolean;
        showExpenseAnalysis: boolean;
        compactMode: boolean;
    };
}

// ===================== الطباعة =====================
export interface PrintSettings {
    paperSize: 'A4' | 'A5' | 'Letter' | 'Legal' | 'thermal58' | 'thermal80';
    orientation: 'portrait' | 'landscape';
    margins: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    showLogo: boolean;
    logoSize: 'small' | 'medium' | 'large';
    headerText?: string;
    footerText?: string;
    fontSize: number;
    fontFamily: string;

    // الطابعة الحرارية
    thermalWidth: 58 | 80;
    thermalCopies: number;
    autoPrint: boolean;

    // التقارير
    reportHeader: boolean;
    reportFooter: boolean;
    pageNumbers: boolean;
}

// ===================== الصلاحيات =====================
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'export' | 'approve' | 'print';

export interface Permission {
    module: string;
    moduleNameAr: string;
    moduleNameEn: string;
    actions: Record<PermissionAction, boolean>;
}

export interface Role {
    id: string;
    name: string;
    nameEn: string;
    description: string;
    descriptionEn?: string;
    color: string;
    permissions: Permission[];
    isSystem: boolean;  // أدوار النظام لا يمكن حذفها
    createdAt: string;
    updatedAt?: string;
}

// الأدوار الافتراضية
export const DEFAULT_ROLES: Omit<Role, 'id' | 'createdAt'>[] = [
    {
        name: 'مدير النظام',
        nameEn: 'Administrator',
        description: 'صلاحيات كاملة على جميع أقسام النظام',
        color: '#dc2626',
        isSystem: true,
        permissions: []  // سيتم ملؤها بجميع الصلاحيات
    },
    {
        name: 'مدير',
        nameEn: 'Manager',
        description: 'إدارة العمليات اليومية مع صلاحيات موسعة',
        color: '#2563eb',
        isSystem: true,
        permissions: []
    },
    {
        name: 'محاسب',
        nameEn: 'Accountant',
        description: 'إدارة الحسابات والتقارير المالية',
        color: '#059669',
        isSystem: true,
        permissions: []
    },
    {
        name: 'كاشير',
        nameEn: 'Cashier',
        description: 'نقاط البيع والمبيعات فقط',
        color: '#7c3aed',
        isSystem: true,
        permissions: []
    },
    {
        name: 'مشاهد',
        nameEn: 'Viewer',
        description: 'عرض البيانات فقط بدون أي تعديل',
        color: '#6b7280',
        isSystem: true,
        permissions: []
    }
];

// الوحدات
export const SYSTEM_MODULES = [
    { id: 'dashboard', nameAr: 'لوحة التحكم', nameEn: 'Dashboard' },
    { id: 'sales', nameAr: 'المبيعات', nameEn: 'Sales' },
    { id: 'purchases', nameAr: 'المشتريات', nameEn: 'Purchases' },
    { id: 'inventory', nameAr: 'المخزون', nameEn: 'Inventory' },
    { id: 'products', nameAr: 'المنتجات', nameEn: 'Products' },
    { id: 'customers', nameAr: 'العملاء', nameEn: 'Customers' },
    { id: 'suppliers', nameAr: 'الموردين', nameEn: 'Suppliers' },
    { id: 'invoices', nameAr: 'الفواتير', nameEn: 'Invoices' },
    { id: 'expenses', nameAr: 'المصروفات', nameEn: 'Expenses' },
    { id: 'accounting', nameAr: 'المحاسبة', nameEn: 'Accounting' },
    { id: 'reports', nameAr: 'التقارير', nameEn: 'Reports' },
    { id: 'settings', nameAr: 'الإعدادات', nameEn: 'Settings' },
    { id: 'users', nameAr: 'المستخدمين', nameEn: 'Users' },
];

export interface UserSettings {
    roles: Role[];
    defaultRole: string;
    requireTwoFactor: boolean;
    sessionTimeout: number;  // بالدقائق
    maxSessions: number;
    passwordPolicy: {
        minLength: number;
        requireUppercase: boolean;
        requireLowercase: boolean;
        requireNumbers: boolean;
        requireSpecialChars: boolean;
        expiryDays: number;
        preventReuse: number;  // عدد كلمات المرور السابقة
    };
    loginAttempts: {
        maxAttempts: number;
        lockoutDuration: number;  // بالدقائق
    };
}

// ===================== التكاملات =====================
export interface WhatsAppSettings {
    enabled: boolean;
    provider: 'twilio' | 'whatsapp-business' | 'wati' | 'other';
    apiKey?: string;
    phoneNumber?: string;
    accountSid?: string;  // Twilio
    authToken?: string;   // Twilio

    // الإشعارات
    notifyOnSale: boolean;
    notifyOnPurchase: boolean;
    sendInvoice: boolean;
    sendPaymentReminder: boolean;

    // القوالب
    saleTemplate?: string;
    invoiceTemplate?: string;
    reminderTemplate?: string;
}

export interface TelegramSettings {
    enabled: boolean;
    botToken?: string;
    chatId?: string;

    // الإشعارات
    notifyOnSale: boolean;
    notifyOnPurchase: boolean;
    notifyOnLowStock: boolean;
    notifyOnPayment: boolean;

    // التقارير
    dailyReport: boolean;
    dailyReportTime?: string;
    weeklyReport: boolean;
}

export interface EmailSettings {
    enabled: boolean;
    provider: 'smtp' | 'sendgrid' | 'mailgun' | 'resend' | 'ses';

    // SMTP
    smtpHost?: string;
    smtpPort?: number;
    smtpSecure: boolean;
    smtpUser?: string;
    smtpPassword?: string;

    // API
    apiKey?: string;
    apiEndpoint?: string;

    // المرسل
    fromEmail: string;
    fromName: string;
    replyTo?: string;

    // الإعدادات
    sendInvoices: boolean;
    sendReports: boolean;
    sendStatements: boolean;
    sendReminders: boolean;

    // التصميم
    headerColor: string;
    footerText?: string;
    logoUrl?: string;
}

export interface IntegrationSettings {
    whatsapp: WhatsAppSettings;
    telegram: TelegramSettings;
    email: EmailSettings;
}

// ===================== الذكاء الاصطناعي =====================
export interface AISettings {
    enabled: boolean;
    provider: 'gemini' | 'deepseek' | 'openrouter' | 'openai' | 'anthropic' | 'custom';

    // API
    apiKey?: string;
    baseUrl?: string;  // للـ custom provider أو OpenRouter
    model?: string;

    // الإعدادات
    maxTokens: number;
    temperature: number;
    language: 'ar' | 'en' | 'auto';

    // الميزات
    features: {
        chatAssistant: boolean;
        invoiceAnalysis: boolean;
        reportGeneration: boolean;
        suggestions: boolean;
        dataInsights: boolean;
        autoDescription: boolean;
        priceAnalysis: boolean;
    };

    // الاستخدام
    monthlyLimit?: number;
    currentUsage: number;
    lastReset?: string;
}

// ===================== Webhooks =====================
export type WebhookEvent =
    | 'sale.created' | 'sale.updated' | 'sale.deleted' | 'sale.completed'
    | 'purchase.created' | 'purchase.updated' | 'purchase.received'
    | 'invoice.created' | 'invoice.paid' | 'invoice.overdue' | 'invoice.cancelled'
    | 'inventory.low_stock' | 'inventory.updated' | 'inventory.transfer'
    | 'customer.created' | 'customer.updated'
    | 'supplier.created' | 'supplier.updated'
    | 'payment.received' | 'payment.sent'
    | 'expense.created' | 'expense.approved'
    | 'user.login' | 'user.created';

export interface Webhook {
    id: string;
    name: string;
    description?: string;
    url: string;
    secret?: string;
    events: WebhookEvent[];
    isActive: boolean;

    // Headers
    headers?: Record<string, string>;

    // التحقق
    verifySSL: boolean;
    timeout: number;  // بالثواني

    // المحاولات
    retryCount: number;
    retryDelay: number;  // بالثواني

    // السجل
    lastTriggered?: string;
    lastStatus?: 'success' | 'failed';
    lastError?: string;
    successCount: number;
    failureCount: number;

    createdAt: string;
    updatedAt?: string;
}

export interface WebhookLog {
    id: string;
    webhookId: string;
    event: WebhookEvent;
    payload: string;
    response?: string;
    statusCode?: number;
    success: boolean;
    error?: string;
    duration: number;  // بالمللي ثانية
    timestamp: string;
}

export interface WebhookSettings {
    webhooks: Webhook[];
    logs: WebhookLog[];
    globalHeaders?: Record<string, string>;
    retryPolicy: {
        maxRetries: number;
        retryDelay: number;  // بالثواني
        exponentialBackoff: boolean;
    };
    logging: boolean;
    logRetention: number;  // بالأيام
}

// ===================== النسخ الاحتياطي =====================
export interface Backup {
    id: string;
    name: string;
    size: number;
    type: 'manual' | 'auto';
    encrypted: boolean;
    location: 'local' | 'cloud';
    cloudProvider?: 'google-drive' | 'dropbox' | 'onedrive';
    path?: string;
    createdAt: string;
}

export interface BackupSettings {
    autoBackup: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;  // HH:mm
    dayOfWeek?: number;  // 0-6 للأسبوعي
    dayOfMonth?: number;  // 1-31 للشهري
    keepCount: number;  // عدد النسخ المحفوظة
    location: 'local' | 'cloud';
    cloudProvider?: 'google-drive' | 'dropbox' | 'onedrive';
    cloudToken?: string;
    encryptBackups: boolean;
    encryptionKey?: string;
    includeSettings: boolean;
    includeMedia: boolean;
    backups: Backup[];
    lastBackup?: string;
    nextBackup?: string;
}

// ===================== الإعدادات الشاملة =====================
export interface AppSettingsExtended {
    // معلومات النسخة
    version: string;
    lastUpdated: string;

    // الإعدادات الأساسية
    company: CompanyInfo;
    currency: CurrencySettings;
    tax: TaxSettings;
    invoice: InvoiceSettings;

    // إعدادات العمليات
    sales: SalesSettings;
    purchase: PurchaseSettings;
    inventory: InventorySettings;
    product: ProductSettings;

    // إعدادات المظهر
    theme: ThemeSettings;
    print: PrintSettings;

    // إعدادات الأمان
    users: UserSettings;

    // التكاملات
    integrations: IntegrationSettings;
    ai: AISettings;
    webhooks: WebhookSettings;

    // النظام
    backup: BackupSettings;
    language: 'ar' | 'en';
    dateFormat: string;
    timeFormat: '12h' | '24h';
    timezone: string;
    numberFormat: 'standard' | 'accounting';

    // متقدم
    debug: boolean;
    analytics: boolean;
}

// ===================== القيم الافتراضية =====================
export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
    mode: 'light',
    preset: 'default',
    colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#8b5cf6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#0ea5e9'
    },
    backgrounds: {
        page: '#f8fafc',
        card: '#ffffff',
        sidebar: '#1e293b',
        header: '#ffffff',
        modal: '#ffffff',
        input: '#ffffff'
    },
    textColors: {
        primary: '#1e293b',
        secondary: '#64748b',
        muted: '#94a3b8',
        inverse: '#ffffff',
        link: '#2563eb'
    },
    fonts: {
        familyAr: 'Cairo',
        familyEn: 'Inter',
        sizeBase: 14,
        sizeScale: 'medium',
        lineHeight: 1.5,
        weightNormal: 400,
        weightBold: 700
    },
    borders: {
        radius: 8,
        radiusLarge: 16,
        width: 1,
        color: '#e2e8f0'
    },
    shadows: {
        enabled: true,
        intensity: 'light',
        color: 'rgba(0,0,0,0.1)'
    },
    effects: {
        animations: true,
        animationSpeed: 'normal',
        blur: true,
        blurAmount: 8,
        glassmorphism: false
    },
    components: {
        cardRounding: 12,
        buttonRounding: 8,
        inputRounding: 8,
        sidebarWidth: 260,
        headerHeight: 64,
        gridDensity: 'comfortable',
        showSidebarIcons: true
    },
    display: {
        showDashboardStats: true,
        showDashboardCharts: true,
        showRecentTransactions: true,
        showExpenseAnalysis: true,
        compactMode: false
    }
};
