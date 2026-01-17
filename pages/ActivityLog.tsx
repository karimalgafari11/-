/**
 * Activity Log Page - صفحة سجل النشاطات
 * عرض جميع العمليات مع الفلترة والبحث
 */

import React, { useState, useMemo } from 'react';
import {
    Activity,
    Search,
    Filter,
    Calendar,
    User,
    Building2,
    Download,
    RefreshCw,
    Clock,
    ChevronDown,
    Eye,
    Edit,
    Trash2,
    PlusCircle,
    FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityLogger } from '../services/activityLogger';
import { ActivityLog, ActionType, EntityType, ActivityLogFilter } from '../types/activityLog';

// أيقونات الإجراءات
const ACTION_ICONS: Record<ActionType, React.ReactNode> = {
    create: <PlusCircle size={16} className="text-green-500" />,
    update: <Edit size={16} className="text-blue-500" />,
    delete: <Trash2 size={16} className="text-red-500" />,
    view: <Eye size={16} className="text-gray-500" />,
    export: <Download size={16} className="text-purple-500" />,
    import: <Download size={16} className="text-purple-500 rotate-180" />,
    approve: <FileText size={16} className="text-green-600" />,
    void: <Trash2 size={16} className="text-orange-500" />,
    login: <User size={16} className="text-blue-600" />,
    logout: <User size={16} className="text-gray-600" />,
    sync: <RefreshCw size={16} className="text-cyan-500" />,
    payment: <FileText size={16} className="text-emerald-500" />,
    post: <FileText size={16} className="text-indigo-500" />
};

// أسماء الإجراءات بالعربية
const ACTION_NAMES: Record<ActionType, string> = {
    create: 'إنشاء',
    update: 'تعديل',
    delete: 'حذف',
    view: 'عرض',
    export: 'تصدير',
    import: 'استيراد',
    approve: 'اعتماد',
    void: 'إلغاء',
    login: 'تسجيل دخول',
    logout: 'تسجيل خروج',
    sync: 'مزامنة',
    payment: 'دفعة',
    post: 'ترحيل'
};

// أسماء الكيانات بالعربية
const ENTITY_NAMES: Record<EntityType, string> = {
    sale: 'مبيعات',
    purchase: 'مشتريات',
    product: 'منتج',
    customer: 'عميل',
    supplier: 'مورد',
    expense: 'مصروف',
    voucher: 'سند',
    journal_entry: 'قيد يومية',
    account: 'حساب',
    user: 'مستخدم',
    branch: 'فرع',
    organization: 'منظمة',
    settings: 'إعدادات',
    inventory_adjustment: 'تسوية مخزون'
};

const ActivityLogPage: React.FC = () => {
    const { theme } = useApp();
    const [filter, setFilter] = useState<ActivityLogFilter>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // جلب السجلات
    const logs = useMemo(() => {
        return ActivityLogger.getFiltered({
            ...filter,
            searchQuery
        });
    }, [filter, searchQuery]);

    // تنسيق التاريخ والوقت
    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return {
            date: date.toLocaleDateString('ar-SA'),
            time: date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
        };
    };

    // إعادة تحميل
    const handleRefresh = () => {
        setFilter({ ...filter });
    };

    const isDark = theme === 'dark';

    return (
        <div className={`p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
            {/* العنوان */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                        <Activity className="text-blue-500" size={24} />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            سجل النشاطات
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {logs.length} سجل
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleRefresh}
                        className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} transition-colors`}
                    >
                        <RefreshCw size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} transition-colors`}
                    >
                        <Download size={18} />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>تصدير</span>
                    </button>
                </div>
            </div>

            {/* شريط البحث والفلاتر */}
            <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <div className="flex flex-wrap gap-4">
                    {/* البحث */}
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="بحث في السجلات..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pr-10 pl-4 py-2 rounded-lg border ${isDark
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            />
                        </div>
                    </div>

                    {/* زر الفلاتر */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${showFilters
                            ? 'bg-blue-500 text-white'
                            : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        <Filter size={18} />
                        <span>الفلاتر</span>
                        <ChevronDown size={16} className={showFilters ? 'rotate-180' : ''} />
                    </button>
                </div>

                {/* الفلاتر الموسعة */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* التاريخ من */}
                        <div>
                            <label className={`text-sm mb-1 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                من تاريخ
                            </label>
                            <input
                                type="date"
                                value={filter.startDate?.split('T')[0] || ''}
                                onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                                className={`w-full px-3 py-2 rounded-lg border ${isDark
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-gray-50 border-gray-200 text-gray-900'
                                    }`}
                            />
                        </div>

                        {/* التاريخ إلى */}
                        <div>
                            <label className={`text-sm mb-1 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                إلى تاريخ
                            </label>
                            <input
                                type="date"
                                value={filter.endDate?.split('T')[0] || ''}
                                onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                                className={`w-full px-3 py-2 rounded-lg border ${isDark
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-gray-50 border-gray-200 text-gray-900'
                                    }`}
                            />
                        </div>

                        {/* نوع العملية */}
                        <div>
                            <label className={`text-sm mb-1 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                نوع العملية
                            </label>
                            <select
                                value={filter.action || ''}
                                onChange={(e) => setFilter({ ...filter, action: e.target.value as ActionType || undefined })}
                                className={`w-full px-3 py-2 rounded-lg border ${isDark
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-gray-50 border-gray-200 text-gray-900'
                                    }`}
                            >
                                <option value="">الكل</option>
                                {Object.entries(ACTION_NAMES).map(([key, name]) => (
                                    <option key={key} value={key}>{name}</option>
                                ))}
                            </select>
                        </div>

                        {/* نوع البيان */}
                        <div>
                            <label className={`text-sm mb-1 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                نوع البيان
                            </label>
                            <select
                                value={filter.entityType || ''}
                                onChange={(e) => setFilter({ ...filter, entityType: e.target.value as EntityType || undefined })}
                                className={`w-full px-3 py-2 rounded-lg border ${isDark
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-gray-50 border-gray-200 text-gray-900'
                                    }`}
                            >
                                <option value="">الكل</option>
                                {Object.entries(ENTITY_NAMES).map(([key, name]) => (
                                    <option key={key} value={key}>{name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* جدول السجلات */}
            <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
                                <th className={`px-4 py-3 text-right text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    العملية
                                </th>
                                <th className={`px-4 py-3 text-right text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    البيان
                                </th>
                                <th className={`px-4 py-3 text-right text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    المستخدم
                                </th>
                                <th className={`px-4 py-3 text-right text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    الفرع
                                </th>
                                <th className={`px-4 py-3 text-right text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    التاريخ والوقت
                                </th>
                                <th className={`px-4 py-3 text-right text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    الحالة
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center">
                                        <Activity className={`mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} size={48} />
                                        <p className={isDark ? 'text-gray-500' : 'text-gray-600'}>
                                            لا توجد سجلات
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log: ActivityLog) => {
                                    const { date, time } = formatDateTime(log.createdAt);
                                    return (
                                        <tr
                                            key={log.id}
                                            className={`border-t ${isDark ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-gray-50'}`}
                                        >
                                            {/* العملية */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {ACTION_ICONS[log.action]}
                                                    <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>
                                                        {ACTION_NAMES[log.action]}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* البيان */}
                                            <td className="px-4 py-3">
                                                <div>
                                                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        {ENTITY_NAMES[log.entityType]}
                                                    </span>
                                                    {log.entityName && (
                                                        <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                                            {log.entityName}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            {/* المستخدم */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                                        <User size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                                                    </div>
                                                    <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>
                                                        {log.userName}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* الفرع */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Building2 size={14} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                                                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                                                        {log.branchName || 'الفرع الرئيسي'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* التاريخ والوقت */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                                                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{date}</span>
                                                    <Clock size={14} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                                                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{time}</span>
                                                </div>
                                            </td>

                                            {/* الحالة */}
                                            <td className="px-4 py-3">
                                                {log.isOffline ? (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                                        بدون اتصال
                                                    </span>
                                                ) : log.syncedAt ? (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                        تمت المزامنة
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                        محلي
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ActivityLogPage;
