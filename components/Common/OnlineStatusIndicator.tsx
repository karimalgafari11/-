/**
 * Online Status Indicator Component
 * مكون مؤشر حالة الاتصال
 */

import React from 'react';
import { Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react';
import { useSync } from '../../context/SyncContext';

interface OnlineStatusIndicatorProps {
    showDetails?: boolean;
    compact?: boolean;
}

const OnlineStatusIndicator: React.FC<OnlineStatusIndicatorProps> = ({
    showDetails = false,
    compact = false
}) => {
    const { isOnline, stats } = useSync();

    if (compact) {
        return (
            <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${isOnline
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}
                title={isOnline ? 'متصل بالإنترنت' : 'غير متصل'}
            >
                {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-3 p-3 rounded-xl ${isOnline
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
            }`}>
            {/* الأيقونة */}
            <div className={`p-2 rounded-lg ${isOnline
                ? 'bg-green-100 dark:bg-green-900/40'
                : 'bg-orange-100 dark:bg-orange-900/40'
                }`}>
                {isOnline ? (
                    <Cloud className="text-green-600 dark:text-green-400" size={20} />
                ) : (
                    <CloudOff className="text-orange-600 dark:text-orange-400" size={20} />
                )}
            </div>

            {/* المعلومات */}
            <div className="flex-1">
                <p className={`font-medium text-sm ${isOnline
                    ? 'text-green-800 dark:text-green-300'
                    : 'text-orange-800 dark:text-orange-300'
                    }`}>
                    {isOnline ? 'متصل بالإنترنت' : 'غير متصل'}
                </p>

                {showDetails && stats.lastCheckAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        آخر فحص: {new Date(stats.lastCheckAt).toLocaleTimeString('ar-SA')}
                    </p>
                )}

                {!isOnline && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                        يتطلب اتصال بالإنترنت للعمل
                    </p>
                )}
            </div>
        </div>
    );
};

export default OnlineStatusIndicator;

