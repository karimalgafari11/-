import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Button from '../components/UI/Button';
import AccountingTabs from '../components/Accounting/AccountingTabs';
import AccountingSummaryCards from '../components/Accounting/AccountingSummaryCards';
import JournalEntry from '../components/Accounting/JournalEntry';
import TrialBalance from '../components/Accounting/TrialBalance';
import ChartOfAccounts from '../components/Accounting/ChartOfAccounts';
import GeneralLedger from '../components/Accounting/GeneralLedger';
import ClosingAccounts from '../components/Accounting/ClosingAccounts';
import IncomeStatement from '../components/Accounting/IncomeStatement';
import BalanceSheet from '../components/Accounting/BalanceSheet';
import AddEntryModal from '../components/Accounting/AddEntryModal';
import {
   Layers, FileText, BarChart3, Plus, Printer, FileSpreadsheet, FileDown,
   BookOpen, Calculator
} from 'lucide-react';

const Accounting: React.FC = () => {
   const { t, exportData } = useApp();
   const [activeTab, setActiveTab] = useState('journal');
   const [isModalOpen, setIsModalOpen] = useState(false);

   const accountingTabs = [
      { id: 'journal', label: 'دفتر اليومية', icon: FileText },
      { id: 'ledger', label: 'دفتر الأستاذ', icon: BookOpen },
      { id: 'trial', label: 'ميزان المراجعة', icon: BarChart3 },
      { id: 'income', label: 'قائمة الدخل', icon: FileSpreadsheet },
      { id: 'balance', label: 'الميزانية العمومية', icon: Layers },
      { id: 'closing', label: 'الحسابات الختامية', icon: Calculator },
      { id: 'chart', label: 'دليل الحسابات', icon: Layers }
   ];

   const renderContent = () => {
      switch (activeTab) {
         case 'journal':
            return <JournalEntry />;
         case 'ledger':
            return <GeneralLedger />;
         case 'trial':
            return <TrialBalance />;
         case 'income':
            return <IncomeStatement />;
         case 'balance':
            return <BalanceSheet />;
         case 'closing':
            return <ClosingAccounts />;
         case 'chart':
            return <ChartOfAccounts />;
         default:
            return <JournalEntry />;
      }
   };

   return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
         {/* Header */}
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-1">
            <div>
               <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                  {t('accounting')}
               </h1>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                  النظام المحاسبي المتكامل - دفتر اليومية والأستاذ والحسابات الختامية
               </p>
            </div>

            <div className="flex items-center gap-2">
               <Button
                  variant="outline"
                  size="sm"
                  icon={<Printer size={14} />}
                  onClick={() => window.print()}
               >
                  طباعة
               </Button>
               <Button
                  variant="outline"
                  size="sm"
                  icon={<FileSpreadsheet size={14} />}
                  onClick={exportData}
               >
                  تصدير Excel
               </Button>
               <Button
                  variant="primary"
                  size="sm"
                  icon={<FileDown size={14} />}
                  onClick={exportData}
               >
                  تصدير PDF
               </Button>
               <Button
                  variant="success"
                  size="sm"
                  icon={<Plus size={14} />}
                  onClick={() => setIsModalOpen(true)}
               >
                  قيد جديد
               </Button>
            </div>
         </div>

         {/* Summary Cards */}
         <AccountingSummaryCards />

         {/* Tabs Navigation */}
         <AccountingTabs
            tabs={accountingTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
         />

         {/* Content */}
         <div className="animate-in fade-in duration-300 min-h-[500px]">
            {renderContent()}
         </div>

         {/* Footer Info */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-bold text-slate-500">
               <div className="flex items-center gap-4">
                  <span>📊 النظام المحاسبي المتكامل</span>
                  <span className="hidden md:inline">•</span>
                  <span className="hidden md:inline">جميع البيانات محدثة في الوقت الفعلي</span>
               </div>
               <div className="flex items-center gap-2">
                  <span>Alzhra Accounting Engine v2.0</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
               </div>
            </div>
         </div>

         <AddEntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
   );
};

export default Accounting;
