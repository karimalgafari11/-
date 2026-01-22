/**
 * Dashboard - لوحة تحكم الزهراء
 * تم تقسيم هذا المكون إلى ملفات أصغر:
 * - components/FuturisticCard.tsx - بطاقة بتصميم مستقبلي
 * - components/AutoStatCard.tsx - بطاقة إحصائية
 * - hooks/useDashboardStats.ts - حساب الإحصائيات
 * - hooks/useDashboardCharts.ts - بيانات الرسوم البيانية
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useFinance } from '../../context/FinanceContext';
import { useInventory } from '../../context/InventoryContext';
import { useSales } from '../../context/SalesContext';
import { usePurchases } from '../../context/PurchasesContext';
import {
    TrendingUp, DollarSign, Package, Users, Truck, Gauge,
    AlertTriangle, Zap, Activity, ShoppingCart
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { PrivacyToggle, usePrivacy } from '../../components/Common/PrivacyToggle';

// استيراد المكونات المستخرجة
import { FuturisticCard, AutoStatCard } from './components';
import { useDashboardStats, useMonthlyChartData, useCategoryData, useTopProducts } from './hooks';

// ===================== مكون Dashboard الرئيسي =====================

const Dashboard: React.FC = () => {
    const { ui, theme } = useApp();
    const { transactions } = useFinance();
    const { inventory } = useInventory();
    const { customers, invoices } = useSales();
    const { suppliers, purchases } = usePurchases();
    const { isHidden, maskValue } = usePrivacy();

    // استخدام الـ hooks المستخرجة
    const stats = useDashboardStats(transactions, inventory);
    const chartData = useMonthlyChartData(transactions);
    const categoryData = useCategoryData(inventory);
    const topProducts = useTopProducts(invoices);

    const isDark = theme === 'dark';

    // تأخير عرض الرسوم البيانية حتى يكتمل التخطيط
    const [chartsReady, setChartsReady] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setChartsReady(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'} space-y-4 sm:space-y-6 p-1 animate-in fade-in duration-700`}>

            {/* الشريط العلوي - عنوان مستقبلي */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl ${isDark ? 'bg-gradient-to-r from-cyan-900/30 via-slate-900 to-purple-900/30 border border-cyan-500/10' : 'bg-gradient-to-r from-cyan-50 to-purple-50'}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${isDark ? 'bg-cyan-500/20' : 'bg-cyan-100'}`}>
                        <Gauge size={20} className="text-cyan-500 sm:w-7 sm:h-7" />
                    </div>
                    <div>
                        <h1 className={`text-base sm:text-xl font-black page-title ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            🚗 لوحة تحكم الزهراء
                        </h1>
                        <p className={`text-[9px] sm:text-xs page-subtitle ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                            نظام إدارة قطع غيار السيارات
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <PrivacyToggle />
                    <div className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'} text-xs font-bold`}>
                        <Zap size={14} />
                        النظام يعمل بكفاءة
                    </div>
                </div>
            </div>

            {/* شبكة الإحصائيات الرئيسية */}
            {ui.showDashboardStats && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-4 mobile-gap-2">
                    <AutoStatCard icon={DollarSign} label="الإيرادات" value={stats.revenue} trend={`${Number(stats.revenueChange) >= 0 ? '+' : ''}${stats.revenueChange}%`} isUp={Number(stats.revenueChange) >= 0} color="cyan" subtitle="ريال سعودي" isDark={isDark} isHidden={isHidden} maskValue={maskValue} />
                    <AutoStatCard icon={ShoppingCart} label="المشتريات" value={stats.expenses} trend={`${Number(stats.expensesChange) >= 0 ? '+' : ''}${stats.expensesChange}%`} isUp={Number(stats.expensesChange) < 0} color="purple" isDark={isDark} isHidden={isHidden} maskValue={maskValue} />
                    <AutoStatCard icon={TrendingUp} label="الأرباح" value={stats.profit} trend={`${Number(stats.profitChange) >= 0 ? '+' : ''}${stats.profitChange}%`} isUp={Number(stats.profitChange) >= 0} color="emerald" isDark={isDark} isHidden={isHidden} maskValue={maskValue} />
                    <AutoStatCard icon={Package} label="قطع الغيار" value={stats.totalItems} color="amber" subtitle={`${stats.lowStockItems} منخفض`} isDark={isDark} isHidden={isHidden} maskValue={maskValue} />
                    <AutoStatCard icon={Users} label="العملاء" value={customers.length} color="blue" isDark={isDark} isHidden={isHidden} maskValue={maskValue} />
                    <AutoStatCard icon={Truck} label="الموردين" value={suppliers.length} color="slate" isDark={isDark} isHidden={isHidden} maskValue={maskValue} />
                </div>
            )}

            {/* تنبيه المخزون المنخفض */}
            {stats.lowStockItems > 0 && (
                <div className={`flex items-center gap-4 p-4 rounded-2xl ${isDark ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-amber-50 border border-amber-200'}`}>
                    <AlertTriangle className="text-amber-500" size={24} />
                    <div>
                        <p className={`font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                            تنبيه: {stats.lowStockItems} قطعة غيار تحتاج لإعادة طلب
                        </p>
                        <p className={`text-xs ${isDark ? 'text-amber-500/70' : 'text-amber-600'}`}>
                            راجع قائمة المخزون لتجديد القطع الناقصة
                        </p>
                    </div>
                </div>
            )}

            {/* الرسوم البيانية */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                {/* رسم التدفق النقدي */}
                {ui.showDashboardCharts && (
                    <FuturisticCard className="lg:col-span-8" glow isDark={isDark}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
                            <div>
                                <h3 className={`font-black text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>📊 تحليل الأداء المالي</h3>
                                <p className={`text-[9px] sm:text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>المبيعات والمشتريات للأشهر الستة</p>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 text-[9px] sm:text-xs font-bold">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-cyan-500"></span>مبيعات</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-purple-500"></span>مشتريات</span>
                                <span className="hidden sm:flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span>أرباح</span>
                            </div>
                        </div>
                        <div className="h-[200px] sm:h-[300px] mobile-chart" style={{ minWidth: 100, minHeight: 150 }}>
                            {chartsReady && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 10 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 10 }} hide />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                                                background: isDark ? '#0f172a' : 'white',
                                                color: isDark ? '#e2e8f0' : '#334155'
                                            }}
                                        />
                                        <Area type="monotone" dataKey="مبيعات" stroke="#06b6d4" strokeWidth={2} fill="url(#gradCyan)" />
                                        <Area type="monotone" dataKey="مشتريات" stroke="#8b5cf6" strokeWidth={2} fill="url(#gradPurple)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </FuturisticCard>
                )}

                {/* توزيع المخزون */}
                <FuturisticCard className="lg:col-span-4" glow isDark={isDark}>
                    <h3 className={`font-black mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>🔧 توزيع قطع الغيار</h3>
                    <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>حسب الفئة</p>
                    <div className="h-[200px]" style={{ minWidth: 100, minHeight: 100 }}>
                        {chartsReady && (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData.length > 0 ? categoryData : [{ name: 'لا توجد بيانات', value: 1, fill: '#64748b' }]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {categoryData.slice(0, 4).map((cat, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.fill }}></span>
                                <span className={`text-[10px] font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </FuturisticCard>
            </div>

            {/* أفضل المنتجات مبيعاً */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FuturisticCard glow isDark={isDark}>
                    <h3 className={`font-black mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>🏆 أفضل القطع مبيعاً</h3>
                    <div className="h-[250px]" style={{ minWidth: 100, minHeight: 150 }}>
                        {chartsReady && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topProducts} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 10 }} />
                                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }} width={120} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: isDark ? '#0f172a' : 'white' }} />
                                    <Bar dataKey="مبيعات" radius={[0, 8, 8, 0]}>
                                        {topProducts.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </FuturisticCard>

                {/* مؤشرات الأداء السريعة */}
                <FuturisticCard glow isDark={isDark}>
                    <h3 className={`font-black mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>⚡ مؤشرات الأداء</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'معدل دوران المخزون', value: `${stats.inventoryTurnover}x`, icon: Activity, color: 'cyan' },
                            { label: 'هامش الربح', value: `${stats.profitMargin}%`, icon: TrendingUp, color: 'emerald' },
                            { label: 'فواتير معلقة', value: invoices.filter(i => i.status === 'pending').length, icon: AlertTriangle, color: 'amber' },
                            { label: 'طلبات اليوم', value: purchases.length, icon: Truck, color: 'purple' }
                        ].map((item, i) => (
                            <div key={i} className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'} flex items-center gap-3`}>
                                <div className={`p-2 rounded-lg bg-${item.color}-500/20`}>
                                    <item.icon size={18} className={`text-${item.color}-500`} />
                                </div>
                                <div>
                                    <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.value}</p>
                                    <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </FuturisticCard>
            </div>
        </div>
    );
};

export default Dashboard;
