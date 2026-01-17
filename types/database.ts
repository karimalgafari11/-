/**
 * Database Types - أنواع قاعدة البيانات
 * مطابقة لـ schema_v2 في Supabase
 */

// ========================================
// ENUMS
// ========================================

export type AccountType =
    | 'asset'
    | 'liability'
    | 'equity'
    | 'revenue'
    | 'expense'
    | 'contra_asset'
    | 'contra_liability';

export type EntryStatus =
    | 'draft'
    | 'pending'
    | 'approved'
    | 'posted'
    | 'voided';

export type PeriodStatus =
    | 'open'
    | 'closed'
    | 'locked';

export type DocumentStatus =
    | 'draft'
    | 'confirmed'
    | 'completed'
    | 'cancelled'
    | 'returned';

export type StockMovementType =
    | 'purchase'
    | 'sale'
    | 'purchase_return'
    | 'sale_return'
    | 'adjustment_in'
    | 'adjustment_out'
    | 'transfer_in'
    | 'transfer_out'
    | 'opening_balance'
    | 'damage'
    | 'expired';

export type VoucherType = 'receipt' | 'payment';
export type PartyType = 'customer' | 'supplier' | 'other';

// ========================================
// PROFILES
// ========================================

export interface Profile {
    id: string;
    email: string;
    full_name: string;
    full_name_en?: string;
    phone?: string;
    avatar_url?: string;
    preferred_language: 'ar' | 'en';
    timezone: string;
    is_active: boolean;
    email_verified_at?: string;
    phone_verified_at?: string;
    last_login_at?: string;
    last_active_at?: string;
    login_count: number;
    deleted_at?: string;
    created_at: string;
    updated_at: string;
}

// ========================================
// ORGANIZATIONS
// ========================================

export interface Organization {
    id: string;
    name: string;
    name_en?: string;
    legal_name?: string;
    tax_number?: string;
    commercial_register?: string;
    logo_url?: string;
    owner_id: string;
    default_currency: string;
    fiscal_year_start: string;
    timezone: string;
    is_active: boolean;
    subscription_plan: string;
    subscription_expires_at?: string;
    deleted_at?: string;
    created_at: string;
    updated_at: string;
}

// ========================================
// BRANCHES
// ========================================

export interface Branch {
    id: string;
    organization_id: string;
    name: string;
    name_en?: string;
    code: string;
    address?: string;
    city?: string;
    country: string;
    postal_code?: string;
    phone?: string;
    email?: string;
    manager_id?: string;
    is_main: boolean;
    is_active: boolean;
    deleted_at?: string;
    created_at: string;
    updated_at: string;
}

// ========================================
// FISCAL PERIODS
// ========================================

export interface FiscalPeriod {
    id: string;
    organization_id: string;
    name: string;
    code: string;
    fiscal_year: number;
    period_number: number;
    start_date: string;
    end_date: string;
    status: PeriodStatus;
    closed_at?: string;
    closed_by?: string;
    created_at: string;
    updated_at: string;
}

// ========================================
// ACCOUNTS (Chart of Accounts)
// ========================================

export interface Account {
    id: string;
    organization_id: string;
    parent_id?: string;
    level: number;
    path?: string;
    code: string;
    name: string;
    name_en?: string;
    description?: string;
    account_type: AccountType;
    is_header: boolean;
    is_system: boolean;
    currency: string;
    is_active: boolean;
    allow_manual_entry: boolean;
    current_balance: number;
    balance_updated_at?: string;
    deleted_at?: string;
    created_at: string;
    updated_at: string;
}

// ========================================
// JOURNAL ENTRIES
// ========================================

export interface JournalEntry {
    id: string;
    organization_id: string;
    branch_id: string;
    fiscal_period_id: string;
    entry_number: string;
    reference_number?: string;
    entry_date: string;
    description: string;
    notes?: string;
    source_type?: string;
    source_id?: string;
    status: EntryStatus;
    approved_at?: string;
    approved_by?: string;
    posted_at?: string;
    posted_by?: string;
    voided_at?: string;
    voided_by?: string;
    void_reason?: string;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface JournalEntryLine {
    id: string;
    journal_entry_id: string;
    account_id: string;
    debit_amount: number;
    credit_amount: number;
    currency: string;
    exchange_rate: number;
    debit_amount_base: number;
    credit_amount_base: number;
    description?: string;
    cost_center_id?: string;
    line_order: number;
    created_at: string;
}

// ========================================
// CATEGORIES
// ========================================

export interface Category {
    id: string;
    organization_id: string;
    parent_id?: string;
    name: string;
    name_en?: string;
    code?: string;
    description?: string;
    sort_order: number;
    is_active: boolean;
    deleted_at?: string;
    created_at: string;
    updated_at: string;
}

// ========================================
// PRODUCTS
// ========================================

export interface Product {
    id: string;
    organization_id: string;
    category_id?: string;
    name: string;
    name_en?: string;
    sku: string;
    barcode?: string;
    description?: string;
    unit: string;
    unit_en?: string;
    cost_price: number;
    sale_price: number;
    min_sale_price: number;
    tax_rate: number;
    is_taxable: boolean;
    track_inventory: boolean;
    min_stock_level: number;
    max_stock_level?: number;
    reorder_point: number;
    is_active: boolean;
    is_service: boolean;
    image_url?: string;
    deleted_at?: string;
    created_at: string;
    updated_at: string;
}

export interface ProductStock {
    id: string;
    organization_id: string;
    branch_id: string;
    product_id: string;
    quantity: number;
    reserved_quantity: number;
    available_quantity: number;
    average_cost: number;
    last_cost: number;
    last_movement_at?: string;
    last_count_at?: string;
    created_at: string;
    updated_at: string;
}

// ========================================
// CUSTOMERS
// ========================================

export interface Customer {
    id: string;
    organization_id: string;
    branch_id?: string;
    code?: string;
    name: string;
    name_en?: string;
    phone?: string;
    phone2?: string;
    email?: string;
    address?: string;
    city?: string;
    country: string;
    tax_number?: string;
    credit_limit: number;
    payment_terms: number;
    account_id?: string;
    is_active: boolean;
    deleted_at?: string;
    created_at: string;
    updated_at: string;
}

// ========================================
// SUPPLIERS
// ========================================

export interface Supplier {
    id: string;
    organization_id: string;
    branch_id?: string;
    code?: string;
    name: string;
    name_en?: string;
    phone?: string;
    phone2?: string;
    email?: string;
    contact_person?: string;
    address?: string;
    city?: string;
    country: string;
    tax_number?: string;
    payment_terms: number;
    account_id?: string;
    is_active: boolean;
    deleted_at?: string;
    created_at: string;
    updated_at: string;
}

// ========================================
// SALES
// ========================================

export interface Sale {
    id: string;
    organization_id: string;
    branch_id: string;
    fiscal_period_id?: string;
    invoice_number: string;
    reference_number?: string;
    customer_id?: string;
    customer_name?: string;
    invoice_date: string;
    due_date?: string;
    subtotal: number;
    discount_amount: number;
    discount_percent: number;
    tax_amount: number;
    total_amount: number;
    payment_method: string;
    paid_amount: number;
    remaining_amount: number;
    status: DocumentStatus;
    journal_entry_id?: string;
    notes?: string;
    internal_notes?: string;
    created_by: string;
    deleted_at?: string;
    created_at: string;
    updated_at: string;
    items?: SaleItem[];
}

export interface SaleItem {
    id: string;
    sale_id: string;
    product_id?: string;
    product_name: string;
    product_sku?: string;
    quantity: number;
    unit: string;
    unit_price: number;
    cost_price: number;
    discount_amount: number;
    discount_percent: number;
    tax_rate: number;
    tax_amount: number;
    line_total: number;
    line_order: number;
    notes?: string;
    created_at: string;
}

// ========================================
// PURCHASES
// ========================================

export interface Purchase {
    id: string;
    organization_id: string;
    branch_id: string;
    fiscal_period_id?: string;
    invoice_number?: string;
    supplier_invoice_number?: string;
    supplier_id?: string;
    supplier_name?: string;
    invoice_date: string;
    due_date?: string;
    subtotal: number;
    discount_amount: number;
    discount_percent: number;
    tax_amount: number;
    total_amount: number;
    payment_method: string;
    paid_amount: number;
    remaining_amount: number;
    status: DocumentStatus;
    journal_entry_id?: string;
    notes?: string;
    created_by: string;
    deleted_at?: string;
    created_at: string;
    updated_at: string;
    items?: PurchaseItem[];
}

export interface PurchaseItem {
    id: string;
    purchase_id: string;
    product_id?: string;
    product_name: string;
    product_sku?: string;
    quantity: number;
    received_quantity: number;
    unit: string;
    unit_price: number;
    discount_amount: number;
    discount_percent: number;
    tax_rate: number;
    tax_amount: number;
    line_total: number;
    line_order: number;
    notes?: string;
    created_at: string;
}

// ========================================
// STOCK MOVEMENTS
// ========================================

export interface StockMovement {
    id: string;
    organization_id: string;
    branch_id: string;
    product_id: string;
    movement_type: StockMovementType;
    source_type?: string;
    source_id?: string;
    source_number?: string;
    quantity: number;
    unit_cost: number;
    total_cost: number;
    balance_after?: number;
    movement_date: string;
    notes?: string;
    created_by?: string;
    created_at: string;
}

// ========================================
// EXPENSES
// ========================================

export interface Expense {
    id: string;
    organization_id: string;
    branch_id: string;
    fiscal_period_id?: string;
    expense_number?: string;
    expense_account_id?: string;
    description: string;
    amount: number;
    tax_amount: number;
    payment_method: string;
    payment_account_id?: string;
    expense_date: string;
    beneficiary_name?: string;
    beneficiary_type?: string;
    beneficiary_id?: string;
    attachment_url?: string;
    status: DocumentStatus;
    journal_entry_id?: string;
    notes?: string;
    created_by: string;
    deleted_at?: string;
    created_at: string;
    updated_at: string;
}

// ========================================
// VOUCHERS
// ========================================

export interface Voucher {
    id: string;
    organization_id: string;
    branch_id: string;
    fiscal_period_id?: string;
    voucher_type: VoucherType;
    voucher_number: string;
    party_type?: PartyType;
    party_id?: string;
    party_name?: string;
    amount: number;
    payment_method: string;
    payment_account_id?: string;
    reference_type?: string;
    reference_id?: string;
    reference_number?: string;
    voucher_date: string;
    status: DocumentStatus;
    journal_entry_id?: string;
    description?: string;
    notes?: string;
    created_by: string;
    deleted_at?: string;
    created_at: string;
    updated_at: string;
}

// ========================================
// CURRENCIES
// ========================================

export interface Currency {
    code: string;
    name: string;
    name_en: string;
    symbol: string;
    decimal_places: number;
    is_active: boolean;
}

export interface ExchangeRate {
    id: string;
    organization_id?: string;
    from_currency: string;
    to_currency: string;
    rate: number;
    effective_date: string;
    created_at: string;
}

// ========================================
// ORGANIZATION MEMBERS
// ========================================

export interface OrganizationMember {
    id: string;
    user_id: string;
    organization_id: string;
    branch_id?: string;
    role: string;
    custom_permissions: string[];
    is_owner: boolean;
    is_active: boolean;
    joined_at: string;
    last_active_at?: string;
    deleted_at?: string;
    created_at: string;
    updated_at: string;
}

// ========================================
// HELPERS
// ========================================

// نوع للإدخال (بدون الحقول التلقائية)
export type InsertType<T> = Omit<T, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
};

// نوع للتحديث
export type UpdateType<T> = Partial<Omit<T, 'id' | 'created_at' | 'organization_id'>>;
