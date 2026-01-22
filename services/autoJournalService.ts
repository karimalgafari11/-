
/**
 * Auto Journal Service - خدمة القيود الآلية (معدل)
 * 
 * الملاحظات:
 * - تم تحديثه ليتوافق مع company_id
 * - يستخدم types/supabase-types
 */

import { AccountingService } from './accountingService';
import type { Sale, SaleItem, Expense, Purchase } from '../types/supabase-types';
import type { Voucher } from '../types/supabase-types';
import {
    buildSaleJournalLines,
    buildCOGSJournalLines,
    buildPurchaseJournalLines,
    buildExpenseJournalLines,
    buildVoucherJournalLines,
    ACCOUNT_CODES,
    SaleInput,
    SaleItemInput,
    PurchaseInput,
    ExpenseInput,
    VoucherInput,
    JournalLine
} from '../src/domain/accounting/journalBuilder';
import { toAccountId } from '../src/types/domain/money';

// Helper: Convert domain lines to service lines
const toServiceLines = (lines: JournalLine[]) =>
    lines.map((line, index) => ({
        account_id: line.accountId as string,
        debit: line.debit,
        credit: line.credit,
        description: line.description,
        // journal_entry_id will be set by backend/service
    }));

export const AutoJournalService = {
    /**
     * إنشاء قيد مبيعات
     */
    createSaleEntry: async (
        sale: Sale,
        items: SaleItem[],
        companyId: string,
        userId: string
    ): Promise<boolean> => {
        try {
            const debitAccountCode = sale.payment_method === 'cash'
                ? ACCOUNT_CODES.CASH
                : ACCOUNT_CODES.RECEIVABLES;

            const debitAccount = await AccountingService.findAccount(companyId, debitAccountCode);
            const salesAccount = await AccountingService.findAccount(companyId, ACCOUNT_CODES.SALES_REVENUE);
            const cogsAccount = await AccountingService.findAccount(companyId, ACCOUNT_CODES.COGS);
            const inventoryAccount = await AccountingService.findAccount(companyId, ACCOUNT_CODES.INVENTORY);

            if (!debitAccount || !salesAccount) {
                console.error('Accounts not found for sale entry');
                return false;
            }

            const saleInput: SaleInput = {
                invoiceNumber: sale.invoice_number || '',
                subtotal: sale.total ? (sale.total - (sale.tax || 0)) : 0, // Approximate from total
                discountAmount: sale.discount || 0,
                taxAmount: sale.tax || 0,
                totalAmount: sale.net_total || 0,
                paymentMethod: sale.payment_method as 'cash' | 'credit'
            };

            const saleResult = buildSaleJournalLines(
                saleInput,
                toAccountId(debitAccount.id),
                toAccountId(salesAccount.id)
            );

            // حفظ قيد المبيعات
            await AccountingService.createJournalEntry({
                entry: {
                    entry_date: (sale as any).invoice_date || sale.created_at, // Handle potential missing fields
                    description: saleResult.description,
                    status: 'posted',
                    reference_type: 'sale',
                    reference_id: sale.id,
                    created_by: userId
                },
                lines: toServiceLines(saleResult.lines)
            }, { userId, companyId });

            // قيد التكلفة
            if (cogsAccount && inventoryAccount && items.length > 0) {
                const saleItemsInput: SaleItemInput[] = items.map(item => ({
                    productName: (item as any).product_name || '',
                    quantity: item.quantity,
                    costPrice: (item as any).cost_price || 0
                }));

                const cogsResult = buildCOGSJournalLines(
                    sale.invoice_number || '',
                    saleItemsInput,
                    toAccountId(cogsAccount.id),
                    toAccountId(inventoryAccount.id)
                );

                if (cogsResult.lines.length > 0) {
                    await AccountingService.createJournalEntry({
                        entry: {
                            entry_date: (sale as any).invoice_date || sale.created_at,
                            description: cogsResult.description,
                            status: 'posted',
                            reference_type: 'sale_cogs',
                            reference_id: sale.id,
                            created_by: userId
                        },
                        lines: toServiceLines(cogsResult.lines)
                    }, { userId, companyId });
                }
            }

            return true;
        } catch (error) {
            console.error('Failed to create sale journal entries', error);
            return false;
        }
    },

    /**
     * إنشاء قيد مشتريات
     */
    createPurchaseEntry: async (
        purchase: Purchase,
        companyId: string,
        userId: string
    ): Promise<boolean> => {
        try {
            const creditAccountCode = purchase.payment_method === 'cash'
                ? ACCOUNT_CODES.CASH
                : ACCOUNT_CODES.PAYABLES;

            const inventoryAccount = await AccountingService.findAccount(companyId, ACCOUNT_CODES.INVENTORY);
            const creditAccount = await AccountingService.findAccount(companyId, creditAccountCode);

            if (!inventoryAccount || !creditAccount) return false;

            const purchaseInput: PurchaseInput = {
                invoiceNumber: purchase.invoice_number || '',
                subtotal: (purchase as any).subtotal || purchase.total_amount || purchase.net_total || 0,
                discountAmount: (purchase as any).discount_amount || purchase.discount || 0,
                taxAmount: (purchase as any).tax_amount || purchase.tax || 0,
                totalAmount: purchase.total_amount || purchase.net_total || 0,
                paymentMethod: purchase.payment_method as 'cash' | 'credit'
            };

            const result = buildPurchaseJournalLines(
                purchaseInput,
                toAccountId(inventoryAccount.id),
                toAccountId(creditAccount.id)
            );

            await AccountingService.createJournalEntry({
                entry: {
                    entry_date: purchase.invoice_date || purchase.created_at || new Date().toISOString().split('T')[0],
                    description: result.description,
                    status: 'posted',
                    reference_type: 'purchase',
                    reference_id: purchase.id,
                    created_by: userId
                },
                lines: toServiceLines(result.lines)
            }, { userId, companyId });

            return true;
        } catch (error) {
            console.error('Failed to create purchase journal entry', error);
            return false;
        }
    },

    /**
     * إنشاء قيد مصروف
     */
    createExpenseEntry: async (
        expense: Expense,
        companyId: string,
        userId: string
    ): Promise<boolean> => {
        try {
            const cashAccount = await AccountingService.findAccount(companyId, ACCOUNT_CODES.CASH);
            if (!cashAccount || !expense.expense_account_id) return false;

            const expenseInput: ExpenseInput = {
                expenseNumber: expense.expense_number || '',
                description: expense.description || '',
                amount: expense.amount,
                expenseAccountId: toAccountId(expense.expense_account_id || '')
            };

            const result = buildExpenseJournalLines(
                expenseInput,
                toAccountId(cashAccount.id)
            );

            await AccountingService.createJournalEntry({
                entry: {
                    entry_date: expense.expense_date,
                    description: result.description,
                    status: 'posted',
                    reference_type: 'expense',
                    reference_id: expense.id,
                    created_by: userId
                },
                lines: toServiceLines(result.lines)
            }, { userId, companyId });

            return true;
        } catch (error) {
            console.error('Failed to create expense entry', error);
            return false;
        }
    },

    /**
     * إنشاء قيد سند
     */
    createVoucherEntry: async (
        voucher: Voucher,
        companyId: string,
        userId: string
    ): Promise<boolean> => {
        try {
            const cashAccount = await AccountingService.findAccount(companyId, ACCOUNT_CODES.CASH);
            if (!cashAccount) return false;

            // تحديد حساب الطرف الآخر
            let otherAccountId = voucher.payment_account_id;
            if (!otherAccountId && (voucher as any).party_id) { // party_id might not be in type yet
                const defaultCode = voucher.voucher_type === 'receipt'
                    ? ACCOUNT_CODES.RECEIVABLES
                    : ACCOUNT_CODES.PAYABLES;
                const defaultAcc = await AccountingService.findAccount(companyId, defaultCode);
                otherAccountId = defaultAcc?.id;
            }

            if (!otherAccountId) return false;

            // جلب أو إنشاء حسابات فروق العملة
            let fxGainAccount = await AccountingService.findAccount(companyId, ACCOUNT_CODES.FX_GAIN);
            let fxLossAccount = await AccountingService.findAccount(companyId, ACCOUNT_CODES.FX_LOSS);

            // بناء القيد عبر Domain Layer
            const voucherInput: VoucherInput = {
                voucherNumber: voucher.voucher_number,
                voucherType: voucher.voucher_type as 'receipt' | 'payment',
                amount: voucher.amount,
                partyName: (voucher as any).party_name || '',
                partyAccountId: toAccountId(otherAccountId),
                currency: (voucher as any).currency_code || 'SAR',
                exchangeRate: (voucher as any).exchange_rate || 1,
                invoiceExchangeRate: (voucher as any).exchange_rate || 1
            };

            const result = buildVoucherJournalLines(
                voucherInput,
                toAccountId(cashAccount.id),
                fxGainAccount ? toAccountId(fxGainAccount.id) : undefined,
                fxLossAccount ? toAccountId(fxLossAccount.id) : undefined
            );

            await AccountingService.createJournalEntry({
                entry: {
                    entry_date: voucher.voucher_date,
                    description: result.description,
                    status: 'posted',
                    reference_type: 'voucher',
                    reference_id: voucher.id,
                    created_by: userId
                },
                lines: toServiceLines(result.lines)
            }, { userId, companyId });

            return true;
        } catch (error) {
            console.error('Failed to create voucher journal entry', error);
            return false;
        }
    }
};
