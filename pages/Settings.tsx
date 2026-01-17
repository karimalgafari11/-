/**
 * Settings Page - صفحة الإعدادات الشاملة
 * تتضمن جميع إعدادات التطبيق مجمعة في أقسام منظمة
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';
import {
  Building2, Coins, Users, Receipt, ShoppingCart,
  Palette, Printer, Globe, Database, Webhook,
  MessageCircle, Brain, Settings2, Shield, ChevronLeft,
  ChevronRight, Menu, X
} from 'lucide-react';

// Import Settings Components
import {
  CompanySettings,
  CurrencyManager,
  ThemeCustomizer,
  IntegrationsHub,
  WebhooksManager,
  RolesManager,
  BackupSettings,
  OperationsSettings
} from '../components/Settings';
import RoleSwitcher from '../components/Settings/RoleSwitcher';

// Tab Types and Configuration
interface SettingsTab {
  id: string;
  label: string;
  icon: any;
  color: string;
  component: React.FC;
}

interface SettingsSection {
  id: string;
  label: string;
  tabs: SettingsTab[];
}

const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: 'basic',
    label: 'أساسية',
    tabs: [
      { id: 'company', label: 'الشركة', icon: Building2, color: 'text-blue-500', component: CompanySettings },
      { id: 'users', label: 'المستخدمين', icon: Shield, color: 'text-indigo-500', component: RolesManager },
      { id: 'role', label: 'الدور الحالي', icon: Users, color: 'text-purple-500', component: RoleSwitcher }
    ]
  },
  {
    id: 'financial',
    label: 'مالية',
    tabs: [
      { id: 'currency', label: 'العملات', icon: Coins, color: 'text-yellow-500', component: CurrencyManager },
      { id: 'operations', label: 'العمليات', icon: Receipt, color: 'text-green-500', component: OperationsSettings }
    ]
  },
  {
    id: 'customization',
    label: 'التخصيص',
    tabs: [
      { id: 'theme', label: 'المظهر', icon: Palette, color: 'text-pink-500', component: ThemeCustomizer }
    ]
  },
  {
    id: 'integrations',
    label: 'التكاملات',
    tabs: [
      { id: 'communications', label: 'التواصل', icon: MessageCircle, color: 'text-green-500', component: IntegrationsHub },
      { id: 'webhooks', label: 'Webhooks', icon: Webhook, color: 'text-orange-500', component: WebhooksManager }
    ]
  },
  {
    id: 'system',
    label: 'النظام',
    tabs: [
      { id: 'backup', label: 'النسخ الاحتياطي', icon: Database, color: 'text-cyan-500', component: BackupSettings }
    ]
  }
];

// Language Settings Component
const LanguageSettings: React.FC = () => {
  const { language, setLanguage } = useApp();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-indigo-900/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-500">
            <Globe size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900 dark:text-gray-100">لغة الواجهة</h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">اختر لغة عرض واجهة المستخدم</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setLanguage('ar')}
            className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${language === 'ar'
              ? 'border-primary bg-primary/5'
              : 'border-gray-100 dark:border-indigo-900/30 text-gray-400 hover:border-gray-200'
              }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇸🇦</span>
              <div className="text-start">
                <span className="font-black text-sm block text-gray-900 dark:text-gray-100">العربية</span>
                <span className="text-[10px] text-gray-500">الافتراضية</span>
              </div>
            </div>
            {language === 'ar' && (
              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <ChevronLeft size={12} className="text-white" />
              </div>
            )}
          </button>

          <button
            onClick={() => setLanguage('en')}
            className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${language === 'en'
              ? 'border-primary bg-primary/5'
              : 'border-gray-100 dark:border-indigo-900/30 text-gray-400 hover:border-gray-200'
              }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇺🇸</span>
              <div className="text-start">
                <span className="font-black text-sm block text-gray-900 dark:text-gray-100">English</span>
                <span className="text-[10px] text-gray-500">Beta</span>
              </div>
            </div>
            {language === 'en' && (
              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <ChevronRight size={12} className="text-white" />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Language to customization section
SETTINGS_SECTIONS.find(s => s.id === 'customization')?.tabs.push({
  id: 'language',
  label: 'اللغة',
  icon: Globe,
  color: 'text-purple-500',
  component: LanguageSettings
});

// Main Settings Component
const Settings: React.FC = () => {
  const { t, language } = useApp();
  const { activeCompany } = useSettings();

  const [activeSection, setActiveSection] = useState('basic');
  const [activeTab, setActiveTab] = useState('company');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Get current component
  const allTabs = SETTINGS_SECTIONS.flatMap(s => s.tabs);
  const currentTab = allTabs.find(t => t.id === activeTab);
  const CurrentComponent = currentTab?.component || CompanySettings;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 animate-in fade-in duration-300">
      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className={`hidden lg:block ${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white dark:bg-slate-900 border-e border-gray-100 dark:border-indigo-900/30 min-h-screen sticky top-0`}>
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              {sidebarOpen && (
                <div>
                  <h1 className="text-lg font-black text-gray-900 dark:text-gray-100">الإعدادات</h1>
                  <p className="text-[10px] text-gray-500">{activeCompany?.name || 'الشركة'}</p>
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                {sidebarOpen ? <ChevronRight size={16} /> : <Menu size={16} />}
              </button>
            </div>

            {/* Navigation */}
            <nav className="space-y-6">
              {SETTINGS_SECTIONS.map((section) => (
                <div key={section.id}>
                  {sidebarOpen && (
                    <p className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {section.label}
                    </p>
                  )}
                  <div className="space-y-1">
                    {section.tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveSection(section.id);
                          setActiveTab(tab.id);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id
                          ? 'bg-primary text-white shadow-lg shadow-primary/20'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        title={!sidebarOpen ? tab.label : undefined}
                      >
                        <tab.icon size={16} className={activeTab === tab.id ? '' : tab.color} />
                        {sidebarOpen && <span>{tab.label}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile Tab Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-indigo-900/30 px-2 py-2">
          <div className="flex overflow-x-auto gap-1 no-scrollbar">
            {allTabs.slice(0, 6).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all flex-shrink-0 ${activeTab === tab.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-400'
                  }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
            <button className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-bold text-gray-400 flex-shrink-0">
              <Menu size={18} />
              <span>المزيد</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 pb-24 lg:pb-8">
          {/* Top Bar */}
          <div className="sticky top-0 z-40 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-indigo-900/30 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentTab && (
                  <div className={`p-2 rounded-xl bg-gray-100 dark:bg-slate-800 ${currentTab.color}`}>
                    <currentTab.icon size={20} />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">
                    {currentTab?.label || 'الإعدادات'}
                  </h2>
                  <p className="text-[10px] text-gray-500">
                    {SETTINGS_SECTIONS.find(s => s.tabs.some(t => t.id === activeTab))?.label}
                  </p>
                </div>
              </div>

              {/* Breadcrumb */}
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                <Settings2 size={14} />
                <span>الإعدادات</span>
                <ChevronLeft size={14} />
                <span className="text-primary font-bold">{currentTab?.label}</span>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 max-w-5xl mx-auto">
            <CurrentComponent />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
