import React, { useMemo } from 'react';
import DataGrid from '../Grid/DataGrid';
import { useSales } from '../../context/SalesContext';

const SalesReport: React.FC = () => {
    const { sales = [] } = useSales();

    const reportData = useMemo(() => {
        return sales.flatMap(sale =>
            sale.items.map(item => ({
                invoiceNumber: sale.invoiceNumber,
                date: sale.date,
                customerName: sale.customerName,
                itemName: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.quantity * item.unitPrice,
                tax: item.tax,
                total: item.total,
                paymentMethod: sale.paymentMethod,
                status: sale.status
            }))
        );
    }, [sales]);

    const columns = [
        { key: 'invoiceNumber', label: 'رقم الفاتورة', width: 130 },
        { key: 'date', label: 'التاريخ', width: 110 },
        { key: 'customerName', label: 'العميل', width: 180 },
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
            key: 'unitPrice',
            label: 'السعر',
            type: 'number' as const,
            width: 110,
            render: (row: any) => (
                <span className="font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                    {row.unitPrice.toLocaleString()}
                </span>
            )
        },
        {
            key: 'subtotal',
            label: 'المجموع',
            type: 'number' as const,
            width: 120,
            render: (row: any) => (
                <span className="font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
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
                <div className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-black tabular-nums px-2 py-1 rounded">
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
                    {row.paymentMethod === 'cash' ? 'نقدي' : row.paymentMethod === 'credit' ? 'آجل' : 'بنكي'}
                </span>
            )
        },
        {
            key: 'status',
            label: 'الحالة',
            width: 100,
            render: (row: any) => (
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${row.status === 'paid'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                    : row.status === 'pending'
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20'
                    }`}>
                    {row.status === 'paid' ? 'مدفوع' : row.status === 'pending' ? 'معلق' : 'ملغي'}
                </span>
            )
        }
    ];

    return (
        <div className="h-[600px]">
            <DataGrid
                title="تقرير المبيعات التفصيلي - كافة عمليات البيع"
                headerColor="bg-purple-700"
                columns={columns}
                data={reportData}
            />
        </div>
    );
};

export default SalesReport;
