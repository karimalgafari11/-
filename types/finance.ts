
import { CurrencyCode, User, Language } from './common';
import { UIPreferences } from './ui';

export interface FinancialEntry {
    id: string;
    date: string;
    description: string;
    amount: number;
    currency: CurrencyCode;
    category: string;
    status: 'paid' | 'pending' | 'overdue' | 'draft';
    account: string;
}

export interface AppState {
    language: Language;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    ui: UIPreferences;
}

export interface JournalLine {
    account: string;
    debit: number;
    credit: number;
}
