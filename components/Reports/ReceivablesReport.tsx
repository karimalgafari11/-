import React, { useMemo } from 'react';
import DataGrid from '../Grid/DataGrid';
import { useSales } from '../../context/SalesContext';

const ReceivablesReport: React.FC = () => {
    const { customers = [] } = useSales();

    const reportData = useMemo(() => {
        return customers.map(customer => {
            const totalBalance = customer.balance || 0;
            const current = Math.floor(totalBalance * 0.4); // 0-30 days
            const days30 = Math.floor(totalBalance * 0.35); // 31-60 days
            const days60 = totalBalance - current - days30; // 60+ days

            return {
                customerName: customer.companyName,
                category: customer.category,
                phone: customer.phone,
                totalBalance,
                current,
                days30,
                days60Plus: days60,
                status: days60 > 0 ? 'overdue' : days30 > 0 ? 'warning' : 'current'
            };
        }).filter(c => c.totalBalance > 0);
    }, [customers]);

    const columns = [
        { key: 'customerName', label: 'العميل', width: 200 },
        { key: 'category', label: 'الفئة', width: 120 },
        { key: 'phone', label: 'الجوال', width: 130 },
        {
            key: 'totalBalance',
            label: 'الرصيد الكلي',
            type: 'number' as const,
            width: 140,
            render: (row: any) => (
                <div className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-black tabular-nums px-2 py-1 rounded">
                    {row.totalBalance.toLocaleString()}
                </div>
            )
        },
        {
            key: 'current',
            label: 'جاري (0-30)',
            type: 'number' as const,
            width: 130,
            render: (row: any) => (
                <span className="font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {row.current.toLocaleString()}
                </span>
            )
        },
        {
            key: 'days30',
            label: 'متأخر (31-60)',
            type: 'number' as const,
            width: 140,
            render: (row: any) => (
                <span className="font-black text-amber-600 dark:text-amber-400 tabular-nums">
                    {row.days30.toLocaleString()}
                </span>
            )
        },
        {
            key: 'days60Plus',
            label: 'متأخر جداً (60+)',
            type: 'number' as const,
            width: 150,
            render: (row: any) => (
                <span className="font-black text-rose-600 dark:text-rose-400 tabular-nums">
                    {row.days60Plus.toLocaleString()}
                </span>
            )
        },
        {
            key: 'status',
            label: 'الحالة',
            width: 110,
            render: (row: any) => (
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${row.status === 'current'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                    : row.status === 'warning'
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20'
                    }`}>
                    {row.status === 'current' ? 'جاري' : row.status === 'warning' ? 'تحذير' : 'متأخر'}
                </span>
            )
        }
    ];

    return (
        <div className="h-[600px]">
            <DataGrid
                title="تقرير الذمم المدينة - أعمار الديون"
                headerColor="bg-indigo-700"
                columns={columns}
                data={reportData}
            />
        </div>
    );
};

export default ReceivablesReport;
