
import React, { useState } from 'react';
import Modal from '../Common/Modal';
import Button from '../UI/Button';
import { Users, Plus, Trash2, Tag, ChevronLeft } from 'lucide-react';

interface CustomerCategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onAdd: (category: string) => void;
}

const CustomerCategoryManagerModal: React.FC<CustomerCategoryManagerModalProps> = ({ isOpen, onClose, categories, onAdd }) => {
  const [newCat, setNewCat] = useState('');

  const handleAdd = () => {
    if (!newCat.trim()) return;
    onAdd(newCat.trim());
    setNewCat('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إدارة فئات العملاء" size="md">
      <div className="space-y-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إضافة فئة جديدة</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:border-primary transition-all"
                placeholder="اسم الفئة (مثال: عملاء الجملة المتميزين)"
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
              />
            </div>
            <Button variant="primary" icon={<Plus size={16}/>} onClick={handleAdd}>إضافة</Button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الفئات الحالية المعتمدة</label>
          <div className="grid grid-cols-1 gap-2">
            {categories.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group hover:border-blue-500 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                    <Users size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-200 block">{cat}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">مستوى الخصم الافتراضي: 0%</span>
                  </div>
                </div>
                <button className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <Button variant="ghost" fullWidth onClick={onClose}>إغلاق النافذة</Button>
        </div>
      </div>
    </Modal>
  );
};

export default CustomerCategoryManagerModal;
