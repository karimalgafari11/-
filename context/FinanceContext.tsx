
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { FinancialEntry, Expense, RecurringExpense } from '../types';
import { logger } from '../lib/logger';
import { useApp } from './AppContext';
import { useUser } from './app/UserContext';
import { expensesService } from '../services/expensesService';
import { AutoJournalService } from '../services/autoJournalService';

interface FinanceContextValue {
    transactions: FinancialEntry[];
    addTransaction: (entry: FinancialEntry) => void;
    expenses: any[]; // Using any to facilitate migration
    addExpense: (expense: any) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;
    recurringExpenses: RecurringExpense[];
    addRecurringExpense: (re: RecurringExpense) => void;
    deleteRecurringExpense: (id: string) => void;
    expenseCategories: string[];
    addExpenseCategory: (cat: string) => void;
    deleteExpenseCategory: (cat: string) => void;
    financialSummary: string;
    loading: boolean;
    refreshData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showNotification } = useApp();
    const { user } = useUser();

    // Transactions might be better fetched from Journal Entries in the future
    const [transactions, setTransactions] = useState<FinancialEntry[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
    const [expenseCategories, setExpenseCategories] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);

    const refreshData = useCallback(async () => {
        if (!user?.companyId) return;

        setLoading(true);
        try {
            const fetchedExpenses = await expensesService.getAll(user.companyId);
            setExpenses(fetchedExpenses);
            // TODO: Fetch other financial data if needed
        } catch (error) {
            console.error('Error fetching finance data:', error);
            showNotification('فشل تحديث البيانات المالية', 'error');
        } finally {
            setLoading(false);
        }
    }, [user?.companyId, showNotification]);

    useEffect(() => {
        if (user?.companyId) {
            refreshData();
        }
    }, [user?.companyId, refreshData]);

    const addTransaction = useCallback((tr: FinancialEntry) => {
        setTransactions(prev => [tr, ...prev]);
        logger.debug('Transaction added', { trId: tr.id });
    }, []);

    const addExpense = useCallback(async (expense: any) => {
        if (!user?.companyId) return;
        try {
            const added = await expensesService.create(user.companyId, expense);
            if (added) {
                setExpenses(prev => [added, ...prev]);

                // Add to transactions locally for UI feedback (optional)
                addTransaction({
                    id: added.id,
                    date: added.expense_date,
                    description: `مصروف: ${added.description}`,
                    amount: -(added.amount || 0),
                    currency: 'SAR',
                    account: 'مصاريف', // Should match chart of accounts
                    category: (added as any).category || 'عام',
                    status: 'paid' // From expense.status
                });

                showNotification('تم إضافة المصروف بنجاح');

                // AutoJournal is likely handled by backend triggers or service now?
                // If we still use AutoJournalService, we need to adapt it. 
                // Leaving existing call if compatible, otherwise comment out or adapt.
                try {
                    // const success = await AutoJournalService.createExpenseEntry(added, user.companyId, user.id);
                    // if (success) showNotification('تم إنشاء قيد يومية تلقائي', 'success');
                } catch (e) { console.error('AutoJournal failed', e); }
            }
        } catch (error) {
            console.error('Error adding expense:', error);
            showNotification('فشل إضافة المصروف', 'error');
        }
    }, [user?.companyId, showNotification, addTransaction, user?.id]);

    const deleteExpense = useCallback(async (id: string) => {
        if (!user?.companyId) return;
        try {
            await expensesService.delete(id);
            setExpenses(prev => prev.filter(e => e.id !== id));
            showNotification('تم حذف المصروف');
        } catch (error) {
            console.error('Error deleting expense:', error);
            showNotification('فشل حذف المصروف', 'error');
        }
    }, [user?.companyId, showNotification]);

    const addRecurringExpense = useCallback((re: RecurringExpense) => {
        setRecurringExpenses(prev => [re, ...prev]);
        showNotification('تم إضافة المصروف المتكرر');
    }, [showNotification]);

    const deleteRecurringExpense = useCallback((id: string) => {
        setRecurringExpenses(prev => prev.filter(re => re.id !== id));
    }, []);

    const addExpenseCategory = useCallback((cat: string) => {
        setExpenseCategories(prev => [...prev, cat]);
    }, []);

    const deleteExpenseCategory = useCallback((cat: string) => {
        setExpenseCategories(prev => prev.filter(c => c !== cat));
    }, []);

    const value: FinanceContextValue = {
        transactions,
        addTransaction,
        expenses,
        addExpense,
        deleteExpense,
        recurringExpenses,
        addRecurringExpense,
        deleteRecurringExpense,
        expenseCategories,
        addExpenseCategory,
        deleteExpenseCategory,
        financialSummary: '', // Calculation logic can be added later
        loading,
        refreshData
    };

    return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};

export const useFinance = () => {
    const context = useContext(FinanceContext);
    if (context === undefined) {
        throw new Error('useFinance must be used within a FinanceProvider');
    }
    return context;
};
