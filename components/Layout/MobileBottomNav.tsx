
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
    LayoutDashboard, Calculator, ShoppingBag, Package,
    MoreHorizontal, Receipt, PieChart, Settings
} from 'lucide-react';

/**
 * شريط التنقل السفلي للهاتف المحمول
 * يظهر فقط على الشاشات الصغيرة (< 1024px)
 */
const MobileBottomNav: React.FC = () => {
    const { theme, t } = useApp();
    const location = useLocation();
    const isDark = theme === 'dark';

    // العناصر الرئيسية للتنقل السريع
    const navItems = [
        { path: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
        { path: '/accounting', label: 'المحاسبة', icon: Calculator },
        { path: '/sales', label: 'المبيعات', icon: ShoppingBag },
        { path: '/inventory', label: 'المخزون', icon: Package },
        { path: '/more', label: 'المزيد', icon: MoreHorizontal, isMore: true },
    ];

    const [showMoreMenu, setShowMoreMenu] = React.useState(false);

    // عناصر قائمة المزيد
    const moreItems = [
        { path: '/purchases', label: 'المشتريات', icon: ShoppingBag },
        { path: '/vouchers', label: 'السندات', icon: Receipt },
        { path: '/reports', label: 'التقارير', icon: PieChart },
        { path: '/settings', label: 'الإعدادات', icon: Settings },
    ];

    return (
        <>
            {/* قائمة المزيد */}
            {showMoreMenu && (
                <>
                    <div
                        className="fixed inset-0 z-[98] bg-black/30 backdrop-blur-sm lg:hidden"
                        onClick={() => setShowMoreMenu(false)}
                    />
                    <div className={`
            fixed bottom-[72px] left-4 right-4 z-[99] p-3 rounded-2xl shadow-2xl lg:hidden
            ${isDark
                            ? 'bg-slate-900 border border-slate-700'
                            : 'bg-white border border-gray-200'
                        }
          `}>
                        <div className="grid grid-cols-4 gap-2">
                            {moreItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setShowMoreMenu(false)}
                                    className={({ isActive }) => `
                    flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all touch-feedback btn-ripple overflow-hidden relative
                    ${isActive
                                            ? isDark
                                                ? 'bg-cyan-500/20 text-cyan-400'
                                                : 'bg-blue-100 text-blue-600'
                                            : isDark
                                                ? 'text-slate-400 hover:bg-slate-800'
                                                : 'text-gray-500 hover:bg-gray-100'
                                        }
                  `}
                                >
                                    <item.icon size={20} />
                                    <span className="text-[9px] font-bold">{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* شريط التنقل السفلي */}
            <nav className={`
        fixed bottom-0 left-0 right-0 z-[100] lg:hidden safe-area-bottom
        ${isDark
                    ? 'bg-slate-900/95 border-t border-slate-700/50'
                    : 'bg-white/95 border-t border-gray-200'
                }
        backdrop-blur-xl
      `}>
                <div className="flex items-center justify-around px-2 py-1">
                    {navItems.map((item) => {
                        const isActive = item.isMore
                            ? moreItems.some(m => location.pathname === m.path) || showMoreMenu
                            : location.pathname === item.path;

                        if (item.isMore) {
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                                    className={`
                    flex flex-col items-center gap-0.5 py-2 px-4 rounded-xl transition-all touch-feedback btn-ripple overflow-hidden relative min-w-[60px]
                    ${isActive
                                            ? isDark
                                                ? 'text-cyan-400'
                                                : 'text-blue-600'
                                            : isDark
                                                ? 'text-slate-500'
                                                : 'text-gray-400'
                                        }
                  `}
                                >
                                    <div className={`
                    p-1.5 rounded-xl transition-all
                    ${isActive
                                            ? isDark
                                                ? 'bg-cyan-500/20 shadow-lg shadow-cyan-500/10'
                                                : 'bg-blue-100 shadow-md shadow-blue-500/10'
                                            : ''
                                        }
                  `}>
                                        <item.icon size={20} className={isActive ? 'animate-pulse' : ''} />
                                    </div>
                                    <span className={`text-[9px] font-bold transition-all ${isActive ? 'scale-105' : ''}`}>{item.label}</span>
                                </button>
                            );
                        }

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `
                  flex flex-col items-center gap-0.5 py-2 px-4 rounded-xl transition-all touch-feedback btn-ripple overflow-hidden relative min-w-[60px]
                  ${isActive
                                        ? isDark
                                            ? 'text-cyan-400'
                                            : 'text-blue-600'
                                        : isDark
                                            ? 'text-slate-500'
                                            : 'text-gray-400'
                                    }
                `}
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className={`
                      p-1.5 rounded-xl transition-all
                      ${isActive
                                                ? isDark
                                                    ? 'bg-cyan-500/20 shadow-lg shadow-cyan-500/10'
                                                    : 'bg-blue-100 shadow-md shadow-blue-500/10'
                                                : ''
                                            }
                    `}>
                                            <item.icon size={20} className={isActive ? 'animate-pulse' : ''} />
                                        </div>
                                        <span className={`text-[9px] font-bold transition-all ${isActive ? 'scale-105' : ''}`}>{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </div>
            </nav>
        </>
    );
};

export default MobileBottomNav;
