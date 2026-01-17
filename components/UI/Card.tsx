
import React from 'react';
import { useApp } from '../../context/AppContext';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  extra?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, title, subtitle, extra, padding = 'md', className = '', interactive = false, onClick }) => {
  const { theme } = useApp();

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div
      className={`
        rounded-2xl transition-all duration-300 overflow-hidden border shadow-sm
        ${theme === 'light'
          ? 'bg-white border-slate-200'
          : 'bg-slate-900 border-indigo-900/30'
        }
        ${interactive ? 'card-interactive cursor-pointer' : ''}
        ${className}
      `}
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {(title || extra) && (
        <div className={`
          px-6 py-4 border-b flex items-center justify-between
          ${theme === 'light' ? 'border-slate-100' : 'border-indigo-900/30'}
        `}>
          <div>
            {title && (
              <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'light' ? 'text-slate-500' : 'text-indigo-300'}`}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={`text-[9px] font-bold mt-0.5 ${theme === 'light' ? 'text-slate-400' : 'text-indigo-400/60'}`}>
                {subtitle}
              </p>
            )}
          </div>
          {extra && <div className="flex items-center gap-2">{extra}</div>}
        </div>
      )}
      <div className={paddingStyles[padding]}>
        {children}
      </div>
    </div>
  );
};

export default Card;
