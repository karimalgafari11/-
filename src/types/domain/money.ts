/**
 * Domain Types: Money & Branded IDs
 * مكتبة أنواع المال والمعرفات الآمنة
 */

// ============================================
// Branded ID Types (للتحقق من الأنواع وقت الترجمة)
// ============================================

/** معرف حساب مميز */
export type AccountId = string & { readonly __brand: 'AccountId' };

/** معرف عملية بيع مميز */
export type SaleId = string & { readonly __brand: 'SaleId' };

/** معرف عملية شراء مميز */
export type PurchaseId = string & { readonly __brand: 'PurchaseId' };

/** معرف قيد يومية مميز */
export type JournalEntryId = string & { readonly __brand: 'JournalEntryId' };

/** معرف سند مميز */
export type VoucherId = string & { readonly __brand: 'VoucherId' };

/** معرف منتج مميز */
export type ProductId = string & { readonly __brand: 'ProductId' };

/** معرف عميل مميز */
export type CustomerId = string & { readonly __brand: 'CustomerId' };

/** معرف مورد مميز */
export type SupplierId = string & { readonly __brand: 'SupplierId' };

// Helper functions to create branded IDs
export const toAccountId = (id: string): AccountId => id as AccountId;
export const toSaleId = (id: string): SaleId => id as SaleId;
export const toPurchaseId = (id: string): PurchaseId => id as PurchaseId;
export const toJournalEntryId = (id: string): JournalEntryId => id as JournalEntryId;
export const toVoucherId = (id: string): VoucherId => id as VoucherId;
export const toProductId = (id: string): ProductId => id as ProductId;
export const toCustomerId = (id: string): CustomerId => id as CustomerId;
export const toSupplierId = (id: string): SupplierId => id as SupplierId;

// ============================================
// Currency Types
// ============================================

export type CurrencyCode = 'SAR' | 'USD' | 'EUR' | 'GBP' | 'AED';

export interface Money {
    readonly amount: number;
    readonly currency: CurrencyCode;
}

// ============================================
// Money Factory Functions
// ============================================

export const createMoney = (amount: number, currency: CurrencyCode = 'SAR'): Money =>
    Object.freeze({ amount, currency });

export const zeroMoney = (currency: CurrencyCode = 'SAR'): Money =>
    Object.freeze({ amount: 0, currency });

// ============================================
// Money Arithmetic (Pure Functions)
// ============================================

/**
 * جمع مبلغين (يجب أن يكونا بنفس العملة)
 * @throws Error if currencies don't match
 */
export const addMoney = (a: Money, b: Money): Money => {
    if (a.currency !== b.currency) {
        throw new Error(`Currency mismatch: cannot add ${a.currency} and ${b.currency}`);
    }
    return createMoney(a.amount + b.amount, a.currency);
};

/**
 * طرح مبلغين (يجب أن يكونا بنفس العملة)
 * @throws Error if currencies don't match
 */
export const subtractMoney = (a: Money, b: Money): Money => {
    if (a.currency !== b.currency) {
        throw new Error(`Currency mismatch: cannot subtract ${a.currency} from ${b.currency}`);
    }
    return createMoney(a.amount - b.amount, a.currency);
};

/**
 * ضرب مبلغ بعدد
 */
export const multiplyMoney = (money: Money, multiplier: number): Money =>
    createMoney(money.amount * multiplier, money.currency);

/**
 * تحويل مبلغ إلى عملة أخرى
 */
export const convertMoney = (money: Money, targetCurrency: CurrencyCode, exchangeRate: number): Money =>
    createMoney(money.amount * exchangeRate, targetCurrency);

/**
 * تقريب مبلغ (لتجنب مشاكل الكسور العشرية)
 */
export const roundMoney = (money: Money, decimals: number = 2): Money =>
    createMoney(Math.round(money.amount * Math.pow(10, decimals)) / Math.pow(10, decimals), money.currency);

/**
 * التحقق من أن المبلغ موجب
 */
export const isPositive = (money: Money): boolean => money.amount > 0;

/**
 * التحقق من أن المبلغ صفر
 */
export const isZero = (money: Money): boolean => Math.abs(money.amount) < 0.0001;
