/**
 * Error Monitoring Service - خدمة مراقبة الأخطاء
 * بديل خفيف الوزن لـ Sentry للإنتاج
 */

interface ErrorReport {
    id: string;
    timestamp: string;
    message: string;
    stack?: string;
    componentStack?: string;
    url: string;
    userAgent: string;
    userId?: string;
    extra?: Record<string, unknown>;
    level: 'error' | 'warning' | 'info';
    handled: boolean;
}

interface ErrorMetrics {
    totalErrors: number;
    uniqueErrors: number;
    lastErrorTime?: string;
    errorsByType: Record<string, number>;
}

class ErrorMonitoringService {
    private static instance: ErrorMonitoringService;
    private errors: ErrorReport[] = [];
    private maxErrors = 100;
    private isEnabled = true;
    private webhookUrl?: string;

    private constructor() {
        this.setupGlobalHandlers();
    }

    static getInstance(): ErrorMonitoringService {
        if (!ErrorMonitoringService.instance) {
            ErrorMonitoringService.instance = new ErrorMonitoringService();
        }
        return ErrorMonitoringService.instance;
    }

    /**
     * إعداد معالجات الأخطاء العامة
     */
    private setupGlobalHandlers() {
        // التقاط الأخطاء غير المُعالجة
        window.onerror = (message, source, lineno, colno, error) => {
            this.captureError(error || new Error(String(message)), {
                source,
                lineno,
                colno,
                handled: false
            });
            return false;
        };

        // التقاط Promise rejections غير المُعالجة
        window.onunhandledrejection = (event) => {
            this.captureError(
                event.reason instanceof Error
                    ? event.reason
                    : new Error(String(event.reason)),
                { handled: false, type: 'unhandledrejection' }
            );
        };
    }

    /**
     * التقاط خطأ وتسجيله
     */
    captureError(error: Error, extra?: Record<string, unknown>): string {
        if (!this.isEnabled) return '';

        const report: ErrorReport = {
            id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            message: error.message,
            stack: error.stack,
            url: window.location.href,
            userAgent: navigator.userAgent,
            extra,
            level: 'error',
            handled: extra?.handled !== false
        };

        this.errors.push(report);
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // حفظ في localStorage للتحليل
        this.persistErrors();

        // إرسال إلى webhook إذا تم تكوينه
        if (this.webhookUrl) {
            this.sendToWebhook(report);
        }

        return report.id;
    }

    /**
     * التقاط رسالة (غير خطأ)
     */
    captureMessage(message: string, level: 'warning' | 'info' = 'info', extra?: Record<string, unknown>): string {
        if (!this.isEnabled) return '';

        const report: ErrorReport = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            message,
            url: window.location.href,
            userAgent: navigator.userAgent,
            extra,
            level,
            handled: true
        };

        this.errors.push(report);
        return report.id;
    }

    /**
     * إعداد سياق المستخدم
     */
    setUser(userId: string) {
        // يمكن إضافة المستخدم لكل التقارير المستقبلية
    }

    /**
     * تكوين webhook للإرسال
     */
    setWebhook(url: string) {
        this.webhookUrl = url;
    }

    /**
     * إرسال التقرير إلى webhook
     */
    private async sendToWebhook(report: ErrorReport) {
        if (!this.webhookUrl) return;

        try {
            await fetch(this.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'error_report',
                    data: report
                })
            });
        } catch {
            // تجاهل أخطاء الإرسال لتجنب التكرار
        }
    }

    /**
     * حفظ الأخطاء في localStorage
     */
    private persistErrors() {
        try {
            localStorage.setItem('alzhra_error_logs', JSON.stringify(this.errors.slice(-50)));
        } catch {
            // التخزين ممتلئ
        }
    }

    /**
     * الحصول على إحصائيات الأخطاء
     */
    getMetrics(): ErrorMetrics {
        const errorsByType: Record<string, number> = {};
        const uniqueMessages = new Set<string>();

        this.errors.forEach(err => {
            uniqueMessages.add(err.message);
            errorsByType[err.level] = (errorsByType[err.level] || 0) + 1;
        });

        return {
            totalErrors: this.errors.length,
            uniqueErrors: uniqueMessages.size,
            lastErrorTime: this.errors[this.errors.length - 1]?.timestamp,
            errorsByType
        };
    }

    /**
     * الحصول على جميع الأخطاء
     */
    getErrors(): ErrorReport[] {
        return [...this.errors];
    }

    /**
     * مسح الأخطاء
     */
    clearErrors() {
        this.errors = [];
        localStorage.removeItem('alzhra_error_logs');
    }

    /**
     * تصدير الأخطاء كـ JSON
     */
    exportErrors(): string {
        return JSON.stringify(this.errors, null, 2);
    }

    /**
     * تمكين/تعطيل المراقبة
     */
    setEnabled(enabled: boolean) {
        this.isEnabled = enabled;
    }
}

export const errorMonitor = ErrorMonitoringService.getInstance();
