/**
 * Accounts Service - خدمة شجرة الحسابات
 */

import { db, generateUUID, getCurrentTimestamp } from '../lib/localStorageClient';
import { companyService } from './companyService';
import { Account, AccountInsert, AccountUpdate, AccountBalance, TrialBalanceRow } from '../types/accounting';

export const accountsService = {
    /**
     * جلب جميع الحسابات
     */
    async getAll(): Promise<Account[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return [];

            const { data, error } = await db
                .from('accounts')
                .select('*')
                .eq('company_id', companyId)
                .eq('is_active', true)
                .order('code');

            if (error) {
                console.error('Error fetching accounts:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getAll accounts:', error);
            return [];
        }
    },

    /**
     * جلب حساب واحد
     */
    async getById(id: string): Promise<Account | null> {
        try {
            const { data, error } = await db
                .from('accounts')
                .select('*')
                .eq('id', id)
                .single();

            if (error) return null;
            return data;
        } catch {
            return null;
        }
    },

    /**
     * جلب حساب بالكود
     */
    async getByCode(code: string): Promise<Account | null> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return null;

            const { data, error } = await db
                .from('accounts')
                .select('*')
                .eq('company_id', companyId)
                .eq('code', code)
                .single();

            if (error) return null;
            return data;
        } catch {
            return null;
        }
    },

    /**
     * إنشاء حساب جديد
     */
    async create(account: AccountInsert): Promise<Account | null> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return null;

            const { data, error } = await db
                .from('accounts')
                .insert({
                    id: generateUUID(),
                    ...account,
                    company_id: companyId,
                    created_at: getCurrentTimestamp()
                } as never)
                .select()
                .single();

            if (error) {
                console.error('Error creating account:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in create account:', error);
            return null;
        }
    },

    /**
     * تحديث حساب
     */
    async update(id: string, updates: AccountUpdate): Promise<Account | null> {
        try {
            const { data, error } = await db
                .from('accounts')
                .update(updates as never)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating account:', error);
                return null;
            }

            return data;
        } catch {
            return null;
        }
    },

    /**
     * حذف حساب (soft delete)
     */
    async delete(id: string): Promise<boolean> {
        try {
            const { error } = await db
                .from('accounts')
                .update({ is_active: false } as never)
                .eq('id', id);

            return !error;
        } catch {
            return false;
        }
    },

    /**
     * جلب أرصدة الحسابات
     */
    async getBalances(): Promise<AccountBalance[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return [];

            const { data, error } = await db
                .from('vw_account_balances')
                .select('*')
                .eq('company_id', companyId);

            if (error) {
                console.error('Error fetching balances:', error);
                return [];
            }

            return data || [];
        } catch {
            return [];
        }
    },

    /**
     * جلب ميزان المراجعة
     */
    async getTrialBalance(): Promise<TrialBalanceRow[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return [];

            const { data, error } = await db
                .from('vw_trial_balance')
                .select('*')
                .eq('company_id', companyId);

            if (error) {
                console.error('Error fetching trial balance:', error);
                return [];
            }

            return data || [];
        } catch {
            return [];
        }
    },

    /**
     * جلب حسابات حسب النوع
     */
    async getByType(type: string): Promise<Account[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return [];

            const { data, error } = await db
                .from('accounts')
                .select('*')
                .eq('company_id', companyId)
                .eq('account_type', type)
                .eq('is_active', true)
                .eq('allow_transactions', true)
                .order('code');

            if (error) return [];
            return data || [];
        } catch {
            return [];
        }
    },

    /**
     * جلب الحسابات الفرعية
     */
    async getChildren(parentId: string): Promise<Account[]> {
        try {
            const { data, error } = await db
                .from('accounts')
                .select('*')
                .eq('parent_id', parentId)
                .eq('is_active', true)
                .order('code');

            if (error) return [];
            return data || [];
        } catch {
            return [];
        }
    }
};

export default accountsService;
