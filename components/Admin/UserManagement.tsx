/**
 * User Management Component - إدارة المستخدمين
 * إضافة وتعديل وحذف مستخدمي الشركة
 */

import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, UserCheck, UserX, Save, X } from 'lucide-react';
import { useUser } from '../../context/app/UserContext';
import { companyService, UserProfile } from '../../services/companyService';
import { profileService } from '../../services/profileService';
import { UserRole, ROLE_NAMES } from '../../types/organization';

interface UserFormData {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
}

const initialFormData: UserFormData = {
    name: '',
    email: '',
    phone: '',
    role: 'admin'
};

export const UserManagement: React.FC = () => {
    const { currentCompany, isAdmin, isManager } = useUser();

    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [formData, setFormData] = useState<UserFormData>(initialFormData);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // تحميل المستخدمين
    const loadUsers = async () => {
        if (!currentCompany) return;

        setIsLoading(true);
        try {
            const companyUsers = await companyService.getCompanyUsers(currentCompany.id);
            setUsers(companyUsers);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [currentCompany]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddUser = async () => {
        if (!currentCompany || !formData.name.trim()) {
            setMessage({ type: 'error', text: 'يرجى إدخال اسم المستخدم' });
            return;
        }

        try {
            const success = await companyService.addUserToCompany(currentCompany.id, formData);
            if (success) {
                setMessage({ type: 'success', text: 'تم إضافة المستخدم بنجاح' });
                setIsAddingUser(false);
                setFormData(initialFormData);
                await loadUsers();
            } else {
                setMessage({ type: 'error', text: 'فشل في إضافة المستخدم' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'حدث خطأ أثناء الإضافة' });
        }
    };

    const handleUpdateUser = async (profileId: string) => {
        try {
            const result = await profileService.updateProfile(profileId, {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role
            });

            if (result) {
                setMessage({ type: 'success', text: 'تم تحديث المستخدم بنجاح' });
                setEditingUserId(null);
                setFormData(initialFormData);
                await loadUsers();
            } else {
                setMessage({ type: 'error', text: 'فشل في تحديث المستخدم' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'حدث خطأ أثناء التحديث' });
        }
    };

    const handleDeleteUser = async (userId: string, profileId: string) => {
        if (!currentCompany) return;

        if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

        try {
            const success = await companyService.removeUserFromCompany(currentCompany.id, userId);
            if (success) {
                setMessage({ type: 'success', text: 'تم حذف المستخدم بنجاح' });
                await loadUsers();
            } else {
                setMessage({ type: 'error', text: 'فشل في حذف المستخدم' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'حدث خطأ أثناء الحذف' });
        }
    };

    const handleToggleActive = async (profileId: string, currentState: boolean) => {
        try {
            const result = await profileService.toggleActive(profileId, !currentState);
            if (result) {
                setMessage({ type: 'success', text: currentState ? 'تم تعطيل المستخدم' : 'تم تفعيل المستخدم' });
                await loadUsers();
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'حدث خطأ' });
        }
    };

    const startEditing = (user: UserProfile) => {
        setEditingUserId(user.id);
        setFormData({
            name: user.name,
            email: user.email || '',
            phone: user.phone || '',
            role: user.role
        });
    };

    const cancelEditing = () => {
        setEditingUserId(null);
        setFormData(initialFormData);
    };

    if (!isManager) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="text-center text-gray-500 py-8">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>ليس لديك صلاحية الوصول لهذه الصفحة</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        إدارة المستخدمين
                    </h2>
                    <span className="text-sm text-gray-500">
                        ({users.length} مستخدم)
                    </span>
                </div>

                {isManager && !isAddingUser && (
                    <button
                        onClick={() => setIsAddingUser(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        <Plus className="w-4 h-4" />
                        إضافة مستخدم
                    </button>
                )}
            </div>

            {/* رسائل */}
            {message && (
                <div className={`mb-4 p-3 rounded-lg ${message.type === 'success'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* نموذج إضافة مستخدم */}
            {isAddingUser && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">إضافة مستخدم جديد</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">الاسم *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
                                placeholder="اسم المستخدم"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
                                dir="ltr"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">الهاتف</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
                                dir="ltr"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">الصلاحية</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
                                disabled
                            >
                                <option value="admin">{ROLE_NAMES.admin}</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={handleAddUser}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            <Save className="w-4 h-4" />
                            إضافة
                        </button>
                        <button
                            onClick={() => {
                                setIsAddingUser(false);
                                setFormData(initialFormData);
                            }}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            )}

            {/* جدول المستخدمين */}
            {isLoading ? (
                <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-2 text-gray-500">جاري التحميل...</p>
                </div>
            ) : users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>لا يوجد مستخدمين</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="py-3 px-4 text-right font-medium text-gray-600 dark:text-gray-400">الاسم</th>
                                <th className="py-3 px-4 text-right font-medium text-gray-600 dark:text-gray-400">البريد</th>
                                <th className="py-3 px-4 text-right font-medium text-gray-600 dark:text-gray-400">الهاتف</th>
                                <th className="py-3 px-4 text-right font-medium text-gray-600 dark:text-gray-400">الصلاحية</th>
                                <th className="py-3 px-4 text-right font-medium text-gray-600 dark:text-gray-400">الحالة</th>
                                <th className="py-3 px-4 text-center font-medium text-gray-600 dark:text-gray-400">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    {editingUserId === user.id ? (
                                        // صف التعديل
                                        <>
                                            <td className="py-3 px-4">
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="w-full px-2 py-1 border rounded"
                                                />
                                            </td>
                                            <td className="py-3 px-4">
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="w-full px-2 py-1 border rounded"
                                                    dir="ltr"
                                                />
                                            </td>
                                            <td className="py-3 px-4">
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full px-2 py-1 border rounded"
                                                    dir="ltr"
                                                />
                                            </td>
                                            <td className="py-3 px-4">
                                                <select
                                                    name="role"
                                                    value={formData.role}
                                                    onChange={handleInputChange}
                                                    className="w-full px-2 py-1 border rounded"
                                                    disabled
                                                >
                                                    <option value="admin">{ROLE_NAMES.admin}</option>
                                                </select>
                                            </td>
                                            <td className="py-3 px-4">-</td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleUpdateUser(user.id)}
                                                        className="p-1.5 text-green-600 hover:bg-green-100 rounded"
                                                        title="حفظ"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={cancelEditing}
                                                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                                                        title="إلغاء"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        // صف العرض
                                        <>
                                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                                                {user.name}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400" dir="ltr">
                                                {user.email || '-'}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400" dir="ltr">
                                                {user.phone || '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    {ROLE_NAMES[user.role]}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {user.is_active ? (
                                                    <span className="flex items-center gap-1 text-green-600">
                                                        <UserCheck className="w-4 h-4" />
                                                        نشط
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-red-600">
                                                        <UserX className="w-4 h-4" />
                                                        معطل
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => startEditing(user)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                                                        title="تعديل"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleActive(user.id, user.is_active)}
                                                        className={`p-1.5 rounded ${user.is_active
                                                            ? 'text-yellow-600 hover:bg-yellow-100'
                                                            : 'text-green-600 hover:bg-green-100'
                                                            }`}
                                                        title={user.is_active ? 'تعطيل' : 'تفعيل'}
                                                    >
                                                        {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                    </button>
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id, user.id)}
                                                            className="p-1.5 text-red-600 hover:bg-red-100 rounded"
                                                            title="حذف"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
