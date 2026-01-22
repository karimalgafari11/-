
export interface Warehouse {
    id: string;
    name: string;
    location: string;
    manager: string;
    contactNumber: string;
    capacity: number;
    status: 'active' | 'full' | 'maintenance';
}

import { Product } from './supabase-helpers';

export interface InventoryItem extends Product {
    // Add any frontend-specific fields if necessary, or alias legacy ones
    // legacy support (optional)
    itemNumber?: string;
    minQuantity?: number;
    costPrice?: number;
    salePrice?: number;
    warehouses?: { id: string; name: string; quantity: number }[];
    // Extended fields
    size?: string;
    color?: string;
    specifications?: string;
    manufacturer: string | null;
    location?: string;
    date?: string;
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
