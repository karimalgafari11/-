/**
 * Database Service - خدمة قاعدة البيانات
 * طبقة تجريد للتعامل مع Supabase
 * التخزين السحابي فقط - بدون تخزين محلي
 */

import { supabase } from '../lib/supabaseClient';
import { ActivityLogger } from './activityLogger';

// أنواع العمليات
type Operation = 'select' | 'insert' | 'update' | 'delete';

// واجهة النتيجة
interface DatabaseResult<T> {
    data: T | null;
    error: string | null;
}

/**
 * خدمة قاعدة البيانات
 * تتعامل مباشرة مع Supabase للتخزين السحابي
 */
export const DatabaseService = {
    /**
     * جلب البيانات من Supabase
     */
    async select<T>(
        table: string,
        options?: {
            filter?: Record<string, unknown>;
            orderBy?: string;
            limit?: number;
        }
    ): Promise<DatabaseResult<T[]>> {
        try {
            let query = supabase.from(table).select('*');

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

            if (error) {
                console.error(`❌ خطأ في جلب ${table}:`, error);
                return { data: null, error: error.message };
            }

            return { data: data as T[], error: null };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error(`❌ استثناء في جلب ${table}:`, err);
            return { data: null, error: errorMessage };
        }
    },

    /**
     * إدراج بيانات جديدة في Supabase
     */
    async insert<T extends { id?: string }>(
        table: string,
        data: T,
        context: { userId: string; branchId: string; userName?: string }
    ): Promise<DatabaseResult<T>> {
        try {
            // إضافة معرف إذا لم يكن موجوداً
            const newData = {
                ...data,
                id: data.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                branch_id: context.branchId
            };

            const { data: insertedData, error } = await supabase
                .from(table)
                .insert(newData)
                .select()
                .single();

            if (error) {
                console.error(`❌ خطأ في إدراج ${table}:`, error);
                return { data: null, error: error.message };
            }

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

            console.log(`✅ تم إدراج ${table}:`, newData.id);
            return { data: insertedData as T, error: null };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error(`❌ استثناء في إدراج ${table}:`, err);
            return { data: null, error: errorMessage };
        }
    },

    /**
     * تحديث بيانات في Supabase
     */
    async update<T extends { id: string }>(
        table: string,
        id: string,
        updates: Partial<T>,
        context: { userId: string; branchId: string; userName?: string }
    ): Promise<DatabaseResult<T>> {
        try {
            // جلب البيانات القديمة للتسجيل
            const { data: oldData } = await supabase
                .from(table)
                .select('*')
                .eq('id', id)
                .single();

            const updatedData = {
                ...updates,
                updated_at: new Date().toISOString()
            };

            const { data: result, error } = await supabase
                .from(table)
                .update(updatedData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error(`❌ خطأ في تحديث ${table}:`, error);
                return { data: null, error: error.message };
            }

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
                newData: result as Record<string, unknown>
            });

            console.log(`✅ تم تحديث ${table}:`, id);
            return { data: result as T, error: null };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error(`❌ استثناء في تحديث ${table}:`, err);
            return { data: null, error: errorMessage };
        }
    },

    /**
     * حذف بيانات من Supabase
     */
    async delete(
        table: string,
        id: string,
        context: { userId: string; branchId: string; userName?: string }
    ): Promise<DatabaseResult<boolean>> {
        try {
            // جلب البيانات قبل الحذف للتسجيل
            const { data: oldData } = await supabase
                .from(table)
                .select('*')
                .eq('id', id)
                .single();

            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', id);

            if (error) {
                console.error(`❌ خطأ في حذف ${table}:`, error);
                return { data: false, error: error.message };
            }

            // تسجيل النشاط
            ActivityLogger.log({
                action: 'delete',
                entityType: table as 'sale' | 'purchase' | 'product',
                entityId: id,
                userId: context.userId,
                userName: context.userName || 'مستخدم',
                organizationId: 'default',
                branchId: context.branchId,
                oldData: oldData as Record<string, unknown>
            });

            console.log(`✅ تم حذف ${table}:`, id);
            return { data: true, error: null };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error(`❌ استثناء في حذف ${table}:`, err);
            return { data: false, error: errorMessage };
        }
    },

    /**
     * جلب سجل واحد
     */
    async selectOne<T>(
        table: string,
        id: string
    ): Promise<DatabaseResult<T>> {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error(`❌ خطأ في جلب ${table}:`, error);
                return { data: null, error: error.message };
            }

            return { data: data as T, error: null };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error(`❌ استثناء في جلب ${table}:`, err);
            return { data: null, error: errorMessage };
        }
    },

    /**
     * إدراج عدة سجلات
     */
    async insertMany<T extends { id?: string }>(
        table: string,
        items: T[],
        context: { userId: string; branchId: string; userName?: string }
    ): Promise<DatabaseResult<T[]>> {
        try {
            const newItems = items.map(item => ({
                ...item,
                id: item.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                branch_id: context.branchId
            }));

            const { data, error } = await supabase
                .from(table)
                .insert(newItems)
                .select();

            if (error) {
                console.error(`❌ خطأ في إدراج متعدد ${table}:`, error);
                return { data: null, error: error.message };
            }

            console.log(`✅ تم إدراج ${items.length} سجل في ${table}`);
            return { data: data as T[], error: null };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error(`❌ استثناء في إدراج متعدد ${table}:`, err);
            return { data: null, error: errorMessage };
        }
    }
};
