/**
 * Hook: useAddSale
 * هوك إضافة عملية بيع مع القيود المحاسبية
 * 
 * يتعامل مع:
 * 1. التحقق من صحة البيع عبر Domain Layer
 * 2. إضافة البيع إلى Context (state)
 * 3. إنشاء القيود المحاسبية عبر AutoJournalService
 * 
 * ⚠️ هذا الهوك يفصل المنطق عن Context ويوفر واجهة موحدة للمكونات
 */

import { useCallback } from 'react';
import { useSales } from '../context/SalesContext';
import { useApp } from '../context/AppContext';
import { useOrganization } from '../context/OrganizationContext';
import { AutoJournalService } from '../services/autoJournalService';
import { validateSaleItems, SaleItemCalculation } from '../src/domain/sales/calculations';
import { Sale } from '../types';
import { logger } from '../lib/logger';

interface SaleItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    costPrice: number;
    discountPercent?: number;
}

interface UseAddSaleResult {
    /**
     * إضافة عملية بيع كاملة مع القيود المحاسبية
     */
    addSaleWithJournal: (sale: Sale, items: SaleItem[]) => Promise<{ success: boolean; error?: string }>;

    /**
     * إضافة عملية بيع بدون قيود (للاستخدام الداخلي)
     */
    addSaleOnly: (sale: Sale) => void;
}

export const useAddSale = (): UseAddSaleResult => {
    const { addSale } = useSales();
    const { showNotification, user } = useApp();
    const { company } = useOrganization();

    const addSaleWithJournal = useCallback(async (
        sale: Sale,
        items: SaleItem[]
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            // 1. التحقق من صحة الأصناف
            const saleItems: SaleItemCalculation[] = items.map(item => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                costPrice: item.costPrice,
                discountPercent: item.discountPercent || 0,
                taxRate: 0.15
            }));

            const validation = validateSaleItems(saleItems);
            if (!validation.valid) {
                const errorMsg = validation.errors.join(', ');
                showNotification(errorMsg, 'error');
                return { success: false, error: errorMsg };
            }

            // 2. إضافة البيع إلى Context
            addSale(sale);
            logger.info('Sale added via hook', { saleId: sale.id });

            // 3. إنشاء القيود المحاسبية
            if (company && user) {
                const dbItems = items.map(item => ({
                    product_id: item.productId,
                    product_name: item.productName,
                    quantity: item.quantity,
                    unit_price: item.unitPrice,
                    cost_price: item.costPrice,
                    discount_percent: item.discountPercent || 0
                }));

                const journalSuccess = await AutoJournalService.createSaleEntry(
                    sale as any,
                    dbItems as any,
                    company.id,
                    user.id
                );

                if (journalSuccess) {
                    showNotification('تم إنشاء قيود اليومية تلقائياً', 'success');
                } else {
                    showNotification('فشل إنشاء قيود اليومية التلقائية', 'info');
                }
            }

            return { success: true };

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'خطأ غير متوقع';
            logger.error('Failed to add sale', new Error(errorMsg));
            showNotification(errorMsg, 'error');
            return { success: false, error: errorMsg };
        }
    }, [addSale, showNotification, company, user]);

    const addSaleOnly = useCallback((sale: Sale) => {
        addSale(sale);
        logger.info('Sale added (state only)', { saleId: sale.id });
    }, [addSale]);

    return {
        addSaleWithJournal,
        addSaleOnly
    };
};
