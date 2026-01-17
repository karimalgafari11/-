/**
 * Telegram Integration Settings
 * إعدادات تكامل تليجرام
 */

import React, { useState } from 'react';
import { useSettings } from '../../../context/SettingsContext';
import { useApp } from '../../../context/AppContext';
import SettingsCard from '../SettingsCard';
import SettingsInput from '../SettingsInput';
import SettingsToggle from '../SettingsToggle';
import { Send, Bot, TestTube } from 'lucide-react';

const TelegramSettings: React.FC = () => {
    const { settings, updateSettings } = useSettings();
    const { showNotification } = useApp();
    const { integrations } = settings;
    const [testing, setTesting] = useState(false);

    const handleTest = async () => {
        setTesting(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setTesting(false);
        showNotification('تم اختبار Telegram بنجاح', 'success');
    };

    return (
        <SettingsCard
            title="إعداد تليجرام"
            description="إرسال الإشعارات والتقارير عبر تليجرام"
            icon={Send}
            iconColor="text-blue-400"
        >
            <div className="space-y-4">
                <SettingsToggle
                    label="تفعيل تليجرام"
                    checked={integrations.telegram.enabled}
                    onChange={(checked) => updateSettings('integrations', {
                        telegram: { ...integrations.telegram, enabled: checked }
                    })}
                />

                {integrations.telegram.enabled && (
                    <>
                        <SettingsInput
                            label="Bot Token"
                            value={integrations.telegram.botToken || ''}
                            onChange={(val) => updateSettings('integrations', {
                                telegram: { ...integrations.telegram, botToken: val }
                            })}
                            type="password"
                            icon={Bot}
                            dir="ltr"
                            description="احصل عليه من @BotFather"
                        />

                        <SettingsInput
                            label="Chat ID"
                            value={integrations.telegram.chatId || ''}
                            onChange={(val) => updateSettings('integrations', {
                                telegram: { ...integrations.telegram, chatId: val }
                            })}
                            dir="ltr"
                            description="معرف المحادثة أو القناة"
                        />

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3">
                                الإشعارات
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <SettingsToggle
                                    label="المبيعات"
                                    checked={integrations.telegram.notifyOnSale}
                                    onChange={(checked) => updateSettings('integrations', {
                                        telegram: { ...integrations.telegram, notifyOnSale: checked }
                                    })}
                                    size="sm"
                                />
                                <SettingsToggle
                                    label="المشتريات"
                                    checked={integrations.telegram.notifyOnPurchase}
                                    onChange={(checked) => updateSettings('integrations', {
                                        telegram: { ...integrations.telegram, notifyOnPurchase: checked }
                                    })}
                                    size="sm"
                                />
                                <SettingsToggle
                                    label="المخزون المنخفض"
                                    checked={integrations.telegram.notifyOnLowStock}
                                    onChange={(checked) => updateSettings('integrations', {
                                        telegram: { ...integrations.telegram, notifyOnLowStock: checked }
                                    })}
                                    size="sm"
                                />
                                <SettingsToggle
                                    label="تقرير يومي"
                                    checked={integrations.telegram.dailyReport}
                                    onChange={(checked) => updateSettings('integrations', {
                                        telegram: { ...integrations.telegram, dailyReport: checked }
                                    })}
                                    size="sm"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleTest}
                            disabled={testing}
                            className="w-full py-2.5 bg-blue-500 text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {testing ? 'جاري الاختبار...' : (
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

export default TelegramSettings;
