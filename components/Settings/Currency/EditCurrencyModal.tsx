/**
 * EditCurrencyModal Component
 * نافذة تعديل العملة
 */

import React from 'react';
import { X } from 'lucide-react';
import SettingsInput from '../SettingsInput';
import SettingsToggle from '../SettingsToggle';
import { Currency } from '../../../types/common';

interface EditCurrencyModalProps {
    currency: Currency | null;
    onClose: () => void;
    onUpdate: (currency: Currency) => void;
    onChange: (currency: Currency | null) => void;
    showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const EditCurrencyModal: React.FC<EditCurrencyModalProps> = ({
    currency,
    onClose,
    onUpdate,
    onChange,
    showNotification
}) => {
    if (!currency) return null;

    const handleUpdate = () => {
        onUpdate(currency);
        onClose();
        showNotification('تم تحديث العملة بنجاح', 'success');
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                        تعديل العملة: {currency.code}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <SettingsInput
                        label="الاسم بالعربية"
                        value={currency.nameAr}
                        onChange={(val) => onChange({ ...currency, nameAr: val })}
                    />

                    <SettingsInput
                        label="الاسم بالإنجليزية"
                        value={currency.nameEn}
                        onChange={(val) => onChange({ ...currency, nameEn: val })}
                        dir="ltr"
                    />

                    <SettingsInput
                        label="الرمز"
                        value={currency.symbol}
                        onChange={(val) => onChange({ ...currency, symbol: val })}
                    />

                    <SettingsToggle
                        label="تفعيل العملة"
                        checked={currency.isActive}
                        onChange={(checked) => onChange({ ...currency, isActive: checked })}
                    />
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={handleUpdate}
                        className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
                    >
                        حفظ التعديلات
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditCurrencyModal;
