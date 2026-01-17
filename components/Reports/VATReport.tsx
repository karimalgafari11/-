import React, { useMemo } from 'react';
import DataGrid from '../Grid/DataGrid';
import { useSales } from '../../context/SalesContext';
import { usePurchases } from '../../context/PurchasesContext';

const VATReport: React.FC = () => {
    const { sales = [] } = useSales();
    const { purchases = [] } = usePurchases();

    const reportData = useMemo(() => {
        const months = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];

        return months.map((month, index) => {
            // حساب المبيعات الخاضعة للضريبة
            const monthSales = sales.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getMonth() === index;
            });
            const taxableSales = monthSales.reduce((sum, sale) => sum + sale.subTotal, 0);
            const outputVAT = monthSales.reduce((sum, sale) => sum + sale.taxTotal, 0);

            // حساب المشتريات الخاضعة للضريبة
            const monthPurchases = purchases.filter(purchase => {
                const purchaseDate = new Date(purchase.date);
                return purchaseDate.getMonth() === index;
            });
            const taxablePurchases = monthPurchases.reduce((sum, purchase) => sum + purchase.subTotal, 0);
            const inputVAT = monthPurchases.reduce((sum, purchase) => sum + purchase.taxTotal, 0);

            // حساب الصافي
            const netVAT = outputVAT - inputVAT;

            return {
                period: month,
                taxableSales,
                outputVAT,
                taxablePurchases,
                inputVAT,
                netVAT,
                status: netVAT > 0 ? 'payable' : netVAT < 0 ? 'refundable' : 'zero'
            };
        });
    }, [sales, purchases]);

    const columns = [
        { key: 'period', label: 'الفترة', width: 120 },
        {
            key: 'taxableSales',
            label: 'المبيعات الخاضعة',
            type: 'number' as const,
            width: 150,
            render: (row: any) => (
                <span className="font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {row.taxableSales.toLocaleString()}
                </span>
            )
        },
        {
            key: 'outputVAT',
            label: 'ضريبة المخرجات (15%)',
            type: 'number' as const,
            width: 170,
            render: (row: any) => (
                <div className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 font-black tabular-nums px-2 py-1 rounded">
                    {row.outputVAT.toLocaleString()}
                </div>
            )
        },
        {
            key: 'taxablePurchases',
            label: 'المشتريات الخاضعة',
            type: 'number' as const,
            width: 160,
            render: (row: any) => (
                <span className="font-black text-rose-600 dark:text-rose-400 tabular-nums">
                    {row.taxablePurchases.toLocaleString()}
                </span>
            )
        },
        {
            key: 'inputVAT',
            label: 'ضريبة المدخلات (15%)',
            type: 'number' as const,
            width: 170,
            render: (row: any) => (
                <div className="bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 font-black tabular-nums px-2 py-1 rounded">
                    {row.inputVAT.toLocaleString()}
                </div>
            )
        },
        {
            key: 'netVAT',
            label: 'الصافي المستحق/المسترد',
            type: 'number' as const,
            width: 180,
            render: (row: any) => (
                <div className={`font-black tabular-nums px-2 py-1 rounded ${row.netVAT > 0
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : row.netVAT < 0
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                        : 'bg-slate-50 text-slate-600 dark:bg-slate-900/20 dark:text-slate-400'
                    }`}>
                    {row.netVAT >= 0 ? '+' : ''}{row.netVAT.toLocaleString()}
                </div>
            )
        },
        {
            key: 'status',
            label: 'الحالة',
            width: 110,
            render: (row: any) => (
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${row.status === 'payable'
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                    : row.status === 'refundable'
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'
                        : 'bg-slate-50 text-slate-600 dark:bg-slate-900/20'
                    }`}>
                    {row.status === 'payable' ? 'مستحق' : row.status === 'refundable' ? 'مسترد' : 'صفر'}
                </span>
            )
        }
    ];

    return (
        <div className="h-[600px]">
            <DataGrid
                title="تقرير ضريبة القيمة المضافة - الإقرار الضريبي"
                headerColor="bg-amber-700"
                columns={columns}
                data={reportData}
            />
        </div>
    );
};

export default VATReport;
