
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const { theme } = useApp();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[98vw] sm:max-w-[95vw]',
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className={`
          absolute inset-0 backdrop-blur-sm animate-in fade-in duration-300
          ${theme === 'light'
            ? 'bg-slate-900/40'
            : 'bg-indigo-950/70'
          }
        `}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className={`
        relative w-full h-full sm:h-auto ${sizeClasses[size]} rounded-none sm:rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] 
        flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 sm:slide-in-from-bottom-0 duration-300 transition-colors
        border-none sm:border max-h-[100vh] sm:max-h-[90vh]
        ${theme === 'light'
          ? 'bg-white border-slate-200'
          : 'bg-slate-900 border-indigo-800/30'
        }
      `}>
        {/* Header - Colored Accent Top */}
        <div className={`h-1 w-full shrink-0 ${theme === 'light' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}></div>
        <div className={`
          px-6 py-4 sm:py-5 border-b flex items-center justify-between shrink-0
          ${theme === 'light'
            ? 'bg-white border-slate-100'
            : 'bg-slate-900 border-indigo-800/30'
          }
        `}>
          <h3 className={`text-base sm:text-lg font-black uppercase tracking-tight truncate pr-4 ${theme === 'light' ? 'text-slate-900' : 'text-indigo-100'}`}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className={`
              p-3 rounded-xl transition-all border touch-feedback min-w-[44px] min-h-[44px] flex items-center justify-center
              ${theme === 'light'
                ? 'bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 border-transparent hover:border-rose-100'
                : 'bg-indigo-900/50 text-indigo-400 hover:text-rose-400 hover:bg-rose-900/20 border-indigo-800/30 hover:border-rose-800/30'
              }
            `}
            aria-label="إغلاق"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body - Scrollable Area */}
        <div className={`
          flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar
          ${theme === 'light' ? 'bg-white' : 'bg-slate-900'}
        `}>
          <div className="max-w-full overflow-x-hidden">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className={`
          px-6 py-2 pb-6 sm:pb-2 border-t flex justify-end shrink-0
          ${theme === 'light'
            ? 'bg-slate-50/50 border-slate-100'
            : 'bg-indigo-950/30 border-indigo-800/30'
          }
        `}>
          <span className={`text-[8px] font-black uppercase tracking-[0.3em] text-center w-full sm:w-auto ${theme === 'light' ? 'text-slate-300' : 'text-indigo-500'}`}>
            Alzhra Finance Secure Session v2.0
          </span>
        </div>
      </div>
    </div>
  );
};

export default Modal;
