
import { Money } from '../../types/domain/money';

export const calculateTax = (amount: number, rate: number): number => {
    return amount * (rate / 100);
};

export const calculateAmountBeforeTax = (amountincTax: number, rate: number): number => {
    return amountincTax / (1 + rate / 100);
};

export const calculateTotalWithTax = (amount: number, rate: number): number => {
    return amount * (1 + rate / 100);
};
