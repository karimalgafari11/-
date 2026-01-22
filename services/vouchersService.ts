/**
 * Vouchers Service - خدمة السندات
 * CRUD للسندات (قبض ودفع) مع Supabase
 */

import { supabase } from '../lib/supabaseClient';
import type { Voucher, Insert, Update } from '../types/supabase-helpers';

// Alias for clarity if needed, though 'type' is strict 'receipt' | 'payment'
export type VoucherType = 'receipt' | 'payment';

export const vouchersService = {
    /**
     * جلب جميع السندات
     */
    async getAll(companyId: string, type?: VoucherType): Promise<Voucher[]> {
        try {
            // Note: In V6, customers and suppliers are 'partners'.
            // The relationship might need to be explicit if strict FK names are used, e.g. partners!vouchers_partner_id_fkey
            // But usually 'partners' is enough if one FK.
            let query = (supabase as any)
                .from('vouchers')
                .select('*, partners(name)')
                .eq('company_id', companyId)
                .order('date', { ascending: false }); // 'date' instead of 'voucher_date' in V6? Check types. V6 TS says 'date'.

            if (type) query = query.eq('type', type);

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('❌ خطأ في جلب السندات:', err);
            return [];
        }
    },

    /**
     * جلب سندات قبض
     */
    async getReceipts(companyId: string): Promise<Voucher[]> {
        return this.getAll(companyId, 'receipt');
    },

    /**
     * جلب سندات دفع
     */
    async getPayments(companyId: string): Promise<Voucher[]> {
        return this.getAll(companyId, 'payment');
    },

    /**
     * جلب سندات عميل (Partner)
     */
    async getByCustomer(companyId: string, partnerId: string): Promise<Voucher[]> {
        // Legacy name kept for compatibility, but uses partner_id
        return this.getByPartner(companyId, partnerId);
    },

    /**
     * جلب سندات مورد (Partner)
     */
    async getBySupplier(companyId: string, partnerId: string): Promise<Voucher[]> {
        return this.getByPartner(companyId, partnerId);
    },

    /**
     * جلب سندات شريك (جديد V6)
     */
    async getByPartner(companyId: string, partnerId: string): Promise<Voucher[]> {
        try {
            const { data, error } = await (supabase as any)
                .from('vouchers')
                .select('*, partners(name)')
                .eq('company_id', companyId)
                .eq('partner_id', partnerId)
                .order('date', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('❌ خطأ في جلب سندات الشريك:', err);
            return [];
        }
    },

    /**
     * إنشاء سند جديد
     */
    async create(
        companyId: string,
        voucher: Omit<Insert<'vouchers'>, 'company_id' | 'voucher_number'>
    ): Promise<Voucher | null> {
        try {
            // Type is required in V6 InsertType, so usage must provide it.
            const voucherType = voucher.type;
            if (!voucherType) throw new Error('Voucher type is required');

            const voucherNumber = await this.generateNumber(companyId, voucherType);

            const payload: Insert<'vouchers'> = {
                ...voucher,
                company_id: companyId,
                voucher_number: voucherNumber
            };

            const { data, error } = await (supabase as any)
                .from('vouchers')
                .insert(payload)
                .select()
                .single();

            if (error) throw error;
            console.log('✅ تم إنشاء سند جديد:', data.id);
            return data;
        } catch (err) {
            console.error('❌ خطأ في إنشاء السند:', err);
            return null;
        }
    },

    /**
     * تحديث سند
     */
    async update(id: string, updates: Partial<Insert<'vouchers'>>): Promise<Voucher | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('vouchers')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                } as Update<'vouchers'>)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            console.log('✅ تم تحديث السند:', id);
            return data;
        } catch (err) {
            console.error('❌ خطأ في تحديث السند:', err);
            return null;
        }
    },

    /**
     * حذف سند
     */
    async delete(id: string): Promise<boolean> {
        try {
            const { error } = await (supabase as any)
                .from('vouchers')
                .delete()
                .eq('id', id);

            if (error) throw error;
            console.log('✅ تم حذف السند:', id);
            return true;
        } catch (err) {
            console.error('❌ خطأ في حذف السند:', err);
            return false;
        }
    },

    /**
     * توليد رقم سند
     */
    async generateNumber(companyId: string, type: VoucherType): Promise<string> {
        const prefix = type === 'receipt' ? 'RV' : 'PV';
        const year = new Date().getFullYear();

        const { count } = await (supabase as any)
            .from('vouchers')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .eq('type', type);

        const number = ((count || 0) + 1).toString().padStart(5, '0');
        return `${prefix}-${year}-${number}`;
    },

    /**
     * إحصائيات السندات
     */
    async getStats(companyId: string): Promise<{
        totalReceipts: number;
        totalPayments: number;
        receiptsCount: number;
        paymentsCount: number;
    }> {
        try {
            const { data, error } = await (supabase as any)
                .from('vouchers')
                .select('amount, type')
                .eq('company_id', companyId);

            if (error) throw error;

            const stats = (data || []).reduce((acc: any, v: any) => {
                if (v.type === 'receipt') {
                    acc.totalReceipts += v.amount || 0;
                    acc.receiptsCount += 1;
                } else {
                    acc.totalPayments += v.amount || 0;
                    acc.paymentsCount += 1;
                }
                return acc;
            }, {
                totalReceipts: 0,
                totalPayments: 0,
                receiptsCount: 0,
                paymentsCount: 0
            });

            return stats;
        } catch (err) {
            console.error('❌ خطأ في الإحصائيات:', err);
            return { totalReceipts: 0, totalPayments: 0, receiptsCount: 0, paymentsCount: 0 };
        }
    }
};

export default vouchersService;
