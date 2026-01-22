/**
 * Domain: Expense Calculations
 * حسابات المصروفات
 * 
 * ⚠️ منطق حسابي بحت - لا React/Context/Database
 */

// ============================================
// Types
// ============================================

export interface ExpenseCalculation {
    amount: number;
    vatRate: number;        // 0.15 for 15%
    category: string;
    isVatInclusive: boolean;  // هل المبلغ شامل الضريبة؟
}

export interface ExpenseResult {
    grossAmount: number;        // المبلغ الإجمالي
    vatAmount: number;          // قيمة الضريبة
    netAmount: number;          // المبلغ الصافي (بدون ضريبة)
    totalAmount: number;        // الإجمالي النهائي
}

export interface RecurringExpenseCalculation {
    amount: number;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    startDate: Date;
    endDate?: Date;
}

export interface RecurringExpenseResult {
    occurrences: number;
    totalAmount: number;
    nextDueDate: Date | null;
}

// ============================================
// Validation
// ============================================

export interface ExpenseValidationResult {
    valid: boolean;
    errors: string[];
}

/**
 * التحقق من صحة المصروف
 */
export const validateExpense = (expense: ExpenseCalculation): ExpenseValidationResult => {
    const errors: string[] = [];

    if (expense.amount <= 0) {
        errors.push('المبلغ يجب أن يكون أكبر من صفر');
    }

    if (expense.vatRate < 0 || expense.vatRate > 1) {
        errors.push('نسبة الضريبة يجب أن تكون بين 0 و 100%');
    }

    if (!expense.category || expense.category.trim() === '') {
        errors.push('يجب تحديد فئة المصروف');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

// ============================================
// Calculation Functions
// ============================================

/**
 * حساب تفاصيل المصروف
 */
export const calculateExpense = (expense: ExpenseCalculation): ExpenseResult => {
    let netAmount: number;
    let vatAmount: number;
    let grossAmount: number;

    if (expense.isVatInclusive) {
        // المبلغ شامل الضريبة - نستخرج الصافي
        grossAmount = expense.amount;
        netAmount = expense.amount / (1 + expense.vatRate);
        vatAmount = expense.amount - netAmount;
    } else {
        // المبلغ غير شامل الضريبة - نضيف الضريبة
        netAmount = expense.amount;
        vatAmount = expense.amount * expense.vatRate;
        grossAmount = expense.amount + vatAmount;
    }

    return {
        grossAmount: round2(grossAmount),
        vatAmount: round2(vatAmount),
        netAmount: round2(netAmount),
        totalAmount: round2(grossAmount)
    };
};

/**
 * حساب إجمالي المصروفات المتكررة
 */
export const calculateRecurringExpense = (
    expense: RecurringExpenseCalculation
): RecurringExpenseResult => {
    const now = new Date();
    const start = expense.startDate;
    const end = expense.endDate || new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

    // حساب عدد المرات
    const occurrences = calculateOccurrences(start, end, expense.frequency);
    const totalAmount = expense.amount * occurrences;
    const nextDueDate = calculateNextDueDate(start, expense.frequency);

    return {
        occurrences,
        totalAmount: round2(totalAmount),
        nextDueDate
    };
};

/**
 * تجميع المصروفات حسب الفئة
 */
export const groupExpensesByCategory = (
    expenses: ExpenseCalculation[]
): Map<string, number> => {
    const grouped = new Map<string, number>();

    expenses.forEach(expense => {
        const current = grouped.get(expense.category) || 0;
        grouped.set(expense.category, current + expense.amount);
    });

    return grouped;
};

/**
 * حساب مجموع المصروفات
 */
export const calculateTotalExpenses = (expenses: ExpenseCalculation[]): ExpenseResult => {
    let totalGross = 0;
    let totalVat = 0;
    let totalNet = 0;

    expenses.forEach(expense => {
        const result = calculateExpense(expense);
        totalGross += result.grossAmount;
        totalVat += result.vatAmount;
        totalNet += result.netAmount;
    });

    return {
        grossAmount: round2(totalGross),
        vatAmount: round2(totalVat),
        netAmount: round2(totalNet),
        totalAmount: round2(totalGross)
    };
};

// ============================================
// Helper Functions
// ============================================

const round2 = (n: number): number => Math.round(n * 100) / 100;

const calculateOccurrences = (
    start: Date,
    end: Date,
    frequency: RecurringExpenseCalculation['frequency']
): number => {
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.floor((end.getTime() - start.getTime()) / msPerDay);

    switch (frequency) {
        case 'daily':
            return Math.max(0, diffDays);
        case 'weekly':
            return Math.max(0, Math.floor(diffDays / 7));
        case 'monthly':
            return Math.max(0, Math.floor(diffDays / 30));
        case 'quarterly':
            return Math.max(0, Math.floor(diffDays / 90));
        case 'yearly':
            return Math.max(0, Math.floor(diffDays / 365));
        default:
            return 0;
    }
};

const calculateNextDueDate = (
    start: Date,
    frequency: RecurringExpenseCalculation['frequency']
): Date | null => {
    const now = new Date();
    const next = new Date(start);

    if (next > now) return next;

    while (next <= now) {
        switch (frequency) {
            case 'daily':
                next.setDate(next.getDate() + 1);
                break;
            case 'weekly':
                next.setDate(next.getDate() + 7);
                break;
            case 'monthly':
                next.setMonth(next.getMonth() + 1);
                break;
            case 'quarterly':
                next.setMonth(next.getMonth() + 3);
                break;
            case 'yearly':
                next.setFullYear(next.getFullYear() + 1);
                break;
        }
    }

    return next;
};
