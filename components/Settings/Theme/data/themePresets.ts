/**
 * Theme Customizer Types and Data
 * أنواع وبيانات محرر الثيمات
 */

import { ThemeSettings } from '../../../types/settings-extended';

export interface ThemePreset {
    id: string;
    name: string;
    colors: ThemeSettings['colors'];
    mode: 'light' | 'dark';
}

export type ActiveTab = 'premium' | 'presets' | 'colors' | 'fonts' | 'effects';

export const THEME_PRESETS: ThemePreset[] = [
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

export const FONT_OPTIONS = [
    { value: 'Cairo', label: 'Cairo' },
    { value: 'Tajawal', label: 'Tajawal' },
    { value: 'IBM Plex Sans Arabic', label: 'IBM Plex' },
    { value: 'Noto Sans Arabic', label: 'Noto Sans' },
    { value: 'system-ui', label: 'System' }
];

export const TAB_CONFIG = [
    { id: 'premium' as const, label: 'ثيمات راقية', iconName: 'Crown' },
    { id: 'presets' as const, label: 'ثيمات جاهزة', iconName: 'Sparkles' },
    { id: 'colors' as const, label: 'الألوان', iconName: 'Palette' },
    { id: 'fonts' as const, label: 'الخطوط', iconName: 'Type' },
    { id: 'effects' as const, label: 'التأثيرات', iconName: 'Zap' }
];
