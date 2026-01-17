import React, { useState } from 'react';
import Modal from '../Common/Modal';
import Button from '../UI/Button';
import { Globe } from 'lucide-react';
import { CurrencyCode } from '../../types';
import { useFinance } from '../../context/FinanceContext';
import { useApp } from '../../context/AppContext';

interface AddEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddEntryModal: React.FC<AddEntryModalProps> = ({ isOpen, onClose }) => {
    const { addTransaction } = useFinance();
    const { showNotification } = useApp();

    const [entryForm, setEntryForm] = useState({
        description: '',
        date: new Date().toISOString().split('T')[0],
        currency: 'SAR' as CurrencyCode,
        lines: [
            { account: 'نقدية', debit: 0, credit: 0 },
            { account: 'مبيعات', debit: 0, credit: 0 }
        ]
    });

    const totalDebit = entryForm.lines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = entryForm.lines.reduce((s, l) => s + l.credit, 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

    const handlePostEntry = () => {
        if (!isBalanced) return;
        entryForm.lines.forEach((line, idx) => {
            if (line.debit > 0 || line.credit > 0) {
                addTransaction({
                    id: `JN-${Date.now()}-${idx}`,
                    date: entryForm.date,
                    description: entryForm.description || 'قيد يومية يدوي',
                    amount: line.debit > 0 ? line.debit : -line.credit,
                    currency: entryForm.currency,
                    account: line.account,
                    category: 'تسوية محاسبية',
                    status: 'paid'
                });
            }
        });
        showNotification('تم ترحيل القيد بنجاح');
        onClose();
        // Reset form
        setEntryForm({
            description: '',
            date: new Date().toISOString().split('T')[0],
            currency: 'SAR',
            lines: [
                { account: 'نقدية', debit: 0, credit: 0 },
                { account: 'مبيعات', debit: 0, credit: 0 }
            ]
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="إضافة قيد محاسبي" size="lg">
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">تاريخ العملية</label>
                        <input type="date" className="w-full p-3 rounded-xl border border-gray-100 dark:border-indigo-900/30 dark:bg-slate-800 dark:text-white font-bold text-xs" value={entryForm.date} onChange={e => setEntryForm({ ...entryForm, date: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">البيان</label>
                        <input type="text" placeholder="وصف العملية..." className="w-full p-3 rounded-xl border border-gray-100 dark:border-indigo-900/30 dark:bg-slate-800 dark:text-white font-bold text-xs" value={entryForm.description} onChange={e => setEntryForm({ ...entryForm, description: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase">العملة</label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <select className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-100 dark:border-indigo-900/30 dark:bg-slate-800 dark:text-white font-black text-xs appearance-none" value={entryForm.currency} onChange={e => setEntryForm({ ...entryForm, currency: e.target.value as CurrencyCode })}>
                                <option value="SAR">الريال السعودي (SAR)</option>
                                <option value="YER">الريال اليمني (YER)</option>
                                <option value="OMR">الريال العماني (OMR)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="border border-gray-200 dark:border-indigo-900/30 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-indigo-800/30">
                            <tr>
                                <th className="p-3 text-start text-[9px] font-black uppercase text-gray-500 border-e border-gray-200 dark:border-indigo-800/30">الحساب</th>
                                <th className="p-3 text-center text-[9px] font-black uppercase text-gray-500 border-e border-gray-200 dark:border-indigo-800/30">مدين</th>
                                <th className="p-3 text-center text-[9px] font-black uppercase text-gray-500">دائن</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entryForm.lines.map((line, idx) => (
                                <tr key={idx} className="border-b border-gray-100 dark:border-indigo-900/30 last:border-0">
                                    <td className="p-2 border-e border-gray-100 dark:border-indigo-900/30">
                                        <select className="w-full p-2 rounded-lg border-0 dark:bg-slate-900 dark:text-white font-black text-[11px] focus:ring-0" value={line.account} onChange={e => {
                                            const l = [...entryForm.lines]; l[idx].account = e.target.value; setEntryForm({ ...entryForm, lines: l });
                                        }}>
                                            <option value="نقدية">نقدية في البنك</option>
                                            <option value="مبيعات">إيراد مبيعات</option>
                                            <option value="موردين">ذمم موردين</option>
                                            <option value="عملاء">ذمم عملاء</option>
                                        </select>
                                    </td>
                                    <td className="p-2 border-e border-gray-100 dark:border-indigo-900/30">
                                        <input type="number" className="w-full p-2 bg-transparent text-center font-black text-emerald-600 text-[11px] border-0 outline-none" placeholder="0.00" value={line.debit || ''} onChange={e => {
                                            const l = [...entryForm.lines]; l[idx].debit = parseFloat(e.target.value) || 0; l[idx].credit = 0; setEntryForm({ ...entryForm, lines: l });
                                        }} />
                                    </td>
                                    <td className="p-2">
                                        <input type="number" className="w-full p-2 bg-transparent text-center font-black text-rose-600 text-[11px] border-0 outline-none" placeholder="0.00" value={line.credit || ''} onChange={e => {
                                            const l = [...entryForm.lines]; l[idx].credit = parseFloat(e.target.value) || 0; l[idx].debit = 0; setEntryForm({ ...entryForm, lines: l });
                                        }} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className={`p-4 rounded-xl border flex justify-between items-center ${isBalanced ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest">{isBalanced ? 'القيد متوازن' : 'القيد غير متوازن'}</span>
                    <div className="flex gap-4 font-black text-xs tabular-nums">
                        <span>D: {totalDebit.toFixed(2)}</span>
                        <span>C: {totalCredit.toFixed(2)}</span>
                    </div>
                </div>

                <Button fullWidth size="lg" disabled={!isBalanced} onClick={handlePostEntry}>
                    ترحيل القيد للمحاسب العام
                </Button>
            </div>
        </Modal>
    );
};

export default AddEntryModal;
