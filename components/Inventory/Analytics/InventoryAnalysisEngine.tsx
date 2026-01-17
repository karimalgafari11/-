
import React, { useMemo } from 'react';
import { InventoryItem, Warehouse } from '../../../types';
import StockDistributionChart from './Charts/StockDistributionChart';
import WarehouseOccupancyChart from './Charts/WarehouseOccupancyChart';
import LowStockTrendChart from './Charts/LowStockTrendChart';
import { Package, AlertTriangle, Calculator, Layers } from 'lucide-react';

interface InventoryAnalysisEngineProps {
    inventory: InventoryItem[];
    warehouses: Warehouse[];
}

const InventoryAnalysisEngine: React.FC<InventoryAnalysisEngineProps> = ({ inventory, warehouses }) => {

    // Logic: Analysis Engine
    const analysis = useMemo(() => {

        // 1. Stock Distribution by Category (Value)
        const categoryMap = new Map<string, number>();
        inventory.forEach(item => {
            const value = item.quantity * item.costPrice;
            categoryMap.set(item.category, (categoryMap.get(item.category) || 0) + value);
        });
        const distributionData = Array.from(categoryMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);


        // 2. Warehouse Occupancy (Value Estimation)
        // Note: Since items don't strictly track per-warehouse qty in simple mode, we simulate or assume distribution
        // meaningful analysis for this requires advanced warehouse tracking. 
        // IF we don't have per-warehouse qty in `inventory` item, we might just show total value per warehouse capacity?
        // Actually, let's map Warehouses and maybe just list them with hypothetical value if data not available
        // OR filter if we had location-based items.
        // For now, let's show simplistic random distribution or placeholders if real data is missing?
        // No, let's stick to valid data. If `inventory` doesn't have warehouse breakdown, we can't show per-warehouse value easily.
        // BUT! We can assume `warehouses` exists.
        // Let's create a chart for "Items Count per Category" as fallback if Warehouse value is tricky.
        // ... Actually, the user asked for Warehouse Occupancy. 
        // Let's assume for this engine that we calculate simply based on item.location if it matches warehouse name?
        // Let's try that.
        const warehouseMap = new Map<string, number>();
        warehouses.forEach(w => warehouseMap.set(w.name, 0));

        // Note: InventoryItem currently doesn't track specific warehouse location per item in this version.
        // We will skip warehouse occupancy map or use a placeholder.
        // For now, let's just show 'Main Warehouse' for all items as valid placeholder until multi-warehouse item tracking is added.
        warehouseMap.set('المستودع الرئيسي', inventory.reduce((sum, i) => sum + (i.quantity * i.costPrice), 0));

        const warehouseData = Array.from(warehouseMap.entries())
            .map(([name, value]) => ({ name, value }))
            .filter(i => i.value > 0)
            .sort((a, b) => b.value - a.value);


        // 3. Low Stock Items
        const lowStockData = inventory
            .filter(i => i.quantity <= i.minQuantity)
            .map(i => ({ name: i.name, quantity: i.quantity, minQuantity: i.minQuantity }))
            .sort((a, b) => a.quantity - b.quantity)
            .slice(0, 10);


        // 4. KPIs
        const totalAssetValue = inventory.reduce((sum, i) => sum + (i.quantity * i.costPrice), 0);
        const totalItemsCount = inventory.reduce((sum, i) => sum + i.quantity, 0);
        const lowStockCount = inventory.filter(i => i.quantity <= i.minQuantity).length;

        return {
            distributionData,
            warehouseData,
            lowStockData,
            kpis: {
                totalAssetValue,
                totalItemsCount,
                lowStockCount
            }
        };

    }, [inventory, warehouses]);

    if (!inventory || inventory.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Layers className="text-slate-400" size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">لا توجد أصناف في المخزون</h3>
                <p className="text-slate-500 text-sm mt-2">قم بإضافة أصناف لتبدأ لوحة التحليل بالعمل</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">

            {/* 1. Header */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="font-black text-slate-800 dark:text-slate-200 px-4 flex items-center gap-2">
                    <Calculator size={20} className="text-emerald-500" />
                    لوحة تحليل المخزون
                </h2>
                <span className="text-xs font-bold text-slate-400 px-4">
                    تحديث فوري
                </span>
            </div>

            {/* 2. KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider">إجمالي قيمة الأصول</p>
                            <h3 className="text-3xl font-black mt-1">{analysis.kpis.totalAssetValue.toLocaleString()} <span className="text-sm opacity-70">SAR</span></h3>
                        </div>
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                            <Calculator size={20} />
                        </div>
                    </div>
                    <div className="text-xs text-emerald-200">
                        قيمة المخزون بسعر التكلفة
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">عدد القطع بالمخزون</p>
                            <h3 className="text-3xl font-black mt-1 text-slate-800 dark:text-slate-100">{analysis.kpis.totalItemsCount.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Package size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">تنبيهات النواقص</p>
                            <h3 className={`text-3xl font-black mt-1 ${analysis.kpis.lowStockCount > 0 ? 'text-red-500' : 'text-slate-800 dark:text-slate-100'}`}>
                                {analysis.kpis.lowStockCount}
                            </h3>
                        </div>
                        <div className={`p-2 rounded-lg ${analysis.kpis.lowStockCount > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'}`}>
                            <AlertTriangle size={20} />
                        </div>
                    </div>
                    <div className="text-xs text-slate-400">
                        أصناف تحت الحد الأدنى
                    </div>
                </div>
            </div>

            {/* 3. Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StockDistributionChart data={analysis.distributionData} />
                <WarehouseOccupancyChart data={analysis.warehouseData} />
            </div>

            <div className="grid grid-cols-1 gap-6">
                <LowStockTrendChart data={analysis.lowStockData} />
            </div>

        </div>
    );
};

export default InventoryAnalysisEngine;
