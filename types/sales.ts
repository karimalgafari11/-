import { PaymentMethod } from './common';

export interface SaleItem {
    id: string;
    itemId: string;
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
    tax: number;
    total: number;
}

export interface Sale {
    id: string;
    invoiceNumber: string;
    date: string;
    customerId: string;
    customerName: string;
    items: SaleItem[];
    subTotal: number;
    taxTotal: number;
    discount: number;
    grandTotal: number;
    paymentMethod: PaymentMethod;
    status: 'paid' | 'pending' | 'cancelled';
    notes?: string;
    // حقول العملة المتعددة
    saleCurrency: string;           // عملة البيع (YER, SAR, OMR)
    exchangeRateUsed: number;       // سعر الصرف المستخدم وقت البيع
    baseGrandTotal: number;         // المبلغ المحول للعملة الأساسية (SAR)
}
