import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState, UIPreferences, CurrencyCode } from '../types';
import { SafeStorage } from '../utils/storage';
import { useTheme } from './app/ThemeContext';
import { useNotification } from './app/NotificationContext';
import { useUser } from './app/UserContext';
import { User, Language } from '../types';

// AppSettings interface (legacy)
interface AppSettings {
  tax: {
    defaultRate: number;
    enabled: boolean;
    includedInPrice: boolean;
    customRates: { categoryId: string; rate: number; }[];
  };
  currency: CurrencyCode;
  dateFormat: string;
  numberFormat: string;
}

// Interface combining all contexts for backward compatibility
interface AppContextValue extends AppState {
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  updateUI: (prefs: Partial<UIPreferences>) => void;
  resetUI: () => void;
  theme: 'light' | 'dark';
  setUser: (user: User | null) => void;
  logout: () => void;
  t: (key: string) => string;
  notifications: any[];
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeNotification: (id: string) => void;
  exportData: () => void;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const defaultUI: UIPreferences = {
  primaryColor: '#2563eb',
  fontFamily: 'Cairo',
  baseFontSize: 14,
  cardRounding: 4,
  sidebarWidth: 260,
  gridDensity: 'comfortable',
  showDashboardStats: true,
  showDashboardCharts: true,
  showRecentTransactions: true,
  showExpenseAnalysis: true,
  showSidebarIcons: true,
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

const defaultSettings: AppSettings = {
  tax: {
    defaultRate: 15,
    enabled: true,
    includedInPrice: false,
    customRates: []
  },
  currency: 'SAR',
  dateFormat: 'YYYY-MM-DD',
  numberFormat: 'standard'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use new hooks
  const { theme, toggleTheme } = useTheme(); // Note: useTheme needs to provide theme string 'light'|'dark'
  const { notifications, showNotification, removeNotification } = useNotification();
  const { user, isAuthenticated, setUser, logout, language, setLanguage, t } = useUser();

  // Local state for UI and Settings (remaining parts)
  const [ui, setUi] = useState<UIPreferences>(() =>
    SafeStorage.get('alzhra_ui_prefs', defaultUI)
  );

  const [settings, setSettings] = useState<AppSettings>(() =>
    SafeStorage.get('alzhra_settings', defaultSettings)
  );

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    SafeStorage.set('alzhra_ui_prefs', ui);
  }, [ui]);

  useEffect(() => {
    SafeStorage.set('alzhra_settings', settings);
  }, [settings]);

  const updateUI = useCallback((prefs: Partial<UIPreferences>) => {
    setUi(prev => ({ ...prev, ...prefs }));
  }, []);

  const resetUI = useCallback(() => {
    setUi(defaultUI);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const exportData = () => showNotification('جاري تصدير البيانات...', 'info');

  const value: AppContextValue = {
    // Auth State
    user,
    isAuthenticated,
    setUser,
    logout,
    isLoading, // Managed locally or via auth

    // Theme State
    theme,
    toggleTheme,

    // Notification State
    notifications,
    showNotification,
    removeNotification,

    // Language
    language,
    setLanguage,
    t,

    // UI & Settings (Local)
    ui,
    updateUI,
    resetUI,
    settings,
    updateSettings,
    exportData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
