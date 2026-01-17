
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSales } from '../context/SalesContext';
import DataGrid from '../components/Grid/DataGrid';
import Modal from '../components/Common/Modal';
import Button from '../components/UI/Button';
import StatsCard from '../components/UI/StatsCard';
import {
  Plus, User, DollarSign, Clock, CheckCircle2, AlertCircle, FileText, Coins
} from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency';
import { Invoice } from '../types/invoices';

const Invoices: React.FC = () => {
  const { t } = useApp();
  const { invoices, addInvoice } = useSales();
  const { activeCurrencies, DEFAULT_SALE_CURRENCY } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    client: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    amount: '',
    currency: DEFAULT_SALE_CURRENCY,
    status: 'pending'
  });

  const columns = [
    { key: 'id', label: 'كود الفاتورة', width: 120 },
    { key: 'client', label: 'الجهة / العميل' },
    { key: 'date', label: 'تاريخ الإصدار', width: 110 },
    { key: 'dueDate', label: 'تاريخ الاستحقاق', width: 110 },
    {
      key: 'amount',
      label: 'القيمة الإجمالية',
      width: 150,
      render: (row: Invoice) => (
        <span className="font-bold tabular-nums text-emerald-600">
          {row.amount.toLocaleString()} {row.currency === 'YER' ? '﷼' : row.currency === 'SAR' ? 'ر.س' : row.currency || 'ر.س'}
        </span>
      )
    },
  ];

  const handleSaveInvoice = () => {
    if (!newInvoice.client || !newInvoice.amount) return;
    addInvoice({
      id: `INV-${Date.now().toString().slice(-6)}`,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      customerName: newInvoice.client,
      customerId: 'CUS-GUEST',
      date: newInvoice.date,
      dueDate: newInvoice.dueDate || newInvoice.date,
      notes: `فاتورة مبيعات - ${newInvoice.client}`,
      amount: parseFloat(newInvoice.amount),
      currency: newInvoice.currency,
      status: 'pending',
    });
    setIsModalOpen(false);
    setNewInvoice({ client: '', date: new Date().toISOString().split('T')[0], dueDate: '', amount: '', currency: DEFAULT_SALE_CURRENCY, status: 'pending' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">الفواتير والذمم</h1>
          <p className="text-[10px] text-gray-400 dark:text-gray-400 font-bold uppercase tracking-widest mt-1">إدارة المبيعات والتحصيل</p>
        </div>
        <Button
          icon={<Plus size={16} />}
          onClick={() => setIsModalOpen(true)}
          size="md"
        >
          إنشاء فاتورة ضريبية
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="بانتظار التحصيل" value="23,400" count={5} trend="+5.2%" isUp={true} icon={Clock} color="text-amber-600" bg="bg-amber-100" variant="warning" />
        <StatsCard label="فواتير متأخرة" value="15,200" count={2} trend="+1.2%" isUp={false} icon={AlertCircle} color="text-rose-600" bg="bg-rose-100" variant="expense" />
        <StatsCard label="المحصلة فعلياً" value="48,900" count={12} trend="+14.8%" isUp={true} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-100" variant="profit" />
        <StatsCard label="إجمالي الفواتير" value="87,500" count={19} trend="+8.4%" isUp={true} icon={FileText} color="text-blue-600" bg="bg-blue-100" variant="revenue" />
      </div>

      <div className="h-[calc(100vh-340px)] min-h-[450px]">
        <DataGrid
          title="سجل الفواتير الصادرة"
          headerColor="bg-blue-900"
          columns={columns}
          data={invoices}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="بيانات الفاتورة الجديدة" size="md">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-gray-400">الاسم التجاري للعميل</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text" placeholder="مثال: شركة الخليج للتوريدات"
                  className="w-full pl-9 pr-4 py-3.5 rounded-xl border border-gray-100 dark:border-indigo-900/30 dark:bg-slate-800 dark:text-white font-bold text-xs outline-none focus:border-primary transition-all shadow-inner"
                  value={newInvoice.client}
                  onChange={e => setNewInvoice({ ...newInvoice, client: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-gray-400">عملة الفاتورة</label>
              <div className="relative">
                <Coins size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" />
                <select
                  className="w-full pl-9 pr-4 py-3.5 rounded-xl border border-gray-100 dark:border-indigo-900/30 dark:bg-slate-800 dark:text-white font-bold text-xs outline-none focus:border-primary transition-all shadow-inner appearance-none"
                  value={newInvoice.currency}
                  onChange={e => setNewInvoice({ ...newInvoice, currency: e.target.value })}
                >
                  {activeCurrencies.map(c => (
                    <option key={c.code} value={c.code}>{c.nameAr} ({c.symbol})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <label className="text-[9px] font-black uppercase text-gray-400">المبلغ الإجمالي (شامل الضريبة)</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                <input
                  type="number" placeholder="0.00"
                  className="w-full pl-9 pr-4 py-3.5 rounded-xl border border-gray-100 dark:border-indigo-900/30 dark:bg-slate-800 dark:text-white font-black text-xs outline-none focus:border-primary transition-all shadow-inner"
                  value={newInvoice.amount}
                  onChange={e => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-indigo-900/30 space-y-2">
              <label className="text-[9px] font-black uppercase text-gray-400">تاريخ الإصدار</label>
              <input
                type="date"
                className="w-full bg-transparent font-bold text-[11px] outline-none border-b border-gray-200 dark:border-indigo-800/30 py-1"
                value={newInvoice.date}
                onChange={e => setNewInvoice({ ...newInvoice, date: e.target.value })}
              />
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-indigo-900/30 space-y-2">
              <label className="text-[9px] font-black uppercase text-gray-400">تاريخ الاستحقاق</label>
              <input
                type="date"
                className="w-full bg-transparent font-bold text-[11px] outline-none border-b border-gray-200 dark:border-indigo-800/30 py-1"
                value={newInvoice.dueDate}
                onChange={e => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <Button variant="outline" fullWidth onClick={() => setIsModalOpen(false)}>إلغاء</Button>
            <Button variant="primary" className="flex-[2]" onClick={handleSaveInvoice}>إصدار وترحيل الفاتورة</Button>
          </div>
        </div>
      </Modal>
    </div >
  );
};

export default Invoices;
