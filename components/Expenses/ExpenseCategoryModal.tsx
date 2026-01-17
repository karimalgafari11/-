
import React, { useState } from 'react';
import Modal from '../Common/Modal';
import Button from '../UI/Button';
import { useApp } from '../../context/AppContext';
import { useFinance } from '../../context/FinanceContext';
import { Tag, Plus, Trash2, Layers } from 'lucide-react';

interface ExpenseCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExpenseCategoryModal: React.FC<ExpenseCategoryModalProps> = ({ isOpen, onClose }) => {
  const { showNotification } = useApp();
  const { expenseCategories, addExpenseCategory, deleteExpenseCategory } = useFinance();
  const [newCat, setNewCat] = useState('');

  const handleAdd = () => {
    if (!newCat.trim()) return;
    if (expenseCategories.includes(newCat.trim())) {
      showNotification('هذا التصنيف موجود مسبقاً', 'error');
      return;
    }
    addExpenseCategory(newCat.trim());
    setNewCat('');
    showNotification('تمت إضافة التصنيف بنجاح');
  };

  const handleDelete = (cat: string) => {
    if (window.confirm(`هل أنت متأكد من حذف تصنيف "${cat}"؟`)) {
      deleteExpenseCategory(cat);
      showNotification('تم حذف التصنيف', 'info');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إدارة تصنيفات المصروفات" size="md">
      <div className="space-y-6">
        <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-xl flex items-center gap-3">
          <Layers className="text-rose-600" size={24} />
          <div>
            <h4 className="text-xs font-black text-rose-800 dark:text-rose-300 uppercase tracking-widest">تصنيفات المصاريف</h4>
            <p className="text-[10px] text-rose-600 font-bold">تساعدك التصنيفات في تتبع مراكز التكلفة بدقة.</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إضافة تصنيف جديد</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:border-rose-500 transition-all"
                placeholder="مثال: اشتراكات سحابية، أثاث مكتبي..."
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <Button variant="danger" icon={<Plus size={16} />} onClick={handleAdd}>إضافة</Button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">التصنيفات الحالية ({expenseCategories.length})</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {expenseCategories.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group hover:border-rose-500 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-rose-50 dark:bg-rose-900/20 text-rose-600 flex items-center justify-center">
                    <Tag size={14} />
                  </div>
                  <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">{cat}</span>
                </div>
                <button
                  onClick={() => handleDelete(cat)}
                  className="p-2 text-slate-300 hover:text-rose-600 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" fullWidth onClick={onClose}>إغلاق النافذة</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExpenseCategoryModal;
