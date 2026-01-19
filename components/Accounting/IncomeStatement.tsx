/**
 * Income Statement Component
 * قائمة الدخل (الأرباح والخسائر)
 */

import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useOrganization } from '../../context/OrganizationContext';
import { AccountingService } from '../../services/accountingService';
import Button from '../UI/Button';
import { Printer, FileDown, Calendar } from 'lucide-react';

const IncomeStatement: React.FC = () => {
    const { t } = useApp();
    const { company } = useOrganization();

    // State
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [period, setPeriod] = useState('year'); // month, quarter, year

    useEffect(() => {
        loadReport();
    }, [company, period]);

    const loadReport = async () => {
        if (!company) return;
        setLoading(true);

        try {
            // هنا سنقوم بحساب الأرصدة للحسابات (إيرادات ومصروفات)
            // بما أن AccountingService لديه getTrialBalance، يمكننا استخدامه وتصفيته
            const result = await AccountingService.getTrialBalance(company.id);
            const trialBalance = result.accounts.map(item => ({
                ...item,
                balance: item.debit - item.credit
            }));

            // تصفية الإيرادات (4xxx)
            const revenues = trialBalance.filter(item => item.account.account_type === 'revenue' && item.balance !== 0);

            // تصفية المصروفات (5xxx)
            const expenses = trialBalance.filter(item => item.account.account_type === 'expense' && item.balance !== 0);

            // حساب الإجماليات
            const totalRevenue = revenues.reduce((sum, item) => sum + Math.abs(item.balance), 0);
            const totalExpenses = expenses.reduce((sum, item) => sum + Math.abs(item.balance), 0);

            setReportData({
                revenues,
                expenses,
                totalRevenue,
                totalExpenses,
                netIncome: totalRevenue - totalExpenses
            });

        } catch (error) {
            console.error('Error loading income statement', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">جاري تحميل القائمة...</div>;
    if (!reportData) return <div className="p-10 text-center">لا توجد بيانات</div>;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-100 dark:border-slate-700">
                <div>
                    <h2 className="text-2xl font-bold mb-2">قائمة الدخل</h2>
                    <p className="text-gray-500">للفترة المنتهية في {new Date().toLocaleDateString('ar-SA')}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" icon={<Printer size={16} />} onClick={() => window.print()}>طباعة</Button>
                    <Button variant="outline" size="sm" icon={<FileDown size={16} />}>تصدير PDF</Button>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-8 max-w-4xl mx-auto">

                {/* Revenues */}
                <div>
                    <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg mb-4">
                        <h3 className="font-bold text-emerald-700 dark:text-emerald-400">الإيرادات</h3>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">
                            {reportData.totalRevenue.toLocaleString()} ر.س
                        </span>
                    </div>

                    <div className="space-y-2 pr-4">
                        {reportData.revenues.map((item: any) => (
                            <div key={item.account.id} className="flex justify-between py-2 border-b border-dashed border-gray-100 dark:border-slate-700">
                                <div className="flex gap-3">
                                    <span className="text-gray-400 text-sm">{item.account.code}</span>
                                    <span>{item.account.name}</span>
                                </div>
                                <span className="font-medium">{Math.abs(item.balance).toLocaleString()}</span>
                            </div>
                        ))}
                        {reportData.revenues.length === 0 && <p className="text-gray-400 italic text-sm">لا توجد إيرادات مسجلة</p>}
                    </div>
                </div>

                {/* Expenses */}
                <div>
                    <div className="flex justify-between items-center bg-rose-50 dark:bg-rose-900/20 p-3 rounded-lg mb-4">
                        <h3 className="font-bold text-rose-700 dark:text-rose-400">المصروفات</h3>
                        <span className="font-bold text-rose-700 dark:text-rose-400 text-lg">
                            {reportData.totalExpenses.toLocaleString()} ر.س
                        </span>
                    </div>

                    <div className="space-y-2 pr-4">
                        {reportData.expenses.map((item: any) => (
                            <div key={item.account.id} className="flex justify-between py-2 border-b border-dashed border-gray-100 dark:border-slate-700">
                                <div className="flex gap-3">
                                    <span className="text-gray-400 text-sm">{item.account.code}</span>
                                    <span>{item.account.name}</span>
                                </div>
                                <span className="font-medium">{Math.abs(item.balance).toLocaleString()}</span>
                            </div>
                        ))}
                        {reportData.expenses.length === 0 && <p className="text-gray-400 italic text-sm">لا توجد مصروفات مسجلة</p>}
                    </div>
                </div>

                {/* Net Income */}
                <div className="mt-8 pt-6 border-t-2 border-gray-200 dark:border-slate-600">
                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                        <h3 className="text-xl font-bold">صافي الدخل</h3>
                        <span className={`text-2xl font-black ${(reportData.netIncome || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {reportData.netIncome.toLocaleString()} ر.س
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default IncomeStatement;
