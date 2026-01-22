
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

            // Map DB format to Frontend format needed by UI
            const mapPurchase = (p: any) => ({
                ...p,
                invoiceNumber: p.invoice_number,
                supplierName: p.suppliers?.name || 'مورد غير معروف',
                date: p.invoice_date || p.created_at?.split('T')[0],
                totalAmount: p.net_total || p.total_amount, // fallback
                paymentStatus: p.status,
                // Add legacy mapping if needed
                id: p.id,
                supplierId: p.supplier_id,
                items: p.items || [],
                paidAmount: p.paid_amount || p.paid || 0,
                baseTotal: p.total || 0,
                taxTotal: p.tax_total || 0,
                discount: p.discount || 0
            });

            setPurchases(fetchedPurchases.map(mapPurchase));
            setSuppliers(fetchedSuppliers);
            setPurchaseReturns(fetchedReturns);
        } catch (error) {
            console.error('❌ [PurchasesContext] Error fetching purchases data:', error);
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
            // Map frontend object to snake_case for DB based on Supabase Types
            const dbPurchase: any = {
                invoice_number: p.invoiceNumber,
                supplier_id: p.supplierId,
                invoice_date: p.date,
                total: p.subTotal || p.total || 0,
                // total_amount, subtotal removed - caused 400 error
                tax: p.taxTotal || 0,
                // tax_amount removed - caused 400 error
                discount: p.discount || 0,
                // discount_amount removed - caused 400 error
                net_total: p.grandTotal || p.totalAmount || 0,
                paid: p.paidAmount || (p.paymentMethod === 'cash' ? (p.grandTotal || p.totalAmount) : 0),
                status: p.paymentStatus || (p.paymentMethod === 'credit' ? 'pending' : 'completed'),
                items: p.items.map((item: any) => ({
                    product_id: item.productId || item.id,
                    product_name: item.productName || item.name,
                    quantity: item.quantity,
                    unit_price: item.unitPrice || item.costPrice || item.price || 0,
                    discount: item.discount || 0,
                    tax: item.tax || 0,
                    total: item.total || ((item.quantity || 0) * (item.costPrice || 0))
                })),
                notes: p.notes,
                payment_method: p.paymentMethod,
                user_id: user.id
                // currency: p.currency // Uncomment if column exists, otherwise store in notes or ignore
            };

            const created = await purchasesService.create(user.companyId, dbPurchase);

            if (created) {
                // Refresh to get full data with supplier name mapped correctly
                await refreshData();
                logger.info('Purchase added', { purchaseId: created.id });
                showNotification('تم إضافة فاتورة المشتريات بنجاح', 'success');
            } else {
                throw new Error('فشل حفظ الفاتورة في قاعدة البيانات (الخدمة أعادت null)');
            }
        } catch (error) {
            console.error('Failed to add purchase', error);
            showNotification('حدث خطأ أثناء حفظ الفاتورة: ' + (error instanceof Error ? error.message : 'خطأ غير معروف'), 'error');
        }
    }, [user?.companyId, user?.id, showNotification, refreshData]);

    const updatePurchase = useCallback(async (p: any) => {
        if (!user?.companyId) return;
        try {
            // Map checks...
            const updates: any = {
                invoice_number: p.invoiceNumber,
                // Add other fields as necessary based on what is editable
                invoice_date: p.date,
                notes: p.notes,
                // Handle item updates separately or if full update supported
            };

            const updated = await purchasesService.update(p.id, updates);
            if (updated) {
                await refreshData();
                showNotification('تم تحديث عملية الشراء بنجاح');
            }
        } catch (error) {
            console.error('Failed to update purchase', error);
            showNotification('فشل تحديث عملية الشراء', 'error');
        }
    }, [user?.companyId, refreshData, showNotification]);

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
        console.log('➕ [PurchasesContext] addSupplier called');
        console.log('🏢 [PurchasesContext] companyId:', user?.companyId);
        console.log('📦 [PurchasesContext] Supplier data:', s);

        if (!user?.companyId) {
            console.error('❌ [PurchasesContext] No companyId - cannot add supplier!');
            showNotification('خطأ: لا يوجد معرف شركة', 'error');
            return;
        }
        try {
            console.log('📡 [PurchasesContext] Calling suppliersService.createSupplier...');
            const added = await suppliersService.createSupplier(user.companyId, s);
            console.log('📨 [PurchasesContext] Response from createSupplier:', added);
            if (added) {
                setSuppliers(prev => [...prev, added]);
                showNotification('تم إضافة المورد بنجاح');
                console.log('✅ [PurchasesContext] Supplier added successfully!');
            } else {
                console.warn('⚠️ [PurchasesContext] createSupplier returned null/undefined');
                showNotification('فشل إضافة المورد - لم يتم إرجاع بيانات', 'error');
            }
        } catch (e) {
            console.error('❌ [PurchasesContext] Error adding supplier:', e);
            showNotification('فشل إضافة المورد', 'error');
        }
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
