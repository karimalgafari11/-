
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { ReceiptVoucher, PaymentVoucher } from '../types';
import { useApp } from './AppContext';
import { useUser } from './app/UserContext';

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

            // Map DB format to Frontend format
            const mapVoucher = (v: any) => ({
                ...v,
                voucherNumber: v.voucher_number || v.voucherNumber,
                date: v.voucher_date || v.date,
                customerId: v.customer_id || v.customerId,
                supplierId: v.supplier_id || v.supplierId,
                customerName: v.customers?.name || v.customerName || '---',
                supplierName: v.suppliers?.name || v.supplierName || '---',
                amount: v.amount,
                currency: v.currency || 'SAR',
                paymentMethod: v.payment_method || v.paymentMethod,
                referenceNumber: v.reference_number || v.referenceNumber,
                notes: v.description || v.notes
            });

            setReceiptVouchers(fetchedReceipts.map(mapVoucher));
            setPaymentVouchers(fetchedPayments.map(mapVoucher));
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
            // Map frontend voucher to Supabase schema
            const dbVoucher: any = {
                voucher_type: 'receipt',
                amount: voucher.amount || parseFloat(voucher.amount),
                voucher_date: voucher.date || new Date().toISOString().split('T')[0],
                customer_id: voucher.customerId,
                payment_method: voucher.paymentMethod || 'cash',
                description: voucher.notes,
                status: voucher.status || 'completed',
                user_id: user.id
            };

            const added = await vouchersService.create(user.companyId, dbVoucher);
            if (added) {
                // Map back to frontend format for display
                const frontendVoucher = {
                    ...added,
                    voucherNumber: added.voucher_number,
                    customerName: voucher.customerName,
                };
                setReceiptVouchers(prev => [frontendVoucher, ...prev]);
                showNotification('تم إضافة سند القبض بنجاح', 'success');
            }
        } catch (error) {
            console.error('Error adding receipt voucher:', error);
            showNotification('فشل إضافة سند القبض', 'error');
        }
    }, [user?.companyId, user?.id, showNotification]);

    const updateReceiptVoucher = useCallback(async (voucher: any) => {
        // Implementation for update
    }, []);

    const deleteReceiptVoucher = useCallback(async (id: string) => {
        if (!user?.companyId) return;
        try {
            const success = await vouchersService.delete(id);
            if (success) {
                setReceiptVouchers(prev => prev.filter(v => v.id !== id));
                showNotification('تم حذف السند بنجاح');
            }
        } catch (e) {
            console.error('Error deleting receipt voucher:', e);
            showNotification('فشل حذف السند', 'error');
        }
    }, [user?.companyId, showNotification]);

    const addPaymentVoucher = useCallback(async (voucher: any) => {
        if (!user?.companyId) return;
        try {
            // Map frontend voucher to Supabase schema
            const dbVoucher: any = {
                voucher_type: 'payment',
                amount: voucher.amount || parseFloat(voucher.amount),
                voucher_date: voucher.date || new Date().toISOString().split('T')[0],
                supplier_id: voucher.supplierId,
                payment_method: voucher.paymentMethod || 'cash',
                description: voucher.notes,
                status: voucher.status || 'completed',
                user_id: user.id
            };

            const added = await vouchersService.create(user.companyId, dbVoucher);
            if (added) {
                // Map back to frontend format
                const frontendVoucher = {
                    ...added,
                    voucherNumber: added.voucher_number,
                    supplierName: voucher.supplierName,
                };
                setPaymentVouchers(prev => [frontendVoucher, ...prev]);
                showNotification('تم إضافة سند الدفع بنجاح', 'success');
            }
        } catch (error) {
            console.error('Error adding payment voucher:', error);
            showNotification('فشل إضافة سند الدفع', 'error');
        }
    }, [user?.companyId, user?.id, showNotification]);

    const updatePaymentVoucher = useCallback(async (voucher: any) => {
        // Implementation
    }, []);

    const deletePaymentVoucher = useCallback(async (id: string) => {
        if (!user?.companyId) return;
        try {
            const success = await vouchersService.delete(id);
            if (success) {
                setPaymentVouchers(prev => prev.filter(v => v.id !== id));
                showNotification('تم حذف السند بنجاح');
            }
        } catch (e) {
            console.error('Error deleting payment voucher:', e);
            showNotification('فشل حذف السند', 'error');
        }
    }, [user?.companyId, showNotification]);

    const getTotalReceipts = useCallback((currency = 'SAR') => {
        return receiptVouchers
            .filter(v => (v.currency || 'SAR').toUpperCase() === currency.toUpperCase())
            .reduce((sum, v) => sum + (v.amount || 0), 0);
    }, [receiptVouchers]);

    const getTotalPayments = useCallback((currency = 'SAR') => {
        return paymentVouchers
            .filter(v => (v.currency || 'SAR').toUpperCase() === currency.toUpperCase())
            .reduce((sum, v) => sum + (v.amount || 0), 0);
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
