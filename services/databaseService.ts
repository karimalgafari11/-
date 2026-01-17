/**
 * Database Service - خدمة قاعدة البيانات
 * طبقة تجريد للتعامل مع Supabase
 * تدعم العمل بدون اتصال مع المزامنة التلقائية
 */

import { supabase } from '../lib/supabaseClient';
import { companyService } from './companyService';
import { SyncService } from './syncService';
import { ActivityLogger } from './activityLogger';
import { SafeStorage } from '../utils/storage';

// التحقق من تكوين Supabase
const isSupabaseConfigured = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return !!(url && key && url.includes('supabase.co'));
};

const getSupabaseClient = () => isSupabaseConfigured() ? supabase : null;

// أنواع العمليات
type Operation = 'select' | 'insert' | 'update' | 'delete';

// واجهة النتيجة
interface DatabaseResult<T> {
    data: T | null;
    error: string | null;
    isOffline: boolean;
}

/**
 * خدمة قاعدة البيانات
 * تتعامل مع الـ localStorage محلياً وتزامن مع Supabase عند الاتصال
 */
export const DatabaseService = {
    /**
     * جلب البيانات
     */
    async select<T>(
        table: string,
        options?: {
            filter?: Record<string, unknown>;
            orderBy?: string;
            limit?: number;
        }
    ): Promise<DatabaseResult<T[]>> {
        const localKey = `alzhra_${table}`;
        const localData = SafeStorage.get<T[]>(localKey, []);

        // إذا كان Supabase متصلاً، جلب البيانات منه
        if (isSupabaseConfigured() && navigator.onLine) {
            const client = getSupabaseClient();
            if (client) {
                try {
                    let query = client.from(table).select('*');

                    if (options?.filter) {
                        Object.entries(options.filter).forEach(([key, value]) => {
                            query = query.eq(key, value);
                        });
                    }

                    if (options?.orderBy) {
                        const [column, direction] = options.orderBy.split(' ');
                        query = query.order(column, { ascending: direction !== 'desc' });
                    }

                    if (options?.limit) {
                        query = query.limit(options.limit);
                    }

                    const { data, error } = await query;

                    if (!error && data) {
                        // تحديث التخزين المحلي فقط إذا نجح الجلب
                        SafeStorage.set(localKey, data);
                        return { data: data as T[], error: null, isOffline: false };
                    } else if (error) {
                        console.error(`Supabase error fetching ${table}:`, error);
                    }
                } catch (err) {
                    console.error(`Error fetching ${table}:`, err);
                }
            }
        }

        // إرجاع البيانات المحلية
        let result = localData;

        // تطبيق الفلتر محلياً إذا لم نتمكن من الجلب من السيرفر
        if (options?.filter) {
            result = result.filter(item => {
                return Object.entries(options.filter!).every(([key, value]) =>
                    (item as Record<string, unknown>)[key] === value
                );
            });
        }

        // تطبيق الحد
        if (options?.limit) {
            result = result.slice(0, options.limit);
        }

        return { data: result, error: null, isOffline: !navigator.onLine };
    },

    /**
     * إدراج بيانات جديدة
     */
    async insert<T extends { id?: string }>(
        table: string,
        data: T,
        context: { userId: string; branchId: string; userName?: string }
    ): Promise<DatabaseResult<T>> {
        const localKey = `alzhra_${table}`;
        const localData = SafeStorage.get<T[]>(localKey, []);

        // إضافة معرف إذا لم يكن موجوداً
        const newData = {
            ...data,
            id: data.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            branchId: context.branchId
        };

        // حفظ محلياً
        localData.push(newData as T);
        SafeStorage.set(localKey, localData);

        // تسجيل النشاط
        ActivityLogger.log({
            action: 'create',
            entityType: table as 'sale' | 'purchase' | 'product',
            entityId: newData.id,
            userId: context.userId,
            userName: context.userName || 'مستخدم',
            organizationId: 'default',
            branchId: context.branchId,
            newData: newData as Record<string, unknown>
        });

        // إدارة المزامنة
        const client = getSupabaseClient();
        const isOnline = navigator.onLine && isSupabaseConfigured() && client;
        let syncError = null;

        if (isOnline) {
            try {
                const { error } = await client!.from(table).insert(newData);
                if (error) {
                    console.error(`Supabase insert error in ${table}:`, error);
                    syncError = error.message;
                }
            } catch (err) {
                console.error(`Error inserting to Supabase ${table}:`, err);
                syncError = String(err);
            }
        }

        // إذا لم نكن متصلين أو فشلت المزامنة، نضيف لقائمة الانتظار
        if (!isOnline || syncError) {
            SyncService.addToQueue({
                operation: 'create',
                entityType: table,
                entityId: newData.id,
                data: newData as Record<string, unknown>,
                userId: context.userId,
                branchId: context.branchId
            });
        }

        return { data: newData as T, error: syncError, isOffline: !isOnline };
    },

    /**
     * تحديث بيانات
     */
    async update<T extends { id: string }>(
        table: string,
        id: string,
        updates: Partial<T>,
        context: { userId: string; branchId: string; userName?: string }
    ): Promise<DatabaseResult<T>> {
        const localKey = `alzhra_${table}`;
        const localData = SafeStorage.get<T[]>(localKey, []);
        const index = localData.findIndex(item => item.id === id);

        if (index === -1) {
            return { data: null, error: 'Record not found', isOffline: !navigator.onLine };
        }

        const oldData = { ...localData[index] };
        const updatedData = {
            ...localData[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        localData[index] = updatedData;
        SafeStorage.set(localKey, localData);

        // تسجيل النشاط
        ActivityLogger.log({
            action: 'update',
            entityType: table as 'sale' | 'purchase' | 'product',
            entityId: id,
            userId: context.userId,
            userName: context.userName || 'مستخدم',
            organizationId: 'default',
            branchId: context.branchId,
            oldData: oldData as Record<string, unknown>,
            newData: updatedData as Record<string, unknown>
        });

        // إضافة للمزامنة
        if (!navigator.onLine || !isSupabaseConfigured()) {
            SyncService.addToQueue({
                operation: 'update',
                entityType: table,
                entityId: id,
                data: updatedData as Record<string, unknown>,
                userId: context.userId,
                branchId: context.branchId
            });
        }

        return { data: updatedData, error: null, isOffline: !navigator.onLine };
    },

    /**
     * حذف بيانات
     */
    async delete(
        table: string,
        id: string,
        context: { userId: string; branchId: string; userName?: string }
    ): Promise<DatabaseResult<boolean>> {
        const localKey = `alzhra_${table}`;
        const localData = SafeStorage.get<{ id: string }[]>(localKey, []);
        const record = localData.find(item => item.id === id);

        if (!record) {
            return { data: false, error: 'Record not found', isOffline: !navigator.onLine };
        }

        const newData = localData.filter(item => item.id !== id);
        SafeStorage.set(localKey, newData);

        // تسجيل النشاط
        ActivityLogger.log({
            action: 'delete',
            entityType: table as 'sale' | 'purchase' | 'product',
            entityId: id,
            userId: context.userId,
            userName: context.userName || 'مستخدم',
            organizationId: 'default',
            branchId: context.branchId,
            oldData: record as Record<string, unknown>
        });

        // إضافة للمزامنة
        if (!navigator.onLine || !isSupabaseConfigured()) {
            SyncService.addToQueue({
                operation: 'delete',
                entityType: table,
                entityId: id,
                data: { id },
                userId: context.userId,
                branchId: context.branchId
            });
        }

        return { data: true, error: null, isOffline: !navigator.onLine };
    }
};
