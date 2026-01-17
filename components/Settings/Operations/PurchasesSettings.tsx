/**
 * Purchases Settings Component
 * إعدادات المشتريات
 */

import React from 'react';
import { useSettings } from '../../../context/SettingsContext';
import { useApp } from '../../../context/AppContext';
import SettingsCard from '../SettingsCard';
import SettingsToggle from '../SettingsToggle';
import SettingsSelect from '../SettingsSelect';
import SettingsInput from '../SettingsInput';
import { Package, RotateCcw } from 'lucide-react';

const PurchasesSettings: React.FC = () => {
    const { settings, updateSettings, resetSettings } = useSettings();
    const { showNotification } = useApp();
    const { purchase } = settings;

    const handleReset = () => {
        if (confirm('هل تريد استعادة الإعدادات الافتراضية للمشتريات؟')) {
            resetSettings('purchase');
            showNotification('تم استعادة الإعدادات الافتراضية', 'info');
        }
    };

    return (
        <SettingsCard
            title="إعدادات المشتريات"
            icon={Package}
            iconColor="text-blue-500"
            actions={
                <button onClick={handleReset} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                    <RotateCcw size={16} />
                </button>
            }
        >
            <div className="space-y-4">
                <SettingsToggle
                    label="المورد إلزامي"
                    description="يجب اختيار مورد لكل عملية شراء"
                    checked={purchase.requireSupplier}
                    onChange={(checked) => updateSettings('purchase', { requireSupplier: checked })}
                />

                <SettingsToggle
                    label="أمر شراء إلزامي"
                    description="إنشاء أمر شراء قبل الاستلام"
                    checked={purchase.requirePurchaseOrder}
                    onChange={(checked) => updateSettings('purchase', { requirePurchaseOrder: checked })}
                />

                <SettingsToggle
                    label="تحديث التكلفة تلقائياً"
                    description="تحديث سعر التكلفة عند الشراء"
                    checked={purchase.autoUpdateCost}
                    onChange={(checked) => updateSettings('purchase', { autoUpdateCost: checked })}
                />

                {purchase.autoUpdateCost && (
                    <SettingsSelect
                        label="طريقة حساب التكلفة"
                        value={purchase.costUpdateMethod}
                        onChange={(val) => updateSettings('purchase', { costUpdateMethod: val as any })}
                        options={[
                            { value: 'last', label: 'آخر سعر شراء' },
                            { value: 'average', label: 'المتوسط المرجح' },
                            { value: 'fifo', label: 'FIFO (الأقدم أولاً)' }
                        ]}
                    />
                )}

                <SettingsInput
                    label="شروط الدفع (أيام)"
                    value={purchase.defaultPaymentTerms}
                    onChange={(val) => updateSettings('purchase', { defaultPaymentTerms: parseInt(val) || 30 })}
                    type="number"
                    min={0}
                />

                <SettingsToggle
                    label="استلام تلقائي"
                    description="استلام البضاعة تلقائياً عند الشراء"
                    checked={purchase.autoReceive}
                    onChange={(checked) => updateSettings('purchase', { autoReceive: checked })}
                />
            </div>
        </SettingsCard>
    );
};

export default PurchasesSettings;
