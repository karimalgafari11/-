
import React from 'react';
import Modal from '../../Common/Modal';
import { SaleReturn } from '../../../types';
import { Printer, Calendar, User, FileText, ArrowLeftRight } from 'lucide-react';
import Button from '../../UI/Button';

interface SaleReturnDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    returnRecord: SaleReturn | null;
}

const SaleReturnDetailModal: React.FC<SaleReturnDetailModalProps> = ({ isOpen, onClose, returnRecord }) => {
    if (!returnRecord) return null;

    const symbol = returnRecord.currency === 'YER' ? '﷼' : returnRecord.currency === 'SAR' ? 'ر.س' : returnRecord.currency;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`تفاصيل المرتجع ${returnRecord.returnNumber}`} size="lg">
            <div className="space-y-6">

                {/* Header Info */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-slate-600">
                            <User size={16} className="text-blue-500" />
                            <span className="text-sm font-bold">العميل:</span>
                            <span className="text-sm">{returnRecord.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <FileText size={16} className="text-blue-500" />
                            <span className="text-sm font-bold">رقم الفاتورة الأصلية:</span>
                            <span className="text-sm font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{returnRecord.originalInvoiceNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <ArrowLeftRight size={16} className="text-blue-500" />
                            <span className="text-sm font-bold">طريقة الاسترداد:</span>
                            <span className="text-sm">
                                {returnRecord.refundMethod === 'cash' ? 'نقدي' : returnRecord.refundMethod === 'credit' ? 'رصيد دائن' : 'محفظة'}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-3 text-end">
                        <div className="flex items-center justify-end gap-2 text-slate-600">
                            <span className="text-sm">{returnRecord.date}</span>
                            <span className="text-sm font-bold">:التاريخ</span>
                            <Calendar size={16} className="text-blue-500" />
                        </div>
                        <div className="mt-2">
                            <span className="text-xs text-slate-400 block mb-1">المبلغ المسترد</span>
                            <div className="text-2xl font-black text-red-600 flex items-center justify-end gap-1">
                                <span>{returnRecord.grandTotal.toLocaleString()}</span>
                                <span className="text-sm">{symbol}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reason */}
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-800 text-sm">
                    <span className="font-bold ml-2">سبب الإرجاع:</span>
                    {returnRecord.reason}
                </div>

                {/* Items Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-3 text-start">المنتج</th>
                                <th className="p-3 text-center">الكمية المرجعة</th>
                                <th className="p-3 text-center">سعر الوحدة</th>
                                <th className="p-3 text-center">الإجمالي</th>
                                <th className="p-3 text-start">ملاحظات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {returnRecord.items.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="p-3">
                                        <div className="font-medium text-slate-800">{item.name}</div>
                                        <div className="text-xs text-slate-400">{item.sku}</div>
                                    </td>
                                    <td className="p-3 text-center font-bold">{item.quantity}</td>
                                    <td className="p-3 text-center text-slate-600">{(item.total / item.quantity).toLocaleString()}</td>
                                    <td className="p-3 text-center font-bold text-red-600">
                                        {item.total.toLocaleString()} {symbol}
                                    </td>
                                    <td className="p-3 text-xs text-slate-500 italic">
                                        {item.returnReason || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button variant="outline" icon={<Printer size={16} />}>طباعة المرتجع</Button>
                    <Button variant="primary" onClick={onClose}>إغلاق</Button>
                </div>
            </div>
        </Modal>
    );
};

export default SaleReturnDetailModal;
