/**
 * Domain: Inventory Costing
 * حسابات تكلفة المخزون
 * 
 * ⚠️ منطق حسابي بحت - لا React/Context/Database
 */

// ============================================
// Types
// ============================================

export interface InventoryItem {
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
}

export interface StockMovement {
    productId: string;
    quantity: number;       // موجب = إضافة، سالب = صرف
    unitCost: number;
    date: string;
}

export interface COGSResult {
    totalCost: number;
    items: { productId: string; quantity: number; cost: number }[];
}

export interface AverageCostResult {
    productId: string;
    averageCost: number;
    totalQuantity: number;
    totalValue: number;
}

// ============================================
// COGS Calculations (تكلفة البضاعة المباعة)
// ============================================

/**
 * حساب تكلفة البضاعة المباعة (FIFO / المتوسط المرجح)
 * يستخدم المتوسط المرجح حالياً
 */
export const calculateCOGS = (
    items: { productId: string; quantity: number; costPrice: number }[]
): COGSResult => {
    const itemCosts = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        cost: item.quantity * item.costPrice
    }));

    const totalCost = itemCosts.reduce((sum, item) => sum + item.cost, 0);

    return {
        totalCost: round2(totalCost),
        items: itemCosts
    };
};

/**
 * حساب متوسط التكلفة المرجح لمنتج
 */
export const calculateWeightedAverageCost = (
    movements: StockMovement[]
): AverageCostResult => {
    if (movements.length === 0) {
        return {
            productId: '',
            averageCost: 0,
            totalQuantity: 0,
            totalValue: 0
        };
    }

    let totalQuantity = 0;
    let totalValue = 0;

    // حساب المتوسط بناءً على الحركات الموجبة فقط (الإضافات)
    movements.forEach(movement => {
        if (movement.quantity > 0) {
            totalQuantity += movement.quantity;
            totalValue += movement.quantity * movement.unitCost;
        } else {
            // الصرف - نطرح من الكمية
            totalQuantity += movement.quantity; // سالب
        }
    });

    const averageCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;

    return {
        productId: movements[0]?.productId || '',
        averageCost: round2(averageCost),
        totalQuantity,
        totalValue: round2(totalValue)
    };
};

/**
 * حساب قيمة المخزون الحالي
 */
export const calculateInventoryValue = (
    items: InventoryItem[]
): number => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
};

/**
 * التحقق من توفر الكمية
 */
export const checkStockAvailability = (
    availableQuantity: number,
    requestedQuantity: number
): { available: boolean; shortage: number } => {
    const shortage = requestedQuantity - availableQuantity;
    return {
        available: shortage <= 0,
        shortage: shortage > 0 ? shortage : 0
    };
};

/**
 * حساب نقطة إعادة الطلب
 */
export const calculateReorderPoint = (
    dailyUsage: number,
    leadTimeDays: number,
    safetyStock: number = 0
): number => {
    return (dailyUsage * leadTimeDays) + safetyStock;
};

/**
 * حساب معدل دوران المخزون
 */
export const calculateInventoryTurnover = (
    cogs: number,
    averageInventory: number
): number => {
    if (averageInventory === 0) return 0;
    return cogs / averageInventory;
};

/**
 * حساب أيام المخزون
 */
export const calculateDaysOfInventory = (
    turnoverRatio: number
): number => {
    if (turnoverRatio === 0) return 0;
    return 365 / turnoverRatio;
};

// ============================================
// Stock Movement Validation
// ============================================

/**
 * التحقق من حركة المخزون
 */
export const validateStockMovement = (
    currentQuantity: number,
    movementQuantity: number,
    allowNegative: boolean = false
): { valid: boolean; error?: string } => {
    // الإضافة دائماً مسموحة
    if (movementQuantity > 0) {
        return { valid: true };
    }

    // الصرف - التحقق من الكمية المتاحة
    const resultingQuantity = currentQuantity + movementQuantity;

    if (resultingQuantity < 0 && !allowNegative) {
        return {
            valid: false,
            error: `الكمية المطلوبة (${Math.abs(movementQuantity)}) أكبر من المتاح (${currentQuantity})`
        };
    }

    return { valid: true };
};

// ============================================
// Helper
// ============================================

const round2 = (n: number): number => Math.round(n * 100) / 100;
