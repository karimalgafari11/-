/**
 * Invoice Defaults - القيم الافتراضية للفواتير
 */

import { InvoiceSettings } from '../../../types/settings-extended';

export const getDefaultInvoiceSettings = (): InvoiceSettings => ({
    salesPrefix: 'INV-',
    salesNextNumber: 1,
    purchasePrefix: 'PO-',
    purchaseNextNumber: 1,
    returnPrefix: 'RET-',
    returnNextNumber: 1,
    quotePrefix: 'QT-',
    quoteNextNumber: 1,
    showLogo: true,
    logoSize: 'medium',
    showQRCode: true,
    showBarcode: false,
    showNotes: true,
    showPaymentTerms: true,
    showSignature: false,
    defaultDueDays: 30,
    template: 'modern',
    showBankDetails: false
});
