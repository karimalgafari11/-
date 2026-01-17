/**
 * Company Settings Component
 * إعدادات الشركة
 */

import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useApp } from '../../context/AppContext';
import SettingsCard from './SettingsCard';
import SettingsInput from './SettingsInput';
import SettingsSelect from './SettingsSelect';
import {
    Building2, Phone, Mail, Globe, FileText,
    MapPin, Plus, Trash2, Check, Edit2, X
} from 'lucide-react';
import { CompanyInfo } from '../../types/settings-extended';

const CompanySettings: React.FC = () => {
    const { activeCompany, companies, updateCompany, addCompany, deleteCompany, switchCompany, currencies } = useSettings();
    const { showNotification } = useApp();

    const [editMode, setEditMode] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState<Partial<CompanyInfo>>({});

    useEffect(() => {
        if (activeCompany) {
            setFormData(activeCompany);
        }
    }, [activeCompany]);

    const handleSave = () => {
        if (!formData.name) {
            showNotification('يرجى إدخال اسم الشركة', 'error');
            return;
        }

        updateCompany(formData as CompanyInfo);
        setEditMode(false);
        showNotification('تم حفظ بيانات الشركة بنجاح', 'success');
    };

    const handleAddCompany = () => {
        const newCompany = {
            name: formData.name || 'شركة جديدة',
            nameEn: formData.nameEn,
            address: formData.address || '',
            phone: formData.phone || '',
            email: formData.email,
            baseCurrency: formData.baseCurrency || 'YER',
            fiscalYearStart: '01-01'
        };

        addCompany(newCompany);
        setShowAddModal(false);
        setFormData({});
        showNotification('تم إضافة الشركة بنجاح', 'success');
    };

    const handleDeleteCompany = (id: string) => {
        if (companies.length <= 1) {
            showNotification('لا يمكن حذف الشركة الوحيدة', 'error');
            return;
        }

        if (confirm('هل أنت متأكد من حذف هذه الشركة؟')) {
            deleteCompany(id);
            showNotification('تم حذف الشركة', 'info');
        }
    };

    const currencyOptions = currencies.filter(c => c.isActive).map(c => ({
        value: c.code,
        label: `${c.nameAr} (${c.code})`
    }));

    return (
        <div className="space-y-6">
            {/* Company Selector */}
            {companies.length > 1 && (
                <SettingsCard title="اختيار الشركة" icon={Building2} iconColor="text-blue-500">
                    <div className="flex flex-wrap gap-2">
                        {companies.map((company) => (
                            <button
                                key={company.id}
                                onClick={() => switchCompany(company.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${activeCompany?.id === company.id
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                    }`}
                            >
                                <Building2 size={16} />
                                <span className="text-sm font-bold">{company.name}</span>
                                {activeCompany?.id === company.id && (
                                    <Check size={14} className="text-primary" />
                                )}
                            </button>
                        ))}

                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 hover:border-primary hover:text-primary transition-all"
                        >
                            <Plus size={16} />
                            <span className="text-sm font-bold">إضافة شركة</span>
                        </button>
                    </div>
                </SettingsCard>
            )}

            {/* Company Info */}
            <SettingsCard
                title="بيانات الشركة"
                description="المعلومات الأساسية التي ستظهر في الفواتير والتقارير"
                icon={Building2}
                iconColor="text-blue-500"
                actions={
                    editMode ? (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setEditMode(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
                            >
                                <X size={18} />
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                حفظ
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setEditMode(true)}
                            className="p-2 text-gray-400 hover:text-primary rounded-lg transition-colors"
                        >
                            <Edit2 size={18} />
                        </button>
                    )
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SettingsInput
                        label="اسم الشركة"
                        value={formData.name || ''}
                        onChange={(val) => setFormData(prev => ({ ...prev, name: val }))}
                        disabled={!editMode}
                        required
                    />

                    <SettingsInput
                        label="الاسم بالإنجليزية"
                        value={formData.nameEn || ''}
                        onChange={(val) => setFormData(prev => ({ ...prev, nameEn: val }))}
                        disabled={!editMode}
                        dir="ltr"
                    />

                    <SettingsInput
                        label="رقم الهاتف"
                        value={formData.phone || ''}
                        onChange={(val) => setFormData(prev => ({ ...prev, phone: val }))}
                        icon={Phone}
                        disabled={!editMode}
                        type="tel"
                        dir="ltr"
                    />

                    <SettingsInput
                        label="البريد الإلكتروني"
                        value={formData.email || ''}
                        onChange={(val) => setFormData(prev => ({ ...prev, email: val }))}
                        icon={Mail}
                        disabled={!editMode}
                        type="email"
                        dir="ltr"
                    />

                    <SettingsInput
                        label="الموقع الإلكتروني"
                        value={formData.website || ''}
                        onChange={(val) => setFormData(prev => ({ ...prev, website: val }))}
                        icon={Globe}
                        disabled={!editMode}
                        type="url"
                        dir="ltr"
                        placeholder="https://example.com"
                    />

                    <SettingsSelect
                        label="العملة الأساسية"
                        value={formData.baseCurrency || 'YER'}
                        onChange={(val) => setFormData(prev => ({ ...prev, baseCurrency: val }))}
                        options={currencyOptions}
                        disabled={!editMode}
                    />

                    <div className="md:col-span-2">
                        <SettingsInput
                            label="العنوان"
                            value={formData.address || ''}
                            onChange={(val) => setFormData(prev => ({ ...prev, address: val }))}
                            icon={MapPin}
                            disabled={!editMode}
                        />
                    </div>
                </div>
            </SettingsCard>

            {/* Tax & Commercial Info */}
            <SettingsCard
                title="البيانات الضريبية والتجارية"
                description="معلومات التسجيل الرسمية"
                icon={FileText}
                iconColor="text-green-500"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SettingsInput
                        label="الرقم الضريبي"
                        value={formData.taxNumber || ''}
                        onChange={(val) => setFormData(prev => ({ ...prev, taxNumber: val }))}
                        disabled={!editMode}
                        dir="ltr"
                        placeholder="مثال: 300000000000003"
                    />

                    <SettingsInput
                        label="السجل التجاري"
                        value={formData.commercialRegister || ''}
                        onChange={(val) => setFormData(prev => ({ ...prev, commercialRegister: val }))}
                        disabled={!editMode}
                        dir="ltr"
                    />
                </div>
            </SettingsCard>

            {/* Companies List */}
            {companies.length > 1 && (
                <SettingsCard
                    title="إدارة الشركات"
                    description="قائمة جميع الشركات المسجلة"
                    icon={Building2}
                    iconColor="text-purple-500"
                >
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {companies.map((company) => (
                            <div
                                key={company.id}
                                className="flex items-center justify-between py-3"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeCompany?.id === company.id
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                        }`}>
                                        <Building2 size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                            {company.name}
                                        </p>
                                        <p className="text-[10px] text-gray-500">
                                            {company.phone || 'لا يوجد هاتف'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {activeCompany?.id === company.id && (
                                        <span className="px-2 py-1 text-[10px] font-bold bg-primary/10 text-primary rounded-lg">
                                            نشطة
                                        </span>
                                    )}

                                    <button
                                        onClick={() => handleDeleteCompany(company.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                        disabled={companies.length <= 1}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </SettingsCard>
            )}

            {/* Add Company Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-4">
                            إضافة شركة جديدة
                        </h3>

                        <div className="space-y-4">
                            <SettingsInput
                                label="اسم الشركة"
                                value={formData.name || ''}
                                onChange={(val) => setFormData(prev => ({ ...prev, name: val }))}
                                required
                            />

                            <SettingsInput
                                label="رقم الهاتف"
                                value={formData.phone || ''}
                                onChange={(val) => setFormData(prev => ({ ...prev, phone: val }))}
                                type="tel"
                                dir="ltr"
                            />

                            <SettingsSelect
                                label="العملة الأساسية"
                                value={formData.baseCurrency || 'YER'}
                                onChange={(val) => setFormData(prev => ({ ...prev, baseCurrency: val }))}
                                options={currencyOptions}
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setFormData({});
                                }}
                                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleAddCompany}
                                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
                            >
                                إضافة
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanySettings;
