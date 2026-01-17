
/**
 * SafeStorage - معالج آمن لـ localStorage مع معالجة أخطاء شاملة
 */
export class SafeStorage {
    /**
     * قراءة قيمة من localStorage مع معالجة الأخطاء
     * @param key - مفتاح التخزين
     * @param defaultValue - القيمة الافتراضية في حالة عدم وجود البيانات أو حدوث خطأ
     * @returns القيمة المخزنة أو القيمة الافتراضية
     */
    static get<T>(key: string, defaultValue: T): T {
        try {
            const item = localStorage.getItem(key);
            if (!item) return defaultValue;

            return JSON.parse(item) as T;
        } catch (error) {
            console.error(`Failed to parse localStorage item "${key}":`, error);
            // تنظيف البيانات التالفة
            localStorage.removeItem(key);
            return defaultValue;
        }
    }

    /**
     * حفظ قيمة في localStorage مع معالجة الأخطاء
     * @param key - مفتاح التخزين
     * @param value - القيمة المراد حفظها
     * @returns true إذا نجحت العملية، false إذا فشلت
     */
    static set<T>(key: string, value: T): boolean {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Failed to save to localStorage "${key}":`, error);

            // التحقق من امتلاء التخزين
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                console.warn('localStorage quota exceeded. Consider clearing old data.');
            }

            return false;
        }
    }

    /**
     * حذف قيمة من localStorage
     * @param key - مفتاح التخزين
     */
    static remove(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Failed to remove localStorage item "${key}":`, error);
        }
    }

    /**
     * مسح جميع البيانات من localStorage
     */
    static clear(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
        }
    }

    /**
     * التحقق من وجود مفتاح في localStorage
     * @param key - مفتاح التخزين
     * @returns true إذا كان المفتاح موجوداً
     */
    static has(key: string): boolean {
        try {
            return localStorage.getItem(key) !== null;
        } catch (error) {
            console.error(`Failed to check localStorage key "${key}":`, error);
            return false;
        }
    }
}
