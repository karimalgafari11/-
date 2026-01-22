/**
 * جدول السندات - VouchersTable Component
 */

import React from 'react';
import { CheckCircle, Edit, Trash2 } from 'lucide-react';
import { ReceiptVoucher, PaymentVoucher } from '../../../types';
import { VoucherTab } from '../types';
import { Currency } from '../../../types/common';

interface VouchersTableProps {
    theme: string;
    activeTab: VoucherTab;
    filteredReceipts: any[];
    filteredPayments: any[];
    getCurrency: (code: string) => Currency | undefined;
    onEditReceipt: (voucher: ReceiptVoucher) => void;
    onEditPayment: (voucher: PaymentVoucher) => void;
    onDeleteReceipt: (id: string) => void;
    onDeletePayment: (id: string) => void;
}

const VouchersTable: React.FC<VouchersTableProps> = ({
    theme,
    activeTab,
    filteredReceipts,
    filteredPayments,
    getCurrency,
    onEditReceipt,
    onEditPayment,
    onDeleteReceipt,
    onDeletePayment
}) => {
    const handleDeleteClick = (id: string, type: 'receipt' | 'payment') => {
        if (window.confirm('هل أنت متأكد من حذف هذا السند؟\nلا يمكن التراجع عن هذا الإجراء.')) {
            if (type === 'receipt') {
                onDeleteReceipt(id);
            } else {
                onDeletePayment(id);
            }
        }
    };

    // ألوان مشتركة ومتغيرة حسب الثيم لسهولة القراءة
    const isDark = theme === 'dark';

    // تصميم الخلية الأساسي
    const cellClass = `p-4 align-middle transition-colors ${isDark ? 'text-gray-200' : 'text-gray-700'}`;
    const headerClass = `p-4 text-start text-sm font-bold tracking-wide text-white`;
    const rowClass = (index: number) => `
        border-b transition-colors duration-200
        ${isDark
            ? `${index % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-800'} border-gray-700 hover:bg-gray-700`
            : `${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/80'} border-gray-100 hover:bg-blue-50/50`
        }
    `;

    // ألوان النصوص
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';

    return (
        <div className={`rounded-xl border overflow-hidden shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className={`${activeTab === 'receipt' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                            <th className={headerClass}>رقم السند</th>
                            <th className={headerClass}>{activeTab === 'receipt' ? 'العميل' : 'المورد'}</th>
                            <th className={`p-4 text-center font-bold text-white`}>المبلغ</th>
                            <th className={`p-4 text-center font-bold text-white`}>العملة</th>
                            <th className={`p-4 text-center font-bold text-white`}>التاريخ</th>
                            <th className={`p-4 text-center font-bold text-white`}>الحالة</th>
                            <th className={`p-4 text-center font-bold text-white w-28`}>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className={isDark ? 'divide-y divide-gray-700' : 'divide-y divide-gray-100'}>
                        {activeTab === 'receipt' ? (
                            filteredReceipts.length > 0 ? filteredReceipts.map((v, index) => (
                                <tr key={v.id} className={rowClass(index)}>
                                    <td className={cellClass}>
                                        <span className={`font-bold font-mono ${(activeTab as string) === 'receipt' ? (isDark ? 'text-emerald-400' : 'text-emerald-700') : (isDark ? 'text-rose-400' : 'text-rose-700')}`}>
                                            {v.voucherNumber}
                                        </span>
                                    </td>
                                    <td className={cellClass}>
                                        <div className={`font-bold ${textPrimary}`}>{v.customerName}</div>
                                        {v.referenceNumber && <div className={`text-xs ${textSecondary} mt-0.5`}>#{v.referenceNumber}</div>}
                                    </td>
                                    <td className={`${cellClass} text-center`}>
                                        <span className={`text-lg font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {v.amount.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className={`${cellClass} text-center`}>
                                        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold border ${isDark
                                            ? 'bg-gray-700/50 border-gray-600 text-gray-300'
                                            : 'bg-gray-100 border-gray-200 text-gray-600'
                                            }`}>
                                            {getCurrency(v.currency)?.symbol || v.currency}
                                        </span>
                                    </td>
                                    <td className={`${cellClass} text-center`}>
                                        <span className={`font-medium font-mono ${textSecondary}`}>{v.date}</span>
                                    </td>
                                    <td className={`${cellClass} text-center`}>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${activeTab === 'receipt'
                                            ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700')
                                            : (isDark ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-700')
                                            }`}>
                                            <CheckCircle size={12} /> مكتمل
                                        </span>
                                    </td>
                                    <td className={`${cellClass} text-center`}>
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => onEditReceipt(v)}
                                                className={`p-1.5 rounded-lg transition-colors ${isDark
                                                    ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10'
                                                    : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                                                    }`}
                                                title="تعديل"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(v.id, 'receipt')}
                                                className={`p-1.5 rounded-lg transition-colors ${isDark
                                                    ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                                                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                                    }`}
                                                title="حذف"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className={`p-16 text-center ${textSecondary}`}>
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className={`p-4 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                                <CheckCircle className={`opacity-20 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={40} />
                                            </div>
                                            <p>لا توجد سندات قبض مسجلة</p>
                                        </div>
                                    </td>
                                </tr>
                            )
                        ) : (
                            filteredPayments.length > 0 ? filteredPayments.map((v, index) => (
                                <tr key={v.id} className={rowClass(index)}>
                                    <td className={cellClass}>
                                        <span className={`font-bold font-mono ${(activeTab as string) === 'receipt' ? (isDark ? 'text-emerald-400' : 'text-emerald-700') : (isDark ? 'text-rose-400' : 'text-rose-700')}`}>
                                            {v.voucherNumber}
                                        </span>
                                    </td>
                                    <td className={cellClass}>
                                        <div className={`font-bold ${textPrimary}`}>{v.supplierName}</div>
                                        {v.referenceNumber && <div className={`text-xs ${textSecondary} mt-0.5`}>#{v.referenceNumber}</div>}
                                    </td>
                                    <td className={`${cellClass} text-center`}>
                                        <span className={`text-lg font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {v.amount.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className={`${cellClass} text-center`}>
                                        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold border ${isDark
                                            ? 'bg-gray-700/50 border-gray-600 text-gray-300'
                                            : 'bg-gray-100 border-gray-200 text-gray-600'
                                            }`}>
                                            {getCurrency(v.currency)?.symbol || v.currency}
                                        </span>
                                    </td>
                                    <td className={`${cellClass} text-center`}>
                                        <span className={`font-medium font-mono ${textSecondary}`}>{v.date}</span>
                                    </td>
                                    <td className={`${cellClass} text-center`}>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${(activeTab as string) === 'receipt'
                                            ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700')
                                            : (isDark ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-700')
                                            }`}>
                                            <CheckCircle size={12} /> مكتمل
                                        </span>
                                    </td>
                                    <td className={`${cellClass} text-center`}>
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => onEditPayment(v)}
                                                className={`p-1.5 rounded-lg transition-colors ${isDark
                                                    ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10'
                                                    : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                                                    }`}
                                                title="تعديل"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(v.id, 'payment')}
                                                className={`p-1.5 rounded-lg transition-colors ${isDark
                                                    ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                                                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                                    }`}
                                                title="حذف"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className={`p-16 text-center ${textSecondary}`}>
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className={`p-4 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                                <CheckCircle className={`opacity-20 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={40} />
                                            </div>
                                            <p>لا توجد سندات دفع مسجلة</p>
                                        </div>
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VouchersTable;
