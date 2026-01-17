/**
 * Sync Context - سياق المزامنة
 * إدارة العمل بدون اتصال والمزامنة
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { SyncStats, SyncSettings, SyncQueueItem } from '../types/sync';
import { SyncService } from '../services/syncService';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface SyncContextValue {
    // حالة الاتصال
    isOnline: boolean;

    // إحصائيات المزامنة
    stats: SyncStats;

    // الإعدادات
    settings: SyncSettings;

    // الإجراءات
    addToQueue: (params: {
        operation: 'create' | 'update' | 'delete';
        entityType: string;
        entityId: string;
        data: Record<string, unknown>;
        userId: string;
        branchId: string;
    }) => SyncQueueItem;

    syncNow: () => Promise<void>;
    updateSettings: (settings: Partial<SyncSettings>) => void;
    getPendingItems: () => SyncQueueItem[];
}

const SyncContext = createContext<SyncContextValue | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isOnline, updateLastSync } = useOnlineStatus();
    const [stats, setStats] = useState<SyncStats>(SyncService.getStats());
    const [settings, setSettings] = useState<SyncSettings>(SyncService.getSettings());
    const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // تحديث الإحصائيات
    const refreshStats = useCallback(() => {
        setStats(SyncService.getStats());
    }, []);

    /**
     * إضافة عملية للقائمة
     */
    const addToQueue = useCallback((params: {
        operation: 'create' | 'update' | 'delete';
        entityType: string;
        entityId: string;
        data: Record<string, unknown>;
        userId: string;
        branchId: string;
    }): SyncQueueItem => {
        const item = SyncService.addToQueue(params);
        refreshStats();
        return item;
    }, [refreshStats]);

    /**
     * المزامنة الآن
     * (سيتم تنفيذها بالكامل مع Supabase)
     */
    const syncNow = useCallback(async () => {
        if (!isOnline) {
            console.log('Offline - cannot sync');
            return;
        }

        const pending = SyncService.getPending();
        if (pending.length === 0) {
            console.log('No pending items to sync');
            return;
        }

        console.log(`Syncing ${pending.length} items...`);

        // TODO: إرسال البيانات لـ Supabase
        // حالياً نحاكي المزامنة الناجحة
        for (const item of pending) {
            SyncService.updateItemStatus(item.id, 'synced');
        }

        SyncService.updateLastSync();
        updateLastSync();
        refreshStats();

        console.log('Sync completed');
    }, [isOnline, refreshStats, updateLastSync]);

    /**
     * تحديث الإعدادات
     */
    const updateSettings = useCallback((newSettings: Partial<SyncSettings>) => {
        SyncService.updateSettings(newSettings);
        setSettings(SyncService.getSettings());
    }, []);

    /**
     * الحصول على العناصر المعلقة
     */
    const getPendingItems = useCallback(() => {
        return SyncService.getPending();
    }, []);

    // المزامنة التلقائية عند الاتصال
    useEffect(() => {
        if (isOnline && settings.autoSync) {
            // مزامنة فورية عند العودة للاتصال
            syncNow();

            // المزامنة الدورية
            syncIntervalRef.current = setInterval(() => {
                syncNow();
            }, settings.syncIntervalMs);
        }

        return () => {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
            }
        };
    }, [isOnline, settings.autoSync, settings.syncIntervalMs, syncNow]);

    // تحديث الإحصائيات دورياً
    useEffect(() => {
        const interval = setInterval(refreshStats, 5000);
        return () => clearInterval(interval);
    }, [refreshStats]);

    const value: SyncContextValue = {
        isOnline,
        stats,
        settings,
        addToQueue,
        syncNow,
        updateSettings,
        getPendingItems
    };

    return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

export const useSync = () => {
    const context = useContext(SyncContext);
    if (!context) throw new Error('useSync must be used within SyncProvider');
    return context;
};
