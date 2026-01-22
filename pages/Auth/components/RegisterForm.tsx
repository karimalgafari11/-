/**
 * نموذج إنشاء حساب جديد
 */

import React from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, RefreshCw, Building2 } from 'lucide-react';

interface RegisterFormProps {
    name: string;
    setName: (name: string) => void;
    companyName: string;
    setCompanyName: (name: string) => void;
    email: string;
    setEmail: (email: string) => void;
    password: string;
    setPassword: (password: string) => void;
    confirmPassword: string;
    setConfirmPassword: (password: string) => void;
    showPassword: boolean;
    setShowPassword: (show: boolean) => void;
    isLoading: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
    name, setName,
    companyName, setCompanyName,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPassword, setShowPassword,
    isLoading,
    onSubmit
}) => {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {/* Name */}
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

            {/* Company Name */}
            <div className="relative">
                <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                    type="text"
                    placeholder="اسم الشركة"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pr-10 sm:pr-12 pl-4 py-3 sm:py-4 bg-slate-800/50 border border-slate-700 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none"
                />
            </div>

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

            {/* Confirm Password */}
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
                        إنشاء الحساب
                        <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </>
                )}
            </button>
        </form>
    );
};

export default RegisterForm;
