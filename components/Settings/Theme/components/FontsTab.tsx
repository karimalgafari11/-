/**
 * Fonts Tab
 * تبويب الخطوط والقراءة
 */

import React from 'react';
import { Type } from 'lucide-react';
import SettingsCard from '../../SettingsCard';
import SettingsSelect from '../../SettingsSelect';
import { FONT_OPTIONS } from '../data/themePresets';
import { ThemeSettings } from '../../../../types/settings-extended';

interface FontsTabProps {
    fonts: ThemeSettings['fonts'];
    onFontsChange: (fonts: Partial<ThemeSettings['fonts']>) => void;
}

const FontsTab: React.FC<FontsTabProps> = ({ fonts, onFontsChange }) => {
    return (
        <SettingsCard
            title="الخطوط والقراءة"
            icon={Type}
            iconColor="text-blue-500"
        >
            <div className="space-y-6">
                <SettingsSelect
                    label="خط النصوص العربية"
                    value={fonts.familyAr}
                    onChange={(val) => onFontsChange({ familyAr: val })}
                    options={FONT_OPTIONS}
                />

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            حجم الخط الأساسي
                        </label>
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {fonts.sizeBase}px
                        </span>
                    </div>
                    <input
                        type="range"
                        min="12"
                        max="20"
                        step="1"
                        value={fonts.sizeBase}
                        onChange={(e) => onFontsChange({ sizeBase: parseInt(e.target.value) })}
                        className="w-full accent-primary h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400">
                        <span>صغير</span>
                        <span>كبير</span>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <p className="text-gray-900 dark:text-gray-100 mb-2" style={{ fontFamily: fonts.familyAr, fontSize: `${fonts.sizeBase}px` }}>
                        معاينة النص العربي
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm" style={{ fontFamily: fonts.familyAr, fontSize: `${fonts.sizeBase - 2}px` }}>
                        هذا نص تجريبي لمعاينة الخط المختار وحجمه
                    </p>
                </div>
            </div>
        </SettingsCard>
    );
};

export default FontsTab;
