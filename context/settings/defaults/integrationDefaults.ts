/**
 * Integration Defaults - القيم الافتراضية للتكاملات
 */

import { IntegrationSettings } from '../../../types/settings-extended';

export const getDefaultIntegrations = (): IntegrationSettings => ({
    whatsapp: {
        enabled: false,
        provider: 'twilio',
        notifyOnSale: false,
        notifyOnPurchase: false,
        sendInvoice: false,
        sendPaymentReminder: false
    },
    telegram: {
        enabled: false,
        notifyOnSale: false,
        notifyOnPurchase: false,
        notifyOnLowStock: false,
        notifyOnPayment: false,
        dailyReport: false,
        weeklyReport: false
    },
    email: {
        enabled: false,
        provider: 'smtp',
        smtpSecure: true,
        fromEmail: '',
        fromName: '',
        sendInvoices: true,
        sendReports: false,
        sendStatements: false,
        sendReminders: false,
        headerColor: '#2563eb'
    }
});
