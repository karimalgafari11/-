/**
 * useOnlineStatus Hook
 * مراقبة حالة الاتصال بالإنترنت
 */

import { useState, useEffect, useCallback } from 'react';
import { ConnectionState } from '../types/sync';

// متغير في الذاكرة لحالة الاتصال
let lastConnectionState: ConnectionState = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastOnlineAt: new Date().toISOString()
};

/**
 * Hook لمراقبة حالة الاتصال
 */
export const useOnlineStatus = () => {
    const [isOnline, setIsOnline] = useState<boolean>(() => {
        // التحقق من حالة الاتصال الحالية
        if (typeof navigator !== 'undefined') {
            return navigator.onLine;
        }
        return true;
    });

    const [connectionState, setConnectionState] = useState<ConnectionState>(lastConnectionState);

    // تحديث حالة الاتصال
    const updateConnectionState = useCallback((online: boolean) => {
        setIsOnline(online);

        const newState: ConnectionState = {
            isOnline: online,
            lastOnlineAt: online ? new Date().toISOString() : connectionState.lastOnlineAt,
            lastSyncAt: connectionState.lastSyncAt
        };

        setConnectionState(newState);
        lastConnectionState = newState;
    }, [connectionState]);

    // تحديث وقت آخر مزامنة
    const updateLastSync = useCallback(() => {
        const newState: ConnectionState = {
            ...connectionState,
            lastSyncAt: new Date().toISOString()
        };
        setConnectionState(newState);
        lastConnectionState = newState;
    }, [connectionState]);

    useEffect(() => {
        const handleOnline = () => updateConnectionState(true);
        const handleOffline = () => updateConnectionState(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [updateConnectionState]);

    return {
        isOnline,
        connectionState,
        updateLastSync,
        // الوقت منذ آخر اتصال
        timeSinceLastOnline: connectionState.lastOnlineAt
            ? Date.now() - new Date(connectionState.lastOnlineAt).getTime()
            : null,
        // الوقت منذ آخر مزامنة
        timeSinceLastSync: connectionState.lastSyncAt
            ? Date.now() - new Date(connectionState.lastSyncAt).getTime()
            : null
    };
};
