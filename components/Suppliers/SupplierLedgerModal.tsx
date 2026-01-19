
import React from 'react';
import Modal from '../Common/Modal';
import Button from '../UI/Button';
import { Supplier, FinancialEntry } from '../../types';
import { FileText, Download, Printer, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SupplierLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  transactions: FinancialEntry[];
}

const SupplierLedgerModal: React.FC<SupplierLedgerModalProps> = ({ isOpen, onClose, supplier, transactions }) => {
  if (!supplier) return null;

  // محاكاة حركات الحساب للمورد (في الواقع سيتم فلترتها من سجل المعاملات)
  const ledgerData = transactions.filter(t => t.account === 'موردين' && t.description.includes(supplier.companyName || supplier.name || '')) || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`كشف حساب: ${supplier.companyName || supplier.name}`} size="xl">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900 text-white border border-slate-800">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">الرصيد الافتتاحي</p>
            <p className="text-xl font-black tabular-nums">0.00 SAR</p>
          </div>
          <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20">
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">إجمالي المشتريات (مدين)</p>
            <p className="text-xl font-black text-rose-600 tabular-nums">{(supplier.balance > 0 ? supplier.balance : 0).toLocaleString()} SAR</p>
          </div>
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">صافي الرصيد الحالي</p>
            <p className="text-xl font-black text-emerald-600 tabular-nums">{supplier.balance.toLocaleString()} SAR</p>
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-[11px] border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-black uppercase">
              <tr>
                <th className="p-3 text-start border-e border-slate-200 dark:border-slate-700">التاريخ</th>
                <th className="p-3 text-start border-e border-slate-200 dark:border-slate-700">البيان / مرجع السند</th>
                <th className="p-3 text-center border-e border-slate-200 dark:border-slate-700">مدين (له)</th>
                <th className="p-3 text-center border-e border-slate-200 dark:border-slate-700">دائن (عليه)</th>
                <th className="p-3 text-center">الرصيد التراكمي</th>
              </tr>
            </thead>
            <tbody>
              {ledgerData.length > 0 ? ledgerData.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-3 font-bold text-slate-400 tabular-nums">{row.date}</td>
                  <td className="p-3 font-bold text-slate-700 dark:text-slate-300">{row.description}</td>
                  <td className="p-3 text-center font-black text-rose-600 tabular-nums">{row.amount < 0 ? Math.abs(row.amount).toLocaleString() : '-'}</td>
                  <td className="p-3 text-center font-black text-emerald-600 tabular-nums">{row.amount > 0 ? row.amount.toLocaleString() : '-'}</td>
                  <td className="p-3 text-center font-black tabular-nums">{(idx * 1000).toLocaleString()}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-300 font-black uppercase tracking-widest">
                    لا توجد حركات مالية مسجلة لهذا المورد حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" icon={<Printer size={16} />}>طباعة الكشف</Button>
          <Button variant="outline" icon={<Download size={16} />}>تصدير PDF</Button>
          <div className="flex-1"></div>
          <Button variant="ghost" onClick={onClose}>إغلاق النافذة</Button>
        </div>
      </div>
    </Modal>
  );
};

export default SupplierLedgerModal;
