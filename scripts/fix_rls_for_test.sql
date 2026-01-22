-- إصلاح سياسات RLS للسماح بالعمليات مع حساب الاختبار
-- ⚠️ هذا للتطوير فقط - لا تستخدمه في الإنتاج!

-- الخيار 1: تعطيل RLS مؤقتاً للاختبار (غير آمن للإنتاج)
-- ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;

-- الخيار 2: إضافة سياسة تسمح بالعمليات على الشركة التجريبية
-- أولاً: حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "test_company_insert" ON public.customers;
DROP POLICY IF EXISTS "test_company_select" ON public.customers;
DROP POLICY IF EXISTS "test_company_update" ON public.customers;
DROP POLICY IF EXISTS "test_company_delete" ON public.customers;

-- ثانياً: إضافة سياسات جديدة للشركة التجريبية
-- سياسة القراءة
CREATE POLICY "test_company_select" ON public.customers
FOR SELECT USING (
    company_id = 'a1111111-1111-1111-1111-111111111111'
    OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- سياسة الإدراج
CREATE POLICY "test_company_insert" ON public.customers
FOR INSERT WITH CHECK (
    company_id = 'a1111111-1111-1111-1111-111111111111'
    OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- سياسة التحديث
CREATE POLICY "test_company_update" ON public.customers
FOR UPDATE USING (
    company_id = 'a1111111-1111-1111-1111-111111111111'
    OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- سياسة الحذف
CREATE POLICY "test_company_delete" ON public.customers
FOR DELETE USING (
    company_id = 'a1111111-1111-1111-1111-111111111111'
    OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- ثالثاً: نفس الشيء لجدول الموردين
DROP POLICY IF EXISTS "test_company_insert" ON public.suppliers;
DROP POLICY IF EXISTS "test_company_select" ON public.suppliers;
DROP POLICY IF EXISTS "test_company_update" ON public.suppliers;
DROP POLICY IF EXISTS "test_company_delete" ON public.suppliers;

CREATE POLICY "test_company_select" ON public.suppliers
FOR SELECT USING (
    company_id = 'a1111111-1111-1111-1111-111111111111'
    OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "test_company_insert" ON public.suppliers
FOR INSERT WITH CHECK (
    company_id = 'a1111111-1111-1111-1111-111111111111'
    OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "test_company_update" ON public.suppliers
FOR UPDATE USING (
    company_id = 'a1111111-1111-1111-1111-111111111111'
    OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "test_company_delete" ON public.suppliers
FOR DELETE USING (
    company_id = 'a1111111-1111-1111-1111-111111111111'
    OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- رابعاً: التحقق من السياسات
SELECT tablename, policyname, cmd FROM pg_policies 
WHERE tablename IN ('customers', 'suppliers') 
ORDER BY tablename, policyname;
