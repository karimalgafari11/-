/**
 * AutoStatCard Component
 * بطاقة إحصائية بتصميم السيارة - مكون مستخرج من Dashboard
 */

import React from 'react';
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';
import FuturisticCard from './FuturisticCard';

export interface AutoStatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    trend?: string;
    isUp?: boolean;
    color: string;
    subtitle?: string;
    isDark: boolean;
    isHidden: boolean;
    maskValue: (value: string | number) => string | number;
}

const AutoStatCard = React.memo(({
    icon: Icon, label, value, trend, isUp, color, subtitle, isDark, isHidden, maskValue
}: AutoStatCardProps) => (
    <FuturisticCard glow className="group hover:scale-[1.02] transition-all duration-300 stat-card-mobile" isDark={isDark}>
        <div className="flex items-start justify-between">
            <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl stat-icon icon-container ${isDark ? `bg-${color}-500/20` : `bg-${color}-100`} group-hover:scale-110 transition-transform`}>
                <Icon size={18} className={`text-${color}-500`} />
            </div>
            {trend && (
                <div className={`flex items-center gap-0.5 text-[10px] sm:text-xs font-black ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    <span className="hidden sm:inline">{trend}</span>
                </div>
            )}
        </div>
        <div className="mt-2 sm:mt-4">
            <p className={`text-lg sm:text-2xl font-black stat-value ${isDark ? 'text-white' : 'text-slate-800'} ${isHidden ? 'blur-sm select-none' : ''}`}>
                {maskValue(value)}
            </p>
            <p className={`text-[9px] sm:text-xs font-bold mt-0.5 sm:mt-1 stat-label ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
            {subtitle && <p className={`text-[8px] sm:text-[10px] mt-0.5 card-subtitle ${isDark ? 'text-cyan-400' : 'text-cyan-600'} hidden sm:block`}>{subtitle}</p>}
        </div>
        {isDark && (
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-${color}-500 to-transparent opacity-50`} />
        )}
    </FuturisticCard>
));

AutoStatCard.displayName = 'AutoStatCard';

export default AutoStatCard;
