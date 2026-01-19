-- =====================================================
-- سكربت إصلاح إنشاء الشركة التلقائي للمستخدمين الجدد
-- شغّل هذا السكربت في Supabase SQL Editor
-- =====================================================

-- ==================== الجزء 1: تحديث الـ Trigger ====================

-- دالة محسّنة لمعالجة المستخدمين الجدد
-- تنشئ profile + company + إعدادات افتراضية تلقائياً
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_company_id UUID;
    v_user_name TEXT;
BEGIN
    -- استخراج اسم المستخدم
    v_user_name := COALESCE(
        NEW.raw_user_meta_data->>'name', 
        split_part(NEW.email, '@', 1),
        'مستخدم جديد'
    );
    
    -- 1. إنشاء شركة جديدة للمستخدم
    INSERT INTO public.companies (name, email)
    VALUES (v_user_name || ' - شركة', NEW.email)
    RETURNING id INTO v_company_id;
    
    -- 2. إنشاء إعدادات الشركة
    INSERT INTO public.company_settings (company_id, currency, tax_enabled, tax_rate, invoice_prefix)
    VALUES (v_company_id, 'SAR', true, 15.0, 'INV-')
    ON CONFLICT (company_id) DO NOTHING;
    
    -- 3. إنشاء المستودع الرئيسي
    INSERT INTO public.warehouses (company_id, name, name_en, code, is_main, is_active)
    VALUES (v_company_id, 'المستودع الرئيسي', 'Main Warehouse', 'WH-001', true, true)
    ON CONFLICT DO NOTHING;
    
    -- 4. إنشاء الفرع الرئيسي
    INSERT INTO public.branches (company_id, name, is_active)
    VALUES (v_company_id, 'الفرع الرئيسي', true)
    ON CONFLICT DO NOTHING;
    
    -- 5. إنشاء الفترة المالية
    INSERT INTO public.fiscal_periods (company_id, name, start_date, end_date, status, is_active)
    VALUES (
        v_company_id,
        'السنة المالية ' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT,
        DATE_TRUNC('year', CURRENT_DATE)::DATE,
        (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year' - INTERVAL '1 day')::DATE,
        'open',
        true
    )
    ON CONFLICT DO NOTHING;
    
    -- 6. إنشاء العميل النقدي
    INSERT INTO public.customers (company_id, name, is_general, cash_only, is_active)
    VALUES (v_company_id, 'عميل نقدي', true, true, true)
    ON CONFLICT DO NOTHING;
    
    -- 7. إنشاء الملف الشخصي مع company_id
    INSERT INTO public.profiles (id, company_id, name, email, role, is_active)
    VALUES (
        NEW.id,
        v_company_id,
        v_user_name,
        NEW.email,
        'manager',
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        company_id = EXCLUDED.company_id,
        name = EXCLUDED.name;
    
    -- 8. إنشاء الحسابات الافتراضية
    PERFORM public.create_default_accounts(v_company_id);
    
    RAISE NOTICE 'تم إنشاء حساب للمستخدم % مع شركة %', NEW.email, v_company_id;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- في حالة فشل إنشاء الشركة، أنشئ الملف الشخصي فقط
    RAISE WARNING 'خطأ في إنشاء الشركة: % - إنشاء الملف الشخصي فقط', SQLERRM;
    
    INSERT INTO public.profiles (id, name, email, role, is_active)
    VALUES (
        NEW.id,
        v_user_name,
        NEW.email,
        'manager',
        true
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إعادة إنشاء الـ Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==================== الجزء 2: إصلاح المستخدمين الموجودين بدون شركة ====================

-- دالة لإصلاح المستخدمين الحاليين الذين ليس لديهم company_id
CREATE OR REPLACE FUNCTION public.fix_users_without_company()
RETURNS TABLE(user_id UUID, user_email TEXT, new_company_id UUID) AS $$
DECLARE
    rec RECORD;
    v_company_id UUID;
BEGIN
    FOR rec IN 
        SELECT p.id, p.name, p.email
        FROM public.profiles p
        WHERE p.company_id IS NULL
    LOOP
        -- إنشاء شركة لكل مستخدم بدون شركة
        INSERT INTO public.companies (name, email)
        VALUES (COALESCE(rec.name, 'مستخدم') || ' - شركة', rec.email)
        RETURNING id INTO v_company_id;
        
        -- إنشاء الإعدادات والبيانات الافتراضية
        INSERT INTO public.company_settings (company_id, currency, tax_enabled, tax_rate, invoice_prefix)
        VALUES (v_company_id, 'SAR', true, 15.0, 'INV-')
        ON CONFLICT (company_id) DO NOTHING;
        
        INSERT INTO public.warehouses (company_id, name, name_en, code, is_main, is_active)
        VALUES (v_company_id, 'المستودع الرئيسي', 'Main Warehouse', 'WH-001', true, true)
        ON CONFLICT DO NOTHING;
        
        INSERT INTO public.branches (company_id, name, is_active)
        VALUES (v_company_id, 'الفرع الرئيسي', true)
        ON CONFLICT DO NOTHING;
        
        INSERT INTO public.fiscal_periods (company_id, name, start_date, end_date, status, is_active)
        VALUES (
            v_company_id,
            'السنة المالية ' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT,
            DATE_TRUNC('year', CURRENT_DATE)::DATE,
            (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year' - INTERVAL '1 day')::DATE,
            'open',
            true
        )
        ON CONFLICT DO NOTHING;
        
        INSERT INTO public.customers (company_id, name, is_general, cash_only, is_active)
        VALUES (v_company_id, 'عميل نقدي', true, true, true)
        ON CONFLICT DO NOTHING;
        
        -- تحديث الملف الشخصي
        UPDATE public.profiles SET company_id = v_company_id WHERE id = rec.id;
        
        -- إنشاء الحسابات الافتراضية
        PERFORM public.create_default_accounts(v_company_id);
        
        RETURN NEXT;
        user_id := rec.id;
        user_email := rec.email;
        new_company_id := v_company_id;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تشغيل الإصلاح للمستخدمين الحاليين
SELECT * FROM public.fix_users_without_company();

-- ==================== الجزء 3: التحقق من النتائج ====================

-- عرض المستخدمين وشركاتهم
SELECT 
    p.id as user_id,
    p.name as user_name,
    p.email,
    p.company_id,
    c.name as company_name
FROM public.profiles p
LEFT JOIN public.companies c ON c.id = p.company_id
ORDER BY p.created_at DESC;

SELECT 'تم إصلاح إنشاء الشركة التلقائي بنجاح!' as message;
