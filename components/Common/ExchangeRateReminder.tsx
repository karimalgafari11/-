/**
 * ExchangeRateReminder Component
 * مكون للتذكير بتحديث أسعار الصرف
 * يظهر تنبيه إذا مضى أكثر من أسبوع على آخر تحديث
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, RefreshCw, TrendingUp } from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';
import { SafeStorage } from '../../utils/storage';

const REMINDER_DISMISSED_KEY = 'alzhra_exchange_reminder_dismissed';

const ExchangeRateReminder: React.FC = () => {
    const { checkExchangeRateAge, getCurrentRate, BASE_CURRENCY } = useCurrency();
    const [isVisible, setIsVisible] = useState(false);
    const [rateInfo, setRateInfo] = useState<{
        isStale: boolean;
        daysSinceUpdate: number;
        lastUpdate: string | null;
    }>({ isStale: false, daysSinceUpdate: 0, lastUpdate: null });

    useEffect(() => {
        const info = checkExchangeRateAge();
        setRateInfo(info);

        // التحقق من تاريخ آخر إغلاق للتنبيه
        const lastDismissed = SafeStorage.get<string | null>(REMINDER_DISMISSED_KEY, null);

        if (info.isStale) {
            if (!lastDismissed) {
                setIsVisible(true);
            } else {
                // إظهار التنبيه مرة أخرى بعد يوم من الإغلاق
                const dismissedDate = new Date(lastDismissed);
                const daysSinceDismissed = Math.floor(
                    (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
                );
                if (daysSinceDismissed >= 1) {
                    setIsVisible(true);
                }
            }
        }
    }, [checkExchangeRateAge]);

    const handleDismiss = () => {
        SafeStorage.set(REMINDER_DISMISSED_KEY, new Date().toISOString());
        setIsVisible(false);
    };

    const handleGoToSettings = () => {
        // التوجيه لصفحة الإعدادات
        window.location.hash = '#/settings';
        handleDismiss();
    };

    if (!isVisible) return null;

    const yerRate = getCurrentRate(BASE_CURRENCY, 'YER');
    const omrRate = getCurrentRate(BASE_CURRENCY, 'OMR');

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-1 rounded-xl shadow-2xl">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-lg space-y-3">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                <AlertTriangle className="text-amber-600 dark:text-amber-400" size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 dark:text-white text-sm">
                                    تحديث أسعار الصرف
                                </h3>
                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                    آخر تحديث منذ {rateInfo.daysSinceUpdate} يوم
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                        >
                            <X size={16} className="text-slate-400" />
                        </button>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg space-y-2">
                        <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                            هل تغيرت أسعار الصرف؟ الأسعار الحالية:
                        </p>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <TrendingUp size={14} className="text-blue-500" />
                                <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">
                                    1 {BASE_CURRENCY} = {yerRate.toLocaleString()} YER
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp size={14} className="text-emerald-500" />
                                <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">
                                    1 {BASE_CURRENCY} = {omrRate.toFixed(3)} OMR
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleDismiss}
                            className="flex-1 px-4 py-2 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                        >
                            لاحقاً
                        </button>
                        <button
                            onClick={handleGoToSettings}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider rounded transition-colors"
                        >
                            <RefreshCw size={14} />
                            تحديث الأسعار
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExchangeRateReminder;
