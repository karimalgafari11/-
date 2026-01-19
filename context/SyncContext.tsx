/**
 * Sync Context - سياق المزامنة
 * التخزين السحابي المباشر فقط - بدون قائمة انتظار
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SyncStats, SyncSettings } from '../types/sync';
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
    updateSettings: (settings: Partial<SyncSettings>) => void;
}

const SyncContext = createContext<SyncContextValue | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isOnline } = useOnlineStatus();
    const [stats, setStats] = useState<SyncStats>(SyncService.getStats());
    const [settings, setSettings] = useState<SyncSettings>(SyncService.getSettings());

    // تحديث الإحصائيات
    const refreshStats = useCallback(() => {
        setStats(SyncService.getStats());
    }, []);

    /**
     * تحديث الإعدادات
     */
    const updateSettings = useCallback((newSettings: Partial<SyncSettings>) => {
        SyncService.updateSettings(newSettings);
        setSettings(SyncService.getSettings());
    }, []);

    // تحديث وقت آخر فحص عند تغيير حالة الاتصال
    useEffect(() => {
        SyncService.updateLastCheck();
        refreshStats();
    }, [isOnline, refreshStats]);

    // تحديث الإحصائيات دورياً
    useEffect(() => {
        const interval = setInterval(refreshStats, 10000); // كل 10 ثواني
        return () => clearInterval(interval);
    }, [refreshStats]);

    const value: SyncContextValue = {
        isOnline,
        stats,
        settings,
        updateSettings
    };

    return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

export const useSync = () => {
    const context = useContext(SyncContext);
    if (!context) throw new Error('useSync must be used within SyncProvider');
    return context;
};

