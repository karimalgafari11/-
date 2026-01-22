/**
 * نموذج سند القبض - ReceiptModal Component
 */

import React, { useState } from 'react';
import { ArrowDownCircle, Search, X, Save } from 'lucide-react';
import Modal from '../../../components/Common/Modal';
import Button from '../../../components/UI/Button';
import { ReceiptFormData } from '../types';
import { Currency } from '../../../types/common';

interface Customer {
    id: string;
    name: string;
    contact_person?: string;
}

interface ReceiptModalProps {
    theme: string;
    isOpen: boolean;
    onClose: () => void;
    form: ReceiptFormData;
    setForm: (form: ReceiptFormData) => void;
    customers: Customer[];
    activeCurrencies: Currency[];
    onSubmit: () => void;
    isEditing?: boolean;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({
    theme,
    isOpen,
    onClose,
    form,
    setForm,
    customers,
    activeCurrencies,
    onSubmit,
    isEditing = false
}) => {
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerList, setShowCustomerList] = useState(false);
    const [selectedCustomerName, setSelectedCustomerName] = useState('');

    const filteredCustomers = (customerSearch || '').trim()
        ? (customers || []).filter(c =>
            (c?.name || '').toLowerCase().includes((customerSearch || '').toLowerCase()) ||
            (c?.contact_person || '').toLowerCase().includes((customerSearch || '').toLowerCase())
        )
        : (customers || []);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "تعديل سند قبض" : "إنشاء سند قبض جديد"} size="md">
            <div className="space-y-5">
                {/* رأس السند */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 -mx-6 -mt-4 text-center">
                    <ArrowDownCircle className="mx-auto text-white mb-2" size={40} />
                    <h2 className="text-xl font-black text-white">سند قبض</h2>
                    <p className="text-emerald-100 text-sm">استلام أموال من العميل</p>
                </div>

                <div className="space-y-4 pt-4">
                    {/* حقل بحث العميل */}
                    <div className="relative">
                        <label className={`text-xs font-bold uppercase mb-1 block ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>العميل</label>
                        <div className="relative">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`} size={16} />
                            <input
                                type="text"
                                placeholder="ابحث عن العميل..."
                                value={selectedCustomerName || customerSearch}
                                onChange={e => {
                                    setCustomerSearch(e.target.value);
                                    setSelectedCustomerName('');
                                    setForm({ ...form, customerId: '' });
                                    setShowCustomerList(true);
                                }}
                                onFocus={() => setShowCustomerList(true)}
                                className={`w-full p-3 pl-10 border rounded-xl font-bold transition-colors ${theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400' : 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'}`}
                            />
                            {selectedCustomerName && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedCustomerName('');
                                        setCustomerSearch('');
                                        setForm({ ...form, customerId: '' });
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* قائمة العملاء المنبثقة */}
                        {showCustomerList && !selectedCustomerName && (
                            <div className={`absolute z-50 w-full mt-1 rounded-xl border shadow-xl max-h-60 overflow-y-auto ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
                                {filteredCustomers.length > 0 ? (
                                    filteredCustomers.slice(0, 10).map(customer => (
                                        <button
                                            key={customer.id}
                                            type="button"
                                            onClick={() => {
                                                setForm({ ...form, customerId: customer.id });
                                                setSelectedCustomerName(customer.name);
                                                setShowCustomerList(false);
                                                setCustomerSearch('');
                                            }}
                                            className={`w-full text-start p-3 border-b last:border-b-0 transition-colors ${theme === 'light' ? 'border-slate-100 hover:bg-emerald-50' : 'border-slate-700 hover:bg-emerald-900/30'}`}
                                        >
                                            <div className="font-bold text-sm">{customer.name}</div>
                                            {customer.contact_person && (
                                                <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{customer.contact_person}</div>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className={`p-4 text-center text-sm ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {customers.length === 0 ? 'لا يوجد عملاء مسجلين - أضف عملاء من صفحة المبيعات' : 'لا توجد نتائج للبحث'}
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
                                        ? 'bg-emerald-500 text-white'
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
                    <Button variant="success" fullWidth icon={<Save size={18} />} onClick={onSubmit}>
                        حفظ السند
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ReceiptModal;
