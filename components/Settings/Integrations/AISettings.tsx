/**
 * AI Integration Settings
 * إعدادات الذكاء الاصطناعي
 */

import React, { useState } from 'react';
import { useSettings } from '../../../context/SettingsContext';
import { useApp } from '../../../context/AppContext';
import SettingsCard from '../SettingsCard';
import SettingsInput from '../SettingsInput';
import SettingsToggle from '../SettingsToggle';
import SettingsSelect from '../SettingsSelect';
import { Brain, Key, Sparkles } from 'lucide-react';

const AISettings: React.FC = () => {
    const { settings, updateSettings } = useSettings();
    const { showNotification } = useApp();
    const { ai } = settings;
    const [testing, setTesting] = useState(false);

    const handleTest = async () => {
        setTesting(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setTesting(false);
        showNotification('تم اختبار AI بنجاح', 'success');
    };

    return (
        <SettingsCard
            title="إعداد الذكاء الاصطناعي"
            description="تشغيل المساعد الذكي والتحليلات"
            icon={Brain}
            iconColor="text-purple-500"
        >
            <div className="space-y-4">
                <SettingsToggle
                    label="تفعيل الذكاء الاصطناعي"
                    description="تمكين ميزات AI في التطبيق"
                    checked={ai.enabled}
                    onChange={(checked) => updateSettings('ai', { enabled: checked })}
                />

                {ai.enabled && (
                    <>
                        <SettingsSelect
                            label="مزود الخدمة"
                            value={ai.provider}
                            onChange={(val) => updateSettings('ai', { provider: val as any })}
                            options={[
                                { value: 'gemini', label: 'Google Gemini' },
                                { value: 'deepseek', label: 'DeepSeek' },
                                { value: 'openrouter', label: 'OpenRouter' },
                                { value: 'openai', label: 'OpenAI' },
                                { value: 'anthropic', label: 'Anthropic Claude' },
                                { value: 'custom', label: 'مزود مخصص' }
                            ]}
                        />

                        <SettingsInput
                            label="API Key"
                            value={ai.apiKey || ''}
                            onChange={(val) => updateSettings('ai', { apiKey: val })}
                            type="password"
                            icon={Key}
                            dir="ltr"
                        />

                        {(ai.provider === 'openrouter' || ai.provider === 'custom') && (
                            <SettingsInput
                                label="Base URL"
                                value={ai.baseUrl || ''}
                                onChange={(val) => updateSettings('ai', { baseUrl: val })}
                                type="url"
                                dir="ltr"
                                placeholder="https://api.openrouter.ai/v1"
                            />
                        )}

                        <SettingsInput
                            label="النموذج"
                            value={ai.model || ''}
                            onChange={(val) => updateSettings('ai', { model: val })}
                            dir="ltr"
                            placeholder={
                                ai.provider === 'gemini' ? 'gemini-pro' :
                                    ai.provider === 'openai' ? 'gpt-4' :
                                        ai.provider === 'deepseek' ? 'deepseek-chat' :
                                            'model-name'
                            }
                        />

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3">
                                الميزات المتاحة
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <SettingsToggle
                                    label="المساعد الذكي"
                                    checked={ai.features.chatAssistant}
                                    onChange={(checked) => updateSettings('ai', {
                                        features: { ...ai.features, chatAssistant: checked }
                                    })}
                                    size="sm"
                                />
                                <SettingsToggle
                                    label="اقتراحات ذكية"
                                    checked={ai.features.suggestions}
                                    onChange={(checked) => updateSettings('ai', {
                                        features: { ...ai.features, suggestions: checked }
                                    })}
                                    size="sm"
                                />
                                <SettingsToggle
                                    label="تحليل الفواتير"
                                    checked={ai.features.invoiceAnalysis}
                                    onChange={(checked) => updateSettings('ai', {
                                        features: { ...ai.features, invoiceAnalysis: checked }
                                    })}
                                    size="sm"
                                />
                                <SettingsToggle
                                    label="توليد التقارير"
                                    checked={ai.features.reportGeneration}
                                    onChange={(checked) => updateSettings('ai', {
                                        features: { ...ai.features, reportGeneration: checked }
                                    })}
                                    size="sm"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleTest}
                            disabled={testing}
                            className="w-full py-2.5 bg-purple-500 text-white text-sm font-bold rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {testing ? 'جاري الاختبار...' : (
                                <>
                                    <Sparkles size={16} />
                                    اختبار AI
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>
        </SettingsCard>
    );
};

export default AISettings;
