import React, { useState, useEffect } from 'react';
import Button from '../UI/Button';
import { X, Save, FolderTree, Edit2 } from 'lucide-react';
import { Account, AccountType, AccountTypeLabels, AccountTypeColors } from '../../types/accounts';

interface AddAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (account: {
        code: string;
        name: string;
        type: AccountType;
        parentId?: string;
        description?: string;
    }) => void;
    initialData?: Account;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [type, setType] = useState<AccountType>('asset');
    const [parentId, setParentId] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (isOpen && initialData) {
            setCode(initialData.code);
            setName(initialData.name);
            setType(initialData.type);
            setParentId(initialData.parentId || '');
            setDescription(initialData.description || '');
        } else if (isOpen && !initialData) {
            // Reset if opening in add mode
            setCode('');
            setName('');
            setType('asset');
            setParentId('');
            setDescription('');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!code || !name) {
            alert('يرجى إدخال كود واسم الحساب');
            return;
        }
        onSave({
            code,
            name,
            type,
            parentId: parentId || undefined,
            description: description || undefined
        });
        // Reset form
        setCode('');
        setName('');
        setType('asset');
        setParentId('');
        setDescription('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-l from-primary to-blue-600 p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                {initialData ? <Edit2 size={20} /> : <FolderTree size={20} />}
                            </div>
                            <div>
                                <h2 className="text-lg font-black">{initialData ? 'تعديل الحساب' : 'إضافة حساب جديد'}</h2>
                                <p className="text-xs opacity-80">
                                    {initialData ? 'تعديل بيانات الحساب الحالي' : 'إضافة حساب لدليل الحسابات'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Account Code */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5">
                            كود الحساب *
                        </label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="مثال: 1111"
                            disabled={!!initialData}
                            className={`w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-indigo-800/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono ${initialData ? 'opacity-50 cursor-not-allowed' : ''}`}
                            dir="ltr"
                        />
                    </div>

                    {/* Account Name */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5">
                            اسم الحساب *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="مثال: الصندوق"
                            className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-indigo-800/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    {/* Account Type */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5">
                            نوع الحساب
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {(Object.keys(AccountTypeLabels) as AccountType[]).map((t) => {
                                const colors = AccountTypeColors[t];
                                const isSelected = type === t;
                                return (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setType(t)}
                                        className={`p-2 rounded-lg text-[10px] font-bold transition-all ${isSelected
                                            ? `${colors.bg} ${colors.text} ring-2 ring-offset-2 ring-primary`
                                            : 'bg-gray-100 dark:bg-slate-800 text-gray-500 hover:bg-gray-200'
                                            }`}
                                    >
                                        {AccountTypeLabels[t]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Parent Account */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5">
                            الحساب الأب (اختياري)
                        </label>
                        <input
                            type="text"
                            value={parentId}
                            onChange={(e) => setParentId(e.target.value)}
                            placeholder="كود الحساب الأب"
                            className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-indigo-800/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                            dir="ltr"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5">
                            الوصف (اختياري)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="وصف مختصر للحساب"
                            rows={2}
                            className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-indigo-800/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-indigo-900/30">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                        >
                            إلغاء
                        </Button>
                        <Button
                            type="submit"
                            variant="success"
                            size="sm"
                            icon={<Save size={14} />}
                        >
                            {initialData ? 'حفظ التغييرات' : 'حفظ الحساب'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAccountModal;
