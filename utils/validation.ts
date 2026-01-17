/**
 * Input Validation Utilities
 * أدوات التحقق من صحة المدخلات
 */

// التحقق من البريد الإلكتروني
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// التحقق من رقم الهاتف السعودي
export const isValidSaudiPhone = (phone: string): boolean => {
    const phoneRegex = /^(05|5)(5|0|3|6|4|9|1|8|7)([0-9]{7})$/;
    const cleanPhone = phone.replace(/[\s\-\+]/g, '');
    return phoneRegex.test(cleanPhone);
};

// التحقق من المبالغ المالية
export const isValidAmount = (amount: number): boolean => {
    return !isNaN(amount) && isFinite(amount) && amount >= 0;
};

// التحقق من نسبة الضريبة
export const isValidTaxRate = (rate: number): boolean => {
    return !isNaN(rate) && rate >= 0 && rate <= 100;
};

// التحقق من الكمية
export const isValidQuantity = (qty: number): boolean => {
    return Number.isInteger(qty) && qty >= 0;
};

// تنظيف النصوص من الرموز الخطرة (XSS Prevention)
export const sanitizeText = (input: string): string => {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };
    return input.replace(/[&<>"'/]/g, (char) => map[char] || char);
};

// التحقق من طول النص
export const isValidLength = (text: string, min: number, max: number): boolean => {
    const length = text.trim().length;
    return length >= min && length <= max;
};

// التحقق من التاريخ
export const isValidDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};

// التحقق من أن التاريخ ليس في المستقبل
export const isNotFutureDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return date <= new Date();
};

// التحقق من رقم الفاتورة
export const isValidInvoiceNumber = (invoiceNum: string): boolean => {
    return /^[A-Za-z0-9\-]+$/.test(invoiceNum) && invoiceNum.length <= 50;
};

// التحقق من الرقم الضريبي السعودي (VAT)
export const isValidSaudiVAT = (vatNumber: string): boolean => {
    // 15 رقم للرقم الضريبي السعودي
    return /^3[0-9]{13}3$/.test(vatNumber.replace(/\s/g, ''));
};

// التحقق من السجل التجاري
export const isValidCommercialRegister = (cr: string): boolean => {
    // 10 أرقام للسجل التجاري
    return /^[0-9]{10}$/.test(cr.replace(/\s/g, ''));
};

// نوع نتيجة التحقق
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

// التحقق من بيانات العميل
export const validateCustomerData = (data: {
    name?: string;
    phone?: string;
    email?: string;
}): ValidationResult => {
    const errors: string[] = [];

    if (!data.name || !isValidLength(data.name, 2, 100)) {
        errors.push('اسم العميل يجب أن يكون بين 2 و 100 حرف');
    }

    if (data.phone && !isValidSaudiPhone(data.phone)) {
        errors.push('رقم الهاتف غير صحيح');
    }

    if (data.email && !isValidEmail(data.email)) {
        errors.push('البريد الإلكتروني غير صحيح');
    }

    return { isValid: errors.length === 0, errors };
};

// التحقق من بيانات المنتج
export const validateProductData = (data: {
    name?: string;
    price?: number;
    quantity?: number;
}): ValidationResult => {
    const errors: string[] = [];

    if (!data.name || !isValidLength(data.name, 2, 200)) {
        errors.push('اسم المنتج يجب أن يكون بين 2 و 200 حرف');
    }

    if (data.price !== undefined && !isValidAmount(data.price)) {
        errors.push('السعر يجب أن يكون رقماً موجباً');
    }

    if (data.quantity !== undefined && !isValidQuantity(data.quantity)) {
        errors.push('الكمية يجب أن تكون عدداً صحيحاً موجباً');
    }

    return { isValid: errors.length === 0, errors };
};

// التحقق من بيانات الفاتورة
export const validateInvoiceData = (data: {
    invoiceNumber?: string;
    date?: string;
    total?: number;
    items?: Array<{ quantity: number; price: number }>;
}): ValidationResult => {
    const errors: string[] = [];

    if (data.invoiceNumber && !isValidInvoiceNumber(data.invoiceNumber)) {
        errors.push('رقم الفاتورة غير صحيح');
    }

    if (data.date && !isValidDate(data.date)) {
        errors.push('تاريخ الفاتورة غير صحيح');
    }

    if (data.total !== undefined && !isValidAmount(data.total)) {
        errors.push('إجمالي الفاتورة غير صحيح');
    }

    if (data.items) {
        data.items.forEach((item, index) => {
            if (!isValidQuantity(item.quantity)) {
                errors.push(`الكمية في السطر ${index + 1} غير صحيحة`);
            }
            if (!isValidAmount(item.price)) {
                errors.push(`السعر في السطر ${index + 1} غير صحيح`);
            }
        });
    }

    return { isValid: errors.length === 0, errors };
};
