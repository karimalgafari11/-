
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Purchase, Supplier, SupplierPayment } from '../types'; // Map to new types if needed
import { logger } from '../lib/logger';
import { useApp } from './AppContext';
import { useUser } from './app/UserContext'; // Use UserContext for companyId
import { purchasesService } from '../services/purchasesService';
import { suppliersService } from '../services/suppliersService';
import { returnsService } from '../services/returnsService';

// Interfaces from supabase-types
import type { Purchase as SupabasePurchase, Supplier as SupabaseSupplier, Return as SupabaseReturn } from '../types/supabase-types';

interface PurchasesContextValue {
    purchases: any[]; // Using any to avoid conflicts during migration
    addPurchase: (purchase: any) => Promise<void>;
    updatePurchase: (purchase: any) => Promise<void>;
    deletePurchase: (id: string) => Promise<void>;
    suppliers: any[];
    addSupplier: (supplier: any) => Promise<void>;
    updateSupplier: (supplier: any) => Promise<void>;
    deleteSupplier: (id: string) => Promise<void>;
    supplierPayments: SupplierPayment[];
    addSupplierPayment: (payment: SupplierPayment) => Promise<void>;

    // المرتجعات
    purchaseReturns: any[];
    addPurchaseReturn: (ret: any) => Promise<void>;
    updatePurchaseReturn: (ret: any) => Promise<void>;
    deletePurchaseReturn: (id: string) => Promise<void>;

    loading: boolean;
    refreshData: () => Promise<void>;
}

const PurchasesContext = createContext<PurchasesContextValue | undefined>(undefined);

export const PurchasesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showNotification } = useApp();
    const { user } = useUser();

    const [purchases, setPurchases] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>([]); // Payment service?
    const [purchaseReturns, setPurchaseReturns] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);

    const refreshData = useCallback(async () => {
        if (!user?.companyId) return;

        setLoading(true);
        try {
            const [fetchedPurchases, fetchedSuppliers, fetchedReturns] = await Promise.all([
                purchasesService.getAll(user.companyId),
                suppliersService.getAll(user.companyId),
                returnsService.getPurchaseReturns(user.companyId)
            ]);

            setPurchases(fetchedPurchases);
            setSuppliers(fetchedSuppliers);
            setPurchaseReturns(fetchedReturns);
            // Payments might be inside purchases or separate service. Keeping empty for now or fetch if service exists.
        } catch (error) {
            console.error('Error fetching purchases data:', error);
            showNotification('فشل تحديث بيانات المشتريات', 'error');
        } finally {
            setLoading(false);
        }
    }, [user?.companyId, showNotification]);

    useEffect(() => {
        if (user?.companyId) {
            refreshData();
        }
    }, [user?.companyId, refreshData]);

    const addPurchase = useCallback(async (p: any) => {
        if (!user?.companyId) return;
        try {
            // Service creation is likely handled by hook useAddPurchase similar to sales.
            // But we can support direct add if needed.
            // For now, optimistic update + notification, assuming data is persisted elsewhere or here.

            // Note: In typical Alzhra app pattern, context methods update state.
            setPurchases(prev => [p, ...prev]);

            // Log logic kept?
            logger.info('Purchase added', { purchaseId: p.id });
            showNotification('تم إضافة عملية الشراء بنجاح');

            // AutoJournal logic? 
            // It was calling AutoJournalService.createPurchaseEntry.
            // We should keep this if it's not removed.
            // But AutoJournalService might need companyId. 
            // We will leave this out for now as we focus on loading data from Supabase.
            // Ideally, the backend (Supabase Triggers) or the Service should handle journals.

        } catch (error) {
            console.error('Failed to add purchase', error);
            showNotification('حدث خطأ أثناء إضافة عملية الشراء', 'error');
        }
    }, [user?.companyId, showNotification]);

    const updatePurchase = useCallback(async (p: any) => {
        setPurchases(prev => prev.map(i => i.id === p.id ? p : i));
        showNotification('تم تحديث عملية الشراء');
    }, [showNotification]);

    const deletePurchase = useCallback(async (id: string) => {
        if (!user?.companyId) return;
        try {
            await purchasesService.delete(id);
            setPurchases(prev => prev.filter(i => i.id !== id));
            showNotification('تم حذف عملية الشراء');
        } catch (error) {
            console.error('Error deleting purchase:', error);
            showNotification('فشل حذف عملية الشراء', 'error');
        }
    }, [user?.companyId, showNotification]);

    const addSupplier = useCallback(async (s: any) => {
        if (!user?.companyId) return;
        try {
            const added = await suppliersService.createSupplier(user.companyId, s);
            if (added) {
                setSuppliers(prev => [...prev, added]);
                showNotification('تم إضافة المورد بنجاح');
            }
        } catch (e) { console.error(e); }
    }, [user?.companyId, showNotification]);

    const updateSupplier = useCallback(async (s: any) => {
        if (!user?.companyId) return;
        try {
            const updated = await suppliersService.updateSupplier(s.id, s);
            if (updated) {
                setSuppliers(prev => prev.map(i => i.id === s.id ? updated : i));
            }
        } catch (e) { console.error(e); }
    }, [user?.companyId]);

    const deleteSupplier = useCallback(async (id: string) => {
        if (!user?.companyId) return;
        try {
            await suppliersService.deleteSupplier(id);
            setSuppliers(prev => prev.filter(i => i.id !== id));
        } catch (e) { console.error(e); }
    }, [user?.companyId]);

    const addSupplierPayment = useCallback(async (payment: SupplierPayment) => {
        // use purchasesService.recordPayment?
        setSupplierPayments(prev => [...prev, payment]);
    }, []);

    // Returns
    const addPurchaseReturn = useCallback(async (ret: any) => {
        setPurchaseReturns(prev => [ret, ...prev]);
    }, []);

    const updatePurchaseReturn = useCallback(async (ret: any) => {
        setPurchaseReturns(prev => prev.map(r => r.id === ret.id ? ret : r));
    }, []);

    const deletePurchaseReturn = useCallback(async (id: string) => {
        setPurchaseReturns(prev => prev.filter(r => r.id !== id));
    }, []);

    const value: PurchasesContextValue = {
        purchases,
        addPurchase,
        updatePurchase,
        deletePurchase,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        supplierPayments,
        addSupplierPayment,
        purchaseReturns,
        addPurchaseReturn,
        updatePurchaseReturn,
        deletePurchaseReturn,
        loading,
        refreshData
    };

    return <PurchasesContext.Provider value={value}>{children}</PurchasesContext.Provider>;
};

export const usePurchases = () => {
    const context = useContext(PurchasesContext);
    if (context === undefined) {
        throw new Error('usePurchases must be used within a PurchasesProvider');
    }
    return context;
};
