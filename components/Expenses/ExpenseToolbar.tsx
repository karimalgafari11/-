import React from 'react';
import { Search, Layers, Repeat, FileDown, Plus } from 'lucide-react';
import Button from '../UI/Button';
import { PrivacyToggle } from '../Common/PrivacyToggle';

interface ExpenseToolbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenForm: () => void;
  onOpenCategories: () => void;
  onOpenRecurring: () => void;
  onExport: () => void;
}

const ExpenseToolbar: React.FC<ExpenseToolbarProps> = ({
  searchQuery, setSearchQuery, onOpenForm, onOpenCategories, onOpenRecurring, onExport
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 lg:gap-3 bg-white dark:bg-slate-900 p-4 xl:p-0">
      <div className="relative flex-1 sm:flex-none">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        <input
          type="text"
          placeholder="البحث في السجلات..."
          className="w-full sm:w-56 pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-[11px] font-bold outline-none focus:border-rose-500 transition-all shadow-inner"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3 ml-1">
        <button onClick={onOpenCategories} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all" title="إدارة التصنيفات">
          <Layers size={18} />
        </button>
        <button onClick={onOpenRecurring} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all" title="المصروفات المتكررة">
          <Repeat size={18} />
        </button>
        <button onClick={onExport} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all" title="تصدير السجلات">
          <FileDown size={18} />
        </button>
      </div>

      <PrivacyToggle showLabel={false} />

      <Button variant="danger" className="flex-1 sm:flex-none" icon={<Plus size={16} />} onClick={onOpenForm}>
        سند صرف جديد
      </Button>
    </div>
  );
};

export default React.memo(ExpenseToolbar);
