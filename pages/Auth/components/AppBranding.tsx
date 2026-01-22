/**
 * شعار التطبيق ورسائل الترحيب
 */

import React from 'react';
import { Settings } from 'lucide-react';

interface AppBrandingProps {
    currentMessage: string;
}

const AppBranding: React.FC<AppBrandingProps> = ({ currentMessage }) => {
    return (
        <>
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
                    style={{ animation: 'fadeInUp 0.5s ease-out' }}
                >
                    {currentMessage}
                </p>
            </div>
        </>
    );
};

export default AppBranding;
