/**
 * Vouchers Service - خدمة السندات
 * CRUD للسندات (قبض ودفع) مع Supabase
 */

import { supabase } from '../lib/supabaseClient';
import type { Voucher, VoucherType, InsertType } from '../types/supabase-types';

export const vouchersService = {
    /**
     * جلب جميع السندات
     */
    async getAll(companyId: string, type?: VoucherType): Promise<Voucher[]> {
        try {
            let query = supabase
                .from('vouchers')
                .select('*')
                .eq('company_id', companyId)
                .order('voucher_date', { ascending: false });

            if (type) query = query.eq('voucher_type', type);

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
     * جلب سندات عميل
     */
    async getByCustomer(companyId: string, customerId: string): Promise<Voucher[]> {
        try {
            const { data, error } = await supabase
                .from('vouchers')
                .select('*')
                .eq('company_id', companyId)
                .eq('customer_id', customerId)
                .order('voucher_date', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('❌ خطأ في جلب سندات العميل:', err);
            return [];
        }
    },

    /**
     * جلب سندات مورد
     */
    async getBySupplier(companyId: string, supplierId: string): Promise<Voucher[]> {
        try {
            const { data, error } = await supabase
                .from('vouchers')
                .select('*')
                .eq('company_id', companyId)
                .eq('supplier_id', supplierId)
                .order('voucher_date', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('❌ خطأ في جلب سندات المورد:', err);
            return [];
        }
    },

    /**
     * إنشاء سند جديد
     */
    async create(
        companyId: string,
        voucher: Omit<InsertType<Voucher>, 'company_id' | 'voucher_number'>
    ): Promise<Voucher | null> {
        try {
            const voucherNumber = await this.generateNumber(companyId, voucher.voucher_type);

            const { data, error } = await supabase
                .from('vouchers')
                .insert({
                    ...voucher,
                    company_id: companyId,
                    voucher_number: voucherNumber
                })
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
     * توليد رقم سند
     */
    async generateNumber(companyId: string, type: VoucherType): Promise<string> {
        const prefix = type === 'receipt' ? 'RV' : 'PV';
        const year = new Date().getFullYear();

        const { count } = await supabase
            .from('vouchers')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .eq('voucher_type', type);

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
            const { data, error } = await supabase
                .from('vouchers')
                .select('amount, voucher_type')
                .eq('company_id', companyId);

            if (error) throw error;

            const stats = (data || []).reduce((acc, v) => {
                if (v.voucher_type === 'receipt') {
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
