/**
 * Display Preferences
 * تفضيلات العرض
 */

import React from 'react';
import { Layout } from 'lucide-react';
import SettingsCard from '../../SettingsCard';
import SettingsToggle from '../../SettingsToggle';
import SettingsSelect from '../../SettingsSelect';
import { ThemeSettings } from '../../../../types/settings-extended';

interface DisplayPreferencesProps {
    display: ThemeSettings['display'];
    components: ThemeSettings['components'];
    onDisplayChange: (display: Partial<ThemeSettings['display']>) => void;
    onComponentsChange: (components: Partial<ThemeSettings['components']>) => void;
}

const DisplayPreferences: React.FC<DisplayPreferencesProps> = ({
    display,
    components,
    onDisplayChange,
    onComponentsChange
}) => {
    return (
        <SettingsCard
            title="تفضيلات العرض"
            description="التحكم في ظهور عناصر الواجهة"
            icon={Layout}
            iconColor="text-cyan-500"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SettingsToggle
                    label="إحصائيات الملخص"
                    checked={display.showDashboardStats}
                    onChange={(checked) => onDisplayChange({ showDashboardStats: checked })}
                />
                <SettingsToggle
                    label="الرسوم البيانية"
                    checked={display.showDashboardCharts}
                    onChange={(checked) => onDisplayChange({ showDashboardCharts: checked })}
                />
                <SettingsToggle
                    label="العمليات الأخيرة"
                    checked={display.showRecentTransactions}
                    onChange={(checked) => onDisplayChange({ showRecentTransactions: checked })}
                />
                <SettingsToggle
                    label="تحليل المصروفات"
                    checked={display.showExpenseAnalysis}
                    onChange={(checked) => onDisplayChange({ showExpenseAnalysis: checked })}
                />
                <SettingsToggle
                    label="أيقونات القائمة"
                    checked={components.showSidebarIcons}
                    onChange={(checked) => onComponentsChange({ showSidebarIcons: checked })}
                />
                <SettingsToggle
                    label="الوضع المضغوط"
                    checked={display.compactMode}
                    onChange={(checked) => onDisplayChange({ compactMode: checked })}
                />
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <SettingsSelect
                    label="كثافة الجداول"
                    value={components.gridDensity}
                    onChange={(val) => onComponentsChange({ gridDensity: val as any })}
                    options={[
                        { value: 'compact', label: 'مضغوط' },
                        { value: 'comfortable', label: 'متوازن' },
                        { value: 'spacious', label: 'واسع' }
                    ]}
                />
            </div>
        </SettingsCard>
    );
};

export default DisplayPreferences;
