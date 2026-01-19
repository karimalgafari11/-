/**
 * Fiscal Periods Manager Component
 * إدارة الفترات المالية (إضافة، تعديل، إغلاق)
 */

import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useApp } from '../../context/AppContext';
import SettingsCard from './SettingsCard';
import SettingsInput from './SettingsInput';
import SettingsSelect from './SettingsSelect';
import {
    Calendar, Plus, Lock, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import { FiscalPeriod } from '../../types/supabase-types';

const FiscalPeriodsManager: React.FC = () => {
    const { fiscalPeriods, addFiscalPeriod, closeFiscalPeriod } = useSettings();
    const { showNotification } = useApp();

    const [showAddModal, setShowAddModal] = useState(false);

    // Initial state for new period
    const getNextYear = () => {
        const lastPeriod = fiscalPeriods[fiscalPeriods.length - 1];
        if (lastPeriod) {
            const lastEndDate = new Date(lastPeriod.end_date);
            const nextStart = new Date(lastEndDate);
            nextStart.setDate(nextStart.getDate() + 1);
            const nextEnd = new Date(nextStart);
            nextEnd.setFullYear(nextEnd.getFullYear() + 1);
            nextEnd.setDate(nextEnd.getDate() - 1);
            return {
                start: nextStart.toISOString().split('T')[0],
                end: nextEnd.toISOString().split('T')[0],
                name: nextStart.getFullYear().toString()
            };
        }
        const today = new Date();
        const start = new Date(today.getFullYear(), 0, 1);
        const end = new Date(today.getFullYear(), 11, 31);
        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0],
            name: today.getFullYear().toString()
        };
    };

    const initialPeriod = getNextYear();

    const [newPeriod, setNewPeriod] = useState<Partial<FiscalPeriod>>({
        name: initialPeriod.name,
        start_date: initialPeriod.start,
        end_date: initialPeriod.end,
        status: 'open',
        is_active: true
    });

    const handleAdd = async () => {
        if (!newPeriod.name || !newPeriod.start_date || !newPeriod.end_date) {
            showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        try {
            await addFiscalPeriod(newPeriod as any);
            setShowAddModal(false);
            showNotification('تم إضافة الفترة المالية بنجاح', 'success');
        } catch (error) {
            showNotification('حدث خطأ أثناء إضافة الفترة', 'error');
        }
    };

    const handleClosePeriod = async (id: string) => {
        if (confirm('هل أنت متأكد من إغلاق هذه الفترة المالية؟ لا يمكن التراجع عن هذا الإجراء.')) {
            try {
                await closeFiscalPeriod(id);
                showNotification('تم إغلاق الفترة المالية', 'success');
            } catch (error) {
                showNotification('حدث خطأ أثناء إغلاق الفترة', 'error');
            }
        }
    };

    return (
        <div className="space-y-6">
            <SettingsCard
                title="الفترات المالية"
                description="إدارة السنوات المالية وفترات المحاسبة"
                icon={Calendar}
                iconColor="text-purple-500"
                actions={
                    <button
                        onClick={() => {
                            const next = getNextYear();
                            setNewPeriod({
                                name: next.name,
                                start_date: next.start,
                                end_date: next.end,
                                status: 'open',
                                is_active: true
                            });
                            setShowAddModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 text-white text-xs font-bold rounded-lg hover:bg-purple-600 transition-colors"
                    >
                        <Plus size={14} />
                        فترة جديدة
                    </button>
                }
            >
                <div className="space-y-3">
                    {fiscalPeriods.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()).map((period) => (
                        <div
                            key={period.id}
                            className={`p-4 rounded-xl border transition-all ${period.status === 'open'
                                ? 'bg-white dark:bg-gray-800 border-purple-100 dark:border-purple-900/30 shadow-sm'
                                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <h4 className="font-black text-gray-900 dark:text-gray-100 text-lg">
                                        {period.name}
                                    </h4>
                                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${period.status === 'open'
                                        ? 'bg-green-100 dark:bg-green-900/20 text-green-600'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                        }`}>
                                        {period.status === 'open' ? (
                                            <>
                                                <CheckCircle2 size={10} />
                                                مفتوحة
                                            </>
                                        ) : (
                                            <>
                                                <Lock size={10} />
                                                مغلقة
                                            </>
                                        )}
                                    </span>
                                </div>

                                {period.status === 'open' && (
                                    <button
                                        onClick={() => handleClosePeriod(period.id)}
                                        className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="إغلاق الفترة"
                                    >
                                        <Lock size={14} />
                                        إغلاق
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold">البداية:</span>
                                    <span>{new Date(period.start_date).toLocaleDateString('ar')}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold">النهاية:</span>
                                    <span>{new Date(period.end_date).toLocaleDateString('ar')}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {fiscalPeriods.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                            <p>لا توجد فترات مالية معرفة</p>
                        </div>
                    )}
                </div>
            </SettingsCard>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                                فترة مالية جديدة
                            </h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <SettingsInput
                                label="اسم السنة / الفترة"
                                value={newPeriod.name || ''}
                                onChange={(val) => setNewPeriod(prev => ({ ...prev, name: val }))}
                                placeholder="2024"
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <SettingsInput
                                    label="تاريخ البداية"
                                    value={newPeriod.start_date || ''}
                                    onChange={(val) => setNewPeriod(prev => ({ ...prev, start_date: val }))}
                                    type={"date" as any}
                                    required
                                />
                                <SettingsInput
                                    label="تاريخ النهاية"
                                    value={newPeriod.end_date || ''}
                                    onChange={(val) => setNewPeriod(prev => ({ ...prev, end_date: val }))}
                                    type={"date" as any}
                                    required
                                />
                            </div>

                            <SettingsSelect
                                label="الحالة"
                                value={newPeriod.status || 'open'}
                                onChange={(val) => setNewPeriod(prev => ({ ...prev, status: val as any }))}
                                options={[
                                    { value: 'open', label: 'مفتوحة' },
                                    { value: 'closed', label: 'مغلقة' }
                                ]}
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleAdd}
                                className="flex-1 px-4 py-2.5 bg-purple-500 text-white rounded-xl text-sm font-bold hover:bg-purple-600 transition-colors"
                            >
                                إنشاء الفترة
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FiscalPeriodsManager;
