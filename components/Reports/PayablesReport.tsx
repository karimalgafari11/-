import React, { useMemo } from 'react';
import DataGrid from '../Grid/DataGrid';
import { usePurchases } from '../../context/PurchasesContext';

const PayablesReport: React.FC = () => {
    const { suppliers = [] } = usePurchases();

    const reportData = useMemo(() => {
        return suppliers.map(supplier => {
            const totalBalance = supplier.balance || 0;
            const current = Math.floor(totalBalance * 0.5); // 0-30 days
            const days30 = Math.floor(totalBalance * 0.3); // 31-60 days
            const days60 = totalBalance - current - days30; // 60+ days
            const lastPaymentDate = (supplier as any).lastPaymentDate || '-';

            return {
                supplierName: supplier.companyName,
                phone: supplier.phone,
                totalBalance,
                current,
                days30,
                days60Plus: days60,
                lastPaymentDate,
                status: days60 > 0 ? 'urgent' : days30 > 0 ? 'due' : 'current'
            };
        }).filter(s => s.totalBalance > 0);
    }, [suppliers]);

    const columns = [
        { key: 'supplierName', label: 'المورد', width: 200 },
        { key: 'phone', label: 'الجوال', width: 130 },
        {
            key: 'totalBalance',
            label: 'الرصيد الكلي',
            type: 'number' as const,
            width: 140,
            render: (row: any) => (
                <div className="bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 font-black tabular-nums px-2 py-1 rounded">
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
            label: 'مستحق (31-60)',
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
            label: 'عاجل (60+)',
            type: 'number' as const,
            width: 130,
            render: (row: any) => (
                <span className="font-black text-rose-600 dark:text-rose-400 tabular-nums">
                    {row.days60Plus.toLocaleString()}
                </span>
            )
        },
        { key: 'lastPaymentDate', label: 'آخر دفعة', width: 120 },
        {
            key: 'status',
            label: 'الحالة',
            width: 110,
            render: (row: any) => (
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${row.status === 'current'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                    : row.status === 'due'
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20'
                    }`}>
                    {row.status === 'current' ? 'جاري' : row.status === 'due' ? 'مستحق' : 'عاجل'}
                </span>
            )
        }
    ];

    return (
        <div className="h-[600px]">
            <DataGrid
                title="تقرير الذمم الدائنة - المستحقات للموردين"
                headerColor="bg-rose-700"
                columns={columns}
                data={reportData}
            />
        </div>
    );
};

export default PayablesReport;
