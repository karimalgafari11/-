
import React, { useState, useMemo } from 'react';
import { Sale, SaleReturn } from '../../../types';
import SalesTrendChart from './Charts/SalesTrendChart';
import PaymentMethodChart from './Charts/PaymentMethodChart';
import TopProductsChart from './Charts/TopProductsChart';
import { Calendar, TrendingUp, DollarSign, Activity } from 'lucide-react';

interface SalesAnalysisEngineProps {
    sales: Sale[];
    returns: SaleReturn[];
}

const SalesAnalysisEngine: React.FC<SalesAnalysisEngineProps> = ({ sales, returns }) => {
    const [period, setPeriod] = useState<'7days' | '30days' | 'month' | 'year'>('30days');

    // Logic: Analysis Engine
    const analysis = useMemo(() => {
        // 1. Filter by Date
        const now = new Date();
        const filteredSales = sales.filter(s => {
            const d = new Date(s.date);
            if (period === '7days') return (now.getTime() - d.getTime()) / (1000 * 3600 * 24) <= 7;
            if (period === '30days') return (now.getTime() - d.getTime()) / (1000 * 3600 * 24) <= 30;
            if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            if (period === 'year') return d.getFullYear() === now.getFullYear();
            return true;
        });

        if (filteredSales.length === 0) return null;

        // 2. Aggregate Trend (Daily)
        const trendMap = new Map<string, number>();
        filteredSales.forEach(s => {
            const date = s.date; // YYYY-MM-DD
            const amount = s.baseGrandTotal || (s.saleCurrency === 'SAR' ? s.grandTotal : 0);
            trendMap.set(date, (trendMap.get(date) || 0) + amount);
        });

        // Convert to sorted array
        const trendData = Array.from(trendMap.entries())
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


        // 3. Aggregate Payment Methods
        const paymentMap = { cash: 0, credit: 0, transfer: 0 };
        filteredSales.forEach(s => {
            const amount = s.baseGrandTotal || (s.saleCurrency === 'SAR' ? s.grandTotal : 0);
            if (s.paymentMethod === 'cash') paymentMap.cash += amount;
            else if (s.paymentMethod === 'credit') paymentMap.credit += amount;
            else paymentMap.transfer += amount;
        });
        const paymentData = [
            { name: 'نقدي', value: paymentMap.cash },
            { name: 'آجل', value: paymentMap.credit },
            { name: 'تحويل', value: paymentMap.transfer },
        ].filter(i => i.value > 0);


        // 4. Top Products (Expensive computation, optimize if needed)
        const productMap = new Map<string, number>();
        filteredSales.forEach(s => {
            s.items.forEach(item => {
                const itemTotal = item.quantity * item.unitPrice; // unitPrice is base SAR usually
                productMap.set(item.name, (productMap.get(item.name) || 0) + itemTotal);
            });
        });

        const productData = Array.from(productMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);


        // 5. KPIs
        const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.baseGrandTotal || 0), 0);
        const invoiceCount = filteredSales.length;
        const aov = invoiceCount > 0 ? totalRevenue / invoiceCount : 0;

        return {
            trendData,
            paymentData,
            productData,
            kpis: {
                totalRevenue,
                invoiceCount,
                aov
            }
        };

    }, [sales, period]);

    // Loading / Empty State
    if (!analysis) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Activity className="text-slate-400" size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">لا توجد بيانات كافية للتحليل</h3>
                <p className="text-slate-500 text-sm mt-2">قم بإنشاء عمليات بيع لتبدأ لوحة التحليل بالعمل</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">

            {/* 1. Control Bar */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="font-black text-slate-800 dark:text-slate-200 px-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-indigo-600" />
                    لوحة الذكاء التحليلي
                </h2>

                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    {[
                        { id: '7days', label: '7 أيام' },
                        { id: '30days', label: '30 يوم' },
                        { id: 'month', label: 'هذا الشهر' },
                        { id: 'year', label: 'هذا العام' },
                    ].map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setPeriod(opt.id as any)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${period === opt.id
                                    ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-indigo-500'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider">صافي الإيرادات</p>
                            <h3 className="text-3xl font-black mt-1">{analysis.kpis.totalRevenue.toLocaleString()} <span className="text-sm opacity-70">SAR</span></h3>
                        </div>
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                            <DollarSign size={20} />
                        </div>
                    </div>
                    <div className="text-xs text-indigo-200">
                        خلال الفترة المحددة ({period})
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">متوسط قيمة السلة (AOV)</p>
                            <h3 className="text-3xl font-black mt-1 text-slate-800 dark:text-slate-100">{Math.round(analysis.kpis.aov).toLocaleString()} <span className="text-sm text-slate-400">SAR</span></h3>
                        </div>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Activity size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">عدد العمليات</p>
                            <h3 className="text-3xl font-black mt-1 text-slate-800 dark:text-slate-100">{analysis.kpis.invoiceCount}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Calendar size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto">
                <div className="lg:col-span-2">
                    <SalesTrendChart data={analysis.trendData} />
                </div>
                <div className="lg:col-span-1">
                    <PaymentMethodChart data={analysis.paymentData} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopProductsChart data={analysis.productData} />
                {/* Future: Customer Chart */}
            </div>

        </div>
    );
};

export default SalesAnalysisEngine;
