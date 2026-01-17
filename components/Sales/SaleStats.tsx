
import React from 'react';
import StatsCard from '../UI/StatsCard';
import { TrendingUp, CheckCircle, Clock, FileText } from 'lucide-react';

interface SaleStatsProps {
  stats: {
    totalSales: number;
    cashSales: number;
    creditSales: number;
    invoiceCount: number;
  };
}

const SaleStats: React.FC<SaleStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-500">
      <StatsCard
        label="إجمالي مبيعات الفترة"
        value={stats.totalSales.toLocaleString()}
        icon={TrendingUp}
        color="text-indigo-600"
        bg="bg-indigo-50 dark:bg-indigo-900/20"
        currency="ر.س"
      />
      <StatsCard
        label="المبيعات النقدية"
        value={stats.cashSales.toLocaleString()}
        icon={CheckCircle}
        color="text-emerald-600"
        bg="bg-emerald-50 dark:bg-emerald-900/20"
        currency="ر.س"
      />
      <StatsCard
        label="المبيعات الآجلة"
        value={stats.creditSales.toLocaleString()}
        icon={Clock}
        color="text-amber-600"
        bg="bg-amber-50 dark:bg-amber-900/20"
        currency="ر.س"
      />
      <StatsCard
        label="عدد الفواتير"
        value={stats.invoiceCount.toString()}
        icon={FileText}
        color="text-blue-600"
        bg="bg-blue-50 dark:bg-blue-900/20"
        showCurrency={false}
      />
    </div>
  );
};

export default SaleStats;
