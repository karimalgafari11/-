
import React from 'react';
import StatsCard from '../UI/StatsCard';
import { TrendingDown, CreditCard, Clock, FileText, AlertCircle } from 'lucide-react';

interface PurchaseStatsProps {
  stats: {
    totalPurchases: number;
    totalDebt: number;
    overdueCount: number;
    invoiceCount: number;
  };
}

const PurchaseStats: React.FC<PurchaseStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard 
        label="إجمالي المديونية الحالية" 
        value={stats.totalDebt.toLocaleString()} 
        icon={CreditCard} 
        color="text-rose-600" 
        bg="bg-rose-50 dark:bg-rose-900/20" 
      />
      <StatsCard 
        label="فواتير بانتظار السداد" 
        value={stats.overdueCount.toString()} 
        icon={AlertCircle} 
        color="text-amber-600" 
        bg="bg-amber-50 dark:bg-amber-900/20" 
        currency="INV" 
      />
      <StatsCard 
        label="إجمالي المشتريات" 
        value={stats.totalPurchases.toLocaleString()} 
        icon={TrendingDown} 
        color="text-blue-600" 
        bg="bg-blue-50 dark:bg-blue-900/20" 
      />
      <StatsCard 
        label="فواتير الفترة" 
        value={stats.invoiceCount.toString()} 
        icon={FileText} 
        color="text-slate-600" 
        bg="bg-slate-50 dark:bg-slate-900/20" 
        currency="COUNT" 
      />
    </div>
  );
};

export default PurchaseStats;
