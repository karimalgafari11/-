/**
 * Supabase Types - طبقة توافقية
 * يعيد تصدير من database.ts
 * 
 * @deprecated استخدم '../types/database' مباشرة
 */

// إعادة تصدير كل شيء من database.ts
export * from './database';

// تصديرات إضافية للتوافق
export type InsertType<T> = Omit<T, 'id' | 'created_at' | 'updated_at'> & { id?: string };
export type UpdateType<T> = Partial<Omit<T, 'id' | 'created_at' | 'company_id'>>;
