/**
 * Supabase Database Types - V6 (Production Ready)
 * متوافق مع Full Schema V6
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            tenants: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    subscription_plan: string | null
                    status: 'active' | 'inactive' | 'suspended' | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    subscription_plan?: string | null
                    status?: 'active' | 'inactive' | 'suspended' | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    subscription_plan?: string | null
                    status?: 'active' | 'inactive' | 'suspended' | null
                    created_at?: string
                    updated_at?: string
                }
            }
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    phone: string | null
                    avatar_url: string | null
                    status: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    phone?: string | null
                    avatar_url?: string | null
                    status?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    phone?: string | null
                    avatar_url?: string | null
                    status?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            currencies: {
                Row: {
                    code: string
                    name: string
                    name_ar: string | null
                    symbol: string | null
                    exchange_rate: number | null
                    is_base: boolean | null
                    created_at: string
                }
                Insert: {
                    code: string
                    name: string
                    name_ar?: string | null
                    symbol?: string | null
                    exchange_rate?: number | null
                    is_base?: boolean | null
                    created_at?: string
                }
                Update: {
                    code?: string
                    name?: string
                    name_ar?: string | null
                    symbol?: string | null
                    exchange_rate?: number | null
                    is_base?: boolean | null
                    created_at?: string
                }
            }
            companies: {
                Row: {
                    id: string
                    tenant_id: string | null
                    name: string
                    name_en: string | null
                    email: string | null
                    phone: string | null
                    address: string | null
                    tax_number: string | null
                    commercial_register: string | null
                    logo_url: string | null
                    base_currency_code: string | null
                    settings: Json | null
                    is_active: boolean | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    tenant_id?: string | null
                    name: string
                    name_en?: string | null
                    email?: string | null
                    phone?: string | null
                    address?: string | null
                    tax_number?: string | null
                    commercial_register?: string | null
                    logo_url?: string | null
                    base_currency_code?: string | null
                    settings?: Json | null
                    is_active?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    tenant_id?: string | null
                    name?: string
                    name_en?: string | null
                    email?: string | null
                    phone?: string | null
                    address?: string | null
                    tax_number?: string | null
                    commercial_register?: string | null
                    logo_url?: string | null
                    base_currency_code?: string | null
                    settings?: Json | null
                    is_active?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
            }
            branches: {
                Row: {
                    id: string
                    company_id: string | null
                    name: string
                    code: string | null
                    address: string | null
                    is_main: boolean | null
                    is_active: boolean | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    name: string
                    code?: string | null
                    address?: string | null
                    is_main?: boolean | null
                    is_active?: boolean | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    name?: string
                    code?: string | null
                    address?: string | null
                    is_main?: boolean | null
                    is_active?: boolean | null
                    created_at?: string
                }
            }
            cost_centers: {
                Row: {
                    id: string
                    company_id: string | null
                    name: string
                    code: string | null
                    parent_id: string | null
                    is_active: boolean | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    name: string
                    code?: string | null
                    parent_id?: string | null
                    is_active?: boolean | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    name?: string
                    code?: string | null
                    parent_id?: string | null
                    is_active?: boolean | null
                    created_at?: string
                }
            }
            roles: {
                Row: {
                    id: string
                    company_id: string | null
                    name: string
                    name_ar: string | null
                    description: string | null
                    permissions: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    name: string
                    name_ar?: string | null
                    description?: string | null
                    permissions?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    name?: string
                    name_ar?: string | null
                    description?: string | null
                    permissions?: Json | null
                    created_at?: string
                }
            }
            user_companies: {
                Row: {
                    id: string
                    user_id: string | null
                    company_id: string | null
                    role_id: string | null
                    is_owner: boolean | null
                    is_default: boolean | null
                    appointed_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    company_id?: string | null
                    role_id?: string | null
                    is_owner?: boolean | null
                    is_default?: boolean | null
                    appointed_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    company_id?: string | null
                    role_id?: string | null
                    is_owner?: boolean | null
                    is_default?: boolean | null
                    appointed_at?: string
                }
            }
            activity_logs: {
                Row: {
                    id: string
                    company_id: string | null
                    user_id: string | null
                    action: string
                    entity_type: string
                    entity_id: string | null
                    details: Json | null
                    ip_address: string | null
                    user_agent: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    user_id?: string | null
                    action: string
                    entity_type: string
                    entity_id?: string | null
                    details?: Json | null
                    ip_address?: string | null
                    user_agent?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    user_id?: string | null
                    action?: string
                    entity_type?: string
                    entity_id?: string | null
                    details?: Json | null
                    ip_address?: string | null
                    user_agent?: string | null
                    created_at?: string
                }
            }
            fiscal_years: {
                Row: {
                    id: string
                    company_id: string | null
                    name: string
                    start_date: string
                    end_date: string
                    status: string | null
                    is_active: boolean | null
                    created_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    name: string
                    start_date: string
                    end_date: string
                    status?: string | null
                    is_active?: boolean | null
                    created_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    name?: string
                    start_date?: string
                    end_date?: string
                    status?: string | null
                    is_active?: boolean | null
                    created_by?: string | null
                    created_at?: string
                }
            }
            exchange_rates: {
                Row: {
                    id: string
                    company_id: string | null
                    from_currency: string | null
                    to_currency: string | null
                    rate: number
                    effective_date: string | null
                    created_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    from_currency?: string | null
                    to_currency?: string | null
                    rate: number
                    effective_date?: string | null
                    created_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    from_currency?: string | null
                    to_currency?: string | null
                    rate?: number
                    effective_date?: string | null
                    created_by?: string | null
                    created_at?: string
                }
            }
            tax_codes: {
                Row: {
                    id: string
                    company_id: string | null
                    name: string
                    code: string | null
                    rate: number
                    description: string | null
                    is_active: boolean | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    name: string
                    code?: string | null
                    rate?: number
                    description?: string | null
                    is_active?: boolean | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    name?: string
                    code?: string | null
                    rate?: number
                    description?: string | null
                    is_active?: boolean | null
                    created_at?: string
                }
            }
            payment_methods: {
                Row: {
                    id: string
                    company_id: string | null
                    name: string
                    name_en: string | null
                    type: 'cash' | 'bank' | 'card' | 'check' | 'other' | null
                    details: Json | null
                    is_active: boolean | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    name: string
                    name_en?: string | null
                    type?: 'cash' | 'bank' | 'card' | 'check' | 'other' | null
                    details?: Json | null
                    is_active?: boolean | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    name?: string
                    name_en?: string | null
                    type?: 'cash' | 'bank' | 'card' | 'check' | 'other' | null
                    details?: Json | null
                    is_active?: boolean | null
                    created_at?: string
                }
            }
            account_types: {
                Row: {
                    id: string
                    code: string
                    name: string
                    name_ar: string | null
                    normal_balance: 'debit' | 'credit' | null
                    report_type: 'bs' | 'pl' | 'cf' | null
                    description: string | null
                }
                Insert: {
                    id?: string
                    code: string
                    name: string
                    name_ar?: string | null
                    normal_balance?: 'debit' | 'credit' | null
                    report_type?: 'bs' | 'pl' | 'cf' | null
                    description?: string | null
                }
                Update: {
                    id?: string
                    code?: string
                    name?: string
                    name_ar?: string | null
                    normal_balance?: 'debit' | 'credit' | null
                    report_type?: 'bs' | 'pl' | 'cf' | null
                    description?: string | null
                }
            }
            accounts: {
                Row: {
                    id: string
                    company_id: string | null
                    code: string
                    name: string
                    name_en: string | null
                    type_id: string | null
                    parent_id: string | null
                    level: number | null
                    is_header: boolean | null
                    allow_reconciliation: boolean | null
                    currency_code: string | null
                    current_balance: number | null
                    is_active: boolean | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    code: string
                    name: string
                    name_en?: string | null
                    type_id?: string | null
                    parent_id?: string | null
                    level?: number | null
                    is_header?: boolean | null
                    allow_reconciliation?: boolean | null
                    currency_code?: string | null
                    current_balance?: number | null
                    is_active?: boolean | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    code?: string
                    name?: string
                    name_en?: string | null
                    type_id?: string | null
                    parent_id?: string | null
                    level?: number | null
                    is_header?: boolean | null
                    allow_reconciliation?: boolean | null
                    currency_code?: string | null
                    current_balance?: number | null
                    is_active?: boolean | null
                    created_at?: string
                }
            }
            journal_entries: {
                Row: {
                    id: string
                    company_id: string | null
                    branch_id: string | null
                    fiscal_year_id: string | null
                    entry_number: string
                    entry_date: string | null
                    description: string | null
                    reference_type: string | null
                    reference_id: string | null
                    total_debit: number | null
                    total_credit: number | null
                    status: 'draft' | 'posted' | 'reversed' | 'cancelled' | null
                    posted_at: string | null
                    posted_by: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    branch_id?: string | null
                    fiscal_year_id?: string | null
                    entry_number: string
                    entry_date?: string | null
                    description?: string | null
                    reference_type?: string | null
                    reference_id?: string | null
                    total_debit?: number | null
                    total_credit?: number | null
                    status?: 'draft' | 'posted' | 'reversed' | 'cancelled' | null
                    posted_at?: string | null
                    posted_by?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    branch_id?: string | null
                    fiscal_year_id?: string | null
                    entry_number?: string
                    entry_date?: string | null
                    description?: string | null
                    reference_type?: string | null
                    reference_id?: string | null
                    total_debit?: number | null
                    total_credit?: number | null
                    status?: 'draft' | 'posted' | 'reversed' | 'cancelled' | null
                    posted_at?: string | null
                    posted_by?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            journal_entry_lines: {
                Row: {
                    id: string
                    journal_entry_id: string | null
                    company_id: string | null
                    account_id: string | null
                    description: string | null
                    debit: number | null
                    credit: number | null
                    currency_code: string | null
                    exchange_rate: number | null
                    cost_center_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    journal_entry_id?: string | null
                    company_id?: string | null
                    account_id?: string | null
                    description?: string | null
                    debit?: number | null
                    credit?: number | null
                    currency_code?: string | null
                    exchange_rate?: number | null
                    cost_center_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    journal_entry_id?: string | null
                    company_id?: string | null
                    account_id?: string | null
                    description?: string | null
                    debit?: number | null
                    credit?: number | null
                    currency_code?: string | null
                    exchange_rate?: number | null
                    cost_center_id?: string | null
                    created_at?: string
                }
            }
            account_balances: {
                Row: {
                    id: string
                    company_id: string | null
                    account_id: string | null
                    fiscal_year_id: string | null
                    period: string | null
                    opening_balance: number | null
                    debit_total: number | null
                    credit_total: number | null
                    closing_balance: number | null
                    updated_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    account_id?: string | null
                    fiscal_year_id?: string | null
                    period?: string | null
                    opening_balance?: number | null
                    debit_total?: number | null
                    credit_total?: number | null
                    closing_balance?: number | null
                    updated_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    account_id?: string | null
                    fiscal_year_id?: string | null
                    period?: string | null
                    opening_balance?: number | null
                    debit_total?: number | null
                    credit_total?: number | null
                    closing_balance?: number | null
                    updated_at?: string
                }
            }
            units: {
                Row: {
                    id: string
                    company_id: string | null
                    name: string
                    name_en: string | null
                    code: string | null
                    conversion_factor: number | null
                    base_unit_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    name: string
                    name_en?: string | null
                    code?: string | null
                    conversion_factor?: number | null
                    base_unit_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    name?: string
                    name_en?: string | null
                    code?: string | null
                    conversion_factor?: number | null
                    base_unit_id?: string | null
                    created_at?: string
                }
            }
            warehouses: {
                Row: {
                    id: string
                    company_id: string | null
                    name: string
                    address: string | null
                    manager_id: string | null
                    is_main: boolean | null
                    is_active: boolean | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    name: string
                    address?: string | null
                    manager_id?: string | null
                    is_main?: boolean | null
                    is_active?: boolean | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    name?: string
                    address?: string | null
                    manager_id?: string | null
                    is_main?: boolean | null
                    is_active?: boolean | null
                    created_at?: string
                }
            }
            storage_locations: {
                Row: {
                    id: string
                    warehouse_id: string | null
                    name: string
                    code: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    warehouse_id?: string | null
                    name: string
                    code?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    warehouse_id?: string | null
                    name?: string
                    code?: string | null
                    created_at?: string
                }
            }
            product_categories: {
                Row: {
                    id: string
                    company_id: string | null
                    name: string
                    parent_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    name: string
                    parent_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    name?: string
                    parent_id?: string | null
                    created_at?: string
                }
            }
            products: {
                Row: {
                    id: string
                    company_id: string | null
                    name: string
                    name_en: string | null
                    sku: string | null
                    barcode: string | null
                    item_number: string | null
                    manufacturer_code: string | null
                    reorder_quantity: number | null
                    category: string | null
                    category_id: string | null
                    unit: string | null
                    unit_id: string | null
                    cost: number | null
                    price: number | null
                    quantity: number | null
                    min_quantity: number | null
                    description: string | null
                    manufacturer: string | null
                    track_stock: boolean | null
                    allow_negative_stock: boolean | null
                    image_url: string | null
                    is_active: boolean | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    name: string
                    name_en?: string | null
                    sku?: string | null
                    barcode?: string | null
                    item_number?: string | null
                    manufacturer_code?: string | null
                    reorder_quantity?: number | null
                    category?: string | null
                    category_id?: string | null
                    unit?: string | null
                    unit_id?: string | null
                    cost?: number | null
                    price?: number | null
                    quantity?: number | null
                    min_quantity?: number | null
                    description?: string | null
                    manufacturer?: string | null
                    track_stock?: boolean | null
                    allow_negative_stock?: boolean | null
                    image_url?: string | null
                    is_active?: boolean | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    name?: string
                    name_en?: string | null
                    sku?: string | null
                    barcode?: string | null
                    item_number?: string | null
                    manufacturer_code?: string | null
                    reorder_quantity?: number | null
                    category?: string | null
                    category_id?: string | null
                    unit?: string | null
                    unit_id?: string | null
                    cost?: number | null
                    price?: number | null
                    quantity?: number | null
                    min_quantity?: number | null
                    description?: string | null
                    manufacturer?: string | null
                    track_stock?: boolean | null
                    allow_negative_stock?: boolean | null
                    image_url?: string | null
                    is_active?: boolean | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            product_variants: {
                Row: {
                    id: string
                    product_id: string | null
                    sku: string | null
                    name: string | null
                    price_adjustment: number | null
                    attributes: Json | null
                    is_active: boolean | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    product_id?: string | null
                    sku?: string | null
                    name?: string | null
                    price_adjustment?: number | null
                    attributes?: Json | null
                    is_active?: boolean | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    product_id?: string | null
                    sku?: string | null
                    name?: string | null
                    price_adjustment?: number | null
                    attributes?: Json | null
                    is_active?: boolean | null
                    created_at?: string
                }
            }
            inventory_transactions: {
                Row: {
                    id: string
                    company_id: string | null
                    warehouse_id: string | null
                    location_id: string | null
                    product_id: string | null
                    variant_id: string | null
                    transaction_type: 'in' | 'out' | 'transfer' | 'adjustment' | 'count' | 'production' | null
                    quantity: number
                    unit_cost: number | null
                    total_cost: number | null
                    reference_type: string | null
                    reference_id: string | null
                    balance_before: number | null
                    balance_after: number | null
                    expiry_date: string | null
                    batch_number: string | null
                    notes: string | null
                    created_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    warehouse_id?: string | null
                    location_id?: string | null
                    product_id?: string | null
                    variant_id?: string | null
                    transaction_type?: 'in' | 'out' | 'transfer' | 'adjustment' | 'count' | 'production' | null
                    quantity: number
                    unit_cost?: number | null
                    total_cost?: number | null
                    reference_type?: string | null
                    reference_id?: string | null
                    balance_before?: number | null
                    balance_after?: number | null
                    expiry_date?: string | null
                    batch_number?: string | null
                    notes?: string | null
                    created_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    warehouse_id?: string | null
                    location_id?: string | null
                    product_id?: string | null
                    variant_id?: string | null
                    transaction_type?: 'in' | 'out' | 'transfer' | 'adjustment' | 'count' | 'production' | null
                    quantity?: number
                    unit_cost?: number | null
                    total_cost?: number | null
                    reference_type?: string | null
                    reference_id?: string | null
                    balance_before?: number | null
                    balance_after?: number | null
                    expiry_date?: string | null
                    batch_number?: string | null
                    notes?: string | null
                    created_by?: string | null
                    created_at?: string
                }
            }
            transfer_orders: {
                Row: {
                    id: string
                    company_id: string | null
                    order_number: string
                    from_warehouse_id: string | null
                    to_warehouse_id: string | null
                    date: string | null
                    status: 'draft' | 'pending' | 'approved' | 'shipped' | 'received' | 'cancelled' | null
                    notes: string | null
                    created_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    order_number: string
                    from_warehouse_id?: string | null
                    to_warehouse_id?: string | null
                    date?: string | null
                    status?: 'draft' | 'pending' | 'approved' | 'shipped' | 'received' | 'cancelled' | null
                    notes?: string | null
                    created_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    order_number?: string
                    from_warehouse_id?: string | null
                    to_warehouse_id?: string | null
                    date?: string | null
                    status?: 'draft' | 'pending' | 'approved' | 'shipped' | 'received' | 'cancelled' | null
                    notes?: string | null
                    created_by?: string | null
                    created_at?: string
                }
            }
            transfer_items: {
                Row: {
                    id: string
                    transfer_order_id: string | null
                    product_id: string | null
                    quantity: number
                    received_quantity: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    transfer_order_id?: string | null
                    product_id?: string | null
                    quantity: number
                    received_quantity?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    transfer_order_id?: string | null
                    product_id?: string | null
                    quantity?: number
                    received_quantity?: number | null
                    created_at?: string
                }
            }
            partners: {
                Row: {
                    id: string
                    company_id: string | null
                    type: 'customer' | 'supplier' | 'both' | null
                    name: string
                    code: string | null
                    contact_person: string | null
                    phone: string | null
                    email: string | null
                    website: string | null
                    tax_number: string | null
                    address: string | null
                    city: string | null
                    country: string | null
                    currency_code: string | null
                    credit_limit: number | null
                    payment_terms_days: number | null
                    opening_balance: number | null
                    current_balance: number | null
                    is_active: boolean | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    type?: 'customer' | 'supplier' | 'both' | null
                    name: string
                    code?: string | null
                    contact_person?: string | null
                    phone?: string | null
                    email?: string | null
                    website?: string | null
                    tax_number?: string | null
                    address?: string | null
                    city?: string | null
                    country?: string | null
                    currency_code?: string | null
                    credit_limit?: number | null
                    payment_terms_days?: number | null
                    opening_balance?: number | null
                    current_balance?: number | null
                    is_active?: boolean | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    type?: 'customer' | 'supplier' | 'both' | null
                    name?: string
                    code?: string | null
                    contact_person?: string | null
                    phone?: string | null
                    email?: string | null
                    website?: string | null
                    tax_number?: string | null
                    address?: string | null
                    city?: string | null
                    country?: string | null
                    currency_code?: string | null
                    credit_limit?: number | null
                    payment_terms_days?: number | null
                    opening_balance?: number | null
                    current_balance?: number | null
                    is_active?: boolean | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            document_templates: {
                Row: {
                    id: string
                    company_id: string | null
                    name: string
                    type: 'invoice' | 'quotation' | 'receipt' | 'po' | null
                    content_html: string | null
                    styles_css: string | null
                    is_default: boolean | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    name: string
                    type?: 'invoice' | 'quotation' | 'receipt' | 'po' | null
                    content_html?: string | null
                    styles_css?: string | null
                    is_default?: boolean | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    name?: string
                    type?: 'invoice' | 'quotation' | 'receipt' | 'po' | null
                    content_html?: string | null
                    styles_css?: string | null
                    is_default?: boolean | null
                    created_at?: string
                }
            }
            documents: {
                Row: {
                    id: string
                    company_id: string | null
                    type: 'invoice' | 'bill' | 'quote' | 'order' | 'return' | 'credit_note' | 'debit_note' | null
                    document_number: string
                    date: string | null
                    due_date: string | null
                    partner_id: string | null
                    warehouse_id: string | null
                    currency_code: string | null
                    exchange_rate: number | null
                    subtotal: number | null
                    tax_total: number | null
                    discount_total: number | null
                    shipping_cost: number | null
                    total_amount: number | null
                    paid_amount: number | null
                    remaining_amount: number | null
                    status: 'draft' | 'pending' | 'approved' | 'paid' | 'void' | 'cancelled' | null
                    notes: string | null
                    terms_conditions: string | null
                    generated_entry_id: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    type?: 'invoice' | 'bill' | 'quote' | 'order' | 'return' | 'credit_note' | 'debit_note' | null
                    document_number: string
                    date?: string | null
                    due_date?: string | null
                    partner_id?: string | null
                    warehouse_id?: string | null
                    currency_code?: string | null
                    exchange_rate?: number | null
                    subtotal?: number | null
                    tax_total?: number | null
                    discount_total?: number | null
                    shipping_cost?: number | null
                    total_amount?: number | null
                    paid_amount?: number | null
                    status?: 'draft' | 'pending' | 'approved' | 'paid' | 'void' | 'cancelled' | null
                    notes?: string | null
                    terms_conditions?: string | null
                    generated_entry_id?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    type?: 'invoice' | 'bill' | 'quote' | 'order' | 'return' | 'credit_note' | 'debit_note' | null
                    document_number?: string
                    date?: string | null
                    due_date?: string | null
                    partner_id?: string | null
                    warehouse_id?: string | null
                    currency_code?: string | null
                    exchange_rate?: number | null
                    subtotal?: number | null
                    tax_total?: number | null
                    discount_total?: number | null
                    shipping_cost?: number | null
                    total_amount?: number | null
                    paid_amount?: number | null
                    status?: 'draft' | 'pending' | 'approved' | 'paid' | 'void' | 'cancelled' | null
                    notes?: string | null
                    terms_conditions?: string | null
                    generated_entry_id?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            document_items: {
                Row: {
                    id: string
                    document_id: string | null
                    product_id: string | null
                    variant_id: string | null
                    description: string | null
                    quantity: number
                    unit_price: number
                    unit_cost: number | null
                    tax_id: string | null
                    tax_rate: number | null
                    tax_amount: number | null
                    discount_amount: number | null
                    total: number
                    warehouse_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    document_id?: string | null
                    product_id?: string | null
                    variant_id?: string | null
                    description?: string | null
                    quantity: number
                    unit_price: number
                    unit_cost?: number | null
                    tax_id?: string | null
                    tax_rate?: number | null
                    tax_amount?: number | null
                    discount_amount?: number | null
                    total: number
                    warehouse_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    document_id?: string | null
                    product_id?: string | null
                    variant_id?: string | null
                    description?: string | null
                    quantity?: number
                    unit_price?: number
                    unit_cost?: number | null
                    tax_id?: string | null
                    tax_rate?: number | null
                    tax_amount?: number | null
                    discount_amount?: number | null
                    total?: number
                    warehouse_id?: string | null
                    created_at?: string
                }
            }
            vouchers: {
                Row: {
                    id: string
                    company_id: string | null
                    voucher_number: string
                    type: 'receipt' | 'payment' | null
                    partner_id: string | null
                    amount: number
                    currency_code: string | null
                    exchange_rate: number | null
                    payment_method_id: string | null
                    date: string | null
                    description: string | null
                    reference_number: string | null
                    status: 'draft' | 'posted' | 'void' | null
                    journal_entry_id: string | null
                    created_by: string | null
                    created_at: string
                    posted_at: string | null
                    updated_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    voucher_number: string
                    type?: 'receipt' | 'payment' | null
                    partner_id?: string | null
                    amount: number
                    currency_code?: string | null
                    exchange_rate?: number | null
                    payment_method_id?: string | null
                    date?: string | null
                    description?: string | null
                    reference_number?: string | null
                    status?: 'draft' | 'posted' | 'void' | null
                    journal_entry_id?: string | null
                    created_by?: string | null
                    created_at?: string
                    posted_at?: string | null
                    updated_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    voucher_number?: string
                    type?: 'receipt' | 'payment' | null
                    partner_id?: string | null
                    amount?: number
                    currency_code?: string | null
                    exchange_rate?: number | null
                    payment_method_id?: string | null
                    date?: string | null
                    description?: string | null
                    reference_number?: string | null
                    status?: 'draft' | 'posted' | 'void' | null
                    journal_entry_id?: string | null
                    created_by?: string | null
                    created_at?: string
                    posted_at?: string | null
                    updated_at?: string
                }
            }
            document_payments: {
                Row: {
                    id: string
                    document_id: string | null
                    voucher_id: string | null
                    amount: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    document_id?: string | null
                    voucher_id?: string | null
                    amount: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    document_id?: string | null
                    voucher_id?: string | null
                    amount?: number
                    created_at?: string
                }
            }
            notifications: {
                Row: {
                    id: string
                    user_id: string | null
                    company_id: string | null
                    title: string
                    message: string
                    type: string | null
                    is_read: boolean | null
                    link: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    company_id?: string | null
                    title: string
                    message: string
                    type?: string | null
                    is_read?: boolean | null
                    link?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    company_id?: string | null
                    title?: string
                    message?: string
                    type?: string | null
                    is_read?: boolean | null
                    link?: string | null
                    created_at?: string
                }
            }
            reports: {
                Row: {
                    id: string
                    company_id: string | null
                    name: string
                    query: string | null
                    config: Json | null
                    is_public: boolean | null
                    created_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    name: string
                    query?: string | null
                    config?: Json | null
                    is_public?: boolean | null
                    created_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    name?: string
                    query?: string | null
                    config?: Json | null
                    is_public?: boolean | null
                    created_by?: string | null
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

// Helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertType<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateType<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Aliases for Domain Clarity
export type Account = Tables<'accounts'>
export type JournalEntry = Tables<'journal_entries'>
export type JournalEntryLine = Tables<'journal_entry_lines'>
export type Product = Tables<'products'>
export type Partner = Tables<'partners'>
export type Voucher = Tables<'vouchers'>
export type Document = Tables<'documents'>
export type DocumentItem = Tables<'document_items'>
