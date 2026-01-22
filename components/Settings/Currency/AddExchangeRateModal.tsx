/**
 * AddExchangeRateModal Component
 * نافذة إضافة سعر صرف جديد
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import SettingsInput from '../SettingsInput';
import SettingsSelect from '../SettingsSelect';
import { Currency } from '../../../types/common';

interface NewRate {
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    note: string;
}

interface AddExchangeRateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (rate: Omit<NewRate, 'note'> & { date: string; note: string; createdBy: string }) => void;
    currencies: Currency[];
    showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const getInitialState = (): NewRate => ({
    fromCurrency: '',
    toCurrency: '',
    rate: 0,
    note: ''
});

const AddExchangeRateModal: React.FC<AddExchangeRateModalProps> = ({
    isOpen,
    onClose,
    onAdd,
    currencies,
    showNotification
}) => {
    const [newRate, setNewRate] = useState<NewRate>(getInitialState());

    const handleAdd = () => {
        if (!newRate.fromCurrency || !newRate.toCurrency || newRate.rate <= 0) {
            showNotification('يرجى ملء جميع الحقول بشكل صحيح', 'error');
            return;
        }

        if (newRate.fromCurrency === newRate.toCurrency) {
            showNotification('لا يمكن تحويل العملة لنفسها', 'error');
            return;
        }

        onAdd({
            fromCurrency: newRate.fromCurrency,
            toCurrency: newRate.toCurrency,
            rate: newRate.rate,
            date: new Date().toISOString().split('T')[0],
            note: newRate.note,
            createdBy: 'user'
        });

        setNewRate(getInitialState());
        onClose();
        showNotification('تم إضافة سعر الصرف بنجاح', 'success');
    };

    const handleClose = () => {
        setNewRate(getInitialState());
        onClose();
    };

    const activeCurrencies = currencies.filter((c) => c.isActive);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                        تحديث سعر الصرف
                    </h3>
                    <button
                        onClick={handleClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <SettingsSelect
                            label="من عملة"
                            value={newRate.fromCurrency}
                            onChange={(val) => setNewRate((prev) => ({ ...prev, fromCurrency: val }))}
                            options={activeCurrencies.map((c) => ({
                                value: c.code,
                                label: `${c.nameAr} (${c.code})`
                            }))}
                            placeholder="اختر..."
                        />
                        <SettingsSelect
                            label="إلى عملة"
                            value={newRate.toCurrency}
                            onChange={(val) => setNewRate((prev) => ({ ...prev, toCurrency: val }))}
                            options={activeCurrencies
                                .filter((c) => c.code !== newRate.fromCurrency)
                                .map((c) => ({
                                    value: c.code,
                                    label: `${c.nameAr} (${c.code})`
                                }))}
                            placeholder="اختر..."
                        />
                    </div>

                    <SettingsInput
                        label="سعر الصرف"
                        value={newRate.rate}
                        onChange={(val) => setNewRate((prev) => ({ ...prev, rate: parseFloat(val) || 0 }))}
                        type="number"
                        step={0.0001}
                        min={0}
                        description={
                            newRate.fromCurrency && newRate.toCurrency
                                ? `1 ${newRate.fromCurrency} = ${newRate.rate || '?'} ${newRate.toCurrency}`
                                : undefined
                        }
                    />

                    <SettingsInput
                        label="ملاحظة (اختياري)"
                        value={newRate.note}
                        onChange={(val) => setNewRate((prev) => ({ ...prev, note: val }))}
                        placeholder="مثال: سعر السوق الموازي"
                    />
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={handleAdd}
                        className="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-colors"
                    >
                        حفظ السعر
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddExchangeRateModal;
