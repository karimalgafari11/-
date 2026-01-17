/**
 * Webhook Data Types - أنواع بيانات الـ Webhooks
 * بديل عن استخدام any
 */

// أنواع الأحداث
export type WebhookEventType =
    | 'sale.created'
    | 'sale.updated'
    | 'sale.deleted'
    | 'purchase.created'
    | 'purchase.updated'
    | 'purchase.deleted'
    | 'customer.created'
    | 'customer.updated'
    | 'supplier.created'
    | 'supplier.updated'
    | 'inventory.low_stock'
    | 'inventory.updated'
    | 'voucher.created'
    | 'expense.created'
    | 'payment.received'
    | 'payment.sent';

// بيانات الـ Webhook العامة
export interface WebhookPayload {
    eventType: WebhookEventType;
    timestamp: string;
    data: WebhookData;
    metadata?: WebhookMetadata;
}

// بيانات حسب نوع الحدث
export type WebhookData =
    | SaleWebhookData
    | PurchaseWebhookData
    | CustomerWebhookData
    | SupplierWebhookData
    | InventoryWebhookData
    | VoucherWebhookData
    | ExpenseWebhookData
    | PaymentWebhookData;

export interface SaleWebhookData {
    id: string;
    invoiceNumber: string;
    customerName: string;
    grandTotal: number;
    currency: string;
}

export interface PurchaseWebhookData {
    id: string;
    invoiceNumber: string;
    supplierName: string;
    grandTotal: number;
    currency: string;
}

export interface CustomerWebhookData {
    id: string;
    name: string;
    phone?: string;
    email?: string;
}

export interface SupplierWebhookData {
    id: string;
    name: string;
    companyName?: string;
    phone?: string;
}

export interface InventoryWebhookData {
    id: string;
    itemName: string;
    sku: string;
    quantity: number;
    minQuantity?: number;
}

export interface VoucherWebhookData {
    id: string;
    voucherNumber: string;
    type: 'receipt' | 'payment';
    amount: number;
    currency: string;
}

export interface ExpenseWebhookData {
    id: string;
    description: string;
    amount: number;
    category: string;
}

export interface PaymentWebhookData {
    id: string;
    partyName: string;
    partyType: 'customer' | 'supplier';
    amount: number;
    currency: string;
}

export interface WebhookMetadata {
    userId?: string;
    companyId?: string;
    source?: string;
    ipAddress?: string;
}
