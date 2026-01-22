-- =====================================================
-- ERP System - Phase 3: CRM & Business Partners
-- العلاقات التجارية والديون
-- =====================================================

-- =====================================================
-- 1. BUSINESS_PARTNERS - الشركاء التجاريين (موحد)
-- =====================================================
CREATE TABLE IF NOT EXISTS business_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- المعلومات الأساسية
    code TEXT,                             -- كود الشريك
    name TEXT NOT NULL,
    name_en TEXT,
    email TEXT,
    phone TEXT,
    mobile TEXT,
    fax TEXT,
    website TEXT,
    
    -- العنوان
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'العراق',
    postal_code TEXT,
    
    -- النوع والتصنيف
    partner_type TEXT NOT NULL CHECK (partner_type IN ('customer', 'supplier', 'both')),
    category TEXT,
    tags JSONB DEFAULT '[]',
    
    -- المعلومات المالية
    currency TEXT DEFAULT 'IQD',
    credit_limit DECIMAL(15,2) DEFAULT 0,
    payment_terms INTEGER DEFAULT 0,       -- أيام السداد
    tax_number TEXT,
    commercial_register TEXT,
    
    -- الأرصدة (محسوبة من الديون)
    balance DECIMAL(15,2) DEFAULT 0,       -- الرصيد الحالي
    total_sales DECIMAL(15,2) DEFAULT 0,
    total_purchases DECIMAL(15,2) DEFAULT 0,
    
    -- الحالة
    is_active BOOLEAN DEFAULT true,
    is_general BOOLEAN DEFAULT false,      -- الزبون النقدي العام
    cash_only BOOLEAN DEFAULT false,
    
    -- الملاحظات
    notes TEXT,
    
    -- التتبع
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, code)
);

CREATE INDEX IF NOT EXISTS idx_bp_company ON business_partners(company_id);
CREATE INDEX IF NOT EXISTS idx_bp_type ON business_partners(company_id, partner_type);
CREATE INDEX IF NOT EXISTS idx_bp_name ON business_partners(company_id, name);

-- =====================================================
-- 2. PARTNER_CONTACTS - جهات الاتصال
-- =====================================================
CREATE TABLE IF NOT EXISTS partner_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES business_partners(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    position TEXT,
    email TEXT,
    phone TEXT,
    mobile TEXT,
    is_primary BOOLEAN DEFAULT false,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pc_partner ON partner_contacts(partner_id);

-- =====================================================
-- 3. DEBTS - الديون
-- =====================================================
CREATE TABLE IF NOT EXISTS debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES business_partners(id) ON DELETE RESTRICT,
    
    -- نوع الدين
    debt_type TEXT NOT NULL CHECK (debt_type IN ('receivable', 'payable')),
    -- receivable = مستحق للشركة (من العميل)
    -- payable = مستحق على الشركة (للمورد)
    
    -- المرجع
    reference_type TEXT NOT NULL,          -- sale, purchase, manual
    reference_id UUID,
    reference_number TEXT,
    
    -- المبالغ
    original_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    remaining_amount DECIMAL(15,2) GENERATED ALWAYS AS (original_amount - paid_amount) STORED,
    
    -- التواريخ
    debt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    
    -- الحالة
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
    
    -- ملاحظات
    description TEXT,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_debts_company ON debts(company_id);
CREATE INDEX IF NOT EXISTS idx_debts_partner ON debts(partner_id);
CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(company_id, status);
CREATE INDEX IF NOT EXISTS idx_debts_type ON debts(company_id, debt_type);
CREATE INDEX IF NOT EXISTS idx_debts_due ON debts(company_id, due_date) WHERE status != 'paid';

-- =====================================================
-- 4. DEBT_PAYMENTS - سداد الديون
-- =====================================================
CREATE TABLE IF NOT EXISTS debt_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    debt_id UUID NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
    
    -- المبلغ
    amount DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT DEFAULT 'cash',
    
    -- المرجع المحاسبي
    journal_entry_id UUID REFERENCES journal_entries(id),
    
    -- ملاحظات
    reference_number TEXT,
    notes TEXT,
    
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dp_debt ON debt_payments(debt_id);
CREATE INDEX IF NOT EXISTS idx_dp_company ON debt_payments(company_id);

-- =====================================================
-- 5. CREDIT_NOTES - إشعارات دائنة/مدينة
-- =====================================================
CREATE TABLE IF NOT EXISTS credit_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES business_partners(id) ON DELETE RESTRICT,
    
    -- النوع
    note_type TEXT NOT NULL CHECK (note_type IN ('credit', 'debit')),
    -- credit = إشعار دائن (خصم للعميل أو رد من المورد)
    -- debit = إشعار مدين (إضافة على العميل أو مستحق للمورد)
    
    -- الرقم والتاريخ
    note_number TEXT NOT NULL,
    note_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- المبلغ
    amount DECIMAL(15,2) NOT NULL,
    
    -- السبب
    reason TEXT NOT NULL,
    description TEXT,
    
    -- المرجع
    reference_type TEXT,
    reference_id UUID,
    
    -- المحاسبة
    is_applied BOOLEAN DEFAULT false,
    applied_to_debt_id UUID REFERENCES debts(id),
    journal_entry_id UUID REFERENCES journal_entries(id),
    
    -- الحالة
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'applied', 'cancelled')),
    
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, note_number)
);

CREATE INDEX IF NOT EXISTS idx_cn_company ON credit_notes(company_id);
CREATE INDEX IF NOT EXISTS idx_cn_partner ON credit_notes(partner_id);

-- =====================================================
-- 6. VIEWS للديون
-- =====================================================

-- تفاصيل عمر الديون
CREATE OR REPLACE VIEW vw_debt_aging_details AS
SELECT 
    d.id,
    d.company_id,
    d.partner_id,
    bp.name as partner_name,
    d.debt_type,
    d.reference_number,
    d.original_amount,
    d.paid_amount,
    d.remaining_amount,
    d.debt_date,
    d.due_date,
    d.status,
    CURRENT_DATE - d.debt_date as days_since_debt,
    CASE 
        WHEN d.due_date IS NULL THEN 0
        ELSE CURRENT_DATE - d.due_date 
    END as days_overdue,
    CASE 
        WHEN d.due_date IS NULL THEN 'غير محدد'
        WHEN CURRENT_DATE <= d.due_date THEN 'ساري'
        WHEN CURRENT_DATE - d.due_date <= 30 THEN '1-30 يوم'
        WHEN CURRENT_DATE - d.due_date <= 60 THEN '31-60 يوم'
        WHEN CURRENT_DATE - d.due_date <= 90 THEN '61-90 يوم'
        ELSE '+90 يوم'
    END as aging_bucket
FROM debts d
JOIN business_partners bp ON bp.id = d.partner_id
WHERE d.status NOT IN ('paid', 'cancelled');

-- ملخص عمر الديون
CREATE OR REPLACE VIEW vw_debts_aging_summary AS
SELECT 
    company_id,
    partner_id,
    partner_name,
    debt_type,
    COUNT(*) as debt_count,
    SUM(remaining_amount) as total_remaining,
    SUM(CASE WHEN aging_bucket = 'ساري' THEN remaining_amount ELSE 0 END) as current_amount,
    SUM(CASE WHEN aging_bucket = '1-30 يوم' THEN remaining_amount ELSE 0 END) as days_1_30,
    SUM(CASE WHEN aging_bucket = '31-60 يوم' THEN remaining_amount ELSE 0 END) as days_31_60,
    SUM(CASE WHEN aging_bucket = '61-90 يوم' THEN remaining_amount ELSE 0 END) as days_61_90,
    SUM(CASE WHEN aging_bucket = '+90 يوم' THEN remaining_amount ELSE 0 END) as days_90_plus
FROM vw_debt_aging_details
GROUP BY company_id, partner_id, partner_name, debt_type;

-- =====================================================
-- 7. TRIGGERS
-- =====================================================

-- تحديث حالة الدين عند السداد
CREATE OR REPLACE FUNCTION update_debt_status()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE debts
    SET 
        paid_amount = (SELECT COALESCE(SUM(amount), 0) FROM debt_payments WHERE debt_id = NEW.debt_id),
        status = CASE 
            WHEN (SELECT COALESCE(SUM(amount), 0) FROM debt_payments WHERE debt_id = NEW.debt_id) >= original_amount THEN 'paid'
            WHEN (SELECT COALESCE(SUM(amount), 0) FROM debt_payments WHERE debt_id = NEW.debt_id) > 0 THEN 'partial'
            ELSE 'pending'
        END,
        updated_at = NOW()
    WHERE id = NEW.debt_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_debt_status ON debt_payments;
CREATE TRIGGER trg_update_debt_status
    AFTER INSERT OR UPDATE OR DELETE ON debt_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_debt_status();

-- تحديث رصيد الشريك
CREATE OR REPLACE FUNCTION update_partner_balance()
RETURNS TRIGGER AS $$
DECLARE
    partner UUID;
    new_balance DECIMAL(15,2);
BEGIN
    partner := COALESCE(NEW.partner_id, OLD.partner_id);
    
    SELECT 
        COALESCE(SUM(CASE WHEN debt_type = 'receivable' THEN remaining_amount ELSE -remaining_amount END), 0)
    INTO new_balance
    FROM debts
    WHERE partner_id = partner AND status NOT IN ('paid', 'cancelled');
    
    UPDATE business_partners
    SET balance = new_balance, updated_at = NOW()
    WHERE id = partner;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_partner_balance ON debts;
CREATE TRIGGER trg_update_partner_balance
    AFTER INSERT OR UPDATE OR DELETE ON debts
    FOR EACH ROW
    EXECUTE FUNCTION update_partner_balance();

-- =====================================================
-- 8. RLS
-- =====================================================

ALTER TABLE business_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company isolation - business_partners" ON business_partners FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())
);

CREATE POLICY "Company isolation - partner_contacts" ON partner_contacts FOR ALL USING (
    partner_id IN (SELECT id FROM business_partners WHERE company_id IN 
        (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid()))
);

CREATE POLICY "Company isolation - debts" ON debts FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())
);

CREATE POLICY "Company isolation - debt_payments" ON debt_payments FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())
);

CREATE POLICY "Company isolation - credit_notes" ON credit_notes FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())
);

-- =====================================================
-- تم الانتهاء من المرحلة 3! ✅
-- =====================================================
