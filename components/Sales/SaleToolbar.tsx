import React from 'react';
import Button from '../UI/Button';
import { Search, Plus, ShoppingBag, Clock, TrendingUp, RotateCcw } from 'lucide-react';
import { PrivacyToggle } from '../Common/PrivacyToggle';
import { Protected } from '../Common/Protected';

interface SaleToolbarProps {
  activeTab: 'all' | 'credit' | 'analytics' | 'returns';
  setActiveTab: (tab: 'all' | 'credit' | 'analytics' | 'returns') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onNewSale: () => void;
  onNewReturn?: () => void;
}

const SaleToolbar: React.FC<SaleToolbarProps> = ({
  activeTab, setActiveTab, searchQuery, setSearchQuery, onNewSale, onNewReturn
}) => {
  const tabs = [
    { id: 'all', label: 'سجل المبيعات', icon: ShoppingBag },
    { id: 'credit', label: 'الفواتير الآجلة', icon: Clock },
    { id: 'returns', label: 'المرتجعات', icon: RotateCcw },
    { id: 'analytics', label: 'التحليل البياني', icon: TrendingUp }
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
          <Protected module="sales" action="create">
            <Button variant="danger" icon={<RotateCcw size={16} />} onClick={onNewReturn}>تسجيل مرتجع</Button>
          </Protected>
        ) : (
          <Protected module="sales" action="create">
            <Button variant="primary" icon={<Plus size={16} />} onClick={onNewSale}>فاتورة بيع جديدة</Button>
          </Protected>
        )}
      </div>
    </div>
  );
};

export default SaleToolbar;
