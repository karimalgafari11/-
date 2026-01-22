/**
 * جدول بنود الفاتورة
 */

import React from 'react';
import { Plus, Trash2, Cog } from 'lucide-react';
import Button from '../../UI/Button';
import { ItemsTableProps } from './types';

const ItemsTable: React.FC<ItemsTableProps> = ({
    items,
    selectedCurrency,
    onQuantityChange,
    onPriceChange,
    onRemoveItem,
    onAddItem,
    convertPrice,
    handleKeyDown,
    setInputRef
}) => {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Cog size={18} className="text-cyan-500" /> قائمة القطع
                    {items.length > 0 && (
                        <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow">
                            {items.length}
                        </span>
                    )}
                </h4>
                <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={onAddItem}>
                    إضافة قطعة
                </Button>
            </div>

            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-lg">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
                            <th className="p-4 text-start font-black">القطعة</th>
                            <th className="p-4 text-center font-black w-28">الكمية</th>
                            <th className="p-4 text-center font-black w-36">السعر ({selectedCurrency?.symbol})</th>
                            <th className="p-4 text-center font-black w-40">الإجمالي</th>
                            <th className="p-4 text-center font-black w-14"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length > 0 ? items.map((item, rowIndex) => (
                            <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-cyan-50/30 dark:hover:bg-cyan-900/10 transition-colors group">
                                <td className="p-4">
                                    <div>
                                        <span className="font-black text-slate-800 dark:text-slate-200 block group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">{item.name}</span>
                                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded mt-1 inline-block">
                                            {item.sku}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-2">
                                    <input
                                        ref={setInputRef(rowIndex, 0)}
                                        type="number"
                                        className="w-full p-3 text-center bg-slate-50 dark:bg-slate-800 font-black text-cyan-600 dark:text-cyan-400 text-lg outline-none border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all"
                                        value={item.quantity || ''}
                                        placeholder=""
                                        onKeyDown={(e) => handleKeyDown(e, rowIndex, 0)}
                                        onChange={(e) => onQuantityChange(item.id, Math.max(1, parseInt(e.target.value) || 0))}
                                    />
                                </td>
                                <td className="p-2">
                                    <input
                                        ref={setInputRef(rowIndex, 1)}
                                        type="number"
                                        className="w-full p-3 text-center bg-slate-50 dark:bg-slate-800 font-black text-slate-700 dark:text-slate-200 text-lg outline-none border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all"
                                        value={convertPrice(item.unitPrice) || ''}
                                        placeholder=""
                                        onKeyDown={(e) => handleKeyDown(e, rowIndex, 1)}
                                        onChange={(e) => onPriceChange(item.id, parseFloat(e.target.value) || 0)}
                                    />
                                </td>
                                <td className="p-4 text-center">
                                    <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 rounded-xl py-2 px-3">
                                        <span className="font-black text-xl text-emerald-600 dark:text-emerald-400 tabular-nums">
                                            {convertPrice(item.quantity * item.unitPrice).toLocaleString()}
                                        </span>
                                        <span className="text-[10px] text-slate-500 block">{selectedCurrency?.symbol}</span>
                                    </div>
                                </td>
                                <td className="p-2 text-center">
                                    <button
                                        onClick={() => onRemoveItem(item.id)}
                                        className="w-10 h-10 flex items-center justify-center text-rose-400 hover:text-white hover:bg-gradient-to-br hover:from-rose-500 hover:to-pink-600 rounded-xl transition-all shadow-sm hover:shadow-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="py-16 text-center">
                                    <div className="flex flex-col items-center gap-3 text-slate-400">
                                        <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center">
                                            <Cog size={36} className="text-slate-300 dark:text-slate-600" />
                                        </div>
                                        <p className="font-bold text-lg">لا توجد قطع</p>
                                        <p className="text-[11px]">اضغط "إضافة قطعة" لإضافة منتجات للفاتورة</p>
                                        <p className="text-[9px] text-slate-300 dark:text-slate-600 mt-2">
                                            💡 يمكنك التنقل بين الحقول باستخدام الأسهم أو Tab
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ItemsTable;
