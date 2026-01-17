
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Purchase } from '../../types';
import { Eye, ArrowUpDown, MoveHorizontal, Settings2, GripVertical, EyeOff, ChevronUp, ChevronDown, CheckCircle, Edit, Trash2 } from 'lucide-react';

interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  width: number;
}

interface PurchaseExcelGridProps {
  data: Purchase[];
  onRowDoubleClick: (purchase: Purchase) => void;
  onViewAction: (purchase: Purchase) => void;
  onEditAction?: (purchase: Purchase) => void;
  onDeleteAction?: (id: string) => void;
}

const PurchaseExcelGrid: React.FC<PurchaseExcelGridProps> = ({ data, onRowDoubleClick, onViewAction, onEditAction, onDeleteAction }) => {

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه عملية الشراء؟')) {
      onDeleteAction?.(id);
    }
  };
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: 'invoiceNumber', label: 'رقم الفاتورة', visible: true, width: 150 },
    { key: 'date', label: 'التاريخ', visible: true, width: 120 },
    { key: 'supplierName', label: 'المورد', visible: true, width: 220 },
    { key: 'paymentMethod', label: 'طريقة الدفع', visible: true, width: 110 },
    { key: 'paymentStatus', label: 'حالة السداد', visible: true, width: 110 },
    { key: 'grandTotal', label: 'الإجمالي', visible: true, width: 140 },
  ]);

  const visibleColumns = useMemo(() => columns.filter(c => c.visible), [columns]);

  // Resizing Logic
  const [resizing, setResizing] = useState<{ index: number; startWidth: number; startX: number } | null>(null);

  const startResizing = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setResizing({ index, startX: e.clientX, startWidth: visibleColumns[index].width });
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!resizing) return;
    const delta = e.clientX - resizing.startX;
    const newWidth = Math.max(70, resizing.startWidth + delta);
    setColumns(prev => {
      const newCols = [...prev];
      const targetIdx = newCols.findIndex(c => c.key === visibleColumns[resizing.index].key);
      newCols[targetIdx].width = newWidth;
      return newCols;
    });
  }, [resizing, visibleColumns]);

  const onMouseUp = useCallback(() => setResizing(null), []);

  useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [resizing, onMouseMove, onMouseUp]);

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const newColumns = [...columns];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newColumns.length) return;
    [newColumns[index], newColumns[targetIdx]] = [newColumns[targetIdx], newColumns[index]];
    setColumns(newColumns);
  };

  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-360px)] min-h-[500px]">
      {/* Grid Controls Overlay */}
      <div className="flex justify-end p-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="relative">
          <button
            onClick={() => setShowColumnPicker(!showColumnPicker)}
            className={`p-1.5 rounded transition-all ${showColumnPicker ? 'bg-primary text-white' : 'text-slate-400 hover:text-primary'}`}
          >
            <Settings2 size={16} />
          </button>
          {showColumnPicker && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-4">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">تخصيص أعمدة السجل</h5>
              <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                {columns.map((col, idx) => (
                  <div key={col.key} className="flex items-center gap-2 group">
                    <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => moveColumn(idx, 'up')} className="text-slate-400 hover:text-primary"><ChevronUp size={10} /></button>
                      <button onClick={() => moveColumn(idx, 'down')} className="text-slate-400 hover:text-primary"><ChevronDown size={10} /></button>
                    </div>
                    <button
                      onClick={() => setColumns(prev => prev.map(c => c.key === col.key ? { ...c, visible: !c.visible } : c))}
                      className={`flex-1 flex items-center justify-between px-3 py-2 text-[10px] font-bold rounded-lg transition-colors ${col.visible ? 'bg-primary/5 text-primary' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      <span className="flex items-center gap-2"><GripVertical size={12} className="opacity-20" /> {col.label}</span>
                      {col.visible ? <CheckCircle size={12} /> : <EyeOff size={12} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-auto custom-scrollbar flex-1">
        <table className="w-full text-[11px] border-collapse table-fixed min-w-full">
          <thead className="bg-slate-900 text-white font-black uppercase sticky top-0 z-20">
            <tr>
              <th className="p-3 text-center border border-white/10 w-12 bg-slate-900">#</th>
              {visibleColumns.map((col, idx) => (
                <th
                  key={col.key}
                  className="relative p-3 text-start border border-white/10"
                  style={{ width: `${col.width}px` }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">{col.label}</span>
                    <ArrowUpDown size={10} className="opacity-20" />
                  </div>
                  <div
                    onMouseDown={(e) => startResizing(e, idx)}
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary transition-colors z-30"
                  />
                </th>
              ))}
              <th className="p-3 text-center border border-white/10 w-20 bg-slate-900">الإجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.length > 0 ? data.map((row, idx) => (
              <tr
                key={row.id}
                className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer group"
                onDoubleClick={() => onRowDoubleClick(row)}
              >
                <td className="p-3 text-center text-slate-400 font-bold border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                  {idx + 1}
                </td>
                {visibleColumns.map(col => (
                  <td key={col.key} className="p-3 border border-slate-100 dark:border-slate-800 truncate">
                    {col.key === 'paymentStatus' ? (
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${row.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                        {row.paymentStatus === 'paid' ? 'مسددة' : 'آجلة'}
                      </span>
                    ) : col.key === 'grandTotal' ? (
                      <span className="font-black tabular-nums">{row.grandTotal.toLocaleString()} SAR</span>
                    ) : (
                      <span className="font-bold">{String(row[col.key as keyof Purchase] || '-')}</span>
                    )}
                  </td>
                ))}
                <td className="p-2 text-center border border-slate-100 dark:border-slate-800">
                  <div className="flex gap-1 justify-center">
                    <button
                      onClick={() => onViewAction(row)}
                      className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors rounded-full"
                    >
                      <Eye size={12} />
                    </button>
                    {onEditAction && (
                      <button
                        onClick={() => onEditAction(row)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors rounded-full"
                      >
                        <Edit size={12} />
                      </button>
                    )}
                    {onDeleteAction && (
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors rounded-full"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={visibleColumns.length + 2} className="py-24 text-center opacity-20">
                  <p className="text-xs font-black uppercase tracking-[0.4em]">لا توجد بيانات متاحة</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Meta */}
      <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center text-[9px] font-black uppercase text-slate-400 tracking-wider">
        <div className="flex gap-4">
          <span>إجمالي السجلات: {data.length}</span>
          <div className="flex items-center gap-1">
            <MoveHorizontal size={12} /> اسحب الأعمدة لتغيير الحجم
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>Purchasing Engine v2.5 Stable</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseExcelGrid;
