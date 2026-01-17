
import React from 'react';
import Modal from '../Common/Modal';
import Button from '../UI/Button';
import { Customer, FinancialEntry } from '../../types';
import { FileText, Printer, Download, CreditCard, ShoppingBag } from 'lucide-react';

interface CustomerLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  transactions: FinancialEntry[];
}

const CustomerLedgerModal: React.FC<CustomerLedgerModalProps> = ({ isOpen, onClose, customer, transactions }) => {
  if (!customer) return null;

  // فلترة المعاملات الخاصة بالعملاء
  const ledgerData = transactions.filter(t => t.account === 'عملاء' && t.description.includes(customer.companyName));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`كشف حساب العميل: ${customer.companyName}`} size="xl">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-slate-900 text-white flex flex-col justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي المديونية</span>
            <p className="text-2xl font-black tabular-nums mt-2">{(customer.balance || 0).toLocaleString()} SAR</p>
          </div>
          <div className="p-5 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 flex flex-col justify-between">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">إجمالي المسحوبات</span>
            <p className="text-2xl font-black text-blue-700 dark:text-blue-300 tabular-nums mt-2">24,500 SAR</p>
          </div>
          <div className="p-5 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 flex flex-col justify-between">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">إجمالي المدفوعات</span>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 tabular-nums mt-2">12,000 SAR</p>
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-[11px] border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-black uppercase">
              <tr>
                <th className="p-4 text-start border-e border-slate-200 dark:border-slate-700">التاريخ</th>
                <th className="p-4 text-start border-e border-slate-200 dark:border-slate-700">البيان</th>
                <th className="p-4 text-center border-e border-slate-200 dark:border-slate-700">مدين (+)</th>
                <th className="p-4 text-center border-e border-slate-200 dark:border-slate-700">دائن (-)</th>
                <th className="p-4 text-center">الرصيد</th>
              </tr>
            </thead>
            <tbody>
              {ledgerData.length > 0 ? ledgerData.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-4 font-bold text-slate-400 tabular-nums">{row.date}</td>
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      {row.amount > 0 ? <ShoppingBag size={12} className="text-blue-500" /> : <CreditCard size={12} className="text-emerald-500" />}
                      {row.description}
                    </div>
                  </td>
                  <td className="p-4 text-center font-black text-blue-600 tabular-nums">{row.amount > 0 ? row.amount.toLocaleString() : '-'}</td>
                  <td className="p-4 text-center font-black text-emerald-600 tabular-nums">{row.amount < 0 ? Math.abs(row.amount).toLocaleString() : '-'}</td>
                  <td className="p-4 text-center font-black tabular-nums">{(customer.balance || 0).toLocaleString()}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-300 font-black uppercase tracking-widest">
                    لا توجد حركات مسجلة للعميل حتى تاريخه
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" icon={<Printer size={16} />}>طباعة التقرير</Button>
          <Button variant="outline" icon={<Download size={16} />}>تصدير PDF</Button>
          <div className="flex-1"></div>
          <Button variant="ghost" onClick={onClose}>إغلاق</Button>
        </div>
      </div>
    </Modal>
  );
};

export default CustomerLedgerModal;
