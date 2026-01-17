
import React, { createContext, useContext, useState, useCallback } from 'react';
import { errorMonitor } from '../../services/errorMonitoring';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface ErrorDetails {
    code?: string;
    name?: string;
    suggestion?: string;
    retryable?: boolean;
    originalError?: Error;
}

export interface Notification {
    id: string;
    message: string;
    type: NotificationType;
    errorDetails?: ErrorDetails;
    timestamp: Date;
}

interface NotificationContextValue {
    notifications: Notification[];
    showNotification: (message: string, type?: NotificationType, errorDetails?: ErrorDetails) => void;
    showError: (error: Error | string, suggestion?: string, retryable?: boolean) => void;
    showSuccess: (message: string) => void;
    showWarning: (message: string, suggestion?: string) => void;
    showInfo: (message: string) => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// خريطة ترجمة أنواع الأخطاء الشائعة
const ERROR_TYPE_TRANSLATIONS: Record<string, string> = {
    'TypeError': 'خطأ في نوع البيانات',
    'ReferenceError': 'خطأ في المرجع',
    'SyntaxError': 'خطأ في الصياغة',
    'RangeError': 'خطأ في النطاق',
    'NetworkError': 'خطأ في الشبكة',
    'ChunkLoadError': 'خطأ في تحميل الملفات',
    'AbortError': 'تم إلغاء العملية',
    'TimeoutError': 'انتهت مهلة العملية',
    'ValidationError': 'خطأ في التحقق',
    'AuthenticationError': 'خطأ في المصادقة',
    'PermissionError': 'خطأ في الصلاحيات',
    'NotFoundError': 'لم يتم العثور على العنصر',
    'DatabaseError': 'خطأ في قاعدة البيانات',
    'ConflictError': 'تعارض في البيانات',
    'Error': 'خطأ عام'
};

// خريطة اقتراحات الإصلاح بناءً على نوع الخطأ
const ERROR_SUGGESTIONS: Record<string, string> = {
    'NetworkError': 'تحقق من اتصال الإنترنت وأعد المحاولة',
    'ChunkLoadError': 'حدّث الصفحة للحصول على أحدث إصدار',
    'TimeoutError': 'العملية استغرقت وقتاً طويلاً، حاول مرة أخرى',
    'AuthenticationError': 'سجّل الدخول مرة أخرى',
    'PermissionError': 'ليس لديك صلاحية لهذه العملية',
    'NotFoundError': 'تأكد من صحة البيانات المطلوبة',
    'DatabaseError': 'حدث خطأ في حفظ البيانات، حاول لاحقاً',
    'ValidationError': 'تأكد من صحة البيانات المدخلة'
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const showNotification = useCallback((
        message: string,
        type: NotificationType = 'success',
        errorDetails?: ErrorDetails
    ) => {
        const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const notification: Notification = {
            id,
            message,
            type,
            errorDetails,
            timestamp: new Date()
        };

        setNotifications(prev => [...prev, notification]);

        // إزالة الإشعار تلقائياً بعد فترة
        const timeout = type === 'error' ? 8000 : 5000;
        setTimeout(() => removeNotification(id), timeout);
    }, [removeNotification]);

    const showError = useCallback((
        error: Error | string,
        suggestion?: string,
        retryable?: boolean
    ) => {
        let message: string;
        let errorDetails: ErrorDetails = {};

        if (error instanceof Error) {
            const errorName = error.name || 'Error';
            const translatedName = ERROR_TYPE_TRANSLATIONS[errorName] || errorName;

            message = error.message || 'حدث خطأ غير متوقع';
            errorDetails = {
                code: errorName,
                name: translatedName,
                suggestion: suggestion || ERROR_SUGGESTIONS[errorName],
                retryable: retryable ?? (
                    errorName === 'NetworkError' ||
                    errorName === 'TimeoutError' ||
                    errorName === 'ChunkLoadError'
                ),
                originalError: error
            };

            // تسجيل الخطأ في خدمة المراقبة
            errorMonitor.captureError(error, {
                source: 'notification',
                handled: true
            });
        } else {
            message = error;
            errorDetails = {
                name: 'خطأ',
                suggestion
            };
        }

        showNotification(message, 'error', errorDetails);
    }, [showNotification]);

    const showSuccess = useCallback((message: string) => {
        showNotification(message, 'success');
    }, [showNotification]);

    const showWarning = useCallback((message: string, suggestion?: string) => {
        showNotification(message, 'warning', { suggestion });
    }, [showNotification]);

    const showInfo = useCallback((message: string) => {
        showNotification(message, 'info');
    }, [showNotification]);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications,
            showNotification,
            showError,
            showSuccess,
            showWarning,
            showInfo,
            removeNotification,
            clearAll
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within NotificationProvider');
    return context;
};
