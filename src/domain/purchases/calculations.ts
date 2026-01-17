/**
 * Domain: Purchase Calculations
 * حسابات المشتريات
 * 
 * ⚠️ منطق حسابي بحت - لا React/Context/Database
 */

// ============================================
// Types
// ============================================

export interface PurchaseItemCalculation {
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
    discountPercent: number;
    taxRate: number;
}

export interface PurchaseTotalsResult {
    subtotal: number;
    discountAmount: number;
    taxableAmount: number;
    taxAmount: number;
    totalAmount: number;
    averageUnitCost: number;    // متوسط تكلفة الوحدة
}

// ============================================
// Calculation Functions
// ============================================

/**
 * حساب إجماليات فاتورة الشراء
 */
export const calculatePurchaseTotals = (
    items: PurchaseItemCalculation[],
    additionalDiscount: number = 0,
    defaultTaxRate: number = 0.15
): PurchaseTotalsResult => {
    let subtotal = 0;
    let totalItemDiscount = 0;
    let totalQuantity = 0;

    items.forEach(item => {
        const lineGross = item.quantity * item.unitCost;
        const lineDiscount = lineGross * (item.discountPercent / 100);

        subtotal += lineGross;
        totalItemDiscount += lineDiscount;
        totalQuantity += item.quantity;
    });

    const discountAmount = totalItemDiscount + additionalDiscount;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * defaultTaxRate;
    const totalAmount = taxableAmount + taxAmount;

    // تكلفة الشراء تشمل الضريبة (إذا لم تكن مستردة)
    const averageUnitCost = totalQuantity > 0
        ? totalAmount / totalQuantity
        : 0;

    return {
        subtotal: round2(subtotal),
        discountAmount: round2(discountAmount),
        taxableAmount: round2(taxableAmount),
        taxAmount: round2(taxAmount),
        totalAmount: round2(totalAmount),
        averageUnitCost: round2(averageUnitCost)
    };
};

/**
 * حساب تكلفة الوحدة بعد المصاريف الإضافية
 */
export const calculateLandedCost = (
    unitCost: number,
    quantity: number,
    shippingCost: number = 0,
    customsDuty: number = 0,
    otherCosts: number = 0
): number => {
    if (quantity === 0) return 0;

    const totalAdditionalCosts = shippingCost + customsDuty + otherCosts;
    const additionalCostPerUnit = totalAdditionalCosts / quantity;

    return round2(unitCost + additionalCostPerUnit);
};

/**
 * التحقق من صحة عناصر الشراء
 */
export const validatePurchaseItems = (
    items: PurchaseItemCalculation[]
): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (items.length === 0) {
        errors.push('يجب إضافة صنف واحد على الأقل');
    }

    items.forEach((item, index) => {
        if (item.quantity <= 0) {
            errors.push(`الكمية يجب أن تكون أكبر من صفر (صنف ${index + 1})`);
        }
        if (item.unitCost < 0) {
            errors.push(`التكلفة لا يمكن أن تكون سالبة (صنف ${index + 1})`);
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
};

// ============================================
// Helper
// ============================================

const round2 = (n: number): number => Math.round(n * 100) / 100;
