/**
 * ReportTabs - تبويبات التقارير
 * Consistent dark mode colors
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ReportTab {
    id: string;
    label: string;
    icon: LucideIcon;
}

interface ReportTabsProps {
    tabs: ReportTab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

const ReportTabs: React.FC<ReportTabsProps> = ({ tabs, activeTab, onTabChange }) => {
    const { theme } = useApp();

    return (
        <div className={`
            overflow-x-auto shadow-sm rounded-xl border
            ${theme === 'light'
                ? 'bg-white border-slate-200'
                : 'bg-slate-900 border-indigo-900/30'
            }
        `}>
            <div className="flex min-w-max">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                                flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-wider
                                border-b-2 transition-all whitespace-nowrap
                                ${isActive
                                    ? theme === 'light'
                                        ? 'border-amber-500 text-amber-700 bg-amber-50'
                                        : 'border-indigo-500 text-indigo-300 bg-indigo-900/30'
                                    : theme === 'light'
                                        ? 'border-transparent text-slate-500 hover:text-amber-600 hover:bg-amber-50/50'
                                        : 'border-transparent text-indigo-400/60 hover:text-indigo-300 hover:bg-indigo-900/20'
                                }
                            `}
                        >
                            <Icon size={14} className={isActive ? '' : 'opacity-70'} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ReportTabs;
