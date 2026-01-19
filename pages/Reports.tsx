
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Button from '../components/UI/Button';
import ReportTabs from '../components/Reports/ReportTabs';
import ProfitLossReport from '../components/Reports/ProfitLossReport';
import BalanceSheetReport from '../components/Reports/BalanceSheetReport';
import CashFlowReport from '../components/Reports/CashFlowReport';
import SalesReport from '../components/Reports/SalesReport';
import PurchasesReport from '../components/Reports/PurchasesReport';
import InventoryReport from '../components/Reports/InventoryReport';
import ReceivablesReport from '../components/Reports/ReceivablesReport';
import PayablesReport from '../components/Reports/PayablesReport';
import VATReport from '../components/Reports/VATReport';
import TrialBalanceReport from '../components/Reports/TrialBalanceReport';
import CustomerStatementReport from '../components/Reports/CustomerStatementReport';
import DebtReport from '../components/Reports/DebtReport';
import FxGainLossReport from '../components/Reports/FxGainLossReport';
import {
  TrendingUp, Scale, DollarSign, ShoppingCart, ShoppingBag,
  Package, UserCheck, Users, Receipt, FileDown, Printer, FileSpreadsheet,
  User, CreditCard, Coins
} from 'lucide-react';

const Reports: React.FC = () => {
  const { t, exportData, theme } = useApp();
  const [activeTab, setActiveTab] = useState('debts');

  const reportTabs = [
    { id: 'trial', label: 'ميزان المراجعة', icon: Scale },
    { id: 'debts', label: 'تقرير الديون', icon: CreditCard },
    { id: 'statement', label: 'كشف حساب عميل', icon: User },
    { id: 'fx', label: 'فروق العملات', icon: Coins },
    { id: 'pnl', label: 'الأرباح والخسائر', icon: TrendingUp },
    { id: 'balance', label: 'الميزانية العمومية', icon: Scale },
    { id: 'cashflow', label: 'التدفقات النقدية', icon: DollarSign },
    { id: 'sales', label: 'المبيعات', icon: ShoppingCart },
    { id: 'purchases', label: 'المشتريات', icon: ShoppingBag },
    { id: 'inventory', label: 'المخزون', icon: Package },
    { id: 'receivables', label: 'الذمم المدينة', icon: UserCheck },
    { id: 'payables', label: 'الذمم الدائنة', icon: Users },
    { id: 'vat', label: 'ضريبة القيمة المضافة', icon: Receipt }
  ];

  const renderReport = () => {
    switch (activeTab) {
      case 'trial':
        return <TrialBalanceReport />;
      case 'debts':
        return <DebtReport />;
      case 'statement':
        return <CustomerStatementReport />;
      case 'fx':
        return <FxGainLossReport />;
      case 'pnl':
        return <ProfitLossReport />;
      case 'balance':
        return <BalanceSheetReport />;
      case 'cashflow':
        return <CashFlowReport />;
      case 'sales':
        return <SalesReport />;
      case 'purchases':
        return <PurchasesReport />;
      case 'inventory':
        return <InventoryReport />;
      case 'receivables':
        return <ReceivablesReport />;
      case 'payables':
        return <PayablesReport />;
      case 'vat':
        return <VATReport />;
      default:
        return <DebtReport />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-1">
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
            {t('reports')}
          </h1>
          <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
            التقارير المحاسبية الشاملة - مركز التحليل المالي والديون
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
        </div>
      </div>

      {/* Tabs Navigation */}
      <ReportTabs
        tabs={reportTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Report Content */}
      <div className="animate-in fade-in duration-300">
        {renderReport()}
      </div>

      {/* Footer Info */}
      <div className={`p-4 rounded-xl shadow-sm border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
        <div className={`flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
          <div className="flex items-center gap-4">
            <span>📊 نظام التقارير المحاسبية المتكامل</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">جميع البيانات محدثة في الوقت الفعلي</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Alzhra Finance Reports Engine v2.0</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
