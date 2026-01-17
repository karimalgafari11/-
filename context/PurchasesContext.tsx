
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { Purchase, Supplier, SupplierPayment, PurchaseReturn } from '../types';
import { logger } from '../lib/logger';
import { useApp } from './AppContext';
import { SafeStorage } from '../utils/storage';
import { AutoJournalService } from '../services/autoJournalService';
import { useOrganization } from './OrganizationContext';

interface PurchasesContextValue {
    purchases: Purchase[];
    addPurchase: (purchase: Purchase) => void;
    updatePurchase: (purchase: Purchase) => void;
    deletePurchase: (id: string) => void;
    suppliers: Supplier[];
    addSupplier: (supplier: Supplier) => void;
    updateSupplier: (supplier: Supplier) => void;
    deleteSupplier: (id: string) => void;
    supplierPayments: SupplierPayment[];
    addSupplierPayment: (payment: SupplierPayment) => void;

    // المرتجعات
    purchaseReturns: PurchaseReturn[];
    addPurchaseReturn: (ret: PurchaseReturn) => void;
    updatePurchaseReturn: (ret: PurchaseReturn) => void;
    deletePurchaseReturn: (id: string) => void;
}

const PurchasesContext = createContext<PurchasesContextValue | undefined>(undefined);

export const PurchasesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showNotification, user } = useApp();
    const { company } = useOrganization();

    const [purchases, setPurchases] = useState<Purchase[]>(() => SafeStorage.get('alzhra_purchases', []));
    const [suppliers, setSuppliers] = useState<Supplier[]>(() => SafeStorage.get('alzhra_suppliers', []));
    const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>(() => SafeStorage.get('alzhra_supplierPayments', []));
    const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>(() => SafeStorage.get('alzhra_purchaseReturns', []));

    const addPurchase = useCallback(async (p: Purchase) => {
        try {
            setPurchases(prev => [p, ...prev]);
            logger.info('Purchase added', { purchaseId: p.id });
            showNotification('تم إضافة عملية الشراء بنجاح');

            // قيد آلي للمشتريات
            if (company && user) {
                try {
                    const success = await AutoJournalService.createPurchaseEntry(p as any, company.id, user.id);
                    if (success) {
                        showNotification('تم إنشاء قيد مشتريات تلقائي', 'success');
                    }
                } catch (journalError) {
                    logger.error('Failed to create purchase journal entry', journalError as Error);
                    // لا نفشل عملية الشراء بسبب فشل القيد
                }
            }
        } catch (error) {
            logger.error('Failed to add purchase', error as Error);
            showNotification('حدث خطأ أثناء إضافة عملية الشراء', 'error');
        }
    }, [showNotification, company, user]);

    const updatePurchase = useCallback((p: Purchase) => {
        setPurchases(prev => prev.map(i => i.id === p.id ? p : i));
        showNotification('تم تحديث عملية الشراء');
    }, [showNotification]);

    const deletePurchase = useCallback((id: string) => {
        setPurchases(prev => prev.filter(i => i.id !== id));
        showNotification('تم حذف عملية الشراء');
    }, [showNotification]);

    // حفظ البيانات عند التغيير مع debounce لتحسين الأداء
    useEffect(() => {
        const timer = setTimeout(() => SafeStorage.set('alzhra_purchases', purchases), 3000);
        return () => clearTimeout(timer);
    }, [purchases]);
    useEffect(() => {
        const timer = setTimeout(() => SafeStorage.set('alzhra_suppliers', suppliers), 3000);
        return () => clearTimeout(timer);
    }, [suppliers]);
    useEffect(() => {
        const timer = setTimeout(() => SafeStorage.set('alzhra_supplierPayments', supplierPayments), 3000);
        return () => clearTimeout(timer);
    }, [supplierPayments]);
    useEffect(() => {
        const timer = setTimeout(() => SafeStorage.set('alzhra_purchaseReturns', purchaseReturns), 3000);
        return () => clearTimeout(timer);
    }, [purchaseReturns]);

    const addSupplier = useCallback((s: Supplier) => {
        setSuppliers(prev => [...prev, s]);
        showNotification('تم إضافة المورد بنجاح');
    }, [showNotification]);

    const updateSupplier = useCallback((s: Supplier) => {
        setSuppliers(prev => prev.map(i => i.id === s.id ? s : i));
    }, []);

    const deleteSupplier = useCallback((id: string) => {
        setSuppliers(prev => prev.filter(i => i.id !== id));
    }, []);

    const addSupplierPayment = useCallback((p: SupplierPayment) => {
        setSupplierPayments(prev => [p, ...prev]);
        showNotification('تم تسجيل الدفعة للمورد بنجاح');
    }, [showNotification]);

    // دوال المرتجعات
    const addPurchaseReturn = useCallback((ret: PurchaseReturn) => {
        setPurchaseReturns(prev => [ret, ...prev]);
        logger.info('Purchase Return added', { returnId: ret.id });
        showNotification('تم تسجيل مرتجع المشتريات بنجاح');
    }, [showNotification]);

    const updatePurchaseReturn = useCallback((ret: PurchaseReturn) => {
        setPurchaseReturns(prev => prev.map(i => i.id === ret.id ? ret : i));
        showNotification('تم تحديث مرتجع المشتريات');
    }, [showNotification]);

    const deletePurchaseReturn = useCallback((id: string) => {
        setPurchaseReturns(prev => prev.filter(i => i.id !== id));
        showNotification('تم حذف مرتجع المشتريات');
    }, [showNotification]);

    const value: PurchasesContextValue = useMemo(() => ({
        purchases, addPurchase, updatePurchase, deletePurchase,
        suppliers, addSupplier, updateSupplier, deleteSupplier,
        supplierPayments, addSupplierPayment,
        // المرتجعات
        purchaseReturns, addPurchaseReturn, updatePurchaseReturn, deletePurchaseReturn
    }), [purchases, addPurchase, updatePurchase, deletePurchase, suppliers, addSupplier, updateSupplier, deleteSupplier, supplierPayments, addSupplierPayment, purchaseReturns, addPurchaseReturn, updatePurchaseReturn, deletePurchaseReturn]);

    return <PurchasesContext.Provider value={value}>{children}</PurchasesContext.Provider>;
};

export const usePurchases = () => {
    const context = useContext(PurchasesContext);
    if (!context) throw new Error('usePurchases must be used within PurchasesProvider');
    return context;
};
