/**
 * كشف حساب العميل التفصيلي
 * Customer Account Statement with Multi-Currency Support
 */

import React, { useState, useMemo } from 'react';
import { useSales } from '../../context/SalesContext';
import { useVouchers } from '../../context/VouchersContext';
import { useCurrency } from '../../hooks/useCurrency';
import { useApp } from '../../context/AppContext';
import { User, Calendar, Coins, ArrowDownCircle, ArrowUpCircle, FileText, TrendingUp, TrendingDown, Printer } from 'lucide-react';
import Button from '../UI/Button';

const CustomerStatementReport: React.FC = () => {
    const { theme } = useApp();
    const { customers = [], sales = [] } = useSales();
    const { receiptVouchers } = useVouchers();
    const { activeCurrencies, getCurrency } = useCurrency();

    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState('ALL');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // حساب حركات العميل
    const customerStatement = useMemo(() => {
        if (!selectedCustomer) return { entries: [], totals: {} };

        let entries: any[] = [];

        // فواتير المبيعات
        const customerSales = sales.filter(s => s.customerId === selectedCustomer);
        customerSales.forEach(sale => {
            if (dateFrom && sale.date < dateFrom) return;
            if (dateTo && sale.date > dateTo) return;

            const currency = sale.saleCurrency || 'SAR';
            if (selectedCurrency !== 'ALL' && currency !== selectedCurrency) return;

            entries.push({
                id: sale.id,
                date: sale.date,
                type: 'invoice',
                reference: sale.invoiceNumber,
                description: `فاتورة مبيعات - ${sale.items.length} صنف`,
                debit: sale.grandTotal,
                credit: 0,
                currency,
                status: sale.status
            });
        });

        // سندات القبض
        const customerReceipts = receiptVouchers.filter(r => r.customerId === selectedCustomer);
        customerReceipts.forEach(receipt => {
            if (dateFrom && receipt.date < dateFrom) return;
            if (dateTo && receipt.date > dateTo) return;

            const currency = receipt.currency || 'SAR';
            if (selectedCurrency !== 'ALL' && currency !== selectedCurrency) return;

            entries.push({
                id: receipt.id,
                date: receipt.date,
                type: 'receipt',
                reference: receipt.voucherNumber,
                description: `سند قبض - ${receipt.paymentMethod === 'cash' ? 'نقدي' : 'بنكي'}`,
                debit: 0,
                credit: receipt.amount,
                currency,
                status: receipt.status
            });
        });

        // ترتيب حسب التاريخ
        entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // حساب الأرصدة لكل عملة
        const totals: Record<string, { debit: number; credit: number; balance: number }> = {};

        entries.forEach(entry => {
            if (!totals[entry.currency]) {
                totals[entry.currency] = { debit: 0, credit: 0, balance: 0 };
            }
            totals[entry.currency].debit += entry.debit;
            totals[entry.currency].credit += entry.credit;
            totals[entry.currency].balance = totals[entry.currency].debit - totals[entry.currency].credit;
        });

        // حساب الرصيد التراكمي
        const balanceByC: Record<string, number> = {};
        entries = entries.map(entry => {
            if (!balanceByC[entry.currency]) balanceByC[entry.currency] = 0;
            balanceByC[entry.currency] += entry.debit - entry.credit;
            return { ...entry, runningBalance: balanceByC[entry.currency] };
        });

        return { entries, totals };
    }, [selectedCustomer, selectedCurrency, dateFrom, dateTo, sales, receiptVouchers]);

    const selectedCustomerData = customers.find(c => c.id === selectedCustomer);

    return (
        <div className="space-y-6">
            {/* فلاتر البحث */}
            <div className={`p-5 rounded-2xl border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'}`}>
                <h3 className={`text-sm font-black mb-4 flex items-center gap-2 ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                    <User size={18} className="text-blue-500" /> كشف حساب العميل التفصيلي
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">العميل</label>
                        <select
                            value={selectedCustomer}
                            onChange={e => setSelectedCustomer(e.target.value)}
                            className={`w-full p-3 border rounded-xl font-bold ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-600 text-white'}`}
                        >
                            <option value="">-- اختر عميل --</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.companyName}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">العملة</label>
                        <select
                            value={selectedCurrency}
                            onChange={e => setSelectedCurrency(e.target.value)}
                            className={`w-full p-3 border rounded-xl font-bold ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-600 text-white'}`}
                        >
                            <option value="ALL">جميع العملات</option>
                            {activeCurrencies.map(c => (
                                <option key={c.code} value={c.code}>{c.nameAr} ({c.symbol})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">من تاريخ</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={e => setDateFrom(e.target.value)}
                            className={`w-full p-3 border rounded-xl font-bold ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-600 text-white'}`}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">إلى تاريخ</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={e => setDateTo(e.target.value)}
                            className={`w-full p-3 border rounded-xl font-bold ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-600 text-white'}`}
                        />
                    </div>
                </div>
            </div>

            {selectedCustomer && (
                <>
                    {/* معلومات العميل */}
                    <div className={`p-5 rounded-2xl border ${theme === 'light' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' : 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-800'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${theme === 'light' ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'}`}>
                                    {selectedCustomerData?.companyName?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className={`text-lg font-black ${theme === 'light' ? 'text-blue-900' : 'text-blue-100'}`}>
                                        {selectedCustomerData?.companyName}
                                    </h3>
                                    <p className={`text-sm ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}>
                                        {selectedCustomerData?.phone}
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" icon={<Printer size={14} />} onClick={() => window.print()}>
                                طباعة
                            </Button>
                        </div>
                    </div>

                    {/* ملخص الأرصدة بكل عملة */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(customerStatement.totals).map(([currency, data]) => {
                            const currencyInfo = getCurrency(currency);
                            const isPositive = data.balance > 0;
                            return (
                                <div key={currency} className={`p-5 rounded-2xl border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'}`}>
                                            {currencyInfo?.nameAr} ({currencyInfo?.symbol})
                                        </span>
                                        {isPositive ? (
                                            <TrendingUp className="text-rose-500" size={18} />
                                        ) : (
                                            <TrendingDown className="text-emerald-500" size={18} />
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>مدين (عليه)</span>
                                            <span className="font-black text-rose-500">{data.debit.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>دائن (دفع)</span>
                                            <span className="font-black text-emerald-500">{data.credit.toLocaleString()}</span>
                                        </div>
                                        <div className={`flex justify-between text-lg font-black pt-2 border-t ${theme === 'light' ? 'border-slate-200' : 'border-slate-700'}`}>
                                            <span>الرصيد</span>
                                            <span className={isPositive ? 'text-rose-600' : 'text-emerald-600'}>
                                                {Math.abs(data.balance).toLocaleString()} {isPositive ? '(له)' : '(عليه)'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* جدول الحركات التفصيلي */}
                    <div className={`rounded-2xl border overflow-hidden ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'}`}>
                        <div className={`p-4 border-b ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
                            <h3 className={`text-sm font-black ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                                الحركات التفصيلية ({customerStatement.entries.length} حركة)
                            </h3>
                        </div>

                        <table className="w-full text-sm">
                            <thead className={`${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}>
                                <tr>
                                    <th className={`p-3 text-start font-black ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>التاريخ</th>
                                    <th className={`p-3 text-start font-black ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>المرجع</th>
                                    <th className={`p-3 text-start font-black ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>البيان</th>
                                    <th className={`p-3 text-center font-black ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>العملة</th>
                                    <th className={`p-3 text-center font-black text-rose-600`}>مدين</th>
                                    <th className={`p-3 text-center font-black text-emerald-600`}>دائن</th>
                                    <th className={`p-3 text-center font-black ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>الرصيد</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customerStatement.entries.length > 0 ? customerStatement.entries.map((entry, idx) => (
                                    <tr key={entry.id} className={`border-b ${theme === 'light' ? 'border-slate-100 hover:bg-slate-50' : 'border-slate-800 hover:bg-slate-800/50'}`}>
                                        <td className={`p-3 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{entry.date}</td>
                                        <td className="p-3">
                                            <span className={`font-bold ${entry.type === 'invoice' ? 'text-blue-600' : 'text-emerald-600'}`}>
                                                {entry.reference}
                                            </span>
                                        </td>
                                        <td className={`p-3 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                                            <div className="flex items-center gap-2">
                                                {entry.type === 'invoice' ? (
                                                    <FileText size={14} className="text-blue-500" />
                                                ) : (
                                                    <ArrowDownCircle size={14} className="text-emerald-500" />
                                                )}
                                                {entry.description}
                                            </div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-700'}`}>
                                                {getCurrency(entry.currency)?.symbol}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center font-black text-rose-500">
                                            {entry.debit > 0 ? entry.debit.toLocaleString() : '-'}
                                        </td>
                                        <td className="p-3 text-center font-black text-emerald-500">
                                            {entry.credit > 0 ? entry.credit.toLocaleString() : '-'}
                                        </td>
                                        <td className={`p-3 text-center font-black ${entry.runningBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {Math.abs(entry.runningBalance).toLocaleString()}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className={`p-12 text-center ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                                            لا توجد حركات للعميل في الفترة المحددة
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {!selectedCustomer && (
                <div className={`p-16 text-center rounded-2xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-700'}`}>
                    <User size={48} className={`mx-auto mb-4 ${theme === 'light' ? 'text-slate-300' : 'text-slate-600'}`} />
                    <p className={`font-bold ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                        اختر عميل لعرض كشف حسابه التفصيلي
                    </p>
                </div>
            )}
        </div>
    );
};

export default CustomerStatementReport;
