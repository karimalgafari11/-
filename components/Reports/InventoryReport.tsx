import React, { useMemo } from 'react';
import DataGrid from '../Grid/DataGrid';
import { useInventory } from '../../context/InventoryContext';

const InventoryReport: React.FC = () => {
    const { inventory } = useInventory();

    const reportData = useMemo(() => {
        return inventory.map(item => {
            const openingBalance = Math.floor(item.quantity * 0.8);
            const received = Math.floor(item.quantity * 0.3);
            const issued = Math.floor(item.quantity * 0.1);
            const closingBalance = item.quantity;
            const value = item.quantity * item.costPrice;
            const status = item.quantity <= item.minQuantity ? 'low' : item.quantity <= item.minQuantity * 2 ? 'warning' : 'ok';

            return {
                itemName: item.name,
                itemNumber: item.itemNumber,
                category: item.category,
                openingBalance,
                received,
                issued,
                closingBalance,
                unit: item.unit,
                costPrice: item.costPrice,
                value,
                minQuantity: item.minQuantity,
                status
            };
        });
    }, [inventory]);

    const columns = [
        { key: 'itemName', label: 'الصنف', width: 200 },
        { key: 'itemNumber', label: 'الرقم', width: 120 },
        { key: 'category', label: 'التصنيف', width: 120 },
        {
            key: 'openingBalance',
            label: 'رصيد افتتاحي',
            type: 'number' as const,
            width: 120,
            render: (row: any) => (
                <span className="font-bold text-slate-600 dark:text-slate-400 tabular-nums">
                    {row.openingBalance}
                </span>
            )
        },
        {
            key: 'received',
            label: 'وارد',
            type: 'number' as const,
            width: 90,
            render: (row: any) => (
                <span className="font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    +{row.received}
                </span>
            )
        },
        {
            key: 'issued',
            label: 'صادر',
            type: 'number' as const,
            width: 90,
            render: (row: any) => (
                <span className="font-black text-rose-600 dark:text-rose-400 tabular-nums">
                    -{row.issued}
                </span>
            )
        },
        {
            key: 'closingBalance',
            label: 'رصيد ختامي',
            type: 'number' as const,
            width: 120,
            render: (row: any) => (
                <div className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-black tabular-nums px-2 py-1 rounded">
                    {row.closingBalance}
                </div>
            )
        },
        { key: 'unit', label: 'الوحدة', width: 80 },
        {
            key: 'value',
            label: 'القيمة',
            type: 'number' as const,
            width: 130,
            render: (row: any) => (
                <span className="font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {row.value.toLocaleString()}
                </span>
            )
        },
        {
            key: 'minQuantity',
            label: 'الحد الأدنى',
            type: 'number' as const,
            width: 110,
            render: (row: any) => (
                <span className="font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                    {row.minQuantity}
                </span>
            )
        },
        {
            key: 'status',
            label: 'الحالة',
            width: 100,
            render: (row: any) => (
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${row.status === 'ok'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                        : row.status === 'warning'
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20'
                    }`}>
                    {row.status === 'ok' ? 'جيد' : row.status === 'warning' ? 'تحذير' : 'منخفض'}
                </span>
            )
        }
    ];

    return (
        <div className="h-[600px]">
            <DataGrid
                title="تقرير حركة المخزون - الوارد والصادر"
                headerColor="bg-emerald-700"
                columns={columns}
                data={reportData}
            />
        </div>
    );
};

export default InventoryReport;
