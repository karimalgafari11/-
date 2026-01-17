
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Calculator, PieChart, Settings,
  LogOut, Crown, X, Package, Users, ShoppingBag, Truck, TrendingDown, Receipt,
  ChevronLeft, ChevronRight, Gauge, Wrench, Car, Activity
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useSwipe } from '../../hooks/useSwipe';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { t, language, logout, user, ui, theme } = useApp();

  // إعداد إيماءات السحب للإغلاق
  // في العربية (RTL): السحب لليمين يغلق القائمة
  // في الإنجليزية (LTR): السحب لليسار يغلق القائمة
  const swipeHandlers = useSwipe({
    onSwipeRight: () => {
      if (language === 'ar' && isOpen && window.innerWidth < 1024) {
        onClose();
      }
    },
    onSwipeLeft: () => {
      if (language !== 'ar' && isOpen && window.innerWidth < 1024) {
        onClose();
      }
    },
    threshold: 50
  });

  const navItems = [
    { path: '/dashboard', label: t('dashboard'), icon: Gauge, color: 'cyan' },
    { path: '/accounting', label: t('accounting'), icon: Calculator, color: 'emerald' },
    { path: '/sales', label: 'المبيعات', icon: ShoppingBag, color: 'violet' },
    { path: '/pos', label: 'نقطة البيع', icon: Receipt, color: 'rose' },
    { path: '/purchases', label: 'المشتريات', icon: Truck, color: 'blue' },
    { path: '/expenses', label: 'المصروفات', icon: TrendingDown, color: 'rose' },
    { path: '/vouchers', label: 'السندات', icon: Receipt, color: 'teal' },
    { path: '/inventory', label: t('inventory'), icon: Wrench, color: 'amber' },
    { path: '/suppliers', label: t('suppliers'), icon: Users, color: 'indigo' },
    { path: '/customers', label: 'العملاء', icon: Users, color: 'pink' },
    { path: '/reports', label: t('reports'), icon: PieChart, color: 'purple' },
    { path: '/activity-log', label: 'سجل النشاطات', icon: Activity, color: 'orange' },
    { path: '/settings', label: t('settings'), icon: Settings, color: 'slate' },
  ];

  const isDark = theme === 'dark';

  return (
    <aside
      {...swipeHandlers}
      className={`
      fixed inset-y-0 z-50 transition-transform duration-500 lg:static lg:translate-x-0
      ${isCollapsed ? 'w-20' : 'w-64'}
      ${isDark
          ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-e border-cyan-500/20'
          : 'bg-gradient-to-b from-white via-slate-50 to-white border-e border-slate-200'
        }
      ${isOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full' : '-translate-x-full')}
      safe-area-sides
    `}>
      {/* خلفية بسيطة للوضع الليلي */}
      {isDark && (
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/5 to-transparent" />
      )}

      <div className="flex flex-col h-full relative">
        {/* شريط اللوجو */}
        <div className={`
          h-16 flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-5'} border-b relative overflow-hidden flex-shrink-0
          ${isDark
            ? 'bg-gradient-to-r from-cyan-900/50 via-slate-900 to-purple-900/50 border-cyan-500/20'
            : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 border-blue-600'
          }
        `}>
          {/* تأثير بسيط */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />

          <div className={`
            relative ${isCollapsed ? 'w-10 h-10' : 'w-10 h-10'} rounded-xl flex items-center justify-center ${isCollapsed ? '' : 'me-3'} shadow-lg group
            ${isDark
              ? 'bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-cyan-500/30'
              : 'bg-white/20 backdrop-blur-md'
            }
          `}>
            <Car className={`${isDark ? 'text-cyan-400' : 'text-white'} w-5 h-5 group-hover:animate-pulse`} />
          </div>

          {!isCollapsed && (
            <div className="flex-1">
              <span className={`
                relative font-black text-lg tracking-tight
                ${isDark
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300'
                  : 'text-white'
                }
              `}>
                الزهراء
              </span>
              <p className={`text-[9px] ${isDark ? 'text-cyan-400/60' : 'text-white/70'}`}>قطع غيار السيارات</p>
            </div>
          )}

          <button onClick={onClose} className="lg:hidden ms-auto text-white/80 hover:text-white transition-colors hover:rotate-90 duration-300 p-2 touch-target">
            <X size={20} />
          </button>
        </div>

        {/* زر طي/فتح القائمة - يظهر فقط على الشاشات الكبيرة */}
        <button
          onClick={onToggleCollapse}
          className={`
            hidden lg:flex absolute top-20 ${language === 'ar' ? '-left-3' : '-right-3'} z-50
            w-6 h-6 rounded-full items-center justify-center
            transition-all duration-300 hover:scale-110
            ${isDark
              ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/50 hover:bg-cyan-400'
              : 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 hover:bg-blue-600'
            }
          `}
        >
          {language === 'ar'
            ? (isCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />)
            : (isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />)
          }
        </button>

        {/* القائمة */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1.5 custom-scrollbar overscroll-contain">
          {navItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && onClose()}
              style={{ animationDelay: `${index * 50}ms` }}
              className={({ isActive }) => `
                flex items-center ${isCollapsed ? 'justify-center px-3' : 'px-4'} py-4 rounded-xl transition-colors duration-200 text-xs font-bold group relative overflow-hidden btn-ripple touch-feedback min-h-[52px]
                ${isActive
                  ? isDark
                    ? `bg-gradient-to-r from-${item.color}-600/30 to-${item.color}-500/10 text-${item.color}-400 border border-${item.color}-500/30 shadow-lg shadow-${item.color}-500/10`
                    : `bg-gradient-to-r from-${item.color}-500 to-${item.color}-600 text-white shadow-lg shadow-${item.color}-500/30`
                  : isDark
                    ? 'text-slate-400 hover:bg-slate-800/50 hover:text-cyan-400'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {/* خط التوهج للعنصر النشط */}
                  {isActive && isDark && (
                    <div className={`absolute ${language === 'ar' ? 'right-0' : 'left-0'} top-0 bottom-0 w-1 bg-gradient-to-b from-${item.color}-400 to-${item.color}-600 rounded-full`} />
                  )}

                  <item.icon
                    className={`
                      w-5 h-5 transition-all duration-300 flex-shrink-0
                      ${!isCollapsed && (language === 'ar' ? 'ml-3' : 'mr-3')}
                      ${isActive
                        ? isDark ? `text-${item.color}-400` : 'text-white'
                        : `text-${item.color}-500 group-hover:scale-110`
                      }
                    `}
                  />

                  {!isCollapsed && (
                    <span className={`
                      flex-1 truncate
                      ${isActive ? '' : 'group-hover:translate-x-1 transition-transform duration-300'}
                    `}>
                      {item.label}
                    </span>
                  )}

                  {/* Tooltip للوضع المصغر */}
                  {isCollapsed && (
                    <div className={`
                      absolute ${language === 'ar' ? 'right-full mr-2' : 'left-full ml-2'} 
                      px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible
                      transition-all duration-200 z-50
                      ${isDark
                        ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-xl'
                        : 'bg-slate-800 text-white shadow-xl'
                      }
                    `}>
                      {item.label}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* معلومات المستخدم */}
        <div className={`
          p-3 border-t flex-shrink-0 safe-area-bottom
          ${isDark
            ? 'border-cyan-500/10 bg-gradient-to-t from-slate-900/50 to-transparent'
            : 'border-slate-200 bg-gradient-to-t from-slate-50 to-transparent'
          }
        `}>
          <div className={`
            flex items-center ${isCollapsed ? 'justify-center' : ''} p-2 rounded-xl border transition-all duration-300 group
            ${isDark
              ? 'bg-slate-800/50 border-cyan-500/20 hover:border-cyan-500/40'
              : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'
            }
          `}>
            <div className={`
              ${isCollapsed ? 'w-10 h-10' : 'w-10 h-10'} rounded-lg flex items-center justify-center font-black ${!isCollapsed && 'me-3'} transition-all duration-300
              ${isDark
                ? 'bg-gradient-to-br from-cyan-500 to-purple-600 text-white'
                : 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
              }
            `}>
              {user?.name.charAt(0)}
            </div>

            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {user?.name}
                  </p>
                  <p className={`text-[9px] capitalize tracking-wider ${isDark ? 'text-cyan-500/60' : 'text-slate-500'}`}>
                    {user?.role}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className={`
                    p-2 rounded-lg transition-all duration-300 hover:rotate-12 btn-ripple touch-target
                    ${isDark
                      ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10'
                      : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                    }
                  `}
                >
                  <LogOut size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default React.memo(Sidebar);
