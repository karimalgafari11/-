
import React, { useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import ExpenseHeader from '../components/Expenses/ExpenseHeader';
import ExpenseToolbar from '../components/Expenses/ExpenseToolbar';
import ExpenseStats from '../components/Expenses/ExpenseStats';
import ExpenseExcelGrid from '../components/Expenses/ExpenseExcelGrid';
import ExpenseFormModal from '../components/Expenses/ExpenseFormModal';
import ExpenseCategoryModal from '../components/Expenses/ExpenseCategoryModal';
import RecurringExpenseModal from '../components/Expenses/RecurringExpenseModal';
import { Layers, Repeat, FileDown } from 'lucide-react';

const Expenses: React.FC = () => {
  const { 
    stats, filteredExpenses, searchQuery, setSearchQuery, 
    handleDelete, addExpense, exportData, showNotification 
  } = useExpenses();
  
  const [activeModal, setActiveModal] = useState<'form' | 'category' | 'recurring' | null>(null);

  const closeModal = () => setActiveModal(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 select-none">
      {/* 1. Header & Actions Layer */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <ExpenseHeader />
        <ExpenseToolbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenForm={() => setActiveModal('form')}
          onOpenCategories={() => setActiveModal('category')}
          onOpenRecurring={() => setActiveModal('recurring')}
          onExport={exportData}
        />
      </div>

      {/* 2. Metrics Layer */}
      <ExpenseStats stats={stats} />

      {/* 3. Mobile Shortcuts */}
      <div className="sm:hidden grid grid-cols-3 gap-2">
         <button onClick={() => setActiveModal('category')} className="py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[9px] font-black uppercase flex flex-col items-center gap-1">
            <Layers size={14} className="text-rose-500"/> التصنيفات
         </button>
         <button onClick={() => setActiveModal('recurring')} className="py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[9px] font-black uppercase flex flex-col items-center gap-1">
            <Repeat size={14} className="text-rose-500"/> المتكررة
         </button>
         <button onClick={exportData} className="py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[9px] font-black uppercase flex flex-col items-center gap-1">
            <FileDown size={14} className="text-rose-500"/> التصدير
         </button>
      </div>

      {/* 4. Data Layer */}
      <ExpenseExcelGrid 
        data={filteredExpenses} 
        onDelete={handleDelete}
      />

      {/* 5. Modals Overlay Layer */}
      <ExpenseFormModal 
        isOpen={activeModal === 'form'} 
        onClose={closeModal} 
        onSave={(expense) => {
          addExpense(expense);
          showNotification('تم ترحيل المصروف للسجلات المالية');
        }} 
      />

      <ExpenseCategoryModal 
        isOpen={activeModal === 'category'} 
        onClose={closeModal} 
      />

      <RecurringExpenseModal 
        isOpen={activeModal === 'recurring'} 
        onClose={closeModal} 
      />
    </div>
  );
};

export default React.memo(Expenses);
