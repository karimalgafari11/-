/**
 * Products Settings Component
 * إعدادات المنتجات
 */

import React from 'react';
import { useSettings } from '../../../context/SettingsContext';
import { useApp } from '../../../context/AppContext';
import SettingsCard from '../SettingsCard';
import SettingsToggle from '../SettingsToggle';
import SettingsSelect from '../SettingsSelect';
import SettingsInput from '../SettingsInput';
import { Tag, RotateCcw } from 'lucide-react';

const ProductsSettings: React.FC = () => {
    const { settings, updateSettings, resetSettings } = useSettings();
    const { showNotification } = useApp();
    const { product } = settings;

    const handleReset = () => {
        if (confirm('هل تريد استعادة الإعدادات الافتراضية للمنتجات؟')) {
            resetSettings('product');
            showNotification('تم استعادة الإعدادات الافتراضية', 'info');
        }
    };

    return (
        <SettingsCard
            title="إعدادات المنتجات"
            icon={Tag}
            iconColor="text-purple-500"
            actions={
                <button onClick={handleReset} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                    <RotateCcw size={16} />
                </button>
            }
        >
            <div className="space-y-4">
                <SettingsToggle
                    label="رمز المنتج SKU إلزامي"
                    checked={product.requireSKU}
                    onChange={(checked) => updateSettings('product', { requireSKU: checked })}
                />

                <SettingsToggle
                    label="توليد SKU تلقائي"
                    checked={product.autoGenerateSKU}
                    onChange={(checked) => updateSettings('product', { autoGenerateSKU: checked })}
                />

                {product.autoGenerateSKU && (
                    <div className="grid grid-cols-2 gap-4">
                        <SettingsInput
                            label="بادئة SKU"
                            value={product.skuPrefix}
                            onChange={(val) => updateSettings('product', { skuPrefix: val })}
                            dir="ltr"
                        />
                        <SettingsInput
                            label="طول الرمز"
                            value={product.skuLength}
                            onChange={(val) => updateSettings('product', { skuLength: parseInt(val) || 6 })}
                            type="number"
                            min={4}
                            max={12}
                        />
                    </div>
                )}

                <SettingsToggle
                    label="التصنيف إلزامي"
                    checked={product.requireCategory}
                    onChange={(checked) => updateSettings('product', { requireCategory: checked })}
                />

                <SettingsToggle
                    label="السماح بالمتغيرات"
                    description="ألوان، أحجام، إلخ"
                    checked={product.allowVariants}
                    onChange={(checked) => updateSettings('product', { allowVariants: checked })}
                />

                <SettingsInput
                    label="الوحدة الافتراضية"
                    value={product.defaultUnit}
                    onChange={(val) => updateSettings('product', { defaultUnit: val })}
                />

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3">الباركود</p>

                    <SettingsToggle
                        label="توليد باركود تلقائي"
                        checked={product.autoGenerateBarcode}
                        onChange={(checked) => updateSettings('product', { autoGenerateBarcode: checked })}
                    />

                    {product.autoGenerateBarcode && (
                        <div className="mt-3">
                            <SettingsSelect
                                label="نوع الباركود"
                                value={product.barcodeType}
                                onChange={(val) => updateSettings('product', { barcodeType: val as any })}
                                options={[
                                    { value: 'EAN13', label: 'EAN-13' },
                                    { value: 'EAN8', label: 'EAN-8' },
                                    { value: 'CODE128', label: 'CODE-128' },
                                    { value: 'QR', label: 'QR Code' }
                                ]}
                            />
                        </div>
                    )}
                </div>
            </div>
        </SettingsCard>
    );
};

export default ProductsSettings;
