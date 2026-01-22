-- =====================================================
-- ERP System - Phase 1: Core Schema
-- الجداول الأساسية والأدوار والصلاحيات
-- =====================================================

-- =====================================================
-- 1. TENANTS - الفصل المادي للبيانات (Multi-Tenancy)
-- =====================================================
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,  -- للـ subdomain أو URL
    is_active BOOLEAN DEFAULT true,
    subscription_plan TEXT DEFAULT 'free',  -- free, basic, pro, enterprise
    subscription_expires_at TIMESTAMPTZ,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);

-- =====================================================
-- 2. تحديث COMPANIES - إضافة tenant_id
-- =====================================================
-- إضافة العمود إذا لم يكن موجوداً
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE companies ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
END $$;

-- إضافة فهرس
CREATE INDEX IF NOT EXISTS idx_companies_tenant ON companies(tenant_id);

-- =====================================================
-- 3. ROLES - نظام الأدوار
-- =====================================================
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,  -- الاسم بالعربي
    description TEXT,
    is_system BOOLEAN DEFAULT false,  -- أدوار النظام لا تُحذف
    permissions JSONB DEFAULT '[]',   -- قائمة الصلاحيات
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- منع تكرار الاسم في نفس الـ tenant
    UNIQUE(tenant_id, name)
);

-- إدخال الأدوار الافتراضية (System Roles)
INSERT INTO roles (id, tenant_id, name, name_ar, description, is_system, permissions) VALUES
    ('00000000-0000-0000-0000-000000000001', NULL, 'super_admin', 'مدير النظام', 'صلاحيات كاملة على النظام', true, '["*"]'),
    ('00000000-0000-0000-0000-000000000002', NULL, 'admin', 'مدير', 'صلاحيات إدارية كاملة على الشركة', true, '["company.*", "users.*", "reports.*"]'),
    ('00000000-0000-0000-0000-000000000003', NULL, 'manager', 'مشرف', 'صلاحيات إشرافية', true, '["sales.*", "purchases.*", "inventory.*", "reports.view"]'),
    ('00000000-0000-0000-0000-000000000004', NULL, 'accountant', 'محاسب', 'صلاحيات محاسبية', true, '["accounting.*", "reports.*", "sales.view", "purchases.view"]'),
    ('00000000-0000-0000-0000-000000000005', NULL, 'employee', 'موظف', 'صلاحيات محدودة', true, '["sales.create", "sales.view", "inventory.view"]')
ON CONFLICT (tenant_id, name) DO NOTHING;

-- =====================================================
-- 4. PERMISSIONS - الصلاحيات التفصيلية
-- =====================================================
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,  -- مثل: sales.create, inventory.delete
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    module TEXT NOT NULL,       -- الوحدة: sales, purchases, inventory, accounting
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إدخال الصلاحيات الأساسية
INSERT INTO permissions (code, name, name_ar, module, description) VALUES
    -- المبيعات
    ('sales.view', 'View Sales', 'عرض المبيعات', 'sales', 'عرض فواتير المبيعات'),
    ('sales.create', 'Create Sales', 'إنشاء مبيعات', 'sales', 'إنشاء فواتير مبيعات جديدة'),
    ('sales.edit', 'Edit Sales', 'تعديل المبيعات', 'sales', 'تعديل فواتير المبيعات'),
    ('sales.delete', 'Delete Sales', 'حذف المبيعات', 'sales', 'حذف فواتير المبيعات'),
    ('sales.approve', 'Approve Sales', 'اعتماد المبيعات', 'sales', 'اعتماد فواتير المبيعات'),
    
    -- المشتريات
    ('purchases.view', 'View Purchases', 'عرض المشتريات', 'purchases', 'عرض فواتير المشتريات'),
    ('purchases.create', 'Create Purchases', 'إنشاء مشتريات', 'purchases', 'إنشاء فواتير مشتريات'),
    ('purchases.edit', 'Edit Purchases', 'تعديل المشتريات', 'purchases', 'تعديل فواتير المشتريات'),
    ('purchases.delete', 'Delete Purchases', 'حذف المشتريات', 'purchases', 'حذف فواتير المشتريات'),
    
    -- المخزون
    ('inventory.view', 'View Inventory', 'عرض المخزون', 'inventory', 'عرض المخزون والمنتجات'),
    ('inventory.create', 'Create Products', 'إنشاء منتجات', 'inventory', 'إنشاء منتجات جديدة'),
    ('inventory.edit', 'Edit Products', 'تعديل المنتجات', 'inventory', 'تعديل المنتجات'),
    ('inventory.delete', 'Delete Products', 'حذف المنتجات', 'inventory', 'حذف المنتجات'),
    ('inventory.adjust', 'Adjust Stock', 'تعديل المخزون', 'inventory', 'تعديل كميات المخزون'),
    
    -- المحاسبة
    ('accounting.view', 'View Accounting', 'عرض المحاسبة', 'accounting', 'عرض الحسابات والقيود'),
    ('accounting.create', 'Create Entries', 'إنشاء قيود', 'accounting', 'إنشاء قيود محاسبية'),
    ('accounting.approve', 'Approve Entries', 'اعتماد القيود', 'accounting', 'اعتماد القيود المحاسبية'),
    ('accounting.close_period', 'Close Period', 'إغلاق الفترة', 'accounting', 'إغلاق الفترة المحاسبية'),
    
    -- التقارير
    ('reports.view', 'View Reports', 'عرض التقارير', 'reports', 'عرض التقارير الأساسية'),
    ('reports.export', 'Export Reports', 'تصدير التقارير', 'reports', 'تصدير التقارير'),
    ('reports.financial', 'Financial Reports', 'التقارير المالية', 'reports', 'عرض التقارير المالية'),
    
    -- المستخدمين
    ('users.view', 'View Users', 'عرض المستخدمين', 'users', 'عرض قائمة المستخدمين'),
    ('users.create', 'Create Users', 'إنشاء مستخدمين', 'users', 'إنشاء مستخدمين جدد'),
    ('users.edit', 'Edit Users', 'تعديل المستخدمين', 'users', 'تعديل بيانات المستخدمين'),
    ('users.delete', 'Delete Users', 'حذف المستخدمين', 'users', 'حذف المستخدمين'),
    ('users.assign_roles', 'Assign Roles', 'تعيين الأدوار', 'users', 'تعيين أدوار للمستخدمين'),
    
    -- الشركة
    ('company.view', 'View Company', 'عرض الشركة', 'company', 'عرض بيانات الشركة'),
    ('company.edit', 'Edit Company', 'تعديل الشركة', 'company', 'تعديل بيانات الشركة'),
    ('company.settings', 'Company Settings', 'إعدادات الشركة', 'company', 'تعديل إعدادات الشركة')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 5. USER_COMPANY_ROLES - ربط المستخدم بالشركة والدور
-- =====================================================
CREATE TABLE IF NOT EXISTS user_company_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    is_default BOOLEAN DEFAULT false,   -- الشركة الافتراضية للمستخدم
    is_owner BOOLEAN DEFAULT false,     -- مالك الشركة
    is_active BOOLEAN DEFAULT true,
    custom_permissions JSONB DEFAULT '[]',  -- صلاحيات إضافية خاصة
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- منع تكرار المستخدم في نفس الشركة
    UNIQUE(user_id, company_id)
);

-- فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_ucr_user ON user_company_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_ucr_company ON user_company_roles(company_id);
CREATE INDEX IF NOT EXISTS idx_ucr_role ON user_company_roles(role_id);

-- =====================================================
-- 6. تحسين AUDIT_LOGS
-- =====================================================
-- التأكد من وجود الأعمدة المطلوبة
DO $$ 
BEGIN
    -- إضافة tenant_id إذا لم يكن موجوداً
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activity_logs' AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE activity_logs ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    END IF;
    
    -- إضافة severity
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activity_logs' AND column_name = 'severity'
    ) THEN
        ALTER TABLE activity_logs ADD COLUMN severity TEXT DEFAULT 'info' 
            CHECK (severity IN ('info', 'warning', 'error', 'critical'));
    END IF;
END $$;

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- دالة للحصول على tenant_id للمستخدم الحالي
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT c.tenant_id 
        FROM user_company_roles ucr
        JOIN companies c ON c.id = ucr.company_id
        WHERE ucr.user_id = auth.uid() 
        AND ucr.is_default = true
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة للحصول على company_id للمستخدم الحالي
CREATE OR REPLACE FUNCTION get_current_company_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT company_id 
        FROM user_company_roles 
        WHERE user_id = auth.uid() 
        AND is_default = true
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة للتحقق من صلاحية معينة
CREATE OR REPLACE FUNCTION has_permission(permission_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_permissions JSONB;
    role_permissions JSONB;
BEGIN
    -- جلب صلاحيات الدور والمستخدم
    SELECT r.permissions, ucr.custom_permissions
    INTO role_permissions, user_permissions
    FROM user_company_roles ucr
    JOIN roles r ON r.id = ucr.role_id
    WHERE ucr.user_id = auth.uid()
    AND ucr.is_default = true
    AND ucr.is_active = true;
    
    -- التحقق من صلاحية كاملة (*)
    IF role_permissions ? '*' THEN
        RETURN true;
    END IF;
    
    -- التحقق من الصلاحية في الدور
    IF role_permissions ? permission_code THEN
        RETURN true;
    END IF;
    
    -- التحقق من صلاحية الوحدة (module.*)
    IF role_permissions ? (split_part(permission_code, '.', 1) || '.*') THEN
        RETURN true;
    END IF;
    
    -- التحقق من الصلاحيات المخصصة
    IF user_permissions ? permission_code THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. تحديث PROFILES للتبسيط
-- =====================================================
-- إزالة role من profiles (سيكون في user_company_roles)
-- لكن نبقي العمود للتوافق مع الكود الحالي

COMMENT ON COLUMN profiles.role IS 'DEPRECATED: Use user_company_roles instead';

-- =====================================================
-- نهاية Phase 1 Schema
-- =====================================================
