
import { describe, it, expect } from 'vitest';
import { calculateTrialBalance, LedgerTransaction } from '../ledger';

describe('Domain: Ledger Logic', () => {
    it('should calculate trial balance correctly for balanced transactions', () => {
        const transactions: LedgerTransaction[] = [
            { accountId: '1', accountName: 'Cash', accountCode: '101', debit: 100, credit: 0 },
            { accountId: '2', accountName: 'Sales', accountCode: '401', debit: 0, credit: 100 }
        ];

        const result = calculateTrialBalance(transactions);

        expect(result).toHaveLength(2);

        const cash = result.find(r => r.accountCode === '101');
        expect(cash?.closingDebit).toBe(100);
        expect(cash?.closingCredit).toBe(0);

        const sales = result.find(r => r.accountCode === '401');
        expect(sales?.closingDebit).toBe(0);
        expect(sales?.closingCredit).toBe(100);
    });

    it('should aggregate multiple transactions for same account', () => {
        const transactions: LedgerTransaction[] = [
            { accountId: '1', accountName: 'Cash', accountCode: '101', debit: 50, credit: 0 },
            { accountId: '1', accountName: 'Cash', accountCode: '101', debit: 50, credit: 0 },
        ];

        const result = calculateTrialBalance(transactions);
        expect(result[0].movementDebit).toBe(100);
    });
});
