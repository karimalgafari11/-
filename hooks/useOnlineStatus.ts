/**
 * useOnlineStatus Hook
 * مراقبة حالة الاتصال بالإنترنت
 */

import { useState, useEffect, useCallback } from 'react';
import { ConnectionState } from '../types/sync';
import { SafeStorage } from '../utils/storage';

const CONNECTION_STATE_KEY = 'alzhra_connection_state';

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
    }); const [connectionState, setConnectionState] = useState<ConnectionState>(() => {
        return SafeStorage.get<ConnectionState>(CONNECTION_STATE_KEY, {
            isOnline: navigator?.onLine ?? true,
            lastOnlineAt: navigator?.onLine ? new Date().toISOString() : undefined
        });
    });

    // تحديث حالة الاتصال
    const updateConnectionState = useCallback((online: boolean) => {
        setIsOnline(online);

        const newState: ConnectionState = {
            isOnline: online,
            lastOnlineAt: online ? new Date().toISOString() : connectionState.lastOnlineAt,
            lastSyncAt: connectionState.lastSyncAt
        };

        setConnectionState(newState);
        SafeStorage.set(CONNECTION_STATE_KEY, newState);
    }, [connectionState]);

    // تحديث وقت آخر مزامنة
    const updateLastSync = useCallback(() => {
        const newState: ConnectionState = {
            ...connectionState,
            lastSyncAt: new Date().toISOString()
        };
        setConnectionState(newState);
        SafeStorage.set(CONNECTION_STATE_KEY, newState);
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
