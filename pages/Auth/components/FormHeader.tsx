/**
 * رأس نموذج المصادقة
 */

import React from 'react';
import { Shield, User, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { AuthMode } from '../types';

interface FormHeaderProps {
    mode: AuthMode;
    error: string;
    success: string;
}

const FormHeader: React.FC<FormHeaderProps> = ({ mode, error, success }) => {
    return (
        <>
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
        </>
    );
};

export default FormHeader;
