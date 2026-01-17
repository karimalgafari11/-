
import { FinancialEntry, JournalLine, Expense, Sale, Purchase } from '../types';
import { AccountsSummary, LedgerEntry } from '../types/accounts';
import { calculateTrialBalance } from '../src/domain/accounting/ledger';
import { isEntryBalanced } from '../src/domain/accounting/validation';
import { formatCurrency } from '../src/domain/finance/currency';
import {
  calculateAccountsSummary,
  calculateTradingAccount,
  calculateProfitAndLoss
} from '../src/domain/accounting/financialStatements';

/**
 * FinanceService: المركز الرئيسي للمنطق المالي والمحاسبي.
 * تم تحسينه ليكون أكثر صلابة وتجريداً للمهام الرياضية.
 * Delegates business logic to the Domain Layer.
 */
export const FinanceService = {
  /**
   * حساب ميزان المراجعة.
   * Delegates to Domain Layer.
   */
  calculateTrialBalance: (transactions: any[]) => {
    // Adapt legacy transaction type to LedgerTransaction if needed
    // For now, we keep the signature but use domain logic internally is tricky due to types mismatch.
    // We will import the domain function and use it.

    // Mapping legacy structure to domain structure
    const domainTx = transactions.map(t => ({
      accountId: t.account,
      accountName: t.account, // Fallback
      accountCode: '0000', // Needs lookup
      debit: t.amount > 0 ? t.amount : 0,
      credit: t.amount < 0 ? Math.abs(t.amount) : 0
    }));

    const result = calculateTrialBalance(domainTx);

    // Map back to legacy structure strictness for UI compatibility
    return result.map(r => ({
      code: r.accountCode,
      name: r.accountName,
      debit: r.closingDebit,
      credit: r.closingCredit,
      balance: r.closingDebit - r.closingCredit
    }));
  },

  /**
   * التحقق من توازن القيد.
   */
  isEntryBalanced: (lines: any[]): boolean => {
    return isEntryBalanced(lines);
  },

  /**
   * تنسيق العملة.
   */
  formatCurrency: (amount: number, currency: string = 'SAR', lang: string = 'ar-SA'): string => {
    return formatCurrency(amount, currency as any, lang);
  },

  /**
   * حساب ملخص الحسابات للبطاقات
   */
  calculateAccountsSummary: (
    transactions: any[],
    sales: any[],
    purchases: any[],
    expenses: any[]
  ) => {
    const totalRevenue = sales.reduce((sum: number, sale: any) => sum + (sale.grandTotal || 0), 0);
    const totalExpenses = expenses.reduce((sum: number, exp: any) => sum + (exp.total || 0), 0);
    const totalPurchases = purchases.reduce((sum: number, p: any) => sum + (p.grandTotal || 0), 0);

    const cashInflow = transactions.filter((t: any) => t.amount > 0).reduce((sum: number, t: any) => sum + t.amount, 0);
    const cashOutflow = transactions.filter((t: any) => t.amount < 0).reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
    const totalAssets = cashInflow - cashOutflow + 50000;

    const totalLiabilities = purchases
      .filter((p: any) => p.paymentStatus !== 'paid')
      .reduce((sum: number, p: any) => sum + (p.grandTotal || 0), 0);

    return calculateAccountsSummary({
      totalRevenue,
      totalExpenses,
      totalPurchases,
      totalAssets,
      totalLiabilities
    });
  },

  /**
   * استخراج دفتر الأستاذ العام
   * Keeping this here for now as it involves data mixing (Service concern of aggregation)
   * but the math inside could be eventually moved.
   */
  getGeneralLedger: (
    transactions: any[],
    sales: any[],
    purchases: any[],
    expenses: any[],
    accountFilter?: string
  ) => {
    // Legacy logic preserved for now, or should initiate refactor?
    // For safety, preserving legacy impl but wrapped.
    // ... (Previous implementation content required to be pasted here if not replacing fully with domain)
    // Since this is a REPLACE tool, I must provide the fulll implementation or the file breaks.
    // I'll re-implement using the original logic but cleaner.

    const entries: any[] = [];
    let runningBalance = 0;

    const allEntries = [
      ...transactions.map((t: any) => ({
        date: t.date,
        description: t.description,
        accountId: t.account,
        accountCode: t.account === 'مبيعات' ? '4100' : t.account === 'مصاريف' ? '5200' : '1110',
        accountName: t.account || 'نقدية',
        debit: t.amount > 0 ? t.amount : 0,
        credit: t.amount < 0 ? Math.abs(t.amount) : 0,
        reference: t.id
      })),
      ...sales.map((s: any) => ({
        date: s.date,
        description: `مبيعات فاتورة #${s.invoiceNumber}`,
        accountId: 'sales',
        accountCode: '4100',
        accountName: 'إيراد مبيعات',
        debit: 0,
        credit: s.grandTotal,
        reference: s.id
      })),
      ...purchases.map((p: any) => ({
        date: p.date,
        description: `مشتريات #${p.invoiceNumber || p.id}`,
        accountId: 'cogs',
        accountCode: '5100',
        accountName: 'تكلفة البضاعة',
        debit: p.grandTotal,
        credit: 0,
        reference: p.id
      })),
      ...expenses.map((e: any) => ({
        date: e.date,
        description: `مصروف: ${e.description}`,
        accountId: 'expense',
        accountCode: '5200',
        accountName: 'مصروفات عامة',
        debit: e.total,
        credit: 0,
        reference: e.id
      }))
    ].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const filteredEntries = accountFilter && accountFilter !== 'all'
      ? allEntries.filter(e => e.accountCode === accountFilter)
      : allEntries;

    filteredEntries.forEach((entry, index) => {
      runningBalance += entry.debit - entry.credit;
      entries.push({
        id: `ledger-${index}`,
        ...entry,
        balance: runningBalance
      });
    });

    return entries;
  },

  /**
   * حساب حساب المتاجرة
   */
  calculateTradingAccount: (sales: any[], purchases: any[]) => {
    const totalSales = sales.reduce((sum: number, s: any) => sum + (s.grandTotal || 0), 0);
    const totalPurchases = purchases.reduce((sum: number, p: any) => sum + (p.grandTotal || 0), 0);
    // Hardcoded inventory for now (legacy)
    return calculateTradingAccount(totalSales, totalPurchases, 25000, 30000);
  },

  /**
   * حساب حساب الأرباح والخسائر
   */
  calculateProfitAndLoss: (sales: any[], purchases: any[], expenses: any[]) => {

    // Logic needs to match legacy parameters
    const totalSales = sales.reduce((sum: number, s: any) => sum + (s.grandTotal || 0), 0);
    const totalPurchases = purchases.reduce((sum: number, p: any) => sum + (p.grandTotal || 0), 0);
    const { grossProfit } = calculateTradingAccount(totalSales, totalPurchases, 25000, 30000);

    const totalExpenses = expenses.reduce((sum: number, e: any) => sum + (e.total || 0), 0);
    return calculateProfitAndLoss(grossProfit, totalExpenses, 5000);
  }
};

