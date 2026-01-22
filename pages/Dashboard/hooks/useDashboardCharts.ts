/**
 * useDashboardCharts Hook
 * إعداد بيانات الرسوم البيانية - مستخرج من Dashboard
 */

import { useMemo } from 'react';
import { Transaction, Invoice, InventoryItem } from '../../../types';

export interface ChartDataPoint {
    name: string;
    مبيعات: number;
    مشتريات: number;
    أرباح: number;
}

export interface CategoryDataPoint {
    name: string;
    value: number;
    fill: string;
}

export interface TopProductDataPoint {
    name: string;
    مبيعات: number;
    fill: string;
}

/**
 * Hook لحساب بيانات الرسم البياني الشهري
 */
export function useMonthlyChartData(transactions: Transaction[]): ChartDataPoint[] {
    return useMemo(() => {
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        const currentYear = new Date().getFullYear();

        // تجميع البيانات حسب الشهر
        const monthlyData = months.map((name, monthIndex) => {
            const monthTransactions = transactions.filter(t => {
                if (!t.date) return false;
                const date = new Date(t.date);
                return date.getMonth() === monthIndex && date.getFullYear() === currentYear;
            });

            const monthRevenue = monthTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
            const monthExpenses = Math.abs(monthTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));

            return {
                name,
                مبيعات: Math.round(monthRevenue),
                مشتريات: Math.round(monthExpenses),
                أرباح: Math.round(monthRevenue - monthExpenses)
            };
        });

        // إرجاع آخر 6 أشهر فقط
        const currentMonth = new Date().getMonth();
        const startMonth = currentMonth >= 5 ? currentMonth - 5 : 0;
        return monthlyData.slice(startMonth, currentMonth + 1);
    }, [transactions]);
}

/**
 * Hook لحساب بيانات توزيع المخزون حسب الفئة
 */
export function useCategoryData(inventory: InventoryItem[]): CategoryDataPoint[] {
    return useMemo(() => {
        const categories: Record<string, number> = {};
        inventory.forEach(item => {
            const cat = item.category || 'غير مصنف';
            categories[cat] = (categories[cat] || 0) + (item.quantity || 0);
        });
        const colors = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#f43f5e'];
        return Object.entries(categories).slice(0, 5).map(([name, value], i) => ({
            name, value, fill: colors[i % colors.length]
        }));
    }, [inventory]);
}

/**
 * Hook لحساب أفضل المنتجات مبيعاً
 */
export function useTopProducts(invoices: Invoice[]): TopProductDataPoint[] {
    return useMemo(() => {
        // تجميع مبيعات كل منتج
        const productSales: Record<string, { name: string; sales: number }> = {};

        invoices.forEach(invoice => {
            if (invoice.items) {
                invoice.items.forEach((item: any) => {
                    const productId = item.productId || item.id;
                    if (!productSales[productId]) {
                        productSales[productId] = { name: item.name || 'منتج', sales: 0 };
                    }
                    productSales[productId].sales += item.quantity || 1;
                });
            }
        });

        // ترتيب وإرجاع أعلى 5
        return Object.values(productSales)
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5)
            .map((item, i) => ({
                name: item.name.substring(0, 20),
                مبيعات: item.sales,
                fill: i === 0 ? '#06b6d4' : i === 1 ? '#8b5cf6' : '#64748b'
            }));
    }, [invoices]);
}

export default { useMonthlyChartData, useCategoryData, useTopProducts };
