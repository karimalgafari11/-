
import React from 'react';
import Modal from '../Common/Modal';
import Button from '../UI/Button';
import { Sale } from '../../types';
import { Printer, Download, ShoppingBag, FileText, Share2 } from 'lucide-react';

interface SaleDetailModalProps {
   isOpen: boolean;
   onClose: () => void;
   sale: Sale | null;
}

const SaleDetailModal: React.FC<SaleDetailModalProps> = ({ isOpen, onClose, sale }) => {
   if (!sale) return null;

   return (
      <Modal isOpen={isOpen} onClose={onClose} title={`فاتورة مبيعات: ${sale.invoiceNumber}`} size="lg">
         <div className="space-y-8 print:p-0">
            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
               <div>
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-12 h-12 bg-primary flex items-center justify-center text-white">
                        <ShoppingBag size={24} />
                     </div>
                     <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">ALZHRA FINANCE</h2>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500">شركة الزهراء العالمية للتجارة والمقاولات</p>
                  <p className="text-[10px] font-bold text-slate-500">الرقم الضريبي: 300012345600003</p>
               </div>
               <div className="text-end">
                  <h3 className="text-xl font-black text-primary mb-1">فاتورة مبيعات</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sale.invoiceNumber}</p>
                  <p className="text-[11px] font-bold text-slate-900 dark:text-slate-100 mt-4 tabular-nums">{sale.date}</p>
               </div>
            </div>

            {/* Client & Payment Info */}
            <div className="grid grid-cols-2 gap-12 bg-slate-50 dark:bg-slate-800/50 p-6 border border-slate-100 dark:border-slate-700">
               <div className="space-y-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">فاتورة موجهة إلى:</span>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{sale.customerName}</p>
                  <p className="text-[10px] font-bold text-slate-500">طريقة الدفع: <span className="text-primary">{sale.paymentMethod.toUpperCase()}</span></p>
               </div>
               <div className="flex justify-end items-center">
                  <div className="w-24 h-24 border border-slate-200 dark:border-slate-700 p-2 bg-white flex items-center justify-center">
                     {/* Placeholder for QR Code */}
                     <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-slate-300">ZATCA QR</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-900">
               <table className="w-full text-[11px] border-collapse">
                  <thead className="bg-slate-900 text-white font-black uppercase">
                     <tr>
                        <th className="p-3 text-start border-e border-white/10">البيان</th>
                        <th className="p-3 text-center border-e border-white/10 w-20">الكمية</th>
                        <th className="p-3 text-center border-e border-white/10 w-24">السعر</th>
                        <th className="p-3 text-center border-e border-white/10 w-24">الضريبة</th>
                        <th className="p-3 text-center w-28">الإجمالي</th>
                     </tr>
                  </thead>
                  <tbody>
                     {sale.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-200 dark:border-slate-800 last:border-0">
                           <td className="p-3 font-bold">{item.name}</td>
                           <td className="p-3 text-center tabular-nums">{item.quantity}</td>
                           <td className="p-3 text-center tabular-nums">{item.unitPrice.toLocaleString()}</td>
                           <td className="p-3 text-center tabular-nums">{(item.unitPrice * 0.15 * item.quantity).toLocaleString()}</td>
                           <td className="p-3 text-center font-black tabular-nums">{(item.unitPrice * 1.15 * item.quantity).toLocaleString()}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            {/* Footer Sums */}
            <div className="flex justify-end">
               <div className="w-64 space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                     <span>الإجمالي الخاضع للضريبة</span>
                     <span className="tabular-nums">{sale.subTotal.toLocaleString()} {sale.saleCurrency === 'YER' ? '﷼' : sale.saleCurrency === 'SAR' ? 'ر.س' : sale.saleCurrency || 'ر.س'}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-emerald-600 uppercase">
                     <span>مجموع ضريبة القيمة المضافة</span>
                     <span className="tabular-nums">{sale.taxTotal.toLocaleString()} {sale.saleCurrency === 'YER' ? '﷼' : sale.saleCurrency === 'SAR' ? 'ر.س' : sale.saleCurrency || 'ر.س'}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-slate-900 dark:text-white border-t-2 border-slate-900 pt-2">
                     <span>المبلغ المستحق</span>
                     <span className="tabular-nums text-primary">{sale.grandTotal.toLocaleString()} {sale.saleCurrency === 'YER' ? '﷼' : sale.saleCurrency === 'SAR' ? 'ر.س' : sale.saleCurrency || 'ر.س'}</span>
                  </div>
               </div>
            </div>

            <div className="flex gap-3 pt-8 print:hidden">
               <Button variant="outline" icon={<Printer size={16} />} onClick={() => window.print()}>طباعة الفاتورة</Button>
               <Button variant="outline" icon={<Download size={16} />}>حفظ PDF</Button>
               <Button variant="outline" icon={<Share2 size={16} />}>مشاركة</Button>
               <div className="flex-1"></div>
               <Button variant="ghost" onClick={onClose}>إغلاق</Button>
            </div>
         </div>
      </Modal>
   );
};

export default SaleDetailModal;
