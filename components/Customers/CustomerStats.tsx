
import React from 'react';
import StatsCard from '../UI/StatsCard';
import { Users, Wallet, TrendingUp, UserCheck } from 'lucide-react';

interface CustomerStatsProps {
  stats: {
    totalCustomers: number;
    totalReceivables: number;
    activeCustomers: number;
    lateCustomers: number;
  };
}

const CustomerStats: React.FC<CustomerStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
      <StatsCard
        label="إجمالي العملاء"
        value={stats.totalCustomers.toString()}
        icon={Users}
        color="text-blue-600"
        bg="bg-blue-50 dark:bg-blue-900/20"
        showCurrency={false}
      />
      <StatsCard
        label="الديون المستحقة"
        value={stats.totalReceivables.toLocaleString()}
        icon={Wallet}
        color="text-emerald-600"
        bg="bg-emerald-50 dark:bg-emerald-900/20"
        currency="ر.س"
      />
      <StatsCard
        label="عملاء نشطين"
        value={stats.activeCustomers.toString()}
        icon={UserCheck}
        color="text-indigo-600"
        bg="bg-indigo-50 dark:bg-indigo-900/20"
        showCurrency={false}
      />
      <StatsCard
        label="متأخرات التحصيل"
        value={stats.lateCustomers.toString()}
        icon={TrendingUp}
        color="text-rose-600"
        bg="bg-rose-50 dark:bg-rose-900/20"
        showCurrency={false}
      />
    </div>
  );
};

export default CustomerStats;
