
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Modal from '../Common/Modal';
import { useApp } from '../../context/AppContext';
import { useInventory } from '../../context/InventoryContext';
import { InventoryItem } from '../../types';
import {
  Search, Package, Check, ArrowUpDown, Filter, Info, Box,
  Settings2, Eye, EyeOff, GripVertical, CheckCircle2,
  ChevronUp, ChevronDown, MoveHorizontal
} from 'lucide-react';

interface ItemSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: InventoryItem) => void;
}

interface ColumnConfig {
  key: keyof InventoryItem | 'actions';
  label: string;
  visible: boolean;
  width: number; // Width in pixels
  bgColor?: string; // Optional coloring
}

const ItemSelectorModal: React.FC<ItemSelectorModalProps> = ({ isOpen, onClose, onSelect }) => {
  const { inventory } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<keyof InventoryItem>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showColumnPicker, setShowColumnPicker] = useState(false);

  // Keyboard Navigation State
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number }>({ row: 0, col: 0 });
  const tableRef = useRef<HTMLTableElement>(null);

  // Column Management
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: 'name', label: 'الصنف', visible: true, width: 220, bgColor: 'bg-blue-50/30 dark:bg-blue-900/5' },
    { key: 'itemNumber', label: 'رقم الصنف', visible: true, width: 120 },
    { key: 'manufacturer', label: 'الشركة المصنعة', visible: true, width: 140 },
    { key: 'category', label: 'التصنيف', visible: true, width: 110 },
    { key: 'size', label: 'القياس', visible: true, width: 100 },
    { key: 'specifications', label: 'التفاصيل', visible: true, width: 180 },
    { key: 'unit', label: 'الوحدة', visible: true, width: 90 },
    { key: 'quantity', label: 'المتوفر', visible: true, width: 90, bgColor: 'bg-emerald-50/20 dark:bg-emerald-900/5' },
    { key: 'salePrice', label: 'السعر', visible: true, width: 110, bgColor: 'bg-indigo-50/30 dark:bg-indigo-900/10' },
  ]);

  const visibleColumns = useMemo(() => columns.filter(c => c.visible), [columns]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const filtered = inventory.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.itemNumber.toLowerCase().includes(q) ||
      (item.manufacturer || '').toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q)
    );

    return filtered.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? (Number(valA) - Number(valB)) : (Number(valB) - Number(valA));
    });
  }, [inventory, searchQuery, sortKey, sortOrder]);

  // Column Resizing Logic
  const [resizing, setResizing] = useState<{ index: number; startWidth: number; startX: number } | null>(null);

  const startResizing = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setResizing({
      index,
      startX: e.clientX,
      startWidth: visibleColumns[index].width
    });
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!resizing) return;
    const delta = e.clientX - resizing.startX;
    const newWidth = Math.max(50, resizing.startWidth + delta);

    setColumns(prev => {
      const newCols = [...prev];
      const colKey = visibleColumns[resizing.index].key;
      const targetIdx = newCols.findIndex(c => c.key === colKey);
      newCols[targetIdx].width = newWidth;
      return newCols;
    });
  }, [resizing, visibleColumns]);

  const onMouseUp = useCallback(() => {
    setResizing(null);
  }, []);

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

  // Keyboard Navigation Handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const { row, col } = focusedCell;
    const maxRow = filteredItems.length - 1;
    const maxCol = visibleColumns.length; // Including actions

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setFocusedCell({ row: Math.max(0, row - 1), col });
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedCell({ row: Math.min(maxRow, row + 1), col });
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setFocusedCell({ row, col: Math.min(maxCol, col + 1) });
        break;
      case 'ArrowRight':
        e.preventDefault();
        setFocusedCell({ row, col: Math.max(0, col - 1) });
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredItems[row]) onSelect(filteredItems[row]);
        break;
    }
  };

  // Reorder Columns
  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const newColumns = [...columns];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newColumns.length) return;
    [newColumns[index], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[index]];
    setColumns(newColumns);
  };

  const handleSort = (key: keyof InventoryItem) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="مستكشف المخزون (Excel Engine v2)" size="xl">
      <div className="space-y-4 outline-none" onKeyDown={handleKeyDown} tabIndex={0}>
        {/* Advanced Toolbar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="البحث الذكي في السجلات..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-xs outline-none focus:border-primary shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 relative">
            <button
              onClick={() => setShowColumnPicker(!showColumnPicker)}
              className={`px-4 py-2 border font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${showColumnPicker ? 'bg-primary text-white border-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-200'}`}
            >
              <Settings2 size={14} /> تخصيص الشبكة
            </button>

            {showColumnPicker && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-[100] p-4 rounded-xl">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">ترتيب وتفعيل الأعمدة</h5>
                <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar">
                  {columns.map((col, idx) => (
                    <div key={col.key} className="flex items-center gap-2 group">
                      <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => moveColumn(idx, 'up')} className="text-slate-400 hover:text-primary"><ChevronUp size={12} /></button>
                        <button onClick={() => moveColumn(idx, 'down')} className="text-slate-400 hover:text-primary"><ChevronDown size={12} /></button>
                      </div>
                      <button
                        onClick={() => setColumns(prev => prev.map(c => c.key === col.key ? { ...c, visible: !c.visible } : c))}
                        className={`flex-1 flex items-center justify-between px-3 py-2 text-[11px] font-bold rounded-lg transition-colors ${col.visible ? 'bg-primary/5 text-primary' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                        <span className="flex items-center gap-2"><GripVertical size={12} className="opacity-20" /> {col.label}</span>
                        {col.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Excel-style Grid */}
        <div className="border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm bg-white dark:bg-slate-950">
          <div className="max-h-[500px] overflow-x-auto overflow-y-auto custom-scrollbar">
            <table ref={tableRef} className="w-full text-[11px] border-collapse table-fixed select-none">
              <thead className="bg-slate-900 text-white font-black uppercase sticky top-0 z-20">
                <tr>
                  <th className="p-3 text-center border border-white/10 w-12 bg-slate-900">#</th>
                  {visibleColumns.map((col, idx) => (
                    <th
                      key={col.key}
                      className="relative p-3 text-center border border-white/10 cursor-pointer hover:bg-slate-800 transition-colors group"
                      style={{ width: `${col.width}px` }}
                    >
                      <div className="flex items-center justify-between px-1 overflow-hidden" onClick={() => handleSort(col.key as keyof InventoryItem)}>
                        <span className="truncate">{col.label}</span>
                        <ArrowUpDown size={10} className={`shrink-0 transition-opacity ${sortKey === col.key ? 'opacity-100' : 'opacity-20'}`} />
                      </div>
                      {/* Resize Handle */}
                      <div
                        onMouseDown={(e) => startResizing(e, idx)}
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary transition-colors z-30"
                      />
                    </th>
                  ))}
                  <th className="p-3 text-center border border-white/10 w-20 bg-slate-900">إضافة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredItems.length > 0 ? filteredItems.map((item, rowIdx) => (
                  <tr
                    key={item.id}
                    className={`group transition-colors ${focusedCell.row === rowIdx ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                    onClick={() => setFocusedCell(prev => ({ ...prev, row: rowIdx }))}
                    onDoubleClick={() => onSelect(item)}
                  >
                    <td className="p-3 text-center text-slate-400 font-bold tabular-nums border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">{rowIdx + 1}</td>

                    {visibleColumns.map((col, colIdx) => {
                      const isFocused = focusedCell.row === rowIdx && focusedCell.col === colIdx;
                      return (
                        <td
                          key={col.key}
                          className={`p-3 border border-slate-200 dark:border-slate-800 transition-all ${col.bgColor || ''} ${isFocused ? 'ring-2 ring-inset ring-primary z-10 bg-white dark:bg-slate-900' : ''}`}
                          onClick={() => setFocusedCell({ row: rowIdx, col: colIdx })}
                        >
                          {col.key === 'name' ? (
                            <div className="flex items-center gap-2 overflow-hidden">
                              <Box size={14} className="text-slate-300 group-hover:text-primary transition-colors shrink-0" />
                              <span className="font-black text-slate-800 dark:text-slate-200 truncate">{item.name}</span>
                            </div>
                          ) : col.key === 'quantity' ? (
                            <div className="text-center">
                              <span className={`font-black tabular-nums ${item.quantity <= item.minQuantity ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {item.quantity.toLocaleString()}
                              </span>
                            </div>
                          ) : col.key === 'salePrice' ? (
                            <div className="text-center font-black text-blue-600 tabular-nums">
                              {item.salePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                          ) : (
                            <div className={`text-center truncate font-bold ${col.key === 'itemNumber' ? 'text-slate-500 uppercase tracking-tighter' : 'text-slate-600 dark:text-slate-400'}`}>
                              {String(item[col.key as keyof InventoryItem] || '-')}
                            </div>
                          )}
                        </td>
                      );
                    })}

                    <td
                      className={`p-2 text-center border border-slate-200 dark:border-slate-800 ${focusedCell.row === rowIdx && focusedCell.col === visibleColumns.length ? 'ring-2 ring-inset ring-primary bg-white dark:bg-slate-900' : ''}`}
                      onClick={() => setFocusedCell({ row: rowIdx, col: visibleColumns.length })}
                    >
                      <button
                        onClick={() => onSelect(item)}
                        className="w-8 h-8 mx-auto flex items-center justify-center bg-primary text-white hover:scale-110 active:scale-95 transition-all"
                      >
                        <Check size={16} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={visibleColumns.length + 2} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                        <Package size={64} />
                        <p className="text-sm font-black uppercase tracking-[0.3em]">لا يوجد تطابق في سجلات المخزون</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2">
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase">
              <MoveHorizontal size={14} className="text-primary" /> اسحب الأعمدة لتغيير حجمها
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase">
              <GripVertical size={14} className="text-primary" /> استخدم الأسهم للتنقل
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">السجل النشط: {focusedCell.row + 1} / {filteredItems.length}</span>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-primary">
              <CheckCircle2 size={14} /> اضغط Enter للاختيار السريع
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ItemSelectorModal;
