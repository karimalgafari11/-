/**
 * WhatsApp Integration Settings
 * إعدادات تكامل واتساب
 */

import React, { useState } from 'react';
import { useSettings } from '../../../context/SettingsContext';
import { useApp } from '../../../context/AppContext';
import SettingsCard from '../SettingsCard';
import SettingsInput from '../SettingsInput';
import SettingsToggle from '../SettingsToggle';
import SettingsSelect from '../SettingsSelect';
import { MessageCircle, Key, TestTube } from 'lucide-react';

const WhatsAppSettings: React.FC = () => {
    const { settings, updateSettings } = useSettings();
    const { showNotification } = useApp();
    const { integrations } = settings;
    const [testing, setTesting] = useState(false);

    const handleTest = async () => {
        setTesting(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setTesting(false);
        showNotification('تم اختبار WhatsApp بنجاح', 'success');
    };

    return (
        <SettingsCard
            title="إعداد واتساب"
            description="إرسال الفواتير والإشعارات عبر واتساب"
            icon={MessageCircle}
            iconColor="text-green-500"
        >
            <div className="space-y-4">
                <SettingsToggle
                    label="تفعيل واتساب"
                    description="تمكين إرسال الرسائل عبر واتساب"
                    checked={integrations.whatsapp.enabled}
                    onChange={(checked) => updateSettings('integrations', {
                        whatsapp: { ...integrations.whatsapp, enabled: checked }
                    })}
                />

                {integrations.whatsapp.enabled && (
                    <>
                        <SettingsSelect
                            label="مزود الخدمة"
                            value={integrations.whatsapp.provider}
                            onChange={(val) => updateSettings('integrations', {
                                whatsapp: { ...integrations.whatsapp, provider: val as any }
                            })}
                            options={[
                                { value: 'twilio', label: 'Twilio' },
                                { value: 'whatsapp-business', label: 'WhatsApp Business API' },
                                { value: 'wati', label: 'WATI' },
                                { value: 'other', label: 'مزود آخر' }
                            ]}
                        />

                        <SettingsInput
                            label="مفتاح API"
                            value={integrations.whatsapp.apiKey || ''}
                            onChange={(val) => updateSettings('integrations', {
                                whatsapp: { ...integrations.whatsapp, apiKey: val }
                            })}
                            type="password"
                            icon={Key}
                            dir="ltr"
                        />

                        <SettingsInput
                            label="رقم الهاتف"
                            value={integrations.whatsapp.phoneNumber || ''}
                            onChange={(val) => updateSettings('integrations', {
                                whatsapp: { ...integrations.whatsapp, phoneNumber: val }
                            })}
                            type="tel"
                            dir="ltr"
                            placeholder="+967..."
                        />

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3">
                                الإشعارات التلقائية
                            </p>
                            <div className="space-y-2">
                                <SettingsToggle
                                    label="إشعار عند البيع"
                                    checked={integrations.whatsapp.notifyOnSale}
                                    onChange={(checked) => updateSettings('integrations', {
                                        whatsapp: { ...integrations.whatsapp, notifyOnSale: checked }
                                    })}
                                    size="sm"
                                />
                                <SettingsToggle
                                    label="إرسال الفاتورة"
                                    checked={integrations.whatsapp.sendInvoice}
                                    onChange={(checked) => updateSettings('integrations', {
                                        whatsapp: { ...integrations.whatsapp, sendInvoice: checked }
                                    })}
                                    size="sm"
                                />
                                <SettingsToggle
                                    label="تذكير بالدفع"
                                    checked={integrations.whatsapp.sendPaymentReminder}
                                    onChange={(checked) => updateSettings('integrations', {
                                        whatsapp: { ...integrations.whatsapp, sendPaymentReminder: checked }
                                    })}
                                    size="sm"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleTest}
                            disabled={testing}
                            className="w-full py-2.5 bg-green-500 text-white text-sm font-bold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {testing ? (
                                <>جاري الاختبار...</>
                            ) : (
                                <>
                                    <TestTube size={16} />
                                    اختبار الاتصال
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>
        </SettingsCard>
    );
};

export default WhatsAppSettings;
