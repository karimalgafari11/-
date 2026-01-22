/**
 * Presets Tab
 * تبويب الثيمات الجاهزة
 */

import React from 'react';
import { Sparkles, RotateCcw, Sun, Moon, Check } from 'lucide-react';
import SettingsCard from '../../SettingsCard';
import { THEME_PRESETS, ThemePreset } from '../data/themePresets';

interface PresetsTabProps {
    currentPreset: string;
    onPresetApply: (preset: ThemePreset) => void;
    onReset: () => void;
}

const PresetsTab: React.FC<PresetsTabProps> = ({
    currentPreset,
    onPresetApply,
    onReset
}) => {
    return (
        <SettingsCard
            title="ثيمات جاهزة"
            description="اختر ثيم جاهز أو خصص ألوانك"
            icon={Sparkles}
            iconColor="text-purple-500"
            actions={
                <button
                    onClick={onReset}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                    title="استعادة الافتراضي"
                >
                    <RotateCcw size={16} />
                </button>
            }
        >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {THEME_PRESETS.map((preset) => (
                    <button
                        key={preset.id}
                        onClick={() => onPresetApply(preset)}
                        className={`group relative p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] ${currentPreset === preset.id
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                            }`}
                    >
                        {/* Color Preview */}
                        <div className="flex gap-1 mb-3">
                            {Object.values(preset.colors).slice(0, 5).map((color, i) => (
                                <div
                                    key={i}
                                    className="w-5 h-5 rounded-full"
                                    style={{ backgroundColor: color as string }}
                                />
                            ))}
                        </div>

                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 text-start">
                            {preset.name}
                        </p>

                        <div className="flex items-center gap-1 mt-1">
                            {preset.mode === 'dark' ? (
                                <Moon size={10} className="text-gray-400" />
                            ) : (
                                <Sun size={10} className="text-yellow-500" />
                            )}
                            <span className="text-[10px] text-gray-400">
                                {preset.mode === 'dark' ? 'داكن' : 'فاتح'}
                            </span>
                        </div>

                        {currentPreset === preset.id && (
                            <div className="absolute top-2 end-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                <Check size={12} className="text-white" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </SettingsCard>
    );
};

export default PresetsTab;
