/**
 * MessagingSettings - إعدادات المراسلة
 * واجهة إعداد WhatsApp و Telegram
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
    MessageCircle, Send, Bot, Phone, Key, Link, Bell,
    CheckCircle, XCircle, Loader2, RefreshCw, TestTube
} from 'lucide-react';
import { messagingManager, MessagingSettings as MessagingSettingsType, WhatsAppConfig, TelegramConfig } from '../../services/messaging';

const MessagingSettings: React.FC = () => {
    const { theme, showNotification } = useApp();
    const isDark = theme === 'dark';

    const [settings, setSettings] = useState<MessagingSettingsType>(messagingManager.getSettings());
    const [whatsappTesting, setWhatsappTesting] = useState(false);
    const [telegramTesting, setTelegramTesting] = useState(false);
    const [telegramBotInfo, setTelegramBotInfo] = useState<{ username?: string; name?: string } | null>(null);

    // حفظ الإعدادات عند التغيير
    const saveSettings = (newSettings: MessagingSettingsType) => {
        setSettings(newSettings);
        messagingManager.updateSettings(newSettings);
        showNotification('تم حفظ الإعدادات بنجاح');
    };

    // تحديث إعدادات WhatsApp
    const updateWhatsApp = (updates: Partial<WhatsAppConfig>) => {
        const newSettings = {
            ...settings,
            whatsapp: { ...settings.whatsapp, ...updates }
        };
        saveSettings(newSettings);
    };

    // تحديث إعدادات Telegram
    const updateTelegram = (updates: Partial<TelegramConfig>) => {
        const newSettings = {
            ...settings,
            telegram: { ...settings.telegram, ...updates }
        };
        saveSettings(newSettings);
    };

    // اختبار WhatsApp
    const testWhatsApp = async () => {
        setWhatsappTesting(true);
        try {
            const success = await messagingManager.testWhatsApp();
            showNotification(
                success ? 'اتصال WhatsApp ناجح ✓' : 'فشل الاتصال بـ WhatsApp',
                success ? 'success' : 'error'
            );
        } catch {
            showNotification('خطأ في اختبار WhatsApp', 'error');
        }
        setWhatsappTesting(false);
    };

    // اختبار Telegram
    const testTelegram = async () => {
        setTelegramTesting(true);
        try {
            const info = await messagingManager.getTelegramBotInfo();
            if (info.ok) {
                setTelegramBotInfo({ username: info.username, name: info.name });
                showNotification(`اتصال ناجح: @${info.username}`, 'success');
            } else {
                showNotification('فشل الاتصال بـ Telegram', 'error');
            }
        } catch {
            showNotification('خطأ في اختبار Telegram', 'error');
        }
        setTelegramTesting(false);
    };

    const inputClass = `w-full px-4 py-3 rounded-xl border ${isDark
        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500'
        : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'
        } outline-none transition-colors font-medium text-sm`;

    const cardClass = `p-6 rounded-2xl border ${isDark
        ? 'bg-slate-900/50 border-slate-800'
        : 'bg-white border-slate-200 shadow-sm'
        }`;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* رأس الصفحة */}
            <div className={`p-6 rounded-2xl ${isDark ? 'bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border border-cyan-500/20' : 'bg-gradient-to-r from-cyan-50 to-purple-50'}`}>
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-cyan-500/20' : 'bg-cyan-100'}`}>
                        <MessageCircle size={28} className="text-cyan-500" />
                    </div>
                    <div>
                        <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            إعدادات المراسلة
                        </h2>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            تكامل WhatsApp و Telegram للإشعارات
                        </p>
                    </div>
                </div>
            </div>

            {/* WhatsApp Settings */}
            <div className={cardClass}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <Phone size={20} className="text-green-500" />
                        </div>
                        <div>
                            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>WhatsApp Business API</h3>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>إرسال رسائل للعملاء</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.whatsapp.enabled}
                            onChange={(e) => updateWhatsApp({ enabled: e.target.checked })}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:ring-2 peer-focus:ring-green-500/50 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                </div>

                {settings.whatsapp.enabled && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    Phone Number ID
                                </label>
                                <input
                                    type="text"
                                    value={settings.whatsapp.phoneNumberId}
                                    onChange={(e) => updateWhatsApp({ phoneNumberId: e.target.value })}
                                    placeholder="123456789..."
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    Business Account ID
                                </label>
                                <input
                                    type="text"
                                    value={settings.whatsapp.businessAccountId}
                                    onChange={(e) => updateWhatsApp({ businessAccountId: e.target.value })}
                                    placeholder="123456789..."
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                Access Token
                            </label>
                            <input
                                type="password"
                                value={settings.whatsapp.accessToken}
                                onChange={(e) => updateWhatsApp({ accessToken: e.target.value })}
                                placeholder="EAAxxxxxxx..."
                                className={inputClass}
                            />
                        </div>

                        <button
                            onClick={testWhatsApp}
                            disabled={whatsappTesting}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${isDark
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                                }`}
                        >
                            {whatsappTesting ? <Loader2 size={16} className="animate-spin" /> : <TestTube size={16} />}
                            اختبار الاتصال
                        </button>
                    </div>
                )}
            </div>

            {/* Telegram Settings */}
            <div className={cardClass}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Bot size={20} className="text-blue-500" />
                        </div>
                        <div>
                            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Telegram Bot</h3>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>إشعارات للمسؤولين</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.telegram.enabled}
                            onChange={(e) => updateTelegram({ enabled: e.target.checked })}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:ring-2 peer-focus:ring-blue-500/50 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                </div>

                {settings.telegram.enabled && (
                    <div className="space-y-4">
                        <div>
                            <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                Bot Token (من @BotFather)
                            </label>
                            <input
                                type="password"
                                value={settings.telegram.botToken}
                                onChange={(e) => updateTelegram({ botToken: e.target.value })}
                                placeholder="123456:ABC-DEF..."
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                Admin Chat IDs (فصل بفاصلة)
                            </label>
                            <input
                                type="text"
                                value={settings.telegram.adminChatIds.join(', ')}
                                onChange={(e) => updateTelegram({
                                    adminChatIds: e.target.value.split(',').map(id => id.trim()).filter(Boolean)
                                })}
                                placeholder="123456789, 987654321"
                                className={inputClass}
                            />
                        </div>

                        {/* خيارات الإشعارات */}
                        <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                            <h4 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                <Bell size={16} /> إشعارات تلقائية
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { key: 'onSale' as const, label: 'عند البيع' },
                                    { key: 'onPurchase' as const, label: 'عند الشراء' },
                                    { key: 'onLowStock' as const, label: 'مخزون منخفض' },
                                    { key: 'onPayment' as const, label: 'استلام دفعة' },
                                    { key: 'dailyReport' as const, label: 'تقرير يومي' }
                                ].map(({ key, label }) => (
                                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.telegram.notifications[key]}
                                            onChange={(e) => updateTelegram({
                                                notifications: {
                                                    ...settings.telegram.notifications,
                                                    [key]: e.target.checked
                                                }
                                            })}
                                            className="w-4 h-4 rounded accent-blue-500"
                                        />
                                        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={testTelegram}
                                disabled={telegramTesting}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${isDark
                                    ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                    }`}
                            >
                                {telegramTesting ? <Loader2 size={16} className="animate-spin" /> : <TestTube size={16} />}
                                اختبار الاتصال
                            </button>

                            {telegramBotInfo && (
                                <span className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                    ✓ متصل بـ @{telegramBotInfo.username}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* عام */}
            <div className={cardClass}>
                <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    إعدادات عامة
                </h3>
                <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.autoSendInvoice}
                            onChange={(e) => saveSettings({ ...settings, autoSendInvoice: e.target.checked })}
                            className="w-4 h-4 rounded accent-cyan-500"
                        />
                        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            إرسال الفواتير تلقائياً للعملاء
                        </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.autoSendReminder}
                            onChange={(e) => saveSettings({ ...settings, autoSendReminder: e.target.checked })}
                            className="w-4 h-4 rounded accent-cyan-500"
                        />
                        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            إرسال تذكيرات الدفع تلقائياً
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default MessagingSettings;
