/**
 * Settings Defaults Index - ملف تصدير جميع القيم الافتراضية
 * يجمع كل دوال القيم الافتراضية في مكان واحد
 */

import { AppSettingsExtended, DEFAULT_THEME_SETTINGS } from '../../../types/settings-extended';

// تصدير جميع دوال القيم الافتراضية
export { getDefaultCompany } from './companyDefaults';
export { getDefaultCurrencySettings } from './currencyDefaults';
export { getDefaultTaxSettings } from './taxDefaults';
export { getDefaultInvoiceSettings } from './invoiceDefaults';
export { getDefaultSalesSettings } from './salesDefaults';
export { getDefaultPurchaseSettings } from './purchaseDefaults';
export { getDefaultInventorySettings } from './inventoryDefaults';
export { getDefaultProductSettings } from './productDefaults';
export { getDefaultPrintSettings } from './printDefaults';
export { getDefaultUserSettings } from './userDefaults';
export { getDefaultIntegrations } from './integrationDefaults';
export { getDefaultAISettings } from './aiDefaults';
export { getDefaultWebhookSettings } from './webhookDefaults';
export { getDefaultBackupSettings } from './backupDefaults';

// استيراد الدوال للاستخدام في getDefaultSettings
import { getDefaultCompany } from './companyDefaults';
import { getDefaultCurrencySettings } from './currencyDefaults';
import { getDefaultTaxSettings } from './taxDefaults';
import { getDefaultInvoiceSettings } from './invoiceDefaults';
import { getDefaultSalesSettings } from './salesDefaults';
import { getDefaultPurchaseSettings } from './purchaseDefaults';
import { getDefaultInventorySettings } from './inventoryDefaults';
import { getDefaultProductSettings } from './productDefaults';
import { getDefaultPrintSettings } from './printDefaults';
import { getDefaultUserSettings } from './userDefaults';
import { getDefaultIntegrations } from './integrationDefaults';
import { getDefaultAISettings } from './aiDefaults';
import { getDefaultWebhookSettings } from './webhookDefaults';
import { getDefaultBackupSettings } from './backupDefaults';

/**
 * الحصول على جميع القيم الافتراضية للتطبيق
 */
export const getDefaultSettings = (): AppSettingsExtended => ({
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
