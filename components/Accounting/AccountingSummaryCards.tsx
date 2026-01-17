import React, { useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useSales } from '../../context/SalesContext';
import { usePurchases } from '../../context/PurchasesContext';
import {
    Wallet, TrendingUp, TrendingDown, Scale, DollarSign,
    ArrowUpRight, ArrowDownRight
} from 'lucide-react';

interface SummaryCard {
    id: string;
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    trend?: number;
}

const AccountingSummaryCards: React.FC = () => {
    const { transactions, expenses } = useFinance();
    const { sales } = useSales();
    const { purchases } = usePurchases();

    const summary = useMemo(() => {
        // حساب إجمالي الإيرادات من المبيعات
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.grandTotal, 0);

        // حساب إجمالي المصروفات
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.total, 0);

        // حساب تكلفة المشتريات
        const totalPurchases = purchases.reduce((sum, p) => sum + p.grandTotal, 0);

        // حساب الأصول (النقدية + المدينون)
        const cashInflow = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
        const cashOutflow = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const totalAssets = cashInflow - cashOutflow; // الرصيد الفعلي

        // حساب الخصوم (الدائنون)
        const totalLiabilities = purchases.filter(p => p.paymentStatus !== 'paid').reduce((sum, p) => sum + p.grandTotal, 0);

        // صافي الربح
        const netIncome = totalRevenue - totalExpenses - totalPurchases;

        return {
            totalAssets,
            totalLiabilities,
            totalRevenue,
            totalExpenses,
            netIncome
        };
    }, [transactions, expenses, sales, purchases]);

    const cards: SummaryCard[] = [
        {
            id: 'assets',
            title: 'إجمالي الأصول',
            value: summary.totalAssets,
            icon: <Wallet size={20} />,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            trend: 5.2
        },
        {
            id: 'liabilities',
            title: 'إجمالي الخصوم',
            value: summary.totalLiabilities,
            icon: <Scale size={20} />,
            color: 'text-rose-600 dark:text-rose-400',
            bgColor: 'bg-rose-50 dark:bg-rose-900/20',
            trend: -2.1
        },
        {
            id: 'revenue',
            title: 'إجمالي الإيرادات',
            value: summary.totalRevenue,
            icon: <TrendingUp size={20} />,
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
            trend: 12.5
        },
        {
            id: 'expenses',
            title: 'إجمالي المصروفات',
            value: summary.totalExpenses,
            icon: <TrendingDown size={20} />,
            color: 'text-amber-600 dark:text-amber-400',
            bgColor: 'bg-amber-50 dark:bg-amber-900/20',
            trend: -8.3
        },
        {
            id: 'netIncome',
            title: 'صافي الربح',
            value: summary.netIncome,
            icon: <DollarSign size={20} />,
            color: summary.netIncome >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400',
            bgColor: summary.netIncome >= 0
                ? 'bg-emerald-50 dark:bg-emerald-900/20'
                : 'bg-rose-50 dark:bg-rose-900/20',
            trend: summary.netIncome >= 0 ? 15.7 : -15.7
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {cards.map(card => (
                <div
                    key={card.id}
                    className={`${card.bgColor} border border-white/50 dark:border-indigo-800/30/50 rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group`}
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg ${card.bgColor} ${card.color} transition-transform duration-300 group-hover:scale-110`}>
                            {card.icon}
                        </div>
                        {card.trend !== undefined && (
                            <div className={`flex items-center gap-0.5 text-[10px] font-black ${card.trend > 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                                }`}>
                                {card.trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {Math.abs(card.trend)}%
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {card.title}
                        </p>
                        <p className={`text-xl font-black ${card.color} tabular-nums`}>
                            {card.value.toLocaleString()}
                            <span className="text-[10px] font-bold mr-1 opacity-60">ر.س</span>
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AccountingSummaryCards;
