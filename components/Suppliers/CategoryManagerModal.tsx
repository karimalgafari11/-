
import React, { useState } from 'react';
import Modal from '../Common/Modal';
import Button from '../UI/Button';
import { PieChart, Plus, Trash2, Tag, Save } from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onAdd: (category: string) => void;
}

const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ isOpen, onClose, categories, onAdd }) => {
  const [newCat, setNewCat] = useState('');

  const handleAdd = () => {
    if (!newCat.trim()) return;
    onAdd(newCat.trim());
    setNewCat('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إدارة تصنيفات الموردين" size="md">
      <div className="space-y-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إضافة تصنيف جديد</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:border-primary transition-all"
                placeholder="اسم التصنيف (مثال: قطع غيار أصلية)"
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
              />
            </div>
            <Button variant="primary" icon={<Plus size={16}/>} onClick={handleAdd}>إضافة</Button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">التصنيفات الحالية</label>
          <div className="grid grid-cols-1 gap-2">
            {categories.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center">
                    <PieChart size={14} />
                  </div>
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300">{cat}</span>
                </div>
                <button className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <Button variant="ghost" fullWidth onClick={onClose}>إغلاق</Button>
        </div>
      </div>
    </Modal>
  );
};

export default CategoryManagerModal;
