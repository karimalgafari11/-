/**
 * Currency Manager Component - Refactored
 * إدارة العملات - تم تقسيمه إلى مكونات أصغر
 * 
 * الملفات المُستخرجة:
 * - Currency/CurrencyListItem.tsx - عنصر عرض العملة
 * - Currency/AddCurrencyModal.tsx - نافذة إضافة عملة
 * - Currency/EditCurrencyModal.tsx - نافذة تعديل عملة
 * - Currency/AddExchangeRateModal.tsx - نافذة إضافة سعر صرف
 * - Currency/ExchangeRatesGrid.tsx - شبكة أسعار الصرف
 */

import React, { useState } from 'react';
import { useSettings } from '../../../context/SettingsContext';
import { useApp } from '../../../context/AppContext';
import SettingsCard from '../SettingsCard';
import { Coins, Plus, ArrowRightLeft } from 'lucide-react';
import { Currency } from '../../../types/common';

// استيراد المكونات المستخرجة
import {
    CurrencyListItem,
    AddCurrencyModal,
    EditCurrencyModal,
    AddExchangeRateModal,
    ExchangeRatesGrid
} from './index';

const CurrencyManager: React.FC = () => {
    const {
        currencies,
        addCurrency,
        updateCurrency,
        deleteCurrency,
        setDefaultCurrency,
        exchangeRates,
        addExchangeRate,
        getExchangeHistory
    } = useSettings();
    const { showNotification, language } = useApp();

    const [showAddCurrency, setShowAddCurrency] = useState(false);
    const [showAddRate, setShowAddRate] = useState(false);
    const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);

    const handleDeleteCurrency = (code: string) => {
        const currency = currencies.find((c) => c.code === code);
        if (currency?.isDefault) {
            showNotification('لا يمكن حذف العملة الافتراضية', 'error');
            return;
        }

        if (confirm('هل أنت متأكد من حذف هذه العملة؟')) {
            deleteCurrency(code);
            showNotification('تم حذف العملة', 'info');
        }
    };

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
                        <CurrencyListItem
                            key={currency.code}
                            currency={currency}
                            language={language}
                            onSetDefault={setDefaultCurrency}
                            onEdit={setEditingCurrency}
                            onDelete={handleDeleteCurrency}
                        />
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
                <ExchangeRatesGrid
                    currencies={currencies}
                    exchangeRates={exchangeRates}
                    getExchangeHistory={getExchangeHistory}
                />
            </SettingsCard>

            {/* Modals */}
            <AddCurrencyModal
                isOpen={showAddCurrency}
                onClose={() => setShowAddCurrency(false)}
                onAdd={addCurrency}
                existingCodes={currencies.map((c) => c.code)}
                showNotification={showNotification}
            />

            <AddExchangeRateModal
                isOpen={showAddRate}
                onClose={() => setShowAddRate(false)}
                onAdd={addExchangeRate}
                currencies={currencies}
                showNotification={showNotification}
            />

            <EditCurrencyModal
                currency={editingCurrency}
                onClose={() => setEditingCurrency(null)}
                onUpdate={updateCurrency}
                onChange={setEditingCurrency}
                showNotification={showNotification}
            />
        </div>
    );
};

export default CurrencyManager;
