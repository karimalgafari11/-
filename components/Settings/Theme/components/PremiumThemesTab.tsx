/**
 * Premium Themes Tab
 * تبويب الثيمات الراقية
 */

import React from 'react';
import { Crown, Moon, Check, Sparkles } from 'lucide-react';
import SettingsCard from '../../SettingsCard';
import { premiumThemes, getThemeById, PremiumTheme } from '../../../../utils/themes';

interface PremiumThemesTabProps {
    selectedPremiumTheme: string;
    onThemeSelect: (theme: PremiumTheme) => void;
}

const PremiumThemesTab: React.FC<PremiumThemesTabProps> = ({
    selectedPremiumTheme,
    onThemeSelect
}) => {
    const currentTheme = getThemeById(selectedPremiumTheme);

    return (
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
                        onClick={() => onThemeSelect(pTheme)}
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
                    style={{ background: currentTheme.colors.gradient }}
                />
                <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                        الثيم الحالي: {currentTheme.nameAr}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        {currentTheme.description}
                    </p>
                </div>
                <Sparkles size={20} className="text-yellow-500 animate-pulse" />
            </div>
        </SettingsCard>
    );
};

export default PremiumThemesTab;
