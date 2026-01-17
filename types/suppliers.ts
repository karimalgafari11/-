
export interface Supplier {
    id: string;
    name: string;
    companyName: string;
    contactName?: string;
    category: string;
    phone: string;
    email: string;
    taxNumber: string;
    address: string;
    balance: number;
    status: 'active' | 'inactive' | 'blocked';
    notes?: string;
    isActive?: boolean;
    lastTransactionDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface SupplierPayment {
    id: string;
    voucherNumber: string;
    supplierId: string;
    supplierName: string;
    date: string;
    amount: number;
    paymentMethod: 'cash' | 'bank' | 'check';
    reference?: string;
    notes?: string;
    appliedToInvoices?: string[];
}
