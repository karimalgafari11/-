/**
 * Effects Tab
 * تبويب التأثيرات والحركات
 */

import React from 'react';
import { Zap } from 'lucide-react';
import SettingsCard from '../../SettingsCard';
import SettingsToggle from '../../SettingsToggle';
import SettingsSelect from '../../SettingsSelect';
import { ThemeSettings } from '../../../../types/settings-extended';

interface EffectsTabProps {
    effects: ThemeSettings['effects'];
    shadows: ThemeSettings['shadows'];
    borders: ThemeSettings['borders'];
    onEffectsChange: (effects: Partial<ThemeSettings['effects']>) => void;
    onShadowsChange: (shadows: Partial<ThemeSettings['shadows']>) => void;
    onBordersChange: (borders: Partial<ThemeSettings['borders']>) => void;
}

const EffectsTab: React.FC<EffectsTabProps> = ({
    effects,
    shadows,
    borders,
    onEffectsChange,
    onShadowsChange,
    onBordersChange
}) => {
    return (
        <SettingsCard
            title="التأثيرات والحركات"
            icon={Zap}
            iconColor="text-yellow-500"
        >
            <div className="space-y-4">
                <SettingsToggle
                    label="الرسوم المتحركة"
                    description="تأثيرات الحركة عند التنقل والتفاعل"
                    checked={effects.animations}
                    onChange={(checked) => onEffectsChange({ animations: checked })}
                />

                <SettingsToggle
                    label="تأثير الضبابية"
                    description="خلفية ضبابية للنوافذ المنبثقة"
                    checked={effects.blur}
                    onChange={(checked) => onEffectsChange({ blur: checked })}
                />

                <SettingsToggle
                    label="تأثير الزجاج"
                    description="مظهر زجاجي شفاف (Glassmorphism)"
                    checked={effects.glassmorphism}
                    onChange={(checked) => onEffectsChange({ glassmorphism: checked })}
                />

                <SettingsToggle
                    label="الظلال"
                    description="إضافة ظلال للبطاقات والأزرار"
                    checked={shadows.enabled}
                    onChange={(checked) => onShadowsChange({ enabled: checked })}
                />

                {shadows.enabled && (
                    <SettingsSelect
                        label="شدة الظلال"
                        value={shadows.intensity}
                        onChange={(val) => onShadowsChange({ intensity: val as any })}
                        options={[
                            { value: 'light', label: 'خفيفة' },
                            { value: 'medium', label: 'متوسطة' },
                            { value: 'strong', label: 'قوية' }
                        ]}
                    />
                )}

                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            استدارة الحواف
                        </label>
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {borders.radius}px
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="24"
                        step="2"
                        value={borders.radius}
                        onChange={(e) => onBordersChange({ radius: parseInt(e.target.value) })}
                        className="w-full accent-primary h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex gap-2">
                        <div
                            className="w-12 h-12 bg-primary"
                            style={{ borderRadius: `${borders.radius}px` }}
                        />
                        <div
                            className="flex-1 h-12 bg-gray-200 dark:bg-gray-700"
                            style={{ borderRadius: `${borders.radius}px` }}
                        />
                    </div>
                </div>
            </div>
        </SettingsCard>
    );
};

export default EffectsTab;
