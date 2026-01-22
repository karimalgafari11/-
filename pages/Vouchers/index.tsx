/**
 * صفحة السندات - Vouchers Page
 * تم إعادة هيكلتها لتستخدم مكونات منفصلة
 * 
 * الهيكل الجديد:
 * - types.ts - الأنواع والقيم الافتراضية
 * - components/VoucherHeader.tsx - رأس الصفحة
 * - components/VoucherStats.tsx - الإحصائيات
 * - components/VoucherTabs.tsx - التبويبات
 * - components/VoucherSearch.tsx - شريط البحث
 * - components/VouchersTable.tsx - جدول السندات
 * - components/ReceiptModal.tsx - نموذج سند القبض
 * - components/PaymentModal.tsx - نموذج سند الدفع
 */

import React, { useState } from 'react';
import { useVouchers } from '../../context/VouchersContext';
import { useSales } from '../../context/SalesContext';
import { usePurchases } from '../../context/PurchasesContext';
import { useCurrency } from '../../hooks/useCurrency';
import { useApp } from '../../context/AppContext';
import { usePrivacy } from '../../components/Common/PrivacyToggle';
import { ReceiptVoucher, PaymentVoucher } from '../../types';

import {
    VoucherTab,
    ReceiptFormData,
    PaymentFormData,
    DEFAULT_RECEIPT_FORM,
    DEFAULT_PAYMENT_FORM
} from './types';

import {
    VoucherHeader,
    VoucherStats,
    VoucherTabs,
    VoucherSearch,
    VouchersTable,
    ReceiptModal,
    PaymentModal
} from './components';

const Vouchers: React.FC = () => {
    const { theme } = useApp();
    const {
        receiptVouchers, addReceiptVoucher, updateReceiptVoucher, deleteReceiptVoucher,
        paymentVouchers, addPaymentVoucher, updatePaymentVoucher, deletePaymentVoucher,
        getTotalReceipts, getTotalPayments
    } = useVouchers();
    const { customers } = useSales();
    const { suppliers } = usePurchases();
    const { activeCurrencies, getCurrency, BASE_CURRENCY, getCurrentRate } = useCurrency();
    const { isHidden } = usePrivacy();

    // الحالات الرئيسية
    const [activeTab, setActiveTab] = useState<VoucherTab>('receipt');
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingReceipt, setEditingReceipt] = useState<ReceiptVoucher | null>(null);
    const [editingPayment, setEditingPayment] = useState<PaymentVoucher | null>(null);

    // نماذج البيانات
    const [receiptForm, setReceiptForm] = useState<ReceiptFormData>(DEFAULT_RECEIPT_FORM);
    const [paymentForm, setPaymentForm] = useState<PaymentFormData>(DEFAULT_PAYMENT_FORM);

    const { showNotification } = useApp();

    // معالجة إضافة سند قبض
    const handleAddReceipt = () => {
        if (!receiptForm.customerId) {
            showNotification('يرجى اختيار العميل', 'error');
            return;
        }
        if (!receiptForm.amount || parseFloat(receiptForm.amount) <= 0) {
            showNotification('يرجى إدخال مبلغ صحيح', 'error');
            return;
        }

        try {
            const customer = customers.find(c => c.id === receiptForm.customerId);
            const amount = parseFloat(receiptForm.amount);
            const rate = getCurrentRate(BASE_CURRENCY, receiptForm.currency) || 1;
            const baseAmount = receiptForm.currency === BASE_CURRENCY ? amount : amount / rate;

            const voucher: ReceiptVoucher = {
                id: editingReceipt?.id || `RV-${Date.now()}`,
                voucherNumber: editingReceipt?.voucherNumber || `RV-${Math.floor(1000 + Math.random() * 9000)}`,
                date: new Date().toISOString().split('T')[0],
                customerId: receiptForm.customerId,
                customerName: customer?.name || 'عميل',
                amount,
                currency: receiptForm.currency,
                exchangeRate: rate,
                baseAmount,
                paymentMethod: receiptForm.paymentMethod,
                referenceNumber: receiptForm.referenceNumber,
                notes: receiptForm.notes,
                status: 'completed',
                createdBy: 'user',
                createdAt: editingReceipt?.createdAt || new Date().toISOString()
            };

            if (editingReceipt) {
                updateReceiptVoucher(voucher);
                showNotification('تم تحديث سند القبض بنجاح', 'success');
            } else {
                addReceiptVoucher(voucher);
                showNotification('تم إضافة سند القبض بنجاح', 'success');
            }

            setShowReceiptModal(false);
            setEditingReceipt(null);
            setReceiptForm(DEFAULT_RECEIPT_FORM);
        } catch (error) {
            console.error(error);
            showNotification('حدث خطأ أثناء حفظ السند', 'error');
        }
    };

    // معالجة إضافة سند دفع
    const handleAddPayment = () => {
        if (!paymentForm.supplierId) {
            showNotification('يرجى اختيار المورد', 'error');
            return;
        }
        if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
            showNotification('يرجى إدخال مبلغ صحيح', 'error');
            return;
        }

        try {
            const supplier = suppliers.find(s => s.id === paymentForm.supplierId);
            const amount = parseFloat(paymentForm.amount);
            const rate = getCurrentRate(BASE_CURRENCY, paymentForm.currency) || 1;
            const baseAmount = paymentForm.currency === BASE_CURRENCY ? amount : amount / rate;

            const voucher: PaymentVoucher = {
                id: editingPayment?.id || `PV-${Date.now()}`,
                voucherNumber: editingPayment?.voucherNumber || `PV-${Math.floor(1000 + Math.random() * 9000)}`,
                date: new Date().toISOString().split('T')[0],
                supplierId: paymentForm.supplierId,
                supplierName: supplier?.name || 'مورد',
                amount,
                currency: paymentForm.currency,
                exchangeRate: rate,
                baseAmount,
                paymentMethod: paymentForm.paymentMethod,
                referenceNumber: paymentForm.referenceNumber,
                notes: paymentForm.notes,
                status: 'completed',
                createdBy: 'user',
                createdAt: editingPayment?.createdAt || new Date().toISOString()
            };

            if (editingPayment) {
                updatePaymentVoucher(voucher);
                showNotification('تم تحديث سند الدفع بنجاح', 'success');
            } else {
                addPaymentVoucher(voucher);
                showNotification('تم إضافة سند الدفع بنجاح', 'success');
            }

            setShowPaymentModal(false);
            setEditingPayment(null);
            setPaymentForm(DEFAULT_PAYMENT_FORM);
        } catch (error) {
            console.error(error);
            showNotification('حدث خطأ أثناء حفظ السند', 'error');
        }
    };

    // معالجة تعديل سند قبض
    const handleEditReceipt = (voucher: ReceiptVoucher) => {
        setEditingReceipt(voucher);
        setReceiptForm({
            customerId: voucher.customerId,
            amount: voucher.amount.toString(),
            currency: voucher.currency,
            paymentMethod: voucher.paymentMethod as any,
            referenceNumber: voucher.referenceNumber || '',
            notes: voucher.notes || ''
        });
        setShowReceiptModal(true);
    };

    // معالجة تعديل سند دفع
    const handleEditPayment = (voucher: PaymentVoucher) => {
        setEditingPayment(voucher);
        setPaymentForm({
            supplierId: voucher.supplierId,
            amount: voucher.amount.toString(),
            currency: voucher.currency,
            paymentMethod: voucher.paymentMethod,
            referenceNumber: voucher.referenceNumber || '',
            notes: voucher.notes || ''
        });
        setShowPaymentModal(true);
    };

    // فلترة السندات
    const filteredReceipts = receiptVouchers.filter(v =>
        (v.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.voucherNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPayments = paymentVouchers.filter(v =>
        (v.supplierName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.voucherNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* رأس الصفحة */}
            <VoucherHeader
                theme={theme}
                onAddReceipt={() => setShowReceiptModal(true)}
                onAddPayment={() => setShowPaymentModal(true)}
            />

            {/* الإحصائيات */}
            <VoucherStats
                theme={theme}
                isHidden={isHidden}
                getTotalReceipts={getTotalReceipts}
                getTotalPayments={getTotalPayments}
                receiptCount={receiptVouchers.length}
                paymentCount={paymentVouchers.length}
            />

            {/* التبويبات */}
            <VoucherTabs
                theme={theme}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                receiptCount={receiptVouchers.length}
                paymentCount={paymentVouchers.length}
            />

            {/* شريط البحث */}
            <VoucherSearch
                theme={theme}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />

            {/* جدول السندات */}
            <VouchersTable
                theme={theme}
                activeTab={activeTab}
                filteredReceipts={filteredReceipts}
                filteredPayments={filteredPayments}
                getCurrency={getCurrency}
                onEditReceipt={handleEditReceipt}
                onEditPayment={handleEditPayment}
                onDeleteReceipt={deleteReceiptVoucher}
                onDeletePayment={deletePaymentVoucher}
            />

            {/* Modal سند القبض */}
            <ReceiptModal
                theme={theme}
                isOpen={showReceiptModal}
                onClose={() => {
                    setShowReceiptModal(false);
                    setEditingReceipt(null);
                    setReceiptForm(DEFAULT_RECEIPT_FORM);
                }}
                form={receiptForm}
                setForm={setReceiptForm}
                customers={customers as any}
                activeCurrencies={activeCurrencies}
                onSubmit={handleAddReceipt}
                isEditing={!!editingReceipt}
            />

            {/* Modal سند الدفع */}
            <PaymentModal
                theme={theme}
                isOpen={showPaymentModal}
                onClose={() => {
                    setShowPaymentModal(false);
                    setEditingPayment(null);
                    setPaymentForm(DEFAULT_PAYMENT_FORM);
                }}
                form={paymentForm}
                setForm={setPaymentForm}
                suppliers={suppliers as any}
                activeCurrencies={activeCurrencies}
                onSubmit={handleAddPayment}
                isEditing={!!editingPayment}
            />
        </div>
    );
};

export default Vouchers;
