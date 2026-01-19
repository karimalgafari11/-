/**
 * صفحة السندات - Vouchers Page
 * سندات القبض والدفع
 */

import React, { useState } from 'react';
import { useVouchers } from '../context/VouchersContext';
import { useSales } from '../context/SalesContext';
import { usePurchases } from '../context/PurchasesContext';
import { useCurrency } from '../hooks/useCurrency';
import { ReceiptVoucher, PaymentVoucher } from '../types';
import {
    Receipt, CreditCard, Plus, Search, Filter, Calendar,
    ArrowDownCircle, ArrowUpCircle, User, Building2, Coins,
    FileText, Trash2, Eye, X, Save, CheckCircle, Edit
} from 'lucide-react';
import Button from '../components/UI/Button';
import Modal from '../components/Common/Modal';
import { useApp } from '../context/AppContext';
import { PrivacyToggle, usePrivacy } from '../components/Common/PrivacyToggle';

const Vouchers: React.FC = () => {
    const { theme } = useApp();
    const {
        receiptVouchers, addReceiptVoucher, updateReceiptVoucher, deleteReceiptVoucher,
        paymentVouchers, addPaymentVoucher, updatePaymentVoucher, deletePaymentVoucher,
        getTotalReceipts, getTotalPayments
    } = useVouchers();
    const { customers } = useSales();
    const { suppliers } = usePurchases();
    const { activeCurrencies, getCurrency, BASE_CURRENCY, getCurrentRate } = useCurrency();
    const { isHidden } = usePrivacy();

    const [activeTab, setActiveTab] = useState<'receipt' | 'payment'>('receipt');
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingReceipt, setEditingReceipt] = useState<ReceiptVoucher | null>(null);
    const [editingPayment, setEditingPayment] = useState<PaymentVoucher | null>(null);

    // نموذج سند القبض
    const [receiptForm, setReceiptForm] = useState<{
        customerId: string;
        amount: string;
        currency: string;
        paymentMethod: 'cash' | 'bank' | 'credit' | 'check';
        referenceNumber: string;
        notes: string;
    }>({
        customerId: '',
        amount: '',
        currency: 'YER',
        paymentMethod: 'cash',
        referenceNumber: '',
        notes: ''
    });

    // نموذج سند الدفع
    const [paymentForm, setPaymentForm] = useState<{
        supplierId: string;
        amount: string;
        currency: string;
        paymentMethod: 'cash' | 'bank' | 'credit' | 'check';
        referenceNumber: string;
        notes: string;
    }>({
        supplierId: '',
        amount: '',
        currency: 'SAR',
        paymentMethod: 'cash',
        referenceNumber: '',
        notes: ''
    });

    const handleAddReceipt = () => {
        if (!receiptForm.customerId || !receiptForm.amount) return;

        const customer = customers.find(c => c.id === receiptForm.customerId);
        const amount = parseFloat(receiptForm.amount);
        const rate = getCurrentRate(BASE_CURRENCY, receiptForm.currency);
        const baseAmount = receiptForm.currency === BASE_CURRENCY ? amount : amount / rate;

        const voucher: ReceiptVoucher = {
            id: `RV-${Date.now()}`,
            voucherNumber: `RV-${Math.floor(1000 + Math.random() * 9000)}`,
            date: new Date().toISOString().split('T')[0],
            customerId: receiptForm.customerId,
            customerName: customer?.companyName || 'عميل',
            amount,
            currency: receiptForm.currency,
            exchangeRate: rate,
            baseAmount,
            paymentMethod: receiptForm.paymentMethod,
            referenceNumber: receiptForm.referenceNumber,
            notes: receiptForm.notes,
            status: 'completed',
            createdBy: 'user',
            createdAt: new Date().toISOString()
        };

        addReceiptVoucher(voucher);
        setShowReceiptModal(false);
        setReceiptForm({ customerId: '', amount: '', currency: 'YER', paymentMethod: 'cash', referenceNumber: '', notes: '' });
    };

    const handleAddPayment = () => {
        if (!paymentForm.supplierId || !paymentForm.amount) return;

        const supplier = suppliers.find(s => s.id === paymentForm.supplierId);
        const amount = parseFloat(paymentForm.amount);
        const rate = getCurrentRate(BASE_CURRENCY, paymentForm.currency);
        const baseAmount = paymentForm.currency === BASE_CURRENCY ? amount : amount / rate;

        const voucher: PaymentVoucher = {
            id: `PV-${Date.now()}`,
            voucherNumber: `PV-${Math.floor(1000 + Math.random() * 9000)}`,
            date: new Date().toISOString().split('T')[0],
            supplierId: paymentForm.supplierId,
            supplierName: supplier?.companyName || 'مورد',
            amount,
            currency: paymentForm.currency,
            exchangeRate: rate,
            baseAmount,
            paymentMethod: paymentForm.paymentMethod,
            referenceNumber: paymentForm.referenceNumber,
            notes: paymentForm.notes,
            status: 'completed',
            createdBy: 'user',
            createdAt: new Date().toISOString()
        };

        addPaymentVoucher(voucher);
        setShowPaymentModal(false);
        setPaymentForm({ supplierId: '', amount: '', currency: 'SAR', paymentMethod: 'cash', referenceNumber: '', notes: '' });
    };

    const filteredReceipts = receiptVouchers.filter(v =>
        v.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPayments = paymentVouchers.filter(v =>
        v.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* رأس الصفحة */}
            <div className={`
                p-6 rounded-2xl border
                ${theme === 'light'
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
                    : 'bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border-emerald-800/30'
                }
            `}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`
                            w-14 h-14 rounded-2xl flex items-center justify-center
                            ${theme === 'light'
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30'
                                : 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-lg shadow-emerald-900/30'
                            }
                        `}>
                            <Receipt className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-black ${theme === 'light' ? 'text-emerald-900' : 'text-emerald-100'}`}>
                                السندات المالية
                            </h1>
                            <p className={`text-sm ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`}>
                                سندات القبض والدفع
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        <PrivacyToggle showLabel={false} />
                        <Button
                            variant="success"
                            size="sm"
                            icon={<ArrowDownCircle size={16} />}
                            onClick={() => setShowReceiptModal(true)}
                        >
                            <span className="hidden sm:inline">سند قبض جديد</span>
                            <span className="sm:hidden">قبض</span>
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            icon={<ArrowUpCircle size={16} />}
                            onClick={() => setShowPaymentModal(true)}
                        >
                            <span className="hidden sm:inline">سند دفع جديد</span>
                            <span className="sm:hidden">دفع</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* إحصائيات سريعة */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className={`p-5 rounded-2xl border ${theme === 'light' ? 'bg-white border-emerald-200' : 'bg-emerald-900/20 border-emerald-800/30'}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <ArrowDownCircle className="text-emerald-500" size={20} />
                        <span className={`text-xs font-bold ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`}>إجمالي المقبوضات (SAR)</span>
                    </div>
                    <p className={`text-2xl font-black ${theme === 'light' ? 'text-emerald-900' : 'text-emerald-100'} ${isHidden ? 'blur-sm select-none' : ''}`}>
                        {isHidden ? '••••••' : getTotalReceipts('SAR').toLocaleString()} ر.س
                    </p>
                </div>

                <div className={`p-5 rounded-2xl border ${theme === 'light' ? 'bg-white border-blue-200' : 'bg-blue-900/20 border-blue-800/30'}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <ArrowDownCircle className="text-blue-500" size={20} />
                        <span className={`text-xs font-bold ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}>إجمالي المقبوضات (YER)</span>
                    </div>
                    <p className={`text-2xl font-black ${theme === 'light' ? 'text-blue-900' : 'text-blue-100'} ${isHidden ? 'blur-sm select-none' : ''}`}>
                        {isHidden ? '••••••' : getTotalReceipts('YER').toLocaleString()} ﷼
                    </p>
                </div>

                <div className={`p-5 rounded-2xl border ${theme === 'light' ? 'bg-white border-rose-200' : 'bg-rose-900/20 border-rose-800/30'}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <ArrowUpCircle className="text-rose-500" size={20} />
                        <span className={`text-xs font-bold ${theme === 'light' ? 'text-rose-600' : 'text-rose-400'}`}>إجمالي المدفوعات (SAR)</span>
                    </div>
                    <p className={`text-2xl font-black ${theme === 'light' ? 'text-rose-900' : 'text-rose-100'} ${isHidden ? 'blur-sm select-none' : ''}`}>
                        {isHidden ? '••••••' : getTotalPayments('SAR').toLocaleString()} ر.س
                    </p>
                </div>

                <div className={`p-5 rounded-2xl border ${theme === 'light' ? 'bg-white border-amber-200' : 'bg-amber-900/20 border-amber-800/30'}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <Receipt className="text-amber-500" size={20} />
                        <span className={`text-xs font-bold ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`}>عدد السندات</span>
                    </div>
                    <p className={`text-2xl font-black ${theme === 'light' ? 'text-amber-900' : 'text-amber-100'}`}>
                        {receiptVouchers.length + paymentVouchers.length}
                    </p>
                </div>
            </div>

            {/* تبويبات */}
            <div className={`flex gap-2 p-1 rounded-xl ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}>
                <button
                    onClick={() => setActiveTab('receipt')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'receipt'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                        : theme === 'light' ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:bg-slate-700'
                        }`}
                >
                    <ArrowDownCircle size={18} />
                    سندات القبض ({receiptVouchers.length})
                </button>
                <button
                    onClick={() => setActiveTab('payment')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'payment'
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                        : theme === 'light' ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:bg-slate-700'
                        }`}
                >
                    <ArrowUpCircle size={18} />
                    سندات الدفع ({paymentVouchers.length})
                </button>
            </div>

            {/* شريط البحث */}
            <div className={`flex items-center gap-3 p-3 rounded-xl border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'}`}>
                <Search size={18} className={theme === 'light' ? 'text-slate-400' : 'text-slate-500'} />
                <input
                    type="text"
                    placeholder="بحث عن سند..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className={`flex-1 bg-transparent outline-none text-sm font-bold ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}
                />
            </div>

            {/* جدول السندات */}
            <div className={`rounded-2xl border overflow-hidden ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'}`}>
                <table className="w-full text-sm">
                    <thead className={`${activeTab === 'receipt' ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gradient-to-r from-rose-600 to-pink-600'} text-white`}>
                        <tr>
                            <th className="p-4 text-start font-black">رقم السند</th>
                            <th className="p-4 text-start font-black">{activeTab === 'receipt' ? 'العميل' : 'المورد'}</th>
                            <th className="p-4 text-center font-black">المبلغ</th>
                            <th className="p-4 text-center font-black">العملة</th>
                            <th className="p-4 text-center font-black">التاريخ</th>
                            <th className="p-4 text-center font-black">الحالة</th>
                            <th className="p-4 text-center font-black w-28">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeTab === 'receipt' ? (
                            filteredReceipts.length > 0 ? filteredReceipts.map(v => (
                                <tr key={v.id} className={`border-b ${theme === 'light' ? 'border-slate-100 hover:bg-emerald-50/50' : 'border-slate-800 hover:bg-emerald-900/10'}`}>
                                    <td className="p-4 font-black text-emerald-600">{v.voucherNumber}</td>
                                    <td className="p-4">{v.customerName}</td>
                                    <td className="p-4 text-center font-black text-lg">{v.amount.toLocaleString()}</td>
                                    <td className="p-4 text-center">
                                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">
                                            {getCurrency(v.currency)?.symbol}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center text-slate-500">{v.date}</td>
                                    <td className="p-4 text-center">
                                        <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                            <CheckCircle size={12} className="inline mr-1" /> مكتمل
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex gap-1 justify-center">
                                            <button
                                                onClick={() => {
                                                    setEditingReceipt(v);
                                                    setReceiptForm({
                                                        customerId: v.customerId,
                                                        amount: v.amount.toString(),
                                                        currency: v.currency,
                                                        paymentMethod: v.paymentMethod as 'cash' | 'bank' | 'credit',
                                                        referenceNumber: v.referenceNumber || '',
                                                        notes: v.notes || ''
                                                    });
                                                    setShowReceiptModal(true);
                                                }}
                                                className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => deleteReceiptVoucher(v.id)}
                                                className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={7} className="p-12 text-center text-slate-400">لا توجد سندات قبض</td></tr>
                            )
                        ) : (
                            filteredPayments.length > 0 ? filteredPayments.map(v => (
                                <tr key={v.id} className={`border-b ${theme === 'light' ? 'border-slate-100 hover:bg-rose-50/50' : 'border-slate-800 hover:bg-rose-900/10'}`}>
                                    <td className="p-4 font-black text-rose-600">{v.voucherNumber}</td>
                                    <td className="p-4">{v.supplierName}</td>
                                    <td className="p-4 text-center font-black text-lg">{v.amount.toLocaleString()}</td>
                                    <td className="p-4 text-center">
                                        <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs font-bold">
                                            {getCurrency(v.currency)?.symbol}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center text-slate-500">{v.date}</td>
                                    <td className="p-4 text-center">
                                        <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                            <CheckCircle size={12} className="inline mr-1" /> مكتمل
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex gap-1 justify-center">
                                            <button
                                                onClick={() => {
                                                    setEditingPayment(v);
                                                    setPaymentForm({
                                                        supplierId: v.supplierId,
                                                        amount: v.amount.toString(),
                                                        currency: v.currency,
                                                        paymentMethod: v.paymentMethod,
                                                        referenceNumber: v.referenceNumber || '',
                                                        notes: v.notes || ''
                                                    });
                                                    setShowPaymentModal(true);
                                                }}
                                                className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => deletePaymentVoucher(v.id)}
                                                className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={7} className="p-12 text-center text-slate-400">لا توجد سندات دفع</td></tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal سند القبض */}
            <Modal isOpen={showReceiptModal} onClose={() => setShowReceiptModal(false)} title="إنشاء سند قبض جديد" size="md">
                <div className="space-y-5">
                    {/* رأس السند */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 -mx-6 -mt-4 text-center">
                        <ArrowDownCircle className="mx-auto text-white mb-2" size={40} />
                        <h2 className="text-xl font-black text-white">سند قبض</h2>
                        <p className="text-emerald-100 text-sm">استلام أموال من العميل</p>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">العميل</label>
                            <select
                                value={receiptForm.customerId}
                                onChange={e => setReceiptForm({ ...receiptForm, customerId: e.target.value })}
                                className="w-full p-3 border rounded-xl bg-slate-50 font-bold"
                            >
                                <option value="">-- اختر العميل --</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">المبلغ</label>
                                <input
                                    type="number"
                                    value={receiptForm.amount}
                                    onChange={e => setReceiptForm({ ...receiptForm, amount: e.target.value })}
                                    placeholder=""
                                    className="w-full p-3 border rounded-xl bg-slate-50 font-black text-lg"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">العملة</label>
                                <select
                                    value={receiptForm.currency}
                                    onChange={e => setReceiptForm({ ...receiptForm, currency: e.target.value })}
                                    className="w-full p-3 border rounded-xl bg-slate-50 font-bold"
                                >
                                    {activeCurrencies.map(c => (
                                        <option key={c.code} value={c.code}>{c.nameAr} ({c.symbol})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">طريقة الدفع</label>
                            <div className="flex gap-2">
                                {['cash', 'bank', 'credit'].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setReceiptForm({ ...receiptForm, paymentMethod: m as any })}
                                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${receiptForm.paymentMethod === m
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {m === 'cash' ? 'نقدي' : m === 'bank' ? 'بنكي' : 'شيك'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">ملاحظات</label>
                            <textarea
                                value={receiptForm.notes}
                                onChange={e => setReceiptForm({ ...receiptForm, notes: e.target.value })}
                                className="w-full p-3 border rounded-xl bg-slate-50 font-bold min-h-[80px]"
                                placeholder="ملاحظات إضافية..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" fullWidth onClick={() => setShowReceiptModal(false)}>إلغاء</Button>
                        <Button variant="success" fullWidth icon={<Save size={18} />} onClick={handleAddReceipt}>
                            حفظ السند
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modal سند الدفع */}
            <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="إنشاء سند دفع جديد" size="md">
                <div className="space-y-5">
                    {/* رأس السند */}
                    <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-4 -mx-6 -mt-4 text-center">
                        <ArrowUpCircle className="mx-auto text-white mb-2" size={40} />
                        <h2 className="text-xl font-black text-white">سند دفع</h2>
                        <p className="text-rose-100 text-sm">دفع أموال للمورد</p>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">المورد</label>
                            <select
                                value={paymentForm.supplierId}
                                onChange={e => setPaymentForm({ ...paymentForm, supplierId: e.target.value })}
                                className="w-full p-3 border rounded-xl bg-slate-50 font-bold"
                            >
                                <option value="">-- اختر المورد --</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">المبلغ</label>
                                <input
                                    type="number"
                                    value={paymentForm.amount}
                                    onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                    placeholder=""
                                    className="w-full p-3 border rounded-xl bg-slate-50 font-black text-lg"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">العملة</label>
                                <select
                                    value={paymentForm.currency}
                                    onChange={e => setPaymentForm({ ...paymentForm, currency: e.target.value })}
                                    className="w-full p-3 border rounded-xl bg-slate-50 font-bold"
                                >
                                    {activeCurrencies.map(c => (
                                        <option key={c.code} value={c.code}>{c.nameAr} ({c.symbol})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">طريقة الدفع</label>
                            <div className="flex gap-2">
                                {['cash', 'bank', 'credit'].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setPaymentForm({ ...paymentForm, paymentMethod: m as any })}
                                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${paymentForm.paymentMethod === m
                                            ? 'bg-rose-500 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {m === 'cash' ? 'نقدي' : m === 'bank' ? 'بنكي' : 'شيك'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">ملاحظات</label>
                            <textarea
                                value={paymentForm.notes}
                                onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                                className="w-full p-3 border rounded-xl bg-slate-50 font-bold min-h-[80px]"
                                placeholder="ملاحظات إضافية..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" fullWidth onClick={() => setShowPaymentModal(false)}>إلغاء</Button>
                        <Button variant="danger" fullWidth icon={<Save size={18} />} onClick={handleAddPayment}>
                            حفظ السند
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Vouchers;
