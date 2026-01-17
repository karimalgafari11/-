/**
 * Tests: Sales Calculations
 * اختبارات حسابات المبيعات
 */

import { describe, it, expect } from 'vitest';
import {
    calculateSaleTotals,
    calculateLineTotal,
    calculateTax,
    validateSaleItems,
    calculateProfitMargin,
    SaleItemCalculation
} from '../calculations';

describe('Domain: Sales Calculations', () => {

    describe('calculateLineTotal', () => {
        it('should calculate line total without discount', () => {
            const result = calculateLineTotal(10, 100, 0);
            expect(result).toBe(1000);
        });

        it('should calculate line total with discount', () => {
            const result = calculateLineTotal(10, 100, 10); // 10% discount
            expect(result).toBe(900);
        });
    });

    describe('calculateTax', () => {
        it('should calculate 15% VAT correctly', () => {
            const result = calculateTax(1000, 0.15);
            expect(result).toBe(150);
        });
    });

    describe('calculateSaleTotals', () => {
        it('should calculate all totals correctly', () => {
            const items: SaleItemCalculation[] = [
                {
                    productId: '1',
                    productName: 'Product A',
                    quantity: 5,
                    unitPrice: 100,
                    costPrice: 60,
                    discountPercent: 10,
                    taxRate: 0.15
                },
                {
                    productId: '2',
                    productName: 'Product B',
                    quantity: 3,
                    unitPrice: 200,
                    costPrice: 120,
                    discountPercent: 0,
                    taxRate: 0.15
                }
            ];

            const result = calculateSaleTotals(items, 0, 0.15);

            // Subtotal = (5*100) + (3*200) = 500 + 600 = 1100
            expect(result.subtotal).toBe(1100);

            // Discount = (500 * 0.10) + 0 = 50
            expect(result.discountAmount).toBe(50);

            // Taxable = 1100 - 50 = 1050
            expect(result.taxableAmount).toBe(1050);

            // Tax = 1050 * 0.15 = 157.5
            expect(result.taxAmount).toBe(157.5);

            // Total = 1050 + 157.5 = 1207.5
            expect(result.totalAmount).toBe(1207.5);

            // Cost = (5*60) + (3*120) = 300 + 360 = 660
            expect(result.totalCost).toBe(660);

            // Profit = 1050 - 660 = 390
            expect(result.grossProfit).toBe(390);
        });

        it('should handle additional discount', () => {
            const items: SaleItemCalculation[] = [
                {
                    productId: '1',
                    productName: 'Product',
                    quantity: 10,
                    unitPrice: 100,
                    costPrice: 50,
                    discountPercent: 0,
                    taxRate: 0.15
                }
            ];

            const result = calculateSaleTotals(items, 100, 0.15); // 100 SAR additional discount

            expect(result.subtotal).toBe(1000);
            expect(result.discountAmount).toBe(100);
            expect(result.taxableAmount).toBe(900);
        });
    });

    describe('validateSaleItems', () => {
        it('should pass for valid items', () => {
            const items: SaleItemCalculation[] = [
                {
                    productId: '1',
                    productName: 'Product',
                    quantity: 5,
                    unitPrice: 100,
                    costPrice: 50,
                    discountPercent: 10,
                    taxRate: 0.15
                }
            ];

            const result = validateSaleItems(items);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail for empty items', () => {
            const result = validateSaleItems([]);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('يجب إضافة صنف واحد على الأقل');
        });

        it('should fail for zero quantity', () => {
            const items: SaleItemCalculation[] = [
                {
                    productId: '1',
                    productName: 'Product',
                    quantity: 0,
                    unitPrice: 100,
                    costPrice: 50,
                    discountPercent: 0,
                    taxRate: 0.15
                }
            ];

            const result = validateSaleItems(items);
            expect(result.valid).toBe(false);
        });

        it('should fail for invalid discount percentage', () => {
            const items: SaleItemCalculation[] = [
                {
                    productId: '1',
                    productName: 'Product',
                    quantity: 5,
                    unitPrice: 100,
                    costPrice: 50,
                    discountPercent: 150, // Invalid
                    taxRate: 0.15
                }
            ];

            const result = validateSaleItems(items);
            expect(result.valid).toBe(false);
        });
    });

    describe('calculateProfitMargin', () => {
        it('should calculate profit margin correctly', () => {
            const margin = calculateProfitMargin(150, 100);
            expect(margin).toBe(50); // 50%
        });

        it('should return 0 for zero cost', () => {
            const margin = calculateProfitMargin(100, 0);
            expect(margin).toBe(0);
        });
    });
});
