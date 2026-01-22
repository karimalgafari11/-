/**
 * Purchase Defaults - القيم الافتراضية للمشتريات
 */

import { PurchaseSettings } from '../../../types/settings-extended';

export const getDefaultPurchaseSettings = (): PurchaseSettings => ({
    requireSupplier: true,
    requirePurchaseOrder: false,
    autoUpdateCost: true,
    costUpdateMethod: 'average',
    defaultPaymentTerms: 30,
    notifyOnArrival: false,
    autoReceive: false
});
