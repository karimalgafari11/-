
import React from 'react';
import StatsCard from '../UI/StatsCard';
import { Users, CreditCard, AlertCircle, ShoppingCart } from 'lucide-react';

interface SupplierStatsProps {
  stats: {
    totalSuppliers: number;
    totalBalance: number;
    activeSuppliers: number;
    blockedSuppliers: number;
  };
}

const SupplierStats: React.FC<SupplierStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
      <StatsCard
        label="إجمالي الموردين"
        value={stats.totalSuppliers.toString()}
        icon={Users}
        color="text-indigo-600"
        bg="bg-indigo-50 dark:bg-indigo-900/20"
        showCurrency={false}
      />
      <StatsCard
        label="إجمالي المديونية"
        value={stats.totalBalance.toLocaleString()}
        icon={CreditCard}
        color="text-rose-600"
        bg="bg-rose-50 dark:bg-rose-900/20"
        currency="ر.س"
      />
      <StatsCard
        label="موردين نشطين"
        value={stats.activeSuppliers.toString()}
        icon={ShoppingCart}
        color="text-emerald-600"
        bg="bg-emerald-50 dark:bg-emerald-900/20"
        showCurrency={false}
      />
      <StatsCard
        label="موردين محظورين"
        value={stats.blockedSuppliers.toString()}
        icon={AlertCircle}
        color="text-amber-600"
        bg="bg-amber-50 dark:bg-amber-900/20"
        showCurrency={false}
      />
    </div>
  );
};

export default SupplierStats;
