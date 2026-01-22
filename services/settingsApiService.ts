/**
 * Settings API Service
 * خدمة API موحدة لإعدادات التطبيق
 * 
 * تم استخراج هذه الخدمة من SettingsContext.tsx لفصل منطق API عن State Management
 */

import { supabase } from '../lib/supabaseClient';
import { BranchService } from './branchService';
import { CurrencyService } from './currencyService';
import { fiscalYearsService } from './fiscalYearsService';
import { companyService } from './companyService';
import type { Branch, UpdateType, InsertType } from '../types/supabase-types';
import type { FiscalYear } from '../types/accounting';
import type { Currency, ExchangeRateRecord } from '../types/common';
import type { CompanyInfo } from '../types/settings-extended';
import { logger } from '../lib/logger';

// ===================== Types =====================
export interface SettingsApiData {
    company: CompanyInfo | null;
    branches: Branch[];
    fiscalPeriods: FiscalYear[];
    currencies: Currency[];
    exchangeRates: ExchangeRateRecord[];
}

export interface LoadSettingsResult {
    success: boolean;
    data: SettingsApiData;
    error?: string;
}

// ===================== UUID Validation =====================
const isValidUUID = (id: string): boolean => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

// ===================== Company =====================
export const loadCompanyFromSupabase = async (companyId: string): Promise<CompanyInfo | null> => {
    if (!companyId || companyId === 'default-company-id' || !isValidUUID(companyId)) {
        return null;
    }

    try {
        const { data: company, error } = await supabase
            .from('companies')
            .select('*')
            .eq('id', companyId)
            .single();

        if (error || !company) {
            logger.error('Error loading company from Supabase', error);
            return null;
        }

        const companyData = company as {
            id: string;
            name: string;
            name_en?: string;
            phone?: string;
            email?: string;
            address?: string;
            website?: string;
            tax_number?: string;
            commercial_register?: string;
            logo?: string;
            created_at?: string;
        };

        logger.info('✅ Loaded company from Supabase', { name: companyData.name });

        return {
            id: companyData.id,
            name: companyData.name || 'شركتي',
            nameEn: companyData.name_en,
            phone: companyData.phone || '',
            email: companyData.email,
            address: companyData.address || '',
            website: companyData.website,
            taxNumber: companyData.tax_number,
            commercialRegister: companyData.commercial_register,
            logo: companyData.logo,
            baseCurrency: 'YER',
            fiscalYearStart: '01-01',
            createdAt: companyData.created_at || new Date().toISOString()
        };
    } catch (err) {
        logger.error('Error in loadCompanyFromSupabase', err as Error);
        return null;
    }
};

export const updateCompanyInSupabase = async (company: CompanyInfo): Promise<boolean> => {
    try {
        await companyService.updateCompany(company.id, {
            name: company.name,
            name_en: company.nameEn,
            phone: company.phone,
            email: company.email,
            address: company.address,
            tax_number: company.taxNumber,
            commercial_register: company.commercialRegister,
            logo: company.logo
        });
        logger.info('Company saved to Supabase', { companyId: company.id });
        return true;
    } catch (error) {
        logger.error('Failed to save company to Supabase', error as Error);
        return false;
    }
};

// ===================== Load All Settings =====================
export const loadAllSettings = async (companyId: string): Promise<LoadSettingsResult> => {
    if (!isValidUUID(companyId)) {
        return {
            success: false,
            data: {
                company: null,
                branches: [],
                fiscalPeriods: [],
                currencies: [],
                exchangeRates: []
            },
            error: 'Invalid company ID'
        };
    }

    try {
        // 1. Fetch Branches
        const branches = await BranchService.getBranches(companyId);

        // 2. Fetch Fiscal Periods
        const fiscalPeriods = await fiscalYearsService.getAll();

        // 3. Fetch Currencies
        const allCurrencies = await CurrencyService.getAllCurrencies();
        const currencies: Currency[] = allCurrencies.map(c => ({
            code: c.code,
            nameAr: c.name_ar,
            nameEn: c.name_en,
            symbol: c.symbol || '',
            decimalPlaces: c.decimal_places || 2,
            isActive: c.is_active ?? true,
            isDefault: c.is_base || false,
            createdAt: c.created_at || new Date().toISOString(),
            position: 'after' as const
        }));

        // 4. Fetch Exchange Rates
        const rates = await CurrencyService.getCurrentRates(companyId);
        const exchangeRates: ExchangeRateRecord[] = rates.map(r => ({
            id: r.id,
            fromCurrency: r.from_currency,
            toCurrency: r.to_currency,
            rate: r.rate,
            date: r.valid_from,
            note: 'From Database',
            createdBy: 'system',
            createdAt: r.created_at
        }));

        return {
            success: true,
            data: {
                company: null, // Loaded separately
                branches,
                fiscalPeriods,
                currencies,
                exchangeRates
            }
        };
    } catch (error: any) {
        if (process.env.NODE_ENV === 'development' && error?.name !== 'AbortError') {
            logger.debug('Settings refresh skipped due to backend issue');
        }
        return {
            success: false,
            data: {
                company: null,
                branches: [],
                fiscalPeriods: [],
                currencies: [],
                exchangeRates: []
            },
            error: error?.message || 'Failed to load settings'
        };
    }
};

// ===================== Branches =====================
export const branchesApi = {
    add: async (branch: InsertType<Branch>): Promise<Branch> => {
        const newBranch = await BranchService.addBranch(branch);
        logger.info('Branch added', { id: newBranch.id });
        return newBranch;
    },

    update: async (id: string, branch: UpdateType<Branch>): Promise<Branch> => {
        const updated = await BranchService.updateBranch(id, branch);
        logger.info('Branch updated', { id });
        return updated;
    },

    delete: async (id: string): Promise<void> => {
        await BranchService.deleteBranch(id);
        logger.info('Branch deleted', { id });
    }
};

// ===================== Fiscal Periods =====================
export const fiscalPeriodsApi = {
    add: async (period: InsertType<FiscalYear>): Promise<FiscalYear | null> => {
        const newYear = await fiscalYearsService.create(period);
        if (newYear) {
            logger.info('Fiscal period added', { id: newYear.id });
        }
        return newYear;
    },

    update: async (id: string, period: UpdateType<FiscalYear>): Promise<FiscalYear | null> => {
        const updated = await fiscalYearsService.update(id, period);
        if (updated) {
            logger.info('Fiscal period updated', { id });
        }
        return updated;
    },

    delete: async (id: string): Promise<boolean> => {
        const success = await fiscalYearsService.delete(id);
        if (success) {
            logger.info('Fiscal period deleted', { id });
        }
        return success;
    }
};

// ===================== Exchange Rates =====================
export const exchangeRatesApi = {
    add: async (companyId: string, rate: {
        fromCurrency: string;
        toCurrency: string;
        rate: number;
        date: string;
    }): Promise<boolean> => {
        if (!isValidUUID(companyId)) {
            logger.warn('Cannot save exchange rate: Invalid Company ID', { companyId });
            return false;
        }

        try {
            await CurrencyService.setExchangeRate({
                company_id: companyId,
                from_currency: rate.fromCurrency,
                to_currency: rate.toCurrency,
                rate: rate.rate,
                valid_from: rate.date
            } as any);
            logger.info('Exchange rate saved to backend');
            return true;
        } catch (error) {
            logger.error('Failed to save exchange rate', error as Error);
            return false;
        }
    }
};

// ===================== Export =====================
export const settingsApiService = {
    loadCompany: loadCompanyFromSupabase,
    updateCompany: updateCompanyInSupabase,
    loadAllSettings,
    branches: branchesApi,
    fiscalPeriods: fiscalPeriodsApi,
    exchangeRates: exchangeRatesApi,
    isValidUUID
};

export default settingsApiService;
