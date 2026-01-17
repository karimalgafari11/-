import { PaymentMethod, Status } from './common';

export interface Invoice {
    id: string;
    invoiceNumber: string;
    date: string;
    customerId: string;
    customerName: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
    dueDate: string;
    items?: any[]; // يمكن تحسينه لاحقاً
    notes?: string;
    currency?: string;
}
