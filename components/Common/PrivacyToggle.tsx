
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Context for global privacy state
interface PrivacyContextValue {
    isHidden: boolean;
    toggleVisibility: () => void;
    maskValue: (value: string | number) => string;
}

const PrivacyContext = createContext<PrivacyContextValue | undefined>(undefined);

export const PrivacyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isHidden, setIsHidden] = useState(false);

    const toggleVisibility = useCallback(() => {
        setIsHidden(prev => !prev);
    }, []);

    const maskValue = useCallback((value: string | number): string => {
        if (!isHidden) return typeof value === 'number' ? value.toLocaleString() : value;
        return '••••••';
    }, [isHidden]);

    return (
        <PrivacyContext.Provider value={{ isHidden, toggleVisibility, maskValue }}>
            {children}
        </PrivacyContext.Provider>
    );
};

export const usePrivacy = () => {
    const context = useContext(PrivacyContext);
    if (!context) {
        throw new Error('usePrivacy must be used within a PrivacyProvider');
    }
    return context;
};

// زر التبديل للإخفاء/الإظهار
interface PrivacyToggleProps {
    className?: string;
    showLabel?: boolean;
}

export const PrivacyToggle: React.FC<PrivacyToggleProps> = ({ className = '', showLabel = true }) => {
    const { isHidden, toggleVisibility } = usePrivacy();
    const { theme } = useApp();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleVisibility}
            className={`
        flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 group
        ${isDark
                    ? isHidden
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30'
                    : isHidden
                        ? 'bg-rose-100 text-rose-600 border border-rose-200 hover:bg-rose-200'
                        : 'bg-blue-100 text-blue-600 border border-blue-200 hover:bg-blue-200'
                }
        ${className}
      `}
            title={isHidden ? 'إظهار القيم المالية' : 'إخفاء القيم المالية'}
        >
            {isHidden
                ? <EyeOff size={16} className="group-hover:scale-110 transition-transform" />
                : <Eye size={16} className="group-hover:scale-110 transition-transform" />
            }
            {showLabel && (
                <span className="text-xs font-bold">
                    {isHidden ? 'إظهار القيم' : 'إخفاء القيم'}
                </span>
            )}
        </button>
    );
};

// مكون لعرض القيمة مع إمكانية الإخفاء
interface PrivacyValueProps {
    value: string | number;
    suffix?: string;
    prefix?: string;
    className?: string;
}

export const PrivacyValue: React.FC<PrivacyValueProps> = ({
    value,
    suffix = '',
    prefix = '',
    className = ''
}) => {
    const { maskValue, isHidden } = usePrivacy();
    const { theme } = useApp();

    return (
        <span className={`
      transition-all duration-300
      ${isHidden ? 'filter blur-[3px] select-none' : ''}
      ${className}
    `}>
            {prefix}{maskValue(value)}{suffix}
        </span>
    );
};

export default PrivacyToggle;
