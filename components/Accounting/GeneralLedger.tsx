import React, { useMemo, useState } from 'react';
import DataGrid from '../Grid/DataGrid';
import { useFinance } from '../../context/FinanceContext';
import { useSales } from '../../context/SalesContext';
import { usePurchases } from '../../context/PurchasesContext';
import { useApp } from '../../context/AppContext';
import { Filter } from 'lucide-react';

interface LedgerRow {
    date: string;
    description: string;
    accountCode: string;
    accountName: string;
    debit: number;
    credit: number;
    balance: number;
    reference: string;
}

const GeneralLedger: React.FC = () => {
    const { t } = useApp();
    const { transactions, expenses } = useFinance();
    const { sales } = useSales();
    const { purchases } = usePurchases();
    const [selectedAccount, setSelectedAccount] = useState<string>('all');

    const ledgerData = useMemo((): LedgerRow[] => {
        const entries: LedgerRow[] = [];
        let runningBalance = 0;

        // ترتيب حسب التاريخ
        const allEntries = [
            ...transactions.map(t => ({
                date: t.date,
                description: t.description,
                accountCode: t.account === 'مبيعات' ? '4100' : t.account === 'مصاريف' ? '5200' : '1110',
                accountName: t.account || 'نقدية',
                debit: t.amount > 0 ? t.amount : 0,
                credit: t.amount < 0 ? Math.abs(t.amount) : 0,
                reference: t.id
            })),
            ...sales.map(s => ({
                date: s.date,
                description: `مبيعات فاتورة #${s.invoiceNumber}`,
                accountCode: '4100',
                accountName: 'إيراد مبيعات',
                debit: 0,
                credit: s.grandTotal,
                reference: s.id
            })),
            ...purchases.map(p => ({
                date: p.date,
                description: `مشتريات فاتورة #${p.invoiceNumber || p.id}`,
                accountCode: '5100',
                accountName: 'تكلفة البضاعة',
                debit: p.grandTotal,
                credit: 0,
                reference: p.id
            })),
            ...expenses.map(e => ({
                date: e.date,
                description: `مصروف: ${e.description}`,
                accountCode: '5200',
                accountName: 'مصروفات عامة',
                debit: e.total,
                credit: 0,
                reference: e.id
            }))
        ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // تصفية حسب الحساب المختار
        const filteredEntries = selectedAccount === 'all'
            ? allEntries
            : allEntries.filter(e => e.accountCode === selectedAccount);

        // حساب الرصيد المتحرك
        filteredEntries.forEach(entry => {
            runningBalance += entry.debit - entry.credit;
            entries.push({
                ...entry,
                balance: runningBalance
            });
        });

        return entries;
    }, [transactions, sales, purchases, expenses, selectedAccount]);

    const accountOptions = [
        { code: 'all', name: 'جميع الحسابات' },
        { code: '1110', name: 'النقدية والبنوك' },
        { code: '1120', name: 'حسابات العملاء' },
        { code: '2110', name: 'حسابات الموردين' },
        { code: '4100', name: 'إيراد المبيعات' },
        { code: '5100', name: 'تكلفة البضاعة' },
        { code: '5200', name: 'مصروفات عامة' }
    ];

    const columns = [
        { key: 'date', label: 'التاريخ', width: 100 },
        { key: 'reference', label: 'المرجع', width: 100 },
        {
            key: 'accountCode',
            label: 'كود الحساب',
            width: 100,
            render: (row: LedgerRow) => (
                <span className="font-mono text-[11px] font-black text-slate-600 dark:text-slate-400">
                    {row.accountCode}
                </span>
            )
        },
        {
            key: 'accountName',
            label: 'اسم الحساب',
            width: 150,
            render: (row: LedgerRow) => (
                <span className="font-bold text-slate-700 dark:text-slate-300">
                    {row.accountName}
                </span>
            )
        },
        { key: 'description', label: 'البيان', width: 220 },
        {
            key: 'debit',
            label: 'مدين',
            type: 'number' as const,
            width: 120,
            render: (row: LedgerRow) => (
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {row.debit > 0 ? row.debit.toLocaleString() : '-'}
                </span>
            )
        },
        {
            key: 'credit',
            label: 'دائن',
            type: 'number' as const,
            width: 120,
            render: (row: LedgerRow) => (
                <span className="font-mono font-black text-rose-600 dark:text-rose-400 tabular-nums">
                    {row.credit > 0 ? row.credit.toLocaleString() : '-'}
                </span>
            )
        },
        {
            key: 'balance',
            label: 'الرصيد',
            type: 'number' as const,
            width: 130,
            render: (row: LedgerRow) => (
                <div className={`font-mono font-black tabular-nums px-2 py-1 rounded ${row.balance >= 0
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
                    }`}>
                    {Math.abs(row.balance).toLocaleString()}
                    <span className="text-[9px] mr-1 opacity-70">{row.balance >= 0 ? 'Dr' : 'Cr'}</span>
                </div>
            )
        }
    ];

    return (
        <div className="h-full flex flex-col gap-3">
            {/* فلتر الحسابات */}
            <div className="flex items-center gap-3 px-1">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                    <Filter size={14} />
                    <span>تصفية حسب الحساب:</span>
                </div>
                <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-indigo-800/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                    {accountOptions.map(acc => (
                        <option key={acc.code} value={acc.code}>{acc.name}</option>
                    ))}
                </select>
            </div>

            {/* الجدول */}
            <div className="flex-1">
                <DataGrid
                    title="دفتر الأستاذ العام"
                    headerColor="bg-indigo-800"
                    columns={columns}
                    data={ledgerData}
                />
            </div>
        </div>
    );
};

export default GeneralLedger;
