-- =====================================================
-- إعداد البيانات الأساسية لنظام الزهراء
-- شغّل هذا السكربت في Supabase SQL Editor
-- =====================================================

-- 1. إنشاء الشركة الرئيسية
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

-- 2. إنشاء إعدادات الشركة
INSERT INTO public.company_settings (company_id, currency, tax_enabled, tax_rate, invoice_prefix)
VALUES (
    'a1111111-1111-1111-1111-111111111111',
    'SAR',
    true,
    15.0,
    'INV-'
) ON CONFLICT (company_id) DO NOTHING;

-- 3. إنشاء المستودع الرئيسي
INSERT INTO public.warehouses (id, company_id, name, name_en, code, is_main, is_active)
VALUES (
    'b2222222-2222-2222-2222-222222222222',
    'a1111111-1111-1111-1111-111111111111',
    'المستودع الرئيسي',
    'Main Warehouse',
    'WH-001',
    true,
    true
) ON CONFLICT (id) DO NOTHING;

-- 4. إنشاء الفترة المالية الحالية
INSERT INTO public.fiscal_periods (id, company_id, name, start_date, end_date, status, is_active)
VALUES (
    'c3333333-3333-3333-3333-333333333333',
    'a1111111-1111-1111-1111-111111111111',
    'السنة المالية 2026',
    '2026-01-01',
    '2026-12-31',
    'open',
    true
) ON CONFLICT (id) DO NOTHING;

-- 5. إنشاء فرع رئيسي
INSERT INTO public.branches (id, company_id, name, address, is_active)
VALUES (
    'd4444444-4444-4444-4444-444444444444',
    'a1111111-1111-1111-1111-111111111111',
    'الفرع الرئيسي',
    'الرياض',
    true
) ON CONFLICT (id) DO NOTHING;

-- 6. إنشاء حسابات رئيسية للشجرة المحاسبية
-- الأصول
INSERT INTO public.accounts (id, company_id, code, name, name_en, account_type, type, is_header, level) VALUES
('e5555555-5555-5555-5555-555555555001', 'a1111111-1111-1111-1111-111111111111', '1', 'الأصول', 'Assets', 'asset', 'asset', true, 1),
('e5555555-5555-5555-5555-555555555011', 'a1111111-1111-1111-1111-111111111111', '11', 'النقد والبنوك', 'Cash & Banks', 'asset', 'asset', true, 2),
('e5555555-5555-5555-5555-555555555111', 'a1111111-1111-1111-1111-111111111111', '111', 'الصندوق', 'Cash', 'asset', 'asset', false, 3),
('e5555555-5555-5555-5555-555555555112', 'a1111111-1111-1111-1111-111111111111', '112', 'البنك', 'Bank', 'asset', 'asset', false, 3),
('e5555555-5555-5555-5555-555555555012', 'a1111111-1111-1111-1111-111111111111', '12', 'المخزون', 'Inventory', 'asset', 'asset', false, 2),
('e5555555-5555-5555-5555-555555555013', 'a1111111-1111-1111-1111-111111111111', '13', 'العملاء', 'Accounts Receivable', 'asset', 'asset', false, 2)
ON CONFLICT (id) DO NOTHING;

-- الخصوم
INSERT INTO public.accounts (id, company_id, code, name, name_en, account_type, type, is_header, level) VALUES
('e5555555-5555-5555-5555-555555555002', 'a1111111-1111-1111-1111-111111111111', '2', 'الخصوم', 'Liabilities', 'liability', 'liability', true, 1),
('e5555555-5555-5555-5555-555555555021', 'a1111111-1111-1111-1111-111111111111', '21', 'الموردون', 'Accounts Payable', 'liability', 'liability', false, 2)
ON CONFLICT (id) DO NOTHING;

-- حقوق الملكية
INSERT INTO public.accounts (id, company_id, code, name, name_en, account_type, type, is_header, level) VALUES
('e5555555-5555-5555-5555-555555555003', 'a1111111-1111-1111-1111-111111111111', '3', 'حقوق الملكية', 'Equity', 'equity', 'equity', true, 1),
('e5555555-5555-5555-5555-555555555031', 'a1111111-1111-1111-1111-111111111111', '31', 'رأس المال', 'Capital', 'equity', 'equity', false, 2)
ON CONFLICT (id) DO NOTHING;

-- الإيرادات
INSERT INTO public.accounts (id, company_id, code, name, name_en, account_type, type, is_header, level) VALUES
('e5555555-5555-5555-5555-555555555004', 'a1111111-1111-1111-1111-111111111111', '4', 'الإيرادات', 'Revenue', 'revenue', 'revenue', true, 1),
('e5555555-5555-5555-5555-555555555041', 'a1111111-1111-1111-1111-111111111111', '41', 'المبيعات', 'Sales', 'revenue', 'revenue', false, 2)
ON CONFLICT (id) DO NOTHING;

-- المصروفات
INSERT INTO public.accounts (id, company_id, code, name, name_en, account_type, type, is_header, level) VALUES
('e5555555-5555-5555-5555-555555555005', 'a1111111-1111-1111-1111-111111111111', '5', 'المصروفات', 'Expenses', 'expense', 'expense', true, 1),
('e5555555-5555-5555-5555-555555555051', 'a1111111-1111-1111-1111-111111111111', '51', 'تكلفة المبيعات', 'Cost of Goods Sold', 'expense', 'expense', false, 2),
('e5555555-5555-5555-5555-555555555052', 'a1111111-1111-1111-1111-111111111111', '52', 'مصروفات عامة', 'General Expenses', 'expense', 'expense', false, 2)
ON CONFLICT (id) DO NOTHING;

-- 7. إنشاء عميل عام للمبيعات النقدية
INSERT INTO public.customers (id, company_id, name, phone, is_general, cash_only, is_active)
VALUES (
    'f6666666-6666-6666-6666-666666666666',
    'a1111111-1111-1111-1111-111111111111',
    'عميل نقدي',
    '',
    true,
    true,
    true
) ON CONFLICT (id) DO NOTHING;

-- 8. إنشاء منتج تجريبي
INSERT INTO public.products (id, company_id, name, name_en, sku, category, unit, price, cost, quantity, min_quantity, is_active)
VALUES (
    'a7777777-7777-7777-7777-777777777777',
    'a1111111-1111-1111-1111-111111111111',
    'فلتر زيت - تويوتا',
    'Oil Filter - Toyota',
    'OIL-FLT-001',
    'فلاتر',
    'قطعة',
    45.00,
    30.00,
    100,
    10,
    true
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- تم! الآن يمكنك تحديث authService.ts بهذا الـ companyId:
-- a1111111-1111-1111-1111-111111111111
-- =====================================================

SELECT 'تم إنشاء البيانات الأساسية بنجاح!' as message;
