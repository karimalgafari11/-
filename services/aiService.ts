
import { GoogleGenAI } from "@google/genai";
import { FinancialEntry } from '../types';
import { logger } from '../lib/logger';

// أنواع محددة للإحصائيات المالية
export interface FinancialStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  cashFlow: number;
}

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;

// التحقق من صحة المفتاح
const isValidApiKey = (key: string | undefined): boolean => {
  return !!key && key !== 'PLACEHOLDER_API_KEY' && key.length > 10;
};

let ai: GoogleGenAI | null = null;

if (isValidApiKey(API_KEY)) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
  logger.info('Gemini AI service initialized successfully');
} else {
  logger.warn('⚠️ Gemini API key is not configured. AI features will be disabled.');
}

export const analyzeFinancialData = async (
  stats: FinancialStats,
  transactions: FinancialEntry[]
): Promise<string> => {
  if (!ai) {
    return "ميزة الذكاء الاصطناعي غير متاحة حالياً. يرجى التواصل مع المسؤول لتفعيل المفتاح.";
  }

  try {
    const prompt = `
      Analyze the following financial data for a business dashboard:
      Stats: ${JSON.stringify(stats)}
      Recent Transactions: ${JSON.stringify(transactions.slice(0, 10))}
      
      Provide a concise financial insight in Arabic (max 3 sentences). 
      Identify one potential risk and one opportunity. 
      Format: "Insight text... [Risk: ...] [Opportunity: ...]"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      },
    });

    logger.info('AI analysis completed successfully');
    return response.text || 'تم التحليل بنجاح.';
  } catch (error) {
    logger.error("AI Analysis failed", error as Error, {
      statsProvided: !!stats,
      transactionCount: transactions.length
    });

    // رسائل خطأ أكثر تفصيلاً
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return "خطأ في مفتاح API. يرجى التحقق من الإعدادات.";
      }
      if (error.message.includes('quota')) {
        return "تم تجاوز حد الاستخدام. يرجى المحاولة لاحقاً.";
      }
    }

    return "لا يمكن حالياً تحليل البيانات. يرجى مراجعة التقارير اليدوية.";
  }
};

export const startFinancialChat = (systemInstruction: string) => {
  if (!ai) {
    throw new Error('AI service is not available. Please configure a valid API key.');
  }

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: systemInstruction,
    },
  });
};

/**
 * التحقق من توفر خدمة الذكاء الاصطناعي
 */
export const isAIAvailable = (): boolean => {
  return ai !== null;
};
