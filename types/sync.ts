/**
 * Sync Types - أنواع المزامنة
 * التخزين السحابي المباشر فقط - بدون قائمة انتظار محلية
 */

// حالة الاتصال
export interface ConnectionState {
    isOnline: boolean;
    lastOnlineAt?: string;
    lastCheckAt?: string;
    lastSyncAt?: string;
}

// إحصائيات المزامنة
export interface SyncStats {
    isOnline: boolean;
    lastCheckAt?: string;
}

// إعدادات المزامنة
export interface SyncSettings {
    // إعدادات عامة فقط - لا توجد مزامنة تلقائية
    showOfflineWarning: boolean;
    autoRetryOnReconnect: boolean;
}

// الإعدادات الافتراضية للمزامنة
export const DEFAULT_SYNC_SETTINGS: SyncSettings = {
    showOfflineWarning: true,
    autoRetryOnReconnect: true
};
