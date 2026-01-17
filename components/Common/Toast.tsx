
import React from 'react';
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info,
    X,
    Bug,
    Wifi,
    WifiOff,
    Database,
    FileWarning,
    ShieldAlert,
    Clock
} from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface ErrorDetails {
    code?: string;
    name?: string;
    suggestion?: string;
    retryable?: boolean;
}

export interface ToastProps {
    id: string;
    message: string;
    type: NotificationType;
    errorDetails?: ErrorDetails;
    onDismiss: (id: string) => void;
    onRetry?: () => void;
    theme?: 'light' | 'dark';
    duration?: number;
}

/**
 * مكون Toast محسّن لعرض الإشعارات والأخطاء بشكل واضح
 */
const Toast: React.FC<ToastProps> = ({
    id,
    message,
    type,
    errorDetails,
    onDismiss,
    onRetry,
    theme = 'dark'
}) => {
    // تحديد الأيقونة بناءً على نوع الخطأ
    const getIcon = () => {
        if (errorDetails?.code) {
            const code = errorDetails.code.toLowerCase();
            if (code.includes('network') || code.includes('fetch')) {
                return type === 'error' ? <WifiOff size={20} /> : <Wifi size={20} />;
            }
            if (code.includes('database') || code.includes('db')) {
                return <Database size={20} />;
            }
            if (code.includes('auth') || code.includes('permission')) {
                return <ShieldAlert size={20} />;
            }
            if (code.includes('file') || code.includes('load')) {
                return <FileWarning size={20} />;
            }
            if (code.includes('timeout')) {
                return <Clock size={20} />;
            }
        }

        switch (type) {
            case 'success':
                return <CheckCircle size={20} />;
            case 'error':
                return <XCircle size={20} />;
            case 'warning':
                return <AlertTriangle size={20} />;
            case 'info':
                return <Info size={20} />;
            default:
                return <Bug size={20} />;
        }
    };

    // ألوان الإشعار بناءً على النوع والسمة
    const getStyles = () => {
        const isLight = theme === 'light';

        const styles = {
            success: {
                container: isLight
                    ? 'bg-emerald-50 border-emerald-300'
                    : 'bg-emerald-950/90 border-emerald-700',
                icon: 'text-emerald-500',
                title: isLight ? 'text-emerald-800' : 'text-emerald-300',
                message: isLight ? 'text-emerald-700' : 'text-emerald-400',
                badge: 'bg-emerald-500/20 text-emerald-400'
            },
            error: {
                container: isLight
                    ? 'bg-red-50 border-red-300'
                    : 'bg-red-950/90 border-red-700',
                icon: 'text-red-500',
                title: isLight ? 'text-red-800' : 'text-red-300',
                message: isLight ? 'text-red-700' : 'text-red-400',
                badge: 'bg-red-500/20 text-red-400'
            },
            warning: {
                container: isLight
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-amber-950/90 border-amber-700',
                icon: 'text-amber-500',
                title: isLight ? 'text-amber-800' : 'text-amber-300',
                message: isLight ? 'text-amber-700' : 'text-amber-400',
                badge: 'bg-amber-500/20 text-amber-400'
            },
            info: {
                container: isLight
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-blue-950/90 border-blue-700',
                icon: 'text-blue-500',
                title: isLight ? 'text-blue-800' : 'text-blue-300',
                message: isLight ? 'text-blue-700' : 'text-blue-400',
                badge: 'bg-blue-500/20 text-blue-400'
            }
        };

        return styles[type];
    };

    const styles = getStyles();

    return (
        <div
            className={`
        relative flex flex-col rounded-xl shadow-2xl border backdrop-blur-md overflow-hidden
        animate-in slide-in-from-top-4 duration-300
        ${styles.container}
      `}
        >
            {/* Progress bar for auto-dismiss */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-black/10">
                <div
                    className={`h-full ${styles.icon.replace('text', 'bg')} animate-shrink-width`}
                    style={{ animationDuration: '5s', animationFillMode: 'forwards' }}
                />
            </div>

            <div className="p-4">
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`shrink-0 mt-0.5 ${styles.icon}`}>
                        {getIcon()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Error Name Badge */}
                        {errorDetails?.name && (
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className={`
                  inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider
                  ${styles.badge}
                `}>
                                    {errorDetails.name}
                                </span>
                                {errorDetails.code && (
                                    <span className={`
                    text-[10px] font-mono opacity-60
                    ${styles.message}
                  `}>
                                        {errorDetails.code}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Main Message */}
                        <p className={`text-sm font-bold ${styles.title}`}>
                            {message}
                        </p>

                        {/* Suggestion */}
                        {errorDetails?.suggestion && (
                            <p className={`mt-1 text-xs ${styles.message} opacity-80`}>
                                💡 {errorDetails.suggestion}
                            </p>
                        )}

                        {/* Retry Button */}
                        {errorDetails?.retryable && onRetry && (
                            <button
                                onClick={onRetry}
                                className={`
                  mt-2 px-3 py-1.5 rounded-lg text-xs font-bold
                  ${styles.badge} hover:opacity-80 transition-opacity
                `}
                            >
                                إعادة المحاولة
                            </button>
                        )}
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={() => onDismiss(id)}
                        className={`
              shrink-0 p-1 rounded-lg transition-all duration-200
              hover:bg-black/10 ${styles.message}
            `}
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Toast;
