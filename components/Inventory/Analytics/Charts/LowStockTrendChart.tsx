
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { useApp } from '../../../../context/AppContext';

interface LowStockTrendChartProps {
    data: { name: string; quantity: number; minQuantity: number }[];
}

const LowStockTrendChart: React.FC<LowStockTrendChartProps> = ({ data }) => {
    const { theme } = useApp();
    const isDark = theme === 'dark';

    return (
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>أصناف أوشكت على النفاد</h3>
                <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">أقل من الحد الأدنى</span>
            </div>
            <div className="h-[300px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={100}
                            tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: isDark ? '#334155' : '#f1f5f9', opacity: 0.4 }}
                            contentStyle={{
                                backgroundColor: isDark ? '#1e293b' : '#fff',
                                borderColor: isDark ? '#334155' : '#e2e8f0',
                                borderRadius: '8px',
                                fontSize: '12px'
                            }}
                        />
                        <Bar dataKey="quantity" name="الكمية الحالية" radius={[0, 4, 4, 0]} barSize={15} fill="#ef4444" />
                        <Bar dataKey="minQuantity" name="الحد الأدنى" radius={[0, 4, 4, 0]} barSize={15} fill="#94a3b8" opacity={0.3} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default LowStockTrendChart;
