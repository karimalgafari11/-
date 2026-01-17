/**
 * WhatsApp Service - خدمة واتساب
 * تكامل مع WhatsApp Cloud API
 */

import {
    WhatsAppConfig,
    SendResult,
    MessageAttachment,
    InvoiceMessageData,
    PaymentMessageData,
    LowStockMessageData
} from './types';
import { getTemplate } from './templates';

class WhatsAppService {
    private config: WhatsAppConfig | null = null;
    private baseUrl = 'https://graph.facebook.com';

    /**
     * تهيئة الخدمة بالإعدادات
     */
    configure(config: WhatsAppConfig): void {
        this.config = config;
    }

    /**
     * التحقق من تكوين الخدمة
     */
    isConfigured(): boolean {
        return !!(
            this.config?.enabled &&
            this.config?.phoneNumberId &&
            this.config?.accessToken
        );
    }

    /**
     * الحصول على رابط API
     */
    private getApiUrl(): string {
        const version = this.config?.apiVersion || 'v18.0';
        return `${this.baseUrl}/${version}/${this.config?.phoneNumberId}/messages`;
    }

    /**
     * إرسال رسالة نصية
     */
    async sendTextMessage(to: string, message: string): Promise<SendResult> {
        const config = this.config;
        if (!config || !config.enabled || !config.accessToken) {
            return {
                success: false,
                error: 'WhatsApp غير مُهيأ',
                channel: 'whatsapp',
                timestamp: new Date().toISOString()
            };
        }

        try {
            const response = await fetch(this.getApiUrl(), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: this.formatPhoneNumber(to),
                    type: 'text',
                    text: { body: message }
                })
            });

            const data = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    messageId: data.messages?.[0]?.id,
                    channel: 'whatsapp',
                    timestamp: new Date().toISOString()
                };
            } else {
                return {
                    success: false,
                    error: data.error?.message || 'فشل في إرسال الرسالة',
                    channel: 'whatsapp',
                    timestamp: new Date().toISOString()
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ غير معروف',
                channel: 'whatsapp',
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * إرسال رسالة قالب
     */
    async sendTemplateMessage(
        to: string,
        templateName: string,
        components: Record<string, string>[]
    ): Promise<SendResult> {
        const config = this.config;
        if (!config || !config.enabled || !config.accessToken) {
            return {
                success: false,
                error: 'WhatsApp غير مُهيأ',
                channel: 'whatsapp',
                timestamp: new Date().toISOString()
            };
        }

        try {
            const response = await fetch(this.getApiUrl(), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: this.formatPhoneNumber(to),
                    type: 'template',
                    template: {
                        name: templateName,
                        language: { code: 'ar' },
                        components
                    }
                })
            });

            const data = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    messageId: data.messages?.[0]?.id,
                    channel: 'whatsapp',
                    timestamp: new Date().toISOString()
                };
            } else {
                return {
                    success: false,
                    error: data.error?.message || 'فشل في إرسال القالب',
                    channel: 'whatsapp',
                    timestamp: new Date().toISOString()
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ غير معروف',
                channel: 'whatsapp',
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * إرسال مستند (PDF)
     */
    async sendDocument(
        to: string,
        documentUrl: string,
        filename: string,
        caption?: string
    ): Promise<SendResult> {
        const config = this.config;
        if (!config || !config.enabled || !config.accessToken) {
            return {
                success: false,
                error: 'WhatsApp غير مُهيأ',
                channel: 'whatsapp',
                timestamp: new Date().toISOString()
            };
        }

        try {
            const response = await fetch(this.getApiUrl(), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: this.formatPhoneNumber(to),
                    type: 'document',
                    document: {
                        link: documentUrl,
                        filename,
                        caption
                    }
                })
            });

            const data = await response.json();

            return {
                success: response.ok,
                messageId: data.messages?.[0]?.id,
                error: !response.ok ? data.error?.message : undefined,
                channel: 'whatsapp',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ غير معروف',
                channel: 'whatsapp',
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * إرسال إشعار فاتورة
     */
    async sendInvoiceNotification(
        to: string,
        data: InvoiceMessageData
    ): Promise<SendResult> {
        const message = getTemplate('invoice_created', data);
        return this.sendTextMessage(to, message);
    }

    /**
     * إرسال تذكير دفع
     */
    async sendPaymentReminder(
        to: string,
        data: InvoiceMessageData
    ): Promise<SendResult> {
        const message = getTemplate('payment_reminder', data);
        return this.sendTextMessage(to, message);
    }

    /**
     * إرسال إشعار استلام دفعة
     */
    async sendPaymentReceived(
        to: string,
        data: PaymentMessageData
    ): Promise<SendResult> {
        const message = getTemplate('payment_received', data);
        return this.sendTextMessage(to, message);
    }

    /**
     * تنسيق رقم الهاتف
     */
    private formatPhoneNumber(phone: string): string {
        // إزالة المسافات والشرطات
        let cleaned = phone.replace(/[\s-]/g, '');

        // إضافة رمز الدولة إذا لم يكن موجوداً
        if (cleaned.startsWith('0')) {
            cleaned = '966' + cleaned.substring(1); // السعودية افتراضياً
        } else if (!cleaned.startsWith('+') && !cleaned.startsWith('966')) {
            cleaned = '966' + cleaned;
        }

        // إزالة علامة + إذا وجدت
        return cleaned.replace('+', '');
    }

    /**
     * اختبار الاتصال
     */
    async testConnection(): Promise<boolean> {
        if (!this.isConfigured()) return false;

        try {
            const response = await fetch(
                `${this.baseUrl}/${this.config?.apiVersion || 'v18.0'}/${this.config?.phoneNumberId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.config!.accessToken}`
                    }
                }
            );
            return response.ok;
        } catch {
            return false;
        }
    }
}

export const whatsappService = new WhatsAppService();
