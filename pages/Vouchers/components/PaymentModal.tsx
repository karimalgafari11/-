/**
 * نموذج سند الدفع - PaymentModal Component
 */

import React, { useState } from 'react';
import { ArrowUpCircle, Search, X, Save } from 'lucide-react';
import Modal from '../../../components/Common/Modal';
import Button from '../../../components/UI/Button';
import { PaymentFormData } from '../types';
import { Currency } from '../../../types/common';

interface Supplier {
    id: string;
    name: string;
    contact_person?: string;
}

interface PaymentModalProps {
    theme: string;
    isOpen: boolean;
    onClose: () => void;
    form: PaymentFormData;
    setForm: (form: PaymentFormData) => void;
    suppliers: Supplier[];
    activeCurrencies: Currency[];
    onSubmit: () => void;
    isEditing?: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    theme,
    isOpen,
    onClose,
    form,
    setForm,
    suppliers,
    activeCurrencies,
    onSubmit,
    isEditing = false
}) => {
    const [supplierSearch, setSupplierSearch] = useState('');
    const [showSupplierList, setShowSupplierList] = useState(false);
    const [selectedSupplierName, setSelectedSupplierName] = useState('');

    const filteredSuppliers = (supplierSearch || '').trim()
        ? (suppliers || []).filter(s =>
            (s?.name || '').toLowerCase().includes((supplierSearch || '').toLowerCase()) ||
            (s?.contact_person || '').toLowerCase().includes((supplierSearch || '').toLowerCase())
        )
        : (suppliers || []);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "تعديل سند دفع" : "إنشاء سند دفع جديد"} size="md">
            <div className="space-y-5">
                {/* رأس السند */}
                <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-4 -mx-6 -mt-4 text-center">
                    <ArrowUpCircle className="mx-auto text-white mb-2" size={40} />
                    <h2 className="text-xl font-black text-white">سند دفع</h2>
                    <p className="text-rose-100 text-sm">دفع أموال للمورد</p>
                </div>

                <div className="space-y-4 pt-4">
                    {/* حقل بحث المورد */}
                    <div className="relative">
                        <label className={`text-xs font-bold uppercase mb-1 block ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>المورد</label>
                        <div className="relative">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`} size={16} />
                            <input
                                type="text"
                                placeholder="ابحث عن المورد..."
                                value={selectedSupplierName || supplierSearch}
                                onChange={e => {
                                    setSupplierSearch(e.target.value);
                                    setSelectedSupplierName('');
                                    setForm({ ...form, supplierId: '' });
                                    setShowSupplierList(true);
                                }}
                                onFocus={() => setShowSupplierList(true)}
                                className={`w-full p-3 pl-10 border rounded-xl font-bold transition-colors ${theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400' : 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'}`}
                            />
                            {selectedSupplierName && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedSupplierName('');
                                        setSupplierSearch('');
                                        setForm({ ...form, supplierId: '' });
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* قائمة الموردين المنبثقة */}
                        {showSupplierList && !selectedSupplierName && (
                            <div className={`absolute z-50 w-full mt-1 rounded-xl border shadow-xl max-h-60 overflow-y-auto ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
                                {filteredSuppliers.length > 0 ? (
                                    filteredSuppliers.slice(0, 10).map(supplier => (
                                        <button
                                            key={supplier.id}
                                            type="button"
                                            onClick={() => {
                                                setForm({ ...form, supplierId: supplier.id });
                                                setSelectedSupplierName(supplier.name);
                                                setShowSupplierList(false);
                                                setSupplierSearch('');
                                            }}
                                            className={`w-full text-start p-3 border-b last:border-b-0 transition-colors ${theme === 'light' ? 'border-slate-100 hover:bg-rose-50' : 'border-slate-700 hover:bg-rose-900/30'}`}
                                        >
                                            <div className="font-bold text-sm">{supplier.name}</div>
                                            {supplier.contact_person && (
                                                <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{supplier.contact_person}</div>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className={`p-4 text-center text-sm ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {suppliers.length === 0 ? 'لا يوجد موردين مسجلين - أضف موردين من صفحة المشتريات' : 'لا توجد نتائج للبحث'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`text-xs font-bold uppercase mb-1 block ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>المبلغ</label>
                            <input
                                type="number"
                                value={form.amount}
                                onChange={e => setForm({ ...form, amount: e.target.value })}
                                placeholder=""
                                className={`w-full p-3 border rounded-xl font-black text-lg transition-colors ${theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-800 border-slate-700 text-white'}`}
                            />
                        </div>
                        <div>
                            <label className={`text-xs font-bold uppercase mb-1 block ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>العملة</label>
                            <select
                                value={form.currency}
                                onChange={e => setForm({ ...form, currency: e.target.value })}
                                className={`w-full p-3 border rounded-xl font-bold transition-colors ${theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-800 border-slate-700 text-white'}`}
                            >
                                {activeCurrencies.map(c => (
                                    <option key={c.code} value={c.code}>{c.nameAr} ({c.symbol})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={`text-xs font-bold uppercase mb-1 block ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>طريقة الدفع</label>
                        <div className="flex gap-2">
                            {['cash', 'bank', 'credit'].map(m => (
                                <button
                                    key={m}
                                    onClick={() => setForm({ ...form, paymentMethod: m as any })}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${form.paymentMethod === m
                                        ? 'bg-rose-500 text-white'
                                        : theme === 'light' ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        }`}
                                >
                                    {m === 'cash' ? 'نقدي' : m === 'bank' ? 'بنكي' : 'شيك'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className={`text-xs font-bold uppercase mb-1 block ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>ملاحظات</label>
                        <textarea
                            value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })}
                            className={`w-full p-3 border rounded-xl font-bold min-h-[80px] transition-colors ${theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400' : 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'}`}
                            placeholder="ملاحظات إضافية..."
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button variant="outline" fullWidth onClick={onClose}>إلغاء</Button>
                    <Button variant="danger" fullWidth icon={<Save size={18} />} onClick={onSubmit}>
                        حفظ السند
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default PaymentModal;
