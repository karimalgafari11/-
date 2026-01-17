import { PaymentMethod, Status } from './common';

export interface Expense {
    id: string;
    expenseNumber: string;
    date: string;
    category: string;
    description: string;
    amount: number;
    tax: number;
    total: number;
    paymentMethod: PaymentMethod;
    status: 'paid' | 'pending';
    attachment?: string;
    // حقل العملة
    currency: string;
}

export interface RecurringExpense {
    id: string;
    description: string;
    amount: number;
    category: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    nextDueDate: string;
    isActive: boolean;
}
