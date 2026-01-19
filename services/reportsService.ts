/**
 * Reports Service - خدمة التقارير المالية
 * جلب البيانات من الـ Views المحاسبية
 */

import { supabase } from '../lib/supabaseClient';
import type {
    TrialBalanceEntry,
    IncomeStatement,
    BalanceSheet,
    PartnerBalance
} from '../types/supabase-types';

export const reportsService = {
    /**
     * جلب ميزان المراجعة
     */
    async getTrialBalance(companyId: string): Promise<TrialBalanceEntry[]> {
        try {
            const { data, error } = await supabase
                .from('view_trial_balance')
                .select('*')
                .eq('company_id', companyId)
                .order('code', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('❌ خطأ في جلب ميزان المراجعة:', err);
            return [];
        }
    },

    /**
     * جلب قائمة الدخل
     */
    async getIncomeStatement(companyId: string): Promise<IncomeStatement | null> {
        try {
            const { data, error } = await supabase
                .from('view_income_statement')
                .select('*')
                .eq('company_id', companyId)
                .single();

            if (error) {
                // If no data found (no transactions yet), return zeroed structure
                if (error.code === 'PGRST116') {
                    return {
                        company_id: companyId,
                        total_revenue: 0,
                        total_expenses: 0,
                        net_profit: 0
                    };
                }
                throw error;
            }
            return data;
        } catch (err) {
            console.error('❌ خطأ في جلب قائمة الدخل:', err);
            return null;
        }
    },

    /**
     * جلب الميزانية العمومية
     */
    async getBalanceSheet(companyId: string): Promise<BalanceSheet | null> {
        try {
            const { data, error } = await supabase
                .from('view_balance_sheet')
                .select('*')
                .eq('company_id', companyId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return {
                        company_id: companyId,
                        total_assets: 0,
                        total_liabilities: 0,
                        total_equity: 0,
                        current_earnings: 0
                    };
                }
                throw error;
            }
            return data;
        } catch (err) {
            console.error('❌ خطأ في جلب الميزانية العمومية:', err);
            return null;
        }
    },

    /**
     * جلب أرصدة العملاء
     */
    async getCustomerBalances(companyId: string): Promise<PartnerBalance[]> {
        try {
            const { data, error } = await supabase
                .from('view_customer_balances')
                .select('customer_id, customer_name, company_id, current_balance, last_transaction_date')
                .eq('company_id', companyId)
                .order('current_balance', { ascending: false });

            // Map to generic PartnerBalance
            if (error) throw error;
            return (data || []).map((item: any) => ({
                partner_id: item.customer_id,
                partner_name: item.customer_name,
                company_id: item.company_id,
                current_balance: item.current_balance,
                last_transaction_date: item.last_transaction_date
            }));
        } catch (err) {
            console.error('❌ خطأ في جلب أرصدة العملاء:', err);
            return [];
        }
    },

    /**
     * جلب أرصدة الموردين
     */
    async getSupplierBalances(companyId: string): Promise<PartnerBalance[]> {
        try {
            const { data, error } = await supabase
                .from('view_supplier_balances')
                .select('supplier_id, supplier_name, company_id, current_balance, last_transaction_date')
                .eq('company_id', companyId)
                .order('current_balance', { ascending: false });

            if (error) throw error;
            return (data || []).map((item: any) => ({
                partner_id: item.supplier_id,
                partner_name: item.supplier_name,
                company_id: item.company_id,
                current_balance: item.current_balance,
                last_transaction_date: item.last_transaction_date
            }));
        } catch (err) {
            console.error('❌ خطأ في جلب أرصدة الموردين:', err);
            return [];
        }
    }
};

export default reportsService;
