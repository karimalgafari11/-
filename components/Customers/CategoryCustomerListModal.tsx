
import React from 'react';
import Modal from '../Common/Modal';
import Button from '../UI/Button';
import { Customer } from '../../types';
import { Users, ArrowRight, Download, Printer, Star } from 'lucide-react';

interface CategoryCustomerListModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  customers: Customer[];
}

const CategoryCustomerListModal: React.FC<CategoryCustomerListModalProps> = ({ isOpen, onClose, categoryName, customers }) => {
  const categoryCustomers = customers.filter(c => c.category === categoryName);

  const totalBalance = categoryCustomers.reduce((sum, c) => sum + (c.balance || 0), 0);
  const avgBalance = categoryCustomers.length > 0 ? totalBalance / categoryCustomers.length : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`قائمة العملاء: فئة ${categoryName}`} size="xl">
      <div className="space-y-6">
        {/* Header Stats for Category */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-900 text-white rounded-xl border border-blue-800">
            <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest block mb-1">عدد عملاء الفئة</span>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-black tabular-nums">{categoryCustomers.length}</span>
              <span className="text-[10px] font-bold text-blue-400 pb-1">عميل مسجل</span>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">إجمالي الذمم المدينة</span>
            <p className="text-xl font-black text-rose-600 tabular-nums">{totalBalance.toLocaleString()} SAR</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">متوسط مديونية العميل</span>
            <p className="text-xl font-black text-blue-600 tabular-nums">{avgBalance.toLocaleString()} SAR</p>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl">
            <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest block mb-1 flex items-center gap-1">
              <Star size={10} className="fill-amber-500" /> مستوى الثقة بالفئة
            </span>
            <p className="text-xl font-black text-amber-700 dark:text-amber-400 uppercase">عالي (A+)</p>
          </div>
        </div>

        {/* Customer List Table */}
        <div className="border border-slate-200 dark:border-slate-800 overflow-hidden rounded-xl">
          <table className="w-full text-[11px] border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-black uppercase">
              <tr>
                <th className="p-4 text-start border-e border-slate-200 dark:border-slate-700">اسم العميل</th>
                <th className="p-4 text-start border-e border-slate-200 dark:border-slate-700">رقم الجوال</th>
                <th className="p-4 text-center border-e border-slate-200 dark:border-slate-700">الرصيد القائم</th>
                <th className="p-4 text-center">الحالة التشغيلية</th>
              </tr>
            </thead>
            <tbody>
              {categoryCustomers.length > 0 ? categoryCustomers.map((c, idx) => (
                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <div className="font-black text-slate-800 dark:text-slate-100">{c.companyName}</div>
                    <div className="text-[9px] font-bold text-slate-400">{c.name}</div>
                  </td>
                  <td className="p-4 font-bold text-slate-500 tabular-nums">{c.phone}</td>
                  <td className={`p-4 text-center font-black tabular-nums ${(c.balance || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {(c.balance || 0).toLocaleString()} SAR
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase ${c.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                      {c.status === 'active' ? 'نشط' : 'متعثر'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-300 font-black uppercase tracking-widest">
                    لا يوجد عملاء مسجلين تحت هذه الفئة حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" icon={<Printer size={16} />}>طباعة التقرير للفئة</Button>
          <Button variant="outline" icon={<Download size={16} />}>تصدير Excel</Button>
          <div className="flex-1"></div>
          <Button variant="ghost" onClick={onClose} icon={<ArrowRight size={16} />}>رجوع</Button>
        </div>
      </div>
    </Modal>
  );
};

export default CategoryCustomerListModal;
