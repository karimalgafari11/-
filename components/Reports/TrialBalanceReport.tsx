/**
 * Trial Balance Report - ميزان المراجعة
 * يعرض أرصدة الحسابات المستمدة مباشرة من قيود اليومية
 */

import React, { useState, useEffect } from 'react';
import DataGrid from '../Grid/DataGrid';
import { reportsService } from '../../services/reportsService';
import { useAuthUser } from '../../hooks/useAuthUser';
import { useApp } from '../../context/AppContext';
import type { TrialBalanceEntry } from '../../types/supabase-types';
import { Activity, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

const TrialBalanceReport: React.FC = () => {
    const { user } = useAuthUser();
    const { theme } = useApp();
    const [data, setData] = useState<TrialBalanceEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        if (!user?.companyId) return;
        setLoading(true);
        setError(null);
        try {
            const result = await reportsService.getTrialBalance(user.companyId);
            setData(result);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ في جلب البيانات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user?.companyId]);

    // Totals calculation
    const totalDebit = data.reduce((sum, row) => sum + (row.total_debit || 0), 0);
    const totalCredit = data.reduce((sum, row) => sum + (row.total_credit || 0), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    const columns = [
        { key: 'code', label: 'كود الحساب', width: 100 },
        { key: 'name', label: 'اسم الحساب', width: 200 },
        {
            key: 'type',
            label: 'النوع',
            width: 100,
            render: (row: TrialBalanceEntry) => (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${row.type === 'asset' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    row.type === 'liability' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        row.type === 'equity' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                            row.type === 'revenue' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                    {row.type === 'asset' ? 'أصل' :
                        row.type === 'liability' ? 'التزام' :
                            row.type === 'equity' ? 'ملكية' :
                                row.type === 'revenue' ? 'إيراد' : 'مصروف'}
                </span>
            )
        },
        {
            key: 'total_debit',
            label: 'مدين',
            type: 'number' as const,
            width: 140,
            render: (row: TrialBalanceEntry) => (
                <span className="font-black text-blue-600 dark:text-blue-400 tabular-nums">
                    {row.total_debit > 0 ? row.total_debit.toLocaleString('ar-SA', { minimumFractionDigits: 2 }) : '-'}
                </span>
            )
        },
        {
            key: 'total_credit',
            label: 'دائن',
            type: 'number' as const,
            width: 140,
            render: (row: TrialBalanceEntry) => (
                <span className="font-black text-rose-600 dark:text-rose-400 tabular-nums">
                    {row.total_credit > 0 ? row.total_credit.toLocaleString('ar-SA', { minimumFractionDigits: 2 }) : '-'}
                </span>
            )
        },
        {
            key: 'net_balance',
            label: 'صافي الرصيد',
            type: 'number' as const,
            width: 160,
            render: (row: TrialBalanceEntry) => (
                <div className={`font-black tabular-nums px-2 py-1 rounded ${row.net_balance >= 0
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
                    }`}>
                    {row.net_balance.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                </div>
            )
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="text-slate-500 font-medium">جاري تحميل ميزان المراجعة...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <div className="flex flex-col items-center gap-3 text-rose-500">
                    <AlertCircle className="w-10 h-10" />
                    <span className="font-medium">{error}</span>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-rose-500 text-white rounded-lg font-bold text-sm hover:bg-rose-600 transition-colors"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Balance Check Banner */}
            <div className={`flex items-center justify-between p-4 rounded-xl shadow-sm border ${isBalanced
                ? (theme === 'light' ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-900/20 border-emerald-800')
                : (theme === 'light' ? 'bg-rose-50 border-rose-200' : 'bg-rose-900/20 border-rose-800')
                }`}>
                <div className="flex items-center gap-3">
                    {isBalanced ? (
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                    ) : (
                        <AlertCircle className="w-6 h-6 text-rose-500" />
                    )}
                    <div>
                        <h3 className={`font-bold ${isBalanced ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                            {isBalanced ? 'الميزان متوازن ✓' : 'تنبيه: الميزان غير متوازن!'}
                        </h3>
                        <p className={`text-sm ${isBalanced ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
                            مجموع المدين: {totalDebit.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} |
                            مجموع الدائن: {totalCredit.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchData}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${theme === 'light'
                        ? 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                        }`}
                >
                    <RefreshCw size={14} />
                    تحديث
                </button>
            </div>

            {/* Data Grid */}
            <div className="h-[500px]">
                <DataGrid
                    title="ميزان المراجعة - أرصدة الحسابات المباشرة"
                    headerColor="bg-indigo-900"
                    columns={columns}
                    data={data}
                />
            </div>

            {/* Totals Footer */}
            <div className={`grid grid-cols-3 gap-4 p-4 rounded-xl border ${theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'
                }`}>
                <div className="text-center">
                    <p className="text-xs text-slate-500 font-medium">إجمالي المدين</p>
                    <p className="text-xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
                        {totalDebit.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-slate-500 font-medium">إجمالي الدائن</p>
                    <p className="text-xl font-black text-rose-600 dark:text-rose-400 tabular-nums">
                        {totalCredit.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-slate-500 font-medium">الفرق</p>
                    <p className={`text-xl font-black tabular-nums ${isBalanced ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                        {Math.abs(totalDebit - totalCredit).toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TrialBalanceReport;
