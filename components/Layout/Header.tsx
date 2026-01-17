
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useSettings } from '../../context/SettingsContext';

import { Menu, ChevronRight, Moon, Sun, Globe, Bell, Sparkles, LogOut, User } from 'lucide-react';
import GlobalSearch from '../Common/GlobalSearch';

interface HeaderProps {
  onOpenMenu: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenMenu }) => {
  const { t, language, setLanguage, theme, toggleTheme, user } = useApp();
  const { activeCompany } = useSettings();

  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const pageConfig: Record<string, { label: string; color: string; darkColor: string }> = {
    '/dashboard': { label: t('dashboard'), color: 'from-blue-500 to-cyan-500', darkColor: 'from-blue-600 to-cyan-600' },
    '/accounting': { label: t('accounting'), color: 'from-emerald-500 to-teal-500', darkColor: 'from-emerald-600 to-teal-600' },
    '/sales': { label: 'المبيعات', color: 'from-violet-500 to-purple-500', darkColor: 'from-violet-600 to-purple-600' },
    '/purchases': { label: 'المشتريات', color: 'from-cyan-500 to-blue-500', darkColor: 'from-cyan-600 to-blue-600' },
    '/expenses': { label: 'المصروفات', color: 'from-rose-500 to-pink-500', darkColor: 'from-rose-600 to-pink-600' },
    '/vouchers': { label: 'السندات', color: 'from-teal-500 to-emerald-500', darkColor: 'from-teal-600 to-emerald-600' },
    '/invoices': { label: t('invoices'), color: 'from-amber-500 to-orange-500', darkColor: 'from-amber-600 to-orange-600' },
    '/reports': { label: t('reports'), color: 'from-indigo-500 to-violet-500', darkColor: 'from-indigo-600 to-violet-600' },
    '/settings': { label: t('settings'), color: 'from-slate-500 to-zinc-500', darkColor: 'from-slate-600 to-zinc-600' },
    '/inventory': { label: t('inventory'), color: 'from-amber-500 to-yellow-500', darkColor: 'from-amber-600 to-yellow-600' },
    '/suppliers': { label: t('suppliers'), color: 'from-teal-500 to-emerald-500', darkColor: 'from-teal-600 to-emerald-600' },
    '/customers': { label: 'العملاء', color: 'from-pink-500 to-rose-500', darkColor: 'from-pink-600 to-rose-600' },
  };

  const currentPage = pageConfig[location.pathname] || { label: t('dashboard'), color: 'from-blue-500 to-cyan-500', darkColor: 'from-blue-600 to-cyan-600' };

  const handleLogout = () => {
    // تسجيل الخروج - يمكن إضافة منطق إضافي هنا
    navigate('/dashboard');
    setShowUserMenu(false);
  };

  return (
    <header className={`
      h-16 border-b flex items-center justify-between px-3 lg:px-8 shrink-0 transition-all duration-500 z-30 relative
      ${theme === 'light'
        ? 'bg-[#faf8f5] border-amber-200/30 shadow-sm'
        : 'bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border-indigo-800/30 shadow-lg shadow-indigo-900/20'
      }
    `}>
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        <button
          onClick={onOpenMenu}
          className={`
            lg:hidden p-2.5 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 touch-feedback flex items-center justify-center
            ${theme === 'light'
              ? 'text-stone-600 hover:bg-amber-100 bg-white border border-amber-200/50 shadow-sm'
              : 'text-indigo-300 hover:bg-indigo-800 bg-indigo-900/50 border border-indigo-700'
            }
          `}
          aria-label="فتح القائمة"
        >
          <Menu size={20} className="hover:rotate-180 transition-transform duration-500" />
        </button>

        <div className="hidden sm:flex items-center gap-3">
          <span className={`
            text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all duration-300 hover:scale-105
            ${theme === 'light' ? 'text-stone-400 hover:text-amber-600' : 'text-indigo-500 hover:text-indigo-300'}
          `}>
            {language === 'ar' ? 'الرئيسية' : 'Home'}
          </span>

          <ChevronRight
            size={14}
            className={`
              ${language === 'ar' ? 'rotate-180' : ''} 
              ${theme === 'light' ? 'text-stone-300' : 'text-indigo-700'}
              animate-pulse
            `}
          />

          {/* شريط اسم الصفحة الملون */}
          <div className={`
            px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg transition-all duration-300 hover:scale-105 group
            bg-gradient-to-r ${theme === 'light' ? currentPage.color : currentPage.darkColor}
          `}>
            <Sparkles size={12} className="text-white/80 group-hover:animate-spin" />
            <span className="text-[11px] font-black text-white uppercase tracking-wider">
              {currentPage.label}
            </span>
          </div>
        </div>

        {/* Global Search Bar - Responsive */}
        <div className={`
          ${showMobileSearch ? 'absolute inset-0 z-50 px-4 bg-white dark:bg-slate-900 flex items-center' : 'hidden'} 
          md:static md:flex md:flex-1 md:px-6 md:justify-center md:bg-transparent md:z-auto
        `}>
          <div className="w-full max-w-lg flex items-center gap-2">
            {showMobileSearch && (
              <button
                onClick={() => setShowMobileSearch(false)}
                className="p-2 md:hidden"
              >
                <ChevronRight size={20} className={language === 'ar' ? '' : 'rotate-180'} />
              </button>
            )}
            <div className="flex-1">
              <GlobalSearch />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4">
        {/* زر البحث للموبايل */}
        <button
          onClick={() => setShowMobileSearch(true)}
          className={`
            md:hidden p-2.5 rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 touch-feedback
            ${theme === 'light'
              ? 'text-stone-500 hover:bg-amber-100 bg-white border-amber-200/50 shadow-sm'
              : 'text-indigo-300 hover:bg-indigo-800 bg-indigo-900/50 border-indigo-700'
            }
          `}
        >
          <Sparkles size={18} className="rotate-90" /> {/* أيقونة بحث بديلة أو استخدم Search icon */}
        </button>

        {/* زر تغيير الوضع */}
        <button
          onClick={toggleTheme}
          className={`
            hidden sm:flex p-2.5 rounded-xl border transition-all duration-500 items-center justify-center group hover:scale-105 active:scale-95 touch-feedback
            ${theme === 'light'
              ? 'text-amber-700 hover:bg-gradient-to-br hover:from-indigo-500 hover:to-purple-600 hover:text-white border-amber-200/50 bg-white shadow-sm'
              : 'text-indigo-300 hover:bg-gradient-to-br hover:from-amber-400 hover:to-orange-500 hover:text-white border-indigo-700 bg-indigo-900/50'
            }
          `}
          title={theme === 'light' ? 'الوضع الليلي' : 'الوضع النهاري'}
        >
          {theme === 'light' ? (
            <Moon size={18} className="group-hover:rotate-[360deg] transition-transform duration-700" />
          ) : (
            <Sun size={18} className="text-amber-400 group-hover:rotate-180 transition-transform duration-700" />
          )}
        </button>

        {/* زر تغيير اللغة - ظاهر دائماً */}
        <button
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className={`
            flex items-center gap-1.5 px-2.5 py-2.5 rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 touch-feedback
            ${theme === 'light'
              ? 'border-amber-200/50 hover:bg-amber-100 bg-white shadow-sm'
              : 'border-indigo-700 hover:bg-indigo-800 bg-indigo-900/50'
            }
          `}
        >
          <Globe size={16} className={`${theme === 'light' ? 'text-amber-500' : 'text-indigo-400'}`} />
          <span className={`text-[10px] font-bold ${theme === 'light' ? 'text-stone-600' : 'text-indigo-200'}`}>
            {language === 'ar' ? 'En' : 'ع'}
          </span>
        </button>

        {/* زر التنبيهات - ظاهر الآن على الهواتف */}
        <button
          onClick={() => alert('التنبيهات: لا توجد تنبيهات جديدة')}
          className={`
            p-2.5 rounded-xl relative border transition-all duration-300 hover:scale-105 active:scale-95 group touch-feedback flex items-center justify-center
            ${theme === 'light'
              ? 'text-stone-500 hover:bg-rose-50 hover:text-rose-500 border-amber-200/50 bg-white'
              : 'text-indigo-300 hover:bg-rose-900/20 hover:text-rose-400 border-indigo-700 bg-indigo-900/50'
            }
          `}
          title="التنبيهات"
        >
          <Bell size={18} className="group-hover:animate-bounce" />
          <span className={`
            absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-pulse
            ${theme === 'light' ? 'bg-rose-500' : 'bg-purple-500'}
          `}></span>
        </button>

        {/* أيقونة المستخدم مع قائمة منسدلة */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm transition-all duration-300 hover:scale-105
              ${theme === 'light'
                ? 'bg-gradient-to-br from-amber-100 to-orange-50 border-amber-300'
                : 'bg-gradient-to-br from-indigo-600 to-purple-600 border-indigo-400'
              }
            `}
          >
            <span className={`font-bold text-sm ${theme === 'light' ? 'text-amber-700' : 'text-white'}`}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
          </button>

          {/* قائمة المستخدم */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              ></div>
              <div className={`
                absolute top-14 left-2 w-48 rounded-xl shadow-xl border z-50 overflow-hidden
                ${theme === 'light'
                  ? 'bg-white border-gray-200'
                  : 'bg-slate-900 border-indigo-700'
                }
              `}>
                {/* معلومات المستخدم */}
                <div className={`p-3 border-b ${theme === 'light' ? 'border-gray-100' : 'border-indigo-800'}`}>
                  <p className={`font-bold text-sm ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                    {user?.name || 'مستخدم'}
                  </p>
                  <p className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-indigo-400'}`}>
                    {activeCompany?.name || 'الشركة'}
                  </p>
                </div>

                {/* الملف الشخصي */}
                <button
                  onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors
                    ${theme === 'light'
                      ? 'hover:bg-gray-50 text-gray-700'
                      : 'hover:bg-indigo-800 text-indigo-200'
                    }
                  `}
                >
                  <User size={16} />
                  <span>الملف الشخصي</span>
                </button>

                {/* تسجيل الخروج */}
                <button
                  onClick={handleLogout}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors
                    ${theme === 'light'
                      ? 'hover:bg-red-50 text-red-600'
                      : 'hover:bg-red-900/30 text-red-400'
                    }
                  `}
                >
                  <LogOut size={16} />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
