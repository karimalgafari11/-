import React, { useMemo } from 'react';
import DataGrid from '../Grid/DataGrid';
import { useFinance } from '../../context/FinanceContext';
import { useSales } from '../../context/SalesContext';
import { usePurchases } from '../../context/PurchasesContext';

const ProfitLossReport: React.FC = () => {
    const { transactions, expenses } = useFinance();
    const { sales = [] } = useSales();
    const { purchases = [] } = usePurchases();

    const reportData = useMemo(() => {
        // حساب البيانات الشهرية
        const months = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];

        const monthlyData = months.map((month, index) => {
            // حساب الإيرادات من المبيعات
            const monthSales = sales.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getMonth() === index;
            });
            const revenue = monthSales.reduce((sum, sale) => sum + sale.grandTotal, 0);

            // حساب تكلفة البضاعة المباعة من المشتريات
            const monthPurchases = purchases.filter(purchase => {
                const purchaseDate = new Date(purchase.date);
                return purchaseDate.getMonth() === index;
            });
            const cogs = monthPurchases.reduce((sum, purchase) => sum + purchase.grandTotal, 0);

            // حساب المصروفات التشغيلية
            const monthExpenses = expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() === index;
            });
            const operatingExpenses = monthExpenses.reduce((sum, expense) => sum + expense.total, 0);

            // حساب الأرباح
            const grossProfit = revenue - cogs;
            const netProfit = grossProfit - operatingExpenses;

            return {
                month,
                revenue,
                cogs,
                grossProfit,
                operatingExpenses,
                netProfit,
                profitMargin: revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : '0.0'
            };
        });

        return monthlyData;
    }, [sales, purchases, expenses]);

    const columns = [
        { key: 'month', label: 'الشهر', width: 120 },
        {
            key: 'revenue',
            label: 'الإيرادات',
            type: 'number' as const,
            width: 140,
            render: (row: any) => (
                <span className="font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {row.revenue.toLocaleString()}
                </span>
            )
        },
        {
            key: 'cogs',
            label: 'تكلفة البضاعة',
            type: 'number' as const,
            width: 140,
            render: (row: any) => (
                <span className="font-black text-amber-600 dark:text-amber-400 tabular-nums">
                    {row.cogs.toLocaleString()}
                </span>
            )
        },
        {
            key: 'grossProfit',
            label: 'مجمل الربح',
            type: 'number' as const,
            width: 140,
            render: (row: any) => (
                <span className={`font-black tabular-nums ${row.grossProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {row.grossProfit.toLocaleString()}
                </span>
            )
        },
        {
            key: 'operatingExpenses',
            label: 'المصروفات التشغيلية',
            type: 'number' as const,
            width: 160,
            render: (row: any) => (
                <span className="font-black text-rose-600 dark:text-rose-400 tabular-nums">
                    {row.operatingExpenses.toLocaleString()}
                </span>
            )
        },
        {
            key: 'netProfit',
            label: 'صافي الربح',
            type: 'number' as const,
            width: 140,
            render: (row: any) => (
                <div className={`font-black tabular-nums px-2 py-1 rounded ${row.netProfit >= 0
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
                    }`}>
                    {row.netProfit.toLocaleString()}
                </div>
            )
        },
        {
            key: 'profitMargin',
            label: 'هامش الربح %',
            width: 120,
            render: (row: any) => (
                <span className="font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {row.profitMargin}%
                </span>
            )
        }
    ];

    return (
        <div className="h-[600px]">
            <DataGrid
                title="تقرير الأرباح والخسائر - قائمة الدخل"
                headerColor="bg-slate-900"
                columns={columns}
                data={reportData}
            />
        </div>
    );
};

export default ProfitLossReport;
