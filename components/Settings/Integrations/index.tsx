/**
 * Integrations Hub - Main Component
 * مركز التكاملات
 */

import React, { useState } from 'react';
import { useSettings } from '../../../context/SettingsContext';
import WhatsAppSettings from './WhatsAppSettings';
import TelegramSettings from './TelegramSettings';
import EmailSettings from './EmailSettings';
import AISettings from './AISettings';
import { MessageCircle, Send, Mail, Brain } from 'lucide-react';

type IntegrationTab = 'whatsapp' | 'telegram' | 'email' | 'ai';

const IntegrationsHub: React.FC = () => {
    const { settings } = useSettings();
    const { integrations, ai } = settings;
    const [activeTab, setActiveTab] = useState<IntegrationTab>('whatsapp');

    const tabs = [
        { id: 'whatsapp', label: 'واتساب', icon: MessageCircle, color: 'text-green-500', enabled: integrations.whatsapp.enabled },
        { id: 'telegram', label: 'تليجرام', icon: Send, color: 'text-blue-400', enabled: integrations.telegram.enabled },
        { id: 'email', label: 'البريد', icon: Mail, color: 'text-red-400', enabled: integrations.email.enabled },
        { id: 'ai', label: 'الذكاء الاصطناعي', icon: Brain, color: 'text-purple-500', enabled: ai.enabled }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'whatsapp':
                return <WhatsAppSettings />;
            case 'telegram':
                return <TelegramSettings />;
            case 'email':
                return <EmailSettings />;
            case 'ai':
                return <AISettings />;
            default:
                return <WhatsAppSettings />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Integration Tabs */}
            <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as IntegrationTab)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-1 justify-center ${activeTab === tab.id
                                ? 'bg-white dark:bg-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon size={16} className={activeTab === tab.id ? tab.color : ''} />
                        {tab.label}
                        {tab.enabled && (
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            {renderContent()}
        </div>
    );
};

export default IntegrationsHub;
