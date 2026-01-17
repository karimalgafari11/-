
import { TrialBalanceRow } from '../../types/domain/accounting';

export interface LedgerTransaction {
    accountId: string;
    accountName: string;
    accountCode: string; // Ensure we have the code
    debit: number;
    credit: number;
}

/**
 * Calculates the Trial Balance from a list of transactions.
 * Aggregates debits and credits per account.
 */
export const calculateTrialBalance = (transactions: LedgerTransaction[]): TrialBalanceRow[] => {
    const accountMap = new Map<string, TrialBalanceRow>();

    transactions.forEach(tx => {
        const existing = accountMap.get(tx.accountId);

        if (existing) {
            existing.movementDebit += tx.debit;
            existing.movementCredit += tx.credit;
            existing.closingDebit += tx.debit; // Simplified: assuming 0 opening for now or passed in
            existing.closingCredit += tx.credit;
        } else {
            accountMap.set(tx.accountId, {
                accountId: tx.accountId,
                accountCode: tx.accountCode,
                accountName: tx.accountName,
                openingDebit: 0,
                openingCredit: 0,
                movementDebit: tx.debit,
                movementCredit: tx.credit,
                closingDebit: tx.debit,
                closingCredit: tx.credit
            });
        }
    });

    return Array.from(accountMap.values()).sort((a, b) => a.accountCode.localeCompare(b.accountCode));
};

/**
 * Calculates running balance for a ledger.
 */
export const calculateRunningBalance = (
    entries: { debit: number; credit: number }[],
    openingBalance: number = 0
): number[] => {
    let balance = openingBalance;
    return entries.map(entry => {
        balance += (entry.debit - entry.credit);
        return balance;
    });
};
