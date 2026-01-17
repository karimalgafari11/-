/**
 * Currency Manager Component
 * إدارة العملات مع دعم إضافة عملات جديدة
 */

import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useApp } from '../../context/AppContext';
import SettingsCard from './SettingsCard';
import SettingsInput from './SettingsInput';
import SettingsToggle from './SettingsToggle';
import SettingsSelect from './SettingsSelect';
import {
    Coins, Plus, Trash2, Check, Edit2, X, Star,
    TrendingUp, History, ArrowRightLeft
} from 'lucide-react';
import { Currency } from '../../types/common';

const CurrencyManager: React.FC = () => {
    const {
        currencies,
        addCurrency,
        updateCurrency,
        deleteCurrency,
        setDefaultCurrency,
        exchangeRates,
        addExchangeRate,
        getExchangeHistory,
        formatCurrency,
        settings
    } = useSettings();
    const { showNotification, language } = useApp();

    const [showAddCurrency, setShowAddCurrency] = useState(false);
    const [showAddRate, setShowAddRate] = useState(false);
    const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);

    const [newCurrency, setNewCurrency] = useState<Partial<Currency>>({
        code: '',
        nameAr: '',
        nameEn: '',
        symbol: '',
        decimalPlaces: 2,
        isActive: true,
        isDefault: false,
        position: 'after'
    });

    const [newRate, setNewRate] = useState({
        fromCurrency: '',
        toCurrency: '',
        rate: 0,
        note: ''
    });

    const handleAddCurrency = () => {
        if (!newCurrency.code || !newCurrency.nameAr || !newCurrency.symbol) {
            showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        if (currencies.find(c => c.code === newCurrency.code)) {
            showNotification('رمز العملة موجود مسبقاً', 'error');
            return;
        }

        addCurrency(newCurrency as Omit<Currency, 'createdAt'>);
        setNewCurrency({
            code: '',
            nameAr: '',
            nameEn: '',
            symbol: '',
            decimalPlaces: 2,
            isActive: true,
            isDefault: false,
            position: 'after'
        });
        setShowAddCurrency(false);
        showNotification('تم إضافة العملة بنجاح', 'success');
    };

    const handleUpdateCurrency = () => {
        if (!editingCurrency) return;
        updateCurrency(editingCurrency);
        setEditingCurrency(null);
        showNotification('تم تحديث العملة بنجاح', 'success');
    };

    const handleDeleteCurrency = (code: string) => {
        const currency = currencies.find(c => c.code === code);
        if (currency?.isDefault) {
            showNotification('لا يمكن حذف العملة الافتراضية', 'error');
            return;
        }

        if (confirm('هل أنت متأكد من حذف هذه العملة؟')) {
            deleteCurrency(code);
            showNotification('تم حذف العملة', 'info');
        }
    };

    const handleAddExchangeRate = () => {
        if (!newRate.fromCurrency || !newRate.toCurrency || newRate.rate <= 0) {
            showNotification('يرجى ملء جميع الحقول بشكل صحيح', 'error');
            return;
        }

        if (newRate.fromCurrency === newRate.toCurrency) {
            showNotification('لا يمكن تحويل العملة لنفسها', 'error');
            return;
        }

        addExchangeRate({
            fromCurrency: newRate.fromCurrency,
            toCurrency: newRate.toCurrency,
            rate: newRate.rate,
            date: new Date().toISOString().split('T')[0],
            note: newRate.note,
            createdBy: 'user'
        });

        setNewRate({ fromCurrency: '', toCurrency: '', rate: 0, note: '' });
        setShowAddRate(false);
        showNotification('تم إضافة سعر الصرف بنجاح', 'success');
    };

    const activeCurrencies = currencies.filter(c => c.isActive);

    return (
        <div className="space-y-6">
            {/* Active Currencies */}
            <SettingsCard
                title="العملات المفعلة"
                description="قائمة العملات المستخدمة في النظام"
                icon={Coins}
                iconColor="text-yellow-500"
                actions={
                    <button
                        onClick={() => setShowAddCurrency(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={14} />
                        إضافة عملة
                    </button>
                }
            >
                <div className="space-y-2">
                    {currencies.map((currency) => (
                        <div
                            key={currency.code}
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${currency.isDefault
                                    ? 'border-primary/30 bg-primary/5'
                                    : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                                } ${!currency.isActive ? 'opacity-50' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Currency Symbol */}
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold ${currency.isDefault
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                    }`}>
                                    {currency.symbol}
                                </div>

                                {/* Currency Info */}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black text-gray-900 dark:text-gray-100">
                                            {language === 'ar' ? currency.nameAr : currency.nameEn}
                                        </span>
                                        <span className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                            {currency.code}
                                        </span>
                                        {currency.isDefault && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                                <Star size={10} />
                                                افتراضية
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-0.5">
                                        {currency.decimalPlaces} خانات عشرية • الرمز {currency.position === 'before' ? 'قبل' : 'بعد'} المبلغ
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                {!currency.isDefault && currency.isActive && (
                                    <button
                                        onClick={() => setDefaultCurrency(currency.code)}
                                        className="p-2 text-gray-400 hover:text-yellow-500 rounded-lg transition-colors"
                                        title="تعيين كافتراضية"
                                    >
                                        <Star size={16} />
                                    </button>
                                )}

                                <button
                                    onClick={() => setEditingCurrency(currency)}
                                    className="p-2 text-gray-400 hover:text-primary rounded-lg transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>

                                {!currency.isDefault && (
                                    <button
                                        onClick={() => handleDeleteCurrency(currency.code)}
                                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </SettingsCard>

            {/* Exchange Rates */}
            <SettingsCard
                title="أسعار الصرف"
                description="أسعار التحويل بين العملات"
                icon={ArrowRightLeft}
                iconColor="text-green-500"
                actions={
                    <button
                        onClick={() => setShowAddRate(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors"
                    >
                        <Plus size={14} />
                        تحديث سعر
                    </button>
                }
            >
                {/* Current Rates Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {activeCurrencies.map((fromCurrency) =>
                        activeCurrencies
                            .filter(tc => tc.code !== fromCurrency.code)
                            .slice(0, 2)
                            .map((toCurrency) => {
                                const history = getExchangeHistory(fromCurrency.code, toCurrency.code, 1);
                                const rate = history[0];

                                return rate ? (
                                    <div
                                        key={`${fromCurrency.code}-${toCurrency.code}`}
                                        className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100">
                                                <span>{fromCurrency.code}</span>
                                                <ArrowRightLeft size={14} className="text-gray-400" />
                                                <span>{toCurrency.code}</span>
                                            </div>
                                            <TrendingUp size={14} className="text-green-500" />
                                        </div>
                                        <p className="text-xl font-black text-primary">
                                            {rate.fromCurrency === fromCurrency.code
                                                ? rate.rate.toLocaleString()
                                                : (1 / rate.rate).toFixed(4)
                                            }
                                        </p>
                                        <p className="text-[10px] text-gray-500 mt-1">
                                            آخر تحديث: {new Date(rate.date).toLocaleDateString('ar')}
                                        </p>
                                    </div>
                                ) : null;
                            })
                    )}
                </div>

                {/* Recent History */}
                {exchangeRates.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 mb-3">
                            <History size={14} className="text-gray-400" />
                            <span className="text-xs font-bold text-gray-500">آخر التحديثات</span>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {exchangeRates.slice(0, 10).map((rate) => (
                                <div
                                    key={rate.id}
                                    className="flex items-center justify-between text-xs py-2 border-b border-gray-50 dark:border-gray-800 last:border-0"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">
                                            {rate.fromCurrency} → {rate.toCurrency}
                                        </span>
                                        <span className="text-primary font-black">{rate.rate}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        {rate.note && <span className="text-[10px]">{rate.note}</span>}
                                        <span>{new Date(rate.date).toLocaleDateString('ar')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </SettingsCard>

            {/* Add Currency Modal */}
            {showAddCurrency && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                                إضافة عملة جديدة
                            </h3>
                            <button
                                onClick={() => setShowAddCurrency(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <SettingsInput
                                    label="رمز العملة"
                                    value={newCurrency.code || ''}
                                    onChange={(val) => setNewCurrency(prev => ({ ...prev, code: val.toUpperCase() }))}
                                    placeholder="USD"
                                    maxLength={3}
                                    dir="ltr"
                                    required
                                />
                                <SettingsInput
                                    label="الرمز"
                                    value={newCurrency.symbol || ''}
                                    onChange={(val) => setNewCurrency(prev => ({ ...prev, symbol: val }))}
                                    placeholder="$"
                                    maxLength={5}
                                    required
                                />
                            </div>

                            <SettingsInput
                                label="الاسم بالعربية"
                                value={newCurrency.nameAr || ''}
                                onChange={(val) => setNewCurrency(prev => ({ ...prev, nameAr: val }))}
                                placeholder="دولار أمريكي"
                                required
                            />

                            <SettingsInput
                                label="الاسم بالإنجليزية"
                                value={newCurrency.nameEn || ''}
                                onChange={(val) => setNewCurrency(prev => ({ ...prev, nameEn: val }))}
                                placeholder="US Dollar"
                                dir="ltr"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <SettingsInput
                                    label="الخانات العشرية"
                                    value={newCurrency.decimalPlaces || 2}
                                    onChange={(val) => setNewCurrency(prev => ({ ...prev, decimalPlaces: parseInt(val) || 2 }))}
                                    type="number"
                                    min={0}
                                    max={4}
                                />
                                <SettingsSelect
                                    label="موضع الرمز"
                                    value={newCurrency.position || 'after'}
                                    onChange={(val) => setNewCurrency(prev => ({ ...prev, position: val as 'before' | 'after' }))}
                                    options={[
                                        { value: 'before', label: 'قبل المبلغ' },
                                        { value: 'after', label: 'بعد المبلغ' }
                                    ]}
                                />
                            </div>

                            <SettingsToggle
                                label="تفعيل العملة"
                                checked={newCurrency.isActive || false}
                                onChange={(checked) => setNewCurrency(prev => ({ ...prev, isActive: checked }))}
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddCurrency(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleAddCurrency}
                                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
                            >
                                إضافة
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Exchange Rate Modal */}
            {showAddRate && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                                تحديث سعر الصرف
                            </h3>
                            <button
                                onClick={() => setShowAddRate(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <SettingsSelect
                                    label="من عملة"
                                    value={newRate.fromCurrency}
                                    onChange={(val) => setNewRate(prev => ({ ...prev, fromCurrency: val }))}
                                    options={activeCurrencies.map(c => ({
                                        value: c.code,
                                        label: `${c.nameAr} (${c.code})`
                                    }))}
                                    placeholder="اختر..."
                                />
                                <SettingsSelect
                                    label="إلى عملة"
                                    value={newRate.toCurrency}
                                    onChange={(val) => setNewRate(prev => ({ ...prev, toCurrency: val }))}
                                    options={activeCurrencies
                                        .filter(c => c.code !== newRate.fromCurrency)
                                        .map(c => ({
                                            value: c.code,
                                            label: `${c.nameAr} (${c.code})`
                                        }))}
                                    placeholder="اختر..."
                                />
                            </div>

                            <SettingsInput
                                label="سعر الصرف"
                                value={newRate.rate}
                                onChange={(val) => setNewRate(prev => ({ ...prev, rate: parseFloat(val) || 0 }))}
                                type="number"
                                step={0.0001}
                                min={0}
                                description={newRate.fromCurrency && newRate.toCurrency
                                    ? `1 ${newRate.fromCurrency} = ${newRate.rate || '?'} ${newRate.toCurrency}`
                                    : undefined
                                }
                            />

                            <SettingsInput
                                label="ملاحظة (اختياري)"
                                value={newRate.note}
                                onChange={(val) => setNewRate(prev => ({ ...prev, note: val }))}
                                placeholder="مثال: سعر السوق الموازي"
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddRate(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleAddExchangeRate}
                                className="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-colors"
                            >
                                حفظ السعر
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Currency Modal */}
            {editingCurrency && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-6">
                            تعديل العملة: {editingCurrency.code}
                        </h3>

                        <div className="space-y-4">
                            <SettingsInput
                                label="الاسم بالعربية"
                                value={editingCurrency.nameAr}
                                onChange={(val) => setEditingCurrency(prev => prev ? { ...prev, nameAr: val } : null)}
                            />

                            <SettingsInput
                                label="الاسم بالإنجليزية"
                                value={editingCurrency.nameEn}
                                onChange={(val) => setEditingCurrency(prev => prev ? { ...prev, nameEn: val } : null)}
                                dir="ltr"
                            />

                            <SettingsInput
                                label="الرمز"
                                value={editingCurrency.symbol}
                                onChange={(val) => setEditingCurrency(prev => prev ? { ...prev, symbol: val } : null)}
                            />

                            <SettingsToggle
                                label="تفعيل العملة"
                                checked={editingCurrency.isActive}
                                onChange={(checked) => setEditingCurrency(prev => prev ? { ...prev, isActive: checked } : null)}
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setEditingCurrency(null)}
                                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleUpdateCurrency}
                                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
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

export default CurrencyManager;
