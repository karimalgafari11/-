/**
 * أنواع صفحة تسجيل الدخول
 */

export type AuthMode = 'login' | 'register' | 'forgot';

export interface LoginFormData {
    email: string;
    password: string;
    rememberMe: boolean;
}

export interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface ForgotPasswordFormData {
    email: string;
}

export const WELCOME_MESSAGES = [
    'مرحباً بك في نظام الزهراء المالي 🚀',
    'ادخل إلى عالم المحاسبة المتقدمة ⚡',
    'محرك أعمالك المالية يبدأ من هنا 🔧'
];
