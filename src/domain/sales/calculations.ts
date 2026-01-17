/**
 * Domain: Sales Calculations
 * حسابات المبيعات
 * 
 * ⚠️ منطق حسابي بحت - لا React/Context/Database
 */

// No external imports needed - pure calculations

// ============================================
// Types
// ============================================

export interface SaleItemCalculation {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    costPrice: number;
    discountPercent: number;
    taxRate: number;        // 0.15 for 15%
}

export interface SaleTotalsResult {
    subtotal: number;           // إجمالي قبل الخصم
    discountAmount: number;     // قيمة الخصم
    taxableAmount: number;      // المبلغ الخاضع للضريبة
    taxAmount: number;          // قيمة الضريبة
    totalAmount: number;        // الإجمالي النهائي
    totalCost: number;          // إجمالي التكلفة
    grossProfit: number;        // إجمالي الربح
    profitMargin: number;       // هامش الربح (%)
}

// ============================================
// Calculation Functions
// ============================================

/**
 * حساب سطر بيع واحد
 */
export const calculateLineTotal = (
    quantity: number,
    unitPrice: number,
    discountPercent: number = 0
): number => {
    const gross = quantity * unitPrice;
    const discount = gross * (discountPercent / 100);
    return gross - discount;
};

/**
 * حساب الضريبة على مبلغ
 */
export const calculateTax = (amount: number, taxRate: number): number => {
    return amount * taxRate;
};

/**
 * حساب إجماليات فاتورة البيع
 */
export const calculateSaleTotals = (
    items: SaleItemCalculation[],
    additionalDiscount: number = 0,
    defaultTaxRate: number = 0.15
): SaleTotalsResult => {
    // حساب الإجمالي قبل الخصم
    let subtotal = 0;
    let totalItemDiscount = 0;
    let totalCost = 0;

    items.forEach(item => {
        const lineGross = item.quantity * item.unitPrice;
        const lineDiscount = lineGross * (item.discountPercent / 100);

        subtotal += lineGross;
        totalItemDiscount += lineDiscount;
        totalCost += item.quantity * item.costPrice;
    });

    // الخصم الإجمالي = خصم الأصناف + الخصم الإضافي
    const discountAmount = totalItemDiscount + additionalDiscount;

    // المبلغ الخاضع للضريبة
    const taxableAmount = subtotal - discountAmount;

    // الضريبة
    const taxAmount = calculateTax(taxableAmount, defaultTaxRate);

    // الإجمالي النهائي
    const totalAmount = taxableAmount + taxAmount;

    // الربح
    const grossProfit = taxableAmount - totalCost;
    const profitMargin = totalCost > 0 ? (grossProfit / totalCost) * 100 : 0;

    return {
        subtotal: round2(subtotal),
        discountAmount: round2(discountAmount),
        taxableAmount: round2(taxableAmount),
        taxAmount: round2(taxAmount),
        totalAmount: round2(totalAmount),
        totalCost: round2(totalCost),
        grossProfit: round2(grossProfit),
        profitMargin: round2(profitMargin)
    };
};

/**
 * التحقق من صحة عناصر البيع
 */
export const validateSaleItems = (items: SaleItemCalculation[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (items.length === 0) {
        errors.push('يجب إضافة صنف واحد على الأقل');
    }

    items.forEach((item, index) => {
        if (item.quantity <= 0) {
            errors.push(`الكمية يجب أن تكون أكبر من صفر (صنف ${index + 1})`);
        }
        if (item.unitPrice < 0) {
            errors.push(`السعر لا يمكن أن يكون سالباً (صنف ${index + 1})`);
        }
        if (item.discountPercent < 0 || item.discountPercent > 100) {
            errors.push(`نسبة الخصم يجب أن تكون بين 0 و 100 (صنف ${index + 1})`);
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * حساب سعر البيع المقترح بناءً على هامش الربح المطلوب
 */
export const calculateSuggestedPrice = (
    costPrice: number,
    desiredMarginPercent: number
): number => {
    return costPrice * (1 + desiredMarginPercent / 100);
};

/**
 * حساب هامش الربح بناءً على سعر البيع والتكلفة
 */
export const calculateProfitMargin = (
    sellingPrice: number,
    costPrice: number
): number => {
    if (costPrice === 0) return 0;
    return ((sellingPrice - costPrice) / costPrice) * 100;
};

// ============================================
// Helper
// ============================================

const round2 = (n: number): number => Math.round(n * 100) / 100;
