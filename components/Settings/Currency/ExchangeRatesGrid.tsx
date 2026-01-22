/**
 * ExchangeRatesGrid Component
 * شبكة عرض أسعار الصرف الحالية
 */

import React from 'react';
import { ArrowRightLeft, TrendingUp, History } from 'lucide-react';
import { Currency, ExchangeRateRecord } from '../../../types/common';

interface ExchangeRatesGridProps {
    currencies: Currency[];
    exchangeRates: ExchangeRateRecord[];
    getExchangeHistory: (from: string, to: string, limit: number) => ExchangeRateRecord[];
}

const ExchangeRatesGrid: React.FC<ExchangeRatesGridProps> = ({
    currencies,
    exchangeRates,
    getExchangeHistory
}) => {
    const activeCurrencies = currencies.filter((c) => c.isActive);

    return (
        <>
            {/* Current Rates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeCurrencies.map((fromCurrency) =>
                    activeCurrencies
                        .filter((tc) => tc.code !== fromCurrency.code)
                        .slice(0, 2)
                        .map((toCurrency) => {
                            const history = getExchangeHistory(fromCurrency.code, toCurrency.code, 1);
                            const rate = history[0];

                            return rate ? (
                                <div
                                    key={`${fromCurrency.code}-${toCurrency.code}`}
                                    className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100">
                                            <span>{fromCurrency.code}</span>
                                            <ArrowRightLeft size={14} className="text-gray-400" />
                                            <span>{toCurrency.code}</span>
                                        </div>
                                        <TrendingUp size={14} className="text-green-500" />
                                    </div>
                                    <p className="text-xl font-black text-primary">
                                        {rate.fromCurrency === fromCurrency.code
                                            ? rate.rate.toLocaleString()
                                            : (1 / rate.rate).toFixed(4)}
                                    </p>
                                    <p className="text-[10px] text-gray-500 mt-1">
                                        آخر تحديث: {new Date(rate.date).toLocaleDateString('ar')}
                                    </p>
                                </div>
                            ) : null;
                        })
                )}
            </div>

            {/* Recent History */}
            {exchangeRates.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 mb-3">
                        <History size={14} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-500">آخر التحديثات</span>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {exchangeRates.slice(0, 10).map((rate) => (
                            <div
                                key={rate.id}
                                className="flex items-center justify-between text-xs py-2 border-b border-gray-50 dark:border-gray-800 last:border-0"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-700 dark:text-gray-300">
                                        {rate.fromCurrency} → {rate.toCurrency}
                                    </span>
                                    <span className="text-primary font-black">{rate.rate}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    {rate.note && <span className="text-[10px]">{rate.note}</span>}
                                    <span>{new Date(rate.date).toLocaleDateString('ar')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default ExchangeRatesGrid;
