/**
 * Message Templates - قوالب الرسائل
 * للاستخدام مع WhatsApp و Telegram
 */

import {
    InvoiceMessageData,
    PaymentMessageData,
    LowStockMessageData,
    DailyReportData
} from './types';

/**
 * قالب فاتورة جديدة
 */
export const invoiceCreatedTemplate = (data: InvoiceMessageData): string => `
🧾 *فاتورة جديدة* #${data.invoiceNumber}

👤 *العميل:* ${data.customerName}
💰 *المبلغ:* ${data.amount.toLocaleString()} ${data.currency}
📅 *التاريخ:* ${data.date}
${data.dueDate ? `⏰ *تاريخ الاستحقاق:* ${data.dueDate}` : ''}
${data.items ? `\n📦 *الأصناف:*\n${data.items}` : ''}

شكراً لتعاملكم معنا! 🙏
*الزهراء لقطع غيار السيارات* 🚗
`.trim();

/**
 * قالب تذكير بالدفع
 */
export const paymentReminderTemplate = (data: InvoiceMessageData): string => `
⏰ *تذكير بموعد الدفع*

📄 *فاتورة:* #${data.invoiceNumber}
👤 *العميل:* ${data.customerName}
💰 *المبلغ المستحق:* ${data.amount.toLocaleString()} ${data.currency}
📅 *تاريخ الاستحقاق:* ${data.dueDate || data.date}

يرجى السداد في أقرب وقت لتجنب أي رسوم إضافية.

*الزهراء لقطع غيار السيارات* 🚗
`.trim();

/**
 * قالب فاتورة متأخرة
 */
export const overdueInvoiceTemplate = (data: InvoiceMessageData): string => `
🔴 *فاتورة متأخرة السداد*

📄 *فاتورة:* #${data.invoiceNumber}
👤 *العميل:* ${data.customerName}
💰 *المبلغ المستحق:* ${data.amount.toLocaleString()} ${data.currency}
📅 *تاريخ الاستحقاق:* ${data.dueDate || data.date}

⚠️ هذه الفاتورة متأخرة عن موعد السداد.
يرجى التواصل معنا لترتيب الدفع.

*الزهراء لقطع غيار السيارات* 🚗
`.trim();

/**
 * قالب استلام دفعة
 */
export const paymentReceivedTemplate = (data: PaymentMessageData): string => `
✅ *تم استلام دفعة*

💰 *المبلغ:* ${data.amount.toLocaleString()} ${data.currency}
👤 *${data.partyType === 'customer' ? 'العميل' : 'المورد'}:* ${data.partyName}
${data.referenceNumber ? `🔢 *رقم المرجع:* ${data.referenceNumber}` : ''}
📅 *التاريخ:* ${data.date}

شكراً لكم! 🙏
*الزهراء لقطع غيار السيارات* 🚗
`.trim();

/**
 * قالب تنبيه مخزون منخفض
 */
export const lowStockAlertTemplate = (data: LowStockMessageData): string => `
⚠️ *تنبيه: مخزون منخفض*

📦 *الصنف:* ${data.itemName}
🔢 *رمز المنتج:* ${data.sku}
📉 *الكمية الحالية:* ${data.currentQuantity}
📊 *الحد الأدنى:* ${data.minQuantity}
${data.warehouseName ? `🏭 *المستودع:* ${data.warehouseName}` : ''}

يرجى إعادة الطلب في أقرب وقت.
`.trim();

/**
 * قالب التقرير اليومي
 */
export const dailyReportTemplate = (data: DailyReportData): string => `
📊 *التقرير اليومي* - ${data.date}

━━━━━━━━━━━━━━━━━━

💵 *المبيعات:* ${data.totalSales.toLocaleString()} ر.س
🛒 *المشتريات:* ${data.totalPurchases.toLocaleString()} ر.س
💸 *المصروفات:* ${data.totalExpenses.toLocaleString()} ر.س

━━━━━━━━━━━━━━━━━━

${data.netProfit >= 0 ? '📈' : '📉'} *صافي الربح:* ${data.netProfit.toLocaleString()} ر.س

━━━━━━━━━━━━━━━━━━

${data.lowStockCount > 0 ? `⚠️ *${data.lowStockCount} صنف* بمخزون منخفض` : '✅ المخزون جيد'}
${data.overdueInvoicesCount > 0 ? `🔴 *${data.overdueInvoicesCount} فاتورة* متأخرة` : '✅ لا فواتير متأخرة'}

*الزهراء لقطع غيار السيارات* 🚗
`.trim();

/**
 * الحصول على القالب المناسب
 */
export const getTemplate = (
    templateName: string,
    data: InvoiceMessageData | PaymentMessageData | LowStockMessageData | DailyReportData
): string => {
    switch (templateName) {
        case 'invoice_created':
            return invoiceCreatedTemplate(data as InvoiceMessageData);
        case 'payment_reminder':
            return paymentReminderTemplate(data as InvoiceMessageData);
        case 'payment_overdue':
            return overdueInvoiceTemplate(data as InvoiceMessageData);
        case 'payment_received':
            return paymentReceivedTemplate(data as PaymentMessageData);
        case 'low_stock_alert':
            return lowStockAlertTemplate(data as LowStockMessageData);
        case 'daily_report':
            return dailyReportTemplate(data as DailyReportData);
        default:
            return '';
    }
};
