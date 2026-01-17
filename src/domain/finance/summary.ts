/**
 * Domain: Finance Calculations
 * حسابات مالية عامة
 */

// ============================================
// Types
// ============================================

export interface FinancialSummaryInput {
    transactions: { amount: number }[];
}

export interface FinancialSummaryResult {
    revenue: number;
    cost: number;
    profit: number;
}

// ============================================
// Calculation Functions
// ============================================

/**
 * حساب ملخص مالي من المعاملات
 */
export const calculateFinancialSummary = (input: FinancialSummaryInput): FinancialSummaryResult => {
    const revenue = input.transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

    const cost = input.transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
        revenue: round2(revenue),
        cost: round2(cost),
        profit: round2(revenue - cost)
    };
};

/**
 * حساب النسبة المئوية للتغير
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return round2(((current - previous) / previous) * 100);
};

/**
 * حساب نسبة الربحية
 */
export const calculateProfitabilityRatio = (profit: number, revenue: number): number => {
    if (revenue === 0) return 0;
    return round2((profit / revenue) * 100);
};

// ============================================
// Helper
// ============================================

const round2 = (n: number): number => Math.round(n * 100) / 100;
