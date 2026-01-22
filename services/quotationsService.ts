/**
 * Quotations Service - خدمة عروض الأسعار
 */

import { supabase, generateUUID, getCurrentTimestamp } from '../lib/supabaseClient';
import { companyService } from './companyService';
import { Document, Insert, Update } from '../types/supabase-helpers';

export type QuotationStatus = 'draft' | 'pending' | 'approved' | 'paid' | 'void' | 'cancelled';

export interface Quotation extends Document {
    quotation_number: string;
    quotation_date: string;
    valid_until?: string | null;
    converted_to_order_id?: string;
}

export const quotationsService = {
    /**
     * جلب جميع عروض الأسعار
     */
    async getAll(status?: QuotationStatus): Promise<Quotation[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return [];

            let query = (supabase as any)
                .from('documents')
                .select('*')
                .eq('company_id', companyId)
                .eq('type', 'quote')
                .order('date', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query;
            if (error) return [];
            return (data || []).map(this.mapToQuotation);
        } catch {
            return [];
        }
    },

    /**
     * إنشاء عرض سعر
     */
    async create(quotation: {
        date?: string;
        due_date?: string; // valid until
        partner_id?: string;
        subtotal: number;
        discount_total?: number;
        tax_total?: number;
        terms_conditions?: string;
        notes?: string;
    }): Promise<Quotation | null> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return null;

            const totalAmount = quotation.subtotal - (quotation.discount_total || 0) + (quotation.tax_total || 0);

            // Generate number
            const { count } = await (supabase as any)
                .from('documents')
                .select('*', { count: 'exact', head: true })
                .eq('company_id', companyId)
                .eq('type', 'quote');

            const quotationNumber = `Q-${new Date().getFullYear()}-${((count || 0) + 1).toString().padStart(5, '0')}`;

            const payload: Insert<'documents'> = {
                id: generateUUID(),
                company_id: companyId,
                type: 'quote',
                document_number: quotationNumber,
                date: quotation.date || getCurrentTimestamp().split('T')[0],
                due_date: quotation.due_date, // valid until
                partner_id: quotation.partner_id,
                status: 'draft',
                subtotal: quotation.subtotal,
                discount_total: quotation.discount_total || 0,
                tax_total: quotation.tax_total || 0,
                total_amount: totalAmount,
                notes: quotation.notes,
                terms_conditions: quotation.terms_conditions,
                created_at: getCurrentTimestamp()
            };

            const { data, error } = await (supabase as any)
                .from('documents')
                .insert(payload)
                .select()
                .single();

            if (error) return null;
            return this.mapToQuotation(data);
        } catch {
            return null;
        }
    },

    /**
     * تحديث حالة عرض السعر
     */
    async updateStatus(id: string, status: QuotationStatus): Promise<boolean> {
        try {
            const { error } = await (supabase as any)
                .from('documents')
                .update({ status })
                .eq('id', id);
            return !error;
        } catch {
            return false;
        }
    },

    /**
     * تحويل لطلب مبيعات
     */
    async convertToOrder(quotationId: string): Promise<string | null> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return null;

            // جلب عرض السعر
            const { data: quotation } = await (supabase as any)
                .from('documents')
                .select('*')
                .eq('id', quotationId)
                .single();

            if (!quotation) return null;

            // توليد رقم الطلب
            const { count } = await (supabase as any)
                .from('documents')
                .select('*', { count: 'exact', head: true })
                .eq('company_id', companyId)
                .eq('type', 'order');

            const orderNumber = `O-${new Date().getFullYear()}-${((count || 0) + 1).toString().padStart(5, '0')}`;
            const orderId = generateUUID();

            const payload: Insert<'documents'> = {
                id: orderId,
                company_id: companyId,
                type: 'order',
                document_number: orderNumber,
                date: getCurrentTimestamp().split('T')[0],
                partner_id: quotation.partner_id,
                status: 'approved', // Orders usually start as approved/confirmed if converted
                subtotal: quotation.subtotal,
                discount_total: quotation.discount_total,
                tax_total: quotation.tax_total,
                total_amount: quotation.total_amount,
                notes: `Converted from Quotation ${quotation.document_number}. ${quotation.notes || ''}`,
                terms_conditions: quotation.terms_conditions,
                created_at: getCurrentTimestamp()
            };

            const { error } = await (supabase as any)
                .from('documents')
                .insert(payload);

            if (error) return null;

            // تحديث عرض السعر
            await (supabase as any)
                .from('documents')
                .update({
                    status: 'approved', // Mark as accepted/approved
                    notes: `${quotation.notes || ''} \n [Converted to Order: ${orderNumber}]`
                })
                .eq('id', quotationId);

            return orderId;
        } catch {
            return null;
        }
    },

    mapToQuotation(doc: any): Quotation {
        return {
            ...doc,
            quotation_number: doc.document_number,
            quotation_date: doc.date,
            valid_until: doc.due_date,
            discount_amount: doc.discount_total,
            tax_amount: doc.tax_total
        };
    }
};

export default quotationsService;
