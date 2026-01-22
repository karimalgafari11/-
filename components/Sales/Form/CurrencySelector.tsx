/**
 * محدد العملة
 */

import React from 'react';
import { Coins, ArrowLeftRight } from 'lucide-react';
import { CurrencySelectorProps } from './types';

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
    saleCurrency,
    baseCurrency,
    currentRate,
    activeCurrencies,
    onCurrencyChange
}) => {
    return (
        <div className="flex items-center justify-between bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800/50 dark:to-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <Coins size={22} className="text-white" />
                </div>
                <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">عملة البيع</span>
                    {saleCurrency !== baseCurrency && (
                        <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold flex items-center gap-1">
                            <ArrowLeftRight size={10} /> 1 {baseCurrency} = {currentRate.toLocaleString()} {saleCurrency}
                        </p>
                    )}
                </div>
            </div>
            <select
                value={saleCurrency}
                onChange={(e) => onCurrencyChange(e.target.value)}
                className="px-5 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 text-sm font-black text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none rounded-xl transition-all cursor-pointer"
            >
                {activeCurrencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                        {currency.nameAr} ({currency.symbol})
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CurrencySelector;
