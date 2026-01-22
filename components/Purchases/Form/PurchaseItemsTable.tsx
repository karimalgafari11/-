/**
 * جدول بنود المشتريات
 */

import React from 'react';
import { Plus, Trash2, Boxes } from 'lucide-react';
import Button from '../../UI/Button';
import { PurchaseItemsTableProps } from './types';

const PurchaseItemsTable: React.FC<PurchaseItemsTableProps> = ({
    items,
    selectedCurrency,
    onQuantityChange,
    onCostChange,
    onRemoveItem,
    onAddItem
}) => {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Boxes size={18} className="text-emerald-500" /> بنود الفاتورة
                    {items.length > 0 && (
                        <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                            {items.length}
                        </span>
                    )}
                </h4>
                <Button variant="success" size="sm" icon={<Plus size={14} />} onClick={onAddItem}>
                    إضافة صنف
                </Button>
            </div>

            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white">
                            <th className="p-4 text-start font-black">الصنف</th>
                            <th className="p-4 text-center font-black w-28">الكمية</th>
                            <th className="p-4 text-center font-black w-32">التكلفة</th>
                            <th className="p-4 text-center font-black w-36">الإجمالي</th>
                            <th className="p-4 text-center font-black w-14"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length > 0 ? items.map((item, index) => (
                            <tr key={item.id} className={`border-b border-slate-100 dark:border-slate-800 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors ${index % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}`}>
                                <td className="p-4">
                                    <div>
                                        <span className="font-black text-slate-800 dark:text-slate-200 block">{item.name}</span>
                                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded mt-1 inline-block">
                                            ID: {item.itemId.slice(-6)}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-3">
                                    <input
                                        type="number"
                                        className="w-full p-2.5 text-center bg-white dark:bg-slate-800 font-black text-emerald-600 dark:text-emerald-400 outline-none border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        value={item.quantity || ''}
                                        placeholder=""
                                        onChange={(e) => onQuantityChange(item.id, Math.max(1, parseInt(e.target.value) || 0))}
                                    />
                                </td>
                                <td className="p-3">
                                    <input
                                        type="number"
                                        className="w-full p-2.5 text-center bg-white dark:bg-slate-800 font-black text-slate-700 dark:text-slate-200 outline-none border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        value={item.costPrice || ''}
                                        placeholder=""
                                        onChange={(e) => onCostChange(item.id, parseFloat(e.target.value) || 0)}
                                    />
                                </td>
                                <td className="p-4 text-center">
                                    <span className="font-black text-lg text-emerald-600 dark:text-emerald-400 tabular-nums">
                                        {(item.quantity * item.costPrice).toLocaleString()}
                                    </span>
                                    <span className="text-[9px] text-slate-400 block">{selectedCurrency?.symbol}</span>
                                </td>
                                <td className="p-3 text-center">
                                    <button
                                        onClick={() => onRemoveItem(item.id)}
                                        className="w-9 h-9 flex items-center justify-center text-rose-400 hover:text-white hover:bg-rose-500 rounded-xl transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="py-16 text-center">
                                    <div className="flex flex-col items-center gap-3 text-slate-400">
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                                            <Boxes size={28} className="text-slate-300" />
                                        </div>
                                        <p className="font-bold">لا توجد أصناف</p>
                                        <p className="text-[10px]">اضغط "إضافة صنف" للبدء</p>
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

export default PurchaseItemsTable;
