/**
 * محدد عملة المشتريات
 */

import React from 'react';
import { Coins } from 'lucide-react';
import { PurchaseCurrencySelectorProps } from './types';

const PurchaseCurrencySelector: React.FC<PurchaseCurrencySelectorProps> = ({
    currency,
    selectedCurrency,
    activeCurrencies,
    onCurrencyChange
}) => {
    return (
        <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                    <Coins size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">عملة الشراء</span>
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">{selectedCurrency?.nameAr}</p>
                </div>
            </div>
            <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 text-sm font-black text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none rounded-xl transition-all"
            >
                {activeCurrencies.map(curr => (
                    <option key={curr.code} value={curr.code}>
                        {curr.nameAr} ({curr.symbol})
                    </option>
                ))}
            </select>
        </div>
    );
};

export default PurchaseCurrencySelector;
