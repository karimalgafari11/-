-- إنشاء الشركة التجريبية للاختبار المحلي
-- يجب تنفيذ هذا في Supabase SQL Editor

-- 1. إنشاء الشركة التجريبية
INSERT INTO public.companies (id, name, email, phone)
VALUES (
    'a1111111-1111-1111-1111-111111111111',
    'شركة الاختبار',
    'test@alzhra.com',
    '0500000000'
)
ON CONFLICT (id) DO NOTHING;

-- 2. إنشاء الملف الشخصي للمستخدم التجريبي (اختياري)
-- هذا لن يعمل مع test credentials لأنها تتجاوز Supabase Auth
-- لكن مطلوب إذا أردت استخدام حساب Supabase حقيقي

-- 3. التحقق من إنشاء الشركة
SELECT * FROM public.companies WHERE id = 'a1111111-1111-1111-1111-111111111111';
