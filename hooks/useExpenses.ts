
import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useFinance } from '../context/FinanceContext';
import { Expense } from '../types';

export const useExpenses = () => {
  const { showNotification, exportData } = useApp();
  const { expenses, deleteExpense, addExpense } = useFinance();
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
    const totalThisMonth = expenses.reduce((sum, e) => sum + e.total, 0);
    const pendingTotal = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.total, 0);

    const catTotals = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.total;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(catTotals).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || 'لا يوجد';

    return {
      totalThisMonth,
      pendingTotal,
      topCategory,
      expenseCount: expenses.length
    };
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return expenses.filter(e =>
      e.description.toLowerCase().includes(q) ||
      e.expenseNumber.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q)
    );
  }, [expenses, searchQuery]);

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السجل المالي؟')) {
      deleteExpense(id);
      showNotification('تم حذف سجل المصروف بنجاح', 'info');
    }
  };

  return {
    stats,
    filteredExpenses,
    searchQuery,
    setSearchQuery,
    handleDelete,
    addExpense,
    exportData,
    showNotification
  };
};
