-- =====================================================
-- سكربت الإعداد الكامل لنظام الزهراء
-- شغّل هذا السكربت مرة واحدة في Supabase SQL Editor
-- =====================================================

-- ==================== الجزء 1: سياسات RLS ====================

-- تعطيل RLS مؤقتًا للجداول الأساسية لإتاحة إنشاء البيانات
DROP POLICY IF EXISTS "allow_insert_companies" ON public.companies;
CREATE POLICY "allow_insert_companies" ON public.companies
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "allow_read_own_company" ON public.companies;
CREATE POLICY "allow_read_own_company" ON public.companies
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "allow_insert_profiles" ON public.profiles;
CREATE POLICY "allow_insert_profiles" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "allow_update_own_profile" ON public.profiles;
CREATE POLICY "allow_update_own_profile" ON public.profiles
    FOR UPDATE TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "allow_read_profiles" ON public.profiles;
CREATE POLICY "allow_read_profiles" ON public.profiles
    FOR SELECT TO authenticated USING (true);

-- المنتجات
DROP POLICY IF EXISTS "allow_company_products" ON public.products;
CREATE POLICY "allow_company_products" ON public.products
    FOR ALL TO authenticated
    USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
    WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- العملاء
DROP POLICY IF EXISTS "allow_company_customers" ON public.customers;
CREATE POLICY "allow_company_customers" ON public.customers
    FOR ALL TO authenticated
    USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
    WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- الموردين
DROP POLICY IF EXISTS "allow_company_suppliers" ON public.suppliers;
CREATE POLICY "allow_company_suppliers" ON public.suppliers
    FOR ALL TO authenticated
    USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
    WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- المستودعات
DROP POLICY IF EXISTS "allow_company_warehouses" ON public.warehouses;
CREATE POLICY "allow_company_warehouses" ON public.warehouses
    FOR ALL TO authenticated
    USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
    WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- تفعيل RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;

-- ==================== الجزء 2: Triggers والدوال ====================

-- Trigger لإنشاء Profile تلقائياً
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, role, is_active)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        'manager',
        true
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- دالة إنشاء شركة مع الإعدادات الافتراضية
CREATE OR REPLACE FUNCTION public.create_company_with_defaults(
    p_name TEXT,
    p_email TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_company_id UUID;
BEGIN
    INSERT INTO public.companies (name, email)
    VALUES (p_name, p_email)
    RETURNING id INTO v_company_id;
    
    INSERT INTO public.company_settings (company_id, currency, tax_enabled, tax_rate, invoice_prefix)
    VALUES (v_company_id, 'SAR', true, 15.0, 'INV-');
    
    INSERT INTO public.warehouses (company_id, name, name_en, code, is_main)
    VALUES (v_company_id, 'المستودع الرئيسي', 'Main Warehouse', 'WH-001', true);
    
    INSERT INTO public.branches (company_id, name, is_active)
    VALUES (v_company_id, 'الفرع الرئيسي', true);
    
    INSERT INTO public.fiscal_periods (company_id, name, start_date, end_date, status, is_active)
    VALUES (
        v_company_id,
        'السنة المالية ' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT,
        DATE_TRUNC('year', CURRENT_DATE)::DATE,
        (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year' - INTERVAL '1 day')::DATE,
        'open',
        true
    );
    
    INSERT INTO public.customers (company_id, name, is_general, cash_only, is_active)
    VALUES (v_company_id, 'عميل نقدي', true, true, true);
    
    IF p_user_id IS NOT NULL THEN
        UPDATE public.profiles SET company_id = v_company_id WHERE id = p_user_id;
    END IF;
    
    RETURN v_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة إنشاء الحسابات الافتراضية
CREATE OR REPLACE FUNCTION public.create_default_accounts(p_company_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.accounts (company_id, code, name, name_en, account_type, type, is_header, level) VALUES
    (p_company_id, '1', 'الأصول', 'Assets', 'asset', 'asset', true, 1),
    (p_company_id, '11', 'النقد والبنوك', 'Cash & Banks', 'asset', 'asset', true, 2),
    (p_company_id, '111', 'الصندوق', 'Cash', 'asset', 'asset', false, 3),
    (p_company_id, '112', 'البنك', 'Bank', 'asset', 'asset', false, 3),
    (p_company_id, '12', 'المخزون', 'Inventory', 'asset', 'asset', false, 2),
    (p_company_id, '13', 'العملاء', 'Accounts Receivable', 'asset', 'asset', false, 2),
    (p_company_id, '2', 'الخصوم', 'Liabilities', 'liability', 'liability', true, 1),
    (p_company_id, '21', 'الموردون', 'Accounts Payable', 'liability', 'liability', false, 2),
    (p_company_id, '3', 'حقوق الملكية', 'Equity', 'equity', 'equity', true, 1),
    (p_company_id, '31', 'رأس المال', 'Capital', 'equity', 'equity', false, 2),
    (p_company_id, '4', 'الإيرادات', 'Revenue', 'revenue', 'revenue', true, 1),
    (p_company_id, '41', 'المبيعات', 'Sales', 'revenue', 'revenue', false, 2),
    (p_company_id, '5', 'المصروفات', 'Expenses', 'expense', 'expense', true, 1),
    (p_company_id, '51', 'تكلفة المبيعات', 'Cost of Goods Sold', 'expense', 'expense', false, 2),
    (p_company_id, '52', 'مصروفات عامة', 'General Expenses', 'expense', 'expense', false, 2)
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== الجزء 3: البيانات التجريبية ====================

-- الشركة التجريبية
INSERT INTO public.companies (id, name, name_en, phone, email, address, tax_number)
VALUES (
    'a1111111-1111-1111-1111-111111111111',
    'شركة الزهراء لقطع غيار السيارات',
    'Alzhra Auto Parts Co.',
    '+966500000000',
    'info@alzhra.com',
    'الرياض - المملكة العربية السعودية',
    '300000000000003'
) ON CONFLICT (id) DO NOTHING;

-- إعدادات الشركة
INSERT INTO public.company_settings (company_id, currency, tax_enabled, tax_rate, invoice_prefix)
VALUES ('a1111111-1111-1111-1111-111111111111', 'SAR', true, 15.0, 'INV-')
ON CONFLICT (company_id) DO NOTHING;

-- المستودع والفرع
INSERT INTO public.warehouses (id, company_id, name, name_en, code, is_main, is_active)
VALUES ('b2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'المستودع الرئيسي', 'Main Warehouse', 'WH-001', true, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.branches (id, company_id, name, address, is_active)
VALUES ('d4444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 'الفرع الرئيسي', 'الرياض', true)
ON CONFLICT (id) DO NOTHING;

-- الفترة المالية
INSERT INTO public.fiscal_periods (id, company_id, name, start_date, end_date, status, is_active)
VALUES ('c3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'السنة المالية 2026', '2026-01-01', '2026-12-31', 'open', true)
ON CONFLICT (id) DO NOTHING;

-- العميل النقدي
INSERT INTO public.customers (id, company_id, name, phone, is_general, cash_only, is_active)
VALUES ('f6666666-6666-6666-6666-666666666666', 'a1111111-1111-1111-1111-111111111111', 'عميل نقدي', '', true, true, true)
ON CONFLICT (id) DO NOTHING;

-- منتج تجريبي
INSERT INTO public.products (id, company_id, name, name_en, sku, category, unit, price, cost, quantity, min_quantity, is_active)
VALUES ('a7777777-7777-7777-7777-777777777777', 'a1111111-1111-1111-1111-111111111111', 'فلتر زيت - تويوتا', 'Oil Filter - Toyota', 'OIL-FLT-001', 'فلاتر', 'قطعة', 45.00, 30.00, 100, 10, true)
ON CONFLICT (id) DO NOTHING;

-- إنشاء الحسابات للشركة التجريبية
SELECT public.create_default_accounts('a1111111-1111-1111-1111-111111111111');

SELECT 'تم إعداد قاعدة البيانات بنجاح!' as message;
