import { describe, it, expect } from 'vitest';
import {
    isValidEmail,
    isValidSaudiPhone,
    isValidAmount,
    validateCustomerData,
} from '../../../utils/validation';

describe('Validation Utilities', () => {
    describe('isValidEmail', () => {
        it('should return true for valid emails', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
        });

        it('should return false for invalid emails', () => {
            expect(isValidEmail('invalid-email')).toBe(false);
            expect(isValidEmail('test@.com')).toBe(false);
            expect(isValidEmail('@example.com')).toBe(false);
            expect(isValidEmail('test@example')).toBe(false);
        });
    });

    describe('isValidSaudiPhone', () => {
        it('should return true for valid Saudi mobile numbers', () => {
            expect(isValidSaudiPhone('0501234567')).toBe(true);
            expect(isValidSaudiPhone('501234567')).toBe(true);
            expect(isValidSaudiPhone('0551234567')).toBe(true);
        });

        it('should return false for invalid numbers', () => {
            expect(isValidSaudiPhone('050123')).toBe(false); // too short
            expect(isValidSaudiPhone('05012345678')).toBe(false); // too long
            expect(isValidSaudiPhone('0301234567')).toBe(false); // invalid prefix
        });
    });

    describe('isValidAmount', () => {
        it('should return true for valid amounts', () => {
            expect(isValidAmount(100)).toBe(true);
            expect(isValidAmount(0)).toBe(true);
            expect(isValidAmount(10.5)).toBe(true);
        });

        it('should return false for invalid amounts', () => {
            expect(isValidAmount(-1)).toBe(false);
            expect(isValidAmount(NaN)).toBe(false);
            expect(isValidAmount(Infinity)).toBe(false);
        });
    });

    describe('validateCustomerData', () => {
        it('should validate correct customer data', () => {
            const result = validateCustomerData({
                name: 'John Doe',
                phone: '0501234567',
                email: 'john@example.com',
            });
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should detect invalid name', () => {
            const result = validateCustomerData({
                name: 'A', // too short
                phone: '0501234567',
            });
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('اسم العميل يجب أن يكون بين 2 و 100 حرف');
        });

        it('should detect invalid phone if provided', () => {
            const result = validateCustomerData({
                name: 'John Doe',
                phone: '123',
            });
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('رقم الهاتف غير صحيح');
        });
    });
});
