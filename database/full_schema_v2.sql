-- 🌍 ERP System Database Schema V2
-- Based on 'Alzhra' Application Requirements
-- 100% Compatible with:
--   - accountingService.ts
--   - ItemFormModal.tsx
--   - VouchersTable.tsx
--   - Mappers & Types

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 🏢 1. Core System (النظام الأساسي)
-- ==============================================================================

-- Tenants (المستأجرين)
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    subscription_plan TEXT DEFAULT 'free',
    status TEXT CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Companies (الشركات)
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id),
    name TEXT NOT NULL,
    name_en TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    tax_number TEXT,
    commercial_register TEXT,
    logo_url TEXT,
    base_currency_code TEXT, -- Will reference currencies table defined later
    settings JSONB DEFAULT '{}'::jsonb, -- Flexible settings
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Profiles (الملفات الشخصية)
-- Extends Supabase auth.users
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Roles (الأدوار)
CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_ar TEXT,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Companies (ربط المستخدمين بالشركات)
CREATE TABLE public.user_companies (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.roles(id),
    is_owner BOOLEAN DEFAULT false,
    appointed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, company_id)
);

-- ==============================================================================
-- 💱 2. Financial System (النظام المالي)
-- ==============================================================================

-- Currencies (العملات)
CREATE TABLE public.currencies (
    code TEXT PRIMARY KEY, -- SAR, USD, etc.
    name TEXT NOT NULL,
    name_en TEXT,
    symbol TEXT,
    exchange_rate DECIMAL(18, 6) DEFAULT 1.0,
    is_base BOOLEAN DEFAULT false
);

-- Add Foreign Key to Companies after Currencies table is created
ALTER TABLE public.companies 
ADD CONSTRAINT fk_companies_currency 
FOREIGN KEY (base_currency_code) REFERENCES public.currencies(code);

-- Exchange Rates History (سجل أسعار الصرف)
CREATE TABLE public.exchange_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    from_currency TEXT REFERENCES public.currencies(code),
    to_currency TEXT REFERENCES public.currencies(code),
    rate DECIMAL(18, 6) NOT NULL,
    effective_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Fiscal Years (السنوات المالية)
CREATE TABLE public.fiscal_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "2026"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT CHECK (status IN ('open', 'closed')) DEFAULT 'open',
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 💰 3. Accounting (المحاسبة)
-- Note: Must match accountingService.ts
-- ==============================================================================

-- Account Types (أنواع الحسابات)
CREATE TABLE public.account_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_ar TEXT,
    normal_balance TEXT CHECK (normal_balance IN ('debit', 'credit')),
    report_type TEXT CHECK (report_type IN ('bs', 'pl')) -- Balance Sheet / Profit & Loss
);

-- Accounts (شجرة الحسابات)
CREATE TABLE public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    name_en TEXT,
    type_id UUID REFERENCES public.account_types(id),
    parent_id UUID REFERENCES public.accounts(id),
    level INTEGER DEFAULT 1,
    is_header BOOLEAN DEFAULT false,
    current_balance DECIMAL(18, 4) DEFAULT 0, -- Cache field
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(company_id, code)
);

-- Journal Entries (القيود اليومية)
CREATE TABLE public.journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    entry_number TEXT NOT NULL,
    entry_date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    reference_type TEXT, -- invoice, payment, etc.
    reference_id UUID,
    total_debit DECIMAL(18, 4) DEFAULT 0 CHECK (total_debit >= 0),
    total_credit DECIMAL(18, 4) DEFAULT 0 CHECK (total_credit >= 0),
    status TEXT CHECK (status IN ('draft', 'posted', 'reversed')) DEFAULT 'draft',
    posted_at TIMESTAMP WITH TIME ZONE,
    posted_by UUID REFERENCES public.profiles(id),
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Journal Entry Lines (سطور القيد)
CREATE TABLE public.journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE, -- Denormalized for RLS ease
    account_id UUID REFERENCES public.accounts(id),
    description TEXT,
    debit DECIMAL(18, 4) DEFAULT 0 CHECK (debit >= 0),
    credit DECIMAL(18, 4) DEFAULT 0 CHECK (credit >= 0),
    currency_code TEXT REFERENCES public.currencies(code),
    exchange_rate DECIMAL(18, 6) DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Account Balances (أرصدة مجمعة - Summaries)
CREATE TABLE public.account_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
    fiscal_year_id UUID REFERENCES public.fiscal_years(id),
    period TEXT, -- "YYYY-MM" or "YYYY"
    opening_balance DECIMAL(18, 4) DEFAULT 0,
    debit_total DECIMAL(18, 4) DEFAULT 0,
    credit_total DECIMAL(18, 4) DEFAULT 0,
    closing_balance DECIMAL(18, 4) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 📦 5. Inventory & Products (المخزون والمنتجات)
-- Note: Must match ItemFormModal.tsx
-- ==============================================================================

-- Units (الوحدات)
CREATE TABLE public.units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Product Categories (فئات المنتجات)
CREATE TABLE public.product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES public.product_categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Products (المنتجات)
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_en TEXT,
    sku TEXT,
    barcode TEXT,
    category TEXT, -- Kept as Text because ItemFormModal uses text category
    category_id UUID REFERENCES public.product_categories(id), -- Optional link for future
    unit TEXT, -- Kept as Text because ItemFormModal uses text unit
    unit_id UUID REFERENCES public.units(id), -- Optional link for future
    cost DECIMAL(18, 4) DEFAULT 0, -- Matches 'cost' in ItemFormModal mapping
    price DECIMAL(18, 4) DEFAULT 0, -- Matches 'price' in ItemFormModal mapping
    quantity DECIMAL(18, 4) DEFAULT 0, -- Current Stock
    min_quantity DECIMAL(18, 4) DEFAULT 0, -- Reorder Point
    description TEXT,
    track_stock BOOLEAN DEFAULT true,
    manufacturer TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Warehouses (المستودعات)
CREATE TABLE public.warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    is_main BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inventory Transactions (حركات المخزون)
CREATE TABLE public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES public.warehouses(id),
    transaction_type TEXT CHECK (transaction_type IN ('in', 'out', 'transfer', 'adjustment', 'count')),
    quantity DECIMAL(18, 4) NOT NULL,
    unit_cost DECIMAL(18, 4),
    total_cost DECIMAL(18, 4),
    reference_type TEXT, -- invoice, payment, etc.
    reference_id UUID,
    balance_before DECIMAL(18, 4),
    balance_after DECIMAL(18, 4),
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 🤝 4. Partners (العملاء والموردين)
-- ==============================================================================

CREATE TABLE public.partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('customer', 'supplier', 'both')),
    name TEXT NOT NULL,
    code TEXT,
    phone TEXT,
    email TEXT,
    tax_number TEXT,
    address TEXT,
    credit_limit DECIMAL(18, 4),
    current_balance DECIMAL(18, 4) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 📄 6. Documents (المستندات - الفواتير)
-- ==============================================================================

CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('invoice', 'bill', 'quote', 'order', 'return')),
    document_number TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    partner_id UUID REFERENCES public.partners(id),
    warehouse_id UUID REFERENCES public.warehouses(id),
    
    subtotal DECIMAL(18, 4) DEFAULT 0,
    tax_total DECIMAL(18, 4) DEFAULT 0,
    discount_total DECIMAL(18, 4) DEFAULT 0,
    total_amount DECIMAL(18, 4) DEFAULT 0,
    paid_amount DECIMAL(18, 4) DEFAULT 0,
    remaining_amount DECIMAL(18, 4) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    
    status TEXT CHECK (status IN ('draft', 'approved', 'paid', 'void', 'cancelled')) DEFAULT 'draft',
    generated_entry_id UUID REFERENCES public.journal_entries(id),
    
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.document_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    description TEXT,
    quantity DECIMAL(18, 4) DEFAULT 1,
    unit_price DECIMAL(18, 4) DEFAULT 0,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(18, 4) DEFAULT 0,
    discount_amount DECIMAL(18, 4) DEFAULT 0,
    total DECIMAL(18, 4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 💵 7. Cash Management (إدارة النقدية)
-- Note: Matches VouchersTable.tsx
-- ==============================================================================

CREATE TABLE public.vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    voucher_number TEXT NOT NULL,
    type TEXT CHECK (type IN ('receipt', 'payment')), -- Receipt = قبض, Payment = صرف
    partner_id UUID REFERENCES public.partners(id), -- Can be customer or supplier
    amount DECIMAL(18, 4) NOT NULL,
    currency_code TEXT REFERENCES public.currencies(code),
    date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    reference_number TEXT,
    status TEXT CHECK (status IN ('draft', 'posted', 'void')) DEFAULT 'draft',
    journal_entry_id UUID REFERENCES public.journal_entries(id),
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    posted_at TIMESTAMP WITH TIME ZONE
);

-- ==============================================================================
-- 🔒 Row Level Security (RLS) Helper Functions
-- ==============================================================================

-- Create a helper to get current user's company_id
-- Note: This is a placeholder. In a real app, you'd look up the user's active company from a session or profile.
CREATE OR REPLACE FUNCTION auth.company_id()
RETURNS UUID AS $$
    SELECT company_id 
    FROM public.user_companies 
    WHERE user_id = auth.uid() 
    ORDER BY appointed_at DESC 
    LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Example Policy (Applying to most tables)
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view their company products" ON public.products
--     FOR SELECT USING (company_id = auth.company_id());

-- End of Schema
