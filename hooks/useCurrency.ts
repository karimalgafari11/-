/**
 * useCurrency Hook
 * هوك للتعامل مع العملات المتعددة وتحويل المبالغ
 */

import { useCallback, useMemo } from 'react';
import { useSettings } from '../context/SettingsContext';

// العملة الأساسية للنظام
const BASE_CURRENCY = 'SAR';

// العملات الافتراضية لكل نوع معاملة
export const DEFAULT_SALE_CURRENCY = 'YER';
export const DEFAULT_PURCHASE_CURRENCY = 'SAR';
export const DEFAULT_EXPENSE_CURRENCY = 'SAR';

export interface CurrencyConversion {
    originalAmount: number;
    originalCurrency: string;
    convertedAmount: number;
    targetCurrency: string;
    exchangeRate: number;
    exchangeDate: string;
}

export const useCurrency = () => {
    const {
        currencies,
        exchangeRates,
        getExchangeRate,
        convertAmount,
        formatCurrency,
        getCurrency
    } = useSettings();

    // العملات النشطة فقط
    const activeCurrencies = useMemo(() =>
        currencies.filter(c => c.isActive),
        [currencies]
    );

    // تحويل مبلغ للعملة الأساسية (SAR)
    const convertToBase = useCallback((
        amount: number,
        fromCurrency: string
    ): CurrencyConversion => {
        if (fromCurrency === BASE_CURRENCY) {
            return {
                originalAmount: amount,
                originalCurrency: fromCurrency,
                convertedAmount: amount,
                targetCurrency: BASE_CURRENCY,
                exchangeRate: 1,
                exchangeDate: new Date().toISOString().split('T')[0]
            };
        }

        const rate = getExchangeRate(fromCurrency, BASE_CURRENCY);
        const converted = amount * rate;

        return {
            originalAmount: amount,
            originalCurrency: fromCurrency,
            convertedAmount: Math.round(converted * 100) / 100, // تقريب لخانتين عشريتين
            targetCurrency: BASE_CURRENCY,
            exchangeRate: rate,
            exchangeDate: new Date().toISOString().split('T')[0]
        };
    }, [getExchangeRate]);

    // تحويل مبلغ من العملة الأساسية لعملة أخرى
    const convertFromBase = useCallback((
        amount: number,
        toCurrency: string
    ): CurrencyConversion => {
        if (toCurrency === BASE_CURRENCY) {
            return {
                originalAmount: amount,
                originalCurrency: BASE_CURRENCY,
                convertedAmount: amount,
                targetCurrency: toCurrency,
                exchangeRate: 1,
                exchangeDate: new Date().toISOString().split('T')[0]
            };
        }

        const rate = getExchangeRate(BASE_CURRENCY, toCurrency);
        const currency = getCurrency(toCurrency);
        const decimalPlaces = currency?.decimalPlaces ?? 2;
        const converted = amount * rate;

        return {
            originalAmount: amount,
            originalCurrency: BASE_CURRENCY,
            convertedAmount: Math.round(converted * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces),
            targetCurrency: toCurrency,
            exchangeRate: rate,
            exchangeDate: new Date().toISOString().split('T')[0]
        };
    }, [getExchangeRate, getCurrency]);

    // حساب مبلغ البيع بالعملة المحددة مع الاحتفاظ بالمبلغ الأساسي
    const calculateSaleAmount = useCallback((
        baseAmount: number, // المبلغ بالعملة الأساسية SAR
        saleCurrency: string
    ): {
        displayAmount: number;
        baseAmount: number;
        exchangeRate: number;
        formattedDisplay: string;
        formattedBase: string;
    } => {
        const conversion = convertFromBase(baseAmount, saleCurrency);

        return {
            displayAmount: conversion.convertedAmount,
            baseAmount: baseAmount,
            exchangeRate: conversion.exchangeRate,
            formattedDisplay: formatCurrency(conversion.convertedAmount, saleCurrency),
            formattedBase: formatCurrency(baseAmount, BASE_CURRENCY)
        };
    }, [convertFromBase, formatCurrency]);

    // تحويل مبلغ البيع للريال السعودي (عند إدخال يدوي بعملة أخرى)
    const calculateBaseFromSale = useCallback((
        saleAmount: number,
        saleCurrency: string
    ): {
        baseAmount: number;
        exchangeRate: number;
        formattedBase: string;
    } => {
        const conversion = convertToBase(saleAmount, saleCurrency);

        return {
            baseAmount: conversion.convertedAmount,
            exchangeRate: conversion.exchangeRate,
            formattedBase: formatCurrency(conversion.convertedAmount, BASE_CURRENCY)
        };
    }, [convertToBase, formatCurrency]);

    // التحقق من تاريخ آخر تحديث لسعر الصرف
    const checkExchangeRateAge = useCallback((): {
        isStale: boolean;
        daysSinceUpdate: number;
        lastUpdate: string | null;
    } => {
        if (exchangeRates.length === 0) {
            return { isStale: true, daysSinceUpdate: 999, lastUpdate: null };
        }

        const sortedRates = [...exchangeRates].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        const lastDate = sortedRates[0].date;
        const daysDiff = Math.floor(
            (Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
            isStale: daysDiff >= 7, // أقدم من أسبوع
            daysSinceUpdate: daysDiff,
            lastUpdate: lastDate
        };
    }, [exchangeRates]);

    // جلب سعر الصرف الحالي بين عملتين
    const getCurrentRate = useCallback((from: string, to: string): number => {
        return getExchangeRate(from, to);
    }, [getExchangeRate]);

    return {
        // البيانات
        BASE_CURRENCY,
        activeCurrencies,
        exchangeRates,

        // الثوابت
        DEFAULT_SALE_CURRENCY,
        DEFAULT_PURCHASE_CURRENCY,
        DEFAULT_EXPENSE_CURRENCY,

        // الدوال
        convertToBase,
        convertFromBase,
        calculateSaleAmount,
        calculateBaseFromSale,
        checkExchangeRateAge,
        getCurrentRate,
        formatCurrency,
        getCurrency
    };
};

export default useCurrency;
