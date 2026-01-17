
import React from 'react';
import { useApp } from '../../context/AppContext';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  fullWidth,
  className = '',
  ...props
}) => {
  const { theme } = useApp();

  const baseStyles = "inline-flex items-center justify-center font-black uppercase tracking-widest transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none btn-ripple touch-feedback";

  const variants = {
    primary: theme === 'light'
      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-orange-600"
      : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-900/30 hover:from-indigo-500 hover:to-purple-500",
    secondary: theme === 'light'
      ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
      : "bg-indigo-900/50 text-indigo-200 hover:bg-indigo-800/50",
    danger: "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/20 hover:from-rose-600 hover:to-pink-600",
    success: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-600",
    outline: theme === 'light'
      ? "border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-amber-200 hover:text-amber-600"
      : "border border-indigo-700 text-indigo-300 hover:bg-indigo-900/50 hover:border-indigo-500",
    ghost: theme === 'light'
      ? "text-slate-500 hover:bg-slate-100"
      : "text-indigo-400 hover:bg-indigo-900/30"
  };

  // Improved sizes for better touch targets (minimum 44px height)
  const sizes = {
    sm: "px-4 py-2.5 text-[9px] rounded-lg gap-1.5 min-h-[40px]",
    md: "px-6 py-3 text-[10px] rounded-xl gap-2 min-h-[48px]",
    lg: "px-8 py-4 text-[11px] rounded-2xl gap-3 min-h-[56px]"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon}
      {children}
    </button>
  );
};

export default Button;
