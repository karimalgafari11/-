/**
 * Company Defaults - القيم الافتراضية للشركة
 */

import { CompanyInfo } from '../../../types/settings-extended';

export const getDefaultCompany = (): CompanyInfo => ({
    id: '',
    name: '',
    nameEn: '',
    address: '',
    phone: '',
    baseCurrency: 'SAR',
    fiscalYearStart: '01-01',
    createdAt: new Date().toISOString()
});
