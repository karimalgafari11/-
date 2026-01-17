/**
 * FxGainLossReport - تقرير أرباح وخسائر فروق العملات
 * يعرض جميع المعاملات بعملات أجنبية مع حساب الفروقات
 */

import React, { useMemo, useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { useApp } from '../../context/AppContext';
import { useCurrency } from '../../hooks/useCurrency';
import {
    TrendingUp, TrendingDown, DollarSign, Calendar,
    ArrowUpRight, ArrowDownRight, Filter, Download,
    RefreshCw, Coins
} from 'lucide-react';

interface FxTransaction {
    id: string;
    date: string;
    type: 'sale' | 'payment' | 'purchase';
    typeLabel: string;
    reference: string;
    currency: string;
    originalAmount: number;
    exchangeRateUsed: number;
    baseAmount: number;
    currentRate: number;
    currentBaseAmount: number;
    gainLoss: number;
    status: 'realized' | 'unrealized';
}

const FxGainLossReport: React.FC = () => {
    const { sales = [] } = useSales();
    const { theme } = useApp();
    const { getCurrentRate, formatCurrency, BASE_CURRENCY } = useCurrency();

    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [filterCurrency, setFilterCurrency] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'realized' | 'unrealized'>('all');

    const isDark = theme === 'dark';

    // حساب معاملات فروق العملة
    const fxTransactions = useMemo((): FxTransaction[] => {
        const transactions: FxTransaction[] = [];

        // معاملات المبيعات بعملات أجنبية
        sales
            .filter(sale => sale.saleCurrency && sale.saleCurrency !== BASE_CURRENCY)
            .filter(sale => {
                const saleDate = sale.date;
                return saleDate >= dateRange.start && saleDate <= dateRange.end;
            })
            .forEach(sale => {
                const currentRate = getCurrentRate(BASE_CURRENCY, sale.saleCurrency);
                const originalRate = sale.exchangeRateUsed || currentRate;
                const baseAmount = sale.baseGrandTotal || (sale.grandTotal / originalRate);
                const currentBaseAmount = sale.grandTotal / currentRate;
                const gainLoss = currentBaseAmount - baseAmount;

                // فقط إظهار المعاملات ذات الفرق الملموس
                if (Math.abs(gainLoss) > 0.01) {
                    transactions.push({
                        id: sale.id,
                        date: sale.date,
                        type: 'sale',
                        typeLabel: 'فاتورة مبيعات',
                        reference: sale.invoiceNumber,
                        currency: sale.saleCurrency,
                        originalAmount: sale.grandTotal,
                        exchangeRateUsed: originalRate,
                        baseAmount: baseAmount,
                        currentRate: currentRate,
                        currentBaseAmount: currentBaseAmount,
                        gainLoss: gainLoss,
                        status: sale.status === 'paid' ? 'realized' : 'unrealized'
                    });
                }
            });

        // ترتيب حسب التاريخ
        return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [sales, dateRange, getCurrentRate, BASE_CURRENCY]);

    // تصفية المعاملات
    const filteredTransactions = useMemo(() => {
        return fxTransactions.filter(tx => {
            if (filterCurrency !== 'all' && tx.currency !== filterCurrency) return false;
            if (filterStatus !== 'all' && tx.status !== filterStatus) return false;
            return true;
        });
    }, [fxTransactions, filterCurrency, filterStatus]);

    // حساب الإجماليات
    const totals = useMemo(() => {
        const realized = filteredTransactions
            .filter(tx => tx.status === 'realized')
            .reduce((sum, tx) => sum + tx.gainLoss, 0);

        const unrealized = filteredTransactions
            .filter(tx => tx.status === 'unrealized')
            .reduce((sum, tx) => sum + tx.gainLoss, 0);

        return {
            totalGain: filteredTransactions.filter(tx => tx.gainLoss > 0).reduce((sum, tx) => sum + tx.gainLoss, 0),
            totalLoss: filteredTransactions.filter(tx => tx.gainLoss < 0).reduce((sum, tx) => sum + Math.abs(tx.gainLoss), 0),
            netGainLoss: realized + unrealized,
            realized,
            unrealized,
            count: filteredTransactions.length
        };
    }, [filteredTransactions]);

    // العملات المستخدمة
    const usedCurrencies = useMemo(() => {
        const currencies = new Set(fxTransactions.map(tx => tx.currency));
        return Array.from(currencies);
    }, [fxTransactions]);

    const getCurrencySymbol = (code: string) => {
        switch (code) {
            case 'YER': return '﷼';
            case 'SAR': return 'ر.س';
            case 'OMR': return 'ر.ع';
            case 'USD': return '$';
            default: return code;
        }
    };

    return (
        <div className={`p-6 space-y-6 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
            {/* العنوان */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                        <Coins className="text-purple-500" size={24} />
                    </div>
                    <div>
                        <h1 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            تقرير أرباح وخسائر فروق العملات
                        </h1>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            تحليل فروقات الصرف للمعاملات بالعملات الأجنبية
                        </p>
                    </div>
                </div>
                <button className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-100'} transition-colors`}>
                    <Download size={16} />
                    تصدير PDF
                </button>
            </div>

            {/* الفلاتر */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className={`px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-slate-700 text-white border-slate-600' : 'bg-slate-50 border-slate-200'} border`}
                        />
                        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>إلى</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className={`px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-slate-700 text-white border-slate-600' : 'bg-slate-50 border-slate-200'} border`}
                        />
                    </div>

                    <select
                        value={filterCurrency}
                        onChange={(e) => setFilterCurrency(e.target.value)}
                        className={`px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-slate-700 text-white border-slate-600' : 'bg-slate-50 border-slate-200'} border`}
                    >
                        <option value="all">جميع العملات</option>
                        {usedCurrencies.map(cur => (
                            <option key={cur} value={cur}>{cur} - {getCurrencySymbol(cur)}</option>
                        ))}
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as 'all' | 'realized' | 'unrealized')}
                        className={`px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-slate-700 text-white border-slate-600' : 'bg-slate-50 border-slate-200'} border`}
                    >
                        <option value="all">الكل</option>
                        <option value="realized">محققة</option>
                        <option value="unrealized">غير محققة</option>
                    </select>
                </div>
            </div>

            {/* بطاقات الإحصائيات */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="text-emerald-500" size={20} />
                        <span className={`text-sm font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                            أرباح الصرف
                        </span>
                    </div>
                    <p className={`text-2xl font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {totals.totalGain.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} <span className="text-sm">ر.س</span>
                    </p>
                </div>

                <div className={`p-4 rounded-xl ${isDark ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-rose-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="text-rose-500" size={20} />
                        <span className={`text-sm font-bold ${isDark ? 'text-rose-400' : 'text-rose-700'}`}>
                            خسائر الصرف
                        </span>
                    </div>
                    <p className={`text-2xl font-black ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                        {totals.totalLoss.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} <span className="text-sm">ر.س</span>
                    </p>
                </div>

                <div className={`p-4 rounded-xl ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="text-blue-500" size={20} />
                        <span className={`text-sm font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                            صافي الأثر
                        </span>
                    </div>
                    <p className={`text-2xl font-black ${totals.netGainLoss >= 0 ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-rose-400' : 'text-rose-600')}`}>
                        {totals.netGainLoss >= 0 ? '+' : ''}{totals.netGainLoss.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} <span className="text-sm">ر.س</span>
                    </p>
                </div>

                <div className={`p-4 rounded-xl ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <RefreshCw className="text-amber-500" size={20} />
                        <span className={`text-sm font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                            غير محققة
                        </span>
                    </div>
                    <p className={`text-2xl font-black ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                        {totals.unrealized.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} <span className="text-sm">ر.س</span>
                    </p>
                </div>
            </div>

            {/* جدول المعاملات */}
            <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
                <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        تفاصيل المعاملات ({filteredTransactions.length})
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className={`text-xs ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                            <tr>
                                <th className="px-4 py-3 text-right">التاريخ</th>
                                <th className="px-4 py-3 text-right">النوع</th>
                                <th className="px-4 py-3 text-right">المرجع</th>
                                <th className="px-4 py-3 text-right">العملة</th>
                                <th className="px-4 py-3 text-right">المبلغ</th>
                                <th className="px-4 py-3 text-right">سعر الفاتورة</th>
                                <th className="px-4 py-3 text-right">المعادل SAR</th>
                                <th className="px-4 py-3 text-right">السعر الحالي</th>
                                <th className="px-4 py-3 text-right">ربح/خسارة</th>
                                <th className="px-4 py-3 text-right">الحالة</th>
                            </tr>
                        </thead>
                        <tbody className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-8 text-center">
                                        <div className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            لا توجد معاملات بعملات أجنبية في الفترة المحددة
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((tx) => (
                                    <tr key={tx.id} className={`border-t ${isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                                        <td className="px-4 py-3 text-sm font-medium">{tx.date}</td>
                                        <td className="px-4 py-3 text-sm">{tx.typeLabel}</td>
                                        <td className="px-4 py-3 text-sm font-mono">{tx.reference}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                                                {getCurrencySymbol(tx.currency)} {tx.currency}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold tabular-nums">
                                            {tx.originalAmount.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-sm tabular-nums">
                                            {tx.exchangeRateUsed.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold tabular-nums">
                                            {tx.baseAmount.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-4 py-3 text-sm tabular-nums">
                                            {tx.currentRate.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className={`flex items-center gap-1 text-sm font-bold ${tx.gainLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {tx.gainLoss >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                {tx.gainLoss >= 0 ? '+' : ''}{tx.gainLoss.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${tx.status === 'realized'
                                                ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700')
                                                : (isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700')
                                                }`}>
                                                {tx.status === 'realized' ? 'محققة' : 'غير محققة'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ملاحظات */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                    <strong>ملاحظة:</strong> الأرباح/الخسائر المحققة تُسجل عند السداد الفعلي.
                    الأرباح/الخسائر غير المحققة تُحسب بناءً على سعر الصرف الحالي للفواتير الآجلة المفتوحة.
                </p>
            </div>
        </div>
    );
};

export default FxGainLossReport;
