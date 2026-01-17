
import React, { useState, useMemo } from 'react';
import Modal from '../Common/Modal';
import Button from '../UI/Button';
import { ArrowRightLeft, Package, Warehouse as WhIcon, AlertTriangle } from 'lucide-react';
import { Warehouse, InventoryItem, StockTransfer } from '../../types';

interface TransferStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouses: Warehouse[];
  inventory: InventoryItem[];
  onTransfer: (transfer: StockTransfer) => void;
}

const TransferStockModal: React.FC<TransferStockModalProps> = ({ isOpen, onClose, warehouses, inventory, onTransfer }) => {
  const [formData, setFormData] = useState({
    itemId: '',
    fromId: '',
    toId: '',
    quantity: 0
  });

  const selectedItem = useMemo(() => inventory.find(i => i.id === formData.itemId), [formData.itemId, inventory]);
  
  const availableQty = useMemo(() => {
    if (!selectedItem || !formData.fromId) return 0;
    return selectedItem.warehouses?.find(w => w.id === formData.fromId)?.quantity || 0;
  }, [selectedItem, formData.fromId]);

  const handleSubmit = () => {
    if (!selectedItem || !formData.fromId || !formData.toId || formData.quantity <= 0 || formData.quantity > availableQty) return;
    
    const fromWh = warehouses.find(w => w.id === formData.fromId);
    const toWh = warehouses.find(w => w.id === formData.toId);

    const transfer: StockTransfer = {
      id: `TR-${Date.now()}`,
      date: new Date().toISOString(),
      itemId: formData.itemId,
      itemName: selectedItem.name,
      quantity: formData.quantity,
      fromLocationId: formData.fromId,
      fromLocationName: fromWh?.name || '',
      toLocationId: formData.toId,
      toLocationName: toWh?.name || '',
      status: 'completed',
      reference: `Manual Transfer ${new Date().toLocaleDateString()}`
    };

    onTransfer(transfer);
    onClose();
    setFormData({ itemId: '', fromId: '', toId: '', quantity: 0 });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إجراء مناقلة مخزنية" size="md">
      <div className="space-y-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">اختر الصنف المراد نقله</label>
          <div className="relative">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select 
              className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:border-primary"
              value={formData.itemId}
              onChange={e => setFormData({...formData, itemId: e.target.value})}
            >
              <option value="">اختر صنف...</option>
              {inventory.map(item => <option key={item.id} value={item.id}>{item.name} ({item.itemNumber})</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">من موقع</label>
            <select 
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:border-primary"
              value={formData.fromId}
              onChange={e => setFormData({...formData, fromId: e.target.value})}
            >
              <option value="">اختر مصدر...</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إلى موقع</label>
            <select 
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:border-primary"
              value={formData.toId}
              onChange={e => setFormData({...formData, toId: e.target.value})}
            >
              <option value="">اختر وجهة...</option>
              {warehouses.map(w => <option key={w.id} value={w.id} disabled={w.id === formData.fromId}>{w.name}</option>)}
            </select>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-2 hidden md:block">
             <div className="w-8 h-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-primary shadow-sm">
                <ArrowRightLeft size={14} />
             </div>
          </div>
        </div>

        {formData.fromId && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 flex items-center justify-between">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">الكمية المتوفرة في المصدر:</span>
            <span className="text-sm font-black text-blue-700 dark:text-blue-400 tabular-nums">{availableQty} وحدة</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الكمية المراد نقلها</label>
          <input 
            type="number" 
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-lg text-primary outline-none focus:border-primary"
            placeholder="0"
            value={formData.quantity || ''}
            onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
          />
          {formData.quantity > availableQty && (
            <p className="text-[9px] font-black text-rose-500 uppercase flex items-center gap-1">
              <AlertTriangle size={10} /> الكمية المطلوبة تتجاوز الرصيد المتوفر
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" fullWidth onClick={onClose}>إلغاء</Button>
          <Button 
            variant="primary" 
            fullWidth 
            icon={<ArrowRightLeft size={16}/>} 
            onClick={handleSubmit}
            disabled={!formData.itemId || !formData.fromId || !formData.toId || formData.quantity <= 0 || formData.quantity > availableQty}
          >
            تنفيذ المناقلة
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TransferStockModal;
