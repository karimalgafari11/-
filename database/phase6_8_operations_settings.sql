-- =====================================================
-- ERP System - Phases 6-8: Operations & Settings
-- العمليات والإعدادات والتقارير
-- =====================================================

-- =====================================================
-- المرحلة 6: العمليات (Operations)
-- =====================================================

-- 1. PROJECTS - المشاريع
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    
    -- التصنيف
    project_type TEXT,
    category TEXT,
    
    -- التواريخ
    start_date DATE,
    end_date DATE,
    actual_end_date DATE,
    
    -- الميزانية
    budget DECIMAL(15,2) DEFAULT 0,
    actual_cost DECIMAL(15,2) DEFAULT 0,
    
    -- الحالة
    status TEXT DEFAULT 'draft' CHECK (status IN (
        'draft', 'pending', 'in_progress', 'on_hold', 'completed', 'cancelled'
    )),
    progress_percent DECIMAL(5,2) DEFAULT 0,
    
    -- المسؤولين
    manager_id UUID REFERENCES auth.users(id),
    customer_id UUID REFERENCES business_partners(id),
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, code)
);

-- 2. TASKS - المهام
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES tasks(id),
    
    title TEXT NOT NULL,
    description TEXT,
    
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'cancelled')),
    
    due_date DATE,
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2),
    
    assignee_id UUID REFERENCES auth.users(id),
    
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);

-- 3. FIXED_ASSETS - الأصول الثابتة (يجب إنشاؤه أولاً قبل vehicles)
CREATE TABLE IF NOT EXISTS fixed_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    
    -- المعلومات المالية
    purchase_date DATE NOT NULL,
    purchase_price DECIMAL(15,2) NOT NULL,
    salvage_value DECIMAL(15,2) DEFAULT 0,
    useful_life_months INTEGER NOT NULL,
    
    -- الإهلاك
    depreciation_method TEXT DEFAULT 'straight_line' CHECK (depreciation_method IN (
        'straight_line', 'declining_balance', 'units_of_production'
    )),
    accumulated_depreciation DECIMAL(15,2) DEFAULT 0,
    book_value DECIMAL(15,2),
    
    -- الحسابات المرتبطة
    asset_account_id UUID REFERENCES accounts(id),
    depreciation_account_id UUID REFERENCES accounts(id),
    expense_account_id UUID REFERENCES accounts(id),
    
    -- الموقع
    location TEXT,
    warehouse_id UUID REFERENCES branches(id),
    
    -- الحالة
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disposed', 'sold', 'damaged')),
    disposal_date DATE,
    disposal_amount DECIMAL(15,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, code)
);

-- 4. VEHICLES - المركبات (الآن يمكنه الإشارة لـ fixed_assets)
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    vehicle_number TEXT NOT NULL,
    plate_number TEXT,
    vehicle_type TEXT,  -- car, truck, van, motorcycle
    brand TEXT,
    model TEXT,
    year INTEGER,
    color TEXT,
    
    -- المعلومات المالية
    purchase_date DATE,
    purchase_price DECIMAL(12,2),
    current_value DECIMAL(12,2),
    
    -- الحالة
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive', 'sold')),
    
    driver_id UUID REFERENCES auth.users(id),
    fixed_asset_id UUID REFERENCES fixed_assets(id),
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, vehicle_number)
);

-- 5. VEHICLE_LOGS - سجلات المركبات
CREATE TABLE IF NOT EXISTS vehicle_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    
    log_type TEXT NOT NULL CHECK (log_type IN (
        'fuel', 'maintenance', 'repair', 'insurance', 'registration', 'accident', 'trip', 'other'
    )),
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    odometer_reading INTEGER,
    fuel_quantity DECIMAL(10,2),
    cost DECIMAL(12,2),
    
    description TEXT,
    expense_id UUID REFERENCES expenses(id),
    
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vl_vehicle ON vehicle_logs(vehicle_id);

-- 6. ASSET_DEPRECIATION - سجل الإهلاك
CREATE TABLE IF NOT EXISTS asset_depreciation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES fixed_assets(id) ON DELETE CASCADE,
    
    period_date DATE NOT NULL,
    depreciation_amount DECIMAL(15,2) NOT NULL,
    accumulated_amount DECIMAL(15,2) NOT NULL,
    book_value_after DECIMAL(15,2) NOT NULL,
    
    journal_entry_id UUID REFERENCES journal_entries(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_asset ON asset_depreciation(asset_id);

-- =====================================================
-- المرحلة 7: المعاملات (Transactions)
-- =====================================================

-- 1. PURCHASE_ORDERS - أوامر الشراء
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    order_number TEXT NOT NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_date DATE,
    
    supplier_id UUID REFERENCES business_partners(id),
    
    status TEXT DEFAULT 'draft' CHECK (status IN (
        'draft', 'pending', 'approved', 'ordered', 'partial', 'received', 'cancelled'
    )),
    
    subtotal DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, order_number)
);

-- 2. SALES_ORDERS - أوامر المبيعات
CREATE TABLE IF NOT EXISTS sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    order_number TEXT NOT NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date DATE,
    
    customer_id UUID REFERENCES business_partners(id),
    
    status TEXT DEFAULT 'draft' CHECK (status IN (
        'draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
    )),
    
    subtotal DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, order_number)
);

-- 3. QUOTATIONS - عروض الأسعار
CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    quotation_number TEXT NOT NULL,
    quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    
    customer_id UUID REFERENCES business_partners(id),
    
    status TEXT DEFAULT 'draft' CHECK (status IN (
        'draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'
    )),
    
    subtotal DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    
    terms_conditions TEXT,
    notes TEXT,
    
    converted_to_order_id UUID REFERENCES sales_orders(id),
    
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, quotation_number)
);

-- 4. DELIVERY_NOTES - إذونات الصرف
CREATE TABLE IF NOT EXISTS delivery_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    note_number TEXT NOT NULL,
    note_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    note_type TEXT NOT NULL CHECK (note_type IN ('delivery', 'receipt')),
    
    partner_id UUID REFERENCES business_partners(id),
    warehouse_id UUID REFERENCES branches(id),
    
    -- المرجع
    reference_type TEXT,  -- sales_order, purchase_order, invoice
    reference_id UUID,
    
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'completed', 'cancelled')),
    
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, note_number)
);

-- =====================================================
-- المرحلة 8: الإعدادات والتقارير
-- =====================================================

-- 1. REPORTS - التقارير
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description TEXT,
    
    report_type TEXT NOT NULL,  -- financial, inventory, sales, custom
    category TEXT,
    
    -- التكوين
    config JSONB DEFAULT '{}',
    query_template TEXT,
    
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. REPORT_SCHEDULES - جدولة التقارير
CREATE TABLE IF NOT EXISTS report_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    
    schedule_name TEXT NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    
    day_of_week INTEGER,  -- 0-6 للأسبوعي
    day_of_month INTEGER, -- 1-31 للشهري
    
    recipients JSONB DEFAULT '[]',  -- قائمة البريد الإلكتروني
    
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DOCUMENT_TEMPLATES - قوالب المستندات
CREATE TABLE IF NOT EXISTS document_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    template_type TEXT NOT NULL,  -- invoice, quotation, receipt, report
    name TEXT NOT NULL,
    
    -- التصميم
    header_html TEXT,
    body_html TEXT,
    footer_html TEXT,
    css_styles TEXT,
    
    -- الإعدادات
    paper_size TEXT DEFAULT 'A4',
    orientation TEXT DEFAULT 'portrait',
    margins JSONB DEFAULT '{"top": 10, "right": 10, "bottom": 10, "left": 10}',
    
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. NOTIFICATION_SETTINGS - إعدادات الإشعارات
CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    
    notification_type TEXT NOT NULL,  -- low_stock, overdue_payment, order_received
    
    -- القنوات
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT false,
    sms_enabled BOOLEAN DEFAULT false,
    
    -- الإعدادات
    threshold_value DECIMAL(15,2),
    frequency TEXT DEFAULT 'immediate',  -- immediate, daily, weekly
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RLS للجداول الجديدة
-- =====================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_depreciation ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- سياسات موحدة
CREATE POLICY "Company isolation - projects" ON projects FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid()));
CREATE POLICY "Company isolation - tasks" ON tasks FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid()));
CREATE POLICY "Company isolation - fixed_assets" ON fixed_assets FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid()));
CREATE POLICY "Company isolation - vehicles" ON vehicles FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid()));
CREATE POLICY "Company isolation - vehicle_logs" ON vehicle_logs FOR ALL USING (
    vehicle_id IN (SELECT id FROM vehicles WHERE company_id IN 
        (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())));
CREATE POLICY "Company isolation - asset_depreciation" ON asset_depreciation FOR ALL USING (
    asset_id IN (SELECT id FROM fixed_assets WHERE company_id IN 
        (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())));
CREATE POLICY "Company isolation - purchase_orders" ON purchase_orders FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid()));
CREATE POLICY "Company isolation - sales_orders" ON sales_orders FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid()));
CREATE POLICY "Company isolation - quotations" ON quotations FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid()));
CREATE POLICY "Company isolation - delivery_notes" ON delivery_notes FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid()));
CREATE POLICY "Company and system reports" ON reports FOR ALL USING (
    is_system = true OR company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid()));
CREATE POLICY "Company isolation - report_schedules" ON report_schedules FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid()));
CREATE POLICY "Company isolation - document_templates" ON document_templates FOR ALL USING (
    company_id IS NULL OR company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid()));
CREATE POLICY "User notifications" ON notification_settings FOR ALL USING (
    user_id = auth.uid() OR company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid()));

-- =====================================================
-- تم الانتهاء من المراحل 6-8! ✅
-- =====================================================
