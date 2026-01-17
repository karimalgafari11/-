/**
 * Backup Settings Component
 * إعدادات النسخ الاحتياطي
 */

import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useApp } from '../../context/AppContext';
import SettingsCard from './SettingsCard';
import SettingsToggle from './SettingsToggle';
import SettingsSelect from './SettingsSelect';
import SettingsInput from './SettingsInput';
import {
    Database, Download, Upload, Clock, Shield,
    Cloud, HardDrive, RefreshCw, Trash2, Check,
    AlertCircle, FileJson, Calendar
} from 'lucide-react';

const BackupSettings: React.FC = () => {
    const { settings, updateSettings, exportSettings, importSettings, exportAllData, importAllData } = useSettings();
    const { showNotification } = useApp();
    const { backup } = settings;

    const [exporting, setExporting] = useState(false);
    const [importing, setImporting] = useState(false);

    const handleExportSettings = () => {
        const json = exportSettings();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `alzhra-settings-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification('تم تصدير الإعدادات بنجاح', 'success');
    };

    const handleExportAllData = async () => {
        setExporting(true);
        try {
            const blob = await exportAllData();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `alzhra-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showNotification('تم تصدير جميع البيانات بنجاح', 'success');
        } catch (error) {
            showNotification('فشل تصدير البيانات', 'error');
        }
        setExporting(false);
    };

    const handleImportSettings = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        try {
            const text = await file.text();
            const success = importSettings(text);
            if (success) {
                showNotification('تم استيراد الإعدادات بنجاح', 'success');
            } else {
                showNotification('فشل استيراد الإعدادات', 'error');
            }
        } catch (error) {
            showNotification('ملف غير صالح', 'error');
        }
        setImporting(false);
        e.target.value = '';
    };

    const handleImportAllData = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm('سيتم استبدال جميع البيانات الحالية. هل تريد المتابعة؟')) {
            e.target.value = '';
            return;
        }

        setImporting(true);
        try {
            const success = await importAllData(file);
            if (success) {
                showNotification('تم استيراد البيانات بنجاح', 'success');
            } else {
                showNotification('فشل استيراد البيانات', 'error');
            }
        } catch (error) {
            showNotification('ملف غير صالح', 'error');
        }
        setImporting(false);
        e.target.value = '';
    };

    return (
        <div className="space-y-6">
            {/* Export/Import */}
            <SettingsCard
                title="تصدير واستيراد البيانات"
                description="إنشاء نسخة احتياطية أو استعادة البيانات"
                icon={Database}
                iconColor="text-blue-500"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Export Settings */}
                    <button
                        onClick={handleExportSettings}
                        className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                            <FileJson size={24} />
                        </div>
                        <div className="text-start">
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                تصدير الإعدادات
                            </p>
                            <p className="text-[10px] text-gray-500">
                                ملف JSON صغير
                            </p>
                        </div>
                    </button>

                    {/* Export All Data */}
                    <button
                        onClick={handleExportAllData}
                        disabled={exporting}
                        className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all group disabled:opacity-50"
                    >
                        <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                            {exporting ? (
                                <RefreshCw size={24} className="animate-spin" />
                            ) : (
                                <Download size={24} />
                            )}
                        </div>
                        <div className="text-start">
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                تصدير كامل
                            </p>
                            <p className="text-[10px] text-gray-500">
                                جميع البيانات والإعدادات
                            </p>
                        </div>
                    </button>

                    {/* Import Settings */}
                    <label className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all cursor-pointer group">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImportSettings}
                            className="hidden"
                        />
                        <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                            <Upload size={24} />
                        </div>
                        <div className="text-start">
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                استيراد الإعدادات
                            </p>
                            <p className="text-[10px] text-gray-500">
                                من ملف JSON
                            </p>
                        </div>
                    </label>

                    {/* Import All Data */}
                    <label className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all cursor-pointer group">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImportAllData}
                            className="hidden"
                        />
                        <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                            {importing ? (
                                <RefreshCw size={24} className="animate-spin" />
                            ) : (
                                <Upload size={24} />
                            )}
                        </div>
                        <div className="text-start">
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                استيراد كامل
                            </p>
                            <p className="text-[10px] text-red-500">
                                ⚠️ سيستبدل جميع البيانات
                            </p>
                        </div>
                    </label>
                </div>
            </SettingsCard>

            {/* Auto Backup Settings */}
            <SettingsCard
                title="النسخ الاحتياطي التلقائي"
                description="جدولة النسخ الاحتياطي التلقائي"
                icon={Clock}
                iconColor="text-purple-500"
            >
                <div className="space-y-4">
                    <SettingsToggle
                        label="تفعيل النسخ التلقائي"
                        description="إنشاء نسخة احتياطية تلقائياً"
                        checked={backup.autoBackup}
                        onChange={(checked) => updateSettings('backup', { autoBackup: checked })}
                    />

                    {backup.autoBackup && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <SettingsSelect
                                    label="التكرار"
                                    value={backup.frequency}
                                    onChange={(val) => updateSettings('backup', { frequency: val as any })}
                                    options={[
                                        { value: 'daily', label: 'يومياً' },
                                        { value: 'weekly', label: 'أسبوعياً' },
                                        { value: 'monthly', label: 'شهرياً' }
                                    ]}
                                />
                                <SettingsInput
                                    label="الوقت"
                                    value={backup.time}
                                    onChange={(val) => updateSettings('backup', { time: val })}
                                    type="time"
                                    dir="ltr"
                                />
                            </div>

                            <SettingsInput
                                label="عدد النسخ المحفوظة"
                                value={backup.keepCount}
                                onChange={(val) => updateSettings('backup', { keepCount: parseInt(val) || 5 })}
                                type="number"
                                min={1}
                                max={30}
                                description="سيتم حذف النسخ الأقدم تلقائياً"
                            />

                            <SettingsSelect
                                label="موقع الحفظ"
                                value={backup.location}
                                onChange={(val) => updateSettings('backup', { location: val as any })}
                                options={[
                                    { value: 'local', label: 'تخزين محلي' },
                                    { value: 'cloud', label: 'التخزين السحابي' }
                                ]}
                            />

                            {backup.location === 'cloud' && (
                                <SettingsSelect
                                    label="مزود التخزين السحابي"
                                    value={backup.cloudProvider || ''}
                                    onChange={(val) => updateSettings('backup', { cloudProvider: val as any })}
                                    options={[
                                        { value: 'google-drive', label: 'Google Drive' },
                                        { value: 'dropbox', label: 'Dropbox' },
                                        { value: 'onedrive', label: 'OneDrive' }
                                    ]}
                                />
                            )}
                        </>
                    )}
                </div>
            </SettingsCard>

            {/* Security */}
            <SettingsCard
                title="أمان النسخ الاحتياطي"
                icon={Shield}
                iconColor="text-green-500"
            >
                <div className="space-y-4">
                    <SettingsToggle
                        label="تشفير النسخ الاحتياطية"
                        description="حماية البيانات بكلمة مرور"
                        checked={backup.encryptBackups}
                        onChange={(checked) => updateSettings('backup', { encryptBackups: checked })}
                    />

                    <SettingsToggle
                        label="تضمين الإعدادات"
                        description="حفظ الإعدادات مع النسخة الاحتياطية"
                        checked={backup.includeSettings}
                        onChange={(checked) => updateSettings('backup', { includeSettings: checked })}
                    />

                    <SettingsToggle
                        label="تضمين الوسائط"
                        description="حفظ الصور والملفات المرفقة"
                        checked={backup.includeMedia}
                        onChange={(checked) => updateSettings('backup', { includeMedia: checked })}
                    />
                </div>
            </SettingsCard>

            {/* Backup History */}
            {backup.backups && backup.backups.length > 0 && (
                <SettingsCard
                    title="سجل النسخ السابقة"
                    icon={Calendar}
                    iconColor="text-cyan-500"
                >
                    <div className="space-y-2">
                        {backup.backups.map((b) => (
                            <div
                                key={b.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${b.location === 'cloud'
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                        }`}>
                                        {b.location === 'cloud' ? <Cloud size={16} /> : <HardDrive size={16} />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                                            {b.name}
                                        </p>
                                        <p className="text-[10px] text-gray-500">
                                            {new Date(b.createdAt).toLocaleString('ar')} • {(b.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {b.encrypted && (
                                        <Shield size={14} className="text-green-500" />
                                    )}
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${b.type === 'auto'
                                            ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                                            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                        {b.type === 'auto' ? 'تلقائي' : 'يدوي'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </SettingsCard>
            )}

            {/* Last Backup Info */}
            {backup.lastBackup && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <Check size={16} className="text-green-500" />
                    <span className="text-xs text-green-700 dark:text-green-400">
                        آخر نسخة احتياطية: {new Date(backup.lastBackup).toLocaleString('ar')}
                    </span>
                </div>
            )}
        </div>
    );
};

export default BackupSettings;
