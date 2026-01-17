
import React from 'react';
import { Supplier, Warehouse } from '../../../types';
import { Wallet, Clock } from 'lucide-react';

interface PurchaseFormHeaderProps {
  suppliers: Supplier[];
  warehouses: Warehouse[];
  supplierId: string;
  setSupplierId: (id: string) => void;
  warehouseId: string;
  setWarehouseId: (id: string) => void;
  reference: string;
  setReference: (ref: string) => void;
  paymentMethod: 'cash' | 'credit';
  setPaymentMethod: (m: 'cash' | 'credit') => void;
}

const PurchaseFormHeader: React.FC<PurchaseFormHeaderProps> = ({
  suppliers, warehouses, supplierId, setSupplierId, 
  warehouseId, setWarehouseId, reference, setReference, 
  paymentMethod, setPaymentMethod
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-900/50 p-5 border border-slate-200 dark:border-slate-800 shadow-inner">
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المورد الرئيسي</label>
        <select 
          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:border-primary appearance-none"
          value={supplierId}
          onChange={e => setSupplierId(e.target.value)}
        >
          <option value="">-- اختر المورد --</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName}</option>)}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">مستودع الاستلام</label>
        <select 
          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:border-primary appearance-none"
          value={warehouseId}
          onChange={e => setWarehouseId(e.target.value)}
        >
          <option value="">-- اختر المستودع --</option>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">رقم المرجع</label>
        <input 
          type="text" 
          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:border-primary"
          placeholder="رقم الفاتورة الورقية"
          value={reference}
          onChange={e => setReference(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">آلية السداد</label>
        <div className="flex gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 h-[42px]">
          {['cash', 'credit'].map(m => (
            <button key={m} onClick={() => setPaymentMethod(m as any)} className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-black transition-all ${paymentMethod === m ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 uppercase'}`}>
              {m === 'cash' ? <Wallet size={12}/> : <Clock size={12}/>} {m === 'cash' ? 'نقدي' : 'آجل'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PurchaseFormHeader;
