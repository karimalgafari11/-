/**
 * Expenses Service - خدمة المصروفات
 * Refactored for Schema V6 (wraps vouchersService with type='payment')
 */

import { vouchersService } from './vouchersService';
import type { Voucher } from '../types/supabase-helpers';

export type Expense = Voucher;

export const expensesService = {
    /**
     * جلب جميع المصروفات (سندات الصرف)
     */
    async getAll(companyId: string): Promise<Expense[]> {
        const vouchers = await vouchersService.getAll(companyId);
        return vouchers.filter(v => v.type === 'payment');
    },

    /**
     * جلب مصروفات حسب التصنيف
     * In V6, classification is not native. We search in description.
     */
    async getByCategory(companyId: string, category: string): Promise<Expense[]> {
        const vouchers = await vouchersService.getAll(companyId);
        return vouchers.filter(v =>
            v.type === 'payment' &&
            v.description?.includes(category)
        );
    },

    /**
     * جلب مصروفات بفترة زمنية
     */
    async getByDateRange(
        companyId: string,
        startDate: string,
        endDate: string
    ): Promise<Expense[]> {
        const vouchers = await vouchersService.getAll(companyId);
        return vouchers.filter(v =>
            v.type === 'payment' &&
            v.date &&
            v.date >= startDate &&
            v.date <= endDate
        );
    },

    /**
     * إنشاء مصروف جديد
     */
    async create(
        companyId: string,
        expense: {
            amount: number;
            category?: string;
            // expense_date mapped to date
            date?: string;
            description?: string
        }
    ): Promise<Expense | null> {
        // Map Expense data to Voucher data
        // Combine category and notes into description/notes
        const description = expense.category ? `Category: ${expense.category}` : undefined;

        return await vouchersService.create(companyId, {
            type: 'payment',
            amount: expense.amount,
            date: expense.date || new Date().toISOString(),
            description: description || expense.description,
            partner_id: null // Expenses might not have a partner
        });
    },

    /**
     * تحديث مصروف
     */
    async update(id: string, updates: Partial<{ amount: number; category: string; description: string; date: string }>): Promise<Expense | null> {
        // Map updates
        const voucherUpdates: any = {};
        if (updates.amount !== undefined) voucherUpdates.amount = updates.amount;
        if (updates.date !== undefined) voucherUpdates.date = updates.date;
        if (updates.description !== undefined) voucherUpdates.description = updates.description;
        // Category update logic if needed (append to description?)

        return await vouchersService.update(id, voucherUpdates);
    },

    /**
     * حذف مصروف
     */
    async delete(id: string): Promise<boolean> {
        return await vouchersService.delete(id);
    },

    /**
     * إحصائيات المصروفات
     */
    async getStats(companyId: string): Promise<{
        total: number;
        byCategory: Record<string, number>;
        thisMonth: number;
    }> {
        const expenses = await this.getAll(companyId);

        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString().split('T')[0];

        return expenses.reduce((acc, e) => {
            acc.total += e.amount;

            // Extract category from description "Category: X" logic if preserved?
            // Or just use 'General'
            const cat = 'General';
            acc.byCategory[cat] = (acc.byCategory[cat] || 0) + e.amount;

            if (e.date && e.date >= thisMonthStart) {
                acc.thisMonth += e.amount;
            }
            return acc;
        }, {
            total: 0,
            byCategory: {} as Record<string, number>,
            thisMonth: 0
        });
    }
};

export default expensesService;

