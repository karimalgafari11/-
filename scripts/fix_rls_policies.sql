-- =====================================================
-- سكربت إصلاح سياسات RLS لنظام الزهراء
-- شغّل هذا السكربت في Supabase SQL Editor قبل setup_initial_data.sql
-- =====================================================

-- تعطيل RLS مؤقتًا للجداول الأساسية لإتاحة إنشاء البيانات
-- هذا ضروري لأن المستخدم الجديد لا يملك شركة بعد

-- 1. السماح بإنشاء شركات جديدة لأي مستخدم مسجل
DROP POLICY IF EXISTS "allow_insert_companies" ON public.companies;
CREATE POLICY "allow_insert_companies" ON public.companies
    FOR INSERT TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "allow_read_own_company" ON public.companies;
CREATE POLICY "allow_read_own_company" ON public.companies
    FOR SELECT TO authenticated
    USING (true);

-- 2. السماح بإنشاء وقراءة الملفات الشخصية
DROP POLICY IF EXISTS "allow_insert_profiles" ON public.profiles;
CREATE POLICY "allow_insert_profiles" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "allow_update_own_profile" ON public.profiles;
CREATE POLICY "allow_update_own_profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid());

DROP POLICY IF EXISTS "allow_read_profiles" ON public.profiles;
CREATE POLICY "allow_read_profiles" ON public.profiles
    FOR SELECT TO authenticated
    USING (true);

-- 3. السماح للمستخدمين المسجلين بالوصول لبيانات شركتهم
-- المنتجات
DROP POLICY IF EXISTS "allow_company_products" ON public.products;
CREATE POLICY "allow_company_products" ON public.products
    FOR ALL TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- العملاء
DROP POLICY IF EXISTS "allow_company_customers" ON public.customers;
CREATE POLICY "allow_company_customers" ON public.customers
    FOR ALL TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- الموردين
DROP POLICY IF EXISTS "allow_company_suppliers" ON public.suppliers;
CREATE POLICY "allow_company_suppliers" ON public.suppliers
    FOR ALL TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- المستودعات
DROP POLICY IF EXISTS "allow_company_warehouses" ON public.warehouses;
CREATE POLICY "allow_company_warehouses" ON public.warehouses
    FOR ALL TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- تفعيل RLS على الجداول إذا لم تكن مفعلة
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;

SELECT 'تم إعداد سياسات RLS بنجاح!' as message;
