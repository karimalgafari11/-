/**
 * Supabase Types - الأنواع المتوافقة مع Supabase Schema
 * هذا الملف يعكس الجداول الفعلية في Supabase
 */

// ========================================
// COMPANIES
// ========================================

export interface Company {
    id: string;
    name: string;
    name_en?: string;
    phone?: string;
    email?: string;
    address?: string;
    tax_number?: string;
    logo_url?: string;
    created_at: string;
    updated_at: string;
}

export interface CompanySettings {
    id: string;
    company_id: string;
    currency: string;
    tax_enabled: boolean;
    tax_rate: number;
    invoice_prefix: string;
    invoice_next_number: number;
    fiscal_year_start: string;
    settings_json: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

// ========================================
// PROFILES
// ========================================

export interface Profile {
    id: string;
    company_id?: string;
    name: string;
    email?: string;
    phone?: string;
    avatar_url?: string;
    role: 'manager' | 'accountant' | 'employee';
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// ========================================
// ACCOUNTS (Chart of Accounts)
// ========================================

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export interface Account {
    id: string;
    company_id: string;
    code: string;
    name: string;
    name_en?: string;
    account_type: AccountType;
    parent_id?: string;
    is_active: boolean;
    balance: number;
    created_at: string;
}

// ========================================
// JOURNAL ENTRIES
// ========================================

export type EntryStatus = 'draft' | 'posted' | 'cancelled';

export interface JournalEntry {
    id: string;
    company_id: string;
    entry_number: string;
    entry_date: string;
    description?: string;
    reference_type?: string;
    reference_id?: string;
    source_type?: string;
    source_id?: string;
    total_debit: number;
    total_credit: number;
    status: EntryStatus;
    posted_by?: string;
    posted_at?: string;
    created_by?: string;
    created_at: string;
}

export interface JournalEntryLine {
    id: string;
    company_id: string;  // Required in Supabase
    journal_entry_id: string;
    account_id: string;
    description?: string;
    debit: number;
    credit: number;
    partner_type?: 'customer' | 'supplier' | 'employee';
    partner_id?: string;
    currency?: string;
    exchange_rate?: number;
    created_at: string;
}

// ========================================
// PRODUCTS
// ========================================

export interface Product {
    id: string;
    company_id: string;
    name: string;
    name_en?: string;
    sku?: string;
    barcode?: string;
    category?: string;
    unit: string;
    price: number;
    cost: number;
    quantity: number;
    min_quantity: number;
    description?: string;
    image_url?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// ========================================
// CUSTOMERS
// ========================================

export interface Customer {
    id: string;
    company_id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    category?: string;
    balance: number;
    notes?: string;
    is_active: boolean;
    is_general: boolean;
    cash_only: boolean;
    created_at: string;
    updated_at: string;
}

// ========================================
// SUPPLIERS
// ========================================

export interface Supplier {
    id: string;
    company_id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    category?: string;
    balance: number;
    notes?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// ========================================
// SALES
// ========================================

export type DocumentStatus = 'draft' | 'pending' | 'paid' | 'partial' | 'cancelled' | 'overdue' | 'completed';

export interface Sale {
    id: string;
    company_id: string;
    user_id?: string;
    customer_id?: string;
    invoice_number?: string;
    total: number;
    discount: number;
    tax: number;
    net_total: number;
    paid: number;
    payment_method: string;
    status: string;
    notes?: string;
    items: SaleItem[];
    created_at: string;
    updated_at: string;
}

export interface SaleItem {
    product_id?: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    discount?: number;
    tax?: number;
    total: number;
}

// ========================================
// PURCHASES
// ========================================

export interface Purchase {
    id: string;
    company_id: string;
    user_id?: string;
    supplier_id?: string;
    invoice_number?: string;
    invoice_date?: string;
    total: number;
    total_amount?: number;
    subtotal?: number;
    discount: number;
    discount_amount?: number;
    tax: number;
    tax_amount?: number;
    net_total: number;
    paid: number;
    payment_method: string;
    status: string;
    notes?: string;
    items: PurchaseItem[];
    created_at: string;
    updated_at: string;
}

export interface PurchaseItem {
    product_id?: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    discount?: number;
    tax?: number;
    total: number;
}

// ========================================
// EXPENSES
// ========================================

export interface Expense {
    id: string;
    company_id: string;
    user_id?: string;
    expense_number?: string;
    expense_account_id?: string;
    category?: string;
    description: string;
    amount: number;
    expense_date: string;
    payment_method: string;
    status: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

// ========================================
// VOUCHERS
// ========================================

export type VoucherType = 'receipt' | 'payment';

export interface Voucher {
    id: string;
    company_id: string;
    voucher_type: VoucherType;
    voucher_number: string;
    amount: number;
    voucher_date: string;
    customer_id?: string;
    supplier_id?: string;
    payment_account_id?: string;
    payment_method: string;
    reference_type?: string;
    reference_id?: string;
    description?: string;
    status: string;
    user_id?: string;
    created_at: string;
}

// ========================================
// WAREHOUSES
// ========================================

export interface Warehouse {
    id: string;
    company_id: string;
    name: string;
    name_en?: string;
    code?: string;
    address?: string;
    phone?: string;
    manager_id?: string;
    is_main: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// ========================================
// INVENTORY STOCK
// ========================================

export interface InventoryStock {
    id: string;
    company_id: string;
    product_id: string;
    warehouse_id: string;
    quantity: number;
    min_quantity: number;
    last_updated: string;
}

// ========================================
// STOCK MOVEMENTS
// ========================================

export type MovementType = 'in' | 'out' | 'transfer' | 'adjustment';

export interface StockMovement {
    id: string;
    company_id: string;
    product_id: string;
    warehouse_id?: string;
    movement_type: MovementType;
    quantity: number;
    reference_type?: string;
    reference_id?: string;
    notes?: string;
    user_id?: string;
    created_at: string;
}

// ========================================
// INVOICES
// ========================================

export type InvoiceType = 'sales' | 'purchase' | 'quote' | 'return';
export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'partial' | 'cancelled' | 'overdue';

export interface Invoice {
    id: string;
    company_id: string;
    invoice_type: InvoiceType;
    invoice_number: string;
    reference_id?: string;
    customer_id?: string;
    supplier_id?: string;
    issue_date: string;
    due_date?: string;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paid: number;
    status: InvoiceStatus;
    notes?: string;
    items: unknown[];
    created_by?: string;
    created_at: string;
    updated_at: string;
}

// ========================================
// RETURNS
// ========================================

export type ReturnType = 'sales' | 'purchase';
export type ReturnStatus = 'pending' | 'approved' | 'completed' | 'cancelled';

export interface Return {
    id: string;
    company_id: string;
    return_type: ReturnType;
    return_number: string;
    original_invoice_id?: string;
    customer_id?: string;
    supplier_id?: string;
    return_date: string;
    total: number;
    reason?: string;
    status: ReturnStatus;
    items: unknown[];
    user_id?: string;
    created_at: string;
}

// ========================================
// ACTIVITY LOGS
// ========================================

export interface ActivityLog {
    id: string;
    company_id: string;
    user_id?: string;
    user_name?: string;
    action: string;
    entity_type?: string;
    entity_id?: string;
    entity_name?: string;
    old_data?: Record<string, unknown>;
    new_data?: Record<string, unknown>;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
}

// ========================================
// NOTIFICATIONS
// ========================================

export type NotificationType = 'info' | 'warning' | 'success' | 'error';

export interface Notification {
    id: string;
    company_id: string;
    user_id: string;
    title: string;
    message: string;
    type: NotificationType;
    is_read: boolean;
    link?: string;
    created_at: string;
}

// ========================================
// CURRENCIES & EXCHANGE RATES
// ========================================

export interface Currency {
    code: string;
    name_ar: string;
    name_en: string;
    symbol?: string;
    decimal_places: number;
    is_base: boolean;
    is_active: boolean;
    created_at: string;
}

export interface ExchangeRate {
    id: string;
    company_id: string;
    from_currency: string;
    to_currency: string;
    rate: number;
    valid_from: string;
    valid_to?: string;
    created_at: string;
}

// ========================================
// BRANCHES
// ========================================

export interface Branch {
    id: string;
    company_id: string;
    name: string;
    address?: string;
    phone?: string;
    is_active: boolean;
    created_at: string;
}

// ========================================
// FISCAL PERIODS
// ========================================

export type FiscalPeriodStatus = 'open' | 'closed' | 'locked';

export interface FiscalPeriod {
    id: string;
    company_id: string;
    name: string;
    start_date: string;
    end_date: string;
    status: FiscalPeriodStatus;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// ========================================
// FINANCIAL REPORTS (VIEWS)
// ========================================

export interface TrialBalanceEntry {
    account_id: string;
    code: string;
    name: string;
    type: string;
    company_id: string;
    total_debit: number;
    total_credit: number;
    net_balance: number;
    balance_type: 'Debit' | 'Credit' | '-';
}

export interface IncomeStatement {
    company_id: string;
    total_revenue: number;
    total_expenses: number;
    net_profit: number;
}

export interface BalanceSheet {
    company_id: string;
    total_assets: number;
    total_liabilities: number;
    total_equity: number;
    current_earnings: number;
}

export interface PartnerBalance {
    partner_id: string;
    partner_name: string;
    company_id: string;
    current_balance: number;
    last_transaction_date: string;
}

// ========================================
// HELPERS
// ========================================

export type InsertType<T> = Omit<T, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
};

export type UpdateType<T> = Partial<Omit<T, 'id' | 'created_at' | 'company_id'>>;

