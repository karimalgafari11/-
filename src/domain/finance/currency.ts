
import { Money, CurrencyCode, addMoney as addMoneyBase, subtractMoney as subtractMoneyBase } from '../../types/domain/money';

/**
 * Formats a number or Money object as a currency string.
 */
export const formatCurrency = (
    value: number | Money,
    currencyCode: CurrencyCode = 'SAR',
    locale: string = 'ar-SA'
): string => {
    const amount = typeof value === 'number' ? value : value.amount;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const currency = typeof value === 'number' ? currencyCode : value.currency;

    return new Intl.NumberFormat(locale, {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

// Re-export from money.ts for backward compatibility
export const addMoney = addMoneyBase;
export const subtractMoney = subtractMoneyBase;
