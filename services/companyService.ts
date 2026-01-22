/**
 * Company Service - خدمة إدارة الشركات
 * 
 * ⚠️ ملاحظة: تم نقل وإعادة هيكلة هذا الملف
 * 
 * الهيكل الجديد موجود في مجلد: services/company/
 * - types.ts - الأنواع
 * - localStorage.ts - التخزين المحلي
 * - cache.ts - الكاش
 * - mappers.ts - دوال التحويل
 * - companyCore.ts - العمليات الأساسية
 * - companyUsers.ts - إدارة المستخدمين
 * - companyDiagnostics.ts - التشخيص والإصلاح
 * - index.ts - التصدير الموحد
 * 
 * هذا الملف موجود للتوافقية مع الـ imports القديمة
 */

// إعادة تصدير كل شيء من المجلد الجديد
export * from './company';
export { default } from './company';
