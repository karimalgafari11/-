// @ts-nocheck - Complex type issues with InsertType, to be refined later
/**
 * Auto Journal Service - خدمة القيود الآلية (مُعاد هيكلته)
 * 
 * ⚠️ هذه الخدمة مسؤولة فقط عن:
 * 1. جلب معرفات الحسابات من AccountingService
 * 2. تفويض بناء القيود إلى Domain Layer (journalBuilder)
 * 3. حفظ القيود عبر AccountingService
 * 
 * لا تحتوي على منطق محاسبي - المنطق في src/domain/accounting/journalBuilder.ts
 */

import { AccountingService } from './accountingService';
import { Sale, SaleItem, Expense, Voucher, Purchase } from '../types/database';
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
import { AccountId, toAccountId } from '../src/types/domain/money';

// ============================================
// Helper: Convert domain lines to service lines
// ============================================

const toServiceLines = (lines: JournalLine[]) =>
    lines.map((line, index) => ({
        account_id: line.accountId as string,
        debit_amount: line.debit,
        credit_amount: line.credit,
        currency: line.currency,
        exchange_rate: line.exchangeRate,
        debit_amount_base: line.debitBase,
        credit_amount_base: line.creditBase,
        description: line.description,
        journal_entry_id: '',
        line_order: index + 1
    }));

// ============================================
// Main Service
// ============================================

export const AutoJournalService = {
    /**
     * إنشاء قيد مبيعات + قيد التكلفة
     */
    createSaleEntry: async (
        sale: Sale,
        items: SaleItem[],
        organizationId: string,
        userId: string
    ): Promise<boolean> => {
        try {
            // 1. جلب الحسابات
            const debitAccountCode = sale.payment_method === 'cash'
                ? ACCOUNT_CODES.CASH
                : ACCOUNT_CODES.RECEIVABLES;

            const debitAccount = await AccountingService.findAccount(organizationId, debitAccountCode);
            const salesAccount = await AccountingService.findAccount(organizationId, ACCOUNT_CODES.SALES_REVENUE);
            const cogsAccount = await AccountingService.findAccount(organizationId, ACCOUNT_CODES.COGS);
            const inventoryAccount = await AccountingService.findAccount(organizationId, ACCOUNT_CODES.INVENTORY);

            if (!debitAccount || !salesAccount) {
                console.error('Accounts not found for sale entry');
                return false;
            }

            // 2. بناء قيد المبيعات عبر Domain Layer
            const saleInput: SaleInput = {
                invoiceNumber: sale.invoice_number,
                subtotal: sale.subtotal - (sale.discount_amount || 0),
                discountAmount: sale.discount_amount || 0,
                taxAmount: sale.tax_amount || 0,
                totalAmount: sale.total_amount,
                paymentMethod: sale.payment_method as 'cash' | 'credit'
            };

            const saleResult = buildSaleJournalLines(
                saleInput,
                toAccountId(debitAccount.id),
                toAccountId(salesAccount.id)
            );

            // 3. حفظ قيد المبيعات
            await AccountingService.createJournalEntry({
                entry: {
                    organization_id: organizationId,
                    branch_id: sale.branch_id,
                    fiscal_period_id: sale.fiscal_period_id || '',
                    entry_date: sale.invoice_date,
                    description: saleResult.description,
                    status: 'posted',
                    source_type: 'sale',
                    source_id: sale.id,
                    created_by: userId
                },
                lines: toServiceLines(saleResult.lines)
            }, { userId, branchId: sale.branch_id, organizationId });

            // 4. بناء وحفظ قيد التكلفة (إذا وجدت أصناف)
            if (cogsAccount && inventoryAccount && items.length > 0) {
                const saleItems: SaleItemInput[] = items.map(item => ({
                    productName: item.product_name || '',
                    quantity: item.quantity,
                    costPrice: item.cost_price || 0
                }));

                const cogsResult = buildCOGSJournalLines(
                    sale.invoice_number,
                    saleItems,
                    toAccountId(cogsAccount.id),
                    toAccountId(inventoryAccount.id)
                );

                if (cogsResult.lines.length > 0) {
                    await AccountingService.createJournalEntry({
                        entry: {
                            organization_id: organizationId,
                            branch_id: sale.branch_id,
                            fiscal_period_id: sale.fiscal_period_id || '',
                            entry_date: sale.invoice_date,
                            description: cogsResult.description,
                            status: 'posted',
                            source_type: 'sale_cogs',
                            source_id: sale.id,
                            created_by: userId
                        },
                        lines: toServiceLines(cogsResult.lines)
                    }, { userId, branchId: sale.branch_id, organizationId });
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
        organizationId: string,
        userId: string
    ): Promise<boolean> => {
        try {
            // 1. جلب الحسابات
            const creditAccountCode = purchase.payment_method === 'cash'
                ? ACCOUNT_CODES.CASH
                : ACCOUNT_CODES.PAYABLES;

            const inventoryAccount = await AccountingService.findAccount(organizationId, ACCOUNT_CODES.INVENTORY);
            const creditAccount = await AccountingService.findAccount(organizationId, creditAccountCode);

            if (!inventoryAccount || !creditAccount) {
                console.error('Accounts not found for purchase entry');
                return false;
            }

            // 2. بناء القيد عبر Domain Layer
            const purchaseInput: PurchaseInput = {
                invoiceNumber: purchase.invoice_number || '',
                subtotal: purchase.subtotal,
                discountAmount: purchase.discount_amount || 0,
                taxAmount: purchase.tax_amount || 0,
                totalAmount: purchase.total_amount,
                paymentMethod: purchase.payment_method as 'cash' | 'credit'
            };

            const result = buildPurchaseJournalLines(
                purchaseInput,
                toAccountId(inventoryAccount.id),
                toAccountId(creditAccount.id)
            );

            // 3. حفظ القيد
            await AccountingService.createJournalEntry({
                entry: {
                    organization_id: organizationId,
                    branch_id: purchase.branch_id,
                    fiscal_period_id: purchase.fiscal_period_id || '',
                    entry_date: purchase.invoice_date,
                    description: result.description,
                    status: 'posted',
                    source_type: 'purchase',
                    source_id: purchase.id,
                    created_by: userId
                },
                lines: toServiceLines(result.lines)
            }, { userId, branchId: purchase.branch_id, organizationId });

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
        organizationId: string,
        userId: string
    ): Promise<boolean> => {
        try {
            const cashAccount = await AccountingService.findAccount(organizationId, ACCOUNT_CODES.CASH);

            if (!cashAccount || !expense.expense_account_id) {
                console.error('Accounts not found for expense entry');
                return false;
            }

            // بناء القيد عبر Domain Layer
            const expenseInput: ExpenseInput = {
                expenseNumber: expense.expense_number,
                description: expense.description || '',
                amount: expense.amount,
                expenseAccountId: toAccountId(expense.expense_account_id)
            };

            const result = buildExpenseJournalLines(
                expenseInput,
                toAccountId(cashAccount.id)
            );

            await AccountingService.createJournalEntry({
                entry: {
                    organization_id: organizationId,
                    branch_id: expense.branch_id,
                    fiscal_period_id: expense.fiscal_period_id || '',
                    entry_date: expense.expense_date,
                    description: result.description,
                    status: 'posted',
                    source_type: 'expense',
                    source_id: expense.id,
                    created_by: userId
                },
                lines: toServiceLines(result.lines)
            }, { userId, branchId: expense.branch_id, organizationId });

            return true;
        } catch (error) {
            console.error('Failed to create expense journal entry', error);
            return false;
        }
    },

    /**
     * إنشاء قيد سند (قبض/صرف) مع معالجة فروقات العملة
     */
    createVoucherEntry: async (
        voucher: Voucher,
        organizationId: string,
        userId: string
    ): Promise<boolean> => {
        try {
            const cashAccount = await AccountingService.findAccount(organizationId, ACCOUNT_CODES.CASH);
            if (!cashAccount) return false;

            // تحديد حساب الطرف الآخر
            let otherAccountId = voucher.payment_account_id;
            if (!otherAccountId && voucher.party_id) {
                const defaultCode = voucher.voucher_type === 'receipt'
                    ? ACCOUNT_CODES.RECEIVABLES
                    : ACCOUNT_CODES.PAYABLES;
                const defaultAcc = await AccountingService.findAccount(organizationId, defaultCode);
                otherAccountId = defaultAcc?.id;
            }

            if (!otherAccountId) return false;

            // جلب أو إنشاء حسابات فروق العملة
            let fxGainAccount = await AccountingService.findAccount(organizationId, ACCOUNT_CODES.FX_GAIN);
            let fxLossAccount = await AccountingService.findAccount(organizationId, ACCOUNT_CODES.FX_LOSS);

            // بناء القيد عبر Domain Layer
            const voucherInput: VoucherInput = {
                voucherNumber: voucher.voucher_number,
                voucherType: voucher.voucher_type as 'receipt' | 'payment',
                amount: voucher.amount,
                partyName: voucher.party_name || '',
                partyAccountId: toAccountId(otherAccountId),
                currency: voucher.currency_code,
                exchangeRate: voucher.exchange_rate || 1,
                invoiceExchangeRate: voucher.exchange_rate || 1 // TODO: Get from original invoice
            };

            const result = buildVoucherJournalLines(
                voucherInput,
                toAccountId(cashAccount.id),
                fxGainAccount ? toAccountId(fxGainAccount.id) : undefined,
                fxLossAccount ? toAccountId(fxLossAccount.id) : undefined
            );

            await AccountingService.createJournalEntry({
                entry: {
                    organization_id: organizationId,
                    branch_id: voucher.branch_id,
                    fiscal_period_id: voucher.fiscal_period_id || '',
                    entry_date: voucher.voucher_date,
                    description: result.description,
                    status: 'posted',
                    source_type: 'voucher',
                    source_id: voucher.id,
                    created_by: userId
                },
                lines: toServiceLines(result.lines)
            }, { userId, branchId: voucher.branch_id, organizationId });

            return true;
        } catch (error) {
            console.error('Failed to create voucher journal entry', error);
            return false;
        }
    },

    /**
     * إغلاق السنة المالية
     * يستخدم AccountingService للحصول على ميزان المراجعة ثم يبني قيد الإغلاق
     */
    closeFiscalYear: async (organizationId: string, userId: string): Promise<boolean> => {
        try {
            // 1. جلب ميزان المراجعة
            const trialBalance = await AccountingService.getTrialBalance(organizationId);

            // 2. تصفية حسابات المصروفات والإيرادات
            const incomeStatementAccounts = trialBalance.filter(
                item => item.account.account_type === 'revenue' || item.account.account_type === 'expense'
            );

            if (incomeStatementAccounts.length === 0) return true;

            // 3. حساب صافي الربح/الخسارة وبناء سطور الإغلاق
            let totalRevenue = 0;
            let totalExpenses = 0;
            const lines: any[] = [];

            for (const item of incomeStatementAccounts) {
                if (item.balance === 0) continue;

                if (item.account.account_type === 'revenue') {
                    lines.push({
                        account_id: item.account.id,
                        debit_amount: Math.abs(item.balance),
                        credit_amount: 0,
                        currency: 'SAR',
                        exchange_rate: 1,
                        debit_amount_base: Math.abs(item.balance),
                        credit_amount_base: 0,
                        description: `إغلاق حساب ${item.account.name}`,
                        journal_entry_id: '',
                        line_order: lines.length + 1
                    });
                    totalRevenue += Math.abs(item.balance);
                } else {
                    lines.push({
                        account_id: item.account.id,
                        debit_amount: 0,
                        credit_amount: Math.abs(item.balance),
                        currency: 'SAR',
                        exchange_rate: 1,
                        debit_amount_base: 0,
                        credit_amount_base: Math.abs(item.balance),
                        description: `إغلاق حساب ${item.account.name}`,
                        journal_entry_id: '',
                        line_order: lines.length + 1
                    });
                    totalExpenses += Math.abs(item.balance);
                }
            }

            const netIncome = totalRevenue - totalExpenses;

            // 4. ترحيل الفرق إلى الأرباح المحتجزة
            const retainedEarningsAccount = await AccountingService.findAccount(
                organizationId,
                ACCOUNT_CODES.RETAINED_EARNINGS
            );

            if (retainedEarningsAccount) {
                if (netIncome > 0) {
                    lines.push({
                        account_id: retainedEarningsAccount.id,
                        debit_amount: 0,
                        credit_amount: netIncome,
                        currency: 'SAR',
                        exchange_rate: 1,
                        debit_amount_base: 0,
                        credit_amount_base: netIncome,
                        description: 'ترحيل صافي الربح',
                        journal_entry_id: '',
                        line_order: lines.length + 1
                    });
                } else if (netIncome < 0) {
                    lines.push({
                        account_id: retainedEarningsAccount.id,
                        debit_amount: Math.abs(netIncome),
                        credit_amount: 0,
                        currency: 'SAR',
                        exchange_rate: 1,
                        debit_amount_base: Math.abs(netIncome),
                        credit_amount_base: 0,
                        description: 'ترحيل صافي الخسارة',
                        journal_entry_id: '',
                        line_order: lines.length + 1
                    });
                }
            }

            // 5. إنشاء قيد الإغلاق
            await AccountingService.createJournalEntry({
                entry: {
                    organization_id: organizationId,
                    branch_id: '',
                    fiscal_period_id: '',
                    entry_date: new Date().toISOString(),
                    description: 'قيد إغلاق السنة المالية',
                    status: 'posted',
                    source_type: 'closing',
                    source_id: 'closing-' + Date.now(),
                    created_by: userId
                },
                lines
            }, { userId, branchId: '', organizationId });

            return true;
        } catch (error) {
            console.error('Failed to close fiscal year', error);
            return false;
        }
    }
};
