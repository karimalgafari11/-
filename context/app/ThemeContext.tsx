
import React, { createContext, useContext, useState, useEffect } from 'react';

import { getThemeById, applyTheme } from '../../utils/themes';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
    theme: ThemeMode;
    toggleTheme: () => void;
    setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<ThemeMode>('light');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            // استخدام المظهر الافتراضي
            const premiumTheme = getThemeById('midnight-ocean');
            applyTheme(premiumTheme);
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.remove('theme-active');
        }
    }, [theme]);

    const toggleTheme = () => setThemeState(prev => prev === 'light' ? 'dark' : 'light');
    const setTheme = (mode: ThemeMode) => setThemeState(mode);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};
