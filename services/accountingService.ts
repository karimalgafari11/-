/**
 * Accounting Service - خدمة المحاسبة
 * التعامل مع الحسابات والقيود
 * متوافق مع Supabase Schema V6
 */

import { supabase } from '../lib/supabaseClient';

import { ActivityLogger } from './activityLogger';
import type {
    Account,
    JournalEntry,
    JournalEntryLine,
    InsertType
} from '../types/supabase-database';
import { TrialBalanceRow } from '../types/accounting';

// متغيرات مؤقتة للتخزين المحلي في الذاكرة (fallback)
let cachedAccounts: Account[] = [];
let cachedEntries: JournalEntry[] = [];
let cachedLines: JournalEntryLine[] = [];

export interface JournalEntryWithLines extends JournalEntry {
    lines: JournalEntryLine[];
}

export interface CreateJournalEntryData {
    entry: Omit<InsertType<'journal_entries'>, 'entry_number' | 'total_debit' | 'total_credit' | 'company_id'>;
    lines: Omit<InsertType<'journal_entry_lines'>, 'journal_entry_id' | 'company_id'>[];
}

export const AccountingService = {
    // ========================================
    // ACCOUNTS
    // ========================================

    /**
     * جلب دليل الحسابات
     */
    async getAccounts(companyId: string): Promise<Account[]> {
        try {
            const { data, error } = await (supabase as any)
                .from('accounts')
                .select('*')
                .eq('company_id', companyId)
                .eq('is_active', true)
                .order('code');

            if (!error && data) {
                cachedAccounts = data;
                return data;
            }
        } catch (err) {
            console.error('❌ خطأ في جلب الحسابات:', err);
        }

        return cachedAccounts.filter(a => a.company_id === companyId && a.is_active);
    },

    /**
     * جلب الحسابات حسب النوع
     */
    async getAccountsByType(companyId: string, type: string): Promise<Account[]> {
        const accounts = await this.getAccounts(companyId);
        // Note: strict type checking might fail if string doesn't match enum exactly, but runtime is safe
        return accounts.filter(a => a.type_id === type || (a as any).account_type === type);
    },

    /**
     * جلب الحسابات القابلة للقيد
     */
    async getPostableAccounts(companyId: string): Promise<Account[]> {
        const accounts = await this.getAccounts(companyId);
        return accounts.filter(a => a.is_active);
    },

    /**
     * البحث عن حساب برقم الرمز
     */
    findAccount(companyId: string, code: string): Promise<Account | null> {
        return this.getAccounts(companyId).then(accounts => accounts.find(a => a.code === code) || null);
    },

    /**
     * جلب ميزان المراجعة
     */
    async getTrialBalance(companyId: string): Promise<TrialBalanceRow[]> {
        const { data, error } = await (supabase as any)
            .from('vw_trial_balance')
            .select('*')
            .eq('company_id', companyId);

        if (error) {
            console.error('Error fetching trial balance:', error);
            return [];
        }
        return data || [];
    },

    // ========================================
    // JOURNAL ENTRIES
    // ========================================

    /**
     * جلب قيود اليومية
     */
    async getJournalEntries(
        companyId: string,
        options?: {
            status?: JournalEntry['status'];
            limit?: number;
        }
    ): Promise<JournalEntry[]> {
        try {
            let query = (supabase as any)
                .from('journal_entries')
                .select('*')
                .eq('company_id', companyId)
                .order('entry_date', { ascending: false });

            if (options?.status) query = query.eq('status', options.status);
            if (options?.limit) query = query.limit(options.limit);

            const { data, error } = await query;
            if (!error && data) {
                cachedEntries = data;
                return data;
            }
        } catch (err) {
            console.error('❌ خطأ في جلب قيود اليومية:', err);
        }

        let entries = cachedEntries.filter(e => e.company_id === companyId);

        if (options?.status) entries = entries.filter(e => e.status === options.status);

        return entries.slice(0, options?.limit || entries.length);
    },

    /**
     * جلب قيد مع السطور
     */
    async getJournalEntryWithLines(entryId: string): Promise<JournalEntryWithLines | null> {
        try {
            const { data: entry, error } = await (supabase as any)
                .from('journal_entries')
                .select('*')
                .eq('id', entryId)
                .single();

            if (error || !entry) return null;

            const { data: lines } = await (supabase as any)
                .from('journal_entry_lines')
                .select('*')
                .eq('journal_entry_id', entryId);

            return { ...(entry as JournalEntry), lines: lines || [] };
        } catch (err) {
            console.error('❌ خطأ في جلب القيد:', err);
            return null;
        }
    },

    /**
     * إنشاء قيد يومية
     */
    async createJournalEntry(
        data: CreateJournalEntryData,
        context: { userId: string; companyId: string; userName?: string }
    ): Promise<JournalEntryWithLines> {
        // التحقق من توازن القيد
        const totalDebit = data.lines.reduce((sum, l) => sum + (l.debit || 0), 0);
        const totalCredit = data.lines.reduce((sum, l) => sum + (l.credit || 0), 0);

        if (Math.abs(totalDebit - totalCredit) > 0.001) {
            throw new Error(`القيد غير متوازن: المدين (${totalDebit}) لا يساوي الدائن (${totalCredit})`);
        }

        const entryNumber = this.generateEntryNumber();
        const now = new Date().toISOString();

        // 1. Prepare Entry Object
        const newEntryPayload: InsertType<'journal_entries'> = {
            company_id: context.companyId,
            entry_number: entryNumber,
            entry_date: data.entry.entry_date || now.split('T')[0],
            description: data.entry.description,
            reference_type: data.entry.reference_type,
            reference_id: data.entry.reference_id,
            total_debit: totalDebit,
            total_credit: totalCredit,
            status: 'draft',
            created_by: context.userId,
            created_at: now,

            // Optional Fields from input
            branch_id: data.entry.branch_id,
            fiscal_year_id: data.entry.fiscal_year_id
        };

        let createdEntry: JournalEntry;

        try {
            const { data: insertedEntry, error: entryError } = await (supabase as any)
                .from('journal_entries')
                .insert(newEntryPayload)
                .select()
                .single();

            if (entryError) throw entryError;
            createdEntry = insertedEntry;

            const newLinesPayload: InsertType<'journal_entry_lines'>[] = data.lines.map((line) => ({
                company_id: context.companyId,
                journal_entry_id: createdEntry.id,
                account_id: line.account_id,
                description: line.description,
                debit: line.debit || 0,
                credit: line.credit || 0,
                created_at: now,
                cost_center_id: line.cost_center_id,
                currency_code: line.currency_code,
                exchange_rate: line.exchange_rate
            }));

            const { data: insertedLines, error: linesError } = await (supabase as any)
                .from('journal_entry_lines')
                .insert(newLinesPayload)
                .select();

            if (linesError) throw linesError;

            console.log('✅ تم حفظ القيد في Supabase:', createdEntry.id);
            return { ...createdEntry, lines: insertedLines as JournalEntryLine[] };

        } catch (err) {
            console.error('❌ خطأ في حفظ القيد:', err);
            throw err;
        }
    },

    /**
     * ترحيل قيد
     */
    async postJournalEntry(
        entryId: string,
        context: { userId: string; userName?: string }
    ): Promise<boolean> {
        try {
            const { data: entry, error: fetchError } = await (supabase as any)
                .from('journal_entries')
                .select('*')
                .eq('id', entryId)
                .single();

            if (fetchError || !entry) {
                console.error('❌ لم يتم العثور على القيد');
                return false;
            }

            const typedEntry = entry as JournalEntry;
            if (typedEntry.status !== 'draft') {
                throw new Error('لا يمكن ترحيل قيد بحالة ' + typedEntry.status);
            }

            const now = new Date().toISOString();

            const { error: updateError } = await (supabase as any)
                .from('journal_entries')
                .update({
                    status: 'posted',
                    posted_by: context.userId,
                    posted_at: now
                } as any)
                .eq('id', entryId);

            if (updateError) {
                console.error('❌ خطأ في ترحيل القيد:', updateError);
                return false;
            }

            console.log('✅ تم ترحيل القيد:', entryId);
            return true;
        } catch (err) {
            console.error('❌ استثناء في ترحيل القيد:', err);
            return false;
        }
    },

    /**
     * توليد رقم قيد (مؤقت)
     */
    generateEntryNumber(): string {
        const date = new Date();
        const year = date.getFullYear();
        const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        return `JE-${year}-${random}`;
    },

    // ========================================
    // BALANCE CALCULATIONS
    // ========================================

    async getAccountBalance(companyId: string, accountId: string): Promise<number> {
        try {
            // Note: In V6 schema, we should prefer 'accounts.current_balance' if available and reliable.
            // But calculating from lines is safer if we want to be sure.
            // However, V6 has triggers to update current_balance! So let's try to use that first for speed.

            const { data: account, error } = await (supabase as any)
                .from('accounts')
                .select('current_balance')
                .eq('id', accountId)
                .single();

            if (!error && account && account.current_balance !== null) {
                return account.current_balance;
            }

            // Fallback to summing up lines
            const { data: lines, error: linesError } = await (supabase as any)
                .from('journal_entry_lines')
                .select('debit, credit')
                .eq('company_id', companyId)
                .eq('account_id', accountId);

            if (linesError || !lines) return 0;

            const totalDebit = lines.reduce((sum: number, l: any) => sum + (l.debit || 0), 0);
            const totalCredit = lines.reduce((sum: number, l: any) => sum + (l.credit || 0), 0);

            return totalDebit - totalCredit;
        } catch (err) {
            console.error('❌ خطأ في حساب الرصيد:', err);
            return 0;
        }
    }
};
