/**
 * Accounting Service - خدمة المحاسبة
 * التعامل مع الحسابات والقيود
 */

// Supabase disabled - working with local storage only
const isSupabaseConfigured = () => false;
const getSupabaseClient = (): any => null;
import { SafeStorage } from '../utils/storage';
import { ActivityLogger } from './activityLogger';
import type {
    Account,
    JournalEntry,
    JournalEntryLine,
    FiscalPeriod,
    InsertType
} from '../types/database';

const ACCOUNTS_KEY = 'alzhra_accounts';
const JOURNAL_ENTRIES_KEY = 'alzhra_journal_entries';
const JOURNAL_LINES_KEY = 'alzhra_journal_lines';
const FISCAL_PERIODS_KEY = 'alzhra_fiscal_periods';

export interface JournalEntryWithLines extends JournalEntry {
    lines: JournalEntryLine[];
}

export interface CreateJournalEntryData {
    entry: InsertType<JournalEntry>;
    lines: InsertType<JournalEntryLine>[];
}

export const AccountingService = {
    // ========================================
    // ACCOUNTS
    // ========================================

    /**
     * جلب دليل الحسابات
     */
    async getAccounts(organizationId: string): Promise<Account[]> {
        if (isSupabaseConfigured() && navigator.onLine) {
            const client = getSupabaseClient();
            if (client) {
                try {
                    const { data, error } = await client
                        .from('accounts')
                        .select('*')
                        .eq('organization_id', organizationId)
                        .is('deleted_at', null)
                        .order('code');

                    if (!error && data) {
                        SafeStorage.set(ACCOUNTS_KEY, data);
                        return data;
                    }
                } catch (err) {
                    console.error('Error fetching accounts:', err);
                }
            }
        }

        const local = SafeStorage.get<Account[]>(ACCOUNTS_KEY, []);
        return local.filter(a => a.organization_id === organizationId && !a.deleted_at);
    },

    /**
     * جلب الحسابات حسب النوع
     */
    async getAccountsByType(organizationId: string, type: Account['account_type']): Promise<Account[]> {
        const accounts = await this.getAccounts(organizationId);
        return accounts.filter(a => a.account_type === type && !a.is_header);
    },

    /**
     * جلب الحسابات القابلة للقيد عليها
     */
    async getPostableAccounts(organizationId: string): Promise<Account[]> {
        const accounts = await this.getAccounts(organizationId);
        return accounts.filter(a => !a.is_header && a.allow_manual_entry);
    },

    /**
     * البحث عن حساب
     */
    async findAccount(organizationId: string, code: string): Promise<Account | null> {
        const accounts = await this.getAccounts(organizationId);
        return accounts.find(a => a.code === code) || null;
    },

    // ========================================
    // FISCAL PERIODS
    // ========================================

    /**
     * جلب الفترات المحاسبية
     */
    async getFiscalPeriods(organizationId: string): Promise<FiscalPeriod[]> {
        if (isSupabaseConfigured() && navigator.onLine) {
            const client = getSupabaseClient();
            if (client) {
                const { data } = await client
                    .from('fiscal_periods')
                    .select('*')
                    .eq('organization_id', organizationId)
                    .order('start_date', { ascending: false });

                if (data) {
                    SafeStorage.set(FISCAL_PERIODS_KEY, data);
                    return data;
                }
            }
        }

        return SafeStorage.get<FiscalPeriod[]>(FISCAL_PERIODS_KEY, [])
            .filter(p => p.organization_id === organizationId);
    },

    /**
     * جلب الفترة المفتوحة الحالية
     */
    async getCurrentPeriod(organizationId: string): Promise<FiscalPeriod | null> {
        const periods = await this.getFiscalPeriods(organizationId);
        const today = new Date().toISOString().split('T')[0];

        return periods.find(p =>
            p.status === 'open' &&
            p.start_date <= today &&
            p.end_date >= today
        ) || null;
    },

    // ========================================
    // JOURNAL ENTRIES
    // ========================================

    /**
     * جلب قيود اليومية
     */
    async getJournalEntries(
        organizationId: string,
        options?: {
            branchId?: string;
            periodId?: string;
            status?: JournalEntry['status'];
            limit?: number;
        }
    ): Promise<JournalEntry[]> {
        if (isSupabaseConfigured() && navigator.onLine) {
            const client = getSupabaseClient();
            if (client) {
                let query = client
                    .from('journal_entries')
                    .select('*')
                    .eq('organization_id', organizationId)
                    .order('entry_date', { ascending: false });

                if (options?.branchId) query = query.eq('branch_id', options.branchId);
                if (options?.periodId) query = query.eq('fiscal_period_id', options.periodId);
                if (options?.status) query = query.eq('status', options.status);
                if (options?.limit) query = query.limit(options.limit);

                const { data } = await query;
                if (data) {
                    SafeStorage.set(JOURNAL_ENTRIES_KEY, data);
                    return data;
                }
            }
        }

        let entries = SafeStorage.get<JournalEntry[]>(JOURNAL_ENTRIES_KEY, [])
            .filter(e => e.organization_id === organizationId);

        if (options?.branchId) entries = entries.filter(e => e.branch_id === options.branchId);
        if (options?.periodId) entries = entries.filter(e => e.fiscal_period_id === options.periodId);
        if (options?.status) entries = entries.filter(e => e.status === options.status);

        return entries.slice(0, options?.limit || entries.length);
    },

    /**
     * جلب قيد مع السطور
     */
    async getJournalEntryWithLines(entryId: string): Promise<JournalEntryWithLines | null> {
        let entry: JournalEntry | null = null;
        let lines: JournalEntryLine[] = [];

        if (isSupabaseConfigured() && navigator.onLine) {
            const client = getSupabaseClient();
            if (client) {
                const { data: entryData } = await client
                    .from('journal_entries')
                    .select('*')
                    .eq('id', entryId)
                    .single();

                if (entryData) {
                    entry = entryData;

                    const { data: linesData } = await client
                        .from('journal_entry_lines')
                        .select('*')
                        .eq('journal_entry_id', entryId)
                        .order('line_order');

                    lines = linesData || [];
                }
            }
        }

        if (!entry) {
            const localEntries = SafeStorage.get<JournalEntry[]>(JOURNAL_ENTRIES_KEY, []);
            entry = localEntries.find(e => e.id === entryId) || null;

            if (entry) {
                const localLines = SafeStorage.get<JournalEntryLine[]>(JOURNAL_LINES_KEY, []);
                lines = localLines.filter(l => l.journal_entry_id === entryId);
            }
        }

        return entry ? { ...entry, lines } : null;
    },

    /**
     * إنشاء قيد يومية
     */
    async createJournalEntry(
        data: CreateJournalEntryData,
        context: { userId: string; branchId: string; organizationId: string; userName?: string }
    ): Promise<JournalEntryWithLines> {
        const now = new Date().toISOString();

        // التحقق من توازن القيد
        const totalDebit = data.lines.reduce((sum, l) => sum + (l.debit_amount || 0), 0);
        const totalCredit = data.lines.reduce((sum, l) => sum + (l.credit_amount || 0), 0);

        if (Math.abs(totalDebit - totalCredit) > 0.001) {
            throw new Error(`القيد غير متوازن: المدين (${totalDebit}) لا يساوي الدائن (${totalCredit})`);
        }

        // جلب الفترة المحاسبية
        const currentPeriod = await this.getCurrentPeriod(context.organizationId);
        if (!currentPeriod) {
            throw new Error('لا توجد فترة محاسبية مفتوحة');
        }

        // إنشاء رقم القيد
        const entryNumber = this.generateEntryNumber();

        // إنشاء القيد
        const newEntry: JournalEntry = {
            ...data.entry,
            id: data.entry.id || `je_${Date.now()}`,
            organization_id: context.organizationId,
            branch_id: context.branchId,
            fiscal_period_id: currentPeriod.id,
            entry_number: entryNumber,
            status: 'draft',
            created_by: context.userId,
            created_at: now,
            updated_at: now,
        } as JournalEntry;

        // إنشاء السطور
        const newLines: JournalEntryLine[] = data.lines.map((line, index) => ({
            ...line,
            id: line.id || `jel_${Date.now()}_${index}`,
            journal_entry_id: newEntry.id,
            debit_amount_base: line.debit_amount || 0,
            credit_amount_base: line.credit_amount || 0,
            line_order: index,
            created_at: now,
        } as JournalEntryLine));

        // حفظ محلياً
        const localEntries = SafeStorage.get<JournalEntry[]>(JOURNAL_ENTRIES_KEY, []);
        localEntries.push(newEntry);
        SafeStorage.set(JOURNAL_ENTRIES_KEY, localEntries);

        const localLines = SafeStorage.get<JournalEntryLine[]>(JOURNAL_LINES_KEY, []);
        localLines.push(...newLines);
        SafeStorage.set(JOURNAL_LINES_KEY, localLines);

        // تسجيل النشاط
        ActivityLogger.log({
            action: 'create',
            entityType: 'journal_entry',
            entityId: newEntry.id,
            entityName: `قيد ${newEntry.entry_number}`,
            userId: context.userId,
            userName: context.userName || 'مستخدم',
            organizationId: context.organizationId,
            branchId: context.branchId,
            newData: { entry: newEntry, lines: newLines } as unknown as Record<string, unknown>
        });

        // المزامنة
        if (isSupabaseConfigured() && navigator.onLine) {
            const client = getSupabaseClient();
            if (client) {
                try {
                    await client.from('journal_entries').insert(newEntry);
                    await client.from('journal_entry_lines').insert(newLines);
                } catch (err) {
                    console.error('Error inserting journal entry:', err);
                }
            }
        }

        return { ...newEntry, lines: newLines };
    },

    /**
     * ترحيل قيد
     */
    async postJournalEntry(
        entryId: string,
        context: { userId: string; branchId: string; userName?: string }
    ): Promise<boolean> {
        const localEntries = SafeStorage.get<JournalEntry[]>(JOURNAL_ENTRIES_KEY, []);
        const index = localEntries.findIndex(e => e.id === entryId);

        if (index === -1) return false;

        const entry = localEntries[index];

        if (entry.status !== 'draft' && entry.status !== 'approved') {
            throw new Error('لا يمكن ترحيل قيد بحالة ' + entry.status);
        }

        localEntries[index].status = 'posted';
        localEntries[index].posted_at = new Date().toISOString();
        localEntries[index].posted_by = context.userId;
        SafeStorage.set(JOURNAL_ENTRIES_KEY, localEntries);

        ActivityLogger.log({
            action: 'post',
            entityType: 'journal_entry',
            entityId: entryId,
            entityName: `قيد ${entry.entry_number}`,
            userId: context.userId,
            userName: context.userName || 'مستخدم',
            organizationId: entry.organization_id,
            branchId: context.branchId
        });

        if (isSupabaseConfigured() && navigator.onLine) {
            const client = getSupabaseClient();
            if (client) {
                try {
                    await client.from('journal_entries').update({
                        status: 'posted',
                        posted_at: localEntries[index].posted_at,
                        posted_by: context.userId
                    }).eq('id', entryId);
                } catch (err) {
                    console.error('Error posting journal entry:', err);
                }
            }
        }

        return true;
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

    /**
     * حساب رصيد حساب
     */
    async getAccountBalance(accountId: string): Promise<number> {
        const localLines = SafeStorage.get<JournalEntryLine[]>(JOURNAL_LINES_KEY, []);
        const localEntries = SafeStorage.get<JournalEntry[]>(JOURNAL_ENTRIES_KEY, []);

        const postedEntryIds = new Set(
            localEntries.filter(e => e.status === 'posted').map(e => e.id)
        );

        const accountLines = localLines.filter(
            l => l.account_id === accountId && postedEntryIds.has(l.journal_entry_id)
        );

        const totalDebit = accountLines.reduce((sum, l) => sum + (l.debit_amount || 0), 0);
        const totalCredit = accountLines.reduce((sum, l) => sum + (l.credit_amount || 0), 0);

        return totalDebit - totalCredit;
    },

    /**
     * ميزان المراجعة
     */
    async getTrialBalance(organizationId: string): Promise<Array<{
        account: Account;
        debit: number;
        credit: number;
        balance: number;
    }>> {
        const accounts = await this.getAccounts(organizationId);
        const result: Array<{
            account: Account;
            debit: number;
            credit: number;
            balance: number;
        }> = [];

        for (const account of accounts) {
            const balance = await this.getAccountBalance(account.id);

            result.push({
                account,
                debit: balance > 0 ? balance : 0,
                credit: balance < 0 ? Math.abs(balance) : 0,
                balance
            });
        }

        return result.filter(r => r.debit !== 0 || r.credit !== 0);
    }
};
