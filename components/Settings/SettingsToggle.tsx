/**
 * Settings Toggle Component
 * مكون التبديل (Switch) للإعدادات
 */

import React from 'react';

interface SettingsToggleProps {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const SettingsToggle: React.FC<SettingsToggleProps> = ({
    label,
    description,
    checked,
    onChange,
    disabled = false,
    size = 'md'
}) => {
    const sizes = {
        sm: { toggle: 'w-8 h-5', circle: 'w-3 h-3', translate: 'translate-x-3.5' },
        md: { toggle: 'w-10 h-6', circle: 'w-4 h-4', translate: 'translate-x-4' },
        lg: { toggle: 'w-12 h-7', circle: 'w-5 h-5', translate: 'translate-x-5' }
    };

    const s = sizes[size];

    return (
        <label className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer
            ${checked
                ? 'border-primary/20 bg-primary/5'
                : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
            <div className="flex-1 min-w-0 me-3">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                    {label}
                </span>
                {description && (
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block mt-0.5">
                        {description}
                    </span>
                )}
            </div>

            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={`relative inline-flex shrink-0 ${s.toggle} rounded-full transition-colors duration-200 ease-in-out
                    ${checked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}
                    ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
            >
                <span
                    className={`inline-block ${s.circle} rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out
                        ${checked ? s.translate : 'translate-x-1'}
                        mt-1
                    `}
                />
            </button>
        </label>
    );
};

export default SettingsToggle;
