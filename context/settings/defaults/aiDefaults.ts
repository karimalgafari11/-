/**
 * AI Defaults - القيم الافتراضية للذكاء الاصطناعي
 */

import { AISettings } from '../../../types/settings-extended';

export const getDefaultAISettings = (): AISettings => ({
    enabled: false,
    provider: 'gemini',
    maxTokens: 2048,
    temperature: 0.7,
    language: 'ar',
    features: {
        chatAssistant: true,
        invoiceAnalysis: false,
        reportGeneration: false,
        suggestions: true,
        dataInsights: false,
        autoDescription: false,
        priceAnalysis: false
    },
    currentUsage: 0
});
