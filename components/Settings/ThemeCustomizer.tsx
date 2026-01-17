/**
 * Theme Customizer Component
 * محرر الثيمات المتقدم
 */

import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useApp } from '../../context/AppContext';
import SettingsCard from './SettingsCard';
import SettingsToggle from './SettingsToggle';
import SettingsSelect from './SettingsSelect';
import ColorPicker from './ColorPicker';
import {
    Palette, Sun, Moon, Monitor, Type, Layers,
    Square, Sparkles, RotateCcw, Check, Zap,
    Eye, EyeOff, Layout, Grid, Smartphone, Crown
} from 'lucide-react';
import { ThemeSettings } from '../../types/settings-extended';
import { premiumThemes, applyTheme, getThemeById, PremiumTheme } from '../../utils/themes';
import { SafeStorage } from '../../utils/storage';

interface ThemePreset {
    id: string;
    name: string;
    colors: ThemeSettings['colors'];
    mode: 'light' | 'dark';
}

const THEME_PRESETS: ThemePreset[] = [
    {
        id: 'default',
        name: 'الأزرق الكلاسيكي',
        mode: 'light',
        colors: {
            primary: '#2563eb',
            secondary: '#64748b',
            accent: '#8b5cf6',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#0ea5e9'
        }
    },
    {
        id: 'emerald',
        name: 'الأخضر الزمردي',
        mode: 'light',
        colors: {
            primary: '#10b981',
            secondary: '#6b7280',
            accent: '#14b8a6',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#06b6d4'
        }
    },
    {
        id: 'violet',
        name: 'البنفسجي الأنيق',
        mode: 'light',
        colors: {
            primary: '#8b5cf6',
            secondary: '#64748b',
            accent: '#a855f7',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#6366f1'
        }
    },
    {
        id: 'rose',
        name: 'الوردي العصري',
        mode: 'light',
        colors: {
            primary: '#ec4899',
            secondary: '#6b7280',
            accent: '#f472b6',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#8b5cf6'
        }
    },
    {
        id: 'amber',
        name: 'الذهبي الفاخر',
        mode: 'light',
        colors: {
            primary: '#f59e0b',
            secondary: '#78716c',
            accent: '#fbbf24',
            success: '#10b981',
            warning: '#fb923c',
            error: '#ef4444',
            info: '#0ea5e9'
        }
    },
    {
        id: 'slate-dark',
        name: 'الداكن المحايد',
        mode: 'dark',
        colors: {
            primary: '#3b82f6',
            secondary: '#94a3b8',
            accent: '#a78bfa',
            success: '#34d399',
            warning: '#fbbf24',
            error: '#f87171',
            info: '#38bdf8'
        }
    }
];

const FONT_OPTIONS = [
    { value: 'Cairo', label: 'Cairo' },
    { value: 'Tajawal', label: 'Tajawal' },
    { value: 'IBM Plex Sans Arabic', label: 'IBM Plex' },
    { value: 'Noto Sans Arabic', label: 'Noto Sans' },
    { value: 'system-ui', label: 'System' }
];

const ThemeCustomizer: React.FC = () => {
    const { settings, updateTheme, resetSettings } = useSettings();
    const { theme: appTheme, toggleTheme, showNotification } = useApp();
    const { theme } = settings;

    const [activeTab, setActiveTab] = useState<'premium' | 'presets' | 'colors' | 'fonts' | 'effects'>('premium');
    const [selectedPremiumTheme, setSelectedPremiumTheme] = useState<string>(() =>
        SafeStorage.get('alzhra_premium_theme', 'midnight-ocean')
    );

    const handlePresetApply = (preset: ThemePreset) => {
        updateTheme({
            preset: preset.id as any,
            colors: preset.colors,
            mode: preset.mode
        });

        // تحديث وضع التطبيق إذا لزم الأمر
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

    const handlePremiumThemeSelect = (theme: PremiumTheme) => {
        setSelectedPremiumTheme(theme.id);
        SafeStorage.set('alzhra_premium_theme', theme.id);
        applyTheme(theme);

        // تفعيل الوضع الليلي إذا لم يكن مفعلاً
        if (appTheme !== 'dark') {
            toggleTheme();
        }

        showNotification(`تم تطبيق ثيم "${theme.nameAr}"`, 'success');
    };

    return (
        <div className="space-y-6">
            {/* Quick Mode Toggle */}
            <SettingsCard
                title="الوضع"
                icon={appTheme === 'dark' ? Moon : Sun}
                iconColor={appTheme === 'dark' ? 'text-indigo-400' : 'text-yellow-500'}
            >
                <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                    <button
                        onClick={() => appTheme !== 'light' && toggleTheme()}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${appTheme === 'light'
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Sun size={16} />
                        نهاري
                    </button>
                    <button
                        onClick={() => appTheme !== 'dark' && toggleTheme()}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${appTheme === 'dark'
                            ? 'bg-gray-900 text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Moon size={16} />
                        ليلي
                    </button>
                    <button
                        onClick={() => updateTheme({ mode: 'system' })}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${theme.mode === 'system'
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Monitor size={16} />
                        تلقائي
                    </button>
                </div>
            </SettingsCard>

            {/* Tab Navigation */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-x-auto">
                {[
                    { id: 'premium', label: 'ثيمات راقية', icon: Crown },
                    { id: 'presets', label: 'ثيمات جاهزة', icon: Sparkles },
                    { id: 'colors', label: 'الألوان', icon: Palette },
                    { id: 'fonts', label: 'الخطوط', icon: Type },
                    { id: 'effects', label: 'التأثيرات', icon: Zap }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-1 justify-center ${activeTab === tab.id
                            ? 'bg-white dark:bg-gray-900 text-primary shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Premium Themes Tab - ثيمات راقية */}
            {activeTab === 'premium' && (
                <SettingsCard
                    title="ثيمات الوضع الليلي الراقية"
                    description="8 ثيمات احترافية مصممة بعناية"
                    icon={Crown}
                    iconColor="text-yellow-500"
                >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {premiumThemes.map((pTheme) => (
                            <button
                                key={pTheme.id}
                                onClick={() => handlePremiumThemeSelect(pTheme)}
                                className={`group relative p-3 rounded-2xl border-2 transition-all hover:scale-[1.02] ${selectedPremiumTheme === pTheme.id
                                    ? 'border-yellow-500 ring-2 ring-yellow-500/20 shadow-lg shadow-yellow-500/10'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-yellow-500/50'
                                    }`}
                            >
                                {/* Color Preview */}
                                <div
                                    className="relative h-16 rounded-xl overflow-hidden mb-2"
                                    style={{ background: pTheme.colors.gradient }}
                                >
                                    <div className="absolute inset-1 flex gap-0.5">
                                        <div
                                            className="flex-1 rounded-lg"
                                            style={{ background: pTheme.preview.primary }}
                                        />
                                        <div
                                            className="w-6 rounded-lg"
                                            style={{ background: pTheme.preview.secondary }}
                                        />
                                        <div
                                            className="w-3 rounded-lg"
                                            style={{ background: pTheme.preview.accent }}
                                        />
                                    </div>

                                    {/* Glow effect on hover */}
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        style={{
                                            background: `radial-gradient(circle at center, ${pTheme.colors.glow} 0%, transparent 70%)`
                                        }}
                                    />
                                </div>

                                <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200 text-center truncate">
                                    {pTheme.nameAr}
                                </p>
                                <p className="text-[9px] text-gray-500 dark:text-gray-400 text-center truncate mt-0.5">
                                    {pTheme.description}
                                </p>

                                {selectedPremiumTheme === pTheme.id && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                                        <Check size={12} className="text-white" />
                                    </div>
                                )}

                                {/* Moon indicator */}
                                <div className="absolute -top-1 -left-1 w-5 h-5 bg-gray-800 dark:bg-gray-900 rounded-full flex items-center justify-center border border-gray-700">
                                    <Moon size={10} className="text-purple-400" />
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Current theme info */}
                    <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl"
                            style={{ background: getThemeById(selectedPremiumTheme).colors.gradient }}
                        />
                        <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                الثيم الحالي: {getThemeById(selectedPremiumTheme).nameAr}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                {getThemeById(selectedPremiumTheme).description}
                            </p>
                        </div>
                        <Sparkles size={20} className="text-yellow-500 animate-pulse" />
                    </div>
                </SettingsCard>
            )}

            {/* Presets Tab */}
            {activeTab === 'presets' && (
                <SettingsCard
                    title="ثيمات جاهزة"
                    description="اختر ثيم جاهز أو خصص ألوانك"
                    icon={Sparkles}
                    iconColor="text-purple-500"
                    actions={
                        <button
                            onClick={handleReset}
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
                                onClick={() => handlePresetApply(preset)}
                                className={`group relative p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] ${theme.preset === preset.id
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
                                            style={{ backgroundColor: color }}
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

                                {theme.preset === preset.id && (
                                    <div className="absolute top-2 end-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                        <Check size={12} className="text-white" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </SettingsCard>
            )}

            {/* Colors Tab */}
            {activeTab === 'colors' && (
                <SettingsCard
                    title="تخصيص الألوان"
                    description="اختر ألوانك المفضلة"
                    icon={Palette}
                    iconColor="text-pink-500"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ColorPicker
                            label="اللون الأساسي"
                            value={theme.colors.primary}
                            onChange={(color) => handleColorChange('primary', color)}
                            description="الأزرار والروابط الرئيسية"
                        />
                        <ColorPicker
                            label="اللون الثانوي"
                            value={theme.colors.secondary}
                            onChange={(color) => handleColorChange('secondary', color)}
                            description="النصوص الفرعية"
                        />
                        <ColorPicker
                            label="اللون المميز"
                            value={theme.colors.accent}
                            onChange={(color) => handleColorChange('accent', color)}
                            description="العناصر البارزة"
                        />
                        <ColorPicker
                            label="لون النجاح"
                            value={theme.colors.success}
                            onChange={(color) => handleColorChange('success', color)}
                            description="الرسائل الإيجابية"
                        />
                        <ColorPicker
                            label="لون التحذير"
                            value={theme.colors.warning}
                            onChange={(color) => handleColorChange('warning', color)}
                            description="التنبيهات"
                        />
                        <ColorPicker
                            label="لون الخطأ"
                            value={theme.colors.error}
                            onChange={(color) => handleColorChange('error', color)}
                            description="الأخطاء"
                        />
                    </div>
                </SettingsCard>
            )}

            {/* Fonts Tab */}
            {activeTab === 'fonts' && (
                <SettingsCard
                    title="الخطوط والقراءة"
                    icon={Type}
                    iconColor="text-blue-500"
                >
                    <div className="space-y-6">
                        <SettingsSelect
                            label="خط النصوص العربية"
                            value={theme.fonts.familyAr}
                            onChange={(val) => updateTheme({ fonts: { ...theme.fonts, familyAr: val } })}
                            options={FONT_OPTIONS}
                        />

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                    حجم الخط الأساسي
                                </label>
                                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                    {theme.fonts.sizeBase}px
                                </span>
                            </div>
                            <input
                                type="range"
                                min="12"
                                max="20"
                                step="1"
                                value={theme.fonts.sizeBase}
                                onChange={(e) => updateTheme({ fonts: { ...theme.fonts, sizeBase: parseInt(e.target.value) } })}
                                className="w-full accent-primary h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400">
                                <span>صغير</span>
                                <span>كبير</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                            <p className="text-gray-900 dark:text-gray-100 mb-2" style={{ fontFamily: theme.fonts.familyAr, fontSize: `${theme.fonts.sizeBase}px` }}>
                                معاينة النص العربي
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm" style={{ fontFamily: theme.fonts.familyAr, fontSize: `${theme.fonts.sizeBase - 2}px` }}>
                                هذا نص تجريبي لمعاينة الخط المختار وحجمه
                            </p>
                        </div>
                    </div>
                </SettingsCard>
            )}

            {/* Effects Tab */}
            {activeTab === 'effects' && (
                <SettingsCard
                    title="التأثيرات والحركات"
                    icon={Zap}
                    iconColor="text-yellow-500"
                >
                    <div className="space-y-4">
                        <SettingsToggle
                            label="الرسوم المتحركة"
                            description="تأثيرات الحركة عند التنقل والتفاعل"
                            checked={theme.effects.animations}
                            onChange={(checked) => updateTheme({ effects: { ...theme.effects, animations: checked } })}
                        />

                        <SettingsToggle
                            label="تأثير الضبابية"
                            description="خلفية ضبابية للنوافذ المنبثقة"
                            checked={theme.effects.blur}
                            onChange={(checked) => updateTheme({ effects: { ...theme.effects, blur: checked } })}
                        />

                        <SettingsToggle
                            label="تأثير الزجاج"
                            description="مظهر زجاجي شفاف (Glassmorphism)"
                            checked={theme.effects.glassmorphism}
                            onChange={(checked) => updateTheme({ effects: { ...theme.effects, glassmorphism: checked } })}
                        />

                        <SettingsToggle
                            label="الظلال"
                            description="إضافة ظلال للبطاقات والأزرار"
                            checked={theme.shadows.enabled}
                            onChange={(checked) => updateTheme({ shadows: { ...theme.shadows, enabled: checked } })}
                        />

                        {theme.shadows.enabled && (
                            <SettingsSelect
                                label="شدة الظلال"
                                value={theme.shadows.intensity}
                                onChange={(val) => updateTheme({ shadows: { ...theme.shadows, intensity: val as any } })}
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
                                    {theme.borders.radius}px
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="24"
                                step="2"
                                value={theme.borders.radius}
                                onChange={(e) => updateTheme({ borders: { ...theme.borders, radius: parseInt(e.target.value) } })}
                                className="w-full accent-primary h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex gap-2">
                                <div
                                    className="w-12 h-12 bg-primary"
                                    style={{ borderRadius: `${theme.borders.radius}px` }}
                                />
                                <div
                                    className="flex-1 h-12 bg-gray-200 dark:bg-gray-700"
                                    style={{ borderRadius: `${theme.borders.radius}px` }}
                                />
                            </div>
                        </div>
                    </div>
                </SettingsCard>
            )}

            {/* Display Preferences */}
            <SettingsCard
                title="تفضيلات العرض"
                description="التحكم في ظهور عناصر الواجهة"
                icon={Layout}
                iconColor="text-cyan-500"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SettingsToggle
                        label="إحصائيات الملخص"
                        checked={theme.display.showDashboardStats}
                        onChange={(checked) => updateTheme({ display: { ...theme.display, showDashboardStats: checked } })}
                    />
                    <SettingsToggle
                        label="الرسوم البيانية"
                        checked={theme.display.showDashboardCharts}
                        onChange={(checked) => updateTheme({ display: { ...theme.display, showDashboardCharts: checked } })}
                    />
                    <SettingsToggle
                        label="العمليات الأخيرة"
                        checked={theme.display.showRecentTransactions}
                        onChange={(checked) => updateTheme({ display: { ...theme.display, showRecentTransactions: checked } })}
                    />
                    <SettingsToggle
                        label="تحليل المصروفات"
                        checked={theme.display.showExpenseAnalysis}
                        onChange={(checked) => updateTheme({ display: { ...theme.display, showExpenseAnalysis: checked } })}
                    />
                    <SettingsToggle
                        label="أيقونات القائمة"
                        checked={theme.components.showSidebarIcons}
                        onChange={(checked) => updateTheme({ components: { ...theme.components, showSidebarIcons: checked } })}
                    />
                    <SettingsToggle
                        label="الوضع المضغوط"
                        checked={theme.display.compactMode}
                        onChange={(checked) => updateTheme({ display: { ...theme.display, compactMode: checked } })}
                    />
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <SettingsSelect
                        label="كثافة الجداول"
                        value={theme.components.gridDensity}
                        onChange={(val) => updateTheme({ components: { ...theme.components, gridDensity: val as any } })}
                        options={[
                            { value: 'compact', label: 'مضغوط' },
                            { value: 'comfortable', label: 'متوازن' },
                            { value: 'spacious', label: 'واسع' }
                        ]}
                    />
                </div>
            </SettingsCard>
        </div>
    );
};

export default ThemeCustomizer;
