/**
 * CurrencyListItem Component
 * عنصر عرض العملة في القائمة
 */

import React from 'react';
import { Star, Edit2, Trash2 } from 'lucide-react';
import { Currency } from '../../../types/common';

interface CurrencyListItemProps {
    currency: Currency;
    language: string;
    onSetDefault: (code: string) => void;
    onEdit: (currency: Currency) => void;
    onDelete: (code: string) => void;
}

const CurrencyListItem: React.FC<CurrencyListItemProps> = ({
    currency,
    language,
    onSetDefault,
    onEdit,
    onDelete
}) => {
    return (
        <div
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${currency.isDefault
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                } ${!currency.isActive ? 'opacity-50' : ''}`}
        >
            <div className="flex items-center gap-4">
                {/* Currency Symbol */}
                <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold ${currency.isDefault
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                >
                    {currency.symbol}
                </div>

                {/* Currency Info */}
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-gray-900 dark:text-gray-100">
                            {language === 'ar' ? currency.nameAr : currency.nameEn}
                        </span>
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                            {currency.code}
                        </span>
                        {currency.isDefault && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                <Star size={10} />
                                افتراضية
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                        {currency.decimalPlaces} خانات عشرية • الرمز{' '}
                        {currency.position === 'before' ? 'قبل' : 'بعد'} المبلغ
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {!currency.isDefault && currency.isActive && (
                    <button
                        onClick={() => onSetDefault(currency.code)}
                        className="p-2 text-gray-400 hover:text-yellow-500 rounded-lg transition-colors"
                        title="تعيين كافتراضية"
                    >
                        <Star size={16} />
                    </button>
                )}

                <button
                    onClick={() => onEdit(currency)}
                    className="p-2 text-gray-400 hover:text-primary rounded-lg transition-colors"
                >
                    <Edit2 size={16} />
                </button>

                {!currency.isDefault && (
                    <button
                        onClick={() => onDelete(currency.code)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default CurrencyListItem;
