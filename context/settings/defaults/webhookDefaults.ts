/**
 * Webhook Defaults - القيم الافتراضية للـ Webhooks
 */

import { WebhookSettings } from '../../../types/settings-extended';

export const getDefaultWebhookSettings = (): WebhookSettings => ({
    webhooks: [],
    logs: [],
    retryPolicy: {
        maxRetries: 3,
        retryDelay: 60,
        exponentialBackoff: true
    },
    logging: true,
    logRetention: 30
});
