/**
 * إحصائيات السندات - VoucherStats Component
 */

import React from 'react';
import { ArrowDownCircle, ArrowUpCircle, Receipt } from 'lucide-react';

interface VoucherStatsProps {
    theme: string;
    isHidden: boolean;
    getTotalReceipts: (currency: string) => number;
    getTotalPayments: (currency: string) => number;
    receiptCount: number;
    paymentCount: number;
}

const VoucherStats: React.FC<VoucherStatsProps> = ({
    theme,
    isHidden,
    getTotalReceipts,
    getTotalPayments,
    receiptCount,
    paymentCount
}) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className={`p-5 rounded-2xl border ${theme === 'light' ? 'bg-white border-emerald-200' : 'bg-emerald-900/20 border-emerald-800/30'}`}>
                <div className="flex items-center gap-3 mb-2">
                    <ArrowDownCircle className="text-emerald-500" size={20} />
                    <span className={`text-xs font-bold ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`}>إجمالي المقبوضات (SAR)</span>
                </div>
                <p className={`text-2xl font-black ${theme === 'light' ? 'text-emerald-900' : 'text-emerald-100'} ${isHidden ? 'blur-sm select-none' : ''}`}>
                    {isHidden ? '••••••' : getTotalReceipts('SAR').toLocaleString()} ر.س
                </p>
            </div>

            <div className={`p-5 rounded-2xl border ${theme === 'light' ? 'bg-white border-blue-200' : 'bg-blue-900/20 border-blue-800/30'}`}>
                <div className="flex items-center gap-3 mb-2">
                    <ArrowDownCircle className="text-blue-500" size={20} />
                    <span className={`text-xs font-bold ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}>إجمالي المقبوضات (YER)</span>
                </div>
                <p className={`text-2xl font-black ${theme === 'light' ? 'text-blue-900' : 'text-blue-100'} ${isHidden ? 'blur-sm select-none' : ''}`}>
                    {isHidden ? '••••••' : getTotalReceipts('YER').toLocaleString()} ﷼
                </p>
            </div>

            <div className={`p-5 rounded-2xl border ${theme === 'light' ? 'bg-white border-rose-200' : 'bg-rose-900/20 border-rose-800/30'}`}>
                <div className="flex items-center gap-3 mb-2">
                    <ArrowUpCircle className="text-rose-500" size={20} />
                    <span className={`text-xs font-bold ${theme === 'light' ? 'text-rose-600' : 'text-rose-400'}`}>إجمالي المدفوعات (SAR)</span>
                </div>
                <p className={`text-2xl font-black ${theme === 'light' ? 'text-rose-900' : 'text-rose-100'} ${isHidden ? 'blur-sm select-none' : ''}`}>
                    {isHidden ? '••••••' : getTotalPayments('SAR').toLocaleString()} ر.س
                </p>
            </div>

            <div className={`p-5 rounded-2xl border ${theme === 'light' ? 'bg-white border-amber-200' : 'bg-amber-900/20 border-amber-800/30'}`}>
                <div className="flex items-center gap-3 mb-2">
                    <Receipt className="text-amber-500" size={20} />
                    <span className={`text-xs font-bold ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`}>عدد السندات</span>
                </div>
                <p className={`text-2xl font-black ${theme === 'light' ? 'text-amber-900' : 'text-amber-100'}`}>
                    {receiptCount + paymentCount}
                </p>
            </div>
        </div>
    );
};

export default VoucherStats;
