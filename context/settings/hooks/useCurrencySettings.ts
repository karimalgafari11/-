/**
 * useCurrencySettings Hook
 * Hook لإدارة إعدادات العملات وأسعار الصرف
 */

import { useCallback } from 'react';
import { Currency, ExchangeRateRecord } from '../../../types/common';
import { AppSettingsExtended } from '../../../types/settings-extended';
import { CurrencyService } from '../../../services/currencyService';
import { logger } from '../../../lib/logger';

interface UseCurrencySettingsProps {
    settings: AppSettingsExtended;
    setSettings: React.Dispatch<React.SetStateAction<AppSettingsExtended>>;
    activeCompanyId: string;
}

export const useCurrencySettings = ({
    settings,
    setSettings,
    activeCompanyId
}: UseCurrencySettingsProps) => {

    const currencies = settings.currency.currencies;
    const exchangeRates = settings.currency.exchangeRates;

    const addCurrency = useCallback(async (currency: Omit<Currency, 'createdAt'>) => {
        try {
            const newCurrency: Currency = {
                ...currency,
                createdAt: new Date().toISOString()
            };
            setSettings(prev => ({
                ...prev,
                currency: {
                    ...prev.currency,
                    currencies: [...prev.currency.currencies, newCurrency]
                }
            }));
            logger.info('Currency added locally', { code: currency.code });
        } catch (error) {
            throw error;
        }
    }, [setSettings]);

    const updateCurrency = useCallback(async (currency: Currency) => {
        setSettings(prev => ({
            ...prev,
            currency: {
                ...prev.currency,
                currencies: prev.currency.currencies.map(c =>
                    c.code === currency.code ? currency : c
                )
            }
        }));
    }, [setSettings]);

    const deleteCurrency = useCallback(async (code: string) => {
        if (settings.currency.defaultCurrency === code) {
            logger.warn('Cannot delete default currency');
            return;
        }
        setSettings(prev => ({
            ...prev,
            currency: {
                ...prev.currency,
                currencies: prev.currency.currencies.filter(c => c.code !== code)
            }
        }));
        logger.info('Currency deleted', { code });
    }, [settings.currency.defaultCurrency, setSettings]);

    const setDefaultCurrency = useCallback((code: string) => {
        setSettings(prev => ({
            ...prev,
            currency: {
                ...prev.currency,
                defaultCurrency: code,
                currencies: prev.currency.currencies.map(c => ({
                    ...c,
                    isDefault: c.code === code
                }))
            }
        }));
        logger.info('Default currency changed', { code });
    }, [setSettings]);

    const getCurrency = useCallback((code: string) => {
        return currencies.find(c => c.code === code);
    }, [currencies]);

    const addExchangeRate = useCallback(async (rate: Omit<ExchangeRateRecord, 'id' | 'createdAt'>) => {
        try {
            if (!activeCompanyId) return;

            await CurrencyService.setExchangeRate({
                company_id: activeCompanyId,
                from_currency: rate.fromCurrency,
                to_currency: rate.toCurrency,
                rate: rate.rate,
                valid_from: rate.date
            } as any);

            const newRate: ExchangeRateRecord = {
                ...rate,
                id: `rate_${Date.now()}`,
                createdAt: new Date().toISOString()
            };
            setSettings(prev => ({
                ...prev,
                currency: {
                    ...prev.currency,
                    exchangeRates: [newRate, ...prev.currency.exchangeRates],
                    lastUpdate: new Date().toISOString()
                }
            }));
            logger.info('Exchange rate added', { from: rate.fromCurrency, to: rate.toCurrency, rate: rate.rate });
        } catch (e) {
            console.error(e);
        }
    }, [activeCompanyId, setSettings]);

    const getExchangeRate = useCallback((from: string, to: string, date?: string): number => {
        if (from === to) return 1;

        const rates = exchangeRates
            .filter(r =>
                (r.fromCurrency === from && r.toCurrency === to) ||
                (r.fromCurrency === to && r.toCurrency === from)
            )
            .filter(r => !date || r.date <= date)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (rates.length === 0) return 1;

        const rate = rates[0];
        if (rate.fromCurrency === from && rate.toCurrency === to) {
            return rate.rate;
        } else {
            return 1 / rate.rate;
        }
    }, [exchangeRates]);

    const getExchangeHistory = useCallback((from: string, to: string, limit = 30) => {
        return exchangeRates
            .filter(r =>
                (r.fromCurrency === from && r.toCurrency === to) ||
                (r.fromCurrency === to && r.toCurrency === from)
            )
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, limit);
    }, [exchangeRates]);

    const convertAmount = useCallback((amount: number, from: string, to: string, date?: string): number => {
        const rate = getExchangeRate(from, to, date);
        return amount * rate;
    }, [getExchangeRate]);

    const formatCurrency = useCallback((amount: number, currencyCode?: string): string => {
        const code = currencyCode || settings.currency.defaultCurrency;
        const currency = getCurrency(code);

        if (!currency) {
            return amount.toLocaleString('ar-SA');
        }

        const formatted = amount.toLocaleString('ar-SA', {
            minimumFractionDigits: currency.decimalPlaces,
            maximumFractionDigits: currency.decimalPlaces
        });

        return currency.position === 'before'
            ? `${currency.symbol}${formatted}`
            : `${formatted} ${currency.symbol}`;
    }, [settings.currency.defaultCurrency, getCurrency]);

    return {
        currencies,
        exchangeRates,
        addCurrency,
        updateCurrency,
        deleteCurrency,
        setDefaultCurrency,
        getCurrency,
        addExchangeRate,
        getExchangeRate,
        getExchangeHistory,
        convertAmount,
        formatCurrency
    };
};
