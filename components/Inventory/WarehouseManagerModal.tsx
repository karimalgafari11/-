
import React, { useState } from 'react';
import Modal from '../Common/Modal';
import Button from '../UI/Button';
// Fix: Renamed icon import to WarehouseIcon to avoid shadowing the Warehouse type
import { Warehouse as WarehouseIcon, MapPin, User, Hash, Activity, Save, Star } from 'lucide-react';
// Added missing type import
import { Warehouse } from '../../types';

interface WarehouseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (warehouse: any) => void; // Changed to any to allow Supabase format
}

const WarehouseManagerModal: React.FC<WarehouseManagerModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<{
    name: string;
    address: string;
    phone: string;
    is_main: boolean;
    is_active: boolean;
  }>({
    name: '',
    address: '',
    phone: '',
    is_main: false,
    is_active: true
  });

  const handleSubmit = () => {
    if (!formData.name) return;

    // إرسال البيانات بتنسيق Supabase branches
    const warehouseData = {
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      is_main: formData.is_main,
      is_active: formData.is_active,
      is_warehouse: true // تأكيد أنه مستودع
    };

    onSave(warehouseData);
    onClose();
    setFormData({ name: '', address: '', phone: '', is_main: false, is_active: true });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة موقع تخزيني جديد" size="md">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">اسم المستودع / الفرع</label>
            <div className="relative">
              {/* Fix: Using renamed icon component */}
              <WarehouseIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:border-primary transition-all"
                placeholder="مثال: مستودع جدة المركزي"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">العنوان</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:border-primary transition-all"
                placeholder="المدينة، الحي..."
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">رقم الهاتف</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:border-primary transition-all"
                placeholder="رقم التواصل"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">نوع المستودع</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFormData({ ...formData, is_main: true })}
                className={`flex-1 py-3 border-2 text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${formData.is_main ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
              >
                <Star size={12} /> رئيسي
              </button>
              <button
                onClick={() => setFormData({ ...formData, is_main: false })}
                className={`flex-1 py-3 border-2 text-[10px] font-black uppercase transition-all ${!formData.is_main ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
              >
                فرعي
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">حالة المستودع</label>
          <div className="flex gap-2">
            <button
              onClick={() => setFormData({ ...formData, is_active: true })}
              className={`flex-1 py-3 border-2 text-[10px] font-black uppercase transition-all ${formData.is_active ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
            >
              نشط
            </button>
            <button
              onClick={() => setFormData({ ...formData, is_active: false })}
              className={`flex-1 py-3 border-2 text-[10px] font-black uppercase transition-all ${!formData.is_active ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-600' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
            >
              غير نشط
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" fullWidth onClick={onClose}>إلغاء</Button>
          <Button variant="primary" fullWidth icon={<Save size={16} />} onClick={handleSubmit}>حفظ المستودع</Button>
        </div>
      </div>
    </Modal>
  );
};

export default WarehouseManagerModal;
