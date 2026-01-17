
import React, { useState } from 'react';
import Modal from '../Common/Modal';
import Button from '../UI/Button';
import { useApp } from '../../context/AppContext';
import { useFinance } from '../../context/FinanceContext';
import { Calendar, Repeat, Calculator, Tag, FileText, Save, Clock } from 'lucide-react';
import { RecurringExpense } from '../../types';

interface RecurringExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RecurringExpenseModal: React.FC<RecurringExpenseModalProps> = ({ isOpen, onClose }) => {
  const { showNotification } = useApp();
  const { recurringExpenses, addRecurringExpense, deleteRecurringExpense, expenseCategories } = useFinance();
  const [formData, setFormData] = useState<Partial<RecurringExpense>>({
    description: '',
    amount: 0,
    category: '',
    frequency: 'monthly',
    nextDueDate: new Date().toISOString().split('T')[0],
    isActive: true
  });

  const handleSubmit = () => {
    if (!formData.description || !formData.amount || !formData.category) {
      showNotification('يرجى ملء كافة البيانات الأساسية', 'error');
      return;
    }
    const re: RecurringExpense = {
      ...formData as RecurringExpense,
      id: `REC-${Date.now()}`
    };
    addRecurringExpense(re);
    showNotification('تمت جدولة المصروف المتكرر بنجاح');
    setFormData({ description: '', amount: 0, category: '', frequency: 'monthly', nextDueDate: new Date().toISOString().split('T')[0], isActive: true });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="جدولة مصروفات متكررة" size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">إعداد مصروف جديد</h4>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500">وصف المصروف</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:border-rose-500"
                  placeholder="مثل: إيجار المكتب الشهري"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500">المبلغ</label>
                <div className="relative">
                  <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500" size={14} />
                  <input
                    type="number"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-xs outline-none focus:border-rose-500"
                    value={formData.amount || ''}
                    onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500">التكرار</label>
                <div className="relative">
                  <Repeat className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <select
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:border-rose-500 appearance-none"
                    value={formData.frequency}
                    onChange={e => setFormData({ ...formData, frequency: e.target.value as any })}
                  >
                    <option value="daily">يومي</option>
                    <option value="weekly">أسبوعي</option>
                    <option value="monthly">شهري</option>
                    <option value="yearly">سنوي</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500">التصنيف</label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:border-rose-500 appearance-none"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">-- اختر --</option>
                  {expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500">تاريخ الاستحقاق القادم</label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:border-rose-500"
                  value={formData.nextDueDate}
                  onChange={e => setFormData({ ...formData, nextDueDate: e.target.value })}
                />
              </div>
            </div>

            <Button variant="danger" fullWidth icon={<Save size={16} />} onClick={handleSubmit}>حفظ الجدولة</Button>
          </div>

          {/* List Section */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">المصروفات المجدولة ({recurringExpenses.length})</h4>
            <div className="max-h-[350px] overflow-y-auto custom-scrollbar space-y-2">
              {recurringExpenses.length > 0 ? recurringExpenses.map(re => (
                <div key={re.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700">
                      <Clock size={14} className="text-rose-500" />
                      <span className="text-[7px] font-black uppercase text-slate-400">{re.frequency}</span>
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-slate-800 dark:text-slate-100">{re.description}</p>
                      <p className="text-[9px] font-bold text-rose-500 tabular-nums">{re.amount.toLocaleString()} SAR</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteRecurringExpense(re.id)}
                    className="p-2 text-slate-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Repeat size={14} />
                  </button>
                </div>
              )) : (
                <div className="py-20 text-center opacity-20">
                  <Repeat size={32} className="mx-auto mb-2" />
                  <p className="text-[9px] font-black uppercase">لا توجد مصروفات مجدولة</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RecurringExpenseModal;
