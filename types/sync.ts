/**
 * Sync Types - أنواع المزامنة
 * إدارة العمل بدون اتصال والمزامنة
 */

// حالة المزامنة
export type SyncStatus =
    | 'pending'      // في انتظار المزامنة
    | 'syncing'      // جاري المزامنة
    | 'synced'       // تمت المزامنة
    | 'failed'       // فشلت المزامنة
    | 'conflict';    // يوجد تعارض

// عنصر في قائمة المزامنة
export interface SyncQueueItem {
    id: string;

    // نوع العملية
    operation: 'create' | 'update' | 'delete';
    entityType: string;
    entityId: string;

    // البيانات
    data: Record<string, unknown>;

    // السياق
    userId: string;
    branchId: string;

    // التوقيت
    createdAt: string;         // وقت العملية الأصلي
    attempts: number;          // عدد محاولات المزامنة
    lastAttemptAt?: string;

    // الحالة
    status: SyncStatus;
    error?: string;
}

// حالة الاتصال
export interface ConnectionState {
    isOnline: boolean;
    lastOnlineAt?: string;
    lastSyncAt?: string;
}

// إحصائيات المزامنة
export interface SyncStats {
    pendingCount: number;
    failedCount: number;
    lastSyncAt?: string;
    syncInProgress: boolean;
}

// تعارض في البيانات
export interface SyncConflict {
    id: string;
    entityType: string;
    entityId: string;
    localData: Record<string, unknown>;
    serverData: Record<string, unknown>;
    localUpdatedAt: string;
    serverUpdatedAt: string;
    resolvedAt?: string;
    resolution?: 'local' | 'server' | 'merged';
}

// إعدادات المزامنة
export interface SyncSettings {
    autoSync: boolean;
    syncIntervalMs: number;
    maxRetries: number;
    conflictResolution: 'ask' | 'local_wins' | 'server_wins' | 'newest_wins';
}

// الإعدادات الافتراضية للمزامنة
export const DEFAULT_SYNC_SETTINGS: SyncSettings = {
    autoSync: true,
    syncIntervalMs: 30000,     // كل 30 ثانية
    maxRetries: 3,
    conflictResolution: 'newest_wins'
};
