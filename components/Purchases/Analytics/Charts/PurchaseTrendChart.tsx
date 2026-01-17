
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../../../../context/AppContext';

interface PurchaseTrendChartProps {
    data: any[];
}

const PurchaseTrendChart: React.FC<PurchaseTrendChartProps> = ({ data }) => {
    const { theme } = useApp();
    const isDark = theme === 'dark';

    return (
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h3 className={`text-sm font-bold mb-4 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>اتجاه المشتريات (المصروفات)</h3>
            <div className="h-[300px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1e293b' : '#e2e8f0'} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                            tickFormatter={(val) => `${val / 1000}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: isDark ? '#1e293b' : '#fff',
                                borderColor: isDark ? '#334155' : '#e2e8f0',
                                borderRadius: '12px',
                                fontSize: '12px',
                                color: isDark ? '#fff' : '#000'
                            }}
                            formatter={((value: number) => `${value.toLocaleString()} SAR`) as any}
                        />
                        <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="#ef4444"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorSpend)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PurchaseTrendChart;
