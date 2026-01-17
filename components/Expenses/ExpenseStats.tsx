
import React from 'react';
import StatsCard from '../UI/StatsCard';
import { CreditCard, Wallet, AlertCircle, PieChart } from 'lucide-react';

interface ExpenseStatsProps {
  stats: {
    totalThisMonth: number;
    pendingTotal: number;
    topCategory: string;
    expenseCount: number;
  };
}

const ExpenseStats: React.FC<ExpenseStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-500">
      <StatsCard
        label="إجمالي مصاريف الشهر"
        value={stats.totalThisMonth.toLocaleString()}
        icon={CreditCard}
        color="text-rose-600"
        bg="bg-rose-50 dark:bg-rose-900/20"
        currency="ر.س"
      />
      <StatsCard
        label="مصاريف غير مسددة"
        value={stats.pendingTotal.toLocaleString()}
        icon={AlertCircle}
        color="text-amber-600"
        bg="bg-amber-50 dark:bg-amber-900/20"
        currency="ر.س"
      />
      <StatsCard
        label="التصنيف الأكثر إنفاقاً"
        value={stats.topCategory}
        icon={PieChart}
        color="text-indigo-600"
        bg="bg-indigo-50 dark:bg-indigo-900/20"
        showCurrency={false}
      />
      <StatsCard
        label="عدد سندات الصرف"
        value={stats.expenseCount.toString()}
        icon={Wallet}
        color="text-blue-600"
        bg="bg-blue-50 dark:bg-blue-900/20"
        showCurrency={false}
      />
    </div>
  );
};

export default ExpenseStats;
