import React, { useMemo } from 'react';
import DataGrid from '../Grid/DataGrid';
import { usePurchases } from '../../context/PurchasesContext';

const PurchasesReport: React.FC = () => {
    const { purchases = [] } = usePurchases();

    const reportData = useMemo(() => {
        return purchases.flatMap(purchase =>
            purchase.items.map(item => ({
                invoiceNumber: purchase.invoiceNumber,
                referenceNumber: purchase.referenceNumber,
                date: purchase.date,
                supplierName: purchase.supplierName,
                itemName: item.name,
                quantity: item.quantity,
                costPrice: item.costPrice,
                subtotal: item.quantity * item.costPrice,
                tax: item.tax,
                total: item.total,
                paymentMethod: purchase.paymentMethod,
                status: purchase.status
            }))
        );
    }, [purchases]);

    const columns = [
        { key: 'invoiceNumber', label: 'رقم الفاتورة', width: 130 },
        { key: 'referenceNumber', label: 'المرجع', width: 120 },
        { key: 'date', label: 'التاريخ', width: 110 },
        { key: 'supplierName', label: 'المورد', width: 180 },
        { key: 'itemName', label: 'الصنف', width: 200 },
        {
            key: 'quantity',
            label: 'الكمية',
            type: 'number' as const,
            width: 90,
            render: (row: any) => (
                <span className="font-black text-blue-600 dark:text-blue-400 tabular-nums">
                    {row.quantity}
                </span>
            )
        },
        {
            key: 'costPrice',
            label: 'التكلفة',
            type: 'number' as const,
            width: 110,
            render: (row: any) => (
                <span className="font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                    {row.costPrice.toLocaleString()}
                </span>
            )
        },
        {
            key: 'subtotal',
            label: 'المجموع',
            type: 'number' as const,
            width: 120,
            render: (row: any) => (
                <span className="font-black text-rose-600 dark:text-rose-400 tabular-nums">
                    {row.subtotal.toLocaleString()}
                </span>
            )
        },
        {
            key: 'tax',
            label: 'الضريبة',
            type: 'number' as const,
            width: 100,
            render: (row: any) => (
                <span className="font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                    {row.tax.toLocaleString()}
                </span>
            )
        },
        {
            key: 'total',
            label: 'الإجمالي',
            type: 'number' as const,
            width: 130,
            render: (row: any) => (
                <div className="bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 font-black tabular-nums px-2 py-1 rounded">
                    {row.total.toLocaleString()}
                </div>
            )
        },
        {
            key: 'paymentMethod',
            label: 'طريقة الدفع',
            width: 110,
            render: (row: any) => (
                <span className="text-[10px] font-black uppercase">
                    {row.paymentMethod === 'cash' ? 'نقدي' : 'آجل'}
                </span>
            )
        },
        {
            key: 'status',
            label: 'الحالة',
            width: 100,
            render: (row: any) => (
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${row.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                    : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'
                    }`}>
                    {row.status === 'completed' ? 'مكتمل' : 'معلق'}
                </span>
            )
        }
    ];

    return (
        <div className="h-[600px]">
            <DataGrid
                title="تقرير المشتريات التفصيلي - كافة عمليات الشراء"
                headerColor="bg-pink-700"
                columns={columns}
                data={reportData}
            />
        </div>
    );
};

export default PurchasesReport;
