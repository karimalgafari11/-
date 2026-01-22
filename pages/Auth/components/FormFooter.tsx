/**
 * تذييل نموذج المصادقة
 */

import React from 'react';
import { Shield, Sparkles, Zap } from 'lucide-react';
import { AuthMode } from '../types';

interface FormFooterProps {
    mode: AuthMode;
    onModeChange: (mode: AuthMode) => void;
}

const FormFooter: React.FC<FormFooterProps> = ({ mode, onModeChange }) => {
    return (
        <>
            {/* Mode Switcher */}
            <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
                {mode === 'login' && (
                    <p className="text-slate-400 text-sm">
                        ليس لديك حساب؟{' '}
                        <button
                            onClick={() => onModeChange('register')}
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
                            onClick={() => onModeChange('login')}
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
        </>
    );
};

export default FormFooter;
