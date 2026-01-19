/**
 * Balance Sheet Component
 * الميزانية العمومية
 */

import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useOrganization } from '../../context/OrganizationContext';
import { AccountingService } from '../../services/accountingService';
import Button from '../UI/Button';
import { Printer, FileDown } from 'lucide-react';

const BalanceSheet: React.FC = () => {
    const { t } = useApp();
    const { company } = useOrganization();

    // State
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    useEffect(() => {
        loadReport();
    }, [company]);

    const loadReport = async () => {
        if (!company) return;
        setLoading(true);

        try {
            const result = await AccountingService.getTrialBalance(company.id);
            const trialBalance = result.accounts.map(item => ({
                ...item,
                balance: item.debit - item.credit
            }));

            // الأصول
            const assets = trialBalance.filter(item => item.account.account_type === 'asset' && item.balance !== 0);

            // الخصوم
            const liabilities = trialBalance.filter(item => item.account.account_type === 'liability' && item.balance !== 0);

            // حقوق الملكية
            const equity = trialBalance.filter(item => item.account.account_type === 'equity' && item.balance !== 0);

            // حساب الإجماليات
            const totalAssets = assets.reduce((sum, item) => sum + Math.abs(item.balance), 0);
            const totalLiabilities = liabilities.reduce((sum, item) => sum + Math.abs(item.balance), 0);
            const totalEquity = equity.reduce((sum, item) => sum + Math.abs(item.balance), 0);

            setReportData({
                assets,
                liabilities,
                equity,
                totalAssets,
                totalLiabilities,
                totalEquity,
                totalLiabilitiesAndEquity: totalLiabilities + totalEquity
            });

        } catch (error) {
            console.error('Error loading balance sheet', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">جاري تحميل الميزانية...</div>;
    if (!reportData) return <div className="p-10 text-center">لا توجد بيانات</div>;

    const Section = ({ title, items, total, colorClass }: any) => (
        <div className="mb-8">
            <div className={`flex justify-between items-center ${colorClass} p-3 rounded-lg mb-4`}>
                <h3 className="font-bold">{title}</h3>
                <span className="font-bold text-lg">{total.toLocaleString()} ر.س</span>
            </div>
            <div className="space-y-2 pr-4">
                {items.map((item: any) => (
                    <div key={item.account.id} className="flex justify-between py-2 border-b border-dashed border-gray-100 dark:border-slate-700">
                        <div className="flex gap-3">
                            <span className="text-gray-400 text-sm">{item.account.code}</span>
                            <span>{item.account.name}</span>
                        </div>
                        <span className="font-medium">{Math.abs(item.balance).toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-100 dark:border-slate-700">
                <div>
                    <h2 className="text-2xl font-bold mb-2">الميزانية العمومية</h2>
                    <p className="text-gray-500">كما في {new Date().toLocaleDateString('ar-SA')}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" icon={<Printer size={16} />} onClick={() => window.print()}>طباعة</Button>
                    <Button variant="outline" size="sm" icon={<FileDown size={16} />}>تصدير PDF</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Right Side: Assets */}
                <div>
                    <Section
                        title="الأصول"
                        items={reportData.assets}
                        total={reportData.totalAssets}
                        colorClass="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                    />
                </div>

                {/* Left Side: Liabilities + Equity */}
                <div>
                    <Section
                        title="الخصوم"
                        items={reportData.liabilities}
                        total={reportData.totalLiabilities}
                        colorClass="bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400"
                    />

                    <Section
                        title="حقوق الملكية"
                        items={reportData.equity}
                        total={reportData.totalEquity}
                        colorClass="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400"
                    />

                    <div className="mt-8 pt-4 border-t-2 border-gray-800 dark:border-slate-500">
                        <div className="flex justify-between items-center font-bold text-lg">
                            <span>إجمالي الخصوم وحقوق الملكية</span>
                            <span>{reportData.totalLiabilitiesAndEquity.toLocaleString()} ر.س</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BalanceSheet;
