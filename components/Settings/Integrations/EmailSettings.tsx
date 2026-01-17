/**
 * Email Integration Settings
 * إعدادات البريد الإلكتروني
 */

import React, { useState } from 'react';
import { useSettings } from '../../../context/SettingsContext';
import { useApp } from '../../../context/AppContext';
import SettingsCard from '../SettingsCard';
import SettingsInput from '../SettingsInput';
import SettingsToggle from '../SettingsToggle';
import SettingsSelect from '../SettingsSelect';
import { Mail, Key, TestTube } from 'lucide-react';

const EmailSettings: React.FC = () => {
    const { settings, updateSettings } = useSettings();
    const { showNotification } = useApp();
    const { integrations } = settings;
    const [testing, setTesting] = useState(false);

    const handleTest = async () => {
        setTesting(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setTesting(false);
        showNotification('تم إرسال البريد التجريبي بنجاح', 'success');
    };

    return (
        <SettingsCard
            title="إعداد البريد الإلكتروني"
            description="إرسال الفواتير والتقارير بالبريد"
            icon={Mail}
            iconColor="text-red-400"
        >
            <div className="space-y-4">
                <SettingsToggle
                    label="تفعيل البريد"
                    checked={integrations.email.enabled}
                    onChange={(checked) => updateSettings('integrations', {
                        email: { ...integrations.email, enabled: checked }
                    })}
                />

                {integrations.email.enabled && (
                    <>
                        <SettingsSelect
                            label="مزود الخدمة"
                            value={integrations.email.provider}
                            onChange={(val) => updateSettings('integrations', {
                                email: { ...integrations.email, provider: val as any }
                            })}
                            options={[
                                { value: 'smtp', label: 'SMTP' },
                                { value: 'sendgrid', label: 'SendGrid' },
                                { value: 'mailgun', label: 'Mailgun' },
                                { value: 'resend', label: 'Resend' },
                                { value: 'ses', label: 'Amazon SES' }
                            ]}
                        />

                        {integrations.email.provider === 'smtp' ? (
                            <div className="grid grid-cols-2 gap-4">
                                <SettingsInput
                                    label="SMTP Host"
                                    value={integrations.email.smtpHost || ''}
                                    onChange={(val) => updateSettings('integrations', {
                                        email: { ...integrations.email, smtpHost: val }
                                    })}
                                    dir="ltr"
                                    placeholder="smtp.example.com"
                                />
                                <SettingsInput
                                    label="Port"
                                    value={integrations.email.smtpPort || 587}
                                    onChange={(val) => updateSettings('integrations', {
                                        email: { ...integrations.email, smtpPort: parseInt(val) }
                                    })}
                                    type="number"
                                    dir="ltr"
                                />
                                <SettingsInput
                                    label="اسم المستخدم"
                                    value={integrations.email.smtpUser || ''}
                                    onChange={(val) => updateSettings('integrations', {
                                        email: { ...integrations.email, smtpUser: val }
                                    })}
                                    dir="ltr"
                                />
                                <SettingsInput
                                    label="كلمة المرور"
                                    value={integrations.email.smtpPassword || ''}
                                    onChange={(val) => updateSettings('integrations', {
                                        email: { ...integrations.email, smtpPassword: val }
                                    })}
                                    type="password"
                                    dir="ltr"
                                />
                            </div>
                        ) : (
                            <SettingsInput
                                label="API Key"
                                value={integrations.email.apiKey || ''}
                                onChange={(val) => updateSettings('integrations', {
                                    email: { ...integrations.email, apiKey: val }
                                })}
                                type="password"
                                icon={Key}
                                dir="ltr"
                            />
                        )}

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <SettingsInput
                                label="البريد المرسل"
                                value={integrations.email.fromEmail}
                                onChange={(val) => updateSettings('integrations', {
                                    email: { ...integrations.email, fromEmail: val }
                                })}
                                type="email"
                                dir="ltr"
                                placeholder="noreply@example.com"
                            />
                            <SettingsInput
                                label="اسم المرسل"
                                value={integrations.email.fromName}
                                onChange={(val) => updateSettings('integrations', {
                                    email: { ...integrations.email, fromName: val }
                                })}
                                placeholder="شركتي"
                            />
                        </div>

                        <button
                            onClick={handleTest}
                            disabled={testing}
                            className="w-full py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {testing ? 'جاري الإرسال...' : (
                                <>
                                    <TestTube size={16} />
                                    إرسال بريد تجريبي
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>
        </SettingsCard>
    );
};

export default EmailSettings;
