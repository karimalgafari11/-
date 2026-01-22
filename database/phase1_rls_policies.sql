-- =====================================================
-- ERP System - Phase 1: RLS Policies
-- سياسات أمان Row Level Security
-- =====================================================

-- =====================================================
-- 1. RLS للـ TENANTS
-- =====================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- فقط system admins يمكنهم رؤية جميع الـ tenants
CREATE POLICY "Super admins view all tenants" ON tenants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_company_roles ucr
            JOIN roles r ON r.id = ucr.role_id
            WHERE ucr.user_id = auth.uid()
            AND r.name = 'super_admin'
        )
    );

-- المستخدم يرى tenant الخاص به فقط
CREATE POLICY "Users view own tenant" ON tenants
    FOR SELECT USING (
        id IN (
            SELECT c.tenant_id 
            FROM user_company_roles ucr
            JOIN companies c ON c.id = ucr.company_id
            WHERE ucr.user_id = auth.uid()
        )
    );

-- =====================================================
-- 2. تحديث RLS للـ COMPANIES
-- =====================================================
-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "Users view own company" ON companies;
DROP POLICY IF EXISTS "Managers update company" ON companies;

-- المستخدم يرى الشركات المنتمي إليها فقط
CREATE POLICY "Users view assigned companies" ON companies
    FOR SELECT USING (
        id IN (
            SELECT company_id FROM user_company_roles 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- المالك أو الـ admin يمكنهم التحديث
CREATE POLICY "Owners and admins update company" ON companies
    FOR UPDATE USING (
        id IN (
            SELECT ucr.company_id 
            FROM user_company_roles ucr
            JOIN roles r ON r.id = ucr.role_id
            WHERE ucr.user_id = auth.uid()
            AND ucr.is_active = true
            AND (ucr.is_owner = true OR r.name IN ('admin', 'super_admin'))
        )
    );

-- المستخدم المصادق يمكنه إنشاء شركة (ويصبح مالكها)
CREATE POLICY "Authenticated users create companies" ON companies
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- 3. RLS للـ ROLES
-- =====================================================
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- عرض الأدوار: أدوار النظام + أدوار الـ tenant
CREATE POLICY "View system and tenant roles" ON roles
    FOR SELECT USING (
        is_system = true  -- أدوار النظام للجميع
        OR tenant_id IN (
            SELECT c.tenant_id 
            FROM user_company_roles ucr
            JOIN companies c ON c.id = ucr.company_id
            WHERE ucr.user_id = auth.uid()
        )
    );

-- فقط super_admin يمكنه إنشاء أدوار مخصصة
CREATE POLICY "Admins create custom roles" ON roles
    FOR INSERT WITH CHECK (
        is_system = false  -- لا يمكن إنشاء أدوار نظام
        AND EXISTS (
            SELECT 1 FROM user_company_roles ucr
            JOIN roles r ON r.id = ucr.role_id
            WHERE ucr.user_id = auth.uid()
            AND r.name IN ('admin', 'super_admin')
        )
    );

-- =====================================================
-- 4. RLS للـ PERMISSIONS
-- =====================================================
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

-- الجميع يمكنهم عرض قائمة الصلاحيات
CREATE POLICY "Everyone can view permissions" ON permissions
    FOR SELECT USING (true);

-- لا أحد يمكنه تعديل الصلاحيات (تُدار من النظام فقط)
CREATE POLICY "No one modifies permissions" ON permissions
    FOR ALL USING (false);

-- =====================================================
-- 5. RLS للـ USER_COMPANY_ROLES
-- =====================================================
ALTER TABLE user_company_roles ENABLE ROW LEVEL SECURITY;

-- المستخدم يرى صلاحياته الخاصة
CREATE POLICY "Users view own roles" ON user_company_roles
    FOR SELECT USING (user_id = auth.uid());

-- admin/manager يرون أعضاء شركاتهم
CREATE POLICY "Admins view company members" ON user_company_roles
    FOR SELECT USING (
        company_id IN (
            SELECT ucr.company_id 
            FROM user_company_roles ucr
            JOIN roles r ON r.id = ucr.role_id
            WHERE ucr.user_id = auth.uid()
            AND ucr.is_active = true
            AND r.name IN ('admin', 'manager', 'super_admin')
        )
    );

-- admin يمكنه إضافة مستخدمين للشركة
CREATE POLICY "Admins add company members" ON user_company_roles
    FOR INSERT WITH CHECK (
        -- المستخدم يضيف نفسه (عند إنشاء شركة)
        user_id = auth.uid()
        OR
        -- أو admin يضيف مستخدمين آخرين
        company_id IN (
            SELECT ucr.company_id 
            FROM user_company_roles ucr
            JOIN roles r ON r.id = ucr.role_id
            WHERE ucr.user_id = auth.uid()
            AND ucr.is_active = true
            AND r.name IN ('admin', 'super_admin')
        )
    );

-- admin يمكنه تحديث صلاحيات المستخدمين (ما عدا المالك)
CREATE POLICY "Admins update member roles" ON user_company_roles
    FOR UPDATE USING (
        company_id IN (
            SELECT ucr.company_id 
            FROM user_company_roles ucr
            JOIN roles r ON r.id = ucr.role_id
            WHERE ucr.user_id = auth.uid()
            AND ucr.is_active = true
            AND r.name IN ('admin', 'super_admin')
        )
        AND is_owner = false  -- لا يمكن تغيير صلاحيات المالك
    );

-- admin يمكنه إزالة مستخدمين (ما عدا المالك)
CREATE POLICY "Admins remove members" ON user_company_roles
    FOR DELETE USING (
        company_id IN (
            SELECT ucr.company_id 
            FROM user_company_roles ucr
            JOIN roles r ON r.id = ucr.role_id
            WHERE ucr.user_id = auth.uid()
            AND ucr.is_active = true
            AND r.name IN ('admin', 'super_admin')
        )
        AND is_owner = false
        AND user_id != auth.uid()  -- لا يمكن حذف نفسه
    );

-- =====================================================
-- 6. تحديث RLS للـ PROFILES
-- =====================================================
DROP POLICY IF EXISTS "Users view same company profiles" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;

-- المستخدم يرى زملاءه في الشركات المشتركة
CREATE POLICY "Users view company colleagues" ON profiles
    FOR SELECT USING (
        id = auth.uid()  -- يرى نفسه دائماً
        OR id IN (
            -- يرى زملاء الشركات المنتمي إليها
            SELECT ucr2.user_id 
            FROM user_company_roles ucr1
            JOIN user_company_roles ucr2 ON ucr2.company_id = ucr1.company_id
            WHERE ucr1.user_id = auth.uid()
        )
    );

-- المستخدم يحدث ملفه فقط
CREATE POLICY "Users update own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- إنشاء profile عند التسجيل
CREATE POLICY "Create own profile" ON profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- =====================================================
-- 7. تحديث Trigger لإنشاء المستخدم
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_company_id UUID;
    admin_role_id UUID;
BEGIN
    -- إنشاء الملف الشخصي
    INSERT INTO public.profiles (id, name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        'employee'
    );
    
    -- إنشاء شركة افتراضية للمستخدم الجديد
    INSERT INTO public.companies (id, name, email)
    VALUES (
        gen_random_uuid(),
        COALESCE(NEW.raw_user_meta_data->>'company_name', 'شركتي'),
        NEW.email
    )
    RETURNING id INTO new_company_id;
    
    -- تحديث profile بـ company_id
    UPDATE public.profiles 
    SET company_id = new_company_id 
    WHERE id = NEW.id;
    
    -- جلب role_id للـ admin
    SELECT id INTO admin_role_id 
    FROM public.roles 
    WHERE name = 'admin' AND is_system = true
    LIMIT 1;
    
    -- ربط المستخدم بالشركة كمالك وadmin
    INSERT INTO public.user_company_roles (user_id, company_id, role_id, is_default, is_owner)
    VALUES (NEW.id, new_company_id, admin_role_id, true, true);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- نهاية Phase 1 RLS
-- =====================================================
