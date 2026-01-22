/**
 * useDashboardStats Hook
 * حساب إحصائيات لوحة التحكم - مستخرج من Dashboard
 */

import { useMemo } from 'react';
import { Transaction } from '../../../types';
import { InventoryItem } from '../../../types';

export interface DashboardStats {
    revenue: number;
    expenses: number;
    profit: number;
    totalItems: number;
    lowStockItems: number;
    totalValue: number;
    revenueChange: string;
    expensesChange: string;
    profitChange: string;
    profitMargin: string;
    inventoryTurnover: string;
}

export function useDashboardStats(transactions: Transaction[], inventory: InventoryItem[]): DashboardStats {
    return useMemo(() => {
        const now = new Date();
        const thisMonth = now.getMonth();
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const thisYear = now.getFullYear();
        const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

        // حساب الإيرادات والمصروفات
        const revenue = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
        const expenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
        const profit = revenue - expenses;
        const totalItems = inventory.length;
        const lowStockItems = inventory.filter(i => (i.quantity || 0) < (i.min_quantity || 0)).length;
        const totalValue = inventory.reduce((sum, i) => sum + ((i.quantity || 0) * (i.cost || 0)), 0);

        // حساب نسب التغير الشهرية
        const getMonthFromDate = (dateStr: string) => new Date(dateStr).getMonth();
        const getYearFromDate = (dateStr: string) => new Date(dateStr).getFullYear();

        const thisMonthRevenue = transactions
            .filter(t => t.amount > 0 && t.date && getMonthFromDate(t.date) === thisMonth && getYearFromDate(t.date) === thisYear)
            .reduce((sum, t) => sum + t.amount, 0);

        const lastMonthRevenue = transactions
            .filter(t => t.amount > 0 && t.date && getMonthFromDate(t.date) === lastMonth && getYearFromDate(t.date) === lastMonthYear)
            .reduce((sum, t) => sum + t.amount, 0);

        const revenueChange = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

        const thisMonthExpenses = Math.abs(transactions
            .filter(t => t.amount < 0 && t.date && getMonthFromDate(t.date) === thisMonth && getYearFromDate(t.date) === thisYear)
            .reduce((sum, t) => sum + t.amount, 0));

        const lastMonthExpenses = Math.abs(transactions
            .filter(t => t.amount < 0 && t.date && getMonthFromDate(t.date) === lastMonth && getYearFromDate(t.date) === lastMonthYear)
            .reduce((sum, t) => sum + t.amount, 0));

        const expensesChange = lastMonthExpenses > 0 ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;

        const thisMonthProfit = thisMonthRevenue - thisMonthExpenses;
        const lastMonthProfit = lastMonthRevenue - lastMonthExpenses;
        const profitChange = lastMonthProfit > 0 ? ((thisMonthProfit - lastMonthProfit) / lastMonthProfit) * 100 : 0;

        // هامش الربح الفعلي
        const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

        // معدل دوران المخزون (تقريبي)
        const inventoryTurnover = totalValue > 0 ? (expenses / totalValue) : 0;

        return {
            revenue, expenses, profit, totalItems, lowStockItems, totalValue,
            revenueChange: revenueChange.toFixed(1),
            expensesChange: expensesChange.toFixed(1),
            profitChange: profitChange.toFixed(1),
            profitMargin: profitMargin.toFixed(1),
            inventoryTurnover: inventoryTurnover.toFixed(1)
        };
    }, [transactions, inventory]);
}

export default useDashboardStats;
