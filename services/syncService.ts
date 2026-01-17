/**
 * Sync Service - خدمة المزامنة
 * إدارة قائمة الانتظار والمزامنة مع الخادم
 */

import {
    SyncQueueItem,
    SyncStatus,
    SyncStats,
    SyncSettings,
    DEFAULT_SYNC_SETTINGS
} from '../types/sync';
import { SafeStorage } from '../utils/storage';

const SYNC_QUEUE_KEY = 'alzhra_sync_queue';
const SYNC_SETTINGS_KEY = 'alzhra_sync_settings';

/**
 * توليد معرف فريد
 */
const generateId = (): string => {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * خدمة المزامنة
 */
export const SyncService = {
    /**
     * إضافة عملية لقائمة الانتظار
     */
    addToQueue: (params: {
        operation: 'create' | 'update' | 'delete';
        entityType: string;
        entityId: string;
        data: Record<string, unknown>;
        userId: string;
        branchId: string;
    }): SyncQueueItem => {
        const item: SyncQueueItem = {
            id: generateId(),
            ...params,
            createdAt: new Date().toISOString(),
            attempts: 0,
            status: 'pending'
        };

        const queue = SyncService.getQueue();
        queue.push(item);
        SafeStorage.set(SYNC_QUEUE_KEY, queue);

        return item;
    },

    /**
     * الحصول على قائمة الانتظار
     */
    getQueue: (): SyncQueueItem[] => {
        return SafeStorage.get<SyncQueueItem[]>(SYNC_QUEUE_KEY, []);
    },

    /**
     * الحصول على العناصر المعلقة
     */
    getPending: (): SyncQueueItem[] => {
        return SyncService.getQueue().filter(
            item => item.status === 'pending' || item.status === 'failed'
        );
    },

    /**
     * تحديث حالة عنصر
     */
    updateItemStatus: (
        id: string,
        status: SyncStatus,
        error?: string
    ): void => {
        const queue = SyncService.getQueue();
        const item = queue.find(i => i.id === id);

        if (item) {
            item.status = status;
            item.attempts += 1;
            item.lastAttemptAt = new Date().toISOString();
            if (error) item.error = error;
            SafeStorage.set(SYNC_QUEUE_KEY, queue);
        }
    },

    /**
     * حذف عنصر من القائمة
     */
    removeFromQueue: (id: string): void => {
        const queue = SyncService.getQueue().filter(i => i.id !== id);
        SafeStorage.set(SYNC_QUEUE_KEY, queue);
    },

    /**
     * حذف العناصر المزامنة
     */
    clearSynced: (): number => {
        const queue = SyncService.getQueue();
        const newQueue = queue.filter(i => i.status !== 'synced');
        const removedCount = queue.length - newQueue.length;
        SafeStorage.set(SYNC_QUEUE_KEY, newQueue);
        return removedCount;
    },

    /**
     * الحصول على إحصائيات المزامنة
     */
    getStats: (): SyncStats => {
        const queue = SyncService.getQueue();
        return {
            pendingCount: queue.filter(i => i.status === 'pending').length,
            failedCount: queue.filter(i => i.status === 'failed').length,
            lastSyncAt: SafeStorage.get<string | undefined>('alzhra_last_sync', undefined),
            syncInProgress: false
        };
    },

    /**
     * تحديث وقت آخر مزامنة
     */
    updateLastSync: (): void => {
        SafeStorage.set('alzhra_last_sync', new Date().toISOString());
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
