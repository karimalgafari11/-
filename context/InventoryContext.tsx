
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { InventoryItem, Warehouse, StockAudit, StockTransfer } from '../types';
import { logger } from '../lib/logger';
import { useApp } from './AppContext';
import { SafeStorage } from '../utils/storage';
import { productsService, LocalProduct } from '../services/productsService';

interface InventoryContextValue {
    inventory: InventoryItem[];
    products: LocalProduct[];
    loadProducts: () => Promise<void>;
    addProduct: (product: Omit<LocalProduct, 'id' | 'createdAt' | 'updatedAt'>) => Promise<LocalProduct | null>;
    updateProduct: (id: string, updates: Partial<LocalProduct>) => Promise<LocalProduct | null>;
    deleteProduct: (id: string) => Promise<boolean>;
    addInventoryItem: (item: InventoryItem) => void;
    updateInventoryItem: (item: InventoryItem) => void;
    deleteInventoryItem: (id: string) => void;
    warehouses: Warehouse[];
    addWarehouse: (warehouse: Warehouse) => void;
    updateWarehouse: (warehouse: Warehouse) => void;
    deleteWarehouse: (id: string) => void;
    transfers: StockTransfer[];
    addTransfer: (transfer: StockTransfer) => void;
    audits: StockAudit[];
    addAudit: (audit: StockAudit) => void;
    categories: string[];
    addCategory: (category: string) => void;
    isLoading: boolean;
}

const InventoryContext = createContext<InventoryContextValue | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showNotification } = useApp();
    const [inventory, setInventory] = useState<InventoryItem[]>(() => SafeStorage.get('alzhra_inventory', []));
    const [products, setProducts] = useState<LocalProduct[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [warehouses, setWarehouses] = useState<Warehouse[]>(() => SafeStorage.get('alzhra_warehouses', []));
    const [transfers, setTransfers] = useState<StockTransfer[]>(() => SafeStorage.get('alzhra_transfers', []));
    const [audits, setAudits] = useState<StockAudit[]>(() => SafeStorage.get('alzhra_audits', []));
    const [categories, setCategories] = useState<string[]>(() => SafeStorage.get('alzhra_inventoryCategories', []));

    // جلب المنتجات من Supabase عند التهيئة
    const loadProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await productsService.getAll();
            setProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // جلب المنتجات عند التحميل
    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // إضافة منتج جديد
    const addProduct = useCallback(async (product: Omit<LocalProduct, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const newProduct = await productsService.create(product);
            if (newProduct) {
                setProducts(prev => [...prev, newProduct]);
                showNotification('تم إضافة المنتج بنجاح');
                return newProduct;
            }
            return null;
        } catch (error) {
            console.error('Error adding product:', error);
            showNotification('حدث خطأ أثناء إضافة المنتج', 'error');
            return null;
        }
    }, [showNotification]);

    // تحديث منتج
    const updateProduct = useCallback(async (id: string, updates: Partial<LocalProduct>) => {
        try {
            const updated = await productsService.update(id, updates);
            if (updated) {
                setProducts(prev => prev.map(p => p.id === id ? updated : p));
                showNotification('تم تحديث المنتج');
                return updated;
            }
            return null;
        } catch (error) {
            console.error('Error updating product:', error);
            return null;
        }
    }, [showNotification]);

    // حذف منتج
    const deleteProduct = useCallback(async (id: string) => {
        try {
            const success = await productsService.delete(id);
            if (success) {
                setProducts(prev => prev.filter(p => p.id !== id));
                showNotification('تم حذف المنتج');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting product:', error);
            return false;
        }
    }, [showNotification]);

    const addInventoryItem = useCallback((item: InventoryItem) => {
        setInventory(prev => [...prev, item]);
        logger.info('Inventory item added', { itemId: item.id });
        showNotification('تم إضافة الصنف بنجاح');
    }, [showNotification]);

    // حفظ البيانات عند التغيير مع debounce لتحسين الأداء
    useEffect(() => {
        const timer = setTimeout(() => SafeStorage.set('alzhra_inventory', inventory), 3000);
        return () => clearTimeout(timer);
    }, [inventory]);
    useEffect(() => {
        const timer = setTimeout(() => SafeStorage.set('alzhra_warehouses', warehouses), 3000);
        return () => clearTimeout(timer);
    }, [warehouses]);
    useEffect(() => {
        const timer = setTimeout(() => SafeStorage.set('alzhra_transfers', transfers), 3000);
        return () => clearTimeout(timer);
    }, [transfers]);
    useEffect(() => {
        const timer = setTimeout(() => SafeStorage.set('alzhra_audits', audits), 3000);
        return () => clearTimeout(timer);
    }, [audits]);
    useEffect(() => {
        const timer = setTimeout(() => SafeStorage.set('alzhra_inventoryCategories', categories), 3000);
        return () => clearTimeout(timer);
    }, [categories]);

    const updateInventoryItem = useCallback((item: InventoryItem) => {
        setInventory(prev => prev.map(i => i.id === item.id ? item : i));
        logger.info('Inventory item updated', { itemId: item.id });
    }, []);

    const deleteInventoryItem = useCallback((id: string) => {
        setInventory(prev => prev.filter(i => i.id !== id));
        logger.info('Inventory item deleted', { itemId: id });
        showNotification('تم حذف الصنف بنجاح');
    }, [showNotification]);

    const addWarehouse = useCallback((w: Warehouse) => {
        setWarehouses(prev => [...prev, w]);
        showNotification('تم إضافة المستودع بنجاح');
    }, [showNotification]);

    const updateWarehouse = useCallback((w: Warehouse) => {
        setWarehouses(prev => prev.map(i => i.id === w.id ? w : i));
    }, []);

    const deleteWarehouse = useCallback((id: string) => {
        setWarehouses(prev => prev.filter(i => i.id !== id));
        showNotification('تم حذف المستودع');
    }, [showNotification]);

    const addTransfer = useCallback((t: StockTransfer) => {
        setTransfers(prev => [t, ...prev]);
        showNotification('تم تسجيل عملية التحويل');
    }, [showNotification]);

    const addAudit = useCallback((a: StockAudit) => {
        setAudits(prev => [a, ...prev]);
        showNotification('تم تسجيل عملية الجرد');
    }, [showNotification]);

    const addCategory = useCallback((cat: string) => {
        setCategories(prev => [...prev, cat]);
    }, []);

    const value: InventoryContextValue = useMemo(() => ({
        inventory, products, loadProducts, addProduct, updateProduct, deleteProduct,
        addInventoryItem, updateInventoryItem, deleteInventoryItem,
        warehouses, addWarehouse, updateWarehouse, deleteWarehouse,
        transfers, addTransfer,
        audits, addAudit,
        categories, addCategory,
        isLoading
    }), [inventory, products, loadProducts, addProduct, updateProduct, deleteProduct, addInventoryItem, updateInventoryItem, deleteInventoryItem, warehouses, addWarehouse, updateWarehouse, deleteWarehouse, transfers, addTransfer, audits, addAudit, categories, addCategory, isLoading]);

    return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (!context) throw new Error('useInventory must be used within InventoryProvider');
    return context;
};
