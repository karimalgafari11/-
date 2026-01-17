/**
 * Inventory Settings Component
 * إعدادات المخزون
 */

import React from 'react';
import { useSettings } from '../../../context/SettingsContext';
import { useApp } from '../../../context/AppContext';
import SettingsCard from '../SettingsCard';
import SettingsToggle from '../SettingsToggle';
import SettingsSelect from '../SettingsSelect';
import SettingsInput from '../SettingsInput';
import { Warehouse, RotateCcw } from 'lucide-react';

const InventorySettings: React.FC = () => {
    const { settings, updateSettings, resetSettings } = useSettings();
    const { showNotification } = useApp();
    const { inventory } = settings;

    const handleReset = () => {
        if (confirm('هل تريد استعادة الإعدادات الافتراضية للمخزون؟')) {
            resetSettings('inventory');
            showNotification('تم استعادة الإعدادات الافتراضية', 'info');
        }
    };

    return (
        <SettingsCard
            title="إعدادات المخزون"
            icon={Warehouse}
            iconColor="text-amber-500"
            actions={
                <button onClick={handleReset} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                    <RotateCcw size={16} />
                </button>
            }
        >
            <div className="space-y-4">
                <SettingsToggle
                    label="تتبع بالمستودعات"
                    description="إدارة مخزون منفصل لكل مستودع"
                    checked={inventory.trackByWarehouse}
                    onChange={(checked) => updateSettings('inventory', { trackByWarehouse: checked })}
                />

                <SettingsToggle
                    label="تتبع الدفعات"
                    description="تتبع رقم الدفعة للمنتجات"
                    checked={inventory.trackBatches}
                    onChange={(checked) => updateSettings('inventory', { trackBatches: checked })}
                />

                <SettingsToggle
                    label="تتبع تاريخ الصلاحية"
                    checked={inventory.trackExpiry}
                    onChange={(checked) => updateSettings('inventory', { trackExpiry: checked })}
                />

                <SettingsToggle
                    label="تتبع الأرقام التسلسلية"
                    checked={inventory.trackSerialNumbers}
                    onChange={(checked) => updateSettings('inventory', { trackSerialNumbers: checked })}
                />

                <SettingsSelect
                    label="طريقة التقييم"
                    value={inventory.valuationMethod}
                    onChange={(val) => updateSettings('inventory', { valuationMethod: val as any })}
                    options={[
                        { value: 'average', label: 'المتوسط المرجح' },
                        { value: 'fifo', label: 'FIFO (الأقدم أولاً)' },
                        { value: 'lifo', label: 'LIFO (الأحدث أولاً)' }
                    ]}
                />

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3">إعادة الطلب</p>

                    <SettingsInput
                        label="حد إعادة الطلب الافتراضي"
                        value={inventory.reorderLevel}
                        onChange={(val) => updateSettings('inventory', { reorderLevel: parseInt(val) || 10 })}
                        type="number"
                        min={0}
                    />

                    <div className="mt-3">
                        <SettingsToggle
                            label="إعادة طلب تلقائية"
                            checked={inventory.autoReorder}
                            onChange={(checked) => updateSettings('inventory', { autoReorder: checked })}
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3">التحويلات والتسويات</p>

                    <SettingsToggle
                        label="موافقة على التحويلات"
                        checked={inventory.requireTransferApproval}
                        onChange={(checked) => updateSettings('inventory', { requireTransferApproval: checked })}
                    />

                    <div className="mt-3">
                        <SettingsToggle
                            label="موافقة على التسويات"
                            checked={inventory.adjustmentRequiresApproval}
                            onChange={(checked) => updateSettings('inventory', { adjustmentRequiresApproval: checked })}
                        />
                    </div>
                </div>
            </div>
        </SettingsCard>
    );
};

export default InventorySettings;
