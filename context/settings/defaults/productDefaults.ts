/**
 * Product Defaults - القيم الافتراضية للمنتجات
 */

import { ProductSettings } from '../../../types/settings-extended';

export const getDefaultProductSettings = (): ProductSettings => ({
    requireSKU: false,
    autoGenerateSKU: true,
    skuPrefix: 'SKU-',
    skuFormat: 'numeric',
    skuLength: 6,
    requireCategory: false,
    allowVariants: false,
    trackCost: true,
    defaultUnit: 'قطعة',
    units: ['قطعة', 'كرتون', 'كيلو', 'لتر', 'متر', 'علبة', 'حزمة'],
    requireImage: false,
    maxImages: 5,
    autoGenerateBarcode: false,
    barcodeType: 'EAN13'
});
