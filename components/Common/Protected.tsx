/**
 * Protected Component - مكون الحماية بالصلاحيات
 * لإخفاء/إظهار العناصر حسب صلاحيات المستخدم
 */

import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionModule, PermissionAction } from '../../types/permissions';

interface ProtectedProps {
    /** الوحدة المطلوب التحقق منها */
    module: PermissionModule;

    /** الإجراء المطلوب (فردي) */
    action?: PermissionAction;

    /** الإجراءات المطلوبة (أي واحدة منها) */
    anyAction?: PermissionAction[];

    /** الإجراءات المطلوبة (جميعها) */
    allActions?: PermissionAction[];

    /** المحتوى عند وجود الصلاحية */
    children: React.ReactNode;

    /** المحتوى البديل عند عدم وجود الصلاحية */
    fallback?: React.ReactNode;

    /** إظهار عنصر معطل بدلاً من الإخفاء */
    showDisabled?: boolean;
}

/**
 * مكون لحماية المحتوى حسب الصلاحيات
 * 
 * @example
 * // إخفاء زر الإضافة لغير المصرح لهم
 * <Protected module="sales" action="create">
 *   <Button>إضافة فاتورة</Button>
 * </Protected>
 * 
 * @example
 * // إخفاء مع رسالة بديلة
 * <Protected module="reports" action="export" fallback={<span>غير مصرح</span>}>
 *   <Button>تصدير</Button>
 * </Protected>
 */
export const Protected: React.FC<ProtectedProps> = ({
    module,
    action,
    anyAction,
    allActions,
    children,
    fallback = null,
    showDisabled = false
}) => {
    const { can, canAny, canAll } = usePermissions();

    let hasPermission = false;

    if (action) {
        // التحقق من صلاحية واحدة
        hasPermission = can(module, action);
    } else if (anyAction && anyAction.length > 0) {
        // التحقق من أي صلاحية
        hasPermission = canAny(module, anyAction);
    } else if (allActions && allActions.length > 0) {
        // التحقق من جميع الصلاحيات
        hasPermission = canAll(module, allActions);
    } else {
        // افتراضياً التحقق من صلاحية العرض
        hasPermission = can(module, 'view');
    }

    if (hasPermission) {
        return <>{children}</>;
    }

    if (showDisabled && React.isValidElement(children)) {
        // إرجاع نسخة معطلة من العنصر
        const childElement = children as React.ReactElement<{ disabled?: boolean; className?: string }>;
        return React.cloneElement(childElement, {
            disabled: true,
            className: `${childElement.props.className || ''} opacity-50 cursor-not-allowed`
        });
    }

    return <>{fallback}</>;
};

/**
 * مكون للتحقق من أن المستخدم مدير
 */
export const ManagerOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
    children,
    fallback = null
}) => {
    const { isManager } = usePermissions();
    return isManager ? <>{children}</> : <>{fallback}</>;
};

/**
 * مكون للتحقق من أن المستخدم محاسب أو مدير
 */
export const AccountantOrAbove: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
    children,
    fallback = null
}) => {
    const { isManager, isAccountant } = usePermissions();
    return (isManager || isAccountant) ? <>{children}</> : <>{fallback}</>;
};

export default Protected;
