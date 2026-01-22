/**
 * Document Payments Service - خدمة مدفوعات المستندات
 * CRUD operations for document_payments table
 * ربط السندات بالفواتير
 */

import { supabase } from '../lib/supabaseClient';
import type { DocumentPayment, Insert } from '../types/supabase-helpers';

export interface DocumentPaymentWithDetails extends DocumentPayment {
    voucher?: {
        voucher_number: string;
        type: 'receipt' | 'payment';
        date: string;
    };
    document?: {
        document_number: string;
        type: string;
        total_amount: number;
    };
}

export const documentPaymentsService = {
    /**
     * جلب مدفوعات مستند
     */
    async getByDocument(documentId: string): Promise<DocumentPaymentWithDetails[]> {
        try {
            const { data, error } = await (supabase as any)
                .from('document_payments')
                .select(`
                    *,
                    voucher:vouchers(voucher_number, type, date)
                `)
                .eq('document_id', documentId)
                .order('created_at');

            if (error) {
                console.error('Error fetching document payments:', error);
                return [];
            }

            return (data || []) as DocumentPaymentWithDetails[];
        } catch (error) {
            console.error('Error in getByDocument:', error);
            return [];
        }
    },

    /**
     * جلب مدفوعات سند
     */
    async getByVoucher(voucherId: string): Promise<DocumentPaymentWithDetails[]> {
        try {
            const { data, error } = await (supabase as any)
                .from('document_payments')
                .select(`
                    *,
                    document:documents(document_number, type, total_amount)
                `)
                .eq('voucher_id', voucherId)
                .order('created_at');

            if (error) {
                console.error('Error fetching voucher payments:', error);
                return [];
            }

            return (data || []) as DocumentPaymentWithDetails[];
        } catch (error) {
            console.error('Error in getByVoucher:', error);
            return [];
        }
    },

    /**
     * إجمالي المدفوعات لمستند
     */
    async getTotalPaid(documentId: string): Promise<number> {
        try {
            const { data, error } = await (supabase as any)
                .from('document_payments')
                .select('amount')
                .eq('document_id', documentId);

            if (error) return 0;

            return (data || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        } catch {
            return 0;
        }
    },

    /**
     * إنشاء ربط دفعة
     */
    async create(payment: Insert<'document_payments'>): Promise<DocumentPayment | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('document_payments')
                .insert(payment)
                .select()
                .single();

            if (error) {
                console.error('Error creating document payment:', error);
                return null;
            }

            // Update document paid_amount
            if (data.document_id) {
                const totalPaid = await this.getTotalPaid(data.document_id);
                await (supabase as any)
                    .from('documents')
                    .update({
                        paid_amount: totalPaid,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', data.document_id);
            }

            console.log('✅ Document payment created:', data.id);
            return data;
        } catch (error) {
            console.error('Error in create document payment:', error);
            return null;
        }
    },

    /**
     * حذف ربط دفعة
     */
    async delete(id: string): Promise<boolean> {
        try {
            // Get payment first to update document
            const { data: payment } = await (supabase as any)
                .from('document_payments')
                .select('document_id')
                .eq('id', id)
                .single();

            const { error } = await (supabase as any)
                .from('document_payments')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting document payment:', error);
                return false;
            }

            // Update document paid_amount
            if (payment?.document_id) {
                const totalPaid = await this.getTotalPaid(payment.document_id);
                await (supabase as any)
                    .from('documents')
                    .update({
                        paid_amount: totalPaid,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', payment.document_id);
            }

            return true;
        } catch {
            return false;
        }
    },

    /**
     * ربط سند بمستند
     */
    async linkVoucherToDocument(
        voucherId: string,
        documentId: string,
        amount: number
    ): Promise<boolean> {
        const result = await this.create({
            voucher_id: voucherId,
            document_id: documentId,
            amount
        });

        return result !== null;
    }
};

export default documentPaymentsService;
