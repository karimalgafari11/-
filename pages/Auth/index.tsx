/**
 * Login Page - صفحة تسجيل الدخول
 * تصميم مستوحى من قطع غيار السيارات (الدينمو) بأسلوب خيال علمي
 * 
 * تم إعادة هيكلة الملف إلى مكونات منفصلة:
 * - components/AuthBackground.tsx - الخلفية المتحركة
 * - components/DynamoLogo.tsx - رسم الدينمو
 * - components/AppBranding.tsx - شعار التطبيق
 * - components/LoginForm.tsx - نموذج تسجيل الدخول
 * - components/RegisterForm.tsx - نموذج التسجيل
 * - components/ForgotPasswordForm.tsx - نموذج استعادة كلمة المرور
 * - components/FormHeader.tsx - رأس النموذج
 * - components/FormFooter.tsx - تذييل النموذج
 * - hooks/useAuth.ts - منطق المصادقة
 */

import React from 'react';
import { useAuth } from './hooks';
import {
    AuthBackground,
    DynamoLogo,
    AppBranding,
    LoginForm,
    RegisterForm,
    ForgotPasswordForm,
    FormHeader,
    FormFooter
} from './components';

const LoginPage: React.FC = () => {
    const {
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
        dynamoRotation,
        pulseIntensity,
        currentMessage,
        handleSubmit
    } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">

            <AuthBackground />

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-5xl flex flex-col-reverse lg:flex-row items-center gap-4 sm:gap-8 lg:gap-16">

                {/* Left Side - Dynamo Illustration */}
                <div className="flex-1 flex flex-col items-center justify-center">
                    <DynamoLogo rotation={dynamoRotation} pulseIntensity={pulseIntensity} />
                    <AppBranding currentMessage={currentMessage} />
                </div>

                {/* Right Side - Login Form */}
                <div className="flex-1 w-full max-w-md">
                    <div className="relative p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-cyan-500/10">

                        {/* Form Glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-50" />

                        <div className="relative z-10">
                            <FormHeader mode={mode} error={error} success={success} />

                            {/* Forms */}
                            {mode === 'login' && (
                                <LoginForm
                                    email={email} setEmail={setEmail}
                                    password={password} setPassword={setPassword}
                                    rememberMe={rememberMe} setRememberMe={setRememberMe}
                                    showPassword={showPassword} setShowPassword={setShowPassword}
                                    isLoading={isLoading}
                                    onSubmit={handleSubmit}
                                    onForgotPassword={() => changeMode('forgot')}
                                />
                            )}

                            {mode === 'register' && (
                                <RegisterForm
                                    name={name} setName={setName}
                                    companyName={companyName} setCompanyName={setCompanyName}
                                    email={email} setEmail={setEmail}
                                    password={password} setPassword={setPassword}
                                    confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
                                    showPassword={showPassword} setShowPassword={setShowPassword}
                                    isLoading={isLoading}
                                    onSubmit={handleSubmit}
                                />
                            )}

                            {mode === 'forgot' && (
                                <ForgotPasswordForm
                                    email={email} setEmail={setEmail}
                                    isLoading={isLoading}
                                    onSubmit={handleSubmit}
                                />
                            )}

                            <FormFooter mode={mode} onModeChange={changeMode} />
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
