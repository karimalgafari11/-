
import React, { useState, useMemo } from 'react';
import Modal from '../Common/Modal';
import Button from '../UI/Button';
import { usePurchases } from '../../context/PurchasesContext';
import {
  Wallet, Calendar, User, Hash, Calculator,
  CheckCircle2, CreditCard, Landmark, Save, Truck,
  AlertCircle // Added missing AlertCircle import
} from 'lucide-react';
import { SupplierPayment } from '../../types';

interface SupplierPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: SupplierPayment) => void;
}

const SupplierPaymentModal: React.FC<SupplierPaymentModalProps> = ({ isOpen, onClose, onSave }) => {
  const { suppliers } = usePurchases();
  const [formData, setFormData] = useState({
    supplierId: '',
    amount: 0,
    paymentMethod: 'cash' as 'cash' | 'bank' | 'check',
    reference: '',
    notes: ''
  });

  const selectedSupplier = useMemo(() => suppliers.find(s => s.id === formData.supplierId), [formData.supplierId, suppliers]);

  const handleSubmit = () => {
    if (!formData.supplierId || formData.amount <= 0) return;

    const payment: SupplierPayment = {
      id: `PMT-${Date.now()}`,
      voucherNumber: `VCH-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierId: formData.supplierId,
      supplierName: selectedSupplier?.companyName || '',
      date: new Date().toISOString().split('T')[0],
      amount: formData.amount,
      paymentMethod: formData.paymentMethod,
      reference: formData.reference,
      notes: formData.notes
    };

    onSave(payment);
    onClose();
    setFormData({ supplierId: '', amount: 0, paymentMethod: 'cash', reference: '', notes: '' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إصدار سند صرف مورد (سداد مديونية)" size="md">
      <div className="space-y-6">
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500 text-white rounded-lg flex items-center justify-center shadow-lg shadow-rose-200">
              <Wallet size={20} />
            </div>
            <div>
              <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest">الرصيد القائم للمورد</h4>
              <p className="text-xl font-black text-rose-600 tabular-nums">
                {selectedSupplier ? selectedSupplier.balance.toLocaleString() : '0.00'} SAR
              </p>
            </div>
          </div>
          <AlertCircle size={24} className="text-rose-200" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المورد</label>
            <div className="relative">
              <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <select
                className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:border-primary appearance-none"
                value={formData.supplierId}
                onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
              >
                <option value="">-- اختر المورد --</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المبلغ المدفوع</label>
            <div className="relative">
              <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={14} />
              <input
                type="number"
                className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-black text-xs outline-none focus:border-primary"
                placeholder="0.00"
                value={formData.amount || ''}
                onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">وسيلة الدفع</label>
          <div className="flex gap-2">
            {[
              { id: 'cash', icon: Wallet, label: 'نقدي' },
              { id: 'bank', icon: Landmark, label: 'تحويل بنكي' },
              { id: 'check', icon: CreditCard, label: 'شيك' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setFormData({ ...formData, paymentMethod: m.id as any })}
                className={`flex-1 flex flex-col items-center gap-2 p-4 border-2 transition-all ${formData.paymentMethod === m.id ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-slate-400'}`}
              >
                <m.icon size={20} />
                <span className="text-[9px] font-black uppercase">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">رقم المرجع / الملاحظات</label>
          <textarea
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none min-h-[80px]"
            placeholder="مثال: سداد فاتورة رقم INV-990 أو رقم التحويل..."
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" fullWidth onClick={onClose}>إلغاء</Button>
          <Button variant="success" fullWidth icon={<Save size={16} />} onClick={handleSubmit} disabled={!formData.supplierId || formData.amount <= 0}>
            حفظ وترحيل السند
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SupplierPaymentModal;
