/**
 * نموذج استعادة كلمة المرور
 */

import React from 'react';
import { Mail, ArrowRight, RefreshCw } from 'lucide-react';

interface ForgotPasswordFormProps {
    email: string;
    setEmail: (email: string) => void;
    isLoading: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
    email, setEmail,
    isLoading,
    onSubmit
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
                        إرسال الرابط
                        <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </>
                )}
            </button>
        </form>
    );
};

export default ForgotPasswordForm;
