/**
 * Invoice Settings Component
 * إعدادات الفواتير
 */

import React from 'react';
import { useSettings } from '../../../context/SettingsContext';
import { useApp } from '../../../context/AppContext';
import SettingsCard from '../SettingsCard';
import SettingsToggle from '../SettingsToggle';
import SettingsSelect from '../SettingsSelect';
import SettingsInput from '../SettingsInput';
import { Receipt, RotateCcw } from 'lucide-react';

const InvoiceSettings: React.FC = () => {
    const { settings, updateSettings, resetSettings } = useSettings();
    const { showNotification } = useApp();
    const { invoice } = settings;

    const handleReset = () => {
        if (confirm('هل تريد استعادة الإعدادات الافتراضية للفواتير؟')) {
            resetSettings('invoice');
            showNotification('تم استعادة الإعدادات الافتراضية', 'info');
        }
    };

    return (
        <SettingsCard
            title="إعدادات الفواتير"
            icon={Receipt}
            iconColor="text-indigo-500"
            actions={
                <button onClick={handleReset} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                    <RotateCcw size={16} />
                </button>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <SettingsInput
                        label="بادئة فواتير المبيعات"
                        value={invoice.salesPrefix}
                        onChange={(val) => updateSettings('invoice', { salesPrefix: val })}
                        dir="ltr"
                    />
                    <SettingsInput
                        label="الرقم التالي"
                        value={invoice.salesNextNumber}
                        onChange={(val) => updateSettings('invoice', { salesNextNumber: parseInt(val) || 1 })}
                        type="number"
                        min={1}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <SettingsInput
                        label="بادئة أوامر الشراء"
                        value={invoice.purchasePrefix}
                        onChange={(val) => updateSettings('invoice', { purchasePrefix: val })}
                        dir="ltr"
                    />
                    <SettingsInput
                        label="الرقم التالي"
                        value={invoice.purchaseNextNumber}
                        onChange={(val) => updateSettings('invoice', { purchaseNextNumber: parseInt(val) || 1 })}
                        type="number"
                        min={1}
                    />
                </div>

                <SettingsInput
                    label="مدة السداد الافتراضية (أيام)"
                    value={invoice.defaultDueDays}
                    onChange={(val) => updateSettings('invoice', { defaultDueDays: parseInt(val) || 30 })}
                    type="number"
                    min={0}
                />

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3">عناصر الفاتورة</p>

                    <div className="grid grid-cols-2 gap-3">
                        <SettingsToggle
                            label="إظهار الشعار"
                            checked={invoice.showLogo}
                            onChange={(checked) => updateSettings('invoice', { showLogo: checked })}
                            size="sm"
                        />
                        <SettingsToggle
                            label="QR Code"
                            checked={invoice.showQRCode}
                            onChange={(checked) => updateSettings('invoice', { showQRCode: checked })}
                            size="sm"
                        />
                        <SettingsToggle
                            label="ملاحظات"
                            checked={invoice.showNotes}
                            onChange={(checked) => updateSettings('invoice', { showNotes: checked })}
                            size="sm"
                        />
                        <SettingsToggle
                            label="شروط الدفع"
                            checked={invoice.showPaymentTerms}
                            onChange={(checked) => updateSettings('invoice', { showPaymentTerms: checked })}
                            size="sm"
                        />
                        <SettingsToggle
                            label="التوقيع"
                            checked={invoice.showSignature}
                            onChange={(checked) => updateSettings('invoice', { showSignature: checked })}
                            size="sm"
                        />
                        <SettingsToggle
                            label="بيانات البنك"
                            checked={invoice.showBankDetails}
                            onChange={(checked) => updateSettings('invoice', { showBankDetails: checked })}
                            size="sm"
                        />
                    </div>
                </div>

                <SettingsSelect
                    label="قالب الفاتورة"
                    value={invoice.template}
                    onChange={(val) => updateSettings('invoice', { template: val as any })}
                    options={[
                        { value: 'modern', label: 'عصري' },
                        { value: 'classic', label: 'كلاسيكي' },
                        { value: 'minimal', label: 'بسيط' },
                        { value: 'detailed', label: 'تفصيلي' }
                    ]}
                />
            </div>
        </SettingsCard>
    );
};

export default InvoiceSettings;
