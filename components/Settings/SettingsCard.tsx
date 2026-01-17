/**
 * Settings Card Component
 * مكون بطاقة الإعدادات القابل لإعادة الاستخدام
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SettingsCardProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    iconColor?: string;
    children: React.ReactNode;
    className?: string;
    actions?: React.ReactNode;
}

const SettingsCard: React.FC<SettingsCardProps> = ({
    title,
    description,
    icon: Icon,
    iconColor = 'text-gray-400',
    children,
    className = '',
    actions
}) => {
    return (
        <div className={`bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className={`p-2 rounded-xl bg-gray-50 dark:bg-gray-800 ${iconColor}`}>
                            <Icon size={18} />
                        </div>
                    )}
                    <div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-gray-100">
                            {title}
                        </h3>
                        {description && (
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
                {actions && (
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
};

export default SettingsCard;
