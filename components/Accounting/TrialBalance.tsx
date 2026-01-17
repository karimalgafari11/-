import React, { useMemo } from 'react';
import DataGrid from '../Grid/DataGrid';
import { useFinance } from '../../context/FinanceContext';
import { FinanceService } from '../../services/financeService';

const TrialBalance: React.FC = () => {
    const { transactions } = useFinance();

    const trialBalance = useMemo(() => FinanceService.calculateTrialBalance(transactions), [transactions]);

    const columns = [
        { key: 'code', label: 'كود الحساب', width: 100 },
        {
            key: 'name',
            label: 'اسم الحساب',
            width: 250,
            render: (row: any) => (
                <span className="font-bold text-slate-700 dark:text-slate-300">
                    {row.name}
                </span>
            )
        },
        {
            key: 'debit',
            label: 'مدين',
            type: 'number' as const,
            width: 150,
            render: (row: any) => (
                <span className="font-mono text-emerald-600 dark:text-emerald-400 tabular-nums font-bold">
                    {row.debit > 0 ? row.debit.toLocaleString() : '-'}
                </span>
            )
        },
        {
            key: 'credit',
            label: 'دائن',
            type: 'number' as const,
            width: 150,
            render: (row: any) => (
                <span className="font-mono text-rose-600 dark:text-rose-400 tabular-nums font-bold">
                    {row.credit > 0 ? row.credit.toLocaleString() : '-'}
                </span>
            )
        },
        {
            key: 'balance',
            label: 'الرصيد',
            type: 'number' as const,
            width: 150,
            render: (row: any) => (
                <span className={`font-mono tabular-nums font-black ${row.balance >= 0 ? 'text-slate-700 dark:text-slate-300' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                    {Math.abs(row.balance).toLocaleString()} {row.balance < 0 ? 'Dr' : 'Cr'}
                </span>
            )
        }
    ];

    return (
        <DataGrid
            title="ميزان المراجعة"
            headerColor="bg-emerald-800"
            columns={columns}
            data={trialBalance}
        />
    );
};

export default TrialBalance;
