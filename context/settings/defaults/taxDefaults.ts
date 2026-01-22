/**
 * Tax Defaults - القيم الافتراضية للضرائب
 */

import { TaxSettings } from '../../../types/settings-extended';

export const getDefaultTaxSettings = (): TaxSettings => ({
    enabled: true,
    defaultRate: 0,
    includedInPrice: false,
    taxName: 'ضريبة القيمة المضافة',
    taxNameEn: 'VAT',
    customRates: [],
    showOnInvoice: true
});
