/**
 * نموذج تسجيل الدخول
 */

import React from 'react';
import { Mail, Lock, Eye, EyeOff, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { AuthMode } from '../types';

interface LoginFormProps {
    email: string;
    setEmail: (email: string) => void;
    password: string;
    setPassword: (password: string) => void;
    rememberMe: boolean;
    setRememberMe: (remember: boolean) => void;
    showPassword: boolean;
    setShowPassword: (show: boolean) => void;
    isLoading: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
    email, setEmail,
    password, setPassword,
    rememberMe, setRememberMe,
    showPassword, setShowPassword,
    isLoading,
    onSubmit,
    onForgotPassword
}) => {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
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

            {/* Password */}
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

            {/* Remember Me & Forgot Password */}
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
                    onClick={onForgotPassword}
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                    نسيت كلمة المرور؟
                </button>
            </div>

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
                        دخول
                        <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </>
                )}
            </button>
        </form>
    );
};

export default LoginForm;
