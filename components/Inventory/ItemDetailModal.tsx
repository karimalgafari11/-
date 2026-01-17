
import React from 'react';
import Modal from '../Common/Modal';
import { Package, MapPin, Warehouse as WarehouseIcon } from 'lucide-react';
import { InventoryItem } from '../../types';

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ isOpen, onClose, item }) => {
  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="بيانات الصنف وتوزيعه الجغرافي" size="lg">
      <div className="space-y-8 animate-in fade-in duration-300">
        <div className="flex gap-6 items-center p-6 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
          <div className="w-20 h-20 bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
            <Package size={32}/>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{item.name}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">{item.itemNumber}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <MapPin size={12}/> أماكن تواجد المخزون الفعلي
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(item.warehouses || []).map((w, idx) => (
              <div key={idx} className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 flex items-center justify-center">
                    <WarehouseIcon size={18}/>
                  </div>
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300">{w.name}</span>
                </div>
                <span className="text-lg font-black tabular-nums text-blue-600">
                  {w.quantity} <span className="text-[9px] text-slate-400 font-bold">وحدة</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ItemDetailModal;
