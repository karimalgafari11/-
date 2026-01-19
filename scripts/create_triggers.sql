-- =====================================================
-- إنشاء Trigger لإنشاء Profile تلقائياً عند التسجيل
-- شغّل هذا السكربت في Supabase SQL Editor
-- =====================================================

-- 1. إنشاء دالة لإنشاء Profile تلقائياً
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- إنشاء profile أساسي للمستخدم الجديد
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

-- 2. إنشاء Trigger على جدول auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. دالة لإنشاء شركة مع الإعدادات الافتراضية
CREATE OR REPLACE FUNCTION public.create_company_with_defaults(
    p_name TEXT,
    p_email TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_company_id UUID;
BEGIN
    -- إنشاء الشركة
    INSERT INTO public.companies (name, email)
    VALUES (p_name, p_email)
    RETURNING id INTO v_company_id;
    
    -- إنشاء الإعدادات الافتراضية
    INSERT INTO public.company_settings (company_id, currency, tax_enabled, tax_rate, invoice_prefix)
    VALUES (v_company_id, 'SAR', true, 15.0, 'INV-');
    
    -- إنشاء المستودع الرئيسي
    INSERT INTO public.warehouses (company_id, name, name_en, code, is_main)
    VALUES (v_company_id, 'المستودع الرئيسي', 'Main Warehouse', 'WH-001', true);
    
    -- إنشاء الفرع الرئيسي
    INSERT INTO public.branches (company_id, name, is_active)
    VALUES (v_company_id, 'الفرع الرئيسي', true);
    
    -- إنشاء الفترة المالية الحالية
    INSERT INTO public.fiscal_periods (company_id, name, start_date, end_date, status, is_active)
    VALUES (
        v_company_id,
        'السنة المالية ' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT,
        DATE_TRUNC('year', CURRENT_DATE)::DATE,
        (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year' - INTERVAL '1 day')::DATE,
        'open',
        true
    );
    
    -- إنشاء العميل النقدي العام
    INSERT INTO public.customers (company_id, name, is_general, cash_only, is_active)
    VALUES (v_company_id, 'عميل نقدي', true, true, true);
    
    -- ربط المستخدم بالشركة إذا تم تحديده
    IF p_user_id IS NOT NULL THEN
        UPDATE public.profiles
        SET company_id = v_company_id
        WHERE id = p_user_id;
    END IF;
    
    RETURN v_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. إنشاء الحسابات الرئيسية للشركة
CREATE OR REPLACE FUNCTION public.create_default_accounts(p_company_id UUID)
RETURNS VOID AS $$
BEGIN
    -- الأصول
    INSERT INTO public.accounts (company_id, code, name, name_en, account_type, type, is_header, level) VALUES
    (p_company_id, '1', 'الأصول', 'Assets', 'asset', 'asset', true, 1),
    (p_company_id, '11', 'النقد والبنوك', 'Cash & Banks', 'asset', 'asset', true, 2),
    (p_company_id, '111', 'الصندوق', 'Cash', 'asset', 'asset', false, 3),
    (p_company_id, '112', 'البنك', 'Bank', 'asset', 'asset', false, 3),
    (p_company_id, '12', 'المخزون', 'Inventory', 'asset', 'asset', false, 2),
    (p_company_id, '13', 'العملاء', 'Accounts Receivable', 'asset', 'asset', false, 2)
    ON CONFLICT DO NOTHING;

    -- الخصوم
    INSERT INTO public.accounts (company_id, code, name, name_en, account_type, type, is_header, level) VALUES
    (p_company_id, '2', 'الخصوم', 'Liabilities', 'liability', 'liability', true, 1),
    (p_company_id, '21', 'الموردون', 'Accounts Payable', 'liability', 'liability', false, 2)
    ON CONFLICT DO NOTHING;

    -- حقوق الملكية
    INSERT INTO public.accounts (company_id, code, name, name_en, account_type, type, is_header, level) VALUES
    (p_company_id, '3', 'حقوق الملكية', 'Equity', 'equity', 'equity', true, 1),
    (p_company_id, '31', 'رأس المال', 'Capital', 'equity', 'equity', false, 2)
    ON CONFLICT DO NOTHING;

    -- الإيرادات
    INSERT INTO public.accounts (company_id, code, name, name_en, account_type, type, is_header, level) VALUES
    (p_company_id, '4', 'الإيرادات', 'Revenue', 'revenue', 'revenue', true, 1),
    (p_company_id, '41', 'المبيعات', 'Sales', 'revenue', 'revenue', false, 2)
    ON CONFLICT DO NOTHING;

    -- المصروفات
    INSERT INTO public.accounts (company_id, code, name, name_en, account_type, type, is_header, level) VALUES
    (p_company_id, '5', 'المصروفات', 'Expenses', 'expense', 'expense', true, 1),
    (p_company_id, '51', 'تكلفة المبيعات', 'Cost of Goods Sold', 'expense', 'expense', false, 2),
    (p_company_id, '52', 'مصروفات عامة', 'General Expenses', 'expense', 'expense', false, 2)
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'تم إنشاء Triggers والدوال بنجاح!' as message;
