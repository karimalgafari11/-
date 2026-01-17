/**
 * Tests: Journal Builder
 * اختبارات بناء القيود المحاسبية
 */

import { describe, it, expect } from 'vitest';
import {
    buildSaleJournalLines,
    buildCOGSJournalLines,
    buildPurchaseJournalLines,
    buildExpenseJournalLines,
    buildVoucherJournalLines,
    isJournalBalanced,
    ACCOUNT_CODES,
    SaleInput,
    SaleItemInput
} from '../journalBuilder';
import { AccountId } from '../../../types/domain/money';

// Helper
const toAccountId = (id: string): AccountId => id as AccountId;

describe('Domain: Journal Builder', () => {

    describe('buildSaleJournalLines', () => {
        it('should create balanced journal lines for cash sale', () => {
            const sale: SaleInput = {
                invoiceNumber: 'INV-001',
                subtotal: 1000,
                discountAmount: 0,
                taxAmount: 150,
                totalAmount: 1150,
                paymentMethod: 'cash'
            };

            const result = buildSaleJournalLines(
                sale,
                toAccountId('cash-acc'),
                toAccountId('sales-acc')
            );

            expect(result.isBalanced).toBe(true);
            expect(result.lines).toHaveLength(2);
            expect(result.totalDebit).toBe(1150);
            expect(result.totalCredit).toBe(1150);

            // Cash account is debited
            const cashLine = result.lines.find(l => l.accountCode === ACCOUNT_CODES.CASH);
            expect(cashLine?.debit).toBe(1150);
            expect(cashLine?.credit).toBe(0);
        });

        it('should create balanced journal lines for credit sale', () => {
            const sale: SaleInput = {
                invoiceNumber: 'INV-002',
                subtotal: 2000,
                discountAmount: 200,
                taxAmount: 270,
                totalAmount: 2070,
                paymentMethod: 'credit'
            };

            const result = buildSaleJournalLines(
                sale,
                toAccountId('receivables-acc'),
                toAccountId('sales-acc')
            );

            expect(result.isBalanced).toBe(true);

            // Receivables account is debited
            const receivablesLine = result.lines.find(l => l.accountCode === ACCOUNT_CODES.RECEIVABLES);
            expect(receivablesLine?.debit).toBe(2070);
        });
    });

    describe('buildCOGSJournalLines', () => {
        it('should create balanced COGS entry', () => {
            const items: SaleItemInput[] = [
                { productName: 'Product A', quantity: 10, costPrice: 50 },
                { productName: 'Product B', quantity: 5, costPrice: 100 }
            ];

            const result = buildCOGSJournalLines(
                'INV-001',
                items,
                toAccountId('cogs-acc'),
                toAccountId('inventory-acc')
            );

            expect(result.isBalanced).toBe(true);
            expect(result.totalDebit).toBe(1000); // (10*50) + (5*100)
            expect(result.totalCredit).toBe(1000);

            // COGS is debited
            const cogsLine = result.lines.find(l => l.accountCode === ACCOUNT_CODES.COGS);
            expect(cogsLine?.debit).toBe(1000);

            // Inventory is credited
            const invLine = result.lines.find(l => l.accountCode === ACCOUNT_CODES.INVENTORY);
            expect(invLine?.credit).toBe(1000);
        });

        it('should return empty lines when no cost', () => {
            const items: SaleItemInput[] = [];

            const result = buildCOGSJournalLines(
                'INV-001',
                items,
                toAccountId('cogs-acc'),
                toAccountId('inventory-acc')
            );

            expect(result.lines).toHaveLength(0);
            expect(result.isBalanced).toBe(true);
        });
    });

    describe('buildPurchaseJournalLines', () => {
        it('should create balanced purchase entry', () => {
            const purchase = {
                invoiceNumber: 'PO-001',
                subtotal: 5000,
                discountAmount: 500,
                taxAmount: 675,
                totalAmount: 5175,
                paymentMethod: 'credit' as const
            };

            const result = buildPurchaseJournalLines(
                purchase,
                toAccountId('inventory-acc'),
                toAccountId('payables-acc')
            );

            expect(result.isBalanced).toBe(true);

            // Inventory is debited (subtotal - discount + tax = 5000 - 500 + 675 = 5175)
            const invLine = result.lines.find(l => l.accountCode === ACCOUNT_CODES.INVENTORY);
            expect(invLine?.debit).toBe(5175);

            // Payables is credited
            const payablesLine = result.lines.find(l => l.accountCode === ACCOUNT_CODES.PAYABLES);
            expect(payablesLine?.credit).toBe(5175);
        });
    });

    describe('buildExpenseJournalLines', () => {
        it('should create balanced expense entry', () => {
            const expense = {
                expenseNumber: 'EXP-001',
                description: 'Office supplies',
                amount: 500,
                expenseAccountId: toAccountId('office-expense-acc')
            };

            const result = buildExpenseJournalLines(
                expense,
                toAccountId('cash-acc')
            );

            expect(result.isBalanced).toBe(true);
            expect(result.totalDebit).toBe(500);
            expect(result.totalCredit).toBe(500);
        });
    });

    describe('isJournalBalanced', () => {
        it('should return true for balanced entries', () => {
            const lines = [
                { accountId: 'a' as AccountId, accountCode: '1111', debit: 100, credit: 0, currency: 'SAR', exchangeRate: 1, debitBase: 100, creditBase: 0, description: '' },
                { accountId: 'b' as AccountId, accountCode: '4100', debit: 0, credit: 100, currency: 'SAR', exchangeRate: 1, debitBase: 0, creditBase: 100, description: '' }
            ];

            expect(isJournalBalanced(lines)).toBe(true);
        });

        it('should return false for unbalanced entries', () => {
            const lines = [
                { accountId: 'a' as AccountId, accountCode: '1111', debit: 100, credit: 0, currency: 'SAR', exchangeRate: 1, debitBase: 100, creditBase: 0, description: '' },
                { accountId: 'b' as AccountId, accountCode: '4100', debit: 0, credit: 90, currency: 'SAR', exchangeRate: 1, debitBase: 0, creditBase: 90, description: '' }
            ];

            expect(isJournalBalanced(lines)).toBe(false);
        });
    });
});
