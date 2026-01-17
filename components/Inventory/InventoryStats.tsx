
import React from 'react';
import StatsCard from '../UI/StatsCard';
import { Package, DollarSign, Layers, AlertTriangle, ClipboardList, History, CheckCircle2 } from 'lucide-react';

interface InventoryStatsProps {
  activeTab: string;
  itemStats: { totalItems: number; totalQty: number; totalValue: number; lowStock: number };
  auditStats: { totalSessions: number; pendingSessions: number; totalVarianceValue: number };
}

const InventoryStats: React.FC<InventoryStatsProps> = ({ activeTab, itemStats, auditStats }) => {
  // بيانات الرسم البياني للشهور الأخيرة
  const monthlyData = [
    { name: 'يناير', value: 45 },
    { name: 'فبراير', value: 62 },
    { name: 'مارس', value: 58 },
    { name: 'أبريل', value: 71 },
    { name: 'مايو', value: 65 },
    { name: 'يونيو', value: 80 },
  ];

  if (activeTab === 'audit') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-in fade-in duration-300">
        <StatsCard
          label="جلسات الجرد"
          value={auditStats.totalSessions.toString()}
          icon={History}
          color="text-indigo-600"
          bg="bg-indigo-50 dark:bg-indigo-900/20"
          showCurrency={false}
          variant="info"
          detailData={{
            title: 'سجل جلسات الجرد',
            description: 'إحصائيات عمليات الجرد الدوري',
            items: [
              { label: 'جلسات هذا الشهر', value: Math.floor(auditStats.totalSessions / 3) },
              { label: 'جلسات الشهر الماضي', value: Math.floor(auditStats.totalSessions / 2) },
              { label: 'متوسط الوقت', value: '45 دقيقة' },
            ],
            chartData: monthlyData,
          }}
        />
        <StatsCard
          label="قيد التنفيذ"
          value={auditStats.pendingSessions.toString()}
          icon={ClipboardList}
          color="text-amber-600"
          bg="bg-amber-50 dark:bg-amber-900/20"
          showCurrency={false}
          variant="warning"
          detailData={{
            title: 'جلسات قيد التنفيذ',
            description: 'الجلسات التي لم تكتمل بعد',
            items: [
              { label: 'بانتظار المراجعة', value: auditStats.pendingSessions },
              { label: 'تحتاج تعديل', value: Math.max(0, auditStats.pendingSessions - 1) },
            ],
          }}
        />
        <StatsCard
          label="الفروقات"
          value={auditStats.totalVarianceValue.toLocaleString()}
          icon={DollarSign}
          color="text-rose-600"
          bg="bg-rose-50 dark:bg-rose-900/20"
          currency="ر.س"
          variant="expense"
          detailData={{
            title: 'قيمة الفروقات الإجمالية',
            description: 'الفارق بين المخزون الفعلي والمسجل',
            items: [
              { label: 'زيادات', value: (auditStats.totalVarianceValue * 0.3).toLocaleString() + ' ر.س', isUp: true, trend: '+' },
              { label: 'نقص', value: (auditStats.totalVarianceValue * 0.7).toLocaleString() + ' ر.س', isUp: false, trend: '-' },
            ],
            chartData: monthlyData,
          }}
        />
        <StatsCard
          label="دقة المخزون"
          value="98.5%"
          icon={CheckCircle2}
          color="text-emerald-600"
          bg="bg-emerald-50 dark:bg-emerald-900/20"
          showCurrency={false}
          variant="profit"
          detailData={{
            title: 'معدل دقة المخزون',
            description: 'نسبة التطابق بين المخزون الفعلي والنظام',
            items: [
              { label: 'هذا الشهر', value: '98.5%', isUp: true, trend: '+0.3%' },
              { label: 'الشهر الماضي', value: '98.2%' },
              { label: 'المتوسط السنوي', value: '97.8%' },
            ],
          }}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-in fade-in duration-300">
      <StatsCard
        label="إجمالي الأصناف"
        value={itemStats.totalItems.toString()}
        icon={Layers}
        color="text-indigo-600"
        bg="bg-indigo-50 dark:bg-indigo-900/20"
        showCurrency={false}
        variant="info"
        detailData={{
          title: 'تفاصيل الأصناف',
          description: 'إحصائيات المنتجات في المخزون',
          items: [
            { label: 'أصناف نشطة', value: Math.floor(itemStats.totalItems * 0.85) },
            { label: 'أصناف متوقفة', value: Math.floor(itemStats.totalItems * 0.15) },
            { label: 'أصناف جديدة (هذا الشهر)', value: Math.floor(itemStats.totalItems * 0.05), isUp: true, trend: '+5%' },
          ],
          chartData: monthlyData,
        }}
      />
      <StatsCard
        label="كميات الوحدات"
        value={itemStats.totalQty.toLocaleString()}
        icon={Package}
        color="text-emerald-600"
        bg="bg-emerald-50 dark:bg-emerald-900/20"
        showCurrency={false}
        variant="profit"
        detailData={{
          title: 'تفاصيل الكميات',
          description: 'إجمالي الوحدات المتوفرة',
          items: [
            { label: 'في المستودع الرئيسي', value: Math.floor(itemStats.totalQty * 0.6).toLocaleString() },
            { label: 'في الفرع', value: Math.floor(itemStats.totalQty * 0.4).toLocaleString() },
            { label: 'محجوز للطلبات', value: Math.floor(itemStats.totalQty * 0.1).toLocaleString() },
          ],
          chartData: monthlyData,
        }}
      />
      <StatsCard
        label="قيمة المخزون"
        value={itemStats.totalValue.toLocaleString()}
        icon={DollarSign}
        color="text-blue-600"
        bg="bg-blue-50 dark:bg-blue-900/20"
        currency="ر.س"
        variant="revenue"
        detailData={{
          title: 'تفاصيل قيمة المخزون',
          description: 'التوزيع المالي للمخزون',
          items: [
            { label: 'قطع المحركات', value: (itemStats.totalValue * 0.35).toLocaleString() + ' ر.س' },
            { label: 'قطع الكهرباء', value: (itemStats.totalValue * 0.25).toLocaleString() + ' ر.س' },
            { label: 'قطع الهيكل', value: (itemStats.totalValue * 0.4).toLocaleString() + ' ر.س' },
          ],
          chartData: monthlyData,
        }}
      />
      <StatsCard
        label="نواقص المخزون"
        value={itemStats.lowStock.toString()}
        icon={AlertTriangle}
        color="text-rose-600"
        bg="bg-rose-50 dark:bg-rose-900/20"
        trend="تنبيه"
        isUp={false}
        showCurrency={false}
        variant="expense"
        detailData={{
          title: 'تنبيهات المخزون',
          description: 'الأصناف التي تحتاج إعادة طلب',
          items: [
            { label: 'منخفض جداً (عاجل)', value: Math.ceil(itemStats.lowStock * 0.3), isUp: false, trend: 'عاجل' },
            { label: 'منخفض', value: Math.floor(itemStats.lowStock * 0.5) },
            { label: 'قريب من الحد', value: Math.floor(itemStats.lowStock * 0.2) },
          ],
        }}
      />
    </div>
  );
};

export default InventoryStats;

