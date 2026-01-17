/**
 * Roles Manager Component
 * إدارة الأدوار والصلاحيات
 */

import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useApp } from '../../context/AppContext';
import SettingsCard from './SettingsCard';
import SettingsInput from './SettingsInput';
import ColorPicker from './ColorPicker';
import {
    Shield, Plus, Trash2, Edit2, Check, X,
    Users, Lock, Unlock, Eye, FileEdit,
    Download, Trash, CheckCircle, AlertCircle
} from 'lucide-react';
import { Role, Permission, PermissionAction, SYSTEM_MODULES, DEFAULT_ROLES } from '../../types/settings-extended';

const ACTIONS: { id: PermissionAction; label: string; icon: any }[] = [
    { id: 'view', label: 'عرض', icon: Eye },
    { id: 'create', label: 'إنشاء', icon: Plus },
    { id: 'edit', label: 'تعديل', icon: FileEdit },
    { id: 'delete', label: 'حذف', icon: Trash },
    { id: 'export', label: 'تصدير', icon: Download },
    { id: 'approve', label: 'موافقة', icon: CheckCircle }
];

const RolesManager: React.FC = () => {
    const { roles, addRole, updateRole, deleteRole, getDefaultPermissions } = useSettings();
    const { showNotification } = useApp();

    const [showForm, setShowForm] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        nameEn: '',
        description: '',
        color: '#2563eb',
        permissions: getDefaultPermissions()
    });

    const resetForm = () => {
        setFormData({
            name: '',
            nameEn: '',
            description: '',
            color: '#2563eb',
            permissions: getDefaultPermissions()
        });
        setEditingRole(null);
        setShowForm(false);
    };

    const handleSubmit = () => {
        if (!formData.name) {
            showNotification('يرجى إدخال اسم الدور', 'error');
            return;
        }

        if (editingRole) {
            updateRole({
                ...editingRole,
                ...formData,
                isSystem: editingRole.isSystem
            });
            showNotification('تم تحديث الدور بنجاح', 'success');
        } else {
            addRole({
                ...formData,
                isSystem: false
            });
            showNotification('تم إضافة الدور بنجاح', 'success');
        }

        resetForm();
    };

    const handleEdit = (role: Role) => {
        setFormData({
            name: role.name,
            nameEn: role.nameEn,
            description: role.description,
            color: role.color,
            permissions: role.permissions.length > 0 ? role.permissions : getDefaultPermissions()
        });
        setEditingRole(role);
        setShowForm(true);
    };

    const handleDelete = (id: string) => {
        const role = roles.find(r => r.id === id);
        if (role?.isSystem) {
            showNotification('لا يمكن حذف أدوار النظام', 'error');
            return;
        }

        if (confirm('هل أنت متأكد من حذف هذا الدور؟')) {
            deleteRole(id);
            showNotification('تم حذف الدور', 'info');
        }
    };

    const togglePermission = (moduleId: string, action: PermissionAction) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.map(p =>
                p.module === moduleId
                    ? { ...p, actions: { ...p.actions, [action]: !p.actions[action] } }
                    : p
            )
        }));
    };

    const toggleAllForModule = (moduleId: string, enabled: boolean) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.map(p =>
                p.module === moduleId
                    ? {
                        ...p,
                        actions: Object.fromEntries(
                            ACTIONS.map(a => [a.id, enabled])
                        ) as Permission['actions']
                    }
                    : p
            )
        }));
    };

    const toggleAllForAction = (action: PermissionAction, enabled: boolean) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.map(p => ({
                ...p,
                actions: { ...p.actions, [action]: enabled }
            }))
        }));
    };

    // Initialize default roles if empty
    React.useEffect(() => {
        if (roles.length === 0) {
            DEFAULT_ROLES.forEach(role => {
                addRole({
                    ...role,
                    permissions: getDefaultPermissions().map(p => ({
                        ...p,
                        actions: role.name === 'مدير النظام'
                            ? Object.fromEntries(ACTIONS.map(a => [a.id, true])) as Permission['actions']
                            : role.name === 'مشاهد'
                                ? { ...p.actions, view: true }
                                : p.actions
                    }))
                });
            });
        }
    }, []);

    return (
        <div className="space-y-6">
            {/* Roles List */}
            <SettingsCard
                title="الأدوار"
                description="إدارة أدوار المستخدمين وصلاحياتهم"
                icon={Shield}
                iconColor="text-indigo-500"
                actions={
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={14} />
                        دور جديد
                    </button>
                }
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedRole?.id === role.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                                }`}
                            onClick={() => setSelectedRole(role)}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: role.color + '20', color: role.color }}
                                    >
                                        <Shield size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                            {role.name}
                                        </h4>
                                        <p className="text-[10px] text-gray-500">
                                            {role.nameEn}
                                        </p>
                                    </div>
                                </div>

                                {role.isSystem && (
                                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
                                        نظام
                                    </span>
                                )}
                            </div>

                            <p className="text-[11px] text-gray-500 mb-3 line-clamp-2">
                                {role.description}
                            </p>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                    <Users size={12} />
                                    <span>
                                        {role.permissions.filter(p => Object.values(p.actions).some(v => v)).length} وحدة
                                    </span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(role);
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-primary rounded-lg transition-colors"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    {!role.isSystem && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(role.id);
                                            }}
                                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </SettingsCard>

            {/* Permissions Matrix for Selected Role */}
            {selectedRole && (
                <SettingsCard
                    title={`صلاحيات: ${selectedRole.name}`}
                    icon={Lock}
                    iconColor="text-amber-500"
                >
                    <div className="overflow-x-auto -mx-6 px-6">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800">
                                    <th className="text-start text-xs font-bold text-gray-500 pb-3 w-40">
                                        الوحدة
                                    </th>
                                    {ACTIONS.map((action) => (
                                        <th key={action.id} className="text-center text-[10px] font-bold text-gray-500 pb-3 px-2">
                                            <action.icon size={14} className="mx-auto mb-1" />
                                            {action.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {selectedRole.permissions.map((perm) => {
                                    const module = SYSTEM_MODULES.find(m => m.id === perm.module);
                                    return (
                                        <tr key={perm.module} className="border-b border-gray-50 dark:border-gray-800/50">
                                            <td className="py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                                                {module?.nameAr || perm.module}
                                            </td>
                                            {ACTIONS.map((action) => (
                                                <td key={action.id} className="text-center py-2.5">
                                                    <div className={`w-5 h-5 rounded mx-auto flex items-center justify-center ${perm.actions[action.id]
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                                        }`}>
                                                        {perm.actions[action.id] ? (
                                                            <Check size={12} />
                                                        ) : (
                                                            <X size={12} />
                                                        )}
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </SettingsCard>
            )}

            {/* Add/Edit Role Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                                {editingRole ? 'تعديل الدور' : 'إضافة دور جديد'}
                            </h3>
                            <button
                                onClick={resetForm}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <SettingsInput
                                    label="اسم الدور"
                                    value={formData.name}
                                    onChange={(val) => setFormData(prev => ({ ...prev, name: val }))}
                                    required
                                />
                                <SettingsInput
                                    label="الاسم بالإنجليزية"
                                    value={formData.nameEn}
                                    onChange={(val) => setFormData(prev => ({ ...prev, nameEn: val }))}
                                    dir="ltr"
                                />
                            </div>

                            <SettingsInput
                                label="الوصف"
                                value={formData.description}
                                onChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
                            />

                            <ColorPicker
                                label="لون الدور"
                                value={formData.color}
                                onChange={(color) => setFormData(prev => ({ ...prev, color }))}
                            />

                            {/* Permissions Matrix */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                        الصلاحيات
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                permissions: prev.permissions.map(p => ({
                                                    ...p,
                                                    actions: Object.fromEntries(ACTIONS.map(a => [a.id, true])) as Permission['actions']
                                                }))
                                            }))}
                                            className="text-[10px] text-primary hover:underline"
                                        >
                                            تحديد الكل
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                permissions: getDefaultPermissions()
                                            }))}
                                            className="text-[10px] text-gray-500 hover:underline"
                                        >
                                            إلغاء الكل
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto -mx-6 px-6">
                                    <table className="w-full min-w-[500px]">
                                        <thead>
                                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                                <th className="text-start text-[10px] font-bold text-gray-500 pb-2">
                                                    الوحدة
                                                </th>
                                                {ACTIONS.slice(0, 5).map((action) => (
                                                    <th key={action.id} className="text-center text-[10px] font-bold text-gray-500 pb-2 px-1">
                                                        {action.label}
                                                    </th>
                                                ))}
                                                <th className="text-center text-[10px] font-bold text-gray-500 pb-2 px-1">
                                                    الكل
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.permissions.map((perm) => {
                                                const module = SYSTEM_MODULES.find(m => m.id === perm.module);
                                                const allEnabled = ACTIONS.slice(0, 5).every(a => perm.actions[a.id]);

                                                return (
                                                    <tr key={perm.module} className="border-b border-gray-50 dark:border-gray-800/50">
                                                        <td className="py-2 text-[11px] font-bold text-gray-700 dark:text-gray-300">
                                                            {module?.nameAr || perm.module}
                                                        </td>
                                                        {ACTIONS.slice(0, 5).map((action) => (
                                                            <td key={action.id} className="text-center py-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => togglePermission(perm.module, action.id)}
                                                                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${perm.actions[action.id]
                                                                            ? 'bg-primary text-white'
                                                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 hover:bg-gray-300'
                                                                        }`}
                                                                >
                                                                    <Check size={10} />
                                                                </button>
                                                            </td>
                                                        ))}
                                                        <td className="text-center py-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleAllForModule(perm.module, !allEnabled)}
                                                                className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${allEnabled
                                                                        ? 'bg-green-500 text-white'
                                                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 hover:bg-gray-300'
                                                                    }`}
                                                            >
                                                                {allEnabled ? <Unlock size={10} /> : <Lock size={10} />}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={resetForm}
                                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
                            >
                                {editingRole ? 'حفظ التعديلات' : 'إضافة الدور'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RolesManager;
