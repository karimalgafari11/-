/**
 * Color Picker Component
 * منتقي الألوان المتقدم
 */

import React, { useState, useRef, useEffect } from 'react';
import { Check, Pipette } from 'lucide-react';

interface ColorPickerProps {
    label: string;
    value: string;
    onChange: (color: string) => void;
    presets?: string[];
    showInput?: boolean;
    description?: string;
}

const DEFAULT_PRESETS = [
    '#2563eb', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6',
    '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b',
    '#f97316', '#ef4444', '#dc2626', '#ec4899', '#d946ef',
    '#a855f7', '#8b5cf6', '#6366f1', '#64748b', '#1e293b'
];

const ColorPicker: React.FC<ColorPickerProps> = ({
    label,
    value,
    onChange,
    presets = DEFAULT_PRESETS,
    showInput = true,
    description
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (val: string) => {
        setInputValue(val);
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
            onChange(val);
        }
    };

    const handleInputBlur = () => {
        if (!/^#[0-9A-Fa-f]{6}$/.test(inputValue)) {
            setInputValue(value);
        }
    };

    return (
        <div className="space-y-1.5" ref={containerRef}>
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

            <div className="flex items-center gap-2">
                {/* Color Preview Button */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-10 h-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:scale-105 flex items-center justify-center"
                    style={{ backgroundColor: value }}
                >
                    <Pipette size={14} className="text-white drop-shadow-md" />
                </button>

                {/* Color Input */}
                {showInput && (
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onBlur={handleInputBlur}
                        placeholder="#000000"
                        dir="ltr"
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                    />
                )}

                {/* Native Color Picker */}
                <label className="relative cursor-pointer">
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute inset-0 opacity-0 w-0 h-0"
                    />
                    <div className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-red-500 via-green-500 to-blue-500 flex items-center justify-center hover:scale-105 transition-transform">
                        <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                    </div>
                </label>
            </div>

            {/* Presets Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-2 p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-5 gap-2">
                        {presets.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => {
                                    onChange(color);
                                    setIsOpen(false);
                                }}
                                className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 flex items-center justify-center
                                    ${value === color ? 'border-gray-900 dark:border-white ring-2 ring-offset-2 ring-primary' : 'border-transparent'}
                                `}
                                style={{ backgroundColor: color }}
                            >
                                {value === color && (
                                    <Check size={14} className="text-white drop-shadow-md" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColorPicker;
