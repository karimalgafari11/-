
import { describe, it, expect } from 'vitest';
import { formatCurrency, addMoney } from '../currency';

describe('Domain: Currency Logic', () => {
    it('should format SAR currency correctly', () => {
        const result = formatCurrency(1234.56, 'SAR');
        // Expecting standard Arabic/Locale format, check for digits or SAR/ر.س
        // Since environment locale differs, basic check:
        expect(result).toContain('1,234.56'); // Assuming 'en-US' fallback or generic arithmetic format for numbers
    });

    it('should add money correctly', () => {
        const m1 = { amount: 100, currency: 'SAR' as const };
        const m2 = { amount: 50, currency: 'SAR' as const };
        const result = addMoney(m1, m2);
        expect(result.amount).toBe(150);
    });

    it('should throw error on currency mismatch', () => {
        const m1 = { amount: 100, currency: 'SAR' as const };
        const m2 = { amount: 50, currency: 'USD' as const };
        expect(() => addMoney(m1, m2)).toThrow();
    });
});
