/**
 * Activity Log Types - أنواع سجل النشاطات
 * تتبع جميع العمليات في النظام
 */

// نوع الكيان/البيان
export type EntityType =
    | 'sale'
    | 'purchase'
    | 'product'
    | 'customer'
    | 'supplier'
    | 'expense'
    | 'voucher'
    | 'journal_entry'
    | 'account'
    | 'user'
    | 'branch'
    | 'organization'
    | 'settings'
    | 'inventory_adjustment';

// نوع العملية
export type ActionType =
    | 'create'
    | 'update'
    | 'delete'
    | 'view'
    | 'export'
    | 'import'
    | 'approve'
    | 'void'
    | 'login'
    | 'logout'
    | 'sync'
    | 'payment'
    | 'post';

// سجل النشاط
export interface ActivityLog {
    id: string;

    // معلومات العملية
    action: ActionType;
    entityType: EntityType;
    entityId: string;
    entityName?: string;       // اسم معروض (مثل: رقم الفاتورة)

    // معلومات المستخدم
    userId: string;
    userName: string;
    userRole?: string;

    // معلومات المنظمة والفرع
    organizationId: string;
    branchId: string;
    branchName?: string;

    // البيانات
    oldData?: Record<string, unknown>;
    newData?: Record<string, unknown>;
    changes?: ActivityChange[];

    // معلومات الوقت
    createdAt: string;         // وقت العملية المحلي
    syncedAt?: string;         // وقت المزامنة (إن وجد)

    // معلومات تقنية
    ipAddress?: string;
    userAgent?: string;
    isOffline: boolean;        // هل تمت العملية بدون اتصال
}

// تغيير محدد في حقل
export interface ActivityChange {
    field: string;
    fieldLabel?: string;       // اسم الحقل المعروض
    oldValue: unknown;
    newValue: unknown;
}

// فلتر سجل النشاطات
export interface ActivityLogFilter {
    startDate?: string;
    endDate?: string;
    userId?: string;
    branchId?: string;
    entityType?: EntityType;
    action?: ActionType;
    searchQuery?: string;
}

// ملخص نشاط اليوم
export interface DailyActivitySummary {
    date: string;
    totalActions: number;
    byAction: Record<ActionType, number>;
    byEntity: Record<EntityType, number>;
    byUser: { userId: string; userName: string; count: number }[];
}
