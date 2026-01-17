/**
 * Messaging Types - أنواع خدمات المراسلة
 * WhatsApp & Telegram Integration
 */

// ===== أنواع القنوات =====
export type MessagingChannel = 'whatsapp' | 'telegram' | 'both';

// ===== قوالب الرسائل =====
export type MessageTemplate =
    | 'invoice_created'
    | 'invoice_sent'
    | 'payment_reminder'
    | 'payment_received'
    | 'payment_overdue'
    | 'low_stock_alert'
    | 'order_confirmed'
    | 'daily_report'
    | 'custom';

// ===== حالة الرسالة =====
export type MessageStatus =
    | 'pending'
    | 'sent'
    | 'delivered'
    | 'read'
    | 'failed';

// ===== واجهة الرسالة =====
export interface Message {
    id: string;
    channel: MessagingChannel;
    template: MessageTemplate;
    recipient: string;
    recipientName?: string;
    content: string;
    data?: Record<string, string | number>;
    attachments?: MessageAttachment[];
    status: MessageStatus;
    error?: string;
    sentAt?: string;
    deliveredAt?: string;
    readAt?: string;
    createdAt: string;
}

// ===== المرفقات =====
export interface MessageAttachment {
    type: 'image' | 'document' | 'pdf' | 'audio';
    url?: string;
    base64?: string;
    filename: string;
    caption?: string;
}

// ===== إعدادات WhatsApp =====
export interface WhatsAppConfig {
    enabled: boolean;
    phoneNumberId: string;
    businessAccountId: string;
    accessToken: string;
    webhookVerifyToken: string;
    apiVersion: string;
    templates: {
        invoiceCreated?: string;
        paymentReminder?: string;
        paymentReceived?: string;
        lowStockAlert?: string;
    };
}

// ===== إعدادات Telegram =====
export interface TelegramConfig {
    enabled: boolean;
    botToken: string;
    botUsername?: string;
    defaultChatId?: string;
    adminChatIds: string[];
    notifications: {
        onSale: boolean;
        onPurchase: boolean;
        onLowStock: boolean;
        onPayment: boolean;
        dailyReport: boolean;
        dailyReportTime?: string;
    };
}

// ===== إعدادات المراسلة الشاملة =====
export interface MessagingSettings {
    defaultChannel: MessagingChannel;
    whatsapp: WhatsAppConfig;
    telegram: TelegramConfig;
    autoSendInvoice: boolean;
    autoSendReminder: boolean;
    reminderDaysBefore: number;
}

// ===== بيانات قوالب الرسائل =====
export interface InvoiceMessageData {
    invoiceNumber: string;
    customerName: string;
    amount: number;
    currency: string;
    date: string;
    dueDate?: string;
    items?: string;
}

export interface PaymentMessageData {
    amount: number;
    currency: string;
    partyName: string;
    partyType: 'customer' | 'supplier';
    referenceNumber?: string;
    date: string;
}

export interface LowStockMessageData {
    itemName: string;
    sku: string;
    currentQuantity: number;
    minQuantity: number;
    warehouseName?: string;
}

export interface DailyReportData {
    date: string;
    totalSales: number;
    totalPurchases: number;
    totalExpenses: number;
    netProfit: number;
    lowStockCount: number;
    overdueInvoicesCount: number;
}

// ===== نتيجة الإرسال =====
export interface SendResult {
    success: boolean;
    messageId?: string;
    error?: string;
    channel: MessagingChannel;
    timestamp: string;
}

// ===== الإعدادات الافتراضية =====
export const defaultWhatsAppConfig: WhatsAppConfig = {
    enabled: false,
    phoneNumberId: '',
    businessAccountId: '',
    accessToken: '',
    webhookVerifyToken: '',
    apiVersion: 'v18.0',
    templates: {}
};

export const defaultTelegramConfig: TelegramConfig = {
    enabled: false,
    botToken: '',
    adminChatIds: [],
    notifications: {
        onSale: true,
        onPurchase: true,
        onLowStock: true,
        onPayment: true,
        dailyReport: false
    }
};

export const defaultMessagingSettings: MessagingSettings = {
    defaultChannel: 'telegram',
    whatsapp: defaultWhatsAppConfig,
    telegram: defaultTelegramConfig,
    autoSendInvoice: false,
    autoSendReminder: false,
    reminderDaysBefore: 3
};
