/**
 * ملخص فاتورة المشتريات
 */

import React from 'react';
import { PurchaseSummaryProps } from './types';

const PurchaseSummary: React.FC<PurchaseSummaryProps> = ({
    grandTotal,
    selectedCurrency
}) => {
    return (
        <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-cyan-900 p-6 rounded-2xl shadow-2xl">
            <div className="flex justify-between items-center">
                <div>
                    <span className="text-white/70 font-bold text-sm">إجمالي المشتريات</span>
                    <p className="text-[10px] text-white/50">{selectedCurrency?.nameAr}</p>
                </div>
                <span className="text-4xl font-black text-white tabular-nums">
                    {grandTotal.toLocaleString()}
                    <span className="text-emerald-300 text-lg mr-2">{selectedCurrency?.symbol}</span>
                </span>
            </div>
        </div>
    );
};

export default PurchaseSummary;
