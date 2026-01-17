import React, { useMemo } from 'react';
import DataGrid from '../Grid/DataGrid';
import { useFinance } from '../../context/FinanceContext';
import { useSales } from '../../context/SalesContext';
import { usePurchases } from '../../context/PurchasesContext';

const CashFlowReport: React.FC = () => {
    const { transactions, expenses } = useFinance();
    const { sales = [] } = useSales();
    const { purchases = [] } = usePurchases();

    const reportData = useMemo(() => {
        // الأنشطة التشغيلية
        const salesCash = sales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.grandTotal, 0);
        const purchasesCash = purchases.filter(p => p.paymentMethod === 'cash').reduce((sum, p) => sum + p.grandTotal, 0);
        const expensesCash = expenses.filter(e => e.paymentMethod === 'cash').reduce((sum, e) => sum + e.total, 0);

        const operatingInflow = salesCash;
        const operatingOutflow = purchasesCash + expensesCash;
        const operatingNet = operatingInflow - operatingOutflow;

        // الأنشطة الاستثمارية (افتراضية)
        const investingInflow = 0;
        const investingOutflow = 0;
        const investingNet = investingInflow - investingOutflow;

        // الأنشطة التمويلية (افتراضية)
        const financingInflow = 0;
        const financingOutflow = 0;
        const financingNet = financingInflow - financingOutflow;

        // الصافي الكلي
        const totalNet = operatingNet + investingNet + financingNet;

        return [
            // الأنشطة التشغيلية
            {
                activity: 'الأنشطة التشغيلية',
                description: 'التحصيلات من العملاء',
                inflow: operatingInflow,
                outflow: 0,
                type: 'operating'
            },
            {
                activity: 'الأنشطة التشغيلية',
                description: 'المدفوعات للموردين',
                inflow: 0,
                outflow: purchasesCash,
                type: 'operating'
            },
            {
                activity: 'الأنشطة التشغيلية',
                description: 'المصروفات التشغيلية',
                inflow: 0,
                outflow: expensesCash,
                type: 'operating'
            },
            {
                activity: 'الأنشطة التشغيلية',
                description: 'صافي التدفق النقدي التشغيلي',
                inflow: operatingInflow,
                outflow: operatingOutflow,
                type: 'subtotal'
            },

            // الأنشطة الاستثمارية
            {
                activity: 'الأنشطة الاستثمارية',
                description: 'شراء أصول ثابتة',
                inflow: investingInflow,
                outflow: investingOutflow,
                type: 'investing'
            },
            {
                activity: 'الأنشطة الاستثمارية',
                description: 'صافي التدفق النقدي الاستثماري',
                inflow: investingInflow,
                outflow: investingOutflow,
                type: 'subtotal'
            },

            // الأنشطة التمويلية
            {
                activity: 'الأنشطة التمويلية',
                description: 'قروض وتمويل',
                inflow: financingInflow,
                outflow: financingOutflow,
                type: 'financing'
            },
            {
                activity: 'الأنشطة التمويلية',
                description: 'صافي التدفق النقدي التمويلي',
                inflow: financingInflow,
                outflow: financingOutflow,
                type: 'subtotal'
            },

            // الإجمالي
            {
                activity: 'الإجمالي',
                description: 'صافي التغير في النقدية',
                inflow: operatingInflow + investingInflow + financingInflow,
                outflow: operatingOutflow + investingOutflow + financingOutflow,
                type: 'total'
            }
        ].map(row => ({
            ...row,
            net: row.inflow - row.outflow
        }));
    }, [sales, purchases, expenses]);

    const columns = [
        {
            key: 'activity',
            label: 'النشاط',
            width: 160,
            render: (row: any) => (
                <span className={`font-black ${row.type === 'total' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}>
                    {row.activity}
                </span>
            )
        },
        {
            key: 'description',
            label: 'الوصف',
            width: 240,
            render: (row: any) => (
                <span className={`font-bold ${row.type === 'subtotal' || row.type === 'total' ? 'text-slate-900 dark:text-white underline' : ''
                    }`}>
                    {row.description}
                </span>
            )
        },
        {
            key: 'inflow',
            label: 'التدفقات الداخلة',
            type: 'number' as const,
            width: 160,
            render: (row: any) => (
                <div className={`font-black tabular-nums ${row.inflow > 0
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-1 rounded'
                    : 'text-slate-400'
                    }`}>
                    {row.inflow > 0 ? row.inflow.toLocaleString() : '-'}
                </div>
            )
        },
        {
            key: 'outflow',
            label: 'التدفقات الخارجة',
            type: 'number' as const,
            width: 160,
            render: (row: any) => (
                <div className={`font-black tabular-nums ${row.outflow > 0
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 px-2 py-1 rounded'
                    : 'text-slate-400'
                    }`}>
                    {row.outflow > 0 ? row.outflow.toLocaleString() : '-'}
                </div>
            )
        },
        {
            key: 'net',
            label: 'الصافي',
            type: 'number' as const,
            width: 150,
            render: (row: any) => (
                <div className={`font-black tabular-nums px-2 py-1 rounded ${row.type === 'total'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : row.net >= 0
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
                    }`}>
                    {row.net >= 0 ? '+' : ''}{row.net.toLocaleString()}
                </div>
            )
        }
    ];

    return (
        <div className="h-[600px]">
            <DataGrid
                title="تقرير التدفقات النقدية - قائمة التدفق النقدي"
                headerColor="bg-blue-800"
                columns={columns}
                data={reportData}
            />
        </div>
    );
};

export default CashFlowReport;
