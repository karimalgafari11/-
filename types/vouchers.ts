/**
 * Voucher Types - أنواع السندات
 * سند القبض وسند الدفع
 */

import { PaymentMethod } from './common';

// سند القبض (استلام أموال من العميل)
export interface ReceiptVoucher {
    id: string;
    voucherNumber: string;
    date: string;
    customerId: string;
    customerName: string;
    amount: number;
    currency: string;           // عملة السند
    exchangeRate?: number;      // سعر الصرف وقت السند
    baseAmount?: number;        // المبلغ بالعملة الأساسية (SAR)
    paymentMethod: PaymentMethod;
    referenceNumber?: string;   // رقم مرجعي (شيك، حوالة)
    bankName?: string;          // اسم البنك
    linkedInvoiceId?: string;   // ربط بفاتورة معينة
    notes?: string;
    status: 'completed' | 'cancelled';
    createdBy: string;
    createdAt: string;
}

// سند الدفع (دفع أموال للمورد)
export interface PaymentVoucher {
    id: string;
    voucherNumber: string;
    date: string;
    supplierId: string;
    supplierName: string;
    amount: number;
    currency: string;           // عملة السند
    exchangeRate?: number;      // سعر الصرف وقت السند
    baseAmount?: number;        // المبلغ بالعملة الأساسية (SAR)
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    bankName?: string;
    linkedPurchaseId?: string;  // ربط بفاتورة مشتريات
    notes?: string;
    status: 'completed' | 'cancelled';
    createdBy: string;
    createdAt: string;
}

// رصيد العميل بالعملات المختلفة
export interface CustomerBalance {
    customerId: string;
    balances: {
        [currencyCode: string]: number;  // الرصيد لكل عملة
    };
}

// رصيد المورد بالعملات المختلفة
export interface SupplierBalance {
    supplierId: string;
    balances: {
        [currencyCode: string]: number;
    };
}

// حركة حساب العميل
export interface CustomerLedgerEntry {
    id: string;
    customerId: string;
    date: string;
    type: 'invoice' | 'receipt' | 'return' | 'adjustment';
    referenceId: string;        // رقم الفاتورة أو السند
    description: string;
    debit: number;              // مدين (زيادة الرصيد)
    credit: number;             // دائن (نقص الرصيد)
    currency: string;
    balance: number;            // الرصيد بعد الحركة
}

// حركة حساب المورد
export interface SupplierLedgerEntry {
    id: string;
    supplierId: string;
    date: string;
    type: 'purchase' | 'payment' | 'return' | 'adjustment';
    referenceId: string;
    description: string;
    debit: number;
    credit: number;
    currency: string;
    balance: number;
}
