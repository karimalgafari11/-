/**
 * Returns Service - خدمة المرتجعات
 * CRUD للمرتجعات (مبيعات ومشتريات) باستخدام جدول Documents
 */

import { supabase, generateUUID, getCurrentTimestamp } from '../lib/supabaseClient';
import { Document, Insert, Update } from '../types/supabase-helpers';
import { companyService } from './companyService';

// Alias for clarity, though it's just a Document
export interface Return extends Document {
    return_number: string;
    return_type: 'sales' | 'purchase'; // Derived from document type
    reason?: string; // Stored in notes
}

export const returnsService = {
    /**
     * جلب جميع المرتجعات
     */
    async getAll(companyId: string): Promise<Return[]> {
        try {
            const { data, error } = await (supabase as any)
                .from('documents')
                .select('*')
                .eq('company_id', companyId)
                .in('type', ['credit_note', 'debit_note'])
                .order('date', { ascending: false });

            if (error) {
                console.error('❌ خطأ في جلب المرتجعات:', error);
                return [];
            }
            return (data || []).map(this.mapToReturn);
        } catch (err) {
            console.error('❌ استثناء في جلب المرتجعات:', err);
            return [];
        }
    },

    /**
     * جلب مرتجعات المبيعات
     */
    async getSalesReturns(companyId: string): Promise<Return[]> {
        try {
            const { data, error } = await (supabase as any)
                .from('documents')
                .select('*')
                .eq('company_id', companyId)
                .eq('type', 'credit_note')
                .order('date', { ascending: false });

            if (error) {
                console.error('❌ خطأ في جلب مرتجعات المبيعات:', error);
                return [];
            }
            return (data || []).map(this.mapToReturn);
        } catch (err) {
            console.error('❌ استثناء في جلب مرتجعات المبيعات:', err);
            return [];
        }
    },

    /**
     * جلب مرتجعات المشتريات
     */
    async getPurchaseReturns(companyId: string): Promise<Return[]> {
        try {
            const { data, error } = await (supabase as any)
                .from('documents')
                .select('*')
                .eq('company_id', companyId)
                .eq('type', 'debit_note')
                .order('date', { ascending: false });

            if (error) {
                console.error('❌ خطأ في جلب مرتجعات المشتريات:', error);
                return [];
            }
            return (data || []).map(this.mapToReturn);
        } catch (err) {
            console.error('❌ استثناء في جلب مرتجعات المشتريات:', err);
            return [];
        }
    },

    /**
     * جلب مرتجع واحد
     */
    async getById(id: string): Promise<Return | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('documents')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return this.mapToReturn(data);
        } catch (err) {
            console.error('❌ خطأ في جلب المرتجع:', err);
            return null;
        }
    },

    /**
     * إنشاء مرتجع جديد
     */
    async create(
        companyId: string,
        returnData: {
            return_type: 'sales' | 'purchase';
            date?: string;
            partner_id?: string;
            warehouse_id?: string;
            subtotal: number;
            tax_total?: number;
            total_amount?: number; // Optional if calculated
            reason?: string;
            notes?: string;
        }
    ): Promise<Return | null> {
        try {
            const type = returnData.return_type === 'sales' ? 'credit_note' : 'debit_note';

            // Generate Number
            const number = await this.generateNumber(companyId, returnData.return_type);

            const total = returnData.total_amount || (returnData.subtotal + (returnData.tax_total || 0));

            const payload: Insert<'documents'> = {
                id: generateUUID(),
                company_id: companyId,
                type: type,
                document_number: number,
                date: returnData.date || getCurrentTimestamp().split('T')[0],
                partner_id: returnData.partner_id,
                warehouse_id: returnData.warehouse_id,
                status: 'draft', // Start as draft
                subtotal: returnData.subtotal,
                tax_total: returnData.tax_total || 0,
                total_amount: total,
                notes: `${returnData.notes || ''} \n Reason: ${returnData.reason || ''}`,
                created_at: getCurrentTimestamp()
            };

            const { data, error } = await (supabase as any)
                .from('documents')
                .insert(payload)
                .select()
                .single();

            if (error) throw error;
            console.log('✅ تم إنشاء مرتجع جديد:', data.id);
            return this.mapToReturn(data);
        } catch (err) {
            console.error('❌ خطأ في إنشاء المرتجع:', err);
            return null;
        }
    },

    /**
     * تحديث مرتجع
     */
    async update(id: string, updates: Partial<Return>): Promise<Return | null> {
        try {
            // Convert Return updates to Document updates if necessary
            // For now, assume mapped fields (handled by caller mostly, but types mismatch)
            // We just support updating status/notes/totals

            const payload: any = { ...updates };
            if (updates.reason) {
                // Append reason to notes or merge? Hard to destructure from existing notes without reading.
                // We will simply update notes if provided.
                delete payload.reason;
                delete payload.return_type;
                delete payload.return_number;
            }

            const { data, error } = await (supabase as any)
                .from('documents')
                .update({
                    ...payload,
                    updated_at: getCurrentTimestamp()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            console.log('✅ تم تحديث المرتجع:', id);
            return this.mapToReturn(data);
        } catch (err) {
            console.error('❌ خطأ في تحديث المرتجع:', err);
            return null;
        }
    },

    /**
     * تغيير حالة المرتجع
     */
    async updateStatus(id: string, status: Document['status']): Promise<boolean> {
        try {
            const { error } = await (supabase as any)
                .from('documents')
                .update({
                    status: status,
                    updated_at: getCurrentTimestamp()
                })
                .eq('id', id);

            if (error) throw error;
            console.log('✅ تم تحديث حالة المرتجع:', id);
            return true;
        } catch (err) {
            console.error('❌ خطأ في تحديث حالة المرتجع:', err);
            return false;
        }
    },

    /**
     * توليد رقم مرتجع
     */
    async generateNumber(companyId: string, type: 'sales' | 'purchase'): Promise<string> {
        const prefix = type === 'sales' ? 'SR' : 'PR'; // Sales Return / Purchase Return
        const docType = type === 'sales' ? 'credit_note' : 'debit_note';
        const year = new Date().getFullYear();

        const { count } = await (supabase as any)
            .from('documents')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .eq('type', docType);

        const number = ((count || 0) + 1).toString().padStart(5, '0');
        return `${prefix}-${year}-${number}`;
    },

    mapToReturn(doc: any): Return {
        return {
            ...doc,
            return_number: doc.document_number,
            return_type: doc.type === 'credit_note' ? 'sales' : 'purchase',
            // Attempt to extract reason from notes if possible, or just leave undefined
        };
    }
};

export default returnsService;
