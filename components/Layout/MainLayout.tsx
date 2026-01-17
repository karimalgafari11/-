
import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useUser } from '../../context/app/UserContext';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileBottomNav from './MobileBottomNav';
import {
  X,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Bug,
  WifiOff,
  Database,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';
import AIAssistant from '../AI/AIAssistant';
import ExchangeRateReminder from '../Common/ExchangeRateReminder';
import { useSwipe } from '../../hooks/useSwipe';

const MainLayout: React.FC = () => {
  const { notifications, removeNotification, theme, language } = useApp();
  const { isAuthenticated } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // التحقق من تسجيل الدخول - إعادة توجيه لصفحة الدخول إذا لم يكن مسجلاً
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // إعداد إيماءات السحب لفتح القائمة
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      if (language === 'ar' && !sidebarOpen && window.innerWidth < 1024) {
        setSidebarOpen(true);
      }
    },
    onSwipeRight: () => {
      if (language !== 'ar' && !sidebarOpen && window.innerWidth < 1024) {
        setSidebarOpen(true);
      }
    },
    threshold: 50
  });

  // تحديد الأيقونة بناءً على نوع الخطأ
  const getErrorIcon = (notification: any) => {
    const errorCode = notification.errorDetails?.code?.toLowerCase() || '';

    if (errorCode.includes('network') || errorCode.includes('fetch')) {
      return <WifiOff size={18} />;
    }
    if (errorCode.includes('database') || errorCode.includes('db')) {
      return <Database size={18} />;
    }
    if (errorCode.includes('auth') || errorCode.includes('permission')) {
      return <ShieldAlert size={18} />;
    }

    return <AlertCircle size={18} />;
  };

  // ألوان الإشعارات
  const getNotificationStyles = (type: string, hasDetails: boolean) => {
    const isLight = theme === 'light';

    switch (type) {
      case 'success':
        return {
          container: isLight
            ? 'border-emerald-300 bg-emerald-50/95'
            : 'border-emerald-700 bg-emerald-950/95',
          icon: 'text-emerald-500',
          text: isLight ? 'text-emerald-800' : 'text-emerald-300',
          badge: 'bg-emerald-500/20 text-emerald-500'
        };
      case 'error':
        return {
          container: isLight
            ? 'border-red-300 bg-red-50/95'
            : 'border-red-700 bg-red-950/95',
          icon: 'text-red-500',
          text: isLight ? 'text-red-800' : 'text-red-300',
          badge: 'bg-red-500/20 text-red-400'
        };
      case 'warning':
        return {
          container: isLight
            ? 'border-amber-300 bg-amber-50/95'
            : 'border-amber-700 bg-amber-950/95',
          icon: 'text-amber-500',
          text: isLight ? 'text-amber-800' : 'text-amber-300',
          badge: 'bg-amber-500/20 text-amber-400'
        };
      case 'info':
      default:
        return {
          container: isLight
            ? 'border-blue-300 bg-blue-50/95'
            : 'border-indigo-600 bg-indigo-950/95',
          icon: isLight ? 'text-blue-500' : 'text-indigo-400',
          text: isLight ? 'text-blue-800' : 'text-indigo-300',
          badge: 'bg-blue-500/20 text-blue-400'
        };
    }
  };

  return (
    <div
      {...swipeHandlers}
      className={`
      flex h-screen overflow-hidden transition-colors duration-500
      ${theme === 'light'
          ? 'bg-[#faf8f5]'
          : 'bg-gradient-to-br from-slate-950 via-indigo-950/80 to-slate-950'
        }
    `}>
      {/* Enhanced Notifications Portal */}
      <div className="fixed top-6 start-1/2 -translate-x-1/2 z-[300] flex flex-col gap-3 w-full max-w-lg px-4 pointer-events-none">
        {notifications.map((n: any) => {
          const styles = getNotificationStyles(n.type, !!n.errorDetails);
          const hasErrorDetails = n.errorDetails && (n.errorDetails.name || n.errorDetails.code);

          return (
            <div
              key={n.id}
              className={`
                relative flex flex-col rounded-2xl shadow-2xl border animate-in slide-in-from-top-4 duration-300 
                pointer-events-auto backdrop-blur-md overflow-hidden
                ${styles.container}
              `}
            >
              {/* Progress bar for auto-dismiss */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-black/10">
                <div
                  className={`h-full ${styles.icon.replace('text', 'bg')} opacity-50`}
                  style={{
                    animation: 'shrinkWidth 5s linear forwards',
                  }}
                />
              </div>

              <div className="p-4 pt-5">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`shrink-0 mt-0.5 ${styles.icon}`}>
                    {n.type === 'success' && <CheckCircle size={20} className="animate-bounce" />}
                    {n.type === 'error' && getErrorIcon(n)}
                    {n.type === 'warning' && <AlertTriangle size={20} />}
                    {n.type === 'info' && <Info size={20} />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Error Name Badge - يظهر اسم الخطأ بوضوح */}
                    {hasErrorDetails && (
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`
                          inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider
                          ${styles.badge}
                        `}>
                          <Bug size={10} className="ml-1" />
                          {n.errorDetails.name}
                        </span>
                        {n.errorDetails.code && n.errorDetails.code !== n.errorDetails.name && (
                          <span className={`text-[9px] font-mono opacity-60 ${styles.text}`}>
                            [{n.errorDetails.code}]
                          </span>
                        )}
                      </div>
                    )}

                    {/* Main Message */}
                    <p className={`text-sm font-bold leading-snug ${styles.text}`}>
                      {n.message}
                    </p>

                    {/* Suggestion - اقتراح الحل */}
                    {n.errorDetails?.suggestion && (
                      <p className={`mt-1.5 text-[11px] ${styles.text} opacity-70`}>
                        💡 {n.errorDetails.suggestion}
                      </p>
                    )}

                    {/* Retry Button - زر إعادة المحاولة */}
                    {n.errorDetails?.retryable && (
                      <button
                        onClick={() => window.location.reload()}
                        className={`
                          mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase
                          ${styles.badge} hover:opacity-80 transition-opacity
                        `}
                      >
                        <RefreshCw size={12} />
                        إعادة المحاولة
                      </button>
                    )}
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => removeNotification(n.id)}
                    className={`
                      shrink-0 p-1.5 rounded-lg transition-all duration-300 
                      hover:bg-black/10 hover:rotate-90 ${styles.text} opacity-60 hover:opacity-100
                    `}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header onOpenMenu={() => setSidebarOpen(true)} />

        <main className={`
          flex-1 overflow-y-auto p-3 sm:p-4 lg:p-10 pb-20 lg:pb-10 custom-scrollbar transition-colors duration-500
          ${theme === 'light'
            ? 'bg-gradient-to-b from-[#faf8f5] to-[#f5f1ea]'
            : 'bg-gradient-to-b from-transparent via-indigo-950/20 to-slate-950/50'
          }
        `}>
          <Outlet />
        </main>
      </div>

      <AIAssistant />
      <ExchangeRateReminder />
      <MobileBottomNav />

      {sidebarOpen && (
        <div
          className={`
            fixed inset-0 z-40 lg:hidden animate-in fade-in duration-300
            ${theme === 'light'
              ? 'bg-stone-900/20 backdrop-blur-sm'
              : 'bg-indigo-950/50 backdrop-blur-sm'
            }
          `}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* CSS Animation for progress bar */}
      <style>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default MainLayout;

