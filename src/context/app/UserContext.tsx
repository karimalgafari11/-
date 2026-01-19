
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Language } from '../../../types';
import { SafeStorage } from '../../../utils/storage';

interface UserContextValue {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    logout: () => void;
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string; // Translation helper
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

// Simple translation placeholder - ideally move to i18n module
import { translations } from '../../../i18n/translations';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUserState] = useState<User | null>(() =>
        SafeStorage.get('alzhra_user', { id: '1', companyId: '', name: 'أحمد المحاسب', role: 'manager', isActive: true })
    );

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!user);

    const [language, setLanguageState] = useState<Language>(() =>
        SafeStorage.get('alzhra_lang', 'ar')
    );

    useEffect(() => {
        SafeStorage.set('alzhra_user', user);
        setIsAuthenticated(!!user);
    }, [user]);

    useEffect(() => {
        SafeStorage.set('alzhra_lang', language);
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [language]);

    const setUser = (newUser: User | null) => {
        setUserState(newUser);
    };

    const logout = () => {
        setUser(null);
    };

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const t = (key: string) => translations[language][key] || key;

    return (
        <UserContext.Provider value={{
            user,
            isAuthenticated,
            setUser,
            logout,
            language,
            setLanguage,
            t
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within UserProvider');
    return context;
};
