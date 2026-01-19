
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { InventoryItem, Warehouse, StockAudit, StockTransfer } from '../types';
import { useApp } from './AppContext';
import { useUser } from './app/UserContext';
import { ProductService } from '../services/productService'; // Corrected import
import { warehousesService } from '../services/warehousesService';
import type { Product } from '../types/supabase-types';

interface InventoryContextValue {
    inventory: InventoryItem[]; // InventoryItem might need mapping to/from Stock
    products: Product[];

    // المنتجات
    loadProducts: () => Promise<void>;
    addProduct: (product: any) => Promise<Product | null>;
    updateProduct: (id: string, updates: Partial<Product>) => Promise<Product | null>;
    deleteProduct: (id: string) => Promise<boolean>;

    // Legacy Support
    addInventoryItem?: (item: any) => void;
    updateInventoryItem?: (item: any) => void;
    deleteInventoryItem?: (id: string) => void;

    // المستودعات
    warehouses: Warehouse[]; // Map to Supabase Warehouse
    addWarehouse: (warehouse: any) => Promise<void>;
    updateWarehouse: (warehouse: any) => Promise<void>;
    deleteWarehouse: (id: string) => Promise<void>;

    // عمليات المخزون (نقل وجرد)
    transfers: StockTransfer[];
    addTransfer: (transfer: any) => Promise<void>;
    audits: StockAudit[];
    addAudit: (audit: any) => Promise<void>;

    categories: string[];
    addCategory: (category: string) => void;

    loading: boolean;
    refreshData: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextValue | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showNotification } = useApp();
    const { user } = useUser();

    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [transfers, setTransfers] = useState<StockTransfer[]>([]);
    const [audits, setAudits] = useState<StockAudit[]>([]);
    const [categories, setCategories] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);

    const refreshData = useCallback(async () => {
        if (!user?.companyId) return;

        setLoading(true);
        try {
            const [fetchedProducts, fetchedWarehouses] = await Promise.all([
                ProductService.getProducts(user.companyId),
                warehousesService.getAll(user.companyId)
                // TODO: Fetch inventory stock, transfers, audits
            ]);

            setProducts(fetchedProducts);
            setWarehouses(fetchedWarehouses);

            // Extract categories from products temporarily
            const uniqueCategories = Array.from(new Set(fetchedProducts.map(p => p.category).filter(Boolean))) as string[];
            setCategories(uniqueCategories);

        } catch (error) {
            console.error('Error fetching inventory data:', error);
            showNotification('فشل تحديث بيانات المخزون', 'error');
        } finally {
            setLoading(false);
        }
    }, [user?.companyId, showNotification]);

    useEffect(() => {
        if (user?.companyId) {
            refreshData();
        }
    }, [user?.companyId, refreshData]);

    // المنتجات
    const loadProducts = refreshData;

    const addProduct = useCallback(async (productData: any) => {
        if (!user?.companyId) return null;
        try {
            const newProduct = await ProductService.createProduct(user.companyId, productData);
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
    }, [user?.companyId, showNotification]);

    const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
        try {
            const updated = await ProductService.updateProduct(id, updates);
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

    const deleteProduct = useCallback(async (id: string) => {
        try {
            const success = await ProductService.deleteProduct(id);
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
        // Legacy handling
        setInventory(prev => [...prev, item]);
    }, []);

    // المستودعات
    const addWarehouse = useCallback(async (wh: any) => {
        if (!user?.companyId) return;
        try {
            const added = await warehousesService.create(user.companyId, wh);
            if (added) {
                setWarehouses(prev => [...prev, added]);
                showNotification('تم إضافة المستودع بنجاح');
            }
        } catch (e) { console.error(e); }
    }, [user?.companyId, showNotification]);

    const updateWarehouse = useCallback(async (wh: any) => {
        if (!user?.companyId) return;
        try {
            const updated = await warehousesService.update(wh.id, wh);
            if (updated) {
                setWarehouses(prev => prev.map(w => w.id === wh.id ? updated : w));
            }
        } catch (e) { console.error(e); }
    }, [user?.companyId]);

    const deleteWarehouse = useCallback(async (id: string) => {
        // Service delete not implemented yet in warehousesService, assume soft delete or impl later
        setWarehouses(prev => prev.filter(w => w.id !== id));
    }, []);

    // Transfers & Audits (Placeholder for now)
    const addTransfer = useCallback(async (transfer: any) => {
        setTransfers(prev => [...prev, transfer]);
        // await warehousesService.recordMovement(...)
    }, []);

    const addAudit = useCallback(async (audit: any) => {
        setAudits(prev => [...prev, audit]);
    }, []);

    const addCategory = useCallback((category: string) => {
        setCategories(prev => [...prev, category]);
    }, []);

    // Stub methods for legacy support
    const updateInventoryItem = () => { };
    const deleteInventoryItem = () => { };

    const value: InventoryContextValue = {
        inventory,
        products,
        loadProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        addInventoryItem, // Legacy
        updateInventoryItem, // Legacy
        deleteInventoryItem, // Legacy
        warehouses,
        addWarehouse,
        updateWarehouse,
        deleteWarehouse,
        transfers,
        addTransfer,
        audits,
        addAudit,
        categories,
        addCategory,
        loading,
        refreshData
    };

    return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (context === undefined) {
        throw new Error('useInventory must be used within a InventoryProvider');
    }
    return context;
};
