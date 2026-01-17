/**
 * VouchersContext - إدارة السندات
 * سند القبض وسند الدفع
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { ReceiptVoucher, PaymentVoucher } from '../types';
import { useApp } from './AppContext';
import { SafeStorage } from '../utils/storage';
import { AutoJournalService } from '../services/autoJournalService';
import { useOrganization } from './OrganizationContext';

interface VouchersContextValue {
    // سندات القبض
    receiptVouchers: ReceiptVoucher[];
    addReceiptVoucher: (voucher: ReceiptVoucher) => void;
    updateReceiptVoucher: (voucher: ReceiptVoucher) => void;
    deleteReceiptVoucher: (id: string) => void;

    // سندات الدفع
    paymentVouchers: PaymentVoucher[];
    addPaymentVoucher: (voucher: PaymentVoucher) => void;
    updatePaymentVoucher: (voucher: PaymentVoucher) => void;
    deletePaymentVoucher: (id: string) => void;

    // إحصائيات
    getTotalReceipts: (currency?: string) => number;
    getTotalPayments: (currency?: string) => number;
    getCustomerReceipts: (customerId: string) => ReceiptVoucher[];
    getSupplierPayments: (supplierId: string) => PaymentVoucher[];
}

const VouchersContext = createContext<VouchersContextValue | undefined>(undefined);

export const VouchersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showNotification, user } = useApp();
    const { company } = useOrganization();

    const [receiptVouchers, setReceiptVouchers] = useState<ReceiptVoucher[]>(() =>
        SafeStorage.get('alzhra_receipt_vouchers', [])
    );

    const [paymentVouchers, setPaymentVouchers] = useState<PaymentVoucher[]>(() =>
        SafeStorage.get('alzhra_payment_vouchers', [])
    );

    // حفظ البيانات مع debounce لتحسين الأداء
    useEffect(() => {
        const timer = setTimeout(() => SafeStorage.set('alzhra_receipt_vouchers', receiptVouchers), 1000);
        return () => clearTimeout(timer);
    }, [receiptVouchers]);

    useEffect(() => {
        const timer = setTimeout(() => SafeStorage.set('alzhra_payment_vouchers', paymentVouchers), 1000);
        return () => clearTimeout(timer);
    }, [paymentVouchers]);

    // معالج القيود الآلية
    const createVoucherJournalEntry = useCallback(async (voucher: any, type: 'receipt' | 'payment') => {
        if (company && user) {
            try {
                const dbVoucher: any = {
                    ...voucher,
                    voucher_type: type,
                    voucher_number: voucher.receiptNumber || voucher.paymentNumber, // Mapping
                    voucher_date: voucher.date,
                    payment_account_id: '', // Should be determined
                    // Mapping details...
                };

                const success = await AutoJournalService.createVoucherEntry(dbVoucher, company.id, user.id);
                if (success) {
                    showNotification('تم إنشاء قيد يومية تلقائي', 'success');
                }
            } catch (error) {
                console.error('Failed to create voucher journal entry:', error);
                // لا نفشل عملية السند بسبب فشل القيد
            }
        }
    }, [company, user, showNotification]);

    // سندات القبض
    const addReceiptVoucher = useCallback((voucher: ReceiptVoucher) => {
        setReceiptVouchers(prev => [voucher, ...prev]);
        showNotification('تم إضافة سند القبض بنجاح', 'success');
        createVoucherJournalEntry(voucher, 'receipt');
    }, [showNotification, createVoucherJournalEntry]);

    const updateReceiptVoucher = useCallback((voucher: ReceiptVoucher) => {
        setReceiptVouchers(prev => prev.map(v => v.id === voucher.id ? voucher : v));
    }, []);

    const deleteReceiptVoucher = useCallback((id: string) => {
        setReceiptVouchers(prev => prev.filter(v => v.id !== id));
        showNotification('تم حذف سند القبض', 'info');
    }, [showNotification]);

    // سندات الدفع
    const addPaymentVoucher = useCallback((voucher: PaymentVoucher) => {
        setPaymentVouchers(prev => [voucher, ...prev]);
        showNotification('تم إضافة سند الدفع بنجاح', 'success');
        createVoucherJournalEntry(voucher, 'payment');
    }, [showNotification, createVoucherJournalEntry]);

    const updatePaymentVoucher = useCallback((voucher: PaymentVoucher) => {
        setPaymentVouchers(prev => prev.map(v => v.id === voucher.id ? voucher : v));
    }, []);

    const deletePaymentVoucher = useCallback((id: string) => {
        setPaymentVouchers(prev => prev.filter(v => v.id !== id));
        showNotification('تم حذف سند الدفع', 'info');
    }, [showNotification]);

    // إحصائيات
    const getTotalReceipts = useCallback((currency?: string) => {
        return receiptVouchers
            .filter(v => v.status === 'completed' && (!currency || v.currency === currency))
            .reduce((sum, v) => sum + v.amount, 0);
    }, [receiptVouchers]);

    const getTotalPayments = useCallback((currency?: string) => {
        return paymentVouchers
            .filter(v => v.status === 'completed' && (!currency || v.currency === currency))
            .reduce((sum, v) => sum + v.amount, 0);
    }, [paymentVouchers]);

    const getCustomerReceipts = useCallback((customerId: string) => {
        return receiptVouchers.filter(v => v.customerId === customerId);
    }, [receiptVouchers]);

    const getSupplierPayments = useCallback((supplierId: string) => {
        return paymentVouchers.filter(v => v.supplierId === supplierId);
    }, [paymentVouchers]);

    const value: VouchersContextValue = useMemo(() => ({
        receiptVouchers,
        addReceiptVoucher,
        updateReceiptVoucher,
        deleteReceiptVoucher,
        paymentVouchers,
        addPaymentVoucher,
        updatePaymentVoucher,
        deletePaymentVoucher,
        getTotalReceipts,
        getTotalPayments,
        getCustomerReceipts,
        getSupplierPayments
    }), [receiptVouchers, addReceiptVoucher, updateReceiptVoucher, deleteReceiptVoucher, paymentVouchers, addPaymentVoucher, updatePaymentVoucher, deletePaymentVoucher, getTotalReceipts, getTotalPayments, getCustomerReceipts, getSupplierPayments]);

    return <VouchersContext.Provider value={value}>{children}</VouchersContext.Provider>;
};

export const useVouchers = () => {
    const context = useContext(VouchersContext);
    if (!context) throw new Error('useVouchers must be used within VouchersProvider');
    return context;
};
