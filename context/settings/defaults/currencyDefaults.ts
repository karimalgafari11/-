/**
 * Currency Defaults - القيم الافتراضية للعملات
 */

import { CurrencySettings } from '../../../types/settings-extended';
import { DEFAULT_CURRENCIES, ExchangeRateRecord } from '../../../types/common';

// أسعار الصرف الافتراضية
// 430 ريال يمني = 1 ريال سعودي
// 3.75 ريال سعودي = 1 دولار أمريكي
export const DEFAULT_EXCHANGE_RATES: ExchangeRateRecord[] = [
    {
        id: 'default_yer_sar',
        fromCurrency: 'YER',
        toCurrency: 'SAR',
        rate: 430, // 430 ريال يمني = 1 ريال سعودي
        date: new Date().toISOString().split('T')[0],
        note: 'سعر افتراضي',
        createdBy: 'system',
        createdAt: new Date().toISOString()
    },
    {
        id: 'default_sar_usd',
        fromCurrency: 'SAR',
        toCurrency: 'USD',
        rate: 0.2667, // 1 ريال سعودي = 0.2667 دولار (3.75 SAR = 1 USD)
        date: new Date().toISOString().split('T')[0],
        note: 'سعر افتراضي',
        createdBy: 'system',
        createdAt: new Date().toISOString()
    },
    {
        id: 'default_omr_sar',
        fromCurrency: 'OMR',
        toCurrency: 'SAR',
        rate: 0.1033, // 1 ريال عماني = 9.68 ريال سعودي
        date: new Date().toISOString().split('T')[0],
        note: 'سعر افتراضي',
        createdBy: 'system',
        createdAt: new Date().toISOString()
    }
];

export const getDefaultCurrencySettings = (): CurrencySettings => ({
    currencies: DEFAULT_CURRENCIES,
    defaultCurrency: 'SAR',
    exchangeRates: DEFAULT_EXCHANGE_RATES,
    lastUpdate: new Date().toISOString()
});
