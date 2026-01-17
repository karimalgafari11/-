
import React, { useState, useMemo } from 'react';
import { Purchase, PurchaseReturn } from '../../../types';
import PurchaseTrendChart from './Charts/PurchaseTrendChart';
import PurchasePaymentMethodChart from './Charts/PurchasePaymentMethodChart';
import TopSuppliersChart from './Charts/TopSuppliersChart';
import { Calendar, TrendingDown, DollarSign, Activity } from 'lucide-react';

interface PurchaseAnalysisEngineProps {
    purchases: Purchase[];
    returns: PurchaseReturn[];
}

const PurchaseAnalysisEngine: React.FC<PurchaseAnalysisEngineProps> = ({ purchases, returns }) => {
    const [period, setPeriod] = useState<'7days' | '30days' | 'month' | 'year' | 'all'>('year');

    // Logic: Analysis Engine
    const analysis = useMemo(() => {
        // 1. Filter by Date
        const now = new Date();
        const filteredPurchases = purchases.filter(p => {
            const d = new Date(p.date);
            if (period === '7days') return (now.getTime() - d.getTime()) / (1000 * 3600 * 24) <= 7;
            if (period === '30days') return (now.getTime() - d.getTime()) / (1000 * 3600 * 24) <= 30;
            if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            if (period === 'year') return d.getFullYear() === now.getFullYear();
            if (period === 'all') return true;
            return true;
        });

        if (filteredPurchases.length === 0) return null;

        // 2. Aggregate Trend (Daily)
        const trendMap = new Map<string, number>();
        filteredPurchases.forEach(p => {
            const date = p.date; // YYYY-MM-DD
            const amount = p.grandTotal || 0;
            trendMap.set(date, (trendMap.get(date) || 0) + amount);
        });

        // Convert to sorted array
        const trendData = Array.from(trendMap.entries())
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


        // 3. Aggregate Payment Methods
        const paymentMap = { cash: 0, credit: 0, transfer: 0 };
        filteredPurchases.forEach(p => {
            const amount = p.grandTotal || 0;
            if (p.paymentMethod === 'cash') paymentMap.cash += amount;
            else if (p.paymentMethod === 'credit') paymentMap.credit += amount;
            else paymentMap.transfer += amount;
        });
        const paymentData = [
            { name: 'نقدي', value: paymentMap.cash },
            { name: 'آجل', value: paymentMap.credit },
            { name: 'تحويل', value: paymentMap.transfer },
        ].filter(i => i.value > 0);


        // 4. Top Suppliers
        const supplierMap = new Map<string, number>();
        filteredPurchases.forEach(p => {
            if (p.supplierName) {
                supplierMap.set(p.supplierName, (supplierMap.get(p.supplierName) || 0) + (p.grandTotal || 0));
            }
        });

        const supplierData = Array.from(supplierMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);


        // 5. KPIs
        const totalSpend = filteredPurchases.reduce((sum, p) => sum + (p.grandTotal || 0), 0);
        const invoiceCount = filteredPurchases.length;
        const avgOrderValue = invoiceCount > 0 ? totalSpend / invoiceCount : 0;

        return {
            trendData,
            paymentData,
            supplierData,
            kpis: {
                totalSpend,
                invoiceCount,
                avgOrderValue
            }
        };

    }, [purchases, period]);

    // Loading / Empty State
    if (!analysis) {
        const hasAnyData = purchases.length > 0;
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Activity className="text-slate-400" size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
                    {hasAnyData ? 'لا توجد بيانات للفترة المحددة' : 'لا توجد مشتريات مسجلة بعد'} ({purchases.length})
                </h3>
                <p className="text-slate-500 text-sm mt-2">
                    {hasAnyData
                        ? 'حاول تغيير الفترة الزمنية لعرض البيانات'
                        : 'قم بإنشاء عمليات شراء لتبدأ لوحة التحليل بالعمل'}
                </p>
                {hasAnyData && (
                    <button
                        onClick={() => setPeriod('all')}
                        className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        عرض كل البيانات
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">

            {/* 1. Control Bar */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="font-black text-slate-800 dark:text-slate-200 px-4 flex items-center gap-2">
                    <TrendingDown size={20} className="text-red-500" />
                    لوحة تحليل المصروفات
                </h2>

                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    {[
                        { id: '7days', label: '7 أيام' },
                        { id: '30days', label: '30 يوم' },
                        { id: 'month', label: 'هذا الشهر' },
                        { id: 'month', label: 'هذا الشهر' },
                        { id: 'year', label: 'هذا العام' },
                        { id: 'all', label: 'الكل' },
                    ].map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setPeriod(opt.id as any)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${period === opt.id
                                ? 'bg-white dark:bg-slate-700 text-red-500 shadow-sm'
                                : 'text-slate-500 hover:text-red-500'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg shadow-red-500/20">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-red-100 text-xs font-bold uppercase tracking-wider">إجمالي المصروفات</p>
                            <h3 className="text-3xl font-black mt-1">{analysis.kpis.totalSpend.toLocaleString()} <span className="text-sm opacity-70">SAR</span></h3>
                        </div>
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                            <DollarSign size={20} />
                        </div>
                    </div>
                    <div className="text-xs text-red-200">
                        خلال الفترة المحددة ({period})
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">متوسط قيمة التوريد</p>
                            <h3 className="text-3xl font-black mt-1 text-slate-800 dark:text-slate-100">{Math.round(analysis.kpis.avgOrderValue).toLocaleString()} <span className="text-sm text-slate-400">SAR</span></h3>
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
                    <PurchaseTrendChart data={analysis.trendData} />
                </div>
                <div className="lg:col-span-1">
                    <PurchasePaymentMethodChart data={analysis.paymentData} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopSuppliersChart data={analysis.supplierData} />
            </div>

        </div>
    );
};

export default PurchaseAnalysisEngine;
