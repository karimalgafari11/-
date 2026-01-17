/**
 * Settings Input Component
 * مكون حقل الإدخال للإعدادات
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SettingsInputProps {
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    type?: 'text' | 'number' | 'email' | 'password' | 'url' | 'tel' | 'time';
    placeholder?: string;
    description?: string;
    icon?: LucideIcon;
    disabled?: boolean;
    error?: string;
    maxLength?: number;
    min?: number;
    max?: number;
    step?: number;
    required?: boolean;
    dir?: 'ltr' | 'rtl' | 'auto';
}

const SettingsInput: React.FC<SettingsInputProps> = ({
    label,
    value,
    onChange,
    type = 'text',
    placeholder,
    description,
    icon: Icon,
    disabled = false,
    error,
    maxLength,
    min,
    max,
    step,
    required = false,
    dir = 'auto'
}) => {
    return (
        <div className="space-y-1.5">
            <label className="block">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </span>
                {description && (
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block mt-0.5">
                        {description}
                    </span>
                )}
            </label>

            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <Icon size={16} className="text-gray-400" />
                    </div>
                )}

                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    maxLength={maxLength}
                    min={min}
                    max={max}
                    step={step}
                    dir={dir}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all
                        ${Icon ? 'ps-10' : ''}
                        ${error
                            ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 focus:ring-red-500'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-primary'}
                        focus:outline-none focus:ring-2 focus:ring-opacity-50
                        text-gray-900 dark:text-gray-100
                        placeholder:text-gray-400 dark:placeholder:text-gray-500
                        disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                />
            </div>

            {error && (
                <p className="text-[10px] text-red-500 font-medium">{error}</p>
            )}
        </div>
    );
};

export default SettingsInput;
