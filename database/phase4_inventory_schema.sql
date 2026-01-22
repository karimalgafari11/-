-- =====================================================
-- ERP System - Phase 4: Inventory Management
-- إدارة المخزون والمستودعات
-- =====================================================

-- =====================================================
-- 1. PRODUCT_CATEGORIES - فئات المنتجات
-- =====================================================
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES product_categories(id),
    
    name TEXT NOT NULL,
    name_en TEXT,
    code TEXT,
    description TEXT,
    
    level INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, code)
);

CREATE INDEX IF NOT EXISTS idx_pc_company ON product_categories(company_id);

-- =====================================================
-- 2. WAREHOUSES - المستودعات (تحسين)
-- =====================================================
-- إضافة أعمدة جديدة للمستودعات الموجودة
ALTER TABLE branches ADD COLUMN IF NOT EXISTS is_warehouse BOOLEAN DEFAULT true;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS warehouse_type TEXT DEFAULT 'main' 
    CHECK (warehouse_type IN ('main', 'secondary', 'transit', 'damage'));
ALTER TABLE branches ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES auth.users(id);

-- =====================================================
-- 3. STORAGE_LOCATIONS - مواقع التخزين
-- =====================================================
CREATE TABLE IF NOT EXISTS storage_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    location_type TEXT DEFAULT 'shelf',  -- shelf, zone, bin, pallet
    parent_id UUID REFERENCES storage_locations(id),
    
    capacity INTEGER,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(warehouse_id, code)
);

CREATE INDEX IF NOT EXISTS idx_sl_warehouse ON storage_locations(warehouse_id);

-- =====================================================
-- 4. تحسين PRODUCTS
-- =====================================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES product_categories(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'goods' 
    CHECK (product_type IN ('goods', 'service', 'consumable'));
ALTER TABLE products ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS allow_negative_stock BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight DECIMAL(10,3);
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions JSONB;  -- {length, width, height}
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_account_id UUID REFERENCES accounts(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS cogs_account_id UUID REFERENCES accounts(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS revenue_account_id UUID REFERENCES accounts(id);

-- =====================================================
-- 5. PRODUCT_VARIANTS - متغيرات المنتج
-- =====================================================
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    barcode TEXT,
    
    -- الأسعار الخاصة بالمتغير
    sale_price DECIMAL(12,2),
    cost_price DECIMAL(12,2),
    
    -- الخصائص
    attributes JSONB DEFAULT '{}',  -- {color: 'red', size: 'L'}
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pv_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_pv_sku ON product_variants(sku);

-- =====================================================
-- 6. PRODUCT_PRICING - أسعار متعددة
-- =====================================================
CREATE TABLE IF NOT EXISTS product_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    
    price_type TEXT NOT NULL,  -- retail, wholesale, vip, cost
    price DECIMAL(12,2) NOT NULL,
    min_quantity INTEGER DEFAULT 1,
    
    valid_from DATE,
    valid_to DATE,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pp_product ON product_pricing(product_id);

-- =====================================================
-- 7. INVENTORY_LEVELS - مستويات المخزون (View)
-- =====================================================
-- هذا View وليس جدول - حسب توصياتك
CREATE OR REPLACE VIEW vw_inventory_levels AS
SELECT 
    p.id as product_id,
    p.company_id,
    p.name as product_name,
    p.sku,
    p.quantity as total_quantity,
    p.min_quantity,
    p.cost as unit_cost,
    p.quantity * p.cost as stock_value,
    CASE 
        WHEN p.quantity <= 0 THEN 'out_of_stock'
        WHEN p.quantity <= p.min_quantity THEN 'low_stock'
        ELSE 'in_stock'
    END as stock_status
FROM products p
WHERE p.is_active = true AND p.track_inventory = true;

-- =====================================================
-- 8. INVENTORY_TRANSACTIONS - حركات المخزون
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id),
    warehouse_id UUID REFERENCES branches(id),
    location_id UUID REFERENCES storage_locations(id),
    
    -- نوع الحركة
    transaction_type TEXT NOT NULL CHECK (transaction_type IN (
        'purchase',      -- شراء
        'sale',          -- بيع
        'transfer_in',   -- تحويل وارد
        'transfer_out',  -- تحويل صادر
        'adjustment',    -- تسوية
        'stocktake',     -- جرد
        'return_in',     -- مرتجع وارد
        'return_out',    -- مرتجع صادر
        'damage',        -- تالف
        'initial'        -- رصيد افتتاحي
    )),
    
    -- الكميات
    quantity DECIMAL(12,3) NOT NULL,  -- + للوارد، - للصادر
    unit_cost DECIMAL(12,2),
    total_cost DECIMAL(15,2),
    
    -- المرجع
    reference_type TEXT,
    reference_id UUID,
    reference_number TEXT,
    
    -- للتحويلات
    related_transaction_id UUID REFERENCES inventory_transactions(id),
    destination_warehouse_id UUID REFERENCES branches(id),
    
    -- الأرصدة
    balance_before DECIMAL(12,3),
    balance_after DECIMAL(12,3),
    
    -- للدفعات
    batch_number TEXT,
    expiry_date DATE,
    
    -- للتتبع
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_it_company ON inventory_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_it_product ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_it_warehouse ON inventory_transactions(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_it_date ON inventory_transactions(company_id, created_at);
CREATE INDEX IF NOT EXISTS idx_it_reference ON inventory_transactions(reference_type, reference_id);

-- =====================================================
-- 9. STOCKTAKES - جلسات الجرد
-- =====================================================
CREATE TABLE IF NOT EXISTS stocktakes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES branches(id),
    
    stocktake_number TEXT NOT NULL,
    stocktake_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'cancelled')),
    
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, stocktake_number)
);

-- =====================================================
-- 10. STOCKTAKE_ITEMS - بنود الجرد
-- =====================================================
CREATE TABLE IF NOT EXISTS stocktake_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stocktake_id UUID NOT NULL REFERENCES stocktakes(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id),
    location_id UUID REFERENCES storage_locations(id),
    
    -- الكميات
    system_quantity DECIMAL(12,3) NOT NULL,  -- الكمية في النظام
    counted_quantity DECIMAL(12,3),          -- الكمية المعدودة
    difference DECIMAL(12,3) GENERATED ALWAYS AS (COALESCE(counted_quantity, 0) - system_quantity) STORED,
    
    -- حالة المطابقة
    is_matched BOOLEAN GENERATED ALWAYS AS (
        CASE WHEN counted_quantity IS NULL THEN false 
        ELSE ABS(counted_quantity - system_quantity) < 0.001 END
    ) STORED,
    
    unit_cost DECIMAL(12,2),
    notes TEXT,
    counted_by UUID REFERENCES auth.users(id),
    counted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sti_stocktake ON stocktake_items(stocktake_id);
CREATE INDEX IF NOT EXISTS idx_sti_product ON stocktake_items(product_id);

-- =====================================================
-- 11. TRIGGERS
-- =====================================================

-- تحديث كمية المنتج عند حركة مخزون
CREATE OR REPLACE FUNCTION update_product_quantity()
RETURNS TRIGGER AS $$
BEGIN
    -- تحديث كمية المنتج
    UPDATE products
    SET 
        quantity = quantity + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    -- حفظ الرصيد
    NEW.balance_before := (SELECT quantity - NEW.quantity FROM products WHERE id = NEW.product_id);
    NEW.balance_after := (SELECT quantity FROM products WHERE id = NEW.product_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_product_quantity ON inventory_transactions;
CREATE TRIGGER trg_update_product_quantity
    AFTER INSERT ON inventory_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_product_quantity();

-- منع المخزون السالب (إذا لم يكن مسموح)
CREATE OR REPLACE FUNCTION check_negative_stock()
RETURNS TRIGGER AS $$
DECLARE
    allow_negative BOOLEAN;
    current_qty DECIMAL(12,3);
BEGIN
    SELECT allow_negative_stock, quantity
    INTO allow_negative, current_qty
    FROM products
    WHERE id = NEW.product_id;
    
    IF NOT allow_negative AND (current_qty + NEW.quantity) < 0 THEN
        RAISE EXCEPTION 'لا يمكن أن يكون المخزون سالباً للمنتج %', NEW.product_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_negative_stock ON inventory_transactions;
CREATE TRIGGER trg_check_negative_stock
    BEFORE INSERT ON inventory_transactions
    FOR EACH ROW
    WHEN (NEW.quantity < 0)
    EXECUTE FUNCTION check_negative_stock();

-- =====================================================
-- 12. RLS
-- =====================================================

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocktakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocktake_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company isolation - product_categories" ON product_categories FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())
);

CREATE POLICY "Company isolation - storage_locations" ON storage_locations FOR ALL USING (
    warehouse_id IN (SELECT id FROM branches WHERE company_id IN 
        (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid()))
);

CREATE POLICY "Company isolation - product_variants" ON product_variants FOR ALL USING (
    product_id IN (SELECT id FROM products WHERE company_id IN 
        (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid()))
);

CREATE POLICY "Company isolation - product_pricing" ON product_pricing FOR ALL USING (
    product_id IN (SELECT id FROM products WHERE company_id IN 
        (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid()))
);

CREATE POLICY "Company isolation - inventory_transactions" ON inventory_transactions FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())
);

CREATE POLICY "Company isolation - stocktakes" ON stocktakes FOR ALL USING (
    company_id IN (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid())
);

CREATE POLICY "Company isolation - stocktake_items" ON stocktake_items FOR ALL USING (
    stocktake_id IN (SELECT id FROM stocktakes WHERE company_id IN 
        (SELECT company_id FROM user_company_roles WHERE user_id = auth.uid()))
);

-- =====================================================
-- تم الانتهاء من المرحلة 4! ✅
-- =====================================================
