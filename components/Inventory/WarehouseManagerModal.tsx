
import React, { useState } from 'react';
import Modal from '../Common/Modal';
import Button from '../UI/Button';
// Fix: Renamed icon import to WarehouseIcon to avoid shadowing the Warehouse type
import { Warehouse as WarehouseIcon, MapPin, User, Hash, Activity, Save } from 'lucide-react';
// Added missing type import
import { Warehouse } from '../../types';

interface WarehouseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (warehouse: Warehouse) => void;
}

const WarehouseManagerModal: React.FC<WarehouseManagerModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Warehouse>>({
    name: '',
    location: '',
    manager: '',
    capacity: 0,
    status: 'active'
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.location) return;
    const warehouse: Warehouse = {
      ...formData as Warehouse,
      id: `WH-${Date.now()}`,
      contactNumber: '-'
    };
    onSave(warehouse);
    onClose();
    setFormData({ name: '', location: '', manager: '', capacity: 0, status: 'active' });
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
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الموقع الجغرافي</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:border-primary transition-all"
                placeholder="المدينة، الحي..."
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المسؤول المباشر</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:border-primary transition-all"
                placeholder="اسم أمين المستودع"
                value={formData.manager}
                onChange={e => setFormData({...formData, manager: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">السعة التخزينية (وحدة)</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="number" 
                className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:border-primary transition-all"
                value={formData.capacity}
                onChange={e => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">حالة الموقع</label>
          <div className="flex gap-2">
            {['active', 'full', 'maintenance'].map((status) => (
              <button
                key={status}
                onClick={() => setFormData({...formData, status: status as any})}
                className={`flex-1 py-3 border-2 text-[10px] font-black uppercase transition-all ${formData.status === status ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
              >
                {status === 'active' ? 'نشط' : status === 'full' ? 'مكتمل' : 'صيانة'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" fullWidth onClick={onClose}>إلغاء</Button>
          <Button variant="primary" fullWidth icon={<Save size={16}/>} onClick={handleSubmit}>حفظ الموقع</Button>
        </div>
      </div>
    </Modal>
  );
};

export default WarehouseManagerModal;
