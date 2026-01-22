/**
 * Accounting Types - أنواع المحاسبة
 */

// =================== السنوات المالية ===================

export interface FiscalYear {
    id: string;
    company_id: string;
    name: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    is_closed: boolean;
    closed_at?: string;
    closed_by?: string;
    opening_balance_journal_id?: string;
    created_at: string;
    updated_at: string;
}

// =================== أنواع الحسابات ===================

export type AccountTypeCode = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'cogs';
export type NormalBalance = 'debit' | 'credit';

export interface AccountType {
    id: string;
    code: AccountTypeCode;
    name: string;
    name_ar: string;
    normal_balance: NormalBalance;
    report_type: 'balance_sheet' | 'income_statement';
    display_order: number;
}

// =================== الحسابات ===================

export interface Account {
    id: string;
    company_id: string;
    code: string;
    name: string;
    account_type: AccountTypeCode;
    type_id?: string;
    parent_id?: string;
    level: number;
    is_header: boolean;
    allow_transactions: boolean;
    normal_balance: NormalBalance;
    opening_balance: number;
    current_balance: number;
    currency: string;
    is_active: boolean;
    created_at: string;
}

export type AccountInsert = Omit<Account, 'id' | 'created_at' | 'current_balance'>;
export type AccountUpdate = Partial<AccountInsert>;

// =================== القيود المحاسبية ===================

export type JournalEntryStatus = 'draft' | 'posted' | 'reversed';
export type ReferenceType = 'sale' | 'purchase' | 'expense' | 'payment' | 'receipt' | 'manual';

export interface JournalEntry {
    id: string;
    company_id: string;
    fiscal_year_id?: string;
    entry_number: string;
    entry_date: string;
    description: string;
    reference_type?: ReferenceType;
    reference_id?: string;
    reference_number?: string;
    total_debit: number;
    total_credit: number;
    status: JournalEntryStatus;
    posted_at?: string;
    posted_by?: string;
    is_reversal: boolean;
    reversed_entry_id?: string;
    reversal_entry_id?: string;
    reversal_reason?: string;
    created_by?: string;
    created_at: string;
    updated_at: string;

    // Relations
    lines?: JournalEntryLine[];
}

export interface JournalEntryLine {
    id: string;
    journal_entry_id: string;
    account_id: string;
    line_number: number;
    description?: string;
    debit_amount: number;
    credit_amount: number;
    currency: string;
    exchange_rate: number;
    debit_amount_base: number;
    credit_amount_base: number;
    party_type?: string;
    party_id?: string;
    created_at: string;

    // Relations
    account?: Account;
}

export interface CreateJournalEntryData {
    entry_date: string;
    description: string;
    reference_type?: ReferenceType;
    reference_id?: string;
    reference_number?: string;
    lines: {
        account_id: string;
        description?: string;
        debit_amount: number;
        credit_amount: number;
        party_type?: string;
        party_id?: string;
    }[];
}

// =================== أسعار الصرف ===================

export interface ExchangeRate {
    id: string;
    company_id: string;
    from_currency: string;
    to_currency: string;
    rate: number;
    effective_date: string;
    created_at: string;
}

// =================== الضرائب ===================

export interface TaxCode {
    id: string;
    company_id: string;
    code: string;
    name: string;
    name_ar: string;
    rate: number;
    tax_type: 'sales' | 'purchase' | 'both';
    is_included: boolean;
    sales_account_id?: string;
    purchase_account_id?: string;
    is_active: boolean;
    created_at: string;
}

// =================== الأرصدة ===================

export interface AccountBalance {
    id: string;
    company_id: string;
    code: string;
    name: string;
    account_type: AccountTypeCode;
    normal_balance: NormalBalance;
    total_debit: number;
    total_credit: number;
    balance: number;
}

export interface TrialBalanceRow {
    account_id?: string;
    company_id: string;
    code: string;
    name: string;
    account_type: AccountTypeCode;
    debit_balance: number;
    credit_balance: number;
}

// =================== دوال مساعدة ===================

/**
 * التحقق من توازن القيد
 */
export function isEntryBalanced(lines: { debit_amount: number; credit_amount: number }[]): boolean {
    const totalDebit = lines.reduce((sum, l) => sum + l.debit_amount, 0);
    const totalCredit = lines.reduce((sum, l) => sum + l.credit_amount, 0);
    return Math.abs(totalDebit - totalCredit) < 0.01;
}

/**
 * حساب إجمالي المدين والدائن
 */
export function calculateEntryTotals(lines: { debit_amount: number; credit_amount: number }[]): {
    totalDebit: number;
    totalCredit: number;
} {
    return {
        totalDebit: lines.reduce((sum, l) => sum + l.debit_amount, 0),
        totalCredit: lines.reduce((sum, l) => sum + l.credit_amount, 0)
    };
}
