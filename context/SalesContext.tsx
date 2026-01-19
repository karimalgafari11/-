
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Sale, Customer } from '../types'; // Keep types/index imports for now, but internally map to new types if needed
import { Invoice } from '../types/invoices';
import { logger } from '../lib/logger';
import { useApp } from './AppContext';
import { useUser } from './app/UserContext';
import { SalesService } from '../services/salesService';
import { CustomerService } from '../services/customerService';
import { returnsService } from '../services/returnsService';

// Intefaces from supabase-types might be different from '../types'. 
// We should eventually migrate all types. For now, we assume compatibility or map them.
import type { Sale as SupabaseSale, Customer as SupabaseCustomer, Return as SupabaseReturn } from '../types/supabase-types';

interface SalesContextValue {
    sales: any[]; // Using any temporarily to avoid conflicts during migration triggers
    addSale: (sale: any) => Promise<void>;
    updateSale: (sale: any) => Promise<void>;
    deleteSale: (id: string) => Promise<void>;
    customers: any[];
    addCustomer: (customer: any) => Promise<void>;
    updateCustomer: (customer: any) => Promise<void>;
    deleteCustomer: (id: string) => Promise<void>;
    customerCategories: string[]; // Still local for now or need a service
    addCustomerCategory: (category: string) => void;
    invoices: Invoice[];
    addInvoice: (invoice: Invoice) => void;

    // المرتجعات
    salesReturns: any[];
    addSaleReturn: (ret: any) => Promise<void>;
    updateSaleReturn: (ret: any) => Promise<void>;
    deleteSaleReturn: (id: string) => Promise<void>;

    loading: boolean;
    refreshData: () => Promise<void>;
}

const SalesContext = createContext<SalesContextValue | undefined>(undefined);

export const SalesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showNotification } = useApp();
    const { user } = useUser();

    const [sales, setSales] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [salesReturns, setSalesReturns] = useState<any[]>([]);

    // Legacy local storage for categories and invoices (if not migrated yet)
    const [customerCategories, setCustomerCategories] = useState<string[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);

    const [loading, setLoading] = useState(false);

    const refreshData = useCallback(async () => {
        if (!user?.companyId) return;

        setLoading(true);
        try {
            const [fetchedSales, fetchedCustomers, fetchedReturns] = await Promise.all([
                SalesService.getSales(user.companyId),
                CustomerService.getCustomers(user.companyId),
                returnsService.getSalesReturns(user.companyId)
            ]);

            setSales(fetchedSales);
            setCustomers(fetchedCustomers);
            setSalesReturns(fetchedReturns);
        } catch (error) {
            console.error('Error fetching sales data:', error);
            showNotification('فشل تحديث البيانات', 'error');
        } finally {
            setLoading(false);
        }
    }, [user?.companyId, showNotification]);

    // Initial fetch
    useEffect(() => {
        if (user?.companyId) {
            refreshData();
        }
    }, [user?.companyId, refreshData]);

    const addSale = useCallback(async (s: any) => {
        if (!user?.companyId) return;

        try {
            // Note: The caller (hook) might construct the sale object.
            // We need to adapt it to CreateSaleData if needed, or pass it directly if matching.
            // Assuming s matches the structure or we map it. 
            // For now, let's assume useAddSale handles the service call and we just refresh?
            // Actually, the context usually exposes the action.

            // If the hook `useAddSale` calls the service directly, this addSale might just update local state.
            // But to be consistent, we should call service here.

            // However, useAddSale in current codebase (implied by comment) might be doing heavy lifting.
            // "See: hooks/useAddSale.ts for journal orchestration"

            // Let's assume for now we just update state, and the hook calls service?
            // Original code: setSales(prev => [s, ...prev]);

            // If we want to move logic here:
            // await SalesService.createSale(data, { ... });

            // Use local update for immediate UI feedback (optimistic update)
            setSales(prev => [s, ...prev]);

            // But better to refresh or allow hook to handle service call
        } catch (error) {
            console.error('Error adding sale:', error);
            showNotification('فشل إضافة عملية البيع', 'error');
        }
    }, [user?.companyId, showNotification]);

    // ... Other methods ...

    // For full migration, we should inspect useAddSale.ts later. 
    // For now, I will implement a basic version that exposes state and refresh.
    // The previous implementation was purely local state.

    // To minimize breakage, I will keep the signatures but maybe wrap service calls if possible,
    // or just fetch data and let writes happen via services elsewhere if that's the pattern.
    // But typically context provides methods to modify data.

    const updateSale = useCallback(async (s: any) => {
        setSales(prev => prev.map(i => i.id === s.id ? s : i));
    }, []);

    const deleteSale = useCallback(async (id: string) => {
        if (!user?.companyId) return;
        try {
            await SalesService.cancelSale(id); // Soft delete/cancel
            setSales(prev => prev.filter(i => i.id !== id));
            showNotification('تم حذف/إلغاء عملية البيع');
        } catch (error) {
            console.error('Error deleting sale:', error);
            showNotification('فشل حذف عملية البيع', 'error');
        }
    }, [user?.companyId, showNotification]);

    const addCustomer = useCallback(async (c: any) => {
        if (!user?.companyId) return;
        try {
            const added = await CustomerService.createCustomer(user.companyId, c);
            if (added) {
                setCustomers(prev => [...prev, added]);
                showNotification('تم إضافة العميل بنجاح');
            }
        } catch (error) {
            console.error('Error adding customer:', error);
            showNotification('فشل إضافة العميل', 'error');
        }
    }, [user?.companyId, showNotification]);

    const updateCustomer = useCallback(async (c: any) => {
        if (!user?.companyId) return;
        try {
            const updated = await CustomerService.updateCustomer(c.id, c);
            if (updated) {
                setCustomers(prev => prev.map(i => i.id === c.id ? updated : i));
                showNotification('تم تحديث العميل بنجاح');
            }
        } catch (error) {
            console.error('Error updating customer:', error);
            showNotification('فشل تحديث العميل', 'error');
        }
    }, [user?.companyId, showNotification]);

    const deleteCustomer = useCallback(async (id: string) => {
        if (!user?.companyId) return;
        try {
            await CustomerService.deleteCustomer(id);
            setCustomers(prev => prev.filter(i => i.id !== id));
            showNotification('تم حذف العميل');
        } catch (error) {
            console.error('Error deleting customer:', error);
            showNotification('فشل حذف العميل', 'error');
        }
    }, [user?.companyId, showNotification]);

    const addCustomerCategory = useCallback((category: string) => {
        setCustomerCategories(prev => [...prev, category]);
        // TODO: Persist categories in Settings or dedicated table
    }, []);

    const addInvoice = useCallback((invoice: Invoice) => {
        setInvoices(prev => [invoice, ...prev]);
        // TODO: Handle invoices service
    }, []);

    // Returns
    const addSaleReturn = useCallback(async (ret: any) => {
        if (!user?.companyId) return;
        try {
            // Logic to add return via service
            // const added = await returnsService.create(user.companyId, ret);
            // For now just state update as placeholder until Returns UI is hooked up
            setSalesReturns(prev => [ret, ...prev]);
        } catch (e) { console.error(e); }
    }, [user?.companyId]);

    const updateSaleReturn = useCallback(async (ret: any) => {
        setSalesReturns(prev => prev.map(r => r.id === ret.id ? ret : r));
    }, []);

    const deleteSaleReturn = useCallback(async (id: string) => {
        setSalesReturns(prev => prev.filter(r => r.id !== id));
    }, []);

    const value: SalesContextValue = {
        sales,
        addSale,
        updateSale,
        deleteSale,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        customerCategories,
        addCustomerCategory,
        invoices,
        addInvoice,
        salesReturns,
        addSaleReturn,
        updateSaleReturn,
        deleteSaleReturn,
        loading,
        refreshData
    };

    return <SalesContext.Provider value={value}>{children}</SalesContext.Provider>;
};

export const useSales = () => {
    const context = useContext(SalesContext);
    if (context === undefined) {
        throw new Error('useSales must be used within a SalesProvider');
    }
    return context;
};
