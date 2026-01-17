/**
 * Domain Types: Transactions
 * أنواع المعاملات التجارية
 */

import { Money, SaleId, PurchaseId, CustomerId, SupplierId, ProductId, VoucherId } from './money';

// ============================================
// Enums
// ============================================

export enum PaymentMethod {
    CASH = 'cash',
    CREDIT = 'credit',
    BANK_TRANSFER = 'bank_transfer',
    CHECK = 'check'
}

export enum PaymentStatus {
    PENDING = 'pending',
    PARTIAL = 'partial',
    PAID = 'paid',
    OVERDUE = 'overdue'
}

export enum TransactionType {
    SALE = 'sale',
    PURCHASE = 'purchase',
    SALE_RETURN = 'sale_return',
    PURCHASE_RETURN = 'purchase_return',
    EXPENSE = 'expense',
    RECEIPT = 'receipt',
    PAYMENT = 'payment'
}

export enum VoucherType {
    RECEIPT = 'receipt',      // سند قبض
    PAYMENT = 'payment'       // سند صرف
}

// ============================================
// Transaction Item (سطر معاملة)
// ============================================

export interface TransactionItem {
    readonly productId: ProductId;
    readonly productName: string;
    readonly quantity: number;
    readonly unitPrice: Money;
    readonly costPrice: Money;
    readonly discount: number;      // نسبة الخصم (0-100)
    readonly taxRate: number;       // نسبة الضريبة (0-1)
}

// ============================================
// Sale Transaction (معاملة بيع)
// ============================================

export interface SaleTransaction {
    readonly id: SaleId;
    readonly invoiceNumber: string;
    readonly date: string;                    // ISO 8601
    readonly customerId?: CustomerId;
    readonly customerName: string;
    readonly items: readonly TransactionItem[];
    readonly subtotal: Money;
    readonly discountAmount: Money;
    readonly taxAmount: Money;
    readonly totalAmount: Money;
    readonly paymentMethod: PaymentMethod;
    readonly paymentStatus: PaymentStatus;
    readonly notes?: string;
}

// ============================================
// Purchase Transaction (معاملة شراء)
// ============================================

export interface PurchaseTransaction {
    readonly id: PurchaseId;
    readonly invoiceNumber: string;
    readonly date: string;
    readonly supplierId?: SupplierId;
    readonly supplierName: string;
    readonly items: readonly TransactionItem[];
    readonly subtotal: Money;
    readonly discountAmount: Money;
    readonly taxAmount: Money;
    readonly totalAmount: Money;
    readonly paymentMethod: PaymentMethod;
    readonly paymentStatus: PaymentStatus;
    readonly notes?: string;
}

// ============================================
// Voucher Transaction (سند قبض/صرف)
// ============================================

export interface VoucherTransaction {
    readonly id: VoucherId;
    readonly voucherNumber: string;
    readonly voucherType: VoucherType;
    readonly date: string;
    readonly partyId?: CustomerId | SupplierId;
    readonly partyName: string;
    readonly amount: Money;
    readonly amountBase: Money;          // المبلغ بعملة الأساس (SAR)
    readonly exchangeRate: number;
    readonly referenceType?: TransactionType;
    readonly referenceId?: string;
    readonly notes?: string;
}

// ============================================
// Calculation Results (نتائج الحسابات)
// ============================================

export interface TransactionTotals {
    readonly subtotal: Money;
    readonly discountAmount: Money;
    readonly taxableAmount: Money;
    readonly taxAmount: Money;
    readonly totalAmount: Money;
}

export interface COGSResult {
    readonly totalCost: Money;
    readonly itemCosts: readonly { productId: ProductId; cost: Money }[];
}
