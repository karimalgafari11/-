/**
 * Journal Entries Service - خدمة القيود المحاسبية
 * CRUD operations مع حماية القيود المعتمدة
 */

import { supabase, generateUUID, getCurrentTimestamp } from '../lib/supabaseClient';
import { companyService } from './companyService';
import {
    JournalEntry,
    JournalEntryLine,
    CreateJournalEntryData,
    isEntryBalanced,
    calculateEntryTotals
} from '../types/accounting';

export const journalEntriesService = {
    /**
     * جلب القيود المحاسبية
     */
    async getAll(options?: {
        status?: string;
        fromDate?: string;
        toDate?: string;
        limit?: number;
    }): Promise<JournalEntry[]> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) return [];

            let query = supabase
                .from('journal_entries')
                .select(`
                    *,
                    lines:journal_entry_lines(
                        *,
                        account:accounts(id, code, name)
                    )
                `)
                .eq('company_id', companyId)
                .order('entry_date', { ascending: false });

            if (options?.status) {
                query = query.eq('status', options.status);
            }
            if (options?.fromDate) {
                query = query.gte('entry_date', options.fromDate);
            }
            if (options?.toDate) {
                query = query.lte('entry_date', options.toDate);
            }
            if (options?.limit) {
                query = query.limit(options.limit);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching journal entries:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getAll journal entries:', error);
            return [];
        }
    },

    /**
     * جلب قيد واحد بالتفاصيل
     */
    async getById(id: string): Promise<JournalEntry | null> {
        try {
            const { data, error } = await (supabase as any)
                .from('journal_entries')
                .select(`
                    *,
                    lines:journal_entry_lines(
                        *,
                        account:accounts(id, code, name, account_type)
                    )
                `)
                .eq('id', id)
                .single();

            if (error) return null;
            return data;
        } catch {
            return null;
        }
    },

    /**
     * إنشاء قيد جديد
     */
    async create(data: CreateJournalEntryData): Promise<JournalEntry | null> {
        try {
            const companyId = await companyService.getCompanyId();
            if (!companyId) {
                console.error('No company ID');
                return null;
            }

            // التحقق من التوازن
            if (!isEntryBalanced(data.lines)) {
                console.error('Entry is not balanced');
                return null;
            }

            const { totalDebit, totalCredit } = calculateEntryTotals(data.lines);
            const entryId = generateUUID();
            const now = getCurrentTimestamp();

            // إنشاء القيد
            const { data: entry, error: entryError } = await (supabase as any)
                .from('journal_entries')
                .insert({
                    id: entryId,
                    company_id: companyId,
                    entry_date: data.entry_date,
                    description: data.description,
                    reference_type: data.reference_type,
                    reference_id: data.reference_id,
                    reference_number: data.reference_number,
                    total_debit: totalDebit,
                    total_credit: totalCredit,
                    status: 'draft',
                    created_at: now
                })
                .select()
                .single();

            if (entryError) {
                console.error('Error creating journal entry:', entryError);
                return null;
            }

            // إنشاء البنود
            const lines = data.lines.map((line, index) => ({
                id: generateUUID(),
                journal_entry_id: entryId,
                account_id: line.account_id,
                line_number: index + 1,
                description: line.description,
                debit_amount: line.debit_amount,
                credit_amount: line.credit_amount,
                party_type: line.party_type,
                party_id: line.party_id,
                created_at: now
            }));

            const { error: linesError } = await (supabase as any)
                .from('journal_entry_lines')
                .insert(lines);

            if (linesError) {
                console.error('Error creating journal entry lines:', linesError);
                // حذف القيد إذا فشلت البنود
                await supabase.from('journal_entries').delete().eq('id', entryId);
                return null;
            }

            return { ...entry, lines };
        } catch (error) {
            console.error('Error in create journal entry:', error);
            return null;
        }
    },

    /**
     * اعتماد قيد (Post)
     */
    async post(id: string): Promise<boolean> {
        try {
            const { error } = await (supabase as any)
                .from('journal_entries')
                .update({
                    status: 'posted',
                    posted_at: getCurrentTimestamp(),
                    updated_at: getCurrentTimestamp()
                })
                .eq('id', id)
                .eq('status', 'draft');

            if (error) {
                console.error('Error posting entry:', error);
                return false;
            }

            return true;
        } catch {
            return false;
        }
    },

    /**
     * عكس قيد (Reverse)
     */
    async reverse(id: string, reason: string): Promise<JournalEntry | null> {
        try {
            // جلب القيد الأصلي
            const original = await this.getById(id);
            if (!original || original.status !== 'posted') {
                console.error('Cannot reverse non-posted entry');
                return null;
            }

            // إنشاء قيد عكسي
            const reversalData: CreateJournalEntryData = {
                entry_date: getCurrentTimestamp().split('T')[0],
                description: `عكس قيد: ${original.description}`,
                reference_type: 'manual',
                reference_id: id,
                lines: (original.lines || []).map(line => ({
                    account_id: line.account_id,
                    description: `عكس: ${line.description || ''}`,
                    debit_amount: line.credit_amount,   // عكس المبالغ
                    credit_amount: line.debit_amount
                }))
            };

            const reversal = await this.create(reversalData);
            if (!reversal) return null;

            // تحديث القيد العكسي
            await (supabase as any)
                .from('journal_entries')
                .update({
                    is_reversal: true,
                    reversed_entry_id: id
                })
                .eq('id', reversal.id);

            // تحديث القيد الأصلي
            await (supabase as any)
                .from('journal_entries')
                .update({
                    status: 'reversed',
                    reversal_entry_id: reversal.id,
                    reversal_reason: reason,
                    updated_at: getCurrentTimestamp()
                })
                .eq('id', id);

            // اعتماد القيد العكسي
            await this.post(reversal.id);

            return reversal;
        } catch (error) {
            console.error('Error reversing entry:', error);
            return null;
        }
    },

    /**
     * حذف قيد (مسودة فقط)
     */
    async delete(id: string): Promise<boolean> {
        try {
            const { error } = await (supabase as any)
                .from('journal_entries')
                .delete()
                .eq('id', id)
                .eq('status', 'draft');

            return !error;
        } catch {
            return false;
        }
    }
};

export default journalEntriesService;
