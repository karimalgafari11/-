
import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, X, TrendingUp, TrendingDown, BarChart3, Eye, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { usePrivacy } from '../Common/PrivacyToggle';

interface StatsDetailData {
  title: string;
  description?: string;
  items?: Array<{ label: string; value: string | number; trend?: string; isUp?: boolean }>;
  chartData?: Array<{ name: string; value: number }>;
  actions?: Array<{ label: string; onClick: () => void; variant?: 'primary' | 'secondary' }>;
}

interface StatsCardProps {
  label: string;
  value: string;
  count?: number;
  trend?: string;
  isUp?: boolean;
  icon: any;
  color: string;
  bg: string;
  currency?: string;
  showCurrency?: boolean;
  className?: string;
  variant?: 'default' | 'revenue' | 'expense' | 'profit' | 'warning' | 'info';
  // New interactive props
  onClick?: () => void;
  detailData?: StatsDetailData;
  interactive?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  label, value, count, trend, isUp, icon: Icon, color, bg, currency = "SAR",
  showCurrency = true, className = "", variant = 'default',
  onClick, detailData, interactive = true
}) => {
  const { theme } = useApp();
  const { isHidden, maskValue } = usePrivacy();
  const [showDetail, setShowDetail] = useState(false);

  const isDark = theme === 'dark';

  // أنماط محسّنة لكل نوع من البطاقات
  const variantStyles = {
    default: {
      light: 'bg-white border-slate-200 hover:border-slate-300',
      dark: 'bg-slate-900 border-indigo-900/30 hover:border-indigo-700/50',
      gradient: 'from-slate-400 to-slate-600',
      iconBg: bg,
      modalAccent: 'from-slate-500 to-slate-600',
    },
    revenue: {
      light: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-white border-blue-200 hover:border-blue-300',
      dark: 'bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900 border-blue-800/30 hover:border-blue-600/50',
      gradient: 'from-blue-500 to-indigo-600',
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      modalAccent: 'from-blue-500 to-indigo-600',
    },
    expense: {
      light: 'bg-gradient-to-br from-rose-50 via-pink-50 to-white border-rose-200 hover:border-rose-300',
      dark: 'bg-gradient-to-br from-rose-950 via-pink-950 to-slate-900 border-rose-800/30 hover:border-rose-600/50',
      gradient: 'from-rose-500 to-pink-600',
      iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600',
      modalAccent: 'from-rose-500 to-pink-600',
    },
    profit: {
      light: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-emerald-200 hover:border-emerald-300',
      dark: 'bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 border-emerald-800/30 hover:border-emerald-600/50',
      gradient: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      modalAccent: 'from-emerald-500 to-teal-600',
    },
    warning: {
      light: 'bg-gradient-to-br from-amber-50 via-orange-50 to-white border-amber-200 hover:border-amber-300',
      dark: 'bg-gradient-to-br from-amber-950 via-orange-950 to-slate-900 border-amber-800/30 hover:border-amber-600/50',
      gradient: 'from-amber-500 to-orange-600',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
      modalAccent: 'from-amber-500 to-orange-600',
    },
    info: {
      light: 'bg-gradient-to-br from-cyan-50 via-sky-50 to-white border-cyan-200 hover:border-cyan-300',
      dark: 'bg-gradient-to-br from-cyan-950 via-sky-950 to-slate-900 border-cyan-800/30 hover:border-cyan-600/50',
      gradient: 'from-cyan-500 to-sky-600',
      iconBg: 'bg-gradient-to-br from-cyan-500 to-sky-600',
      modalAccent: 'from-cyan-500 to-sky-600',
    },
  };

  const currentVariant = variantStyles[variant];
  const useGradientIcon = variant !== 'default';

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (interactive && detailData) {
      setShowDetail(true);
    }
  };

  // نافذة التفاصيل
  const DetailModal = () => {
    if (!showDetail || !detailData) return null;

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className={`absolute inset-0 backdrop-blur-md ${isDark ? 'bg-slate-950/80' : 'bg-slate-900/40'}`}
          onClick={() => setShowDetail(false)}
        />

        {/* Modal */}
        <div className={`
          relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl
          animate-in zoom-in-95 slide-in-from-bottom-4 duration-300
          ${isDark ? 'bg-slate-900' : 'bg-white'}
        `}>
          {/* Gradient Header */}
          <div className={`h-2 bg-gradient-to-r ${currentVariant.modalAccent}`} />

          {/* Header */}
          <div className={`p-5 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`
                  p-3 rounded-xl shadow-lg
                  ${useGradientIcon ? currentVariant.iconBg + ' text-white' : `${bg} ${color}`}
                `}>
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className={`font-black text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {detailData.title || label}
                  </h3>
                  {detailData.description && (
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {detailData.description}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className={`
                  p-2 rounded-xl transition-all touch-feedback
                  ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}
                `}
              >
                <X size={20} />
              </button>
            </div>

            {/* Main Value Display */}
            <div className={`
              mt-4 p-4 rounded-2xl
              ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}
            `}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    القيمة الحالية
                  </p>
                  <p className={`text-3xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'} ${isHidden ? 'blur-sm' : ''}`}>
                    {isHidden ? '••••••' : value}
                    {showCurrency && (
                      <span className={`text-sm ml-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {currency}
                      </span>
                    )}
                  </p>
                </div>
                {trend && (
                  <div className={`
                    flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-black
                    ${isUp
                      ? isDark ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                      : isDark ? 'bg-rose-900/50 text-rose-400' : 'bg-rose-100 text-rose-700'
                    }
                  `}>
                    {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {trend}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detail Items */}
          {detailData.items && detailData.items.length > 0 && (
            <div className={`p-5 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <p className={`text-xs font-bold mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                تفاصيل إضافية
              </p>
              <div className="space-y-3">
                {detailData.items.map((item, index) => (
                  <div
                    key={index}
                    className={`
                      flex items-center justify-between p-3 rounded-xl
                      ${isDark ? 'bg-slate-800/30' : 'bg-slate-50'}
                    `}
                  >
                    <span className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {item.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {item.value}
                      </span>
                      {item.trend && (
                        <span className={`text-[10px] font-bold ${item.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {item.trend}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mini Chart Placeholder */}
          {detailData.chartData && (
            <div className={`p-5 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={14} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                <p className={`text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  الرسم البياني
                </p>
              </div>
              <div className="flex items-end justify-between gap-1 h-20">
                {detailData.chartData.map((item, index) => {
                  const maxVal = Math.max(...detailData.chartData!.map(d => d.value));
                  const height = (item.value / maxVal) * 100;
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-full rounded-t-lg bg-gradient-to-t ${currentVariant.gradient} opacity-70`}
                        style={{ height: `${height}%` }}
                      />
                      <span className={`text-[8px] mt-1 font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-5">
            <div className="flex gap-3">
              {detailData.actions?.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`
                    flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all touch-feedback
                    ${action.variant === 'primary'
                      ? `bg-gradient-to-r ${currentVariant.gradient} text-white shadow-lg`
                      : isDark
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }
                  `}
                >
                  {action.label}
                </button>
              ))}
              <button
                onClick={() => setShowDetail(false)}
                className={`
                  py-3 px-6 rounded-xl text-xs font-black transition-all touch-feedback
                  ${isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}
                `}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        onClick={handleClick}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        className={`
          p-4 sm:p-5 rounded-xl sm:rounded-2xl border shadow-sm transition-all duration-500 flex flex-col justify-between group h-32 sm:h-36 relative overflow-hidden
          hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1
          ${interactive ? 'cursor-pointer active:scale-[0.98]' : ''}
          ${theme === 'light' ? currentVariant.light : currentVariant.dark}
          ${className}
          stat-card-mobile mobile-card
        `}
      >
        {/* تأثير التوهج الخلفي */}
        {useGradientIcon && (
          <div className={`
            absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-20 blur-2xl
            bg-gradient-to-br ${currentVariant.gradient}
          `} />
        )}

        {/* Interactive indicator */}
        {interactive && (
          <div className={`
            absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity
            ${isDark ? 'text-slate-600' : 'text-slate-300'}
          `}>
            <Eye size={12} />
          </div>
        )}

        <div className="flex items-center justify-between mb-2 sm:mb-3 relative z-10">
          <div className={`
            p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 group-hover:scale-110 shadow-lg stat-icon icon-container
            ${useGradientIcon ? currentVariant.iconBg + ' text-white' : `${bg} ${color}`}
          `}>
            <Icon size={18} className="sm:w-5 sm:h-5" />
          </div>

          {trend && (
            <div className={`
              flex items-center gap-0.5 sm:gap-1 px-2 py-1 rounded-lg text-[8px] sm:text-[9px] font-black backdrop-blur-sm
              ${isUp
                ? theme === 'light'
                  ? 'bg-emerald-100/80 text-emerald-700'
                  : 'bg-emerald-900/50 text-emerald-400'
                : theme === 'light'
                  ? 'bg-rose-100/80 text-rose-700'
                  : 'bg-rose-900/50 text-rose-400'
              }
            `}>
              {isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
              <span className="hidden sm:inline">{trend}</span>
            </div>
          )}
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-0.5 sm:mb-1">
            <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-tight stat-label ${theme === 'light' ? 'text-slate-500' : 'text-indigo-400/80'}`}>
              {label}
            </p>
            {count !== undefined && (
              <span className={`
                text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full
                ${theme === 'light' ? 'bg-slate-100 text-slate-500' : 'bg-indigo-900/50 text-indigo-400'}
              `}>
                {count}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <h3 className={`text-xl sm:text-2xl font-black truncate leading-none stat-value ${theme === 'light' ? 'text-slate-900' : 'text-white'} ${isHidden ? 'blur-sm select-none' : ''}`}>
              {isHidden ? '••••••' : value}
            </h3>
            {showCurrency && (
              <span className={`text-[9px] sm:text-[10px] font-bold hidden sm:inline ${theme === 'light' ? 'text-slate-400' : 'text-indigo-500'}`}>
                {currency}
              </span>
            )}
          </div>
        </div>

        {/* شريط سفلي متدرج */}
        {useGradientIcon && (
          <div className={`
            absolute bottom-0 left-0 right-0 h-0.5 sm:h-1
            bg-gradient-to-r ${currentVariant.gradient}
            opacity-50 group-hover:opacity-100 transition-opacity
          `} />
        )}

        {/* Pulse animation on hover for interactivity */}
        {interactive && (
          <div className={`
            absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100
            pointer-events-none transition-opacity duration-300
            border-2 ${isDark ? 'border-cyan-500/30' : 'border-blue-400/30'}
          `} />
        )}
      </div>

      {/* Detail Modal */}
      <DetailModal />
    </>
  );
};

export default React.memo(StatsCard);
