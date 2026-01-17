/**
 * تقرير الديون التفصيلي
 * Detailed Debts Report - Receivables and Payables
 */

import React, { useState, useMemo } from 'react';
import { useSales } from '../../context/SalesContext';
import { usePurchases } from '../../context/PurchasesContext';
import { useVouchers } from '../../context/VouchersContext';
import { useCurrency } from '../../hooks/useCurrency';
import { useApp } from '../../context/AppContext';
import {
    TrendingUp, TrendingDown, Users, Building2, Coins,
    AlertTriangle, CheckCircle, Clock, ArrowRight
} from 'lucide-react';

const DebtReport: React.FC = () => {
    const { theme } = useApp();
    // إضافة قيم افتراضية آمنة
    const { customers = [], sales = [] } = useSales();
    const { suppliers = [], purchases = [] } = usePurchases();
    const { receiptVouchers = [], paymentVouchers = [] } = useVouchers();
    const { activeCurrencies = [], getCurrency } = useCurrency();

    const [activeView, setActiveView] = useState<'receivables' | 'payables'>('receivables');
    const [selectedCurrency, setSelectedCurrency] = useState('ALL');

    // حساب الديون المستحقة من العملاء (لك)
    const receivables = useMemo(() => {
        const customerDebts: Record<string, Record<string, { sales: number; receipts: number; balance: number }>> = {};

        // فواتير المبيعات الآجلة
        sales.filter(s => s.status === 'pending' || s.paymentMethod === 'credit').forEach(sale => {
            const currency = sale.saleCurrency || 'SAR';
            if (selectedCurrency !== 'ALL' && currency !== selectedCurrency) return;

            if (!customerDebts[sale.customerId]) customerDebts[sale.customerId] = {};
            if (!customerDebts[sale.customerId][currency]) {
                customerDebts[sale.customerId][currency] = { sales: 0, receipts: 0, balance: 0 };
            }
            customerDebts[sale.customerId][currency].sales += sale.grandTotal;
        });

        // سندات القبض
        receiptVouchers.filter(r => r.status === 'completed').forEach(receipt => {
            const currency = receipt.currency;
            if (selectedCurrency !== 'ALL' && currency !== selectedCurrency) return;

            if (!customerDebts[receipt.customerId]) customerDebts[receipt.customerId] = {};
            if (!customerDebts[receipt.customerId][currency]) {
                customerDebts[receipt.customerId][currency] = { sales: 0, receipts: 0, balance: 0 };
            }
            customerDebts[receipt.customerId][currency].receipts += receipt.amount;
        });

        // حساب الأرصدة
        const result: any[] = [];
        Object.entries(customerDebts).forEach(([customerId, currencies]) => {
            const customer = customers.find(c => c.id === customerId);
            Object.entries(currencies).forEach(([currency, data]) => {
                data.balance = data.sales - data.receipts;
                if (data.balance > 0) {
                    result.push({
                        id: customerId,
                        name: customer?.companyName || 'عميل غير معروف',
                        phone: customer?.phone,
                        currency,
                        totalSales: data.sales,
                        totalPaid: data.receipts,
                        balance: data.balance
                    });
                }
            });
        });

        return result.sort((a, b) => b.balance - a.balance);
    }, [sales, receiptVouchers, customers, selectedCurrency]);

    // حساب الديون المستحقة للموردين (عليك)
    const payables = useMemo(() => {
        const supplierDebts: Record<string, Record<string, { purchases: number; payments: number; balance: number }>> = {};

        // فواتير المشتريات الآجلة
        purchases.filter(p => p.paymentStatus !== 'paid').forEach(purchase => {
            const currency = purchase.currency || 'SAR';
            if (selectedCurrency !== 'ALL' && currency !== selectedCurrency) return;

            if (!supplierDebts[purchase.supplierId]) supplierDebts[purchase.supplierId] = {};
            if (!supplierDebts[purchase.supplierId][currency]) {
                supplierDebts[purchase.supplierId][currency] = { purchases: 0, payments: 0, balance: 0 };
            }
            supplierDebts[purchase.supplierId][currency].purchases += purchase.grandTotal;
        });

        // سندات الدفع
        paymentVouchers.filter(p => p.status === 'completed').forEach(payment => {
            const currency = payment.currency;
            if (selectedCurrency !== 'ALL' && currency !== selectedCurrency) return;

            if (!supplierDebts[payment.supplierId]) supplierDebts[payment.supplierId] = {};
            if (!supplierDebts[payment.supplierId][currency]) {
                supplierDebts[payment.supplierId][currency] = { purchases: 0, payments: 0, balance: 0 };
            }
            supplierDebts[payment.supplierId][currency].payments += payment.amount;
        });

        // حساب الأرصدة
        const result: any[] = [];
        Object.entries(supplierDebts).forEach(([supplierId, currencies]) => {
            const supplier = suppliers.find(s => s.id === supplierId);
            Object.entries(currencies).forEach(([currency, data]) => {
                data.balance = data.purchases - data.payments;
                if (data.balance > 0) {
                    result.push({
                        id: supplierId,
                        name: supplier?.companyName || 'مورد غير معروف',
                        phone: supplier?.phone,
                        currency,
                        totalPurchases: data.purchases,
                        totalPaid: data.payments,
                        balance: data.balance
                    });
                }
            });
        });

        return result.sort((a, b) => b.balance - a.balance);
    }, [purchases, paymentVouchers, suppliers, selectedCurrency]);

    // إجماليات حسب العملة
    const totals = useMemo(() => {
        const recTotals: Record<string, number> = {};
        const payTotals: Record<string, number> = {};

        receivables.forEach(r => {
            recTotals[r.currency] = (recTotals[r.currency] || 0) + r.balance;
        });

        payables.forEach(p => {
            payTotals[p.currency] = (payTotals[p.currency] || 0) + p.balance;
        });

        return { receivables: recTotals, payables: payTotals };
    }, [receivables, payables]);

    const currentData = activeView === 'receivables' ? receivables : payables;

    return (
        <div className="space-y-6">
            {/* فلتر العملة */}
            <div className={`flex items-center justify-between p-4 rounded-2xl border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'}`}>
                <div className="flex items-center gap-3">
                    <Coins size={20} className={theme === 'light' ? 'text-amber-500' : 'text-amber-400'} />
                    <span className={`text-sm font-bold ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>تصفية حسب العملة:</span>
                </div>
                <select
                    value={selectedCurrency}
                    onChange={e => setSelectedCurrency(e.target.value)}
                    className={`px-4 py-2 border rounded-xl font-bold ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-600 text-white'}`}
                >
                    <option value="ALL">جميع العملات</option>
                    {activeCurrencies.map(c => (
                        <option key={c.code} value={c.code}>{c.nameAr} ({c.symbol})</option>
                    ))}
                </select>
            </div>

            {/* ملخص الإجماليات */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* لك (المستحقات) */}
                <div className={`p-5 rounded-2xl border ${theme === 'light' ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200' : 'bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-800'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'light' ? 'bg-emerald-500' : 'bg-emerald-600'}`}>
                            <TrendingUp className="text-white" size={20} />
                        </div>
                        <div>
                            <h3 className={`font-black ${theme === 'light' ? 'text-emerald-900' : 'text-emerald-100'}`}>ديون لك (مستحقات)</h3>
                            <p className={`text-xs ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`}>المبالغ المستحقة من العملاء</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {Object.entries(totals.receivables).map(([currency, amount]) => (
                            <div key={currency} className="flex justify-between items-center">
                                <span className={`text-sm ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-300'}`}>
                                    {getCurrency(currency)?.nameAr}
                                </span>
                                <span className={`text-lg font-black ${theme === 'light' ? 'text-emerald-900' : 'text-emerald-100'}`}>
                                    {amount.toLocaleString()} {getCurrency(currency)?.symbol}
                                </span>
                            </div>
                        ))}
                        {Object.keys(totals.receivables).length === 0 && (
                            <p className={`text-sm ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`}>لا توجد مستحقات</p>
                        )}
                    </div>
                </div>

                {/* عليك (المدفوعات) */}
                <div className={`p-5 rounded-2xl border ${theme === 'light' ? 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200' : 'bg-gradient-to-br from-rose-900/20 to-pink-900/20 border-rose-800'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'light' ? 'bg-rose-500' : 'bg-rose-600'}`}>
                            <TrendingDown className="text-white" size={20} />
                        </div>
                        <div>
                            <h3 className={`font-black ${theme === 'light' ? 'text-rose-900' : 'text-rose-100'}`}>ديون عليك (التزامات)</h3>
                            <p className={`text-xs ${theme === 'light' ? 'text-rose-600' : 'text-rose-400'}`}>المبالغ المستحقة للموردين</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {Object.entries(totals.payables).map(([currency, amount]) => (
                            <div key={currency} className="flex justify-between items-center">
                                <span className={`text-sm ${theme === 'light' ? 'text-rose-700' : 'text-rose-300'}`}>
                                    {getCurrency(currency)?.nameAr}
                                </span>
                                <span className={`text-lg font-black ${theme === 'light' ? 'text-rose-900' : 'text-rose-100'}`}>
                                    {amount.toLocaleString()} {getCurrency(currency)?.symbol}
                                </span>
                            </div>
                        ))}
                        {Object.keys(totals.payables).length === 0 && (
                            <p className={`text-sm ${theme === 'light' ? 'text-rose-600' : 'text-rose-400'}`}>لا توجد التزامات</p>
                        )}
                    </div>
                </div>
            </div>

            {/* تبويبات */}
            <div className={`flex gap-2 p-1 rounded-xl ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}>
                <button
                    onClick={() => setActiveView('receivables')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${activeView === 'receivables'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                        : theme === 'light' ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:bg-slate-700'
                        }`}
                >
                    <Users size={18} />
                    ديون العملاء (لك) - {receivables.length}
                </button>
                <button
                    onClick={() => setActiveView('payables')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${activeView === 'payables'
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                        : theme === 'light' ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:bg-slate-700'
                        }`}
                >
                    <Building2 size={18} />
                    ديون الموردين (عليك) - {payables.length}
                </button>
            </div>

            {/* جدول الديون */}
            <div className={`rounded-2xl border overflow-hidden ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'}`}>
                <table className="w-full text-sm">
                    <thead className={activeView === 'receivables' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white' : 'bg-gradient-to-r from-rose-600 to-pink-600 text-white'}>
                        <tr>
                            <th className="p-4 text-start font-black">{activeView === 'receivables' ? 'العميل' : 'المورد'}</th>
                            <th className="p-4 text-center font-black">العملة</th>
                            <th className="p-4 text-center font-black">{activeView === 'receivables' ? 'إجمالي المبيعات' : 'إجمالي المشتريات'}</th>
                            <th className="p-4 text-center font-black">المدفوع</th>
                            <th className="p-4 text-center font-black">المتبقي</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.length > 0 ? currentData.map((item, idx) => (
                            <tr key={`${item.id}-${item.currency}`} className={`border-b ${theme === 'light' ? 'border-slate-100 hover:bg-slate-50' : 'border-slate-800 hover:bg-slate-800/50'}`}>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white ${activeView === 'receivables' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                            {item.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <span className={`font-black block ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>{item.name}</span>
                                            <span className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>{item.phone}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`font-bold px-3 py-1 rounded-full text-xs ${theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-slate-700 text-slate-300'}`}>
                                        {getCurrency(item.currency)?.symbol}
                                    </span>
                                </td>
                                <td className={`p-4 text-center font-bold ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                                    {(item.totalSales || item.totalPurchases || 0).toLocaleString()}
                                </td>
                                <td className="p-4 text-center font-bold text-emerald-500">
                                    {item.totalPaid.toLocaleString()}
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`font-black text-lg ${activeView === 'receivables' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {item.balance.toLocaleString()}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className={`p-12 text-center ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <CheckCircle size={40} className="mx-auto mb-3 text-emerald-500" />
                                    لا توجد ديون مستحقة
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DebtReport;
