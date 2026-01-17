/**
 * Sales Settings Component
 * إعدادات المبيعات
 */

import React from 'react';
import { useSettings } from '../../../context/SettingsContext';
import { useApp } from '../../../context/AppContext';
import SettingsCard from '../SettingsCard';
import SettingsToggle from '../SettingsToggle';
import SettingsSelect from '../SettingsSelect';
import SettingsInput from '../SettingsInput';
import { ShoppingCart, RotateCcw } from 'lucide-react';

const SalesSettings: React.FC = () => {
    const { settings, updateSettings, resetSettings } = useSettings();
    const { showNotification } = useApp();
    const { sales } = settings;

    const handleReset = () => {
        if (confirm('هل تريد استعادة الإعدادات الافتراضية للمبيعات؟')) {
            resetSettings('sales');
            showNotification('تم استعادة الإعدادات الافتراضية', 'info');
        }
    };

    return (
        <SettingsCard
            title="إعدادات المبيعات"
            icon={ShoppingCart}
            iconColor="text-green-500"
            actions={
                <button onClick={handleReset} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                    <RotateCcw size={16} />
                </button>
            }
        >
            <div className="space-y-4">
                <SettingsToggle
                    label="السماح بالبيع بالسالب"
                    description="البيع حتى لو لم يتوفر مخزون كافٍ"
                    checked={sales.allowNegativeStock}
                    onChange={(checked) => updateSettings('sales', { allowNegativeStock: checked })}
                />

                <SettingsToggle
                    label="العميل إلزامي"
                    description="يجب اختيار عميل لكل عملية بيع"
                    checked={sales.requireCustomer}
                    onChange={(checked) => updateSettings('sales', { requireCustomer: checked })}
                />

                <SettingsToggle
                    label="إنشاء فاتورة تلقائياً"
                    checked={sales.autoGenerateInvoice}
                    onChange={(checked) => updateSettings('sales', { autoGenerateInvoice: checked })}
                />

                <SettingsSelect
                    label="طريقة الدفع الافتراضية"
                    value={sales.defaultPaymentMethod}
                    onChange={(val) => updateSettings('sales', { defaultPaymentMethod: val as any })}
                    options={[
                        { value: 'cash', label: 'نقداً' },
                        { value: 'bank-transfer', label: 'تحويل بنكي' },
                        { value: 'credit', label: 'آجل' },
                        { value: 'cheque', label: 'شيك' }
                    ]}
                />

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3">الخصومات</p>

                    <SettingsToggle
                        label="السماح بالخصم"
                        checked={sales.allowDiscount}
                        onChange={(checked) => updateSettings('sales', { allowDiscount: checked })}
                    />

                    {sales.allowDiscount && (
                        <div className="mt-3">
                            <SettingsInput
                                label="الحد الأقصى للخصم %"
                                value={sales.maxDiscountPercent}
                                onChange={(val) => updateSettings('sales', { maxDiscountPercent: parseInt(val) || 100 })}
                                type="number"
                                min={0}
                                max={100}
                            />
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3">التقريب</p>

                    <SettingsToggle
                        label="تقريب الإجمالي"
                        checked={sales.roundTotal}
                        onChange={(checked) => updateSettings('sales', { roundTotal: checked })}
                    />

                    {sales.roundTotal && (
                        <div className="grid grid-cols-2 gap-4 mt-3">
                            <SettingsSelect
                                label="طريقة التقريب"
                                value={sales.roundMethod}
                                onChange={(val) => updateSettings('sales', { roundMethod: val as any })}
                                options={[
                                    { value: 'up', label: 'للأعلى' },
                                    { value: 'down', label: 'للأسفل' },
                                    { value: 'nearest', label: 'الأقرب' }
                                ]}
                            />
                            <SettingsInput
                                label="التقريب إلى"
                                value={sales.roundTo}
                                onChange={(val) => updateSettings('sales', { roundTo: parseFloat(val) || 1 })}
                                type="number"
                                min={0.01}
                                step={0.01}
                            />
                        </div>
                    )}
                </div>
            </div>
        </SettingsCard>
    );
};

export default SalesSettings;
