/**
 * User Context - سياق المستخدم
 * إدارة المستخدم والشركة والصلاحيات
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Language } from '../../types';
import { UserRole, ROLE_NAMES, Company } from '../../types/organization';

import { authService } from '../../services/authService';
import { companyService, CompanyData } from '../../services/companyService';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

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

    // الأدوار
    userRole: UserRole;
    setUserRole: (role: UserRole) => void;
    roleName: string;
    availableRoles: { id: UserRole; name: string }[];

    // الشركات - جديد
    currentCompany: CompanyData | null;
    companies: CompanyData[];
    switchCompany: (companyId: string) => Promise<boolean>;
    isAdmin: boolean;
    isManager: boolean;
    refreshCompanies: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

// الأدوار المتاحة - مبسط: فقط المدير
const AVAILABLE_ROLES: { id: UserRole; name: string }[] = [
    { id: 'admin', name: ROLE_NAMES.admin }
];

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // حالة التحميل الأولي
    const [isLoading, setIsLoading] = useState(true);

    // المستخدم الحالي
    const [user, setUserState] = useState<User | null>(null);

    // الشركات
    const [companies, setCompanies] = useState<CompanyData[]>([]);
    const [currentCompany, setCurrentCompany] = useState<CompanyData | null>(null);

    // الدور الحالي - دائماً admin مع جميع الصلاحيات
    const [userRole, setUserRoleState] = useState<UserRole>('admin');

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    const [language, setLanguageState] = useState<Language>('ar');

    // تحميل الشركات
    const loadCompanies = useCallback(async () => {
        try {
            const userCompanies = await companyService.getUserCompanies();
            setCompanies(userCompanies);

            const current = await companyService.getCurrentCompany();
            setCurrentCompany(current);

            // تحديث الدور من البروفايل
            const profile = await companyService.getCurrentProfile();
            if (profile) {
                setUserRoleState(profile.role);
            }
        } catch (error) {
            console.error('Error loading companies:', error);
        }
    }, []);

    // التأكد من أن المستخدم لديه شركة صالحة
    const ensureUserHasCompany = useCallback(async (currentUser: { id: string; email: string; name: string; companyId: string }): Promise<string> => {
        console.log('🏢 Checking if user has valid company...');

        // إذا كان لديه شركة صالحة (ليست default) من الكائن المحلي
        if (currentUser.companyId && currentUser.companyId !== 'default-company-id') {
            console.log('✅ User has valid company from local:', currentUser.companyId);
            return currentUser.companyId;
        }

        try {
            // التحقق من Supabase أولاً - هل لديه شركة في profiles؟
            const { data: profileData } = await supabase
                .from('profiles')
                .select('company_id')
                .eq('id', currentUser.id)
                .maybeSingle();

            const profile = profileData as any;

            if (profile?.company_id) {
                console.log('✅ Found company in profile:', profile.company_id);
                return profile.company_id;
            }

            // التحقق من user_company_roles
            const { data: ucrData } = await supabase
                .from('user_company_roles')
                .select('company_id')
                .eq('user_id', currentUser.id)
                .maybeSingle();

            const ucr = ucrData as any;

            if (ucr?.company_id) {
                console.log('✅ Found company in user_company_roles:', ucr.company_id);
                // تحديث profile بـ company_id
                await (supabase as any).from('profiles').update({ company_id: ucr.company_id }).eq('id', currentUser.id);
                return ucr.company_id;
            }

            console.log('⚠️ No company found in Supabase, creating new one...');

            // إنشاء شركة جديدة للمستخدم
            const newCompany = await companyService.createCompany({
                name: currentUser.name ? `شركة ${currentUser.name}` : 'شركتي',
                name_en: `${currentUser.name || 'My'} Company`,
                email: currentUser.email
            });

            if (newCompany) {
                console.log('✅ New company created:', newCompany.id, newCompany.name);
                return newCompany.id;
            } else {
                console.error('❌ Failed to create company');
                return 'default-company-id';
            }
        } catch (error) {
            console.error('❌ Error in ensureUserHasCompany:', error);
            return 'default-company-id';
        }
    }, []);

    // الاستماع لتغييرات حالة المصادقة
    useEffect(() => {
        const checkCurrentUser = async () => {
            console.log('🔍 Checking current user...');

            if (!isSupabaseConfigured) {
                console.warn('⚠️ Supabase not properly configured, skipping auth check');
                setIsLoading(false);
                return;
            }

            try {
                // Increase timeout to 15s to handle slow connections
                const timeoutPromise = new Promise<null>((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), 15000)
                );

                const userPromise = authService.getCurrentUser();

                const currentUser = await Promise.race([userPromise, timeoutPromise]);

                if (currentUser) {
                    console.log('✅ User found:', currentUser.email);
                    console.log('🏢 User companyId:', currentUser.companyId);

                    // التأكد من أن المستخدم لديه شركة صالحة
                    const validCompanyId = await ensureUserHasCompany({
                        id: currentUser.id,
                        email: currentUser.email || '',
                        name: currentUser.name,
                        companyId: currentUser.companyId
                    });

                    // التأكد من وجود user_company_roles (مطلوب لـ RLS)
                    await companyService.ensureUserCompanyRoleExists();

                    setUserState({
                        id: currentUser.id,
                        companyId: validCompanyId,
                        name: currentUser.name,
                        email: currentUser.email || '',
                        role: currentUser.role as any, // Removed unnecessary `as any` as currentUser.role is already UserRole
                        isActive: currentUser.isActive
                    });
                    setUserRoleState(currentUser.role);
                    setIsAuthenticated(true);

                    // تحميل الشركات
                    await loadCompanies();
                } else {
                    console.log('ℹ️ No user logged in');
                }
            } catch (error: any) {
                console.warn('⚠️ Error checking current user:', error.message);
            } finally {
                console.log('✅ Loading complete, showing app');
                setIsLoading(false);
            }
        };

        checkCurrentUser();

        // الاستماع لتغييرات المصادقة
        const { data: { subscription } } = authService.onAuthStateChange(async (authUser) => {
            if (authUser) {
                // التأكد من أن المستخدم لديه شركة صالحة
                const validCompanyId = await ensureUserHasCompany({
                    id: authUser.id,
                    email: authUser.email || '',
                    name: authUser.name,
                    companyId: authUser.companyId
                });

                setUserState({
                    id: authUser.id,
                    companyId: validCompanyId,
                    name: authUser.name,
                    email: authUser.email || '',
                    role: authUser.role as any, // Corrected from `authUser.role as any, as any,` to `authUser.role`
                    isActive: authUser.isActive
                });
                setUserRoleState(authUser.role);
                setIsAuthenticated(true);

                // تحميل الشركات عند تسجيل الدخول
                await loadCompanies();
            } else {
                setUserState(null);
                setCompanies([]);
                setCurrentCompany(null);
                setIsAuthenticated(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [loadCompanies]);

    // تحديث الدور في state
    useEffect(() => {
        if (user) {
            setUserState(prev => prev ? { ...prev, role: userRole as any } : null);
        }
    }, [userRole]);

    // تطبيق اللغة على الصفحة
    useEffect(() => {
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
        setCompanies([]);
        setCurrentCompany(null);
        setIsAuthenticated(false);
        companyService.clearCache();
    }, []);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
    }, []);

    const setUserRole = useCallback((role: UserRole) => {
        setUserRoleState(role);
    }, []);

    // التبديل بين الشركات
    const switchCompany = useCallback(async (companyId: string): Promise<boolean> => {
        const success = await companyService.switchCompany(companyId);
        if (success) {
            await loadCompanies();
            // تحديث companyId في المستخدم
            if (user) {
                setUserState(prev => prev ? { ...prev, companyId } : null);
            }
        }
        return success;
    }, [user, loadCompanies]);

    const refreshCompanies = useCallback(async () => {
        await loadCompanies();
    }, [loadCompanies]);

    const t = useCallback((key: string) => translations[language][key] || key, [language]);

    // حساب الصلاحيات
    const isAdmin = userRole === 'admin';
    const isManager = userRole === 'admin' || userRole === 'manager';

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
            availableRoles: AVAILABLE_ROLES,
            // الشركات
            currentCompany,
            companies,
            switchCompany,
            isAdmin,
            isManager,
            refreshCompanies
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
