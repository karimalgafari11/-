/**
 * Messaging Services - نقطة الدخول الرئيسية
 * تصدير جميع خدمات المراسلة
 */

// Types
export * from './types';

// Templates
export * from './templates';

// Services
export { whatsappService } from './whatsapp';
export { telegramService } from './telegram';

// Unified Messaging Interface
import { whatsappService } from './whatsapp';
import { telegramService } from './telegram';
import {
    MessagingSettings,
    SendResult,
    InvoiceMessageData,
    PaymentMessageData,
    LowStockMessageData,
    DailyReportData,
    defaultMessagingSettings
} from './types';
import { SafeStorage } from '../../utils/storage';

class MessagingManager {
    private settings: MessagingSettings;

    constructor() {
        this.settings = SafeStorage.get('alzhra_messaging', defaultMessagingSettings);
        this.initialize();
    }

    /**
     * تحميل وتهيئة الخدمات
     */
    private initialize(): void {
        if (this.settings.whatsapp.enabled) {
            whatsappService.configure(this.settings.whatsapp);
        }
        if (this.settings.telegram.enabled) {
            telegramService.configure(this.settings.telegram);
        }
    }

    /**
     * تحديث الإعدادات
     */
    updateSettings(settings: Partial<MessagingSettings>): void {
        this.settings = { ...this.settings, ...settings };
        SafeStorage.set('alzhra_messaging', this.settings);
        this.initialize();
    }

    /**
     * الحصول على الإعدادات الحالية
     */
    getSettings(): MessagingSettings {
        return this.settings;
    }

    /**
     * إرسال إشعار فاتورة جديدة
     */
    async notifyInvoiceCreated(
        customerPhone: string,
        data: InvoiceMessageData
    ): Promise<SendResult[]> {
        const results: SendResult[] = [];

        // إرسال عبر WhatsApp إذا كان مُفعلاً
        if (this.settings.whatsapp.enabled && customerPhone) {
            const result = await whatsappService.sendInvoiceNotification(customerPhone, data);
            results.push(result);
        }

        // إرسال عبر Telegram للمسؤولين
        if (this.settings.telegram.enabled) {
            const telegramResults = await telegramService.notifyInvoiceCreated(data);
            results.push(...telegramResults);
        }

        return results;
    }

    /**
     * إرسال تذكير دفع
     */
    async sendPaymentReminder(
        customerPhone: string,
        data: InvoiceMessageData
    ): Promise<SendResult[]> {
        const results: SendResult[] = [];

        if (this.settings.whatsapp.enabled && customerPhone) {
            const result = await whatsappService.sendPaymentReminder(customerPhone, data);
            results.push(result);
        }

        return results;
    }

    /**
     * إرسال إشعار استلام دفعة
     */
    async notifyPayment(
        partyPhone: string,
        data: PaymentMessageData
    ): Promise<SendResult[]> {
        const results: SendResult[] = [];

        if (this.settings.whatsapp.enabled && partyPhone) {
            const result = await whatsappService.sendPaymentReceived(partyPhone, data);
            results.push(result);
        }

        if (this.settings.telegram.enabled) {
            const telegramResults = await telegramService.notifyPaymentReceived(data);
            results.push(...telegramResults);
        }

        return results;
    }

    /**
     * إرسال تنبيه مخزون منخفض
     */
    async notifyLowStock(data: LowStockMessageData): Promise<SendResult[]> {
        if (!this.settings.telegram.enabled) return [];
        return telegramService.notifyLowStock(data);
    }

    /**
     * إرسال التقرير اليومي
     */
    async sendDailyReport(data: DailyReportData): Promise<SendResult[]> {
        if (!this.settings.telegram.enabled) return [];
        return telegramService.sendDailyReport(data);
    }

    /**
     * اختبار اتصال WhatsApp
     */
    async testWhatsApp(): Promise<boolean> {
        return whatsappService.testConnection();
    }

    /**
     * اختبار اتصال Telegram
     */
    async testTelegram(): Promise<boolean> {
        return telegramService.testConnection();
    }

    /**
     * الحصول على معلومات بوت Telegram
     */
    async getTelegramBotInfo() {
        return telegramService.getBotInfo();
    }
}

export const messagingManager = new MessagingManager();
