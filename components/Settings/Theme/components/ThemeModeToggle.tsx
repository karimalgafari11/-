/**
 * Theme Mode Toggle Component
 * مكون تبديل وضع الثيم (نهاري/ليلي/تلقائي)
 */

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import SettingsCard from '../../SettingsCard';

interface ThemeModeToggleProps {
    appTheme: 'light' | 'dark';
    themeMode: 'light' | 'dark' | 'system';
    onToggleTheme: () => void;
    onSetSystemMode: () => void;
}

const ThemeModeToggle: React.FC<ThemeModeToggleProps> = ({
    appTheme,
    themeMode,
    onToggleTheme,
    onSetSystemMode
}) => {
    return (
        <SettingsCard
            title="الوضع"
            icon={appTheme === 'dark' ? Moon : Sun}
            iconColor={appTheme === 'dark' ? 'text-indigo-400' : 'text-yellow-500'}
        >
            <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                <button
                    onClick={() => appTheme !== 'light' && onToggleTheme()}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${appTheme === 'light'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Sun size={16} />
                    نهاري
                </button>
                <button
                    onClick={() => appTheme !== 'dark' && onToggleTheme()}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${appTheme === 'dark'
                        ? 'bg-gray-900 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Moon size={16} />
                    ليلي
                </button>
                <button
                    onClick={onSetSystemMode}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${themeMode === 'system'
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Monitor size={16} />
                    تلقائي
                </button>
            </div>
        </SettingsCard>
    );
};

export default ThemeModeToggle;
