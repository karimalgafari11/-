
import React from 'react';
import Modal from '../Common/Modal';
import Button from '../UI/Button';
import { Purchase } from '../../types';
import { Printer, Download, Truck, Share2 } from 'lucide-react';

interface PurchaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: Purchase | null;
}

const PurchaseDetailModal: React.FC<PurchaseDetailModalProps> = ({ isOpen, onClose, purchase }) => {
  if (!purchase) return null;

  const renderHeader = () => (
    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-slate-800 flex items-center justify-center text-white">
            <Truck size={24} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">ALZHRA FINANCE</h2>
        </div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">إدارة المشتريات والخدمات اللوجستية</p>
      </div>
      <div className="text-end">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tighter">فاتورة مشتريات توريدية</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{purchase.invoiceNumber}</p>
        <p className="text-[11px] font-bold text-slate-900 dark:text-slate-100 mt-4 tabular-nums">{purchase.date}</p>
      </div>
    </div>
  );

  const renderInfo = () => (
    <div className="grid grid-cols-2 gap-12 bg-slate-50 dark:bg-slate-800/50 p-6 border border-slate-100 dark:border-slate-700">
      <div className="space-y-2">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">بيانات المورد:</span>
        <p className="text-sm font-black text-slate-900 dark:text-white">{purchase.supplierName}</p>
        <p className="text-[10px] font-bold text-slate-500">طريقة السداد: <span className="text-slate-900 dark:text-white font-black">{purchase.paymentMethod.toUpperCase()}</span></p>
        <p className="text-[10px] font-bold text-slate-500">مرجع المورد: <span className="text-slate-900 dark:text-white font-black">{purchase.referenceNumber || 'N/A'}</span></p>
      </div>
      <div className="flex flex-col items-end justify-center">
        <div className="px-6 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest mb-2 shadow-lg shadow-emerald-200 dark:shadow-none">فاتورة معتمدة وموردة</div>
        <p className="text-[9px] font-bold text-slate-400">Stock Updated Successfully</p>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`عرض فاتورة مشتريات`} size="lg">
      <div className="space-y-8 print:p-0">
        {renderHeader()}
        {renderInfo()}

        <div className="border border-slate-900 overflow-hidden">
          <table className="w-full text-[11px] border-collapse">
            <thead className="bg-slate-900 text-white font-black uppercase">
              <tr>
                <th className="p-3 text-start border-e border-white/10">البيان</th>
                <th className="p-3 text-center border-e border-white/10 w-20">الكمية</th>
                <th className="p-3 text-center border-e border-white/10 w-24">التكلفة</th>
                <th className="p-3 text-center border-e border-white/10 w-24">الضريبة</th>
                <th className="p-3 text-center w-28">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {purchase.items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-200 dark:border-slate-800 last:border-0">
                  <td className="p-3 font-bold">{item.name}</td>
                  <td className="p-3 text-center tabular-nums">{item.quantity}</td>
                  <td className="p-3 text-center tabular-nums">{item.costPrice.toLocaleString()}</td>
                  <td className="p-3 text-center tabular-nums">{(item.tax).toLocaleString()}</td>
                  <td className="p-3 text-center font-black tabular-nums">{(item.total).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-64 space-y-2 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
              <span>الإجمالي قبل الضريبة</span>
              <span className="tabular-nums">{purchase.subTotal.toLocaleString()} SAR</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
              <span>ضريبة القيمة المضافة (15%)</span>
              <span className="tabular-nums">{purchase.taxTotal.toLocaleString()} SAR</span>
            </div>
            <div className="flex justify-between text-lg font-black text-slate-900 dark:text-white border-t-2 border-slate-900 pt-2">
              <span className="tracking-tighter">الصافي النهائي</span>
              <span className="tabular-nums text-primary">{purchase.grandTotal.toLocaleString()} SAR</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-8 print:hidden border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" icon={<Printer size={16}/>} onClick={() => window.print()}>طباعة</Button>
          <Button variant="outline" icon={<Download size={16}/>}>تصدير PDF</Button>
          <Button variant="outline" icon={<Share2 size={16}/>}>مشاركة</Button>
          <div className="flex-1"></div>
          <Button variant="ghost" onClick={onClose}>إغلاق</Button>
        </div>
      </div>
    </Modal>
  );
};

export default PurchaseDetailModal;
