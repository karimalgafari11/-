/**
 * Hook لإدارة منطق المصادقة
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/app/UserContext';
import { authService } from '../../../services/authService';
import { AuthMode, WELCOME_MESSAGES } from '../types';

export function useAuth() {
    const navigate = useNavigate();
    const { setUser, setUserRole } = useUser();

    // Form States
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Animation states
    const [dynamoRotation, setDynamoRotation] = useState(0);
    const [pulseIntensity, setPulseIntensity] = useState(0);
    const [currentMessage, setCurrentMessage] = useState(0);

    // Dynamo animation
    useEffect(() => {
        const interval = setInterval(() => {
            setDynamoRotation(prev => (prev + 1) % 360);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    // Pulse on input
    useEffect(() => {
        if (email || password) {
            setPulseIntensity(1);
            const timeout = setTimeout(() => setPulseIntensity(0.5), 300);
            return () => clearTimeout(timeout);
        }
        return undefined;
    }, [email, password]);

    // Welcome message rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessage(prev => (prev + 1) % WELCOME_MESSAGES.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const resetMessages = useCallback(() => {
        setError('');
        setSuccess('');
    }, []);

    const changeMode = useCallback((newMode: AuthMode) => {
        setMode(newMode);
        resetMessages();
    }, [resetMessages]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        resetMessages();
        setIsLoading(true);

        try {
            if (mode === 'login') {
                if (!email || !password) {
                    setError('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
                    setIsLoading(false);
                    return;
                }

                const { user: authUser, error: authError } = await authService.signIn({
                    email,
                    password,
                    rememberMe
                });

                if (authError) {
                    setError(authError.message);
                    setIsLoading(false);
                    return;
                }

                if (authUser) {
                    setUser({
                        id: authUser.id,
                        companyId: authUser.companyId || '',
                        name: authUser.name,
                        email: authUser.email || email,
                        role: authUser.role as any,
                        isActive: authUser.isActive
                    });
                    setUserRole(authUser.role);
                    navigate('/dashboard');
                }

            } else if (mode === 'register') {
                if (!name || !companyName || !email || !password || !confirmPassword) {
                    setError('الرجاء ملء جميع الحقول بما فيها اسم الشركة');
                    setIsLoading(false);
                    return;
                }
                if (password !== confirmPassword) {
                    setError('كلمتا المرور غير متطابقتين');
                    setIsLoading(false);
                    return;
                }
                if (password.length < 6) {
                    setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
                    setIsLoading(false);
                    return;
                }

                const { user: newUser, error: signUpError } = await authService.signUp({
                    email,
                    password,
                    name,
                    companyName
                });

                if (signUpError) {
                    setError(signUpError.message);
                    setIsLoading(false);
                    return;
                }

                if (newUser) {
                    setSuccess('تم إنشاء الحساب والشركة بنجاح! يرجى تأكيد بريدك الإلكتروني ثم تسجيل الدخول');
                    setTimeout(() => setMode('login'), 3000);
                }

            } else if (mode === 'forgot') {
                if (!email) {
                    setError('الرجاء إدخال البريد الإلكتروني');
                    setIsLoading(false);
                    return;
                }

                const { success: resetSuccess, error: resetError } = await authService.resetPassword(email);

                if (resetError) {
                    setError(resetError.message);
                } else if (resetSuccess) {
                    setSuccess('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
                }
            }
        } catch (err) {
            setError('حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى');
            console.error('Auth error:', err);
        }

        setIsLoading(false);
    }, [mode, email, password, confirmPassword, name, companyName, rememberMe, navigate, setUser, setUserRole, resetMessages]);

    return {
        // Form data
        mode, changeMode,
        email, setEmail,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        name, setName,
        companyName, setCompanyName,
        rememberMe, setRememberMe,
        showPassword, setShowPassword,
        isLoading,
        error, success,

        // Animation
        dynamoRotation,
        pulseIntensity,
        currentMessage: WELCOME_MESSAGES[currentMessage],

        // Actions
        handleSubmit,
        resetMessages
    };
}
