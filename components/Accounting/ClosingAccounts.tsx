import React, { useMemo, useState } from 'react';
import DataGrid from '../Grid/DataGrid';
import { useFinance } from '../../context/FinanceContext';
import { useSales } from '../../context/SalesContext';
import { usePurchases } from '../../context/PurchasesContext';
import { useApp } from '../../context/AppContext';
import { useOrganization } from '../../context/OrganizationContext';
import { AutoJournalService } from '../../services/autoJournalService';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { Calculator, TrendingUp, Scale, Lock } from 'lucide-react';

type ClosingType = 'trading' | 'pnl' | 'position';

// ... interface ClosingRow ...
interface ClosingRow {
    item: string;
    debit: number;
    credit: number;
    isTotal?: boolean;
    isHeader?: boolean;
}

const ClosingAccounts: React.FC = () => {
    const { expenses } = useFinance();
    const { sales } = useSales();
    const { purchases } = usePurchases();
    const { showNotification, user } = useApp();
    const { company } = useOrganization();

    const [activeClosing, setActiveClosing] = useState<ClosingType>('trading');
    const [isClosing, setIsClosing] = useState(false);

    const handleCloseFiscalYear = async () => {
        if (!company || !user) return;

        if (!window.confirm('هل أنت متأكد من إغلاق السنة المالية؟ سيتم ترحيل الأرصدة وإقفال حسابات المصروفات والإيرادات.')) {
            return;
        }

        setIsClosing(true);
        const success = await AutoJournalService.closeFiscalYear(company.id, user.id);
        setIsClosing(false);

        if (success) {
            showNotification('تم إغلاق السنة المالية بنجاح', 'success');
        } else {
            showNotification('حدث خطأ أثناء إغلاق السنة المالية', 'error');
        }
    };

    const closingTabs = [
        { id: 'trading', label: 'حساب المتاجرة', icon: Calculator },
        { id: 'pnl', label: 'حساب الأرباح والخسائر', icon: TrendingUp },
        { id: 'position', label: 'قائمة المركز المالي', icon: Scale }
    ];

    const tradingAccount = useMemo((): ClosingRow[] => {
        const totalSales = sales.reduce((sum, s) => sum + s.grandTotal, 0);
        const totalPurchases = purchases.reduce((sum, p) => sum + p.grandTotal, 0);
        const openingInventory = 25000; // افتراضي
        const closingInventory = 30000; // افتراضي
        const grossProfit = totalSales + closingInventory - totalPurchases - openingInventory;

        return [
            { item: 'الجانب المدين', debit: 0, credit: 0, isHeader: true },
            { item: 'مخزون أول المدة', debit: openingInventory, credit: 0 },
            { item: 'المشتريات', debit: totalPurchases, credit: 0 },
            { item: 'مجمل الربح (إلى حـ/ أ.خ)', debit: grossProfit > 0 ? grossProfit : 0, credit: 0 },
            { item: 'الجانب الدائن', debit: 0, credit: 0, isHeader: true },
            { item: 'المبيعات', debit: 0, credit: totalSales },
            { item: 'مخزون آخر المدة', debit: 0, credit: closingInventory },
            { item: 'مجمل الخسارة (إلى حـ/ أ.خ)', debit: 0, credit: grossProfit < 0 ? Math.abs(grossProfit) : 0 },
            { item: 'الإجمالي', debit: openingInventory + totalPurchases + (grossProfit > 0 ? grossProfit : 0), credit: totalSales + closingInventory + (grossProfit < 0 ? Math.abs(grossProfit) : 0), isTotal: true }
        ];
    }, [sales, purchases]);

    const pnlAccount = useMemo((): ClosingRow[] => {
        const totalSales = sales.reduce((sum, s) => sum + s.grandTotal, 0);
        const totalPurchases = purchases.reduce((sum, p) => sum + p.grandTotal, 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.total, 0);
        const grossProfit = totalSales - totalPurchases;
        const netProfit = grossProfit - totalExpenses;

        // تقسيم المصروفات حسب الفئة
        const expenseByCategory: Record<string, number> = {};
        expenses.forEach(e => {
            expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.total;
        });

        const rows: ClosingRow[] = [
            { item: 'الجانب المدين', debit: 0, credit: 0, isHeader: true },
            ...Object.entries(expenseByCategory).map(([cat, amount]) => ({
                item: `مصروفات ${cat}`,
                debit: amount,
                credit: 0
            })),
            { item: 'صافي الربح (إلى حـ/ رأس المال)', debit: netProfit > 0 ? netProfit : 0, credit: 0 },
            { item: 'الجانب الدائن', debit: 0, credit: 0, isHeader: true },
            { item: 'مجمل الربح (من حـ/ المتاجرة)', debit: 0, credit: grossProfit > 0 ? grossProfit : 0 },
            { item: 'إيرادات أخرى', debit: 0, credit: 5000 },
            { item: 'صافي الخسارة (إلى حـ/ رأس المال)', debit: 0, credit: netProfit < 0 ? Math.abs(netProfit) : 0 },
            { item: 'الإجمالي', debit: totalExpenses + (netProfit > 0 ? netProfit : 0), credit: grossProfit + 5000 + (netProfit < 0 ? Math.abs(netProfit) : 0), isTotal: true }
        ];

        return rows;
    }, [sales, purchases, expenses]);

    const financialPosition = useMemo((): ClosingRow[] => {
        const totalSales = sales.reduce((sum, s) => sum + s.grandTotal, 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.total, 0);
        const netProfit = totalSales - totalExpenses;
        const capital = 100000; // افتراضي

        return [
            { item: 'الأصول', debit: 0, credit: 0, isHeader: true },
            { item: 'الأصول الثابتة', debit: 50000, credit: 0 },
            { item: 'المعدات والأجهزة', debit: 30000, credit: 0 },
            { item: 'الأثاث', debit: 20000, credit: 0 },
            { item: 'الأصول المتداولة', debit: 80000, credit: 0 },
            { item: 'النقدية', debit: 25000, credit: 0 },
            { item: 'البنك', debit: 35000, credit: 0 },
            { item: 'المدينون', debit: 20000, credit: 0 },
            { item: '', debit: 0, credit: 0 },
            { item: 'الخصوم وحقوق الملكية', debit: 0, credit: 0, isHeader: true },
            { item: 'رأس المال', debit: 0, credit: capital },
            { item: 'صافي الربح', debit: 0, credit: netProfit > 0 ? netProfit : 0 },
            { item: 'الدائنون', debit: 0, credit: 15000 },
            { item: 'الإجمالي', debit: 130000, credit: capital + (netProfit > 0 ? netProfit : 0) + 15000, isTotal: true }
        ];
    }, [sales, expenses]);

    const getCurrentData = () => {
        switch (activeClosing) {
            case 'trading': return tradingAccount;
            case 'pnl': return pnlAccount;
            case 'position': return financialPosition;
            default: return tradingAccount;
        }
    };

    const columns = [
        {
            key: 'item',
            label: 'البيان',
            width: 300,
            render: (row: ClosingRow) => (
                <span className={`font-bold ${row.isHeader
                    ? 'text-slate-900 dark:text-white text-xs uppercase tracking-wider'
                    : row.isTotal
                        ? 'text-primary font-black'
                        : 'text-slate-700 dark:text-slate-300'
                    } ${row.isHeader ? 'pr-0' : 'pr-4'}`}>
                    {row.item}
                </span>
            )
        },
        {
            key: 'debit',
            label: 'مدين',
            type: 'number' as const,
            width: 150,
            render: (row: ClosingRow) => (
                row.isHeader ? null : (
                    <span className={`font-mono tabular-nums font-black ${row.isTotal
                        ? 'text-primary bg-primary/5 px-3 py-1 rounded'
                        : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                        {row.debit > 0 ? row.debit.toLocaleString() : '-'}
                    </span>
                )
            )
        },
        {
            key: 'credit',
            label: 'دائن',
            type: 'number' as const,
            width: 150,
            render: (row: ClosingRow) => (
                row.isHeader ? null : (
                    <span className={`font-mono tabular-nums font-black ${row.isTotal
                        ? 'text-primary bg-primary/5 px-3 py-1 rounded'
                        : 'text-rose-600 dark:text-rose-400'
                        }`}>
                        {row.credit > 0 ? row.credit.toLocaleString() : '-'}
                    </span>
                )
            )
        }
    ];

    return (
        <div className="h-full flex flex-col gap-4">
            {/* تبويبات الحسابات الختامية وازرار التحكم */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {closingTabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeClosing === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveClosing(tab.id as ClosingType)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all whitespace-nowrap ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-indigo-800/30 hover:border-primary/50'
                                    }`}
                            >
                                <Icon size={14} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <Button
                    variant="danger"
                    size="sm"
                    icon={<Lock size={14} />}
                    onClick={handleCloseFiscalYear}
                    disabled={isClosing}
                >
                    {isClosing ? 'جاري الإغلاق...' : 'إغلاق السنة المالية'}
                </Button>
            </div>

            {/* جدول الحساب الختامي */}
            <div className="flex-1">
                <DataGrid
                    title={closingTabs.find(t => t.id === activeClosing)?.label || ''}
                    headerColor={
                        activeClosing === 'trading' ? 'bg-amber-800' :
                            activeClosing === 'pnl' ? 'bg-emerald-800' : 'bg-purple-800'
                    }
                    columns={columns}
                    data={getCurrentData()}
                />
            </div>
        </div>
    );
};

export default ClosingAccounts;
