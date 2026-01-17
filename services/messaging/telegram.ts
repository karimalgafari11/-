/**
 * Telegram Service - خدمة تيليجرام
 * تكامل مع Telegram Bot API
 */

import {
    TelegramConfig,
    SendResult,
    InvoiceMessageData,
    PaymentMessageData,
    LowStockMessageData,
    DailyReportData
} from './types';
import { getTemplate } from './templates';

class TelegramService {
    private config: TelegramConfig | null = null;
    private baseUrl = 'https://api.telegram.org/bot';

    /**
     * تهيئة الخدمة بالإعدادات
     */
    configure(config: TelegramConfig): void {
        this.config = config;
    }

    /**
     * التحقق من تكوين الخدمة
     */
    isConfigured(): boolean {
        return !!(this.config?.enabled && this.config?.botToken);
    }

    /**
     * الحصول على رابط API
     */
    private getApiUrl(method: string): string {
        return `${this.baseUrl}${this.config?.botToken}/${method}`;
    }

    /**
     * إرسال رسالة نصية
     */
    async sendMessage(chatId: string, message: string, parseMode: 'Markdown' | 'HTML' = 'Markdown'): Promise<SendResult> {
        if (!this.isConfigured()) {
            return {
                success: false,
                error: 'Telegram غير مُهيأ',
                channel: 'telegram',
                timestamp: new Date().toISOString()
            };
        }

        try {
            const response = await fetch(this.getApiUrl('sendMessage'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: parseMode
                })
            });

            const data = await response.json();

            if (data.ok) {
                return {
                    success: true,
                    messageId: data.result?.message_id?.toString(),
                    channel: 'telegram',
                    timestamp: new Date().toISOString()
                };
            } else {
                return {
                    success: false,
                    error: data.description || 'فشل في إرسال الرسالة',
                    channel: 'telegram',
                    timestamp: new Date().toISOString()
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ غير معروف',
                channel: 'telegram',
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * إرسال رسالة لجميع المسؤولين
     */
    async broadcastToAdmins(message: string): Promise<SendResult[]> {
        if (!this.config?.adminChatIds?.length) {
            return [{
                success: false,
                error: 'لا يوجد مسؤولين مُسجلين',
                channel: 'telegram',
                timestamp: new Date().toISOString()
            }];
        }

        const results: SendResult[] = [];
        for (const chatId of this.config.adminChatIds) {
            const result = await this.sendMessage(chatId, message);
            results.push(result);
        }
        return results;
    }

    /**
     * إرسال مستند/ملف
     */
    async sendDocument(
        chatId: string,
        documentUrl: string,
        caption?: string
    ): Promise<SendResult> {
        if (!this.isConfigured()) {
            return {
                success: false,
                error: 'Telegram غير مُهيأ',
                channel: 'telegram',
                timestamp: new Date().toISOString()
            };
        }

        try {
            const response = await fetch(this.getApiUrl('sendDocument'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    document: documentUrl,
                    caption,
                    parse_mode: 'Markdown'
                })
            });

            const data = await response.json();

            return {
                success: data.ok,
                messageId: data.result?.message_id?.toString(),
                error: !data.ok ? data.description : undefined,
                channel: 'telegram',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ غير معروف',
                channel: 'telegram',
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * إرسال صورة
     */
    async sendPhoto(
        chatId: string,
        photoUrl: string,
        caption?: string
    ): Promise<SendResult> {
        if (!this.isConfigured()) {
            return {
                success: false,
                error: 'Telegram غير مُهيأ',
                channel: 'telegram',
                timestamp: new Date().toISOString()
            };
        }

        try {
            const response = await fetch(this.getApiUrl('sendPhoto'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    photo: photoUrl,
                    caption,
                    parse_mode: 'Markdown'
                })
            });

            const data = await response.json();

            return {
                success: data.ok,
                messageId: data.result?.message_id?.toString(),
                error: !data.ok ? data.description : undefined,
                channel: 'telegram',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ غير معروف',
                channel: 'telegram',
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * إرسال إشعار فاتورة جديدة
     */
    async notifyInvoiceCreated(data: InvoiceMessageData): Promise<SendResult[]> {
        if (!this.config?.notifications.onSale) return [];
        const message = getTemplate('invoice_created', data);
        return this.broadcastToAdmins(message);
    }

    /**
     * إرسال تنبيه مخزون منخفض
     */
    async notifyLowStock(data: LowStockMessageData): Promise<SendResult[]> {
        if (!this.config?.notifications.onLowStock) return [];
        const message = getTemplate('low_stock_alert', data);
        return this.broadcastToAdmins(message);
    }

    /**
     * إرسال إشعار استلام دفعة
     */
    async notifyPaymentReceived(data: PaymentMessageData): Promise<SendResult[]> {
        if (!this.config?.notifications.onPayment) return [];
        const message = getTemplate('payment_received', data);
        return this.broadcastToAdmins(message);
    }

    /**
     * إرسال التقرير اليومي
     */
    async sendDailyReport(data: DailyReportData): Promise<SendResult[]> {
        if (!this.config?.notifications.dailyReport) return [];
        const message = getTemplate('daily_report', data);
        return this.broadcastToAdmins(message);
    }

    /**
     * الحصول على معلومات البوت
     */
    async getBotInfo(): Promise<{ ok: boolean; username?: string; name?: string }> {
        if (!this.isConfigured()) {
            return { ok: false };
        }

        try {
            const response = await fetch(this.getApiUrl('getMe'));
            const data = await response.json();

            if (data.ok) {
                return {
                    ok: true,
                    username: data.result?.username,
                    name: data.result?.first_name
                };
            }
            return { ok: false };
        } catch {
            return { ok: false };
        }
    }

    /**
     * اختبار الاتصال
     */
    async testConnection(): Promise<boolean> {
        const info = await this.getBotInfo();
        return info.ok;
    }

    /**
     * إعداد Webhook (اختياري - للاستقبال)
     */
    async setWebhook(url: string): Promise<boolean> {
        if (!this.isConfigured()) return false;

        try {
            const response = await fetch(this.getApiUrl('setWebhook'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            const data = await response.json();
            return data.ok;
        } catch {
            return false;
        }
    }
}

export const telegramService = new TelegramService();
