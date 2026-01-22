/**
 * Inventory Service - خدمة المخزون
 * إدارة حركات المخزون والجرد
 */

import { supabase, generateUUID, getCurrentTimestamp } from '../lib/supabaseClient';
import { companyService } from './companyService';

export type TransactionType =
    | 'purchase' | 'sale' | 'transfer_in' | 'transfer_out'
    | 'adjustment' | 'stocktake' | 'return_in' | 'return_out'
    | 'damage' | 'initial';

export interface InventoryTransaction {
    id: string;
    company_id: string;
    product_id: string;
    variant_id?: string;
    warehouse_id?: string;
    transaction_type: TransactionType;
    quantity: number;
    unit_cost?: number;
    total_cost?: number;
    reference_type?: string;
    reference_id?: string;
    reference_number?: string;
    balance_before?: number;
    balance_after?: number;
    batch_number?: string;
    expiry_date?: string;
    notes?: string;
    created_by?: string;
    created_at: string;
}

export interface InventoryLevel {
    product_id: string;
    company_id: string;
    product_name: string;
    sku?: string;
    total_quantity: number;
    min_quantity: number;
    unit_cost: number;
    stock_value: number;
    stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface Stocktake {
    id: string;
    company_id: string;
    warehouse_id?: string;
    stocktake_number: string;
    stocktake_date: string;
    status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
    notes?: string;
    created_at: string;
}

export const inventoryService = {
    /**
     * جلب مستويات المخزون
     */
    async getLevels(): Promise<InventoryLevel[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return [];

            const { data, error } = await (supabase as any)
                .from('vw_inventory_levels')
                .select('*')
                .eq('company_id', companyId);

            if (error) {
                console.error('Error fetching inventory levels:', error);
                return [];
            }

            return data || [];
        } catch {
            return [];
        }
    },

    /**
     * جلب المنتجات منخفضة المخزون
     */
    async getLowStock(): Promise<InventoryLevel[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return [];

            const { data, error } = await (supabase as any)
                .from('vw_inventory_levels')
                .select('*')
                .eq('company_id', companyId)
                .in('stock_status', ['low_stock', 'out_of_stock']);

            if (error) return [];
            return data || [];
        } catch {
            return [];
        }
    },

    /**
     * تسجيل حركة مخزون
     */
    async recordTransaction(transaction: {
        product_id: string;
        transaction_type: TransactionType;
        quantity: number;
        warehouse_id?: string;
        unit_cost?: number;
        reference_type?: string;
        reference_id?: string;
        reference_number?: string;
        batch_number?: string;
        expiry_date?: string;
        notes?: string;
    }): Promise<InventoryTransaction | null> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return null;

            const { data, error } = await (supabase as any)
                .from('inventory_transactions')
                .insert({
                    id: generateUUID(),
                    company_id: companyId,
                    product_id: transaction.product_id,
                    transaction_type: transaction.transaction_type,
                    quantity: transaction.quantity,
                    warehouse_id: transaction.warehouse_id,
                    unit_cost: transaction.unit_cost,
                    total_cost: transaction.unit_cost ? transaction.unit_cost * Math.abs(transaction.quantity) : null,
                    reference_type: transaction.reference_type,
                    reference_id: transaction.reference_id,
                    reference_number: transaction.reference_number,
                    batch_number: transaction.batch_number,
                    expiry_date: transaction.expiry_date,
                    notes: transaction.notes,
                    created_at: getCurrentTimestamp()
                })
                .select()
                .single();

            if (error) {
                console.error('Error recording transaction:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in recordTransaction:', error);
            return null;
        }
    },

    /**
     * جلب حركات منتج معين
     */
    async getProductTransactions(productId: string, limit = 50): Promise<InventoryTransaction[]> {
        try {
            const { data, error } = await (supabase as any)
                .from('inventory_transactions')
                .select('*')
                .eq('product_id', productId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) return [];
            return data || [];
        } catch {
            return [];
        }
    },

    /**
     * تسوية المخزون
     */
    async adjustStock(productId: string, newQuantity: number, reason: string): Promise<boolean> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return false;

            // جلب الكمية الحالية
            const { data: product } = await (supabase as any)
                .from('products')
                .select('quantity')
                .eq('id', productId)
                .single();

            if (!product) return false;

            const difference = newQuantity - product.quantity;
            if (difference === 0) return true;

            // تسجيل حركة التسوية
            await this.recordTransaction({
                product_id: productId,
                transaction_type: 'adjustment',
                quantity: difference,
                notes: reason
            });

            return true;
        } catch {
            return false;
        }
    },

    /**
     * إنشاء جلسة جرد
     */
    async createStocktake(warehouseId?: string): Promise<Stocktake | null> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return null;

            const { data, error } = await (supabase as any)
                .from('stocktakes')
                .insert({
                    id: generateUUID(),
                    company_id: companyId,
                    warehouse_id: warehouseId,
                    stocktake_date: getCurrentTimestamp().split('T')[0],
                    status: 'draft',
                    created_at: getCurrentTimestamp()
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating stocktake:', error);
                return null;
            }

            return data;
        } catch {
            return null;
        }
    },

    /**
     * حساب قيمة المخزون
     */
    async getTotalValue(): Promise<number> {
        try {
            const levels = await this.getLevels();
            return levels.reduce((sum, l) => sum + (l.stock_value || 0), 0);
        } catch {
            return 0;
        }
    }
};

export default inventoryService;
