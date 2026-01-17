
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { Sale, Customer, SaleReturn } from '../types';
import { Invoice } from '../types/invoices';
import { logger } from '../lib/logger';
import { useApp } from './AppContext';
import { SafeStorage } from '../utils/storage';

// ⚠️ AutoJournalService removed - journal creation moved to useAddSale hook
// See: hooks/useAddSale.ts for journal orchestration

interface SalesContextValue {
    sales: Sale[];
    addSale: (sale: Sale) => void;
    updateSale: (sale: Sale) => void;
    deleteSale: (id: string) => void;
    customers: Customer[];
    addCustomer: (customer: Customer) => void;
    updateCustomer: (customer: Customer) => void;
    deleteCustomer: (id: string) => void;
    customerCategories: string[];
    addCustomerCategory: (category: string) => void;
    invoices: Invoice[];
    addInvoice: (invoice: Invoice) => void;

    // المرتجعات
    salesReturns: SaleReturn[];
    addSaleReturn: (ret: SaleReturn) => void;
    updateSaleReturn: (ret: SaleReturn) => void;
    deleteSaleReturn: (id: string) => void;
}

const SalesContext = createContext<SalesContextValue | undefined>(undefined);

export const SalesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showNotification } = useApp();

    const [sales, setSales] = useState<Sale[]>(() => SafeStorage.get('alzhra_sales', []));
    const [customers, setCustomers] = useState<Customer[]>(() => SafeStorage.get('alzhra_customers', []));
    const [customerCategories, setCustomerCategories] = useState<string[]>(() => SafeStorage.get('alzhra_customerCategories', []));

    const [invoices, setInvoices] = useState<Invoice[]>(() => SafeStorage.get('alzhra_invoices', []));
    const [salesReturns, setSalesReturns] = useState<SaleReturn[]>(() => SafeStorage.get('alzhra_salesReturns', []));

    // ✅ State-only: لا يستدعي AutoJournalService مباشرة
    // استخدم useAddSale hook لإضافة بيع مع قيود محاسبية
    const addSale = useCallback((s: Sale) => {
        setSales(prev => [s, ...prev]);
        logger.info('Sale added to state', { saleId: s.id });
        showNotification('تم إضافة عملية البيع بنجاح');
    }, [showNotification]);

    // حفظ البيانات عند التغيير مع debounce لتحسين الأداء
    useEffect(() => {
        const timer = setTimeout(() => SafeStorage.set('alzhra_sales', sales), 3000);
        return () => clearTimeout(timer);
    }, [sales]);
    useEffect(() => {
        const timer = setTimeout(() => SafeStorage.set('alzhra_customers', customers), 3000);
        return () => clearTimeout(timer);
    }, [customers]);
    useEffect(() => {
        const timer = setTimeout(() => SafeStorage.set('alzhra_customerCategories', customerCategories), 3000);
        return () => clearTimeout(timer);
    }, [customerCategories]);
    useEffect(() => {
        const timer = setTimeout(() => SafeStorage.set('alzhra_invoices', invoices), 3000);
        return () => clearTimeout(timer);
    }, [invoices]);
    useEffect(() => {
        const timer = setTimeout(() => SafeStorage.set('alzhra_salesReturns', salesReturns), 3000);
        return () => clearTimeout(timer);
    }, [salesReturns]);

    const updateSale = useCallback((s: Sale) => {
        setSales(prev => prev.map(i => i.id === s.id ? s : i));
    }, []);

    const deleteSale = useCallback((id: string) => {
        setSales(prev => prev.filter(i => i.id !== id));
        showNotification('تم حذف عملية البيع');
    }, [showNotification]);

    const addCustomer = useCallback((c: Customer) => {
        setCustomers(prev => [...prev, c]);
        showNotification('تم إضافة العميل بنجاح');
    }, [showNotification]);

    const updateCustomer = useCallback((c: Customer) => {
        setCustomers(prev => prev.map(i => i.id === c.id ? c : i));
    }, []);

    const deleteCustomer = useCallback((id: string) => {
        setCustomers(prev => prev.filter(i => i.id !== id));
    }, []);

    const addCustomerCategory = useCallback((cat: string) => {
        setCustomerCategories(prev => [...prev, cat]);
    }, []);

    const addInvoice = useCallback((i: Invoice) => {
        setInvoices(prev => [i, ...prev]);
        showNotification('تم إنشاء الفاتورة بنجاح');
    }, [showNotification]);

    // دوال المرتجعات
    const addSaleReturn = useCallback((ret: SaleReturn) => {
        setSalesReturns(prev => [ret, ...prev]);
        logger.info('Sale Return added', { returnId: ret.id });
        showNotification('تم تسجيل مرتجع المبيعات بنجاح');
    }, [showNotification]);

    const updateSaleReturn = useCallback((ret: SaleReturn) => {
        setSalesReturns(prev => prev.map(i => i.id === ret.id ? ret : i));
        showNotification('تم تحديث مرتجع المبيعات');
    }, [showNotification]);

    const deleteSaleReturn = useCallback((id: string) => {
        setSalesReturns(prev => prev.filter(i => i.id !== id));
        showNotification('تم حذف مرتجع المبيعات');
    }, [showNotification]);

    const value: SalesContextValue = useMemo(() => ({
        sales, addSale, updateSale, deleteSale,
        customers, addCustomer, updateCustomer, deleteCustomer,
        customerCategories, addCustomerCategory,
        invoices, addInvoice,
        // المرتجعات
        salesReturns, addSaleReturn, updateSaleReturn, deleteSaleReturn
    }), [sales, addSale, updateSale, deleteSale, customers, addCustomer, updateCustomer, deleteCustomer, customerCategories, addCustomerCategory, invoices, addInvoice, salesReturns, addSaleReturn, updateSaleReturn, deleteSaleReturn]);

    return <SalesContext.Provider value={value}>{children}</SalesContext.Provider>;
};

export const useSales = () => {
    const context = useContext(SalesContext);
    if (!context) throw new Error('useSales must be used within SalesProvider');
    return context;
};
