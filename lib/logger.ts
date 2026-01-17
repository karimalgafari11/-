
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    data?: any;
    error?: Error;
}

/**
 * Logger - نظام تسجيل متقدم للأخطاء والأحداث
 */
class Logger {
    private static instance: Logger;
    private logs: LogEntry[] = [];
    private maxLogs = 1000;

    private constructor() { }

    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private log(level: LogLevel, message: string, data?: any, error?: Error) {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            data,
            error
        };

        // حفظ في الذاكرة
        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // طباعة في console
        const consoleMethod = level === 'debug' ? 'log' : level;
        const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`;

        if (error) {
            console[consoleMethod](prefix, message, data, error);
        } else if (data) {
            console[consoleMethod](prefix, message, data);
        } else {
            console[consoleMethod](prefix, message);
        }

        // في الإنتاج، إرسال الأخطاء إلى خدمة خارجية
        if (level === 'error' && process.env.NODE_ENV === 'production') {
            this.sendToMonitoring(entry);
        }
    }

    private sendToMonitoring(entry: LogEntry) {
        // تكامل مع خدمة مراقبة الأخطاء المحلية
        import('../services/errorMonitoring').then(({ errorMonitor }) => {
            if (entry.error) {
                errorMonitor.captureError(entry.error, {
                    message: entry.message,
                    data: entry.data,
                    source: 'logger'
                });
            } else {
                errorMonitor.captureMessage(entry.message, 'warning', entry.data);
            }
        }).catch(() => {
            // تجاهل أخطاء التحميل
        });
    }

    /**
     * تسجيل رسالة debug (فقط في التطوير)
     */
    debug(message: string, data?: any) {
        if (process.env.NODE_ENV !== 'production') {
            this.log('debug', message, data);
        }
    }

    /**
     * تسجيل رسالة معلومات
     */
    info(message: string, data?: any) {
        this.log('info', message, data);
    }

    /**
     * تسجيل تحذير
     */
    warn(message: string, data?: any) {
        this.log('warn', message, data);
    }

    /**
     * تسجيل خطأ
     */
    error(message: string, error?: Error, data?: any) {
        this.log('error', message, data, error);
    }

    /**
     * الحصول على جميع السجلات
     */
    getLogs(): LogEntry[] {
        return [...this.logs];
    }

    /**
     * مسح جميع السجلات
     */
    clearLogs() {
        this.logs = [];
    }

    /**
     * تصدير السجلات كـ JSON
     */
    exportLogs(): string {
        return JSON.stringify(this.logs, null, 2);
    }
}

export const logger = Logger.getInstance();
