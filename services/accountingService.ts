/**
 * Accounting Service - خدمة المحاسبة
 * التعامل مع الحسابات والقيود
 * متوافق مع Supabase Schema
 */

import { supabase } from '../lib/supabaseClient';
import { SafeStorage } from '../utils/storage';
import { ActivityLogger } from './activityLogger';
import type {
    Account,
    JournalEntry,
    JournalEntryLine,
    InsertType
} from '../types/supabase-types';

const ACCOUNTS_KEY = 'alzhra_accounts';
const JOURNAL_ENTRIES_KEY = 'alzhra_journal_entries';
const JOURNAL_LINES_KEY = 'alzhra_journal_lines';

export interface JournalEntryWithLines extends JournalEntry {
    lines: JournalEntryLine[];
}

export interface CreateJournalEntryData {
    entry: Omit<InsertType<JournalEntry>, 'entry_number' | 'total_debit' | 'total_credit'>;
    lines: Omit<InsertType<JournalEntryLine>, 'journal_entry_id' | 'company_id'>[];
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
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .eq('company_id', companyId)
                .eq('is_active', true)
                .order('code');

            if (!error && data) {
                SafeStorage.set(ACCOUNTS_KEY, data);
                return data;
            }
        } catch (err) {
            console.error('❌ خطأ في جلب الحسابات:', err);
        }

        const local = SafeStorage.get<Account[]>(ACCOUNTS_KEY, []);
        return local.filter(a => a.company_id === companyId && a.is_active);
    },

    /**
     * جلب الحسابات حسب النوع
     */
    async getAccountsByType(companyId: string, type: Account['account_type']): Promise<Account[]> {
        const accounts = await this.getAccounts(companyId);
        return accounts.filter(a => a.account_type === type);
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
    async findAccount(companyId: string, code: string): Promise<Account | null> {
        const accounts = await this.getAccounts(companyId);
        return accounts.find(a => a.code === code) || null;
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
            let query = supabase
                .from('journal_entries')
                .select('*')
                .eq('company_id', companyId)
                .order('entry_date', { ascending: false });

            if (options?.status) query = query.eq('status', options.status);
            if (options?.limit) query = query.limit(options.limit);

            const { data, error } = await query;
            if (!error && data) {
                SafeStorage.set(JOURNAL_ENTRIES_KEY, data);
                return data;
            }
        } catch (err) {
            console.error('❌ خطأ في جلب قيود اليومية:', err);
        }

        let entries = SafeStorage.get<JournalEntry[]>(JOURNAL_ENTRIES_KEY, [])
            .filter(e => e.company_id === companyId);

        if (options?.status) entries = entries.filter(e => e.status === options.status);

        return entries.slice(0, options?.limit || entries.length);
    },

    /**
     * جلب قيد مع السطور
     */
    async getJournalEntryWithLines(entryId: string): Promise<JournalEntryWithLines | null> {
        try {
            const { data: entry, error } = await supabase
                .from('journal_entries')
                .select('*')
                .eq('id', entryId)
                .single();

            if (error || !entry) return null;

            const { data: lines } = await supabase
                .from('journal_entry_lines')
                .select('*')
                .eq('journal_entry_id', entryId);

            return { ...entry, lines: lines || [] };
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

        const newEntry: JournalEntry = {
            id: `je_${Date.now()}`,
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
            created_at: now
        };

        const newLines: JournalEntryLine[] = data.lines.map((line, index) => ({
            id: `jel_${Date.now()}_${index}`,
            company_id: context.companyId,
            journal_entry_id: newEntry.id,
            account_id: line.account_id,
            description: line.description,
            debit: line.debit || 0,
            credit: line.credit || 0,
            created_at: now
        }));

        // الحفظ في Supabase
        try {
            const { error: entryError } = await supabase
                .from('journal_entries')
                .insert(newEntry);

            if (entryError) throw entryError;

            const { error: linesError } = await supabase
                .from('journal_entry_lines')
                .insert(newLines);

            if (linesError) throw linesError;

            console.log('✅ تم حفظ القيد في Supabase:', newEntry.id);
        } catch (err) {
            console.error('❌ خطأ في حفظ القيد:', err);
            // Fallback: حفظ محلياً
            const localEntries = SafeStorage.get<JournalEntry[]>(JOURNAL_ENTRIES_KEY, []);
            localEntries.push(newEntry);
            SafeStorage.set(JOURNAL_ENTRIES_KEY, localEntries);

            const localLines = SafeStorage.get<JournalEntryLine[]>(JOURNAL_LINES_KEY, []);
            localLines.push(...newLines);
            SafeStorage.set(JOURNAL_LINES_KEY, localLines);
        }

        // تسجيل النشاط
        ActivityLogger.log({
            action: 'create',
            entityType: 'journal_entry',
            entityId: newEntry.id,
            entityName: `قيد ${entryNumber}`,
            userId: context.userId,
            userName: context.userName || 'مستخدم',
            organizationId: context.companyId,
            branchId: '',
            newData: { entry: newEntry, lines: newLines } as unknown as Record<string, unknown>
        });

        return { ...newEntry, lines: newLines };
    },

    /**
     * ترحيل قيد
     */
    async postJournalEntry(
        entryId: string,
        context: { userId: string; userName?: string }
    ): Promise<boolean> {
        try {
            const { data: entry, error: fetchError } = await supabase
                .from('journal_entries')
                .select('*')
                .eq('id', entryId)
                .single();

            if (fetchError || !entry) {
                console.error('❌ لم يتم العثور على القيد');
                return false;
            }

            if (entry.status !== 'draft') {
                throw new Error('لا يمكن ترحيل قيد بحالة ' + entry.status);
            }

            const now = new Date().toISOString();

            const { error: updateError } = await supabase
                .from('journal_entries')
                .update({
                    status: 'posted',
                    posted_by: context.userId,
                    posted_at: now
                })
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
     * توليد رقم قيد
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

    /**
     * حساب رصيد حساب معين
     */
    async getAccountBalance(companyId: string, accountId: string): Promise<number> {
        try {
            const { data, error } = await supabase
                .from('journal_entry_lines')
                .select('debit, credit')
                .eq('company_id', companyId)
                .eq('account_id', accountId);

            if (error || !data) return 0;

            const totalDebit = data.reduce((sum, l) => sum + (l.debit || 0), 0);
            const totalCredit = data.reduce((sum, l) => sum + (l.credit || 0), 0);

            return totalDebit - totalCredit;
        } catch (err) {
            console.error('❌ خطأ في حساب الرصيد:', err);
            return 0;
        }
    },

    /**
     * ميزان المراجعة
     */
    async getTrialBalance(companyId: string): Promise<{
        accounts: Array<{
            account: Account;
            debit: number;
            credit: number;
        }>;
        totalDebit: number;
        totalCredit: number;
    }> {
        const accounts = await this.getAccounts(companyId);
        const result: Array<{ account: Account; debit: number; credit: number }> = [];

        let totalDebit = 0;
        let totalCredit = 0;

        for (const account of accounts) {
            const balance = await this.getAccountBalance(companyId, account.id);

            const debit = balance > 0 ? balance : 0;
            const credit = balance < 0 ? Math.abs(balance) : 0;

            if (debit > 0 || credit > 0) {
                result.push({ account, debit, credit });
                totalDebit += debit;
                totalCredit += credit;
            }
        }

        return { accounts: result, totalDebit, totalCredit };
    }
};
