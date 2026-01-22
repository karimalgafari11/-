/**
 * useWebhooksSettings Hook
 * Hook لإدارة Webhooks
 */

import { useCallback } from 'react';
import {
    AppSettingsExtended,
    Webhook,
    WebhookEvent
} from '../../../types/settings-extended';
import { logger } from '../../../lib/logger';

interface UseWebhooksSettingsProps {
    settings: AppSettingsExtended;
    setSettings: React.Dispatch<React.SetStateAction<AppSettingsExtended>>;
}

export const useWebhooksSettings = ({
    settings,
    setSettings
}: UseWebhooksSettingsProps) => {

    const webhooks = settings.webhooks.webhooks;

    const addWebhook = useCallback((webhook: Omit<Webhook, 'id' | 'createdAt' | 'successCount' | 'failureCount'>) => {
        const newWebhook: Webhook = {
            ...webhook,
            id: `wh_${Date.now()}`,
            successCount: 0,
            failureCount: 0,
            createdAt: new Date().toISOString()
        };
        setSettings(prev => ({
            ...prev,
            webhooks: {
                ...prev.webhooks,
                webhooks: [...prev.webhooks.webhooks, newWebhook]
            }
        }));
        logger.info('Webhook added', { webhookId: newWebhook.id, url: webhook.url });
    }, [setSettings]);

    const updateWebhook = useCallback((webhook: Webhook) => {
        setSettings(prev => ({
            ...prev,
            webhooks: {
                ...prev.webhooks,
                webhooks: prev.webhooks.webhooks.map(w =>
                    w.id === webhook.id ? { ...webhook, updatedAt: new Date().toISOString() } : w
                )
            }
        }));
    }, [setSettings]);

    const deleteWebhook = useCallback((id: string) => {
        setSettings(prev => ({
            ...prev,
            webhooks: {
                ...prev.webhooks,
                webhooks: prev.webhooks.webhooks.filter(w => w.id !== id)
            }
        }));
        logger.info('Webhook deleted', { webhookId: id });
    }, [setSettings]);

    const triggerWebhook = useCallback(async (event: WebhookEvent, data: any) => {
        const activeWebhooks = webhooks.filter(w => w.isActive && w.events.includes(event));

        for (const webhook of activeWebhooks) {
            try {
                const response = await fetch(webhook.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(webhook.secret && { 'X-Webhook-Secret': webhook.secret }),
                        ...webhook.headers
                    },
                    body: JSON.stringify({ event, data, timestamp: new Date().toISOString() })
                });

                updateWebhook({
                    ...webhook,
                    lastTriggered: new Date().toISOString(),
                    lastStatus: response.ok ? 'success' : 'failed',
                    successCount: response.ok ? webhook.successCount + 1 : webhook.successCount,
                    failureCount: !response.ok ? webhook.failureCount + 1 : webhook.failureCount
                });

                logger.info('Webhook triggered', { webhookId: webhook.id, event, success: response.ok });
            } catch (error) {
                updateWebhook({
                    ...webhook,
                    lastTriggered: new Date().toISOString(),
                    lastStatus: 'failed',
                    lastError: (error as Error).message,
                    failureCount: webhook.failureCount + 1
                });
                logger.error('Webhook failed', error as Error, { webhookId: webhook.id });
            }
        }
    }, [webhooks, updateWebhook]);

    const testWebhook = useCallback(async (id: string): Promise<boolean> => {
        const webhook = webhooks.find(w => w.id === id);
        if (!webhook) return false;

        try {
            const response = await fetch(webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(webhook.secret && { 'X-Webhook-Secret': webhook.secret }),
                    ...webhook.headers
                },
                body: JSON.stringify({
                    event: 'test',
                    data: { message: 'Test webhook from Alzhra' },
                    timestamp: new Date().toISOString()
                })
            });
            return response.ok;
        } catch {
            return false;
        }
    }, [webhooks]);

    return {
        webhooks,
        addWebhook,
        updateWebhook,
        deleteWebhook,
        triggerWebhook,
        testWebhook
    };
};
