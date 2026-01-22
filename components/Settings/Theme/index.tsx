/**
 * Theme Customizer Component
 * محرر الثيمات المتقدم
 * 
 * تم إعادة هيكلة هذا المكون إلى:
 * - data/themePresets.ts - الثيمات والخطوط
 * - components/ThemeModeToggle.tsx - تبديل الوضع
 * - components/TabNavigation.tsx - شريط التبويبات
 * - components/PremiumThemesTab.tsx - الثيمات الراقية
 * - components/PresetsTab.tsx - الثيمات الجاهزة
 * - components/ColorsTab.tsx - تخصيص الألوان
 * - components/FontsTab.tsx - الخطوط
 * - components/EffectsTab.tsx - التأثيرات
 * - components/DisplayPreferences.tsx - تفضيلات العرض
 */

import React, { useState } from 'react';
import { useSettings } from '../../../context/SettingsContext';
import { useApp } from '../../../context/AppContext';
import { ThemeSettings } from '../../../types/settings-extended';
import { applyTheme, PremiumTheme } from '../../../utils/themes';
import { ActiveTab, ThemePreset } from './data/themePresets';
import {
    ThemeModeToggle,
    TabNavigation,
    PremiumThemesTab,
    PresetsTab,
    ColorsTab,
    FontsTab,
    EffectsTab,
    DisplayPreferences
} from './components';

const ThemeCustomizer: React.FC = () => {
    const { settings, updateTheme, resetSettings } = useSettings();
    const { theme: appTheme, toggleTheme, showNotification } = useApp();
    const { theme } = settings;

    const [activeTab, setActiveTab] = useState<ActiveTab>('premium');
    const [selectedPremiumTheme, setSelectedPremiumTheme] = useState<string>('midnight-ocean');

    const handlePresetApply = (preset: ThemePreset) => {
        updateTheme({
            preset: preset.id as any,
            colors: preset.colors,
            mode: preset.mode
        });

        if (preset.mode !== appTheme) {
            toggleTheme();
        }

        showNotification(`تم تطبيق ثيم "${preset.name}"`, 'success');
    };

    const handleColorChange = (colorKey: keyof ThemeSettings['colors'], value: string) => {
        updateTheme({
            colors: { ...theme.colors, [colorKey]: value },
            preset: 'custom'
        });
    };

    const handleReset = () => {
        if (confirm('هل تريد استعادة الإعدادات الافتراضية؟')) {
            resetSettings('theme');
            showNotification('تم استعادة الإعدادات الافتراضية', 'info');
        }
    };

    const handlePremiumThemeSelect = (premiumTheme: PremiumTheme) => {
        setSelectedPremiumTheme(premiumTheme.id);
        applyTheme(premiumTheme);

        if (appTheme !== 'dark') {
            toggleTheme();
        }

        showNotification(`تم تطبيق ثيم "${premiumTheme.nameAr}"`, 'success');
    };

    return (
        <div className="space-y-6">
            {/* Quick Mode Toggle */}
            <ThemeModeToggle
                appTheme={appTheme}
                themeMode={theme.mode}
                onToggleTheme={toggleTheme}
                onSetSystemMode={() => updateTheme({ mode: 'system' })}
            />

            {/* Tab Navigation */}
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Premium Themes Tab */}
            {activeTab === 'premium' && (
                <PremiumThemesTab
                    selectedPremiumTheme={selectedPremiumTheme}
                    onThemeSelect={handlePremiumThemeSelect}
                />
            )}

            {/* Presets Tab */}
            {activeTab === 'presets' && (
                <PresetsTab
                    currentPreset={theme.preset}
                    onPresetApply={handlePresetApply}
                    onReset={handleReset}
                />
            )}

            {/* Colors Tab */}
            {activeTab === 'colors' && (
                <ColorsTab
                    colors={theme.colors}
                    onColorChange={handleColorChange}
                />
            )}

            {/* Fonts Tab */}
            {activeTab === 'fonts' && (
                <FontsTab
                    fonts={theme.fonts}
                    onFontsChange={(fonts) => updateTheme({ fonts: { ...theme.fonts, ...fonts } })}
                />
            )}

            {/* Effects Tab */}
            {activeTab === 'effects' && (
                <EffectsTab
                    effects={theme.effects}
                    shadows={theme.shadows}
                    borders={theme.borders}
                    onEffectsChange={(effects) => updateTheme({ effects: { ...theme.effects, ...effects } })}
                    onShadowsChange={(shadows) => updateTheme({ shadows: { ...theme.shadows, ...shadows } })}
                    onBordersChange={(borders) => updateTheme({ borders: { ...theme.borders, ...borders } })}
                />
            )}

            {/* Display Preferences */}
            <DisplayPreferences
                display={theme.display}
                components={theme.components}
                onDisplayChange={(display) => updateTheme({ display: { ...theme.display, ...display } })}
                onComponentsChange={(components) => updateTheme({ components: { ...theme.components, ...components } })}
            />
        </div>
    );
};

export default ThemeCustomizer;
