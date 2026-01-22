/**
 * Settings Context - Index
 * ملف التصدير الرئيسي لسياق الإعدادات
 * 
 * هذا الملف يوفر التوافق مع الـ imports القديمة
 * بينما يستخدم الهيكل الجديد المقسم داخلياً
 */

// تصدير السياق والـ Provider والـ Hook من الملف الأصلي
export {
    SettingsProvider,
    useSettings
} from '../SettingsContext';

export { default as SettingsContext } from '../SettingsContext';

// تصدير الأنواع
export type { SettingsContextValue } from './types';

// تصدير القيم الافتراضية
export {
    getDefaultSettings,
    getDefaultCompany,
    getDefaultCurrencySettings,
    getDefaultTaxSettings,
    getDefaultInvoiceSettings,
    getDefaultSalesSettings,
    getDefaultPurchaseSettings,
    getDefaultInventorySettings,
    getDefaultProductSettings,
    getDefaultPrintSettings,
    getDefaultUserSettings,
    getDefaultIntegrations,
    getDefaultAISettings,
    getDefaultWebhookSettings,
    getDefaultBackupSettings
} from './defaults';

// تصدير الـ Hooks
export {
    useCurrencySettings,
    useRolesSettings,
    useWebhooksSettings
} from './hooks';
