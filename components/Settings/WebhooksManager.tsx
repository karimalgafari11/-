/**
 * Webhooks Manager Component
 * إدارة Webhooks
 */

import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useApp } from '../../context/AppContext';
import SettingsCard from './SettingsCard';
import SettingsInput from './SettingsInput';
import SettingsToggle from './SettingsToggle';
import {
    Webhook, Plus, Trash2, Edit2, Check, X,
    Play, Pause, AlertCircle, CheckCircle,
    Clock, Zap, Link, Key, RefreshCw
} from 'lucide-react';
import { Webhook as WebhookType, WebhookEvent } from '../../types/settings-extended';

const WEBHOOK_EVENTS: { id: WebhookEvent; label: string; category: string }[] = [
    // المبيعات
    { id: 'sale.created', label: 'عملية بيع جديدة', category: 'المبيعات' },
    { id: 'sale.updated', label: 'تحديث عملية بيع', category: 'المبيعات' },
    { id: 'sale.completed', label: 'اكتمال عملية بيع', category: 'المبيعات' },
    // الفواتير
    { id: 'invoice.created', label: 'فاتورة جديدة', category: 'الفواتير' },
    { id: 'invoice.paid', label: 'دفع فاتورة', category: 'الفواتير' },
    { id: 'invoice.overdue', label: 'فاتورة متأخرة', category: 'الفواتير' },
    // المشتريات
    { id: 'purchase.created', label: 'عملية شراء جديدة', category: 'المشتريات' },
    { id: 'purchase.received', label: 'استلام بضاعة', category: 'المشتريات' },
    // المخزون
    { id: 'inventory.low_stock', label: 'مخزون منخفض', category: 'المخزون' },
    { id: 'inventory.updated', label: 'تحديث المخزون', category: 'المخزون' },
    // العملاء
    { id: 'customer.created', label: 'عميل جديد', category: 'العملاء' },
    // الدفعات
    { id: 'payment.received', label: 'استلام دفعة', category: 'الدفعات' },
];

const WebhooksManager: React.FC = () => {
    const { webhooks, addWebhook, updateWebhook, deleteWebhook, testWebhook } = useSettings();
    const { showNotification } = useApp();

    const [showForm, setShowForm] = useState(false);
    const [editingWebhook, setEditingWebhook] = useState<WebhookType | null>(null);
    const [testing, setTesting] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        url: '',
        secret: '',
        events: [] as WebhookEvent[],
        isActive: true,
        verifySSL: true,
        timeout: 30,
        retryCount: 3,
        retryDelay: 60
    });

    const resetForm = () => {
        setFormData({
            name: '',
            url: '',
            secret: '',
            events: [],
            isActive: true,
            verifySSL: true,
            timeout: 30,
            retryCount: 3,
            retryDelay: 60
        });
        setEditingWebhook(null);
        setShowForm(false);
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.url) {
            showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        if (formData.events.length === 0) {
            showNotification('يرجى اختيار حدث واحد على الأقل', 'error');
            return;
        }

        if (editingWebhook) {
            updateWebhook({
                ...editingWebhook,
                ...formData
            });
            showNotification('تم تحديث Webhook بنجاح', 'success');
        } else {
            addWebhook(formData);
            showNotification('تم إضافة Webhook بنجاح', 'success');
        }

        resetForm();
    };

    const handleEdit = (webhook: WebhookType) => {
        setFormData({
            name: webhook.name,
            url: webhook.url,
            secret: webhook.secret || '',
            events: webhook.events,
            isActive: webhook.isActive,
            verifySSL: webhook.verifySSL,
            timeout: webhook.timeout,
            retryCount: webhook.retryCount,
            retryDelay: webhook.retryDelay
        });
        setEditingWebhook(webhook);
        setShowForm(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذا Webhook؟')) {
            deleteWebhook(id);
            showNotification('تم حذف Webhook', 'info');
        }
    };

    const handleTest = async (id: string) => {
        setTesting(id);
        const success = await testWebhook(id);
        setTesting(null);

        if (success) {
            showNotification('تم اختبار Webhook بنجاح', 'success');
        } else {
            showNotification('فشل اختبار Webhook', 'error');
        }
    };

    const toggleEvent = (eventId: WebhookEvent) => {
        setFormData(prev => ({
            ...prev,
            events: prev.events.includes(eventId)
                ? prev.events.filter(e => e !== eventId)
                : [...prev.events, eventId]
        }));
    };

    const groupedEvents = WEBHOOK_EVENTS.reduce((acc, event) => {
        if (!acc[event.category]) {
            acc[event.category] = [];
        }
        acc[event.category].push(event);
        return acc;
    }, {} as Record<string, typeof WEBHOOK_EVENTS>);

    return (
        <div className="space-y-6">
            {/* Active Webhooks */}
            <SettingsCard
                title="Webhooks"
                description="ربط التطبيق بأنظمة خارجية عبر HTTP callbacks"
                icon={Webhook}
                iconColor="text-orange-500"
                actions={
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={14} />
                        إضافة Webhook
                    </button>
                }
            >
                {webhooks.length === 0 ? (
                    <div className="text-center py-8">
                        <Webhook size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-sm text-gray-500">لا توجد Webhooks مضافة</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="mt-3 text-sm text-primary font-bold hover:underline"
                        >
                            إضافة أول Webhook
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {webhooks.map((webhook) => (
                            <div
                                key={webhook.id}
                                className={`p-4 rounded-2xl border transition-all ${webhook.isActive
                                        ? 'border-gray-200 dark:border-gray-700'
                                        : 'border-gray-100 dark:border-gray-800 opacity-60'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`w-2 h-2 rounded-full ${webhook.isActive ? 'bg-green-500' : 'bg-gray-400'
                                                }`} />
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                                                {webhook.name}
                                            </h4>
                                            {webhook.lastStatus && (
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${webhook.lastStatus === 'success'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    {webhook.lastStatus === 'success' ? '✓ نجح' : '✗ فشل'}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-[11px] text-gray-500 font-mono truncate mb-2">
                                            {webhook.url}
                                        </p>

                                        <div className="flex flex-wrap gap-1">
                                            {webhook.events.slice(0, 3).map((event) => (
                                                <span
                                                    key={event}
                                                    className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400"
                                                >
                                                    {WEBHOOK_EVENTS.find(e => e.id === event)?.label || event}
                                                </span>
                                            ))}
                                            {webhook.events.length > 3 && (
                                                <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
                                                    +{webhook.events.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 ms-3">
                                        <button
                                            onClick={() => handleTest(webhook.id)}
                                            disabled={testing === webhook.id}
                                            className="p-2 text-gray-400 hover:text-green-500 rounded-lg transition-colors"
                                            title="اختبار"
                                        >
                                            {testing === webhook.id ? (
                                                <RefreshCw size={16} className="animate-spin" />
                                            ) : (
                                                <Zap size={16} />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(webhook)}
                                            className="p-2 text-gray-400 hover:text-primary rounded-lg transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(webhook.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                        <CheckCircle size={12} className="text-green-500" />
                                        <span>{webhook.successCount} نجاح</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                        <AlertCircle size={12} className="text-red-500" />
                                        <span>{webhook.failureCount} فشل</span>
                                    </div>
                                    {webhook.lastTriggered && (
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                            <Clock size={12} />
                                            <span>آخر تشغيل: {new Date(webhook.lastTriggered).toLocaleDateString('ar')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SettingsCard>

            {/* Add/Edit Webhook Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                                {editingWebhook ? 'تعديل Webhook' : 'إضافة Webhook جديد'}
                            </h3>
                            <button
                                onClick={resetForm}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <SettingsInput
                                label="الاسم"
                                value={formData.name}
                                onChange={(val) => setFormData(prev => ({ ...prev, name: val }))}
                                placeholder="إشعار المبيعات"
                                required
                            />

                            <SettingsInput
                                label="URL"
                                value={formData.url}
                                onChange={(val) => setFormData(prev => ({ ...prev, url: val }))}
                                type="url"
                                icon={Link}
                                dir="ltr"
                                placeholder="https://api.example.com/webhook"
                                required
                            />

                            <SettingsInput
                                label="Secret (اختياري)"
                                value={formData.secret}
                                onChange={(val) => setFormData(prev => ({ ...prev, secret: val }))}
                                type="password"
                                icon={Key}
                                dir="ltr"
                                description="سيُرسل في header كـ X-Webhook-Secret"
                            />

                            {/* Events Selection */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                    الأحداث <span className="text-red-500">*</span>
                                </label>

                                {Object.entries(groupedEvents).map(([category, events]) => (
                                    <div key={category}>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">
                                            {category}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {events.map((event) => (
                                                <button
                                                    key={event.id}
                                                    type="button"
                                                    onClick={() => toggleEvent(event.id)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.events.includes(event.id)
                                                            ? 'bg-primary text-white'
                                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    {event.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <SettingsInput
                                    label="Timeout (ثانية)"
                                    value={formData.timeout}
                                    onChange={(val) => setFormData(prev => ({ ...prev, timeout: parseInt(val) || 30 }))}
                                    type="number"
                                    min={5}
                                    max={120}
                                />
                                <SettingsInput
                                    label="عدد المحاولات"
                                    value={formData.retryCount}
                                    onChange={(val) => setFormData(prev => ({ ...prev, retryCount: parseInt(val) || 3 }))}
                                    type="number"
                                    min={0}
                                    max={10}
                                />
                            </div>

                            <SettingsToggle
                                label="تفعيل Webhook"
                                checked={formData.isActive}
                                onChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                            />

                            <SettingsToggle
                                label="التحقق من SSL"
                                description="تعطيل هذا للاختبار فقط"
                                checked={formData.verifySSL}
                                onChange={(checked) => setFormData(prev => ({ ...prev, verifySSL: checked }))}
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={resetForm}
                                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
                            >
                                {editingWebhook ? 'حفظ التعديلات' : 'إضافة'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WebhooksManager;
