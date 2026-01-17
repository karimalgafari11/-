
import React from 'react';
import Modal from '../../Common/Modal';
import { PurchaseReturn } from '../../../types';
import { Printer, Calendar, Truck } from 'lucide-react';
import Button from '../../UI/Button';

interface PurchaseReturnDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    returnRecord: PurchaseReturn | null;
}

const PurchaseReturnDetailModal: React.FC<PurchaseReturnDetailModalProps> = ({ isOpen, onClose, returnRecord }) => {
    if (!returnRecord) return null;
    const symbol = returnRecord.currency === 'YER' ? '﷼' : 'ر.س';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`تفاصيل مرتجع المشتريات ${returnRecord.returnNumber}`} size="lg">
            <div className="space-y-6">

                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-slate-600">
                            <Truck size={16} className="text-amber-500" />
                            <span className="text-sm font-bold">المورد:</span>
                            <span className="text-sm">{returnRecord.supplierName}</span>
                        </div>
                        <div>
                            <span className="text-xs text-slate-500">فاتورة الشراء الأصلية</span>
                            <div className="font-mono bg-white inline-block px-2 py-0.5 rounded border border-slate-200 ml-2">
                                {returnRecord.originalInvoiceNumber}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3 text-end">
                        <div className="flex items-center justify-end gap-2 text-slate-600">
                            <span className="text-sm">{returnRecord.date}</span>
                            <Calendar size={16} className="text-amber-500" />
                        </div>
                        <div className="mt-2 text-2xl font-black text-amber-600 flex items-center justify-end gap-1">
                            <span>{returnRecord.grandTotal.toLocaleString()}</span>
                            <span className="text-sm">{symbol}</span>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-3 text-start">المنتج</th>
                                <th className="p-3 text-center">الكمية</th>
                                <th className="p-3 text-center">التكلفة</th>
                                <th className="p-3 text-center">الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {returnRecord.items.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="p-3 font-medium">{item.name}</td>
                                    <td className="p-3 text-center font-bold">{item.quantity}</td>
                                    <td className="p-3 text-center text-slate-500">{item.costPrice.toLocaleString()}</td>
                                    <td className="p-3 text-center font-bold text-amber-600">
                                        {(item.total).toLocaleString()} {symbol}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button variant="outline" icon={<Printer size={16} />}>طباعة</Button>
                    <Button variant="primary" onClick={onClose}>إغلاق</Button>
                </div>
            </div>
        </Modal>
    );
};

export default PurchaseReturnDetailModal;
