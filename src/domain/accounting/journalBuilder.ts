/**
 * Domain: Journal Entry Builder
 * بناء قيود اليومية المحاسبية
 * 
 * ⚠️ هذا الملف يحتوي على منطق محاسبي بحت - لا يستخدم React أو Context أو قاعدة بيانات
 * 
 * المسؤوليات:
 * - بناء سطور القيود (debit/credit lines)
 * - التحقق من توازن القيد
 * - تحديد أكواد الحسابات الصحيحة
 */

import { AccountId } from '../../types/domain/money';

// ============================================
// Account Codes (أكواد الحسابات الافتراضية)
// ============================================

export const ACCOUNT_CODES = {
    // الأصول
    CASH: '1111',           // الصندوق
    BANK: '1112',           // البنك
    RECEIVABLES: '1120',    // العملاء
    INVENTORY: '1130',      // المخزون

    // الخصوم
    PAYABLES: '2110',       // الموردين

    // الإيرادات
    SALES_REVENUE: '4100',  // إيراد المبيعات
    FX_GAIN: '400001',      // أرباح فروق عملة

    // المصروفات
    COGS: '5100',           // تكلفة البضاعة المباعة
    OPERATING_EXPENSE: '5200', // مصروفات تشغيلية
    FX_LOSS: '500001',      // خسائر فروق عملة

    // حقوق الملكية
    RETAINED_EARNINGS: '3200', // الأرباح المحتجزة
} as const;

// ============================================
// Types
// ============================================

export interface JournalLine {
    accountId: AccountId;
    accountCode: string;
    debit: number;
    credit: number;
    currency: string;
    exchangeRate: number;
    debitBase: number;      // بعملة الأساس (SAR)
    creditBase: number;     // بعملة الأساس (SAR)
    description: string;
}

export interface JournalBuildResult {
    lines: JournalLine[];
    isBalanced: boolean;
    totalDebit: number;
    totalCredit: number;
    description: string;
}

export interface SaleInput {
    invoiceNumber: string;
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    paymentMethod: 'cash' | 'credit' | 'bank_transfer';
    currency?: string;
    exchangeRate?: number;
}

export interface SaleItemInput {
    productName: string;
    quantity: number;
    costPrice: number;
}

export interface PurchaseInput {
    invoiceNumber: string;
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    paymentMethod: 'cash' | 'credit' | 'bank_transfer';
    currency?: string;
    exchangeRate?: number;
}

export interface ExpenseInput {
    expenseNumber: string;
    description: string;
    amount: number;
    expenseAccountId: AccountId;
    currency?: string;
    exchangeRate?: number;
}

export interface VoucherInput {
    voucherNumber: string;
    voucherType: 'receipt' | 'payment';
    amount: number;
    partyName: string;
    partyAccountId: AccountId;
    currency?: string;
    exchangeRate?: number;
    invoiceExchangeRate?: number;   // سعر صرف الفاتورة الأصلية
}

// ============================================
// Helper: Create Journal Line
// ============================================

const createLine = (
    accountId: string,
    accountCode: string,
    debit: number,
    credit: number,
    description: string,
    currency: string = 'SAR',
    exchangeRate: number = 1
): JournalLine => ({
    accountId: accountId as AccountId,
    accountCode,
    debit,
    credit,
    currency,
    exchangeRate,
    debitBase: debit * exchangeRate,
    creditBase: credit * exchangeRate,
    description
});

// ============================================
// Build Sale Journal Lines
// ============================================

/**
 * بناء سطور قيد المبيعات
 * 
 * القيد:
 * - من حـ/ الصندوق أو العملاء (حسب طريقة الدفع)
 * - إلى حـ/ المبيعات
 */
export const buildSaleJournalLines = (
    sale: SaleInput,
    debitAccountId: AccountId,
    salesAccountId: AccountId
): JournalBuildResult => {
    const currency = sale.currency || 'SAR';
    const exchangeRate = sale.exchangeRate || 1;

    // تحديد كود الحساب المدين
    const debitAccountCode = sale.paymentMethod === 'cash'
        ? ACCOUNT_CODES.CASH
        : ACCOUNT_CODES.RECEIVABLES;

    const lines: JournalLine[] = [
        // مدين: الصندوق/العملاء
        createLine(
            debitAccountId,
            debitAccountCode,
            sale.totalAmount,
            0,
            `فاتورة مبيعات رقم ${sale.invoiceNumber}`,
            currency,
            exchangeRate
        ),
        // دائن: المبيعات (شامل الضريبة للتبسيط)
        createLine(
            salesAccountId,
            ACCOUNT_CODES.SALES_REVENUE,
            0,
            sale.totalAmount,
            `إيراد مبيعات فاتورة ${sale.invoiceNumber}`,
            currency,
            exchangeRate
        )
    ];

    const totalDebit = lines.reduce((sum, l) => sum + l.debitBase, 0);
    const totalCredit = lines.reduce((sum, l) => sum + l.creditBase, 0);

    return {
        lines,
        isBalanced: Math.abs(totalDebit - totalCredit) < 0.001,
        totalDebit,
        totalCredit,
        description: `قيد مبيعات: فاتورة ${sale.invoiceNumber}`
    };
};

// ============================================
// Build COGS Journal Lines (تكلفة البضاعة المباعة)
// ============================================

/**
 * بناء سطور قيد تكلفة البضاعة المباعة
 * 
 * القيد:
 * - من حـ/ تكلفة البضاعة المباعة
 * - إلى حـ/ المخزون
 */
export const buildCOGSJournalLines = (
    invoiceNumber: string,
    items: SaleItemInput[],
    cogsAccountId: AccountId,
    inventoryAccountId: AccountId
): JournalBuildResult => {
    // حساب إجمالي التكلفة
    const totalCost = items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);

    if (totalCost <= 0) {
        return {
            lines: [],
            isBalanced: true,
            totalDebit: 0,
            totalCredit: 0,
            description: 'لا توجد تكلفة'
        };
    }

    const lines: JournalLine[] = [
        // مدين: تكلفة البضاعة المباعة
        createLine(
            cogsAccountId,
            ACCOUNT_CODES.COGS,
            totalCost,
            0,
            `تكلفة مبيعات فاتورة ${invoiceNumber}`
        ),
        // دائن: المخزون
        createLine(
            inventoryAccountId,
            ACCOUNT_CODES.INVENTORY,
            0,
            totalCost,
            `صرف مخزون فاتورة ${invoiceNumber}`
        )
    ];

    return {
        lines,
        isBalanced: true,
        totalDebit: totalCost,
        totalCredit: totalCost,
        description: `قيد تكلفة: فاتورة ${invoiceNumber}`
    };
};

// ============================================
// Build Purchase Journal Lines
// ============================================

/**
 * بناء سطور قيد المشتريات
 * 
 * القيد:
 * - من حـ/ المخزون
 * - إلى حـ/ الموردين أو الصندوق
 */
export const buildPurchaseJournalLines = (
    purchase: PurchaseInput,
    inventoryAccountId: AccountId,
    creditAccountId: AccountId
): JournalBuildResult => {
    const currency = purchase.currency || 'SAR';
    const exchangeRate = purchase.exchangeRate || 1;

    // تحديد كود الحساب الدائن
    const creditAccountCode = purchase.paymentMethod === 'cash'
        ? ACCOUNT_CODES.CASH
        : ACCOUNT_CODES.PAYABLES;

    // المخزون = الصافي + الضريبة (للتبسيط)
    const inventoryAmount = purchase.subtotal - purchase.discountAmount + purchase.taxAmount;

    const lines: JournalLine[] = [
        // مدين: المخزون
        createLine(
            inventoryAccountId,
            ACCOUNT_CODES.INVENTORY,
            inventoryAmount,
            0,
            `شراء بضاعة فاتورة ${purchase.invoiceNumber}`,
            currency,
            exchangeRate
        ),
        // دائن: الموردين/الصندوق
        createLine(
            creditAccountId,
            creditAccountCode,
            0,
            purchase.totalAmount,
            `استحقاق مشتريات فاتورة ${purchase.invoiceNumber}`,
            currency,
            exchangeRate
        )
    ];

    const totalDebit = lines.reduce((sum, l) => sum + l.debitBase, 0);
    const totalCredit = lines.reduce((sum, l) => sum + l.creditBase, 0);

    return {
        lines,
        isBalanced: Math.abs(totalDebit - totalCredit) < 0.001,
        totalDebit,
        totalCredit,
        description: `قيد مشتريات: فاتورة ${purchase.invoiceNumber}`
    };
};

// ============================================
// Build Expense Journal Lines
// ============================================

/**
 * بناء سطور قيد المصروفات
 * 
 * القيد:
 * - من حـ/ المصروف (حسب التصنيف)
 * - إلى حـ/ الصندوق
 */
export const buildExpenseJournalLines = (
    expense: ExpenseInput,
    cashAccountId: AccountId
): JournalBuildResult => {
    const currency = expense.currency || 'SAR';
    const exchangeRate = expense.exchangeRate || 1;

    const lines: JournalLine[] = [
        // مدين: حساب المصروف
        createLine(
            expense.expenseAccountId,
            ACCOUNT_CODES.OPERATING_EXPENSE,
            expense.amount,
            0,
            expense.description || `مصروف رقم ${expense.expenseNumber}`,
            currency,
            exchangeRate
        ),
        // دائن: الصندوق
        createLine(
            cashAccountId,
            ACCOUNT_CODES.CASH,
            0,
            expense.amount,
            `دفع مصروف ${expense.expenseNumber}`,
            currency,
            exchangeRate
        )
    ];

    return {
        lines,
        isBalanced: true,
        totalDebit: expense.amount * exchangeRate,
        totalCredit: expense.amount * exchangeRate,
        description: `قيد مصروف: ${expense.description}`
    };
};

// ============================================
// Build Voucher Journal Lines (with FX handling)
// ============================================

/**
 * بناء سطور قيد السند مع معالجة فروقات العملة
 * 
 * سند قبض:
 * - من حـ/ الصندوق (بسعر السند)
 * - إلى حـ/ العميل (بسعر الفاتورة)
 * - فرق → ربح أو خسارة عملة
 * 
 * سند صرف:
 * - من حـ/ المورد (بسعر الفاتورة)
 * - إلى حـ/ الصندوق (بسعر السند)
 * - فرق → ربح أو خسارة عملة
 */
export const buildVoucherJournalLines = (
    voucher: VoucherInput,
    cashAccountId: AccountId,
    fxGainAccountId?: AccountId,
    fxLossAccountId?: AccountId
): JournalBuildResult => {
    const currency = voucher.currency || 'SAR';
    const exchangeRate = voucher.exchangeRate || 1;
    const invoiceRate = voucher.invoiceExchangeRate || exchangeRate;

    const amountBase = voucher.amount * exchangeRate;       // المبلغ بالريال (سعر السند)
    const invoiceAmountBase = voucher.amount * invoiceRate; // المبلغ بالريال (سعر الفاتورة)

    const lines: JournalLine[] = [];

    if (voucher.voucherType === 'receipt') {
        // سند قبض

        // من الصندوق
        lines.push(createLine(
            cashAccountId,
            ACCOUNT_CODES.CASH,
            voucher.amount,
            0,
            `سند قبض رقم ${voucher.voucherNumber}`,
            currency,
            exchangeRate
        ));

        // إلى العميل
        lines.push(createLine(
            voucher.partyAccountId,
            ACCOUNT_CODES.RECEIVABLES,
            0,
            voucher.amount,
            `استلام من ${voucher.partyName}`,
            currency,
            invoiceRate
        ));

        // معالجة فرق العملة
        const diff = amountBase - invoiceAmountBase;

        if (Math.abs(diff) > 0.01) {
            if (diff > 0 && fxGainAccountId) {
                // ربح عملة (استلمنا أكثر)
                lines.push(createLine(
                    fxGainAccountId,
                    ACCOUNT_CODES.FX_GAIN,
                    0,
                    0,
                    `أرباح فروق عملة - سند ${voucher.voucherNumber}`,
                    'SAR',
                    1
                ));
                // تعديل القيمة بالريال للسطر الأخير
                lines[lines.length - 1].creditBase = diff;
            } else if (diff < 0 && fxLossAccountId) {
                // خسارة عملة (استلمنا أقل)
                lines.push(createLine(
                    fxLossAccountId,
                    ACCOUNT_CODES.FX_LOSS,
                    0,
                    0,
                    `خسائر فروق عملة - سند ${voucher.voucherNumber}`,
                    'SAR',
                    1
                ));
                lines[lines.length - 1].debitBase = Math.abs(diff);
            }
        }

    } else {
        // سند صرف

        // من المورد
        lines.push(createLine(
            voucher.partyAccountId,
            ACCOUNT_CODES.PAYABLES,
            voucher.amount,
            0,
            `دفع لـ ${voucher.partyName}`,
            currency,
            invoiceRate
        ));

        // إلى الصندوق
        lines.push(createLine(
            cashAccountId,
            ACCOUNT_CODES.CASH,
            0,
            voucher.amount,
            `سند صرف رقم ${voucher.voucherNumber}`,
            currency,
            exchangeRate
        ));

        // معالجة فرق العملة (عكس سند القبض)
        const diff = amountBase - invoiceAmountBase;

        if (Math.abs(diff) > 0.01) {
            if (diff > 0 && fxLossAccountId) {
                // خسارة (دفعنا أكثر)
                lines.push(createLine(
                    fxLossAccountId,
                    ACCOUNT_CODES.FX_LOSS,
                    0,
                    0,
                    `خسائر فروق عملة - سند ${voucher.voucherNumber}`,
                    'SAR',
                    1
                ));
                lines[lines.length - 1].debitBase = diff;
            } else if (diff < 0 && fxGainAccountId) {
                // ربح (دفعنا أقل)
                lines.push(createLine(
                    fxGainAccountId,
                    ACCOUNT_CODES.FX_GAIN,
                    0,
                    0,
                    `أرباح فروق عملة - سند ${voucher.voucherNumber}`,
                    'SAR',
                    1
                ));
                lines[lines.length - 1].creditBase = Math.abs(diff);
            }
        }
    }

    const totalDebit = lines.reduce((sum, l) => sum + l.debitBase, 0);
    const totalCredit = lines.reduce((sum, l) => sum + l.creditBase, 0);

    return {
        lines,
        isBalanced: Math.abs(totalDebit - totalCredit) < 0.001,
        totalDebit,
        totalCredit,
        description: `قيد ${voucher.voucherType === 'receipt' ? 'قبض' : 'صرف'}: سند ${voucher.voucherNumber}`
    };
};

// ============================================
// Validation Helpers
// ============================================

/**
 * التحقق من توازن القيد (إجمالي المدين = إجمالي الدائن)
 */
export const isJournalBalanced = (lines: JournalLine[]): boolean => {
    const totalDebit = lines.reduce((sum, l) => sum + l.debitBase, 0);
    const totalCredit = lines.reduce((sum, l) => sum + l.creditBase, 0);
    return Math.abs(totalDebit - totalCredit) < 0.0001;
};

/**
 * حساب الفرق بين المدين والدائن
 */
export const getJournalDifference = (lines: JournalLine[]): number => {
    const totalDebit = lines.reduce((sum, l) => sum + l.debitBase, 0);
    const totalCredit = lines.reduce((sum, l) => sum + l.creditBase, 0);
    return totalDebit - totalCredit;
};
