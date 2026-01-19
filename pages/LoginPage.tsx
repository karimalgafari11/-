/**
 * Login Page - صفحة تسجيل الدخول
 * تصميم مستوحى من قطع غيار السيارات (الدينمو) بأسلوب خيال علمي
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/app/UserContext';
import { authService } from '../services/authService';
import {
    Mail, Lock, User, Eye, EyeOff, ArrowRight,
    Zap, Settings, Shield, Sparkles, RefreshCw,
    CheckCircle, AlertCircle
} from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { setUser, setUserRole } = useUser();

    // States
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Animation states
    const [dynamoRotation, setDynamoRotation] = useState(0);
    const [pulseIntensity, setPulseIntensity] = useState(0);

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

    // Welcome messages
    const welcomeMessages = [
        'مرحباً بك في نظام الزهراء المالي 🚀',
        'ادخل إلى عالم المحاسبة المتقدمة ⚡',
        'محرك أعمالك المالية يبدأ من هنا 🔧'
    ];
    const [currentMessage, setCurrentMessage] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessage(prev => (prev + 1) % welcomeMessages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            if (mode === 'login') {
                // تسجيل الدخول باستخدام Supabase
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
                        role: authUser.role,
                        isActive: authUser.isActive
                    });
                    setUserRole(authUser.role);
                    navigate('/dashboard');
                }

            } else if (mode === 'register') {
                // التحقق من صحة البيانات
                if (!name || !email || !password || !confirmPassword) {
                    setError('الرجاء ملء جميع الحقول');
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

                // إنشاء حساب جديد باستخدام Supabase
                const { user: newUser, error: signUpError } = await authService.signUp({
                    email,
                    password,
                    name,
                    companyName: 'شركة الزهراء' // اسم افتراضي
                });

                if (signUpError) {
                    setError(signUpError.message);
                    setIsLoading(false);
                    return;
                }

                if (newUser) {
                    setSuccess('تم إنشاء الحساب بنجاح! يرجى تأكيد بريدك الإلكتروني ثم تسجيل الدخول');
                    setTimeout(() => setMode('login'), 3000);
                }

            } else if (mode === 'forgot') {
                if (!email) {
                    setError('الرجاء إدخال البريد الإلكتروني');
                    setIsLoading(false);
                    return;
                }

                // إرسال رابط إعادة تعيين كلمة المرور
                const { success, error: resetError } = await authService.resetPassword(email);

                if (resetError) {
                    setError(resetError.message);
                } else if (success) {
                    setSuccess('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
                }
            }
        } catch (err) {
            setError('حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى');
            console.error('Auth error:', err);
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">

            {/* Animated Background Grid */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzYjgyZjYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-cyan-500 rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            opacity: 0.3 + Math.random() * 0.5
                        }}
                    />
                ))}
            </div>

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-5xl flex flex-col-reverse lg:flex-row items-center gap-4 sm:gap-8 lg:gap-16">

                {/* Left Side - Dynamo Illustration */}
                <div className="flex-1 flex flex-col items-center justify-center">

                    {/* Dynamo/Alternator SVG */}
                    <div className="relative w-32 h-32 sm:w-48 sm:h-48 lg:w-80 lg:h-80">
                        {/* Outer Ring - Stator */}
                        <div
                            className="absolute inset-0 rounded-full border-8 border-slate-700"
                            style={{
                                boxShadow: `
                                    0 0 40px rgba(6, 182, 212, ${0.3 * pulseIntensity}),
                                    inset 0 0 30px rgba(6, 182, 212, 0.1)
                                `
                            }}
                        />

                        {/* Copper Windings */}
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-6 sm:w-3 sm:h-8 lg:w-4 lg:h-12 bg-gradient-to-b from-amber-600 via-amber-500 to-amber-600 rounded"
                                style={{
                                    left: '50%',
                                    top: '50%',
                                    transformOrigin: '50% 50%',
                                    transform: `translate(-50%, -100%) rotate(${i * 30}deg) translateY(-40px)`
                                }}
                            />
                        ))}

                        {/* Inner Rotor - Rotating */}
                        <div
                            className="absolute inset-12 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-slate-600"
                            style={{
                                transform: `rotate(${dynamoRotation}deg)`,
                                boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)'
                            }}
                        >
                            {/* Rotor Poles */}
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-8 h-2 bg-cyan-500/50 rounded-full"
                                    style={{
                                        left: '50%',
                                        top: '50%',
                                        transformOrigin: '50% 50%',
                                        transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateX(30px)`
                                    }}
                                />
                            ))}
                        </div>

                        {/* Center Core */}
                        <div className="absolute inset-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                            <Zap className="text-white animate-pulse w-5 h-5 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
                        </div>

                        {/* Energy Lines */}
                        <div
                            className="absolute inset-0 rounded-full"
                            style={{
                                background: `conic-gradient(from ${dynamoRotation}deg, transparent, rgba(6, 182, 212, 0.3), transparent, rgba(6, 182, 212, 0.3), transparent)`,
                                opacity: pulseIntensity * 0.5 + 0.3
                            }}
                        />
                    </div>

                    {/* App Title */}
                    <div className="mt-4 sm:mt-6 lg:mt-8 text-center">
                        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                            <Settings className="text-cyan-400 animate-spin w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7" style={{ animationDuration: '8s' }} />
                            <h1 className="text-xl sm:text-2xl lg:text-4xl font-black text-white tracking-tight">
                                نظام <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">الزهراء</span>
                            </h1>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-400 font-bold">
                            ALZHRA FINANCE SYSTEM
                        </p>
                    </div>

                    {/* Welcome Message - Animated - Hidden on mobile for space */}
                    <div className="hidden sm:block mt-4 lg:mt-6 h-8">
                        <p
                            className="text-cyan-400 font-bold text-xs sm:text-sm text-center transition-all duration-500"
                            key={currentMessage}
                            style={{ animation: 'fadeInUp 0.5s ease-out' }}
                        >
                            {welcomeMessages[currentMessage]}
                        </p>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="flex-1 w-full max-w-md">
                    <div className="relative p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-cyan-500/10">

                        {/* Form Glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-50" />

                        <div className="relative z-10">
                            {/* Form Header */}
                            <div className="text-center mb-4 sm:mb-6 lg:mb-8">
                                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-3 sm:mb-4 shadow-lg shadow-cyan-500/30">
                                    {mode === 'login' && <Shield className="text-white w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />}
                                    {mode === 'register' && <User className="text-white w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />}
                                    {mode === 'forgot' && <RefreshCw className="text-white w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />}
                                </div>
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-white mb-1">
                                    {mode === 'login' && 'تسجيل الدخول'}
                                    {mode === 'register' && 'حساب جديد'}
                                    {mode === 'forgot' && 'استعادة كلمة المرور'}
                                </h2>
                                <p className="text-sm text-slate-400">
                                    {mode === 'login' && 'أدخل بياناتك للوصول للنظام'}
                                    {mode === 'register' && 'أنشئ حسابك الآن مجاناً'}
                                    {mode === 'forgot' && 'سنرسل لك رابط إعادة التعيين'}
                                </p>
                            </div>

                            {/* Error/Success Messages */}
                            {error && (
                                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-sm">
                                    <AlertCircle size={18} />
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-400 text-sm">
                                    <CheckCircle size={18} />
                                    {success}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">

                                {/* Name - Register only */}
                                {mode === 'register' && (
                                    <div className="relative">
                                        <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input
                                            type="text"
                                            placeholder="الاسم الكامل"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pr-10 sm:pr-12 pl-4 py-3 sm:py-4 bg-slate-800/50 border border-slate-700 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none"
                                        />
                                    </div>
                                )}

                                {/* Email */}
                                <div className="relative">
                                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="email"
                                        placeholder="البريد الإلكتروني"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pr-10 sm:pr-12 pl-4 py-3 sm:py-4 bg-slate-800/50 border border-slate-700 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none"
                                    />
                                </div>

                                {/* Password - Not for forgot */}
                                {mode !== 'forgot' && (
                                    <div className="relative">
                                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="كلمة المرور"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pr-10 sm:pr-12 pl-10 sm:pl-12 py-3 sm:py-4 bg-slate-800/50 border border-slate-700 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                )}

                                {/* Confirm Password - Register only */}
                                {mode === 'register' && (
                                    <div className="relative">
                                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="تأكيد كلمة المرور"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pr-10 sm:pr-12 pl-4 py-3 sm:py-4 bg-slate-800/50 border border-slate-700 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none"
                                        />
                                    </div>
                                )}

                                {/* Remember Me & Forgot Password - Login only */}
                                {mode === 'login' && (
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${rememberMe ? 'bg-cyan-500 border-cyan-500' : 'border-slate-600 group-hover:border-cyan-500/50'}`}>
                                                {rememberMe && <CheckCircle size={14} className="text-white" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                className="hidden"
                                            />
                                            <span className="text-sm text-slate-400 group-hover:text-slate-300">تذكرني</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                                            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            نسيت كلمة المرور؟
                                        </button>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 sm:py-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {isLoading ? (
                                        <>
                                            <RefreshCw className="animate-spin" size={20} />
                                            جاري المعالجة...
                                        </>
                                    ) : (
                                        <>
                                            {mode === 'login' && 'دخول'}
                                            {mode === 'register' && 'إنشاء الحساب'}
                                            {mode === 'forgot' && 'إرسال الرابط'}
                                            <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Mode Switcher */}
                            <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
                                {mode === 'login' && (
                                    <p className="text-slate-400 text-sm">
                                        ليس لديك حساب؟{' '}
                                        <button
                                            onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                                            className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
                                        >
                                            سجل الآن
                                        </button>
                                    </p>
                                )}
                                {(mode === 'register' || mode === 'forgot') && (
                                    <p className="text-slate-400 text-sm">
                                        لديك حساب بالفعل؟{' '}
                                        <button
                                            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                                            className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
                                        >
                                            تسجيل الدخول
                                        </button>
                                    </p>
                                )}
                            </div>

                            {/* Features */}
                            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                    <Shield size={14} className="text-cyan-500" />
                                    <span>آمن 100%</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Sparkles size={14} className="text-amber-500" />
                                    <span>مجاني</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Zap size={14} className="text-emerald-500" />
                                    <span>سريع</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS Animation */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
