/**
 * Company Management Component - إدارة الشركة
 * عرض وتعديل بيانات الشركة الحالية
 */

import React, { useState, useEffect } from 'react';
import { Building2, Save, Plus, ArrowLeftRight } from 'lucide-react';
import { useUser } from '../../context/app/UserContext';
import { companyService, CompanyData } from '../../services/companyService';

interface CompanyFormData {
    name: string;
    name_en: string;
    phone: string;
    email: string;
    address: string;
    tax_number: string;
    commercial_register: string;
}

export const CompanyManagement: React.FC = () => {
    const { currentCompany, companies, switchCompany, refreshCompanies, isAdmin } = useUser();

    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [formData, setFormData] = useState<CompanyFormData>({
        name: '',
        name_en: '',
        phone: '',
        email: '',
        address: '',
        tax_number: '',
        commercial_register: ''
    });

    // تحميل بيانات الشركة الحالية
    useEffect(() => {
        if (currentCompany) {
            setFormData({
                name: currentCompany.name || '',
                name_en: currentCompany.name_en || '',
                phone: currentCompany.phone || '',
                email: currentCompany.email || '',
                address: currentCompany.address || '',
                tax_number: currentCompany.tax_number || '',
                commercial_register: currentCompany.commercial_register || ''
            });
        }
    }, [currentCompany]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!currentCompany) return;

        setIsSaving(true);
        setMessage(null);

        try {
            const result = await companyService.updateCompany(currentCompany.id, formData);
            if (result) {
                setMessage({ type: 'success', text: 'تم حفظ التغييرات بنجاح' });
                setIsEditing(false);
                await refreshCompanies();
            } else {
                setMessage({ type: 'error', text: 'فشل في حفظ التغييرات' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'حدث خطأ أثناء الحفظ' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateCompany = async () => {
        if (!formData.name.trim()) {
            setMessage({ type: 'error', text: 'يرجى إدخال اسم الشركة' });
            return;
        }

        setIsSaving(true);
        setMessage(null);

        try {
            const result = await companyService.createCompany(formData);
            if (result) {
                setMessage({ type: 'success', text: 'تم إنشاء الشركة بنجاح' });
                setIsCreating(false);
                await refreshCompanies();
                setFormData({
                    name: '',
                    name_en: '',
                    phone: '',
                    email: '',
                    address: '',
                    tax_number: '',
                    commercial_register: ''
                });
            } else {
                setMessage({ type: 'error', text: 'فشل في إنشاء الشركة' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'حدث خطأ أثناء الإنشاء' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSwitchCompany = async (companyId: string) => {
        const success = await switchCompany(companyId);
        if (success) {
            setMessage({ type: 'success', text: 'تم التبديل بنجاح' });
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Building2 className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        إدارة الشركة
                    </h2>
                </div>

                <div className="flex gap-2">
                    {isAdmin && !isCreating && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            <Plus className="w-4 h-4" />
                            شركة جديدة
                        </button>
                    )}

                    {!isEditing && !isCreating && currentCompany && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            تعديل
                        </button>
                    )}
                </div>
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

            {/* قائمة الشركات للتبديل */}
            {companies.length > 1 && !isEditing && !isCreating && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                        <ArrowLeftRight className="w-4 h-4" />
                        <span className="font-medium">التبديل بين الشركات:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {companies.map(company => (
                            <button
                                key={company.id}
                                onClick={() => handleSwitchCompany(company.id)}
                                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${currentCompany?.id === company.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-blue-100'
                                    }`}
                            >
                                {company.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* نموذج إنشاء شركة جديدة */}
            {isCreating && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">إنشاء شركة جديدة</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                اسم الشركة *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                placeholder="اسم الشركة بالعربية"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                اسم الشركة (إنجليزي)
                            </label>
                            <input
                                type="text"
                                name="name_en"
                                value={formData.name_en}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                placeholder="Company Name"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleCreateCompany}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {isSaving ? 'جاري الإنشاء...' : 'إنشاء الشركة'}
                        </button>
                        <button
                            onClick={() => setIsCreating(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            )}

            {/* نموذج تعديل الشركة */}
            {isEditing && !isCreating && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                اسم الشركة
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                اسم الشركة (إنجليزي)
                            </label>
                            <input
                                type="text"
                                name="name_en"
                                value={formData.name_en}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                dir="ltr"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                الهاتف
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                dir="ltr"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                البريد الإلكتروني
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                dir="ltr"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                الرقم الضريبي
                            </label>
                            <input
                                type="text"
                                name="tax_number"
                                value={formData.tax_number}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                السجل التجاري
                            </label>
                            <input
                                type="text"
                                name="commercial_register"
                                value={formData.commercial_register}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                العنوان
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            )}

            {/* عرض بيانات الشركة */}
            {!isEditing && !isCreating && currentCompany && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoField label="اسم الشركة" value={currentCompany.name} />
                        <InfoField label="اسم الشركة (إنجليزي)" value={currentCompany.name_en} />
                        <InfoField label="الهاتف" value={currentCompany.phone} />
                        <InfoField label="البريد الإلكتروني" value={currentCompany.email} />
                        <InfoField label="الرقم الضريبي" value={currentCompany.tax_number} />
                        <InfoField label="السجل التجاري" value={currentCompany.commercial_register} />
                        <InfoField label="العنوان" value={currentCompany.address} className="md:col-span-2" />
                    </div>
                </div>
            )}
        </div>
    );
};

// مكون عرض الحقل
const InfoField: React.FC<{ label: string; value?: string; className?: string }> = ({
    label,
    value,
    className = ''
}) => (
    <div className={className}>
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <p className="text-gray-900 dark:text-white font-medium">
            {value || '-'}
        </p>
    </div>
);

export default CompanyManagement;
