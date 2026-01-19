
export interface Supplier {
    id: string;
    company_id?: string;  // إضافة للتوافق مع Supabase
    name: string;
    companyName?: string;  // جعل اختياري (للتوافق)
    contactName?: string;
    category?: string;  // جعل اختياري
    phone?: string;  // جعل اختياري
    email?: string;  // جعل اختياري
    taxNumber?: string;  // جعل اختياري
    address?: string;  // جعل اختياري
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
