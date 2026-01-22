/**
 * Supabase Client Compatibility Layer
 * يجمع بين العميل الحقيقي (Real) والمحلي (Local)
 * ويقوم بالتبديل بينهما بناءً على توفر الإعدادات
 */

import {
    supabaseReal,
    isSupabaseConfigured as isRealConfigured,
    isSupabaseConnected as checkRealConnection
} from './supabaseRealClient';

import {
    db as localDbClient,
    localDb as localDbAlias,
    generateUUID as genUUID,
    getCurrentTimestamp as getTimestamp
} from './localStorageClient';
import { localAuth } from './localAuthClient';

// تصدير الأدوات المساعدة
export const generateUUID = genUUID;
export const getCurrentTimestamp = getTimestamp;

// تحديد العميل المستخدم
const USE_REAL_CLIENT = isRealConfigured;

console.log(`🔌 Supabase Client Mode: ${USE_REAL_CLIENT ? 'REAL (Cloud)' : 'LOCAL (Offline)'}`);

// العميل الموحد
export const supabase = USE_REAL_CLIENT
    ? supabaseReal
    : {
        ...localDbClient,
        auth: localAuth
    };

// تصدير الحالة
export const isSupabaseConfigured = USE_REAL_CLIENT;
export const isSupabaseConnected = USE_REAL_CLIENT ? checkRealConnection : async () => true;
export const currentStorageMode = USE_REAL_CLIENT ? 'real' : 'local';

// تصدير العملاء للاستخدام المباشر عند الحاجة
export const db = localDbClient;
export const localDb = localDbAlias;

export default supabase;
