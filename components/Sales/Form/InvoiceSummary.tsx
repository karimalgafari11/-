/**
 * ملخص الفاتورة
 */

import React from 'react';
import { InvoiceSummaryProps } from './types';

const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({
    subtotal,
    displayAmount,
    selectedCurrency
}) => {
    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 p-6 rounded-2xl shadow-2xl">
            {/* خط مضيء */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-orange-500" />

            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                <span className="text-slate-400 font-bold">المجموع بالسعودي</span>
                <span className="text-white font-black text-xl tabular-nums">{subtotal.toLocaleString()} ر.س</span>
            </div>
            <div className="flex justify-between items-center">
                <div>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-black text-xl">المبلغ المطلوب</span>
                    <p className="text-[10px] text-slate-500">{selectedCurrency?.nameAr}</p>
                </div>
                <div className="text-end">
                    <span className="text-4xl font-black text-white tabular-nums">
                        {displayAmount.toLocaleString()}
                    </span>
                    <span className="text-cyan-400 text-lg font-black mr-2">{selectedCurrency?.symbol}</span>
                </div>
            </div>
        </div>
    );
};

export default InvoiceSummary;
