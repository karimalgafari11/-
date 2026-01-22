/**
 * Safe Context Hooks - خطافات سياق آمنة
 * توفر قيم افتراضية آمنة لمنع انهيار التطبيق عند عدم توفر البيانات
 */

import { useSales } from '../context/SalesContext';
import { usePurchases } from '../context/PurchasesContext';
import { useInventory } from '../context/InventoryContext';
import { Sale, Customer, Purchase, Supplier, SaleReturn, PurchaseReturn } from '../types';
import { Product } from '../types/supabase-helpers';

// القيم الافتراضية الآمنة
const SAFE_DEFAULTS = {
    sales: [] as Sale[],
    customers: [] as Customer[],
    purchases: [] as Purchase[],
    suppliers: [] as Supplier[],
    products: [] as Product[],
    salesReturns: [] as SaleReturn[],
    purchaseReturns: [] as PurchaseReturn[],
};

/**
 * useSales آمن - يرجع قيم افتراضية عند الفشل
 */
export function useSafeSales() {
    try {
        const context = useSales();
        return {
            sales: context.sales || SAFE_DEFAULTS.sales,
            customers: context.customers || SAFE_DEFAULTS.customers,
            salesReturns: context.salesReturns || SAFE_DEFAULTS.salesReturns,
            addSale: context.addSale || (() => { }),
            updateSale: context.updateSale || (() => { }),
            deleteSale: context.deleteSale || (() => { }),
            addCustomer: context.addCustomer || (() => { }),
            updateCustomer: context.updateCustomer || (() => { }),
            deleteCustomer: context.deleteCustomer || (() => { }),
            customerCategories: context.customerCategories || [],
            addCustomerCategory: context.addCustomerCategory || (() => { }),
            invoices: context.invoices || [],
            addInvoice: context.addInvoice || (() => { }),
            addSaleReturn: context.addSaleReturn || (() => { }),
            updateSaleReturn: context.updateSaleReturn || (() => { }),
            deleteSaleReturn: context.deleteSaleReturn || (() => { }),
            isReady: true
        };
    } catch (error) {
        console.error('useSafeSales error:', error);
        return {
            ...SAFE_DEFAULTS,
            addSale: () => { },
            updateSale: () => { },
            deleteSale: () => { },
            addCustomer: () => { },
            updateCustomer: () => { },
            deleteCustomer: () => { },
            customerCategories: [],
            addCustomerCategory: () => { },
            invoices: [],
            addInvoice: () => { },
            addSaleReturn: () => { },
            updateSaleReturn: () => { },
            deleteSaleReturn: () => { },
            isReady: false
        };
    }
}

/**
 * usePurchases آمن - يرجع قيم افتراضية عند الفشل
 */
export function useSafePurchases() {
    try {
        const context = usePurchases();
        return {
            purchases: context.purchases || SAFE_DEFAULTS.purchases,
            suppliers: context.suppliers || SAFE_DEFAULTS.suppliers,
            purchaseReturns: context.purchaseReturns || SAFE_DEFAULTS.purchaseReturns,
            supplierPayments: context.supplierPayments || [],
            addPurchase: context.addPurchase || (() => { }),
            addSupplier: context.addSupplier || (() => { }),
            updateSupplier: context.updateSupplier || (() => { }),
            deleteSupplier: context.deleteSupplier || (() => { }),
            addSupplierPayment: context.addSupplierPayment || (() => { }),
            addPurchaseReturn: context.addPurchaseReturn || (() => { }),
            updatePurchaseReturn: context.updatePurchaseReturn || (() => { }),
            deletePurchaseReturn: context.deletePurchaseReturn || (() => { }),
            isReady: true
        };
    } catch (error) {
        console.error('useSafePurchases error:', error);
        return {
            purchases: SAFE_DEFAULTS.purchases,
            suppliers: SAFE_DEFAULTS.suppliers,
            purchaseReturns: SAFE_DEFAULTS.purchaseReturns,
            supplierPayments: [],
            addPurchase: () => { },
            addSupplier: () => { },
            updateSupplier: () => { },
            deleteSupplier: () => { },
            addSupplierPayment: () => { },
            addPurchaseReturn: () => { },
            updatePurchaseReturn: () => { },
            deletePurchaseReturn: () => { },
            isReady: false
        };
    }
}

/**
 * useInventory آمن - يرجع قيم افتراضية عند الفشل
 */
export function useSafeInventory() {
    try {
        const context = useInventory();
        return {
            products: context.products || SAFE_DEFAULTS.products,
            inventory: context.inventory || [],
            warehouses: context.warehouses || [],
            categories: context.categories || [],
            loading: context.loading || false,
            loadProducts: context.loadProducts || (async () => { }),
            addProduct: context.addProduct || (async () => null),
            updateProduct: context.updateProduct || (async () => null),
            deleteProduct: context.deleteProduct || (async () => false),
            addInventoryItem: context.addInventoryItem || (() => { }),
            updateInventoryItem: context.updateInventoryItem || (() => { }),
            isReady: true
        };
    } catch (error) {
        console.error('useSafeInventory error:', error);
        return {
            products: SAFE_DEFAULTS.products,
            inventory: [],
            warehouses: [],
            categories: [],
            loading: false,
            loadProducts: async () => { },
            addProduct: async () => null,
            updateProduct: async () => null,
            deleteProduct: async () => false,
            addInventoryItem: () => { },
            updateInventoryItem: () => { },
            isReady: false
        };
    }
}
