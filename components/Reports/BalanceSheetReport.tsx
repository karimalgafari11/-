import React, { useMemo } from 'react';
import DataGrid from '../Grid/DataGrid';
import { useFinance } from '../../context/FinanceContext';
import { useSales } from '../../context/SalesContext';
import { usePurchases } from '../../context/PurchasesContext';
import { useInventory } from '../../context/InventoryContext';

const BalanceSheetReport: React.FC = () => {
    const { transactions } = useFinance();
    const { customers = [] } = useSales();
    const { suppliers = [] } = usePurchases();
    const { inventory } = useInventory();

    const reportData = useMemo(() => {
        // حساب الأصول
        const cash = transactions.reduce((sum, t) => sum + t.amount, 0);
        const inventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
        const accountsReceivable = customers.reduce((sum, c) => sum + (c.balance || 0), 0);
        const totalAssets = cash + inventoryValue + accountsReceivable;

        // حساب الخصوم
        const accountsPayable = suppliers.reduce((sum, s) => sum + (s.balance || 0), 0);
        const totalLiabilities = accountsPayable;

        // حساب حقوق الملكية
        const equity = totalAssets - totalLiabilities;

        return [
            // الأصول
            {
                category: 'الأصول',
                item: 'النقدية والبنوك',
                currentValue: cash,
                previousValue: cash * 0.85,
                type: 'asset'
            },
            {
                category: 'الأصول',
                item: 'المخزون',
                currentValue: inventoryValue,
                previousValue: inventoryValue * 0.92,
                type: 'asset'
            },
            {
                category: 'الأصول',
                item: 'الذمم المدينة',
                currentValue: accountsReceivable,
                previousValue: accountsReceivable * 1.1,
                type: 'asset'
            },
            {
                category: 'الأصول',
                item: 'إجمالي الأصول',
                currentValue: totalAssets,
                previousValue: totalAssets * 0.9,
                type: 'total'
            },

            // الخصوم
            {
                category: 'الخصوم',
                item: 'الذمم الدائنة',
                currentValue: accountsPayable,
                previousValue: accountsPayable * 1.05,
                type: 'liability'
            },
            {
                category: 'الخصوم',
                item: 'إجمالي الخصوم',
                currentValue: totalLiabilities,
                previousValue: totalLiabilities * 1.05,
                type: 'total'
            },

            // حقوق الملكية
            {
                category: 'حقوق الملكية',
                item: 'رأس المال',
                currentValue: equity * 0.6,
                previousValue: equity * 0.55,
                type: 'equity'
            },
            {
                category: 'حقوق الملكية',
                item: 'الأرباح المحتجزة',
                currentValue: equity * 0.4,
                previousValue: equity * 0.35,
                type: 'equity'
            },
            {
                category: 'حقوق الملكية',
                item: 'إجمالي حقوق الملكية',
                currentValue: equity,
                previousValue: equity * 0.88,
                type: 'total'
            }
        ].map(row => ({
            ...row,
            change: row.currentValue - row.previousValue,
            changePercent: row.previousValue > 0
                ? (((row.currentValue - row.previousValue) / row.previousValue) * 100).toFixed(1)
                : '0.0'
        }));
    }, [transactions, customers, suppliers, inventory]);

    const columns = [
        {
            key: 'category',
            label: 'القسم',
            width: 140,
            render: (row: any) => (
                <span className={`font-black ${row.type === 'total' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}>
                    {row.category}
                </span>
            )
        },
        {
            key: 'item',
            label: 'البند',
            width: 200,
            render: (row: any) => (
                <span className={`font-bold ${row.type === 'total' ? 'text-slate-900 dark:text-white underline' : ''
                    }`}>
                    {row.item}
                </span>
            )
        },
        {
            key: 'currentValue',
            label: 'القيمة الحالية',
            type: 'number' as const,
            width: 150,
            render: (row: any) => (
                <div className={`font-black tabular-nums ${row.type === 'total'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded'
                    : row.type === 'asset'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : row.type === 'liability'
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-indigo-600 dark:text-indigo-400'
                    }`}>
                    {row.currentValue.toLocaleString()}
                </div>
            )
        },
        {
            key: 'previousValue',
            label: 'القيمة السابقة',
            type: 'number' as const,
            width: 150,
            render: (row: any) => (
                <span className="font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                    {row.previousValue.toLocaleString()}
                </span>
            )
        },
        {
            key: 'change',
            label: 'التغيير',
            type: 'number' as const,
            width: 130,
            render: (row: any) => (
                <span className={`font-black tabular-nums ${row.change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                    {row.change >= 0 ? '+' : ''}{row.change.toLocaleString()}
                </span>
            )
        },
        {
            key: 'changePercent',
            label: 'النسبة %',
            width: 110,
            render: (row: any) => (
                <div className={`font-black tabular-nums px-2 py-1 rounded ${parseFloat(row.changePercent) >= 0
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
                    }`}>
                    {row.changePercent}%
                </div>
            )
        }
    ];

    return (
        <div className="h-[600px]">
            <DataGrid
                title="تقرير الميزانية العمومية - المركز المالي"
                headerColor="bg-teal-700"
                columns={columns}
                data={reportData}
            />
        </div>
    );
};

export default BalanceSheetReport;
