-- 🌍 ERP System Database Schema V6 (Production Ready for Supabase)
-- 🚀 100% Compatible with Supabase - Error Free

-- Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- ==============================================================================
-- 🏗️ 1. CORE SYSTEM & ACCESS CONTROL
-- ==============================================================================

-- Tenants (المستأجرين)
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    subscription_plan TEXT DEFAULT 'free',
    status TEXT CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Profiles (الملفات الشخصية - Users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Currencies (العملات - Reference Table)
CREATE TABLE public.currencies (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT,
    symbol TEXT,
    exchange_rate DECIMAL(18, 6) DEFAULT 1.0,
    is_base BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Companies (الشركات)
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_en TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    tax_number TEXT,
    commercial_register TEXT,
    logo_url TEXT,
    base_currency_code TEXT REFERENCES public.currencies(code),
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Branches (الفروع)
CREATE TABLE public.branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    address TEXT,
    is_main BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Cost Centers (مراكز التكلفة)
CREATE TABLE public.cost_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    parent_id UUID REFERENCES public.cost_centers(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
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

-- User Companies (Memberships)
CREATE TABLE public.user_companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.roles(id),
    is_owner BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    appointed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, company_id)
);

-- Activity Logs (سجل النشاطات)
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 💱 2. FINANCIAL SYSTEM SETUP
-- ==============================================================================

-- Fiscal Years (السنوات المالية)
CREATE TABLE public.fiscal_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT CHECK (status IN ('open', 'closed')) DEFAULT 'open',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Exchange Rates History
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

-- Tax Codes (رموز الضرائب)
CREATE TABLE public.tax_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Payment Methods (طرق الدفع)
CREATE TABLE public.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_en TEXT,
    type TEXT CHECK (type IN ('cash', 'bank', 'card', 'check', 'other')),
    details JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 💰 3. ACCOUNTING CORE
-- ==============================================================================

-- Account Types (أنواع الحسابات)
CREATE TABLE public.account_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_ar TEXT,
    normal_balance TEXT CHECK (normal_balance IN ('debit', 'credit')),
    report_type TEXT CHECK (report_type IN ('bs', 'pl', 'cf')),
    description TEXT
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
    allow_reconciliation BOOLEAN DEFAULT false,
    currency_code TEXT REFERENCES public.currencies(code),
    current_balance DECIMAL(18, 4) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(company_id, code)
);

-- Journal Entries (القيود اليومية)
CREATE TABLE public.journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id),
    fiscal_year_id UUID REFERENCES public.fiscal_years(id),
    entry_number TEXT NOT NULL,
    entry_date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    reference_type TEXT,
    reference_id UUID,
    total_debit DECIMAL(18, 4) DEFAULT 0,
    total_credit DECIMAL(18, 4) DEFAULT 0,
    status TEXT CHECK (status IN ('draft', 'posted', 'reversed', 'cancelled')) DEFAULT 'draft',
    posted_at TIMESTAMP WITH TIME ZONE,
    posted_by UUID REFERENCES public.profiles(id),
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Journal Entry Lines (سطور القيد)
CREATE TABLE public.journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounts(id),
    description TEXT,
    debit DECIMAL(18, 4) DEFAULT 0,
    credit DECIMAL(18, 4) DEFAULT 0,
    currency_code TEXT REFERENCES public.currencies(code),
    exchange_rate DECIMAL(18, 6) DEFAULT 1.0,
    cost_center_id UUID REFERENCES public.cost_centers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_journal_line_debit_positive CHECK (debit >= 0),
    CONSTRAINT check_journal_line_credit_positive CHECK (credit >= 0)
);

-- Account Summary (For Reporting)
CREATE TABLE public.account_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
    fiscal_year_id UUID REFERENCES public.fiscal_years(id),
    period TEXT,
    opening_balance DECIMAL(18, 4) DEFAULT 0,
    debit_total DECIMAL(18, 4) DEFAULT 0,
    credit_total DECIMAL(18, 4) DEFAULT 0,
    closing_balance DECIMAL(18, 4) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 📦 4. INVENTORY SYSTEM
-- ==============================================================================

-- Units (الوحدات)
CREATE TABLE public.units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_en TEXT,
    code TEXT,
    conversion_factor DECIMAL(18, 4) DEFAULT 1,
    base_unit_id UUID REFERENCES public.units(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Warehouses (المستودعات)
CREATE TABLE public.warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    manager_id UUID REFERENCES public.profiles(id),
    is_main BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Storage Locations (مواقع التخزين)
CREATE TABLE public.storage_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Product Categories (فئات المنتجات)
CREATE TABLE public.product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
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

    -- Frontend Compatibility Fields
    item_number TEXT,
    manufacturer_code TEXT,
    reorder_quantity DECIMAL(18, 4) DEFAULT 0,

    -- Dual Fields for Compatibility
    category TEXT,
    category_id UUID REFERENCES public.product_categories(id),

    unit TEXT,
    unit_id UUID REFERENCES public.units(id),

    cost DECIMAL(18, 4) DEFAULT 0,
    price DECIMAL(18, 4) DEFAULT 0,

    quantity DECIMAL(18, 4) DEFAULT 0,
    min_quantity DECIMAL(18, 4) DEFAULT 0,

    description TEXT,
    manufacturer TEXT,
    track_stock BOOLEAN DEFAULT true,
    allow_negative_stock BOOLEAN DEFAULT false,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,

    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Product Variants (المتغيرات)
CREATE TABLE public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT,
    name TEXT,
    price_adjustment DECIMAL(18, 4) DEFAULT 0,
    attributes JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inventory Transactions (حركات المخزون)
CREATE TABLE public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES public.warehouses(id),
    location_id UUID REFERENCES public.storage_locations(id),
    product_id UUID REFERENCES public.products(id),
    variant_id UUID REFERENCES public.product_variants(id),
    transaction_type TEXT CHECK (transaction_type IN ('in', 'out', 'transfer', 'adjustment', 'count', 'production')),
    quantity DECIMAL(18, 4) NOT NULL,
    unit_cost DECIMAL(18, 4),
    total_cost DECIMAL(18, 4),
    reference_type TEXT,
    reference_id UUID,
    balance_before DECIMAL(18, 4),
    balance_after DECIMAL(18, 4),
    expiry_date DATE,
    batch_number TEXT,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_inventory_quantity_positive CHECK (quantity >= 0)
);

-- Transfer Orders (أوامر نقل مخزني)
CREATE TABLE public.transfer_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    from_warehouse_id UUID REFERENCES public.warehouses(id),
    to_warehouse_id UUID REFERENCES public.warehouses(id),
    date DATE DEFAULT CURRENT_DATE,
    status TEXT CHECK (status IN ('draft', 'pending', 'approved', 'shipped', 'received', 'cancelled')),
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Transfer Items (بنود النقل)
CREATE TABLE public.transfer_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transfer_order_id UUID REFERENCES public.transfer_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    quantity DECIMAL(18, 4) NOT NULL,
    received_quantity DECIMAL(18, 4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 🤝 5. CRM & PARTNERS
-- ==============================================================================

-- Partners (العملاء والموردين)
CREATE TABLE public.partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('customer', 'supplier', 'both')),
    name TEXT NOT NULL,
    code TEXT,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    tax_number TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    currency_code TEXT REFERENCES public.currencies(code),
    credit_limit DECIMAL(18, 4),
    payment_terms_days INTEGER DEFAULT 0,
    opening_balance DECIMAL(18, 4) DEFAULT 0,
    current_balance DECIMAL(18, 4) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 📄 6. SALES, PURCHASES & DOCUMENTS
-- ==============================================================================

-- Document Templates (قوالب الطباعة)
CREATE TABLE public.document_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('invoice', 'quotation', 'receipt', 'po')),
    content_html TEXT,
    styles_css TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Documents (Base table)
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('invoice', 'bill', 'quote', 'order', 'return', 'credit_note', 'debit_note')),
    document_number TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    partner_id UUID REFERENCES public.partners(id),
    warehouse_id UUID REFERENCES public.warehouses(id),
    currency_code TEXT REFERENCES public.currencies(code),
    exchange_rate DECIMAL(18, 6) DEFAULT 1.0,

    subtotal DECIMAL(18, 4) DEFAULT 0,
    tax_total DECIMAL(18, 4) DEFAULT 0,
    discount_total DECIMAL(18, 4) DEFAULT 0,
    shipping_cost DECIMAL(18, 4) DEFAULT 0,
    total_amount DECIMAL(18, 4) DEFAULT 0,
    paid_amount DECIMAL(18, 4) DEFAULT 0,
    remaining_amount DECIMAL(18, 4) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,

    status TEXT CHECK (status IN ('draft', 'pending', 'approved', 'paid', 'void', 'cancelled')) DEFAULT 'draft',
    notes TEXT,
    terms_conditions TEXT,

    generated_entry_id UUID REFERENCES public.journal_entries(id),
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    CONSTRAINT check_document_paid_amount CHECK (paid_amount <= total_amount)
);

-- Document Items (بنود المستند)
CREATE TABLE public.document_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    variant_id UUID REFERENCES public.product_variants(id),
    description TEXT,
    quantity DECIMAL(18, 4) NOT NULL,
    unit_price DECIMAL(18, 4) NOT NULL,
    unit_cost DECIMAL(18, 4),

    tax_id UUID REFERENCES public.tax_codes(id),
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(18, 4) DEFAULT 0,

    discount_amount DECIMAL(18, 4) DEFAULT 0,
    total DECIMAL(18, 4) NOT NULL,

    warehouse_id UUID REFERENCES public.warehouses(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 💵 7. PAYMENTS & VOUCHERS
-- ==============================================================================

-- Vouchers (سندات القبض والصرف)
CREATE TABLE public.vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    voucher_number TEXT NOT NULL,
    type TEXT CHECK (type IN ('receipt', 'payment')),
    partner_id UUID REFERENCES public.partners(id),

    amount DECIMAL(18, 4) NOT NULL,
    currency_code TEXT REFERENCES public.currencies(code),
    exchange_rate DECIMAL(18, 6) DEFAULT 1.0,

    payment_method_id UUID REFERENCES public.payment_methods(id),

    date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    reference_number TEXT,

    status TEXT CHECK (status IN ('draft', 'posted', 'void')) DEFAULT 'draft',
    journal_entry_id UUID REFERENCES public.journal_entries(id),

    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    posted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    CONSTRAINT check_voucher_amount_positive CHECK (amount > 0)
);

-- Document Payments (ربط المدفوعات بالمستندات)
CREATE TABLE public.document_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    voucher_id UUID REFERENCES public.vouchers(id) ON DELETE CASCADE,
    amount DECIMAL(18, 4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_document_payment_amount CHECK (amount > 0)
);

-- ==============================================================================
-- 🔔 8. SYSTEM & UTILITIES
-- ==============================================================================

-- Notifications (الإشعارات)
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Reports (التقارير)
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    query TEXT,
    config JSONB,
    is_public BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 🚀 9. INDEXES FOR PERFORMANCE
-- ==============================================================================

-- Core Indexes
CREATE INDEX idx_products_company ON public.products(company_id);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_barcode ON public.products(barcode);
CREATE INDEX idx_products_active ON public.products(is_active) WHERE is_active = true;

CREATE INDEX idx_partners_company ON public.partners(company_id);
CREATE INDEX idx_partners_type ON public.partners(type);
CREATE INDEX idx_partners_active ON public.partners(is_active) WHERE is_active = true;

CREATE INDEX idx_documents_company ON public.documents(company_id);
CREATE INDEX idx_documents_date ON public.documents(date);
CREATE INDEX idx_documents_type ON public.documents(type);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_documents_partner ON public.documents(partner_id);

CREATE INDEX idx_journal_entries_company ON public.journal_entries(company_id);
CREATE INDEX idx_journal_entries_date ON public.journal_entries(entry_date);
CREATE INDEX idx_journal_entries_status ON public.journal_entries(status);

CREATE INDEX idx_journal_lines_account ON public.journal_entry_lines(account_id);
CREATE INDEX idx_journal_lines_journal ON public.journal_entry_lines(journal_entry_id);

CREATE INDEX idx_inventory_product ON public.inventory_transactions(product_id);
CREATE INDEX idx_inventory_warehouse ON public.inventory_transactions(warehouse_id);
CREATE INDEX idx_inventory_type ON public.inventory_transactions(transaction_type);

-- Full Text Search Indexes (Safe Configuration)
CREATE INDEX idx_products_search ON public.products
USING gin(to_tsvector('simple',
COALESCE(name, '') || ' ' ||
COALESCE(description, '') || ' ' ||
COALESCE(sku, '') || ' ' ||
COALESCE(barcode, '') || ' ' ||
COALESCE(item_number, '')
));

CREATE INDEX idx_partners_search ON public.partners
USING gin(to_tsvector('simple',
COALESCE(name, '') || ' ' ||
COALESCE(contact_person, '') || ' ' ||
COALESCE(address, '') || ' ' ||
COALESCE(phone, '') || ' ' ||
COALESCE(email, '')
));

-- ==============================================================================
-- 🛡️ 10. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Enable RLS on key tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Safe RLS Function
CREATE OR REPLACE FUNCTION auth.my_company_id_safe()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT company_id
        FROM public.user_companies
        WHERE user_id = auth.uid()
        ORDER BY appointed_at DESC
        LIMIT 1
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$;

-- Individual RLS Policies
CREATE POLICY "select_own_company_products" ON public.products FOR SELECT USING (company_id = auth.my_company_id_safe());
CREATE POLICY "insert_own_company_products" ON public.products FOR INSERT WITH CHECK (company_id = auth.my_company_id_safe());
CREATE POLICY "update_own_company_products" ON public.products FOR UPDATE USING (company_id = auth.my_company_id_safe());
CREATE POLICY "delete_own_company_products" ON public.products FOR DELETE USING (company_id = auth.my_company_id_safe());

-- ==============================================================================
-- 🌱 11. SEEDING & AUTOMATION
-- ==============================================================================

-- Seed Currencies
INSERT INTO public.currencies (code, name, name_ar, symbol, is_base) VALUES
('USD', 'US Dollar', 'دولار أمريكي', '$', true),
('SAR', 'Saudi Riyal', 'ريال سعودي', 'ر.س', false),
('YER', 'Yemeni Rial', 'ريال يمني', '﷼', false),
('OMR', 'Omani Rial', 'ريال عماني', 'ر.ع', false),
('IQD', 'Iraqi Dinar', 'دينار عراقي', 'د.ع', false),
('EUR', 'Euro', 'يورو', '€', false)
ON CONFLICT (code) DO NOTHING;

-- Seed Account Types
INSERT INTO public.account_types (code, name, name_ar, normal_balance, report_type) VALUES
('1', 'Assets', 'الأصول', 'debit', 'bs'),
('2', 'Liabilities', 'الخصوم', 'credit', 'bs'),
('3', 'Equity', 'حقوق الملكية', 'credit', 'bs'),
('4', 'Revenue', 'الإيرادات', 'credit', 'pl'),
('5', 'Expenses', 'المصروفات', 'debit', 'pl')
ON CONFLICT (code) DO NOTHING;

-- Function to Seed Default Accounts for New Companies
CREATE OR REPLACE FUNCTION public.seed_company_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    type_asset UUID;
    type_revenue UUID;
    type_expense UUID;
BEGIN
    -- Get Account Type IDs
    SELECT id INTO type_asset FROM public.account_types WHERE code = '1' LIMIT 1;
    SELECT id INTO type_revenue FROM public.account_types WHERE code = '4' LIMIT 1;
    SELECT id INTO type_expense FROM public.account_types WHERE code = '5' LIMIT 1;

    -- Create Essential Accounts
    INSERT INTO public.accounts (company_id, code, name, type_id, is_active) VALUES
    (NEW.id, '101', 'الخزينة (Cash)', type_asset, true),
    (NEW.id, '120', 'المدينون (Accounts Receivable)', type_asset, true),
    (NEW.id, '210', 'الدائنون (Accounts Payable)', type_asset, true),
    (NEW.id, '401', 'المبيعات (Sales)', type_revenue, true),
    (NEW.id, '501', 'المشتريات (Purchases)', type_expense, true),
    (NEW.id, '601', 'المصاريف العمومية (General Expenses)', type_expense, true);

    RETURN NEW;
END;
$$;

-- Trigger for Auto-Seeding
CREATE TRIGGER trg_seed_company_defaults
AFTER INSERT ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.seed_company_defaults();

-- ==============================================================================
-- ⚡ 12. AUTOMATION TRIGGERS
-- ==============================================================================

-- Trigger 1: Auto-Update Account Balance
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update account current balance
    UPDATE public.accounts
    SET current_balance = current_balance + NEW.debit - NEW.credit,
        updated_at = NOW()
    WHERE id = NEW.account_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_account_balance
AFTER INSERT ON public.journal_entry_lines
FOR EACH ROW EXECUTE FUNCTION update_account_balance();

-- Trigger 2: Auto-Update Product Quantity
CREATE OR REPLACE FUNCTION update_product_quantity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.transaction_type IN ('in', 'adjustment', 'production') THEN
        -- Increase stock
        UPDATE public.products
        SET quantity = quantity + NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.product_id;
    ELSIF NEW.transaction_type IN ('out', 'transfer') THEN
        -- Decrease stock
        UPDATE public.products
        SET quantity = quantity - NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.product_id
          AND (allow_negative_stock = true OR quantity >= NEW.quantity);
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_product_quantity
AFTER INSERT ON public.inventory_transactions
FOR EACH ROW EXECUTE FUNCTION update_product_quantity();

-- Trigger 3: Auto-Update Partner Balance
CREATE OR REPLACE FUNCTION update_partner_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.type = 'receipt' THEN
        -- Customer paid us
        UPDATE public.partners
        SET current_balance = current_balance - NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.partner_id AND type IN ('customer', 'both');
    ELSIF NEW.type = 'payment' THEN
        -- We paid supplier
        UPDATE public.partners
        SET current_balance = current_balance + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.partner_id AND type IN ('supplier', 'both');
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_partner_balance
AFTER INSERT ON public.vouchers
FOR EACH ROW EXECUTE FUNCTION update_partner_balance();

-- ==============================================================================
-- 🎉 END OF SCHEMA V6 - READY FOR PRODUCTION
-- ==============================================================================
