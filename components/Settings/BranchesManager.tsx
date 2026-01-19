/**
 * Branches Manager Component
 * إدارة الفروع (إضافة، تعديل، حذف، تفعيل)
 */

import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useApp } from '../../context/AppContext';
import SettingsCard from './SettingsCard';
import SettingsInput from './SettingsInput';
import SettingsToggle from './SettingsToggle';
import {
    Building2, Plus, Trash2, Edit2, X, MapPin, Phone,
    CheckCircle2, XCircle
} from 'lucide-react';
import { Branch } from '../../types/supabase-types';

const BranchesManager: React.FC = () => {
    const { branches, addBranch, updateBranch, deleteBranch } = useSettings();
    const { showNotification } = useApp();

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

    const [newBranch, setNewBranch] = useState<Partial<Branch>>({
        name: '',
        address: '',
        phone: '',
        is_active: true
    });

    const handleAdd = async () => {
        if (!newBranch.name) {
            showNotification('يرجى إدخال اسم الفرع', 'error');
            return;
        }

        try {
            // @ts-ignore - id and dates managed by DB
            await addBranch(newBranch as any);
            setNewBranch({ name: '', address: '', phone: '', is_active: true });
            setShowAddModal(false);
            showNotification('تم إضافة الفرع بنجاح', 'success');
        } catch (error) {
            showNotification('حدث خطأ أثناء إضافة الفرع', 'error');
        }
    };

    const handleUpdate = async () => {
        if (!editingBranch || !editingBranch.name) return;

        try {
            await updateBranch(editingBranch.id, {
                name: editingBranch.name,
                address: editingBranch.address,
                phone: editingBranch.phone,
                is_active: editingBranch.is_active
            });
            setEditingBranch(null);
            showNotification('تم تحديث بيانات الفرع', 'success');
        } catch (error) {
            showNotification('حدث خطأ أثناء التحديث', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (branches.length <= 1) {
            showNotification('لا يمكن حذف الفرع الوحيد', 'error');
            return;
        }

        if (confirm('هل أنت متأكد من حذف هذا الفرع؟')) {
            try {
                await deleteBranch(id);
                showNotification('تم حذف الفرع', 'info');
            } catch (error) {
                showNotification('حدث خطأ أثناء الحذف', 'error');
            }
        }
    };

    return (
        <div className="space-y-6">
            <SettingsCard
                title="الفروع"
                description="إدارة فروع الشركة ومواقعها"
                icon={Building2}
                iconColor="text-blue-500"
                actions={
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <Plus size={14} />
                        إضافة فرع
                    </button>
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {branches.map((branch) => (
                        <div
                            key={branch.id}
                            className={`p-4 rounded-xl border transition-all ${branch.is_active
                                ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 opacity-75'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${branch.is_active
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                        }`}>
                                        <Building2 size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-gray-100">
                                            {branch.name}
                                        </h4>
                                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${branch.is_active
                                            ? 'bg-green-100 dark:bg-green-900/20 text-green-600'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                            }`}>
                                            {branch.is_active ? (
                                                <>
                                                    <CheckCircle2 size={10} />
                                                    نشط
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle size={10} />
                                                    غير نشط
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setEditingBranch(branch)}
                                        className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(branch.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                                {branch.address && (
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} />
                                        <span>{branch.address}</span>
                                    </div>
                                )}
                                {branch.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} />
                                        <span dir="ltr">{branch.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </SettingsCard>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                                إضافة فرع جديد
                            </h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <SettingsInput
                                label="اسم الفرع"
                                value={newBranch.name || ''}
                                onChange={(val) => setNewBranch(prev => ({ ...prev, name: val }))}
                                placeholder="الفرع الرئيسي"
                                required
                            />

                            <SettingsInput
                                label="العنوان"
                                value={newBranch.address || ''}
                                onChange={(val) => setNewBranch(prev => ({ ...prev, address: val }))}
                                placeholder="الرياض، طريق الملك فهد"
                            />

                            <SettingsInput
                                label="رقم الهاتف"
                                value={newBranch.phone || ''}
                                onChange={(val) => setNewBranch(prev => ({ ...prev, phone: val }))}
                                placeholder="05xxxxxxxx"
                                dir="ltr"
                            />

                            <SettingsToggle
                                label="تفعيل الفرع"
                                checked={newBranch.is_active || false}
                                onChange={(checked) => setNewBranch(prev => ({ ...prev, is_active: checked }))}
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
                                className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors"
                            >
                                إضافة
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingBranch && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                                تعديل بيانات الفرع
                            </h3>
                            <button
                                onClick={() => setEditingBranch(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <SettingsInput
                                label="اسم الفرع"
                                value={editingBranch.name}
                                onChange={(val) => setEditingBranch(prev => prev ? { ...prev, name: val } : null)}
                                required
                            />

                            <SettingsInput
                                label="العنوان"
                                value={editingBranch.address || ''}
                                onChange={(val) => setEditingBranch(prev => prev ? { ...prev, address: val } : null)}
                            />

                            <SettingsInput
                                label="رقم الهاتف"
                                value={editingBranch.phone || ''}
                                onChange={(val) => setEditingBranch(prev => prev ? { ...prev, phone: val } : null)}
                                dir="ltr"
                            />

                            <SettingsToggle
                                label="تفعيل الفرع"
                                checked={editingBranch.is_active}
                                onChange={(checked) => setEditingBranch(prev => prev ? { ...prev, is_active: checked } : null)}
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setEditingBranch(null)}
                                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors"
                            >
                                حفظ التعديلات
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BranchesManager;
