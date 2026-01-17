/**
 * Security Utilities
 * أدوات الأمان الأساسية
 */

// قائمة الرموز الخطرة للـ SQL Injection
const SQL_INJECTION_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|TRUNCATE)\b)/gi,
    /(--|#|\/\*|\*\/)/g,
    /(\bOR\b\s+\d+\s*=\s*\d+|\bAND\b\s+\d+\s*=\s*\d+)/gi,
];

// التحقق من وجود محاولة SQL Injection
export const containsSQLInjection = (input: string): boolean => {
    return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
};

// تنظيف المدخلات من محاولات XSS
export const sanitizeHTML = (input: string): string => {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
};

// تنظيف المدخلات للعرض الآمن
export const escapeForDisplay = (input: string): string => {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

// التحقق من صحة URL
export const isValidURL = (url: string): boolean => {
    try {
        const parsedURL = new URL(url);
        return ['http:', 'https:'].includes(parsedURL.protocol);
    } catch {
        return false;
    }
};

// التحقق من أمان الملف المرفوع
export const isAllowedFileType = (fileName: string, allowedExtensions: string[]): boolean => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    return allowedExtensions.includes(extension);
};

// حساب قوة كلمة المرور
export const getPasswordStrength = (password: string): {
    score: number;
    feedback: string;
} => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score += 1;
    else feedback.push('يجب أن تكون 8 أحرف على الأقل');

    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('أضف أحرف صغيرة');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('أضف أحرف كبيرة');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('أضف أرقام');

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else feedback.push('أضف رموز خاصة');

    const strengthLevels = ['ضعيفة جداً', 'ضعيفة', 'متوسطة', 'جيدة', 'قوية', 'قوية جداً'];

    return {
        score,
        feedback: feedback.length > 0
            ? `كلمة المرور ${strengthLevels[score]}: ${feedback.join('، ')}`
            : `كلمة المرور ${strengthLevels[score]}`
    };
};

// تشفير بسيط للبيانات الحساسة (للعرض فقط)
export const maskSensitiveData = (data: string, visibleChars: number = 4): string => {
    if (data.length <= visibleChars) return '*'.repeat(data.length);
    const visible = data.slice(-visibleChars);
    const masked = '*'.repeat(data.length - visibleChars);
    return masked + visible;
};

// إخفاء رقم الهاتف
export const maskPhoneNumber = (phone: string): string => {
    if (phone.length < 5) return phone;
    return phone.slice(0, 3) + '****' + phone.slice(-3);
};

// إخفاء البريد الإلكتروني
export const maskEmail = (email: string): string => {
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const maskedLocal = local.slice(0, 2) + '***';
    return `${maskedLocal}@${domain}`;
};

// Rate Limiter بسيط للـ Client Side
export class RateLimiter {
    private timestamps: Map<string, number[]> = new Map();
    private readonly maxRequests: number;
    private readonly windowMs: number;

    constructor(maxRequests: number = 10, windowMs: number = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }

    isAllowed(key: string): boolean {
        const now = Date.now();
        const windowStart = now - this.windowMs;

        let timestamps = this.timestamps.get(key) || [];
        timestamps = timestamps.filter(ts => ts > windowStart);

        if (timestamps.length >= this.maxRequests) {
            return false;
        }

        timestamps.push(now);
        this.timestamps.set(key, timestamps);
        return true;
    }

    reset(key: string): void {
        this.timestamps.delete(key);
    }
}

// مثيل افتراضي للـ Rate Limiter
export const defaultRateLimiter = new RateLimiter(20, 60000);

// التحقق من أن الطلب من نفس المصدر
export const isSameOrigin = (url: string): boolean => {
    try {
        const parsedURL = new URL(url, window.location.origin);
        return parsedURL.origin === window.location.origin;
    } catch {
        return false;
    }
};
