-- =====================================================
-- ERP System - Complete Phase 1 Setup
-- سكريبت موحد لإنشاء جميع الجداول الأساسية
-- يجب تنفيذه مرة واحدة على قاعدة بيانات Supabase جديدة
-- =====================================================

-- =====================================================
-- الجزء 1: الجداول الأساسية (Base Tables)
-- =====================================================

-- 1. جدول المستأجرين (Multi-Tenancy)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    subscription_plan TEXT DEFAULT 'free',
    subscription_expires_at TIMESTAMPTZ,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);

-- 2. جدول الشركات
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    name TEXT NOT NULL,
    name_en TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    tax_number TEXT,
    commercial_register TEXT,
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_tenant ON companies(tenant_id);

-- 3. جدول الملفات الشخصية
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'accountant', 'employee')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_company ON profiles(company_id);

-- 4. جدول الأدوار
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);

-- إدخال الأدوار الافتراضية
INSERT INTO roles (id, tenant_id, name, name_ar, description, is_system, permissions) VALUES
    ('00000000-0000-0000-0000-000000000001', NULL, 'super_admin', 'مدير النظام', 'صلاحيات كاملة', true, '["*"]'),
    ('00000000-0000-0000-0000-000000000002', NULL, 'admin', 'مدير', 'صلاحيات إدارية', true, '["company.*", "users.*", "reports.*"]'),
    ('00000000-0000-0000-0000-000000000003', NULL, 'manager', 'مشرف', 'صلاحيات إشرافية', true, '["sales.*", "purchases.*", "inventory.*"]'),
    ('00000000-0000-0000-0000-000000000004', NULL, 'accountant', 'محاسب', 'صلاحيات محاسبية', true, '["accounting.*", "reports.*"]'),
    ('00000000-0000-0000-0000-000000000005', NULL, 'employee', 'موظف', 'صلاحيات محدودة', true, '["sales.create", "sales.view"]')
ON CONFLICT DO NOTHING;

-- 5. جدول الصلاحيات
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    module TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إدخال الصلاحيات الأساسية
INSERT INTO permissions (code, name, name_ar, module) VALUES
    ('sales.view', 'View Sales', 'عرض المبيعات', 'sales'),
    ('sales.create', 'Create Sales', 'إنشاء مبيعات', 'sales'),
    ('sales.edit', 'Edit Sales', 'تعديل المبيعات', 'sales'),
    ('sales.delete', 'Delete Sales', 'حذف المبيعات', 'sales'),
    ('purchases.view', 'View Purchases', 'عرض المشتريات', 'purchases'),
    ('purchases.create', 'Create Purchases', 'إنشاء مشتريات', 'purchases'),
    ('inventory.view', 'View Inventory', 'عرض المخزون', 'inventory'),
    ('inventory.create', 'Create Products', 'إنشاء منتجات', 'inventory'),
    ('accounting.view', 'View Accounting', 'عرض المحاسبة', 'accounting'),
    ('accounting.create', 'Create Entries', 'إنشاء قيود', 'accounting'),
    ('reports.view', 'View Reports', 'عرض التقارير', 'reports'),
    ('users.view', 'View Users', 'عرض المستخدمين', 'users'),
    ('users.create', 'Create Users', 'إنشاء مستخدمين', 'users'),
    ('company.view', 'View Company', 'عرض الشركة', 'company'),
    ('company.edit', 'Edit Company', 'تعديل الشركة', 'company')
ON CONFLICT (code) DO NOTHING;

-- 6. جدول ربط المستخدم بالشركة والدور
CREATE TABLE IF NOT EXISTS user_company_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    is_default BOOLEAN DEFAULT false,
    is_owner BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    custom_permissions JSONB DEFAULT '[]',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, company_id)
);

CREATE INDEX IF NOT EXISTS idx_ucr_user ON user_company_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_ucr_company ON user_company_roles(company_id);

-- 7. جدول سجل النشاط
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    old_data JSONB,
    new_data JSONB,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_company ON activity_logs(company_id);

-- =====================================================
-- الجزء 2: الجداول التشغيلية (Operational Tables)
-- =====================================================

-- المنتجات
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_en TEXT,
    sku TEXT,
    barcode TEXT,
    category TEXT,
    unit TEXT DEFAULT 'قطعة',
    price DECIMAL(12,2) DEFAULT 0,
    cost DECIMAL(12,2) DEFAULT 0,
    quantity INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 0,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_company ON products(company_id);

-- العملاء
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    category TEXT,
    balance DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    is_general BOOLEAN DEFAULT false,
    cash_only BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company_id);

-- الموردين
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    category TEXT,
    balance DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_company ON suppliers(company_id);

-- المبيعات
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    customer_id UUID REFERENCES customers(id),
    invoice_number TEXT,
    total DECIMAL(12,2) DEFAULT 0,
    discount DECIMAL(12,2) DEFAULT 0,
    tax DECIMAL(12,2) DEFAULT 0,
    net_total DECIMAL(12,2) DEFAULT 0,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    payment_method TEXT DEFAULT 'cash',
    status TEXT DEFAULT 'completed',
    notes TEXT,
    items JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_company ON sales(company_id);

-- المشتريات
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    supplier_id UUID REFERENCES suppliers(id),
    invoice_number TEXT,
    total DECIMAL(12,2) DEFAULT 0,
    discount DECIMAL(12,2) DEFAULT 0,
    tax DECIMAL(12,2) DEFAULT 0,
    net_total DECIMAL(12,2) DEFAULT 0,
    payment_method TEXT DEFAULT 'cash',
    status TEXT DEFAULT 'completed',
    notes TEXT,
    items JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_company ON purchases(company_id);

-- المصروفات
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    category TEXT,
    description TEXT,
    amount DECIMAL(12,2) DEFAULT 0,
    expense_date DATE DEFAULT CURRENT_DATE,
    payment_method TEXT DEFAULT 'cash',
    status TEXT DEFAULT 'paid',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_company ON expenses(company_id);

-- الفروع
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    is_main BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إعدادات الشركة
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    currency TEXT DEFAULT 'IQD',
    tax_enabled BOOLEAN DEFAULT false,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    invoice_prefix TEXT DEFAULT 'INV-',
    invoice_next_number INTEGER DEFAULT 1,
    fiscal_year_start TEXT DEFAULT '01-01',
    settings_json JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- الحسابات المحاسبية
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    account_type TEXT NOT NULL,
    parent_id UUID REFERENCES accounts(id),
    is_active BOOLEAN DEFAULT true,
    balance DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- الجزء 3: RLS (Row Level Security)
-- =====================================================

-- تفعيل RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_company_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- سياسة profiles
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Create own profile" ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- سياسة companies
CREATE POLICY "Users view assigned companies" ON companies FOR SELECT USING (
    id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid() AND is_active = true)
);
CREATE POLICY "Authenticated users create companies" ON companies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Owners update company" ON companies FOR UPDATE USING (
    id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid() AND is_owner = true)
);

-- سياسة roles
CREATE POLICY "View system roles" ON roles FOR SELECT USING (is_system = true);

-- سياسة permissions
CREATE POLICY "Everyone view permissions" ON permissions FOR SELECT USING (true);

-- سياسة user_company_roles
CREATE POLICY "Users view own roles" ON user_company_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Add self to company" ON user_company_roles FOR INSERT WITH CHECK (user_id = auth.uid());

-- سياسة عامة للجداول التشغيلية (كل شركة ترى بياناتها فقط)
CREATE POLICY "Company isolation - products" ON products FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())
);
CREATE POLICY "Company isolation - customers" ON customers FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())
);
CREATE POLICY "Company isolation - suppliers" ON suppliers FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())
);
CREATE POLICY "Company isolation - sales" ON sales FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())
);
CREATE POLICY "Company isolation - purchases" ON purchases FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())
);
CREATE POLICY "Company isolation - expenses" ON expenses FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())
);
CREATE POLICY "Company isolation - branches" ON branches FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())
);
CREATE POLICY "Company isolation - settings" ON company_settings FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())
);
CREATE POLICY "Company isolation - accounts" ON accounts FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())
);
CREATE POLICY "Company isolation - logs" ON activity_logs FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())
);

-- =====================================================
-- الجزء 4: Trigger لإنشاء مستخدم جديد
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
        'admin'
    );
    
    -- إنشاء شركة للمستخدم
    INSERT INTO public.companies (id, name, email)
    VALUES (gen_random_uuid(), COALESCE(NEW.raw_user_meta_data->>'company_name', 'شركتي'), NEW.email)
    RETURNING id INTO new_company_id;
    
    -- تحديث profile
    UPDATE public.profiles SET company_id = new_company_id WHERE id = NEW.id;
    
    -- جلب role_id للـ admin
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin' AND is_system = true LIMIT 1;
    
    -- ربط المستخدم بالشركة
    INSERT INTO public.user_company_roles (user_id, company_id, role_id, is_default, is_owner)
    VALUES (NEW.id, new_company_id, admin_role_id, true, true);
    
    -- إنشاء إعدادات الشركة
    INSERT INTO public.company_settings (company_id, currency) VALUES (new_company_id, 'IQD');
    
    -- إنشاء فرع رئيسي
    INSERT INTO public.branches (company_id, name, is_main) VALUES (new_company_id, 'الفرع الرئيسي', true);
    
    -- إنشاء عميل نقدي
    INSERT INTO public.customers (company_id, name, is_general, cash_only) VALUES (new_company_id, 'عميل نقدي', true, true);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ربط الـ trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Helper Functions
-- =====================================================

CREATE OR REPLACE FUNCTION get_current_company_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid() AND is_default = true LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_permission(permission_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    role_permissions JSONB;
BEGIN
    SELECT r.permissions INTO role_permissions
    FROM user_company_roles ucr
    JOIN roles r ON r.id = ucr.role_id
    WHERE ucr.user_id = auth.uid() AND ucr.is_default = true AND ucr.is_active = true;
    
    IF role_permissions ? '*' THEN RETURN true; END IF;
    IF role_permissions ? permission_code THEN RETURN true; END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- تم الانتهاء! ✅
-- =====================================================
