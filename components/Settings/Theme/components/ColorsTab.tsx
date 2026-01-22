/**
 * Colors Tab
 * تبويب تخصيص الألوان
 */

import React from 'react';
import { Palette } from 'lucide-react';
import SettingsCard from '../../SettingsCard';
import ColorPicker from '../../ColorPicker';
import { ThemeSettings } from '../../../../types/settings-extended';

interface ColorsTabProps {
    colors: ThemeSettings['colors'];
    onColorChange: (colorKey: keyof ThemeSettings['colors'], value: string) => void;
}

const ColorsTab: React.FC<ColorsTabProps> = ({ colors, onColorChange }) => {
    return (
        <SettingsCard
            title="تخصيص الألوان"
            description="اختر ألوانك المفضلة"
            icon={Palette}
            iconColor="text-pink-500"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ColorPicker
                    label="اللون الأساسي"
                    value={colors.primary}
                    onChange={(color) => onColorChange('primary', color)}
                    description="الأزرار والروابط الرئيسية"
                />
                <ColorPicker
                    label="اللون الثانوي"
                    value={colors.secondary}
                    onChange={(color) => onColorChange('secondary', color)}
                    description="النصوص الفرعية"
                />
                <ColorPicker
                    label="اللون المميز"
                    value={colors.accent}
                    onChange={(color) => onColorChange('accent', color)}
                    description="العناصر البارزة"
                />
                <ColorPicker
                    label="لون النجاح"
                    value={colors.success}
                    onChange={(color) => onColorChange('success', color)}
                    description="الرسائل الإيجابية"
                />
                <ColorPicker
                    label="لون التحذير"
                    value={colors.warning}
                    onChange={(color) => onColorChange('warning', color)}
                    description="التنبيهات"
                />
                <ColorPicker
                    label="لون الخطأ"
                    value={colors.error}
                    onChange={(color) => onColorChange('error', color)}
                    description="الأخطاء"
                />
            </div>
        </SettingsCard>
    );
};

export default ColorsTab;
