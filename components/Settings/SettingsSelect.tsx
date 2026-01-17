/**
 * Settings Select Component
 * مكون القائمة المنسدلة للإعدادات
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
    value: string;
    label: string;
    labelEn?: string;
    disabled?: boolean;
}

interface SettingsSelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    description?: string;
    disabled?: boolean;
    placeholder?: string;
}

const SettingsSelect: React.FC<SettingsSelectProps> = ({
    label,
    value,
    onChange,
    options,
    description,
    disabled = false,
    placeholder = 'اختر...'
}) => {
    return (
        <div className="space-y-1.5">
            <label className="block">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {label}
                </span>
                {description && (
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block mt-0.5">
                        {description}
                    </span>
                )}
            </label>

            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all appearance-none cursor-pointer
                        border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                        text-gray-900 dark:text-gray-100
                        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50
                        disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none">
                    <ChevronDown size={16} className="text-gray-400" />
                </div>
            </div>
        </div>
    );
};

export default SettingsSelect;
