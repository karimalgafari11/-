/**
 * ThemeSelector - محدد الثيمات الراقية
 * واجهة لاختيار وتطبيق الثيمات المميزة
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { premiumThemes, PremiumTheme, applyTheme, getThemeById } from '../../utils/themes';
import { SafeStorage } from '../../utils/storage';
import { Palette, Check, Sparkles, Moon, Sun } from 'lucide-react';

interface ThemeSelectorProps {
    compact?: boolean;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ compact = false }) => {
    const { theme: appTheme, showNotification } = useApp();
    const isDark = appTheme === 'dark';

    const [selectedTheme, setSelectedTheme] = useState<string>(() =>
        SafeStorage.get('alzhra_premium_theme', 'midnight-ocean')
    );
    const [isOpen, setIsOpen] = useState(false);

    // تطبيق الثيم عند التغيير
    useEffect(() => {
        if (isDark) {
            const theme = getThemeById(selectedTheme);
            applyTheme(theme);
        }
    }, [selectedTheme, isDark]);

    const handleSelectTheme = (theme: PremiumTheme) => {
        setSelectedTheme(theme.id);
        SafeStorage.set('alzhra_premium_theme', theme.id);
        applyTheme(theme);
        showNotification(`تم تطبيق ثيم ${theme.nameAr}`, 'success');
        setIsOpen(false);
    };

    const currentTheme = getThemeById(selectedTheme);

    if (compact) {
        return (
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
            flex items-center gap-2 px-3 py-2 rounded-xl transition-all
            ${isDark
                            ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                            : 'bg-slate-100 hover:bg-slate-200 border border-slate-200'
                        }
          `}
                >
                    <div
                        className="w-5 h-5 rounded-full"
                        style={{ background: currentTheme.colors.gradient }}
                    />
                    <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {currentTheme.nameAr}
                    </span>
                </button>

                {isOpen && (
                    <div className={`
            absolute top-full mt-2 right-0 z-50 p-3 rounded-2xl shadow-2xl border min-w-[280px]
            ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}
          `}>
                        <div className="grid grid-cols-4 gap-2">
                            {premiumThemes.map((theme) => (
                                <button
                                    key={theme.id}
                                    onClick={() => handleSelectTheme(theme)}
                                    className={`
                    relative w-12 h-12 rounded-xl overflow-hidden transition-all hover:scale-110
                    ${selectedTheme === theme.id ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
                  `}
                                    style={{ background: theme.colors.gradient }}
                                    title={theme.nameAr}
                                >
                                    <div
                                        className="absolute inset-0 flex items-center justify-center"
                                        style={{ background: `linear-gradient(135deg, ${theme.preview.primary} 50%, ${theme.preview.secondary} 50%)` }}
                                    >
                                        {selectedTheme === theme.id && (
                                            <Check size={16} className="text-white drop-shadow-lg" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* رأس القسم */}
            <div className={`p-6 rounded-2xl ${isDark ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/20' : 'bg-gradient-to-r from-purple-50 to-pink-50'}`}>
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                        <Palette size={28} className="text-purple-500" />
                    </div>
                    <div>
                        <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            الثيمات الراقية
                        </h2>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            اختر سمة الوضع الليلي المفضلة
                        </p>
                    </div>
                </div>
            </div>

            {/* شبكة الثيمات */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {premiumThemes.map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => handleSelectTheme(theme)}
                        className={`
              group relative p-4 rounded-2xl border-2 transition-all duration-300
              hover:scale-[1.02] hover:shadow-xl
              ${selectedTheme === theme.id
                                ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                                : isDark
                                    ? 'border-slate-700 hover:border-slate-600'
                                    : 'border-slate-200 hover:border-slate-300'
                            }
            `}
                        style={{
                            background: isDark ? theme.colors.bgCard : undefined
                        }}
                    >
                        {/* معاينة الألوان */}
                        <div className="relative h-20 rounded-xl overflow-hidden mb-3">
                            <div
                                className="absolute inset-0"
                                style={{ background: theme.colors.gradient }}
                            />
                            <div className="absolute inset-2 flex gap-1">
                                <div
                                    className="flex-1 rounded-lg"
                                    style={{ background: theme.preview.primary }}
                                />
                                <div
                                    className="w-8 rounded-lg"
                                    style={{ background: theme.preview.secondary }}
                                />
                                <div
                                    className="w-4 rounded-lg"
                                    style={{ background: theme.preview.accent }}
                                />
                            </div>

                            {/* علامة الاختيار */}
                            {selectedTheme === theme.id && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                    <Check size={14} className="text-white" />
                                </div>
                            )}

                            {/* تأثير التوهج */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{
                                    background: `radial-gradient(circle at center, ${theme.colors.glow} 0%, transparent 70%)`
                                }}
                            />
                        </div>

                        {/* اسم الثيم */}
                        <div className="text-center">
                            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {theme.nameAr}
                            </h3>
                            <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {theme.description}
                            </p>
                        </div>

                        {/* مؤشر النوع */}
                        <div className={`
              absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center
              ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-md border
              ${isDark ? 'border-slate-700' : 'border-slate-200'}
            `}>
                            <Moon size={12} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                        </div>
                    </button>
                ))}
            </div>

            {/* الثيم الحالي */}
            <div className={`
        p-4 rounded-2xl border flex items-center justify-between
        ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}
      `}>
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl"
                        style={{ background: currentTheme.colors.gradient }}
                    />
                    <div>
                        <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            الثيم الحالي: {currentTheme.nameAr}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {currentTheme.description}
                        </p>
                    </div>
                </div>
                <Sparkles size={20} className="text-yellow-500 animate-pulse" />
            </div>
        </div>
    );
};

export default ThemeSelector;
