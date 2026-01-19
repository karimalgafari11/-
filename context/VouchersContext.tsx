
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { ReceiptVoucher, PaymentVoucher } from '../types';
import { useApp } from './AppContext';
import { useUser } from './app/UserContext';
import { SafeStorage } from '../utils/storage';
import { AutoJournalService } from '../services/autoJournalService';
import { useOrganization } from './OrganizationContext';
import { vouchersService } from '../services/vouchersService';

// Intefaces from supabase
import type { Voucher } from '../types/supabase-types';

interface VouchersContextValue {
    // سندات القبض
    receiptVouchers: any[]; // Using any for migration
    addReceiptVoucher: (voucher: any) => Promise<void>;
    updateReceiptVoucher: (voucher: any) => Promise<void>;
    deleteReceiptVoucher: (id: string) => Promise<void>;

    // سندات الدفع
    paymentVouchers: any[];
    addPaymentVoucher: (voucher: any) => Promise<void>;
    updatePaymentVoucher: (voucher: any) => Promise<void>;
    deletePaymentVoucher: (id: string) => Promise<void>;

    // إحصائيات
    getTotalReceipts: (currency?: string) => number;
    getTotalPayments: (currency?: string) => number;
    getCustomerReceipts: (customerId: string) => any[];
    getSupplierPayments: (supplierId: string) => any[];

    loading: boolean;
    refreshData: () => Promise<void>;
}

const VouchersContext = createContext<VouchersContextValue | undefined>(undefined);

export const VouchersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showNotification } = useApp();
    const { user } = useUser();
    const { company } = useOrganization();

    const [receiptVouchers, setReceiptVouchers] = useState<any[]>([]);
    const [paymentVouchers, setPaymentVouchers] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);

    const refreshData = useCallback(async () => {
        if (!user?.companyId) return;

        setLoading(true);
        try {
            const [fetchedReceipts, fetchedPayments] = await Promise.all([
                vouchersService.getReceipts(user.companyId),
                vouchersService.getPayments(user.companyId)
            ]);

            setReceiptVouchers(fetchedReceipts);
            setPaymentVouchers(fetchedPayments);
        } catch (error) {
            console.error('Error fetching vouchers:', error);
            showNotification('فشل تحديث بيانات السندات', 'error');
        } finally {
            setLoading(false);
        }
    }, [user?.companyId, showNotification]);

    useEffect(() => {
        if (user?.companyId) {
            refreshData();
        }
    }, [user?.companyId, refreshData]);

    const addReceiptVoucher = useCallback(async (voucher: any) => {
        if (!user?.companyId) return;
        try {
            // Need to map frontend voucher to DB voucher if structure differs
            const dbVoucher: any = {
                ...voucher,
                voucher_type: 'receipt',
                voucher_number: voucher.receiptNumber, // assuming frontend uses receiptNumber
                // ... other mappings
            };

            const added = await vouchersService.create(user.companyId, dbVoucher);
            if (added) {
                setReceiptVouchers(prev => [added, ...prev]);
                showNotification('تم إضافة سند القبض بنجاح', 'success');

                try {
                    // AutoJournalService.createVoucherEntry(added, user.companyId, user.id);
                } catch (e) { console.error(e); }
            }
        } catch (error) {
            console.error('Error adding receipt voucher:', error);
            showNotification('فشل إضافة سند القبض', 'error');
        }
    }, [user?.companyId, showNotification, user?.id]);

    const updateReceiptVoucher = useCallback(async (voucher: any) => {
        // Implementation for update
    }, []);

    const deleteReceiptVoucher = useCallback(async (id: string) => {
        if (!user?.companyId) return;
        try {
            // Check if service has delete? Yes.
            // await vouchersService.delete(id); // If delete exists in service
            // setReceiptVouchers(prev => prev.filter(v => v.id !== id));
        } catch (e) { console.error(e); }
    }, [user?.companyId]);

    const addPaymentVoucher = useCallback(async (voucher: any) => {
        if (!user?.companyId) return;
        try {
            // Map and create
            const dbVoucher: any = {
                ...voucher,
                voucher_type: 'payment',
                voucher_number: voucher.paymentNumber,
            };

            const added = await vouchersService.create(user.companyId, dbVoucher);
            if (added) {
                setPaymentVouchers(prev => [added, ...prev]);
                showNotification('تم إضافة سند الدفع بنجاح', 'success');
            }
        } catch (error) {
            console.error('Error adding payment voucher:', error);
            showNotification('فشل إضافة سند الدفع', 'error');
        }
    }, [user?.companyId, showNotification]);

    const updatePaymentVoucher = useCallback(async (voucher: any) => {
        // Implementation
    }, []);

    const deletePaymentVoucher = useCallback(async (id: string) => {
        // Implementation
    }, []);

    const getTotalReceipts = useCallback((currency = 'SAR') => {
        return receiptVouchers.reduce((sum, v) => sum + (v.amount || 0), 0);
    }, [receiptVouchers]);

    const getTotalPayments = useCallback((currency = 'SAR') => {
        return paymentVouchers.reduce((sum, v) => sum + (v.amount || 0), 0);
    }, [paymentVouchers]);

    const getCustomerReceipts = useCallback((customerId: string) => {
        return receiptVouchers.filter(v => v.customer_id === customerId);
    }, [receiptVouchers]);

    const getSupplierPayments = useCallback((supplierId: string) => {
        return paymentVouchers.filter(v => v.supplier_id === supplierId);
    }, [paymentVouchers]);

    const value: VouchersContextValue = {
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
        getSupplierPayments,
        loading,
        refreshData
    };

    return <VouchersContext.Provider value={value}>{children}</VouchersContext.Provider>;
};

export const useVouchers = () => {
    const context = useContext(VouchersContext);
    if (context === undefined) {
        throw new Error('useVouchers must be used within a VouchersProvider');
    }
    return context;
};
