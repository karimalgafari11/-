import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AccountingTab {
    id: string;
    label: string;
    icon: LucideIcon;
}

interface AccountingTabsProps {
    tabs: AccountingTab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

const AccountingTabs: React.FC<AccountingTabsProps> = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-900/30 overflow-x-auto shadow-sm rounded-xl mb-6">
            <div className="flex min-w-max p-1">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-wider
                rounded-lg transition-all whitespace-nowrap
                ${isActive
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 shadow-sm'
                                    : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }
              `}
                        >
                            <Icon size={14} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default AccountingTabs;
