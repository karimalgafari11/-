
import React from 'react';
import { Expense } from '../../types';
import { Trash2, Settings2, FileText, MoveHorizontal, Edit } from 'lucide-react';

interface ExpenseExcelGridProps {
  data: Expense[];
  onDelete: (id: string) => void;
  onEdit?: (expense: Expense) => void;
}

const ExpenseRow = React.memo(({ row, idx, onDelete, onEdit }: { row: Expense; idx: number; onDelete: (id: string) => void; onEdit?: (expense: Expense) => void }) => (
  <tr className="hover:bg-rose-50/30 dark:hover:bg-rose-900/5 transition-colors group">
    <td className="p-3 text-center text-slate-400 font-bold border border-slate-100 dark:border-slate-800">{idx + 1}</td>
    <td className="p-3 border border-slate-100 dark:border-slate-800 font-black text-slate-500 uppercase tracking-tighter">{row.expenseNumber}</td>
    <td className="p-3 border border-slate-100 dark:border-slate-800 tabular-nums font-bold text-[10px]">{row.date}</td>
    <td className="p-3 border border-slate-100 dark:border-slate-800">
      <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded text-[9px] font-black">{row.category}</span>
    </td>
    <td className="p-3 border border-slate-100 dark:border-slate-800 font-bold truncate max-w-[200px]">{row.description}</td>
    <td className="p-3 border border-slate-100 dark:border-slate-800 text-center tabular-nums text-slate-400 font-bold">{row.tax.toLocaleString()}</td>
    <td className="p-3 border border-slate-100 dark:border-slate-800 text-center font-black text-rose-600 tabular-nums">{row.total.toLocaleString()} SAR</td>
    <td className="p-2 text-center border border-slate-100 dark:border-slate-800">
      <div className="flex gap-1 justify-center">
        {onEdit && (
          <button onClick={() => onEdit(row)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors rounded-full">
            <Edit size={12} />
          </button>
        )}
        <button onClick={() => onDelete(row.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors rounded-full">
          <Trash2 size={12} />
        </button>
      </div>
    </td>
  </tr>
));

const ExpenseExcelGrid: React.FC<ExpenseExcelGridProps> = ({ data, onDelete, onEdit }) => {
  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-360px)] min-h-[500px]">
      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">سجل المصروفات العام</span>
        </div>
        <button className="p-1.5 text-slate-400 hover:text-primary transition-all"><Settings2 size={16} /></button>
      </div>

      <div className="overflow-auto custom-scrollbar flex-1">
        <table className="w-full text-[11px] border-collapse table-fixed min-w-[900px]">
          <thead className="bg-slate-900 text-white font-black uppercase sticky top-0 z-20">
            <tr>
              <th className="p-3 text-center border border-white/10 w-12 bg-slate-900">#</th>
              <th className="p-3 text-start border border-white/10 w-32">رقم السند</th>
              <th className="p-3 text-start border border-white/10 w-24">التاريخ</th>
              <th className="p-3 text-start border border-white/10 w-28">التصنيف</th>
              <th className="p-3 text-start border border-white/10">البيان / الوصف</th>
              <th className="p-3 text-center border border-white/10 w-24">الضريبة</th>
              <th className="p-3 text-center border border-white/10 w-32">الإجمالي</th>
              <th className="p-3 text-center border border-white/10 w-24">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.length > 0 ? data.map((row, idx) => (
              <ExpenseRow key={row.id} row={row} idx={idx} onDelete={onDelete} onEdit={onEdit} />
            )) : (
              <tr><td colSpan={8} className="py-24 text-center opacity-20 text-xs font-black uppercase tracking-[0.4em]">لا توجد مصروفات مسجلة</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center text-[9px] font-black uppercase text-slate-400 tracking-wider shrink-0">
        <div className="flex gap-4">
          <span>إجمالي السجلات: {data.length}</span>
          <div className="flex items-center gap-1"><MoveHorizontal size={12} /> اسحب لتعديل الأعمدة</div>
        </div>
        <div className="flex items-center gap-2"><span>Expense Engine v2.0 Stable</span><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div></div>
      </div>
    </div>
  );
};

export default React.memo(ExpenseExcelGrid);
