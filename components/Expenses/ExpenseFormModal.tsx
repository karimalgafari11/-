
import React from 'react';
import Modal from '../Common/Modal';
import Button from '../UI/Button';
import { useApp } from '../../context/AppContext';
import { useFinance } from '../../context/FinanceContext';
import { useExpenseForm } from '../../hooks/useExpenseForm';
import { useCurrency, DEFAULT_EXPENSE_CURRENCY } from '../../hooks/useCurrency';
import { FileText, Save, Calculator, Wallet, Tag, Calendar, Coins } from 'lucide-react';
import { Expense } from '../../types';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => void;
}

const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({ isOpen, onClose, onSave }) => {
  const { showNotification } = useApp();
  const { expenseCategories } = useFinance();
  const { formData, calculations, updateField, resetForm } = useExpenseForm();
  const { activeCurrencies, getCurrency } = useCurrency();

  // إضافة حقل العملة للنموذج
  const [currency, setCurrency] = React.useState(DEFAULT_EXPENSE_CURRENCY);
  const selectedCurrency = getCurrency(currency);

  const handleSubmit = () => {
    if (!formData.description || formData.amount <= 0 || !formData.category) {
      showNotification('يرجى إكمال كافة البيانات المطلوبة', 'error');
      return;
    }

    const expense: Expense = {
      id: `EXP-${Date.now()}`,
      expenseNumber: `EX-${Math.floor(1000 + Math.random() * 9000)}`,
      date: formData.date,
      category: formData.category,
      description: formData.description,
      amount: formData.amount,
      tax: calculations.tax,
      total: calculations.total,
      paymentMethod: formData.paymentMethod,
      status: 'paid',
      currency: currency
    };

    onSave(expense);
    resetForm();
    setCurrency(DEFAULT_EXPENSE_CURRENCY);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة مصروف جديد / سند صرف" size="md">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">التصنيف</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <select
                className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:border-primary appearance-none"
                value={formData.category}
                onChange={e => updateField('category', e.target.value)}
              >
                <option value="">-- اختر التصنيف --</option>
                {expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تاريخ المصروف</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="date"
                className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:border-primary transition-all"
                value={formData.date}
                onChange={e => updateField('date', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">وصف المصروف / البيان</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 text-slate-400" size={14} />
            <textarea
              className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:border-primary min-h-[80px]"
              placeholder="مثال: فاتورة كهرباء شهر أكتوبر - الفرع الرئيسي"
              value={formData.description}
              onChange={e => updateField('description', e.target.value)}
            />
          </div>
        </div>

        {/* حقل العملة */}
        <div className="bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20 border border-rose-200 dark:border-rose-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins size={18} className="text-rose-600 dark:text-rose-400" />
              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                عملة المصروف
              </span>
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-rose-500 outline-none"
            >
              {activeCurrencies.map(curr => (
                <option key={curr.code} value={curr.code}>
                  {curr.nameAr} ({curr.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المبلغ ({selectedCurrency?.symbol})</label>
            <div className="relative">
              <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={14} />
              <input
                type="number"
                className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-lg outline-none focus:border-primary"
                value={formData.amount || ''}
                onChange={e => updateField('amount', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">وسيلة السداد</label>
            <div className="flex gap-1 p-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-[46px]">
              {['cash', 'bank'].map(m => (
                <button key={m} onClick={() => updateField('paymentMethod', m)} className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-black transition-all ${formData.paymentMethod === m ? 'bg-primary text-white shadow-sm' : 'text-slate-400 uppercase'}`}>
                  {m === 'cash' ? <Wallet size={12} /> : <Calculator size={12} />} {m === 'cash' ? 'نقدي' : 'بنكي'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-900 rounded-xl space-y-3 shadow-2xl">
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary"
                checked={formData.includeTax}
                onChange={e => updateField('includeTax', e.target.checked)}
              />
              <span className="text-[10px] font-black text-slate-400 uppercase group-hover:text-white transition-colors">إدراج ضريبة القيمة المضافة (15%)</span>
            </label>
          </div>
          <div className="flex justify-between text-[10px] font-black text-slate-400 border-b border-white/5 pb-2">
            <span>قيمة الضريبة</span>
            <span className="text-emerald-500 tabular-nums">{calculations.tax.toLocaleString()} {selectedCurrency?.symbol}</span>
          </div>
          <div className="flex justify-between text-lg font-black text-white pt-1">
            <span className="text-rose-400 uppercase tracking-tighter">إجمالي المصروف</span>
            <span className="tabular-nums">{calculations.total.toLocaleString()} {selectedCurrency?.symbol}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose}>إلغاء</Button>
          <Button variant="danger" fullWidth icon={<Save size={16} />} onClick={handleSubmit}>حفظ المصروف وترحيله</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExpenseFormModal;
