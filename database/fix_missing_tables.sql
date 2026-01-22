-- =====================================================
-- Fix Missing Tables Script
-- This script creates tables that are referenced by the application code
-- but were missing from phase schemas.
-- =====================================================

-- 1. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    title TEXT,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- success, error, warning, info
    error_details JSONB,
    
    is_read BOOLEAN DEFAULT false,
    link TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications" ON notifications
    FOR ALL USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);


-- 2. FISCAL_PERIODS
CREATE TABLE IF NOT EXISTS fiscal_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'locked')),
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, name)
);

ALTER TABLE fiscal_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company isolation - fiscal_periods" ON fiscal_periods
    FOR ALL USING (company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid()));


-- 3. RETURNS (Legacy/Separate from invoices)
CREATE TABLE IF NOT EXISTS returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    return_type TEXT NOT NULL CHECK (return_type IN ('sales', 'purchase')),
    return_number TEXT NOT NULL,
    
    original_invoice_id UUID, -- Optional reference to invoice
    customer_id UUID REFERENCES customers(id), -- Assuming customers table exists from schema.sql
    supplier_id UUID REFERENCES suppliers(id), -- Assuming suppliers table exists
    
    return_date DATE DEFAULT CURRENT_DATE,
    total DECIMAL(15,2) DEFAULT 0,
    
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    
    items JSONB DEFAULT '[]', -- Storing items as JSON for simplicity if table doesn't exist
    
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, return_number)
);

ALTER TABLE returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company isolation - returns" ON returns
    FOR ALL USING (company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid()));


-- 4. VOUCHERS (Receipts and Payments)
CREATE TABLE IF NOT EXISTS vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    voucher_type TEXT NOT NULL CHECK (voucher_type IN ('receipt', 'payment')),
    voucher_number TEXT NOT NULL,
    
    amount DECIMAL(15,2) NOT NULL,
    voucher_date DATE DEFAULT CURRENT_DATE,
    
    customer_id UUID REFERENCES customers(id),
    supplier_id UUID REFERENCES suppliers(id),
    
    payment_account_id UUID REFERENCES accounts(id), -- Assuming accounts table exists
    payment_method TEXT DEFAULT 'cash',
    
    reference_type TEXT,
    reference_id UUID,
    
    description TEXT,
    status TEXT DEFAULT 'draft',
    
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, voucher_number)
);

ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company isolation - vouchers" ON vouchers
    FOR ALL USING (company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid()));
