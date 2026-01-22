/**
 * Activity Logger Service
 * خدمة تسجيل النشاطات
 * مسؤولة عن تسجيل جميع العمليات في النظام
 */

import {
    ActivityLog,
    ActivityChange,
    EntityType,
    ActionType
} from '../types/activityLog';


// متغيرات محلية في الذاكرة (ليست localStorage)
let activityLogs: ActivityLog[] = [];
const MAX_LOCAL_LOGS = 1000; // الحد الأقصى للسجلات

/**
 * توليد معرف فريد
 */
const generateId = (): string => {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * حساب التغييرات بين بيانين
 */
const calculateChanges = (
    oldData: Record<string, unknown> | undefined,
    newData: Record<string, unknown> | undefined
): ActivityChange[] => {
    if (!oldData || !newData) return [];

    const changes: ActivityChange[] = [];
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    for (const key of allKeys) {
        const oldValue = oldData[key];
        const newValue = newData[key];

        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            changes.push({
                field: key,
                oldValue,
                newValue
            });
        }
    }

    return changes;
};

/**
 * خدمة تسجيل النشاطات
 */
export const ActivityLogger = {
    /**
     * تسجيل نشاط جديد
     */
    log: (params: {
        action: ActionType;
        entityType: EntityType;
        entityId: string;
        entityName?: string;
        userId: string;
        userName: string;
        userRole?: string;
        organizationId: string;
        branchId: string;
        branchName?: string;
        oldData?: Record<string, unknown>;
        newData?: Record<string, unknown>;
    }): ActivityLog => {
        const { oldData, newData, ...rest } = params;

        const log: ActivityLog = {
            id: generateId(),
            ...rest,
            oldData,
            newData,
            changes: calculateChanges(oldData, newData),
            createdAt: new Date().toISOString(),
            isOffline: !navigator.onLine
        };

        // حفظ في الذاكرة
        activityLogs.unshift(log);

        // الحفاظ على الحد الأقصى
        if (activityLogs.length > MAX_LOCAL_LOGS) {
            activityLogs.splice(MAX_LOCAL_LOGS);
        }

        return log;
    },

    /**
     * الحصول على جميع السجلات
     */
    getAll: (): ActivityLog[] => {
        return activityLogs;
    },

    /**
     * الحصول على سجلات مفلترة
     */
    getFiltered: (filter: {
        startDate?: string;
        endDate?: string;
        userId?: string;
        branchId?: string;
        entityType?: EntityType;
        action?: ActionType;
        searchQuery?: string;
    }): ActivityLog[] => {
        let logs = ActivityLogger.getAll();

        if (filter.startDate) {
            logs = logs.filter(l => l.createdAt >= filter.startDate!);
        }

        if (filter.endDate) {
            logs = logs.filter(l => l.createdAt <= filter.endDate!);
        }

        if (filter.userId) {
            logs = logs.filter(l => l.userId === filter.userId);
        }

        if (filter.branchId) {
            logs = logs.filter(l => l.branchId === filter.branchId);
        }

        if (filter.entityType) {
            logs = logs.filter(l => l.entityType === filter.entityType);
        }

        if (filter.action) {
            logs = logs.filter(l => l.action === filter.action);
        }

        if (filter.searchQuery) {
            const query = filter.searchQuery.toLowerCase();
            logs = logs.filter(l =>
                l.entityName?.toLowerCase().includes(query) ||
                l.userName.toLowerCase().includes(query) ||
                l.branchName?.toLowerCase().includes(query)
            );
        }

        return logs;
    },

    /**
     * الحصول على السجلات غير المزامنة
     */
    getUnsynced: (): ActivityLog[] => {
        return ActivityLogger.getAll().filter(l => !l.syncedAt);
    },

    /**
     * تحديث حالة المزامنة
     */
    markAsSynced: (ids: string[]): void => {
        const now = new Date().toISOString();

        activityLogs.forEach(log => {
            if (ids.includes(log.id)) {
                log.syncedAt = now;
            }
        });
    },

    /**
     * مسح السجلات القديمة المزامنة
     */
    cleanOldSynced: (daysToKeep: number = 30): number => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const cutoffStr = cutoffDate.toISOString();

        const originalLength = activityLogs.length;
        activityLogs = activityLogs.filter(l =>
            !l.syncedAt || l.createdAt > cutoffStr
        );

        return originalLength - activityLogs.length;
    }
};
