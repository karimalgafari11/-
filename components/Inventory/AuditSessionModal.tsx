
import React, { useState, useEffect } from 'react';
import Modal from '../Common/Modal';
import Button from '../UI/Button';
import { Save, Calculator, AlertCircle, Package } from 'lucide-react';
import { Warehouse, InventoryItem, StockAudit, AuditItem } from '../../types';

interface AuditSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouses: Warehouse[];
  inventory: InventoryItem[];
  onComplete: (audit: StockAudit) => void;
}

const AuditSessionModal: React.FC<AuditSessionModalProps> = ({ isOpen, onClose, warehouses, inventory, onComplete }) => {
  const [warehouseId, setWarehouseId] = useState('');
  const [auditItems, setAuditItems] = useState<AuditItem[]>([]);
  const [notes, setNotes] = useState('');

  const handleWarehouseChange = (id: string) => {
    setWarehouseId(id);
    const warehouse = warehouses.find(w => w.id === id);
    if (!warehouse) return;

    const itemsInWarehouse = inventory
      .filter(item => item.warehouses?.some(w => w.id === id))
      .map(item => {
        const expectedQty = item.warehouses?.find(w => w.id === id)?.quantity || 0;
        return {
          itemId: item.id,
          itemName: item.name,
          expectedQty,
          actualQty: expectedQty,
          variance: 0,
          unitCost: item.costPrice || 0,
          varianceValue: 0
        };
      });
    setAuditItems(itemsInWarehouse);
  };

  const updateQty = (itemId: string, val: string) => {
    const qty = parseInt(val) || 0;
    setAuditItems(prev => prev.map(item => {
      if (item.itemId === itemId) {
        const variance = qty - item.expectedQty;
        return {
          ...item,
          actualQty: qty,
          variance,
          varianceValue: variance * item.unitCost
        };
      }
      return item;
    }));
  };

  const totalVariance = auditItems.reduce((sum, i) => sum + i.varianceValue, 0);

  const handleSubmit = () => {
    if (!warehouseId || auditItems.length === 0) return;
    const warehouse = warehouses.find(w => w.id === warehouseId);

    const audit: StockAudit = {
      id: `AUD-${Date.now()}`,
      date: new Date().toISOString(),
      warehouseId,
      warehouseName: warehouse?.name || '',
      status: 'completed',
      items: auditItems,
      totalVarianceValue: totalVariance,
      notes
    };
    onComplete(audit);
    onClose();
    setWarehouseId('');
    setAuditItems([]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="بدء جلسة جرد رقابية" size="xl">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المستودع المستهدف</label>
            <select
              className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:border-primary transition-all"
              value={warehouseId}
              onChange={e => handleWarehouseChange(e.target.value)}
            >
              <option value="">اختر موقع الجرد...</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <div className={`flex-1 p-3 border flex items-center justify-between ${totalVariance < 0 ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
              <div className="flex items-center gap-2">
                <Calculator size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">صافي تسوية المخزون:</span>
              </div>
              <span className="text-sm font-black tabular-nums">{totalVariance.toLocaleString()} SAR</span>
            </div>
          </div>
        </div>

        {auditItems.length > 0 ? (
          <div className="border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-[11px] border-collapse">
              <thead className="bg-slate-900 text-white uppercase font-black">
                <tr>
                  <th className="p-3 text-start border-e border-white/10">الصنف</th>
                  <th className="p-3 text-center border-e border-white/10">الرصيد الدفتري</th>
                  <th className="p-3 text-center border-e border-white/10">الرصيد الفعلي</th>
                  <th className="p-3 text-center">الفارق الكمي</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900">
                {auditItems.map(item => (
                  <tr key={item.itemId} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-bold text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Package size={12} className="text-slate-400" />
                        {item.itemName}
                      </div>
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-slate-500">{item.expectedQty}</td>
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        className="w-20 p-2 text-center bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary font-black text-primary outline-none transition-all"
                        value={item.actualQty}
                        onChange={e => updateQty(item.itemId, e.target.value)}
                      />
                    </td>
                    <td className={`p-3 text-center font-black ${item.variance < 0 ? 'text-rose-600' : item.variance > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                      {item.variance > 0 ? `+${item.variance}` : item.variance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : warehouseId && (
          <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
            <AlertCircle size={32} className="mb-2 opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-widest">لا توجد أصناف مسجلة في هذا المستودع</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ملاحظات الجرد</label>
          <textarea
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:border-primary min-h-[80px]"
            placeholder="أضف أي تفاصيل حول سبب الفروقات..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" fullWidth onClick={onClose}>إلغاء العملية</Button>
          <Button variant="primary" fullWidth icon={<Save size={16} />} onClick={handleSubmit} disabled={!warehouseId || auditItems.length === 0}>
            ترحيل واعتماد الجرد
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AuditSessionModal;
