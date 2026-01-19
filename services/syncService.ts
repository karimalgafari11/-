/**
 * Sync Service - خدمة المزامنة
 * التخزين السحابي المباشر فقط - بدون قائمة انتظار
 */

import {
    SyncStats,
    SyncSettings,
    DEFAULT_SYNC_SETTINGS
} from '../types/sync';
import { SafeStorage } from '../utils/storage';

const SYNC_SETTINGS_KEY = 'alzhra_sync_settings';
const LAST_CHECK_KEY = 'alzhra_last_check';

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
            lastCheckAt: SafeStorage.get<string | undefined>(LAST_CHECK_KEY, undefined)
        };
    },

    /**
     * تحديث وقت آخر فحص
     */
    updateLastCheck: (): void => {
        SafeStorage.set(LAST_CHECK_KEY, new Date().toISOString());
    },

    /**
     * الحصول على إعدادات المزامنة
     */
    getSettings: (): SyncSettings => {
        return SafeStorage.get<SyncSettings>(SYNC_SETTINGS_KEY, DEFAULT_SYNC_SETTINGS);
    },

    /**
     * تحديث إعدادات المزامنة
     */
    updateSettings: (settings: Partial<SyncSettings>): void => {
        const current = SyncService.getSettings();
        SafeStorage.set(SYNC_SETTINGS_KEY, { ...current, ...settings });
    }
};

