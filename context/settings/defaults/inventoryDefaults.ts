/**
 * Inventory Defaults - القيم الافتراضية للمخزون
 */

import { InventorySettings } from '../../../types/settings-extended';

export const getDefaultInventorySettings = (): InventorySettings => ({
    trackByWarehouse: true,
    trackBatches: false,
    trackExpiry: false,
    trackSerialNumbers: false,
    reorderLevel: 10,
    autoReorder: false,
    valuationMethod: 'average',
    allowNegativeStock: false,
    requireCountApproval: false,
    allowAdjustments: true,
    adjustmentRequiresApproval: false,
    requireTransferApproval: false,
    autoReceiveTransfers: true
});
