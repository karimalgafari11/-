/**
 * Warehouses Service - خدمة المستودعات
 * إدارة المستودعات والمخزون مع Supabase
 */

import { supabase } from '../lib/supabaseClient';
import type { Warehouse, InventoryStock, StockMovement, InsertType } from '../types/supabase-types';

export const warehousesService = {
    /**
     * جلب جميع المستودعات
     */
    async getAll(companyId: string): Promise<Warehouse[]> {
        try {
            const { data, error } = await supabase
                .from('warehouses')
                .select('*')
                .eq('company_id', companyId)
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            return data || [];
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
            const { data, error } = await supabase
                .from('warehouses')
                .select('*')
                .eq('company_id', companyId)
                .eq('is_main', true)
                .single();

            if (error) throw error;
            return data;
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
            const { data, error } = await supabase
                .from('warehouses')
                .insert({
                    ...warehouse,
                    company_id: companyId
                })
                .select()
                .single();

            if (error) throw error;
            console.log('✅ تم إنشاء مستودع جديد:', data.id);
            return data;
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
            const { data, error } = await supabase
                .from('warehouses')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (err) {
            console.error('❌ خطأ في تحديث المستودع:', err);
            return null;
        }
    },

    /**
     * جلب مخزون مستودع
     */
    async getStock(companyId: string, warehouseId: string): Promise<InventoryStock[]> {
        try {
            const { data, error } = await supabase
                .from('inventory_stock')
                .select('*')
                .eq('company_id', companyId)
                .eq('warehouse_id', warehouseId);

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('❌ خطأ في جلب المخزون:', err);
            return [];
        }
    },

    /**
     * تسجيل حركة مخزون
     */
    async recordMovement(
        companyId: string,
        movement: Omit<InsertType<StockMovement>, 'company_id'>
    ): Promise<StockMovement | null> {
        try {
            const { data, error } = await supabase
                .from('stock_movements')
                .insert({
                    ...movement,
                    company_id: companyId
                })
                .select()
                .single();

            if (error) throw error;

            // تحديث المخزون
            await this.updateStockQuantity(
                companyId,
                movement.product_id,
                movement.warehouse_id || '',
                movement.movement_type === 'in' ? movement.quantity : -movement.quantity
            );

            console.log('✅ تم تسجيل حركة مخزون');
            return data;
        } catch (err) {
            console.error('❌ خطأ في تسجيل الحركة:', err);
            return null;
        }
    },

    /**
     * تحديث كمية المخزون
     */
    async updateStockQuantity(
        companyId: string,
        productId: string,
        warehouseId: string,
        quantityChange: number
    ): Promise<boolean> {
        try {
            // جلب المخزون الحالي
            const { data: current } = await supabase
                .from('inventory_stock')
                .select('quantity')
                .eq('company_id', companyId)
                .eq('product_id', productId)
                .eq('warehouse_id', warehouseId)
                .single();

            const newQuantity = (current?.quantity || 0) + quantityChange;

            if (current) {
                // تحديث
                await supabase
                    .from('inventory_stock')
                    .update({
                        quantity: newQuantity,
                        last_updated: new Date().toISOString()
                    })
                    .eq('company_id', companyId)
                    .eq('product_id', productId)
                    .eq('warehouse_id', warehouseId);
            } else {
                // إنشاء جديد
                await supabase
                    .from('inventory_stock')
                    .insert({
                        company_id: companyId,
                        product_id: productId,
                        warehouse_id: warehouseId,
                        quantity: newQuantity,
                        min_quantity: 0
                    });
            }

            return true;
        } catch (err) {
            console.error('❌ خطأ في تحديث المخزون:', err);
            return false;
        }
    }
};

export default warehousesService;
