
import { PaymentMethod } from './common';
import { SaleItem } from './sales';
import { PurchaseItem } from './purchases';

// ===================== مرتجعات المبيعات =====================

// عنصر مرتجع المبيعات (يشبه عنصر البيع لكن قد يكون له سبب إرجاع خاص لكل عنصر مستقبلاً)
export interface SaleReturnItem extends SaleItem {
    returnReason?: string;
}

export interface SaleReturn {
    id: string;
    returnNumber: string;       // رقم المرتجع RET-2024-001
    originalSaleId: string;     // معرف عملية البيع الأصلية
    originalInvoiceNumber: string; // رقم الفاتورة الأصلية
    date: string;
    customerId: string;
    customerName: string;
    items: SaleReturnItem[];
    subTotal: number;
    taxTotal: number;
    grandTotal: number;         // إجمالي المبلغ المسترد
    reason: string;             // سبب الإرجاع العام
    status: 'pending' | 'approved' | 'rejected' | 'refunded';
    refundMethod: 'cash' | 'credit' | 'wallet'; // طريقة الاسترداد: نقدي، آجل (خصم من المديونية)، محفظة
    notes?: string;

    // العملات
    currency: string;
    exchangeRate: number;
    baseGrandTotal: number;
}

// ===================== مرتجعات المشتريات =====================

export interface PurchaseReturnItem extends PurchaseItem {
    returnReason?: string;
}

export interface PurchaseReturn {
    id: string;
    returnNumber: string;
    originalPurchaseId: string;
    originalInvoiceNumber: string;
    date: string;
    supplierId: string;
    supplierName: string;
    items: PurchaseReturnItem[];
    subTotal: number;
    taxTotal: number;
    grandTotal: number;
    reason: string;
    status: 'pending' | 'sent' | 'completed' | 'refunded';
    notes?: string;

    // العملات
    currency: string;
    exchangeRate?: number;
}
