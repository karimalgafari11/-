/**
 * Currency Service - خدمة العملات
 * إدارة العملات وأسعار الصرف
 */

import { supabase } from '../lib/supabaseClient';
import type { Currency, ExchangeRate, InsertType, UpdateType } from '../types/supabase-types';

export const CurrencyService = {
    // ========================================
    // CURRENCIES
    // ========================================

    /**
     * جلب كافة العملات المتاحة
     */
    async getAllCurrencies(): Promise<Currency[]> {
        const { data, error } = await supabase
            .from('currencies')
            .select('*')
            .eq('is_active', true)
            .order('name');

        if (error) throw error;
        return data || [];
    },

    /**
     * إضافة عملة جديدة (للنظام)
     */
    async addCurrency(currency: Currency): Promise<Currency> {
        const { data, error } = await supabase
            .from('currencies')
            .insert(currency)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // ========================================
    // EXCHANGE RATES
    // ========================================

    /**
     * جلب أسعار الصرف الحالية للشركة
     */
    async getCurrentRates(companyId: string): Promise<ExchangeRate[]> {
        // نجلب الأسعار التي ما زالت سارية (valid_to is null OR valid_to > now)
        const now = new Date().toISOString();

        const { data, error } = await supabase
            .from('exchange_rates')
            .select('*')
            .eq('company_id', companyId)
            .or(`valid_to.is.null,valid_to.gt.${now}`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * الحصول على سعر صرف محدد بين عملتين
     */
    async getExchangeRate(
        companyId: string,
        fromCurrency: string,
        toCurrency: string
    ): Promise<number> {
        if (fromCurrency === toCurrency) return 1;

        const rates = await CurrencyService.getCurrentRates(companyId);

        // البحث عن سعر مباشر
        const directRate = rates.find(r =>
            r.from_currency === fromCurrency && r.to_currency === toCurrency
        );
        if (directRate) return directRate.rate;

        // البحث عن سعر عكسي (1 / Rate)
        const inverseRate = rates.find(r =>
            r.from_currency === toCurrency && r.to_currency === fromCurrency
        );
        if (inverseRate && inverseRate.rate !== 0) return 1 / inverseRate.rate;

        // يمكن إضافة منطق للبحث عن سعر مركب عبر عملة وسيطة (مثل الدولار) هنا

        return 1; // الافتراضي إذا لم يوجد سعر
    },

    /**
     * إضافة/تحديث سعر صرف
     */
    async setExchangeRate(exchangeRate: InsertType<ExchangeRate>): Promise<ExchangeRate> {
        // 1. أولاً، نغلق السعر القديم لنفس الزوج من العملات
        const now = new Date().toISOString();

        await supabase
            .from('exchange_rates')
            .update({ valid_to: now } as any) // Type casting needed for partial update logic sometimes
            .eq('company_id', exchangeRate.company_id)
            .eq('from_currency', exchangeRate.from_currency)
            .eq('to_currency', exchangeRate.to_currency)
            .is('valid_to', null);

        // 2. إضافة السعر الجديد
        const { data, error } = await supabase
            .from('exchange_rates')
            .insert({
                ...exchangeRate,
                valid_from: now,
                valid_to: null
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
