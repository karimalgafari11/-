-- =====================================================
-- ERP System - Phase 2: Accounting Schema
-- المحاسبة المالية - السنوات المالية والقيود
-- =====================================================

-- =====================================================
-- 1. FISCAL_YEARS - السنوات المالية
-- =====================================================
CREATE TABLE IF NOT EXISTS fiscal_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,                    -- مثل: 2024، 2025
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,       -- السنة المالية النشطة
    is_closed BOOLEAN DEFAULT false,       -- مغلقة = لا يمكن إضافة قيود
    closed_at TIMESTAMPTZ,
    closed_by UUID REFERENCES auth.users(id),
    opening_balance_journal_id UUID,       -- قيد الأرصدة الافتتاحية
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- منع تداخل التواريخ في نفس الشركة
    CONSTRAINT valid_date_range CHECK (end_date > start_date),
    UNIQUE(company_id, name)
);

CREATE INDEX IF NOT EXISTS idx_fiscal_years_company ON fiscal_years(company_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_years_active ON fiscal_years(company_id, is_active) WHERE is_active = true;

-- =====================================================
-- 2. ACCOUNT_TYPES - أنواع الحسابات
-- =====================================================
CREATE TABLE IF NOT EXISTS account_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    normal_balance TEXT NOT NULL CHECK (normal_balance IN ('debit', 'credit')),
    report_type TEXT NOT NULL CHECK (report_type IN ('balance_sheet', 'income_statement')),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إدخال أنواع الحسابات الأساسية
INSERT INTO account_types (code, name, name_ar, normal_balance, report_type, display_order) VALUES
    ('asset', 'Assets', 'الأصول', 'debit', 'balance_sheet', 1),
    ('liability', 'Liabilities', 'الخصوم', 'credit', 'balance_sheet', 2),
    ('equity', 'Equity', 'حقوق الملكية', 'credit', 'balance_sheet', 3),
    ('revenue', 'Revenue', 'الإيرادات', 'credit', 'income_statement', 4),
    ('expense', 'Expenses', 'المصروفات', 'debit', 'income_statement', 5),
    ('cogs', 'Cost of Goods Sold', 'تكلفة البضاعة المباعة', 'debit', 'income_statement', 6)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 3. تحسين ACCOUNTS - شجرة الحسابات
-- =====================================================
-- إضافة الأعمدة الجديدة
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS type_id UUID REFERENCES account_types(id);
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS is_header BOOLEAN DEFAULT false;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS allow_transactions BOOLEAN DEFAULT true;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS normal_balance TEXT DEFAULT 'debit' CHECK (normal_balance IN ('debit', 'credit'));
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS opening_balance DECIMAL(15,2) DEFAULT 0;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS current_balance DECIMAL(15,2) DEFAULT 0;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'IQD';

-- فهرس للكود الفريد في كل شركة
CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_company_code ON accounts(company_id, code);

-- =====================================================
-- 4. JOURNAL_ENTRIES - القيود اليومية
-- =====================================================
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    fiscal_year_id UUID REFERENCES fiscal_years(id),
    entry_number TEXT NOT NULL,            -- رقم القيد (تسلسلي)
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    reference_type TEXT,                   -- نوع المرجع: sale, purchase, expense, manual
    reference_id UUID,                     -- معرف المرجع
    reference_number TEXT,                 -- رقم المرجع (للعرض)
    
    -- المبالغ الإجمالية (للتحقق)
    total_debit DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_credit DECIMAL(15,2) NOT NULL DEFAULT 0,
    
    -- الحالة
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'reversed')),
    posted_at TIMESTAMPTZ,
    posted_by UUID REFERENCES auth.users(id),
    
    -- العكس (للقيود المعكوسة)
    is_reversal BOOLEAN DEFAULT false,
    reversed_entry_id UUID REFERENCES journal_entries(id),
    reversal_entry_id UUID REFERENCES journal_entries(id),
    reversal_reason TEXT,
    
    -- للتدقيق
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- التأكد من توازن القيد
    CONSTRAINT balanced_entry CHECK (total_debit = total_credit),
    UNIQUE(company_id, entry_number)
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_company ON journal_entries(company_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(company_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON journal_entries(company_id, status);
CREATE INDEX IF NOT EXISTS idx_journal_entries_reference ON journal_entries(reference_type, reference_id);

-- =====================================================
-- 5. JOURNAL_ENTRY_LINES - بنود القيود
-- =====================================================
CREATE TABLE IF NOT EXISTS journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    line_number INTEGER NOT NULL,
    description TEXT,
    
    -- المبالغ
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    
    -- للعملات المتعددة (مستقبلي)
    currency TEXT DEFAULT 'IQD',
    exchange_rate DECIMAL(10,6) DEFAULT 1,
    debit_amount_base DECIMAL(15,2) DEFAULT 0,
    credit_amount_base DECIMAL(15,2) DEFAULT 0,
    
    -- مرجع إضافي (مثل: customer_id, supplier_id)
    party_type TEXT,
    party_id UUID,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- التأكد من أن المبلغ في جانب واحد فقط
    CONSTRAINT one_side_only CHECK (
        (debit_amount > 0 AND credit_amount = 0) OR 
        (credit_amount > 0 AND debit_amount = 0)
    )
);

CREATE INDEX IF NOT EXISTS idx_jel_entry ON journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_jel_account ON journal_entry_lines(account_id);

-- =====================================================
-- 6. EXCHANGE_RATES - أسعار الصرف
-- =====================================================
CREATE TABLE IF NOT EXISTS exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    from_currency TEXT NOT NULL,
    to_currency TEXT NOT NULL,
    rate DECIMAL(15,6) NOT NULL,
    effective_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, from_currency, to_currency, effective_date)
);

-- =====================================================
-- 7. TAX_CODES - أكواد الضرائب
-- =====================================================
CREATE TABLE IF NOT EXISTS tax_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    rate DECIMAL(5,2) NOT NULL,            -- النسبة المئوية
    tax_type TEXT DEFAULT 'sales' CHECK (tax_type IN ('sales', 'purchase', 'both')),
    is_included BOOLEAN DEFAULT false,     -- هل الضريبة مضمنة في السعر
    sales_account_id UUID REFERENCES accounts(id),
    purchase_account_id UUID REFERENCES accounts(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, code)
);

-- =====================================================
-- 8. TRANSACTIONS - الحركات المالية (View-like, derived)
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
    journal_line_id UUID REFERENCES journal_entry_lines(id) ON DELETE CASCADE,
    
    transaction_date DATE NOT NULL,
    description TEXT,
    
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    balance DECIMAL(15,2) DEFAULT 0,       -- الرصيد التراكمي (يُحسب بـ trigger)
    
    -- للتتبع
    reference_type TEXT,
    reference_id UUID,
    party_type TEXT,
    party_id UUID,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(company_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_journal ON transactions(journal_entry_id);

-- =====================================================
-- 9. VIEWS المحاسبية
-- =====================================================

-- أرصدة الحسابات
CREATE OR REPLACE VIEW vw_account_balances AS
SELECT 
    a.id,
    a.company_id,
    a.code,
    a.name,
    a.account_type,
    at.normal_balance,
    COALESCE(SUM(jel.debit_amount), 0) as total_debit,
    COALESCE(SUM(jel.credit_amount), 0) as total_credit,
    CASE 
        WHEN at.normal_balance = 'debit' THEN 
            COALESCE(SUM(jel.debit_amount), 0) - COALESCE(SUM(jel.credit_amount), 0)
        ELSE 
            COALESCE(SUM(jel.credit_amount), 0) - COALESCE(SUM(jel.debit_amount), 0)
    END as balance
FROM accounts a
LEFT JOIN account_types at ON at.code = a.account_type
LEFT JOIN journal_entry_lines jel ON jel.account_id = a.id
LEFT JOIN journal_entries je ON je.id = jel.journal_entry_id AND je.status = 'posted'
GROUP BY a.id, a.company_id, a.code, a.name, a.account_type, at.normal_balance;

-- ميزان المراجعة
CREATE OR REPLACE VIEW vw_trial_balance AS
SELECT 
    company_id,
    code,
    name,
    account_type,
    CASE WHEN balance >= 0 AND normal_balance = 'debit' THEN ABS(balance) ELSE 0 END as debit_balance,
    CASE WHEN balance >= 0 AND normal_balance = 'credit' THEN ABS(balance) ELSE 0 END as credit_balance,
    CASE WHEN balance < 0 AND normal_balance = 'debit' THEN ABS(balance) ELSE 0 END as credit_balance_reversed,
    CASE WHEN balance < 0 AND normal_balance = 'credit' THEN ABS(balance) ELSE 0 END as debit_balance_reversed
FROM vw_account_balances
WHERE balance != 0
ORDER BY code;

-- =====================================================
-- 10. TRIGGERS للحماية
-- =====================================================

-- منع تعديل القيود المعتمدة
CREATE OR REPLACE FUNCTION prevent_posted_entry_modification()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'posted' THEN
        RAISE EXCEPTION 'لا يمكن تعديل قيد معتمد. استخدم قيد عكسي.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_posted_entry_update ON journal_entries;
CREATE TRIGGER trg_prevent_posted_entry_update
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW
    WHEN (OLD.status = 'posted' AND NEW.status != 'reversed')
    EXECUTE FUNCTION prevent_posted_entry_modification();

-- منع حذف القيود المعتمدة
CREATE OR REPLACE FUNCTION prevent_posted_entry_deletion()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'posted' THEN
        RAISE EXCEPTION 'لا يمكن حذف قيد معتمد. استخدم قيد عكسي.';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_posted_entry_delete ON journal_entries;
CREATE TRIGGER trg_prevent_posted_entry_delete
    BEFORE DELETE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION prevent_posted_entry_deletion();

-- تحديث أرصدة الحسابات عند اعتماد القيد
CREATE OR REPLACE FUNCTION update_account_balances()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'posted' AND (OLD.status IS NULL OR OLD.status != 'posted') THEN
        -- تحديث أرصدة الحسابات
        UPDATE accounts a
        SET current_balance = current_balance + (
            SELECT COALESCE(SUM(debit_amount - credit_amount), 0)
            FROM journal_entry_lines jel
            WHERE jel.journal_entry_id = NEW.id
            AND jel.account_id = a.id
        )
        WHERE a.id IN (
            SELECT account_id FROM journal_entry_lines WHERE journal_entry_id = NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_balances_on_post ON journal_entries;
CREATE TRIGGER trg_update_balances_on_post
    AFTER UPDATE ON journal_entries
    FOR EACH ROW
    WHEN (NEW.status = 'posted')
    EXECUTE FUNCTION update_account_balances();

-- توليد رقم القيد التلقائي
CREATE OR REPLACE FUNCTION generate_entry_number()
RETURNS TRIGGER AS $$
DECLARE
    next_num INTEGER;
    prefix TEXT;
BEGIN
    IF NEW.entry_number IS NULL OR NEW.entry_number = '' THEN
        SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM '\d+$') AS INTEGER)), 0) + 1
        INTO next_num
        FROM journal_entries
        WHERE company_id = NEW.company_id
        AND fiscal_year_id = NEW.fiscal_year_id;
        
        prefix := 'JE-' || EXTRACT(YEAR FROM NEW.entry_date) || '-';
        NEW.entry_number := prefix || LPAD(next_num::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_entry_number ON journal_entries;
CREATE TRIGGER trg_generate_entry_number
    BEFORE INSERT ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION generate_entry_number();

-- =====================================================
-- 11. RLS للجداول المحاسبية
-- =====================================================

ALTER TABLE fiscal_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول
CREATE POLICY "Company isolation - fiscal_years" ON fiscal_years FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())
);

CREATE POLICY "Everyone view account_types" ON account_types FOR SELECT USING (true);

CREATE POLICY "Company isolation - journal_entries" ON journal_entries FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())
);

CREATE POLICY "Company isolation - journal_entry_lines" ON journal_entry_lines FOR ALL USING (
    journal_entry_id IN (
        SELECT id FROM journal_entries je 
        WHERE je.company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())
    )
);

CREATE POLICY "Company isolation - exchange_rates" ON exchange_rates FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())
);

CREATE POLICY "Company isolation - tax_codes" ON tax_codes FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())
);

CREATE POLICY "Company isolation - transactions" ON transactions FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())
);

-- =====================================================
-- تم الانتهاء من المرحلة 2! ✅
-- =====================================================
