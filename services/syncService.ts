/**
 * Sync Service - خدمة المزامنة
 * التخزين السحابي المباشر فقط - بدون قائمة انتظار
 */

import {
    SyncStats,
    SyncSettings,
    DEFAULT_SYNC_SETTINGS
} from '../types/sync';

// متغيرات محلية في الذاكرة (ليست localStorage)
let lastCheckAt: string | undefined = undefined;
let syncSettings: SyncSettings = { ...DEFAULT_SYNC_SETTINGS };

/**
 * خدمة المزامنة المبسطة
 */
export const SyncService = {
    /**
     * الحصول على إحصائيات المزامنة
     */
    getStats: (): SyncStats => {
        return {
            isOnline: navigator.onLine,
            lastCheckAt: lastCheckAt
        };
    },

    /**
     * تحديث وقت آخر فحص
     */
    updateLastCheck: (): void => {
        lastCheckAt = new Date().toISOString();
    },

    /**
     * الحصول على إعدادات المزامنة
     */
    getSettings: (): SyncSettings => {
        return syncSettings;
    },

    /**
     * تحديث إعدادات المزامنة
     */
    updateSettings: (settings: Partial<SyncSettings>): void => {
        syncSettings = { ...syncSettings, ...settings };
    }
};

