/**
 * Sales Defaults - القيم الافتراضية للمبيعات
 */

import { SalesSettings } from '../../../types/settings-extended';

export const getDefaultSalesSettings = (): SalesSettings => ({
    allowNegativeStock: false,
    requireCustomer: false,
    defaultPaymentMethod: 'cash',
    autoGenerateInvoice: true,
    allowDiscount: true,
    maxDiscountPercent: 100,
    roundTotal: false,
    roundMethod: 'nearest',
    roundTo: 1,
    notifyOnLowStock: true,
    lowStockThreshold: 10,
    notifyOnSale: false
});
