
export type Language = 'ar' | 'en';
export type CurrencyCode = 'SAR' | 'YER' | 'USD' | 'EUR' | 'OMR' | 'AED' | 'KWD' | 'BHD' | 'QAR' | 'EGP' | string;
export type PaymentMethod = 'cash' | 'credit' | 'bank' | 'check' | 'transfer';
export type Status = 'active' | 'inactive';

// العملات الديناميكية
export interface Currency {
    code: string;           // رمز العملة (SAR, YER, USD, EUR, etc.)
    nameAr: string;         // الاسم بالعربية
    nameEn: string;         // الاسم بالإنجليزية
    symbol: string;         // الرمز ($, ﷼, €)
    decimalPlaces: number;  // عدد الخانات العشرية
    isActive: boolean;      // مفعلة أم لا
    isDefault: boolean;     // العملة الافتراضية
    position: 'before' | 'after'; // موضع الرمز
    createdAt: string;
}

// سجل أسعار الصرف التاريخي
export interface ExchangeRateRecord {
    id: string;
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    date: string;
    note?: string;
    createdBy: string;
    createdAt: string;
}

// العملات الافتراضية - SAR هي العملة الأساسية للمحاسبة
export const DEFAULT_CURRENCIES: Currency[] = [
    { code: 'SAR', nameAr: 'ريال سعودي', nameEn: 'Saudi Riyal', symbol: 'ر.س', decimalPlaces: 2, isActive: true, isDefault: true, position: 'after', createdAt: new Date().toISOString() },
    { code: 'YER', nameAr: 'ريال يمني', nameEn: 'Yemeni Rial', symbol: '﷼', decimalPlaces: 0, isActive: true, isDefault: false, position: 'after', createdAt: new Date().toISOString() },
    { code: 'OMR', nameAr: 'ريال عماني', nameEn: 'Omani Rial', symbol: 'ر.ع', decimalPlaces: 3, isActive: true, isDefault: false, position: 'after', createdAt: new Date().toISOString() },
    { code: 'USD', nameAr: 'دولار أمريكي', nameEn: 'US Dollar', symbol: '$', decimalPlaces: 2, isActive: true, isDefault: false, position: 'before', createdAt: new Date().toISOString() },
];

export interface User {
    id: string;
    companyId: string;
    name: string;
    role: 'manager' | 'accountant' | 'employee';  // توحيد مع Supabase
    avatar?: string;
    email?: string;
    phone?: string;
    isActive: boolean;
    lastLogin?: string;
    permissions?: string[];
}

