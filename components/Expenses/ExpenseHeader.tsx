
import React from 'react';
import { TrendingDown } from 'lucide-react';

const ExpenseHeader: React.FC = () => {
  return (
    <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 xl:p-0 border xl:border-none border-slate-100 dark:border-slate-800 shadow-sm xl:shadow-none">
      <div className="p-3 bg-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-rose-900/30">
        <TrendingDown size={24} />
      </div>
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">إدارة المصروفات التشغيلية</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>
          ضبط النفقات المالية والتحكم في مراكز التكلفة
        </p>
      </div>
    </div>
  );
};

export default React.memo(ExpenseHeader);
