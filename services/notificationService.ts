/**
 * Notification Service - خدمة التنبيهات
 * التعامل مع إشعارات المستخدمين
 */

import { supabase } from '../lib/supabaseClient';
import type { Notification, InsertType, UpdateType } from '../types/supabase-types';

export const NotificationService = {
    /**
     * جلب التنبيهات الخاصة بالمستخدم الحالي
     */
    async getUserNotifications(limit: number = 20): Promise<Notification[]> {
        const { data, error } = await (supabase as any)
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    },

    /**
     * جلب عدد التنبيهات غير المقروءة
     */
    async getUnreadCount(): Promise<number> {
        const { count, error } = await (supabase as any)
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false);

        if (error) throw error;
        return count || 0;
    },

    /**
     * تحديث حالة التنبيه إلى مقروء
     */
    async markAsRead(id: string): Promise<void> {
        const { error } = await (supabase as any)
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * تحديث جميع التنبيهات إلى مقروءة
     */
    async markAllAsRead(): Promise<void> {
        // نستخدم المستخدم الحالي تلقائياً بسبب سياسات RLS
        // لكن نحتاج للتأكد من أن التحديث يتم فقط لتنبيهات المستخدم
        const { data: { user } } = await (supabase as any).auth.getUser();
        if (!user) return;

        const { error } = await (supabase as any)
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        if (error) throw error;
    },

    /**
     * إنشاء تنبيه جديد (للنظام)
     */
    async createNotification(notification: InsertType<Notification>): Promise<Notification> {
        const { data, error } = await (supabase as any)
            .from('notifications')
            .insert(notification)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * حذف تنبيه
     */
    async deleteNotification(id: string): Promise<void> {
        const { error } = await (supabase as any)
            .from('notifications')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
