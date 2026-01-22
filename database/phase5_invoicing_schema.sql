-- =====================================================
-- ERP System - Phase 5: Invoicing
-- نظام الفوترة الموحد
-- =====================================================

-- =====================================================
-- 1. PAYMENT_METHODS - طرق الدفع
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    name_en TEXT,
    
    method_type TEXT NOT NULL CHECK (method_type IN (
        'cash',       -- نقدي
        'bank',       -- تحويل بنكي
        'card',       -- بطاقة ائتمان
        'check',      -- شيك
        'credit',     -- آجل
        'wallet',     -- محفظة إلكترونية
        'other'
    )),
    
    account_id UUID REFERENCES accounts(id),  -- حساب الدفع المرتبط
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, code)
);

CREATE INDEX IF NOT EXISTS idx_pm_company ON payment_methods(company_id);

-- إدخال طرق دفع افتراضية
-- سيتم إنشاؤها تلقائياً عند إنشاء الشركة

-- =====================================================
-- 2. INVOICES - الفواتير الموحدة
-- =====================================================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    fiscal_year_id UUID REFERENCES fiscal_years(id),
    
    -- نوع الفاتورة
    invoice_type TEXT NOT NULL CHECK (invoice_type IN ('sale', 'purchase', 'return_sale', 'return_purchase')),
    
    -- الأرقام والتواريخ
    invoice_number TEXT NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    
    -- الطرف الآخر
    partner_id UUID REFERENCES business_partners(id),
    partner_name TEXT,  -- نسخة للحفظ
    
    -- العملة
    currency TEXT DEFAULT 'IQD',
    exchange_rate DECIMAL(10,6) DEFAULT 1,
    
    -- المبالغ
    subtotal DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    shipping_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    
    -- المدفوعات
    paid_amount DECIMAL(15,2) DEFAULT 0,
    remaining_amount DECIMAL(15,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    
    -- الحالة
    status TEXT DEFAULT 'draft' CHECK (status IN (
        'draft',      -- مسودة
        'confirmed',  -- مؤكدة
        'approved',   -- معتمدة
        'partial',    -- مدفوعة جزئياً
        'paid',       -- مدفوعة بالكامل
        'cancelled',  -- ملغاة
        'returned'    -- مرتجعة
    )),
    
    -- المحاسبة
    journal_entry_id UUID REFERENCES journal_entries(id),
    debt_id UUID REFERENCES debts(id),
    
    -- المستودع
    warehouse_id UUID REFERENCES branches(id),
    
    -- المرجع (للمرتجعات)
    related_invoice_id UUID REFERENCES invoices(id),
    
    -- الملاحظات
    notes TEXT,
    internal_notes TEXT,
    terms_conditions TEXT,
    
    -- التتبع
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, invoice_number, invoice_type)
);

CREATE INDEX IF NOT EXISTS idx_inv_company ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_inv_partner ON invoices(partner_id);
CREATE INDEX IF NOT EXISTS idx_inv_type ON invoices(company_id, invoice_type);
CREATE INDEX IF NOT EXISTS idx_inv_status ON invoices(company_id, status);
CREATE INDEX IF NOT EXISTS idx_inv_date ON invoices(company_id, invoice_date);

-- =====================================================
-- 3. INVOICE_ITEMS - بنود الفواتير
-- =====================================================
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    
    -- المنتج
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    
    -- البيانات
    line_number INTEGER NOT NULL,
    description TEXT NOT NULL,
    sku TEXT,
    unit TEXT,
    
    -- الكميات والأسعار
    quantity DECIMAL(12,3) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    cost_price DECIMAL(12,2),  -- للمبيعات: تكلفة البضاعة
    
    -- الخصم
    discount_amount DECIMAL(12,2) DEFAULT 0,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    
    -- الضريبة
    tax_code_id UUID REFERENCES tax_codes(id),
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    
    -- الإجماليات
    line_total DECIMAL(15,2) GENERATED ALWAYS AS (
        (quantity * unit_price) - discount_amount + tax_amount
    ) STORED,
    
    -- للمخزون
    warehouse_id UUID REFERENCES branches(id),
    inventory_transaction_id UUID REFERENCES inventory_transactions(id),
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ii_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_ii_product ON invoice_items(product_id);

-- =====================================================
-- 4. INVOICE_PAYMENTS - مدفوعات الفواتير
-- =====================================================
CREATE TABLE IF NOT EXISTS invoice_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    
    -- المبلغ
    amount DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- طريقة الدفع
    payment_method_id UUID REFERENCES payment_methods(id),
    payment_method TEXT NOT NULL DEFAULT 'cash',
    
    -- المرجع
    reference_number TEXT,
    check_number TEXT,
    bank_name TEXT,
    
    -- المحاسبة
    journal_entry_id UUID REFERENCES journal_entries(id),
    
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ip_invoice ON invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_ip_company ON invoice_payments(company_id);

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- حساب إجمالي الفاتورة
CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
    new_subtotal DECIMAL(15,2);
    new_tax DECIMAL(15,2);
BEGIN
    SELECT 
        COALESCE(SUM(quantity * unit_price - discount_amount), 0),
        COALESCE(SUM(tax_amount), 0)
    INTO new_subtotal, new_tax
    FROM invoice_items
    WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    UPDATE invoices
    SET 
        subtotal = new_subtotal,
        tax_amount = new_tax,
        total_amount = new_subtotal + new_tax - discount_amount + shipping_amount,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calculate_invoice_totals ON invoice_items;
CREATE TRIGGER trg_calculate_invoice_totals
    AFTER INSERT OR UPDATE OR DELETE ON invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_invoice_totals();

-- تحديث المدفوعات
CREATE OR REPLACE FUNCTION update_invoice_payments()
RETURNS TRIGGER AS $$
DECLARE
    total_paid DECIMAL(15,2);
    inv_total DECIMAL(15,2);
    new_status TEXT;
BEGIN
    SELECT COALESCE(SUM(amount), 0)
    INTO total_paid
    FROM invoice_payments
    WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    SELECT total_amount INTO inv_total
    FROM invoices WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    IF total_paid >= inv_total THEN
        new_status := 'paid';
    ELSIF total_paid > 0 THEN
        new_status := 'partial';
    ELSE
        new_status := 'approved';
    END IF;
    
    UPDATE invoices
    SET 
        paid_amount = total_paid,
        status = new_status,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id)
    AND status NOT IN ('draft', 'cancelled', 'returned');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_invoice_payments ON invoice_payments;
CREATE TRIGGER trg_update_invoice_payments
    AFTER INSERT OR UPDATE OR DELETE ON invoice_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_payments();

-- توليد رقم الفاتورة
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    next_num INTEGER;
    prefix TEXT;
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        prefix := CASE NEW.invoice_type
            WHEN 'sale' THEN 'INV-'
            WHEN 'purchase' THEN 'PUR-'
            WHEN 'return_sale' THEN 'RET-S-'
            WHEN 'return_purchase' THEN 'RET-P-'
            ELSE 'DOC-'
        END;
        
        SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '\d+$') AS INTEGER)), 0) + 1
        INTO next_num
        FROM invoices
        WHERE company_id = NEW.company_id
        AND invoice_type = NEW.invoice_type;
        
        NEW.invoice_number := prefix || LPAD(next_num::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_invoice_number ON invoices;
CREATE TRIGGER trg_generate_invoice_number
    BEFORE INSERT ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION generate_invoice_number();

-- =====================================================
-- 6. RLS
-- =====================================================

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company isolation - payment_methods" ON payment_methods FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())
);

CREATE POLICY "Company isolation - invoices" ON invoices FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())
);

CREATE POLICY "Company isolation - invoice_items" ON invoice_items FOR ALL USING (
    invoice_id IN (SELECT id FROM invoices WHERE company_id IN 
        (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid()))
);

CREATE POLICY "Company isolation - invoice_payments" ON invoice_payments FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())
);

-- =====================================================
-- تم الانتهاء من المرحلة 5! ✅
-- =====================================================
