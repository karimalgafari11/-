
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { InventoryItem, Warehouse, StockAudit, StockTransfer } from '../types';
import { useApp } from './AppContext';
import { useUser } from './app/UserContext';
import { productsService } from '../services/productsService'; // Corrected import
import { warehousesService } from '../services/warehousesService';
import { categoriesService, ProductCategory } from '../services/categoriesService';
import type { Product } from '../types/supabase-helpers';

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
            const [fetchedProducts, fetchedWarehouses, fetchedCategories] = await Promise.all([
                productsService.getAll(),
                warehousesService.getAll(user.companyId),
                categoriesService.getCategoryNames(user.companyId)
            ]);

            setProducts(fetchedProducts);
            setWarehouses(fetchedWarehouses);

            // Map Products to Legacy Inventory Items for UI compatibility
            const mappedInventory = fetchedProducts.map((p: Product) => ({
                ...p,
                id: p.id,
                name: p.name,
                itemNumber: p.sku || '',
                sku: p.sku || '',
                category: p.category || 'غير مصنف',
                quantity: p.quantity || 0,
                minQuantity: p.min_quantity || 0,
                salePrice: p.price || 0,
                costPrice: p.cost || 0,
                unit: p.unit || 'حبة',
                specifications: p.description || '',
                manufacturer: '',
                location: '',
                size: '',
                color: '',
                date: p.created_at || new Date().toISOString()
            }));
            setInventory(mappedInventory);

            // استخدام الفئات من Supabase، مع fallback للفئات من المنتجات
            if (fetchedCategories.length > 0) {
                setCategories(fetchedCategories);
            } else {
                const uniqueCategories = Array.from(new Set(fetchedProducts.map((p: Product) => p.category).filter(Boolean))) as string[];
                setCategories(uniqueCategories);
            }

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
            const newProduct = await productsService.create(productData);
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
        try {
            const success = await warehousesService.delete(id);
            if (success) {
                setWarehouses(prev => prev.filter(w => w.id !== id));
                showNotification('تم حذف المستودع');
            }
        } catch (e) {
            console.error('Error deleting warehouse:', e);
        }
    }, [showNotification]);

    // Transfers & Audits (Placeholder for now)
    const addTransfer = useCallback(async (transfer: any) => {
        setTransfers(prev => [...prev, transfer]);
        // await warehousesService.recordMovement(...)
    }, []);

    const addAudit = useCallback(async (audit: any) => {
        setAudits(prev => [...prev, audit]);
    }, []);

    const addCategory = useCallback(async (category: string) => {
        if (!user?.companyId || !category.trim()) return;

        try {
            const created = await categoriesService.create(user.companyId, {
                name: category.trim(),
                level: 1,
                is_active: true
            });

            if (created) {
                setCategories(prev => [...prev, category.trim()]);
                showNotification('تم إضافة الفئة بنجاح');
            }
        } catch (error) {
            console.error('Error adding category:', error);
            // Fallback: إضافة محليًا فقط
            setCategories(prev => [...prev, category.trim()]);
        }
    }, [user?.companyId, showNotification]);

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
