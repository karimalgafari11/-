/**
 * FuturisticCard Component
 * بطاقة بتصميم مستقبلي - مكون مستخرج من Dashboard
 */

import React from 'react';

export interface FuturisticCardProps {
    children: React.ReactNode;
    className?: string;
    glow?: boolean;
    isDark: boolean;
}

const FuturisticCard = React.memo(({ children, className = '', glow = false, isDark }: FuturisticCardProps) => (
    <div className={`
    relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-5 mobile-card
    ${isDark
            ? 'bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-cyan-500/20'
            : 'bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-xl'
        }
    ${glow && isDark ? 'shadow-[0_0_30px_rgba(6,182,212,0.15)]' : ''}
    ${className}
  `}>
        {isDark && (
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwNmI2ZDQiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        )}
        <div className="relative z-10">{children}</div>
    </div>
));

FuturisticCard.displayName = 'FuturisticCard';

export default FuturisticCard;
