/**
 * Tab Navigation
 * شريط تبويبات محرر الثيمات
 */

import React from 'react';
import { Crown, Sparkles, Palette, Type, Zap } from 'lucide-react';
import { ActiveTab } from '../data/themePresets';

const ICONS = {
    Crown,
    Sparkles,
    Palette,
    Type,
    Zap
};

interface TabNavigationProps {
    activeTab: ActiveTab;
    onTabChange: (tab: ActiveTab) => void;
}

const TABS: { id: ActiveTab; label: string; icon: keyof typeof ICONS }[] = [
    { id: 'premium', label: 'ثيمات راقية', icon: 'Crown' },
    { id: 'presets', label: 'ثيمات جاهزة', icon: 'Sparkles' },
    { id: 'colors', label: 'الألوان', icon: 'Palette' },
    { id: 'fonts', label: 'الخطوط', icon: 'Type' },
    { id: 'effects', label: 'التأثيرات', icon: 'Zap' }
];

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
    return (
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-x-auto">
            {TABS.map((tab) => {
                const Icon = ICONS[tab.icon];
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-1 justify-center ${activeTab === tab.id
                            ? 'bg-white dark:bg-gray-900 text-primary shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Icon size={14} />
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};

export default TabNavigation;
