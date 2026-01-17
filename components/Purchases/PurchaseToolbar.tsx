import React from 'react';
import Button from '../UI/Button';
import { Search, Plus, Wallet, Truck, Clock, Settings2, RotateCcw, TrendingDown } from 'lucide-react';
import { PrivacyToggle } from '../Common/PrivacyToggle';

interface PurchaseToolbarProps {
  activeTab: 'all' | 'credit' | 'payments' | 'returns' | 'analytics';
  setActiveTab: (tab: 'all' | 'credit' | 'payments' | 'returns' | 'analytics') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNewPurchase: () => void;
  onNewPayment: () => void;
  onNewReturn?: () => void;
}

const PurchaseToolbar: React.FC<PurchaseToolbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onNewPurchase,
  onNewPayment,
  onNewReturn
}) => {
  const tabs = [
    { id: 'all', label: 'سجل المشتريات', icon: Truck },
    { id: 'credit', label: 'الذمم الدائنة', icon: Clock },
    { id: 'returns', label: 'مرتجع مشتريات', icon: RotateCcw },
    { id: 'payments', label: 'سندات الصرف', icon: Wallet },
    { id: 'analytics', label: 'التحليل البياني', icon: TrendingDown }, // Using TrendingDown for expense analysis
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Navigation Tabs */}
      <div className="flex bg-white dark:bg-gray-900 p-1 border border-slate-200 dark:border-slate-800 shadow-sm w-fit overflow-hidden">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2.5 text-[10px] font-black flex items-center gap-2 transition-all ${activeTab === tab.id
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'text-slate-500 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Actions & Search */}
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="بحث في الفواتير..."
            className="pl-9 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold outline-none focus:border-primary w-64 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <PrivacyToggle showLabel={false} />
        {activeTab === 'returns' && onNewReturn ? (
          <Button variant="danger" icon={<RotateCcw size={16} />} onClick={onNewReturn}>مرتجع جديد</Button>
        ) : (
          <>
            <Button variant="success" icon={<Plus size={16} />} onClick={onNewPurchase}>توريد جديد</Button>
            <Button variant="primary" icon={<Wallet size={16} />} onClick={onNewPayment}>سند صرف مورد</Button>
          </>
        )}
      </div>
    </div>
  );
};

export default PurchaseToolbar;
