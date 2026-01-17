
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Language } from '../../types';
import { UserRole, ROLE_NAMES } from '../../types/organization';
import { SafeStorage } from '../../utils/storage';
import { authService } from '../../services/authService';

// Simple translation placeholder - ideally move to i18n module
import { translations } from '../../i18n/translations';

interface UserContextValue {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;

    // إضافات جديدة للأدوار
    userRole: UserRole;
    setUserRole: (role: UserRole) => void;
    roleName: string;
    availableRoles: { id: UserRole; name: string }[];
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

// الأدوار المتاحة
const AVAILABLE_ROLES: { id: UserRole; name: string }[] = [
    { id: 'manager', name: ROLE_NAMES.manager },
    { id: 'accountant', name: ROLE_NAMES.accountant },
    { id: 'employee', name: ROLE_NAMES.employee }
];

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // حالة التحميل الأولي
    const [isLoading, setIsLoading] = useState(true);

    // المستخدم الحالي
    const [user, setUserState] = useState<User | null>(null);

    // الدور الحالي (منفصل للتحكم المرن)
    const [userRole, setUserRoleState] = useState<UserRole>(() => {
        const savedRole = SafeStorage.get<UserRole>('alzhra_user_role', 'manager');
        return savedRole;
    });

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    const [language, setLanguageState] = useState<Language>(() =>
        SafeStorage.get('alzhra_lang', 'ar')
    );

    // الاستماع لتغييرات حالة المصادقة من Supabase
    useEffect(() => {
        // التحقق من الجلسة الحالية عند بدء التطبيق
        const checkCurrentUser = async () => {
            try {
                const currentUser = await authService.getCurrentUser();
                if (currentUser) {
                    setUserState({
                        id: currentUser.id,
                        name: currentUser.name,
                        email: currentUser.email || '',
                        role: currentUser.role,
                        isActive: currentUser.isActive
                    });
                    setUserRoleState(currentUser.role);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Error checking current user:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkCurrentUser();

        // الاستماع لتغييرات المصادقة
        const { data: { subscription } } = authService.onAuthStateChange((authUser) => {
            if (authUser) {
                setUserState({
                    id: authUser.id,
                    name: authUser.name,
                    email: authUser.email || '',
                    role: authUser.role,
                    isActive: authUser.isActive
                });
                setUserRoleState(authUser.role);
                setIsAuthenticated(true);
            } else {
                setUserState(null);
                setIsAuthenticated(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // حفظ الدور
    useEffect(() => {
        SafeStorage.set('alzhra_user_role', userRole);
        // تحديث الدور في المستخدم أيضاً
        if (user) {
            setUserState(prev => prev ? { ...prev, role: userRole as any } : null);
        }
    }, [userRole]);

    // حفظ اللغة
    useEffect(() => {
        SafeStorage.set('alzhra_lang', language);
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [language]);

    const setUser = useCallback((newUser: User | null) => {
        setUserState(newUser);
        setIsAuthenticated(!!newUser);
    }, []);

    const logout = useCallback(async () => {
        await authService.signOut();
        setUserState(null);
        setIsAuthenticated(false);
        SafeStorage.remove('alzhra_user');
        SafeStorage.remove('alzhra_user_role');
    }, []);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
    }, []);

    const setUserRole = useCallback((role: UserRole) => {
        setUserRoleState(role);
    }, []);

    const t = useCallback((key: string) => translations[language][key] || key, [language]);

    return (
        <UserContext.Provider value={{
            user,
            isAuthenticated,
            isLoading,
            setUser,
            logout,
            language,
            setLanguage,
            t,
            // الأدوار
            userRole,
            setUserRole,
            roleName: ROLE_NAMES[userRole],
            availableRoles: AVAILABLE_ROLES
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
