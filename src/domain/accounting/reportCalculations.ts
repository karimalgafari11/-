/**
 * Domain: Report Calculations
 * حسابات التقارير المالية
 * 
 * ⚠️ منطق حسابي بحت - لا React/Context/Database
 * 
 * هذا الملف يحتوي على جميع حسابات التقارير المالية التي كانت موزعة
 * في Components مختلفة. الآن كلها في مكان واحد قابل للاختبار.
 */

// ============================================
// Types
// ============================================

export interface TrialBalanceItem {
    account: {
        id: string;
        code: string;
        name: string;
        account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
    };
    debit: number;
    credit: number;
}

export interface TrialBalanceResult {
    items: TrialBalanceItem[];
    totalDebit: number;
    totalCredit: number;
    isBalanced: boolean;
    difference: number;
}

export interface IncomeStatementResult {
    revenues: TrialBalanceItem[];
    expenses: TrialBalanceItem[];
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    isProfit: boolean;
}

export interface BalanceSheetResult {
    assets: TrialBalanceItem[];
    liabilities: TrialBalanceItem[];
    equity: TrialBalanceItem[];
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    totalLiabilitiesAndEquity: number;
    isBalanced: boolean;
}

export interface FinancialRatios {
    currentRatio: number;           // نسبة التداول
    quickRatio: number;             // نسبة السيولة السريعة
    debtToEquityRatio: number;      // نسبة الدين إلى حقوق الملكية
    profitMargin: number;           // هامش الربح
    returnOnEquity: number;         // العائد على حقوق الملكية
}

// ============================================
// Trial Balance Calculations
// ============================================

/**
 * تحويل أرصدة الحسابات إلى ميزان مراجعة
 */
export const calculateTrialBalanceFromAccounts = (
    accounts: TrialBalanceItem[]
): TrialBalanceResult => {
    const totalDebit = accounts.reduce((sum, item) => sum + item.debit, 0);
    const totalCredit = accounts.reduce((sum, item) => sum + item.credit, 0);
    const difference = totalDebit - totalCredit;

    return {
        items: accounts,
        totalDebit: round2(totalDebit),
        totalCredit: round2(totalCredit),
        isBalanced: Math.abs(difference) < 0.01,
        difference: round2(difference)
    };
};

/**
 * حساب رصيد الحساب (مدين - دائن أو العكس حسب طبيعة الحساب)
 */
export const calculateAccountBalance = (
    item: TrialBalanceItem
): number => {
    const { account, debit, credit } = item;

    // الأصول والمصروفات: رصيد مدين (debit - credit)
    // الخصوم وحقوق الملكية والإيرادات: رصيد دائن (credit - debit)
    if (account.account_type === 'asset' || account.account_type === 'expense') {
        return debit - credit;
    } else {
        return credit - debit;
    }
};

// ============================================
// Income Statement Calculations
// ============================================

/**
 * حساب قائمة الدخل من ميزان المراجعة
 */
export const calculateIncomeStatement = (
    trialBalance: TrialBalanceItem[]
): IncomeStatementResult => {
    // تحويل إلى أرصدة
    const itemsWithBalance = trialBalance.map(item => ({
        ...item,
        balance: item.debit - item.credit
    }));

    // تصفية الإيرادات (revenue accounts)
    const revenues = itemsWithBalance.filter(
        item => item.account.account_type === 'revenue' && item.balance !== 0
    );

    // تصفية المصروفات (expense accounts)
    const expenses = itemsWithBalance.filter(
        item => item.account.account_type === 'expense' && item.balance !== 0
    );

    // حساب الإجماليات
    // الإيرادات عادة دائنة (balance سالب بعد debit - credit)
    const totalRevenue = revenues.reduce((sum, item) => sum + Math.abs(item.balance), 0);

    // المصروفات عادة مدينة (balance موجب)
    const totalExpenses = expenses.reduce((sum, item) => sum + Math.abs(item.balance), 0);

    const netIncome = totalRevenue - totalExpenses;

    return {
        revenues,
        expenses,
        totalRevenue: round2(totalRevenue),
        totalExpenses: round2(totalExpenses),
        netIncome: round2(netIncome),
        isProfit: netIncome >= 0
    };
};

// ============================================
// Balance Sheet Calculations
// ============================================

/**
 * حساب الميزانية العمومية من ميزان المراجعة
 */
export const calculateBalanceSheet = (
    trialBalance: TrialBalanceItem[]
): BalanceSheetResult => {
    // تحويل إلى أرصدة
    const itemsWithBalance = trialBalance.map(item => ({
        ...item,
        balance: item.debit - item.credit
    }));

    // تصفية الأصول
    const assets = itemsWithBalance.filter(
        item => item.account.account_type === 'asset' && item.balance !== 0
    );

    // تصفية الخصوم
    const liabilities = itemsWithBalance.filter(
        item => item.account.account_type === 'liability' && item.balance !== 0
    );

    // تصفية حقوق الملكية
    const equity = itemsWithBalance.filter(
        item => item.account.account_type === 'equity' && item.balance !== 0
    );

    // حساب الإجماليات
    const totalAssets = assets.reduce((sum, item) => sum + Math.abs(item.balance), 0);
    const totalLiabilities = liabilities.reduce((sum, item) => sum + Math.abs(item.balance), 0);
    const totalEquity = equity.reduce((sum, item) => sum + Math.abs(item.balance), 0);

    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    return {
        assets,
        liabilities,
        equity,
        totalAssets: round2(totalAssets),
        totalLiabilities: round2(totalLiabilities),
        totalEquity: round2(totalEquity),
        totalLiabilitiesAndEquity: round2(totalLiabilitiesAndEquity),
        isBalanced: Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01
    };
};

// ============================================
// Financial Ratios
// ============================================

/**
 * حساب النسب المالية
 */
export const calculateFinancialRatios = (
    balanceSheet: BalanceSheetResult,
    incomeStatement: IncomeStatementResult
): FinancialRatios => {
    const { totalAssets, totalLiabilities, totalEquity } = balanceSheet;
    const { totalRevenue, netIncome } = incomeStatement;

    // نسبة التداول = الأصول المتداولة / الخصوم المتداولة
    // للتبسيط: نفترض كل الأصول متداولة
    const currentRatio = totalLiabilities > 0
        ? totalAssets / totalLiabilities
        : 0;

    // نسبة السيولة السريعة (تقريبية)
    const quickRatio = currentRatio * 0.8; // تقدير تقريبي

    // نسبة الدين إلى حقوق الملكية
    const debtToEquityRatio = totalEquity > 0
        ? totalLiabilities / totalEquity
        : 0;

    // هامش الربح
    const profitMargin = totalRevenue > 0
        ? (netIncome / totalRevenue) * 100
        : 0;

    // العائد على حقوق الملكية
    const returnOnEquity = totalEquity > 0
        ? (netIncome / totalEquity) * 100
        : 0;

    return {
        currentRatio: round2(currentRatio),
        quickRatio: round2(quickRatio),
        debtToEquityRatio: round2(debtToEquityRatio),
        profitMargin: round2(profitMargin),
        returnOnEquity: round2(returnOnEquity)
    };
};

// ============================================
// Period Comparison
// ============================================

export interface PeriodComparisonResult {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
    trend: 'up' | 'down' | 'stable';
}

/**
 * مقارنة فترتين
 */
export const comparePeriods = (
    currentValue: number,
    previousValue: number
): PeriodComparisonResult => {
    const change = currentValue - previousValue;
    const changePercent = previousValue !== 0
        ? (change / previousValue) * 100
        : 0;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(changePercent) > 1) {
        trend = change > 0 ? 'up' : 'down';
    }

    return {
        current: round2(currentValue),
        previous: round2(previousValue),
        change: round2(change),
        changePercent: round2(changePercent),
        trend
    };
};

// ============================================
// Helper
// ============================================

const round2 = (n: number): number => Math.round(n * 100) / 100;
