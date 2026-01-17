
export interface Warehouse {
    id: string;
    name: string;
    location: string;
    manager: string;
    contactNumber: string;
    capacity: number;
    status: 'active' | 'full' | 'maintenance';
}

export interface InventoryItem {
    id: string;
    sku: string;
    itemNumber: string;
    name: string;
    manufacturer: string;
    category: string;
    quantity: number;
    unit: string;
    minQuantity: number;
    costPrice: number;
    salePrice: number;
    size?: string;
    specifications?: string;
    warehouses?: { id: string; name: string; quantity: number }[];
}

export interface AuditItem {
    itemId: string;
    itemName: string;
    expectedQty: number;
    actualQty: number;
    variance: number;
    unitCost: number;
    varianceValue: number;
}

export interface StockAudit {
    id: string;
    date: string;
    warehouseId: string;
    warehouseName: string;
    status: 'draft' | 'completed';
    items: AuditItem[];
    totalVarianceValue: number;
    notes?: string;
}

export interface StockTransfer {
    id: string;
    date: string;
    itemId: string;
    itemName: string;
    quantity: number;
    fromLocationId: string;
    fromLocationName: string;
    toLocationId: string;
    toLocationName: string;
    status: 'pending' | 'completed' | 'cancelled';
    reference?: string;
}
