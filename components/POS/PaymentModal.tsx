import React from 'react';
import { Calculator, X, Check } from 'lucide-react';
import { QUICK_AMOUNTS } from './types';

interface PaymentModalProps {
    isOpen: boolean;
    cartTotal: number;
    amountPaid: number;
    onAmountChange: (amount: number) => void;
    onConfirm: () => void;
    onClose: () => void;
    formatCurrency: (amount: number) => string;
}

/**
 * نافذة الدفع النقدي
 */
export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    cartTotal,
    amountPaid,
    onAmountChange,
    onConfirm,
    onClose,
    formatCurrency
}) => {
    if (!isOpen) return null;

    const change = amountPaid - cartTotal;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* رأس النافذة */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                            <Calculator size={20} />
                            الدفع النقدي
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-white/70 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    {/* المبلغ المطلوب */}
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center">
                        <p className="text-xs text-slate-500 mb-1">المطلوب</p>
                        <p className="text-3xl font-black text-slate-800 dark:text-white">
                            {formatCurrency(cartTotal)}
                        </p>
                    </div>

                    {/* إدخال المبلغ المدفوع */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-2">
                            المبلغ المدفوع
                        </label>
                        <input
                            type="number"
                            value={amountPaid || ''}
                            onChange={(e) => onAmountChange(parseFloat(e.target.value) || 0)}
                            className="w-full p-4 text-2xl font-black text-center bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-white"
                            autoFocus
                        />
                    </div>

                    {/* أزرار المبالغ السريعة */}
                    <div className="grid grid-cols-3 gap-2">
                        {QUICK_AMOUNTS.map(amount => (
                            <button
                                key={amount}
                                onClick={() => onAmountChange(amount)}
                                className="py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                            >
                                {amount.toLocaleString()}
                            </button>
                        ))}
                    </div>

                    {/* الباقي */}
                    <div className={`rounded-xl p-4 text-center ${change >= 0
                            ? 'bg-emerald-50 dark:bg-emerald-900/20'
                            : 'bg-rose-50 dark:bg-rose-900/20'
                        }`}>
                        <p className="text-xs text-slate-500 mb-1">
                            {change >= 0 ? 'الباقي' : 'المتبقي'}
                        </p>
                        <p className={`text-2xl font-black ${change >= 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}>
                            {formatCurrency(Math.abs(change))}
                        </p>
                    </div>

                    {/* زر التأكيد */}
                    <button
                        onClick={onConfirm}
                        disabled={amountPaid < cartTotal}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-black py-4 rounded-xl transition-colors text-lg"
                    >
                        <Check size={24} />
                        تأكيد الدفع
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
