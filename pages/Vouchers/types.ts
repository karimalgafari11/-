/**
 * أنواع السندات المالية
 */

export type VoucherTab = 'receipt' | 'payment';
export type PaymentMethod = 'cash' | 'bank' | 'credit' | 'check' | 'transfer';

export interface ReceiptFormData {
    customerId: string;
    amount: string;
    currency: string;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
    notes: string;
}

export interface PaymentFormData {
    supplierId: string;
    amount: string;
    currency: string;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
    notes: string;
}

export const DEFAULT_RECEIPT_FORM: ReceiptFormData = {
    customerId: '',
    amount: '',
    currency: 'YER',
    paymentMethod: 'cash',
    referenceNumber: '',
    notes: ''
};

export const DEFAULT_PAYMENT_FORM: PaymentFormData = {
    supplierId: '',
    amount: '',
    currency: 'SAR',
    paymentMethod: 'cash',
    referenceNumber: '',
    notes: ''
};
