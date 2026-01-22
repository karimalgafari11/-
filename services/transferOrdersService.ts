/**
 * Transfer Orders Service - خدمة أوامر النقل
 * CRUD operations for transfer_orders and transfer_items tables
 */

import { supabase } from '../lib/supabaseClient';
import { companyService } from './companyService';
import type { TransferOrder, TransferItem, Insert, Update, TransferStatus } from '../types/supabase-helpers';

export interface TransferOrderWithItems extends TransferOrder {
    items?: TransferItem[];
    from_warehouse?: { name: string };
    to_warehouse?: { name: string };
}

export interface CreateTransferData {
    from_warehouse_id: string;
    to_warehouse_id: string;
    date?: string;
    notes?: string;
    items: {
        product_id: string;
        quantity: number;
    }[];
}

export const transferOrdersService = {
    /**
     * جلب جميع أوامر النقل
     */
    async getAll(status?: TransferStatus): Promise<TransferOrderWithItems[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) {
                console.warn('No company ID found');
                return [];
            }

            let query = supabase
                .from('transfer_orders')
                .select(`
                    *,
                    from_warehouse:warehouses!transfer_orders_from_warehouse_id_fkey(name),
                    to_warehouse:warehouses!transfer_orders_to_warehouse_id_fkey(name)
                `)
                .eq('company_id', companyId)
                .order('created_at', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching transfer orders:', error);
                return [];
            }

            return (data || []) as TransferOrderWithItems[];
        } catch (error) {
            console.error('Error in getAll transfer orders:', error);
            return [];
        }
    },

    /**
     * جلب أمر نقل واحد بالتفاصيل
     */
    async getById(id: string): Promise<TransferOrderWithItems | null> {
        try {
            const { data: order, error: orderError } = await supabase
                .from('transfer_orders')
                .select(`
                    *,
                    from_warehouse:warehouses!transfer_orders_from_warehouse_id_fkey(name),
                    to_warehouse:warehouses!transfer_orders_to_warehouse_id_fkey(name)
                `)
                .eq('id', id)
                .single();

            if (orderError) return null;

            // Get items
            const { data: items } = await supabase
                .from('transfer_items')
                .select(`
                    *,
                    product:products(name, sku)
                `)
                .eq('transfer_order_id', id);

            return {
                ...order,
                items: items || []
            } as TransferOrderWithItems;
        } catch {
            return null;
        }
    },

    /**
     * إنشاء أمر نقل جديد
     */
    async create(data: CreateTransferData): Promise<TransferOrder | null> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) {
                console.error('No company ID found');
                return null;
            }

            // Generate order number
            const orderNumber = await this.generateNumber();

            // Create transfer order
            const { data: order, error: orderError } = await supabase
                .from('transfer_orders')
                .insert({
                    company_id: companyId,
                    order_number: orderNumber,
                    from_warehouse_id: data.from_warehouse_id,
                    to_warehouse_id: data.to_warehouse_id,
                    date: data.date || new Date().toISOString().split('T')[0],
                    notes: data.notes,
                    status: 'draft'
                })
                .select()
                .single();

            if (orderError) {
                console.error('Error creating transfer order:', orderError);
                return null;
            }

            // Create transfer items
            if (data.items.length > 0) {
                const items = data.items.map(item => ({
                    transfer_order_id: order.id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    received_quantity: 0
                }));

                const { error: itemsError } = await supabase
                    .from('transfer_items')
                    .insert(items);

                if (itemsError) {
                    console.error('Error creating transfer items:', itemsError);
                    // Rollback order
                    await supabase.from('transfer_orders').delete().eq('id', order.id);
                    return null;
                }
            }

            console.log('✅ Transfer order created:', order.id);
            return order;
        } catch (error) {
            console.error('Error in create transfer order:', error);
            return null;
        }
    },

    /**
     * تحديث حالة أمر النقل
     */
    async updateStatus(id: string, status: TransferStatus): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('transfer_orders')
                .update({ status })
                .eq('id', id);

            if (error) {
                console.error('Error updating transfer status:', error);
                return false;
            }

            return true;
        } catch {
            return false;
        }
    },

    /**
     * تأكيد استلام عنصر
     */
    async receiveItem(itemId: string, receivedQuantity: number): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('transfer_items')
                .update({ received_quantity: receivedQuantity })
                .eq('id', itemId);

            if (error) {
                console.error('Error updating received quantity:', error);
                return false;
            }

            return true;
        } catch {
            return false;
        }
    },

    /**
     * حذف أمر نقل (مسودة فقط)
     */
    async delete(id: string): Promise<boolean> {
        try {
            // Check if draft
            const order = await this.getById(id);
            if (!order || order.status !== 'draft') {
                console.error('Cannot delete non-draft transfer order');
                return false;
            }

            // Delete items first
            await supabase
                .from('transfer_items')
                .delete()
                .eq('transfer_order_id', id);

            // Delete order
            const { error } = await supabase
                .from('transfer_orders')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting transfer order:', error);
                return false;
            }

            return true;
        } catch {
            return false;
        }
    },

    /**
     * توليد رقم أمر نقل
     */
    async generateNumber(): Promise<string> {
        const companyId = await companyService.getCompanyId();
        const year = new Date().getFullYear();

        const { count } = await supabase
            .from('transfer_orders')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId);

        const number = ((count || 0) + 1).toString().padStart(5, '0');
        return `TO-${year}-${number}`;
    }
};

export default transferOrdersService;
