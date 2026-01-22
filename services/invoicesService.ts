/**
 * Invoices Service - خدمة الفواتير الموحدة
 * المبيعات والمشتريات والمرتجعات
 * Refactored for Schema V6 (using 'documents' table)
 */

import { supabase, generateUUID, getCurrentTimestamp } from '../lib/supabaseClient';
import { companyService } from './companyService';
import type { Document, DocumentItem, Insert, Update } from '../types/supabase-helpers';

// Map legacy InvoiceType to V6 Document Type
export type InvoiceType = 'sale' | 'purchase' | 'return_sale' | 'return_purchase';
// V6 Document Types: 'invoice' | 'bill' | 'quote' | 'order' | 'return' | 'credit_note' | 'debit_note'
// Mapping:
// sale -> invoice
// purchase -> bill
// return_sale -> credit_note (or return)
// return_purchase -> debit_note (or return)

// For detailed mapping, we might need to adjust the logic.
// Let's assume:
// 'sale' -> 'invoice'
// 'purchase' -> 'bill'

export type InvoiceStatus = 'draft' | 'pending' | 'approved' | 'paid' | 'void' | 'cancelled';

// Keep the frontend interface compatible where possible, or update it to match V6 Document
export interface Invoice extends Omit<Document, 'type'> {
    // Add legacy fields if needed for UI compatibility, mapped from Document
    invoice_type: InvoiceType;
    invoice_number: string;
    invoice_date: string;
    items?: DocumentItem[];
}

const mapDocumentToInvoice = (doc: Document): Invoice => {
    let invoiceType: InvoiceType = 'sale';
    if (doc.type === 'bill') invoiceType = 'purchase';
    else if (doc.type === 'credit_note') invoiceType = 'return_sale';
    else if (doc.type === 'debit_note') invoiceType = 'return_purchase';

    return {
        ...doc,
        invoice_type: invoiceType,
        invoice_number: doc.document_number,
        invoice_date: doc.date || '',
    };
}

export interface CreateInvoiceData {
    invoice_type: InvoiceType;
    invoice_date?: string; // -> date
    due_date?: string;
    partner_id?: string;
    warehouse_id?: string;
    discount_amount?: number; // -> discount_total
    notes?: string;
    items: {
        product_id?: string;
        description: string;
        quantity: number;
        unit_price: number;
        discount_amount?: number;
        tax_rate?: number;
    }[];
}

export const invoicesService = {
    /**
     * جلب الفواتير
     */
    async getAll(options?: {
        type?: InvoiceType;
        status?: InvoiceStatus;
        partnerId?: string;
        fromDate?: string;
        toDate?: string;
        limit?: number;
    }): Promise<Invoice[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return [];

            let query = (supabase as any)
                .from('documents')
                .select('*, partners(name)')
                .eq('company_id', companyId)
                .order('date', { ascending: false });

            // Map legacy types to document types
            if (options?.type) {
                if (options.type === 'sale') query = query.eq('type', 'invoice');
                else if (options.type === 'purchase') query = query.eq('type', 'bill');
                else if (options.type === 'return_sale') query = query.eq('type', 'credit_note');
                else if (options.type === 'return_purchase') query = query.eq('type', 'debit_note');
            } else {
                // Default to sales/invoices if not specified? Or fetch all?
                // Original service implied generic 'getAll'.
            }

            if (options?.status) {
                query = query.eq('status', options.status);
            }
            if (options?.partnerId) {
                query = query.eq('partner_id', options.partnerId);
            }
            if (options?.fromDate) {
                query = query.gte('date', options.fromDate);
            }
            if (options?.toDate) {
                query = query.lte('date', options.toDate);
            }
            if (options?.limit) {
                query = query.limit(options.limit);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching invoices/documents:', error);
                return [];
            }

            return (data || []).map(mapDocumentToInvoice);
        } catch {
            return [];
        }
    },

    /**
     * جلب فواتير المبيعات
     */
    async getSales(): Promise<Invoice[]> {
        return this.getAll({ type: 'sale' });
    },

    /**
     * جلب فواتير المشتريات
     */
    async getPurchases(): Promise<Invoice[]> {
        return this.getAll({ type: 'purchase' });
    },

    /**
     * جلب فاتورة بالتفاصيل
     */
    async getById(id: string): Promise<Invoice | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('documents')
                .select(`
                    *,
                    items:document_items(*),
                    partners(name)
                `)
                .eq('id', id)
                .single();

            if (error || !data) return null;

            // Need to cast items correctly
            const doc = data as Document & { items: DocumentItem[] };
            return {
                ...mapDocumentToInvoice(doc),
                items: doc.items
            };
        } catch {
            return null;
        }
    },

    /**
     * إنشاء فاتورة جديدة
     */
    async create(invoiceData: CreateInvoiceData): Promise<Invoice | null> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return null;

            const invoiceId = generateUUID();
            const now = getCurrentTimestamp();

            // Calculate Totals
            const subtotal = invoiceData.items.reduce((sum, item) =>
                sum + (item.quantity * item.unit_price - (item.discount_amount || 0)), 0);

            // Approximate tax calc (V6 might have tax_total column)
            const taxAmount = invoiceData.items.reduce((sum, item) => {
                const lineTotal = item.quantity * item.unit_price - (item.discount_amount || 0);
                return sum + (lineTotal * (item.tax_rate || 0) / 100);
            }, 0);

            const totalAmount = subtotal + taxAmount - (invoiceData.discount_amount || 0);

            // Determine V6 Type
            let docType: Document['type'] = 'invoice';
            if (invoiceData.invoice_type === 'purchase') docType = 'bill';
            else if (invoiceData.invoice_type === 'return_sale') docType = 'credit_note';
            else if (invoiceData.invoice_type === 'return_purchase') docType = 'debit_note';

            const payload: Insert<'documents'> = {
                id: invoiceId,
                company_id: companyId,
                type: docType,
                document_number: `INV-${Date.now()}`, // Should use a generator
                date: invoiceData.invoice_date || now.split('T')[0],
                due_date: invoiceData.due_date,
                partner_id: invoiceData.partner_id,
                warehouse_id: invoiceData.warehouse_id,
                currency_code: 'SAR', // Default
                subtotal: subtotal,
                tax_total: taxAmount,
                discount_total: invoiceData.discount_amount || 0,
                total_amount: totalAmount,
                paid_amount: 0,
                status: 'draft',
                notes: invoiceData.notes,
                created_at: now
            };

            // إنشاء الفاتورة
            const { data: invoice, error: invoiceError } = await (supabase as any)
                .from('documents')
                .insert(payload)
                .select()
                .single();

            if (invoiceError) {
                console.error('Error creating document:', invoiceError);
                return null;
            }

            // إنشاء البنود
            const itemsPayload: Insert<'document_items'>[] = invoiceData.items.map((item, index) => {
                const lineTotal = item.quantity * item.unit_price - (item.discount_amount || 0);
                const lineTax = lineTotal * (item.tax_rate || 0) / 100;
                return {
                    document_id: invoiceId,
                    product_id: item.product_id,
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    discount_amount: item.discount_amount || 0,
                    tax_rate: item.tax_rate || 0,
                    tax_amount: lineTax,
                    total: lineTotal + lineTax,
                    created_at: now,
                    // Missing in Interface but exists in V6 schema:
                    // variant_id, unit_cost etc.
                };
            });

            const { error: itemsError } = await (supabase as any)
                .from('document_items')
                .insert(itemsPayload);

            if (itemsError) {
                console.error('Error creating items:', itemsError);
                await (supabase as any).from('documents').delete().eq('id', invoiceId);
                return null;
            }

            return {
                ...mapDocumentToInvoice(invoice),
                items: itemsPayload as DocumentItem[] // Approximate
            };
        } catch (error) {
            console.error('Error in create invoice:', error);
            return null;
        }
    },

    /**
     * اعتماد فاتورة
     */
    async approve(id: string): Promise<boolean> {
        try {
            const { error } = await (supabase as any)
                .from('documents')
                .update({
                    status: 'approved',
                    updated_at: getCurrentTimestamp()
                } as Update<'documents'>)
                .eq('id', id)
                .eq('status', 'draft');

            return !error;
        } catch {
            return false;
        }
    },

    /**
     * إلغاء فاتورة
     */
    async cancel(id: string): Promise<boolean> {
        try {
            const { error } = await (supabase as any)
                .from('documents')
                .update({
                    status: 'cancelled',
                    updated_at: getCurrentTimestamp()
                } as Update<'documents'>)
                .eq('id', id)
                .in('status', ['draft', 'pending']); // Adjusted status check

            return !error;
        } catch {
            return false;
        }
    },

    /**
     * حذف فاتورة مسودة
     */
    async delete(id: string): Promise<boolean> {
        try {
            const { error } = await (supabase as any)
                .from('documents')
                .delete()
                .eq('id', id)
                .eq('status', 'draft');

            return !error;
        } catch {
            return false;
        }
    },

    /**
     * إحصائيات المبيعات
     */
    async getSalesStats(fromDate?: string, toDate?: string): Promise<{
        totalSales: number;
        totalPaid: number;
        totalUnpaid: number;
        invoiceCount: number;
    }> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return { totalSales: 0, totalPaid: 0, totalUnpaid: 0, invoiceCount: 0 };

            let query = (supabase as any)
                .from('documents')
                .select('total_amount, paid_amount')
                .eq('company_id', companyId)
                .eq('type', 'invoice') // Sales only
                .neq('status', 'cancelled');

            if (fromDate) query = query.gte('date', fromDate);
            if (toDate) query = query.lte('date', toDate);

            const { data, error } = await query;

            if (error || !data) return { totalSales: 0, totalPaid: 0, totalUnpaid: 0, invoiceCount: 0 };

            const totalSales = data.reduce((sum: number, doc: any) => sum + (doc.total_amount || 0), 0);
            const totalPaid = data.reduce((sum: number, doc: any) => sum + (doc.paid_amount || 0), 0);

            return {
                totalSales,
                totalPaid,
                totalUnpaid: totalSales - totalPaid,
                invoiceCount: data.length
            };
        } catch {
            return { totalSales: 0, totalPaid: 0, totalUnpaid: 0, invoiceCount: 0 };
        }
    }
};

export default invoicesService;
