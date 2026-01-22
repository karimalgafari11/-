/**
 * تبويبات السندات - VoucherTabs Component
 */

import React from 'react';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { VoucherTab } from '../types';

interface VoucherTabsProps {
    theme: string;
    activeTab: VoucherTab;
    setActiveTab: (tab: VoucherTab) => void;
    receiptCount: number;
    paymentCount: number;
}

const VoucherTabs: React.FC<VoucherTabsProps> = ({
    theme,
    activeTab,
    setActiveTab,
    receiptCount,
    paymentCount
}) => {
    return (
        <div className={`flex gap-2 p-1 rounded-xl ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}>
            <button
                onClick={() => setActiveTab('receipt')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'receipt'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : theme === 'light' ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:bg-slate-700'
                    }`}
            >
                <ArrowDownCircle size={18} />
                سندات القبض ({receiptCount})
            </button>
            <button
                onClick={() => setActiveTab('payment')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'payment'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                    : theme === 'light' ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:bg-slate-700'
                    }`}
            >
                <ArrowUpCircle size={18} />
                سندات الدفع ({paymentCount})
            </button>
        </div>
    );
};

export default VoucherTabs;
