/**
 * AddCurrencyModal Component
 * نافذة إضافة عملة جديدة
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import SettingsInput from '../SettingsInput';
import SettingsSelect from '../SettingsSelect';
import SettingsToggle from '../SettingsToggle';
import { Currency } from '../../../types/common';

interface AddCurrencyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (currency: Omit<Currency, 'createdAt'>) => void;
    existingCodes: string[];
    showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const getInitialState = (): Partial<Currency> => ({
    code: '',
    nameAr: '',
    nameEn: '',
    symbol: '',
    decimalPlaces: 2,
    isActive: true,
    isDefault: false,
    position: 'after'
});

const AddCurrencyModal: React.FC<AddCurrencyModalProps> = ({
    isOpen,
    onClose,
    onAdd,
    existingCodes,
    showNotification
}) => {
    const [newCurrency, setNewCurrency] = useState<Partial<Currency>>(getInitialState());

    const handleAdd = () => {
        if (!newCurrency.code || !newCurrency.nameAr || !newCurrency.symbol) {
            showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        if (existingCodes.includes(newCurrency.code)) {
            showNotification('رمز العملة موجود مسبقاً', 'error');
            return;
        }

        onAdd(newCurrency as Omit<Currency, 'createdAt'>);
        setNewCurrency(getInitialState());
        onClose();
        showNotification('تم إضافة العملة بنجاح', 'success');
    };

    const handleClose = () => {
        setNewCurrency(getInitialState());
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                        إضافة عملة جديدة
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
                        <SettingsInput
                            label="رمز العملة"
                            value={newCurrency.code || ''}
                            onChange={(val) => setNewCurrency((prev) => ({ ...prev, code: val.toUpperCase() }))}
                            placeholder="USD"
                            maxLength={3}
                            dir="ltr"
                            required
                        />
                        <SettingsInput
                            label="الرمز"
                            value={newCurrency.symbol || ''}
                            onChange={(val) => setNewCurrency((prev) => ({ ...prev, symbol: val }))}
                            placeholder="$"
                            maxLength={5}
                            required
                        />
                    </div>

                    <SettingsInput
                        label="الاسم بالعربية"
                        value={newCurrency.nameAr || ''}
                        onChange={(val) => setNewCurrency((prev) => ({ ...prev, nameAr: val }))}
                        placeholder="دولار أمريكي"
                        required
                    />

                    <SettingsInput
                        label="الاسم بالإنجليزية"
                        value={newCurrency.nameEn || ''}
                        onChange={(val) => setNewCurrency((prev) => ({ ...prev, nameEn: val }))}
                        placeholder="US Dollar"
                        dir="ltr"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <SettingsInput
                            label="الخانات العشرية"
                            value={newCurrency.decimalPlaces || 2}
                            onChange={(val) =>
                                setNewCurrency((prev) => ({ ...prev, decimalPlaces: parseInt(val) || 2 }))
                            }
                            type="number"
                            min={0}
                            max={4}
                        />
                        <SettingsSelect
                            label="موضع الرمز"
                            value={newCurrency.position || 'after'}
                            onChange={(val) =>
                                setNewCurrency((prev) => ({ ...prev, position: val as 'before' | 'after' }))
                            }
                            options={[
                                { value: 'before', label: 'قبل المبلغ' },
                                { value: 'after', label: 'بعد المبلغ' }
                            ]}
                        />
                    </div>

                    <SettingsToggle
                        label="تفعيل العملة"
                        checked={newCurrency.isActive || false}
                        onChange={(checked) => setNewCurrency((prev) => ({ ...prev, isActive: checked }))}
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
                        className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
                    >
                        إضافة
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddCurrencyModal;
