
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { FinancialEntry, Expense, RecurringExpense } from '../types';
import { logger } from '../lib/logger';
import { useApp } from './AppContext';
import { SafeStorage } from '../utils/storage';
import { AutoJournalService } from '../services/autoJournalService';
import { useOrganization } from './OrganizationContext';

interface FinanceContextValue {
    transactions: FinancialEntry[];
    addTransaction: (entry: FinancialEntry) => void;
    expenses: Expense[];
    addExpense: (expense: Expense) => void;
    deleteExpense: (id: string) => void;
    recurringExpenses: RecurringExpense[];
    addRecurringExpense: (re: RecurringExpense) => void;
    deleteRecurringExpense: (id: string) => void;
    expenseCategories: string[];
    addExpenseCategory: (cat: string) => void;
    deleteExpenseCategory: (cat: string) => void;
    financialSummary: string;
}

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showNotification, user } = useApp();
    const { company } = useOrganization();

    const [transactions, setTransactions] = useState<FinancialEntry[]>(() => SafeStorage.get('alzhra_transactions', []));
    const [expenses, setExpenses] = useState<Expense[]>(() => SafeStorage.get('alzhra_expenses', []));
    const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(() => SafeStorage.get('alzhra_recurringExpenses', []));
    const [expenseCategories, setExpenseCategories] = useState<string[]>(() => SafeStorage.get('alzhra_expenseCategories', []));

    const addTransaction = useCallback((tr: FinancialEntry) => {
        setTransactions(prev => [tr, ...prev]);
        logger.debug('Transaction added', { trId: tr.id });
    }, []);

    // حفظ البيانات عند التغيير مع debounce لتحسين الأداء
    useEffect(() => {
        const timer = setTimeout(() => SafeStorage.set('alzhra_transactions', transactions), 1000);
        return () => clearTimeout(timer);
    }, [transactions]);
    useEffect(() => {
        const timer = setTimeout(() => SafeStorage.set('alzhra_expenses', expenses), 1000);
        return () => clearTimeout(timer);
    }, [expenses]);
    useEffect(() => {
        const timer = setTimeout(() => SafeStorage.set('alzhra_recurringExpenses', recurringExpenses), 1000);
        return () => clearTimeout(timer);
    }, [recurringExpenses]);
    useEffect(() => {
        const timer = setTimeout(() => SafeStorage.set('alzhra_expenseCategories', expenseCategories), 1000);
        return () => clearTimeout(timer);
    }, [expenseCategories]);

    const addExpense = useCallback(async (expense: Expense) => {
        setExpenses(prev => [expense, ...prev]);
        addTransaction({
            id: `EX-${Date.now()}`,
            date: expense.date || new Date().toISOString(), // Fallback if date missing in legacy
            description: `مصروف: ${expense.description}`,
            amount: -expense.total || -expense.amount, // Fallback
            currency: 'SAR',
            account: 'مصاريف',
            category: expense.category,
            status: expense.status === 'paid' ? 'paid' : 'pending'
        });
        showNotification('تم إضافة المصروف بنجاح');

        // قيد آلي
        if (company && user) {
            // Need to ensure expense matches database type for service
            // converting legacy/local type to DB type if needed
            const dbExpense: any = {
                ...expense,
                amount: expense.total || expense.amount,
                expense_date: expense.date,
                // other mappings...
            };

            const success = await AutoJournalService.createExpenseEntry(dbExpense, company.id, user.id);
            if (success) {
                showNotification('تم إنشاء قيد يومية تلقائي', 'success');
            }
        }
    }, [showNotification, addTransaction, company, user]);

    const deleteExpense = useCallback((id: string) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
    }, []);

    const addRecurringExpense = useCallback((re: RecurringExpense) => {
        setRecurringExpenses(prev => [re, ...prev]);
    }, []);

    const deleteRecurringExpense = useCallback((id: string) => {
        setRecurringExpenses(prev => prev.filter(re => re.id !== id));
    }, []);

    const addExpenseCategory = useCallback((cat: string) => {
        setExpenseCategories(prev => Array.from(new Set([...prev, cat])));
    }, []);

    const deleteExpenseCategory = useCallback((cat: string) => {
        setExpenseCategories(prev => prev.filter(c => c !== cat));
    }, []);

    const financialSummary = useMemo(() => {
        let revenue = 0;
        let cost = 0;
        // Single pass optimizations
        for (const t of transactions) {
            if (t.amount > 0) revenue += t.amount;
            else cost += Math.abs(t.amount);
        }
        const profit = revenue - cost;
        return `Revenue: ${revenue.toFixed(2)}, Cost: ${cost.toFixed(2)}, Profit: ${profit.toFixed(2)}`;
    }, [transactions]);

    const value: FinanceContextValue = useMemo(() => ({
        transactions, addTransaction,
        expenses, addExpense, deleteExpense,
        recurringExpenses, addRecurringExpense, deleteRecurringExpense,
        expenseCategories, addExpenseCategory, deleteExpenseCategory,
        financialSummary
    }), [transactions, addTransaction, expenses, addExpense, deleteExpense, recurringExpenses, addRecurringExpense, deleteRecurringExpense, expenseCategories, addExpenseCategory, deleteExpenseCategory, financialSummary]);

    return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};

export const useFinance = () => {
    const context = useContext(FinanceContext);
    if (!context) throw new Error('useFinance must be used within FinanceProvider');
    return context;
};
