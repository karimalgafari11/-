
import { Money } from './money';

export enum AccountType {
    ASSET = 'ASSET',
    LIABILITY = 'LIABILITY',
    EQUITY = 'EQUITY',
    REVENUE = 'REVENUE',
    EXPENSE = 'EXPENSE'
}

export enum TransactionStatus {
    DRAFT = 'DRAFT',
    POSTED = 'POSTED',
    VOID = 'VOID'
}

export interface Account {
    id: string;
    code: string;
    name: string;
    type: AccountType;
    parentAccountId?: string;
    balance: Money;
    isActive: boolean;
}

export interface JournalEntryLine {
    id: string;
    accountId: string;
    accountName?: string; // Cache for display
    debit: number;
    credit: number;
    description?: string;
}

export interface JournalEntry {
    id: string;
    date: string; // ISO 8601 YYYY-MM-DD
    description: string;
    lines: JournalEntryLine[];
    status: TransactionStatus;
    reference?: string;
    periodId?: string;
    createdAt: string;
    createdBy: string;
}

export interface TrialBalanceRow {
    accountId: string;
    accountCode: string;
    accountName: string;
    openingDebit: number;
    openingCredit: number;
    movementDebit: number;
    movementCredit: number;
    closingDebit: number;
    closingCredit: number;
}
