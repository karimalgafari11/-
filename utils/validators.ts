
/**
 * Validators - مجموعة من دوال التحقق من صحة البيانات
 */
export const validators = {
    /**
     * التحقق من أن الحقل مطلوب
     */
    required: (value: any): string | null => {
        if (!value || (typeof value === 'string' && !value.trim())) {
            return 'هذا الحقل مطلوب';
        }
        return null;
    },

    /**
     * التحقق من صحة البريد الإلكتروني
     */
    email: (value: string): string | null => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return 'البريد الإلكتروني غير صالح';
        }
        return null;
    },

    /**
     * التحقق من صحة رقم الهاتف
     */
    phone: (value: string): string | null => {
        const phoneRegex = /^[0-9]{10,}$/;
        if (!phoneRegex.test(value.replace(/[\s-]/g, ''))) {
            return 'رقم الهاتف غير صالح';
        }
        return null;
    },

    /**
     * التحقق من الحد الأدنى لطول النص
     */
    minLength: (min: number) => (value: string): string | null => {
        if (value.length < min) {
            return `يجب أن يكون الحد الأدنى ${min} أحرف`;
        }
        return null;
    },

    /**
     * التحقق من الحد الأقصى لطول النص
     */
    maxLength: (max: number) => (value: string): string | null => {
        if (value.length > max) {
            return `يجب أن يكون الحد الأقصى ${max} أحرف`;
        }
        return null;
    },

    /**
     * التحقق من الحد الأدنى للقيمة الرقمية
     */
    min: (min: number) => (value: number): string | null => {
        if (value < min) {
            return `القيمة يجب أن تكون ${min} على الأقل`;
        }
        return null;
    },

    /**
     * التحقق من الحد الأقصى للقيمة الرقمية
     */
    max: (max: number) => (value: number): string | null => {
        if (value > max) {
            return `القيمة يجب أن لا تتجاوز ${max}`;
        }
        return null;
    },

    /**
     * التحقق من أن القيمة موجبة
     */
    positive: (value: number): string | null => {
        if (value <= 0) {
            return 'القيمة يجب أن تكون موجبة';
        }
        return null;
    },

    /**
     * التحقق من صحة الرقم الضريبي السعودي (15 رقم)
     */
    taxNumber: (value: string): string | null => {
        const taxRegex = /^[0-9]{15}$/;
        if (!taxRegex.test(value)) {
            return 'الرقم الضريبي يجب أن يكون 15 رقماً';
        }
        return null;
    }
};

/**
 * التحقق من صحة نموذج كامل
 * @param values - قيم النموذج
 * @param rules - قواعد التحقق لكل حقل
 * @returns كائن يحتوي على الأخطاء (فارغ إذا لم توجد أخطاء)
 */
export const validateForm = (
    values: Record<string, any>,
    rules: Record<string, Array<(value: any) => string | null>>
): Record<string, string> => {
    const errors: Record<string, string> = {};

    Object.keys(rules).forEach(field => {
        const fieldRules = rules[field];
        const value = values[field];

        for (const rule of fieldRules) {
            const error = rule(value);
            if (error) {
                errors[field] = error;
                break; // أول خطأ فقط
            }
        }
    });

    return errors;
};
