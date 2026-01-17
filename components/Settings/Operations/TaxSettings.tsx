/**
 * Tax Settings Component
 * إعدادات الضرائب
 */

import React from 'react';
import { useSettings } from '../../../context/SettingsContext';
import { useApp } from '../../../context/AppContext';
import SettingsCard from '../SettingsCard';
import SettingsToggle from '../SettingsToggle';
import SettingsInput from '../SettingsInput';
import { Percent, RotateCcw } from 'lucide-react';

const TaxSettings: React.FC = () => {
    const { settings, updateSettings, resetSettings } = useSettings();
    const { showNotification } = useApp();
    const { tax } = settings;

    const handleReset = () => {
        if (confirm('هل تريد استعادة الإعدادات الافتراضية للضرائب؟')) {
            resetSettings('tax');
            showNotification('تم استعادة الإعدادات الافتراضية', 'info');
        }
    };

    return (
        <SettingsCard
            title="إعدادات الضرائب"
            icon={Percent}
            iconColor="text-red-500"
            actions={
                <button onClick={handleReset} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                    <RotateCcw size={16} />
                </button>
            }
        >
            <div className="space-y-4">
                <SettingsToggle
                    label="تفعيل الضرائب"
                    checked={tax.enabled}
                    onChange={(checked) => updateSettings('tax', { enabled: checked })}
                />

                {tax.enabled && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <SettingsInput
                                label="اسم الضريبة"
                                value={tax.taxName}
                                onChange={(val) => updateSettings('tax', { taxName: val })}
                            />
                            <SettingsInput
                                label="الاسم بالإنجليزية"
                                value={tax.taxNameEn || ''}
                                onChange={(val) => updateSettings('tax', { taxNameEn: val })}
                                dir="ltr"
                            />
                        </div>

                        <SettingsInput
                            label="نسبة الضريبة الافتراضية %"
                            value={tax.defaultRate}
                            onChange={(val) => updateSettings('tax', { defaultRate: parseFloat(val) || 0 })}
                            type="number"
                            min={0}
                            max={100}
                            step={0.01}
                        />

                        <SettingsToggle
                            label="الضريبة مشمولة في السعر"
                            description="الأسعار تشمل الضريبة بالفعل"
                            checked={tax.includedInPrice}
                            onChange={(checked) => updateSettings('tax', { includedInPrice: checked })}
                        />

                        <SettingsToggle
                            label="إظهار الضريبة في الفاتورة"
                            checked={tax.showOnInvoice}
                            onChange={(checked) => updateSettings('tax', { showOnInvoice: checked })}
                        />
                    </>
                )}
            </div>
        </SettingsCard>
    );
};

export default TaxSettings;
