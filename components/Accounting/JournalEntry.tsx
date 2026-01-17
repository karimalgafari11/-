import React from 'react';
import VirtualDataGrid from '../Grid/VirtualDataGrid';
import { useFinance } from '../../context/FinanceContext';
import { useApp } from '../../context/AppContext';

const JournalEntry: React.FC = () => {
    const { t } = useApp();
    const { transactions } = useFinance();

    const columns = [
        { key: 'date', label: t('date'), width: 120 },
        { key: 'description', label: t('description'), width: 300 },
        {
            key: 'account',
            label: t('account'),
            width: 180,
            render: (row: any) => (
                <span className="font-bold text-slate-700 dark:text-slate-300">
                    {row.account}
                </span>
            )
        },
        {
            key: 'currency',
            label: 'العملة',
            type: 'currency' as const,
            width: 100
        },
        {
            key: 'amount',
            label: 'القيمة',
            type: 'number' as const,
            width: 140,
            render: (row: any) => (
                <div className={`font-mono font-bold tabular-nums w-full ${row.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                    {Math.abs(row.amount).toLocaleString()}
                </div>
            )
        },
        {
            key: 'status',
            label: 'الحالة',
            width: 120,
            render: (row: any) => (
                <span className={`px-2 py-1 rounded text-[10px] font-black pointer-events-none ${row.status === 'paid' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                    }`}>
                    {row.status === 'paid' ? 'مرحل' : 'مسودة'}
                </span>
            )
        }
    ];

    return (
        <div className="h-[calc(100vh-300px)] min-h-[500px]">
            <VirtualDataGrid
                title="سجل القيود اليومية"
                columns={columns}
                data={transactions}
            />
        </div>
    );
};

export default JournalEntry;
