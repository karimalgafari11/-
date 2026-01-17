
export interface PurchaseItem {
    id: string;
    itemId: string;
    name: string;
    quantity: number;
    costPrice: number;
    tax: number;
    total: number;
    warehouseId: string;
}

export interface Purchase {
    id: string;
    invoiceNumber: string;
    referenceNumber: string;
    date: string;
    supplierId: string;
    supplierName: string;
    items: PurchaseItem[];
    subTotal: number;
    taxTotal: number;
    grandTotal: number;
    paymentMethod: 'cash' | 'credit' | 'bank';
    status: 'completed' | 'draft';
    paymentStatus?: 'unpaid' | 'partial' | 'paid';
    paidAmount?: number;
    notes?: string;
    // حقل العملة - افتراضياً SAR
    currency: string;
}
