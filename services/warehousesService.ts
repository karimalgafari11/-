/**
 * Warehouses Service - خدمة المستودعات
 * إدارة المستودعات والمخزون مع Supabase
 */

import { supabase } from '../lib/supabaseClient';
import type { Warehouse, InventoryStock, StockMovement, InsertType } from '../types/supabase-types';

export const warehousesService = {
    /**
     * جلب جميع المستودعات
     * يستخدم جدول branches مع تحديد is_warehouse=true
     */
    async getAll(companyId: string): Promise<Warehouse[]> {
        try {
            const { data, error } = await (supabase as any)
                .from('branches')
                .select('*')
                .eq('company_id', companyId)
                .eq('is_warehouse', true)
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            return (data || []) as any as Warehouse[];
        } catch (err) {
            console.error('❌ خطأ في جلب المستودعات:', err);
            return [];
        }
    },

    /**
     * جلب المستودع الرئيسي
     */
    async getMain(companyId: string): Promise<Warehouse | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('branches')
                .select('*')
                .eq('company_id', companyId)
                .eq('is_main', true)
                .single();

            if (error) throw error;
            return data as any as Warehouse;
        } catch (err) {
            console.error('❌ خطأ في جلب المستودع الرئيسي:', err);
            return null;
        }
    },

    /**
     * إنشاء مستودع
     */
    async create(
        companyId: string,
        warehouse: Omit<InsertType<Warehouse>, 'company_id'>
    ): Promise<Warehouse | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('branches')
                .insert({
                    ...warehouse,
                    company_id: companyId,
                    is_warehouse: true, // تأكيد أنه مستودع
                    is_active: true
                })
                .select()
                .single();

            if (error) throw error;
            console.log('✅ تم إنشاء مستودع جديد:', data.id);
            return data as any as Warehouse;
        } catch (err) {
            console.error('❌ خطأ في إنشاء المستودع:', err);
            return null;
        }
    },

    /**
     * تحديث مستودع
     */
    async update(id: string, updates: Partial<Warehouse>): Promise<Warehouse | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('branches')
                .update({
                    ...updates,
                    // updated_at: new Date().toISOString() // branches might not have updated_at in strict schema phases
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data as any as Warehouse;
        } catch (err) {
            console.error('❌ خطأ في تحديث المستودع:', err);
            return null;
        }
    },

    /**
     * حذف مستودع (soft delete)
     */
    async delete(id: string): Promise<boolean> {
        try {
            const { error } = await (supabase as any)
                .from('branches')
                .update({ is_active: false })
                .eq('id', id);

            if (error) throw error;
            console.log('✅ تم حذف المستودع:', id);
            return true;
        } catch (err) {
            console.error('❌ خطأ في حذف المستودع:', err);
            return false;
        }
    },

    /**
     * جلب مخزون مستودع
     * Note: Currently returns empty as there is no direct inventory_stock table.
     * Real stock is calculated from inventory_transactions or aggregated views.
     */
    async getStock(companyId: string, warehouseId: string): Promise<InventoryStock[]> {
        // TODO: Implement using VW_INVENTORY_LEVELS or aggregation if needed per warehouse
        console.warn('⚠️ getStock per warehouse not fully implemented due to schema changes.');
        return [];
    },

    /**
     * تسجيل حركة مخزون
     * Maps to inventory_transactions table
     */
    async recordMovement(
        companyId: string,
        movement: Omit<InsertType<StockMovement>, 'company_id'>
    ): Promise<StockMovement | null> {
        try {
            // Map movement_type to transaction_type
            let transactionType = 'adjustment';
            let qty = movement.quantity;

            if (movement.movement_type === 'in') {
                transactionType = 'purchase'; // or 'adjustment'
                qty = Math.abs(qty);
            } else if (movement.movement_type === 'out') {
                transactionType = 'sale'; // or 'adjustment'
                qty = -Math.abs(qty);
            } else if (movement.movement_type === 'transfer') {
                transactionType = 'transfer_in'; // simplified
            }

            const { data, error } = await (supabase as any)
                .from('inventory_transactions')
                .insert({
                    company_id: companyId,
                    product_id: movement.product_id,
                    warehouse_id: movement.warehouse_id,
                    transaction_type: transactionType,
                    quantity: qty,
                    notes: movement.notes,
                    created_by: movement.user_id
                })
                .select()
                .single();

            if (error) throw error;

            console.log('✅ تم تسجيل حركة مخزون (inventory_transactions)');

            // Note: Trigger on inventory_transactions will auto-update products.quantity
            return {
                ...movement,
                id: data.id,
                company_id: companyId,
                created_at: data.created_at
            } as StockMovement;

        } catch (err) {
            console.error('❌ خطأ في تسجيل الحركة:', err);
            return null;
        }
    },

    /**
     * تحديث كمية المخزون
     * Deprecated: Database trigger handles this now.
     */
    async updateStockQuantity(
        companyId: string,
        productId: string,
        warehouseId: string,
        quantityChange: number
    ): Promise<boolean> {
        // No-op because DB trigger updates products.quantity
        return true;
    }
};

export default warehousesService;
