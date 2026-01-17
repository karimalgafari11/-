
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Copy, ChevronDown, ChevronUp, Bug, XCircle } from 'lucide-react';
import { errorMonitor } from '../../services/errorMonitoring';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
}

/**
 * Enhanced Error Boundary component with detailed error display.
 * يعرض اسم الخطأ والتفاصيل بشكل واضح ومفصل
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
    copied: false
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // تسجيل الخطأ في خدمة المراقبة
    errorMonitor.captureError(error, {
      componentStack: errorInfo.componentStack,
      handled: false,
      source: 'ErrorBoundary'
    });

    this.setState({ errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  private getErrorType(error: Error): string {
    // تحديد نوع الخطأ بناءً على اسمه أو محتواه
    const name = error.name || 'Error';

    const errorTypes: Record<string, string> = {
      'TypeError': 'خطأ في نوع البيانات',
      'ReferenceError': 'خطأ في المرجع',
      'SyntaxError': 'خطأ في الصياغة',
      'RangeError': 'خطأ في النطاق',
      'NetworkError': 'خطأ في الشبكة',
      'ChunkLoadError': 'خطأ في تحميل الملفات',
      'Error': 'خطأ عام'
    };

    return errorTypes[name] || name;
  }

  private getErrorSeverity(error: Error): 'critical' | 'high' | 'medium' | 'low' {
    const message = error.message.toLowerCase();
    const name = error.name;

    if (name === 'ChunkLoadError' || message.includes('network') || message.includes('fetch')) {
      return 'critical';
    }
    if (name === 'TypeError' || name === 'ReferenceError') {
      return 'high';
    }
    if (name === 'RangeError') {
      return 'medium';
    }
    return 'low';
  }

  private copyErrorDetails = async () => {
    const { error, errorInfo } = this.state;
    if (!error) return;

    const details = `
═══════════════════════════════════════
  تقرير الخطأ - الزهراء
═══════════════════════════════════════

🔴 نوع الخطأ: ${error.name}
📝 الرسالة: ${error.message}

📍 المكان: ${window.location.href}
📅 الوقت: ${new Date().toLocaleString('ar-IQ')}
🌐 المتصفح: ${navigator.userAgent}

═══════════════════════════════════════
  تتبع الخطأ (Stack Trace)
═══════════════════════════════════════
${error.stack || 'غير متوفر'}

═══════════════════════════════════════
  مكونات React المتأثرة
═══════════════════════════════════════
${errorInfo?.componentStack || 'غير متوفر'}
    `.trim();

    try {
      await navigator.clipboard.writeText(details);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch {
      console.error('Failed to copy error details');
    }
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      const { error, errorInfo, showDetails, copied } = this.state;
      const errorType = this.getErrorType(error);
      const severity = this.getErrorSeverity(error);

      const severityColors = {
        critical: 'from-red-600 to-rose-700',
        high: 'from-orange-500 to-red-600',
        medium: 'from-amber-500 to-orange-500',
        low: 'from-yellow-500 to-amber-500'
      };

      const severityLabels = {
        critical: 'حرج',
        high: 'عالي',
        medium: 'متوسط',
        low: 'منخفض'
      };

      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            {/* Error Card */}
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800/50 overflow-hidden">
              {/* Header with gradient */}
              <div className={`bg-gradient-to-r ${severityColors[severity]} p-6 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative flex items-start gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0">
                    <Bug size={32} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-wider text-white">
                        {severityLabels[severity]}
                      </span>
                      <span className="px-2.5 py-1 bg-black/20 rounded-full text-[10px] font-bold text-white/80">
                        {error.name}
                      </span>
                    </div>
                    <h1 className="text-xl font-black text-white mb-1 truncate">
                      {errorType}
                    </h1>
                    <p className="text-white/80 text-sm font-medium line-clamp-2">
                      {error.message || 'حدث خطأ غير متوقع في التطبيق'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Info Section */}
              <div className="p-6 space-y-4">
                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">الصفحة</div>
                    <div className="text-sm font-bold text-slate-300 truncate" dir="ltr">
                      {window.location.pathname || '/'}
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">الوقت</div>
                    <div className="text-sm font-bold text-slate-300">
                      {new Date().toLocaleTimeString('ar-IQ')}
                    </div>
                  </div>
                </div>

                {/* Error Message Box */}
                <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <XCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-black text-red-400 uppercase tracking-wider mb-1">رسالة الخطأ</div>
                      <p className="text-sm text-red-200 font-mono break-words" dir="ltr">
                        {error.message}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expandable Details */}
                <button
                  onClick={() => this.setState({ showDetails: !showDetails })}
                  className="w-full flex items-center justify-between p-3 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl border border-slate-700/30 transition-all duration-200"
                >
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    التفاصيل التقنية
                  </span>
                  {showDetails ? (
                    <ChevronUp size={16} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-400" />
                  )}
                </button>

                {showDetails && (
                  <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                    {/* Stack Trace */}
                    <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Stack Trace</div>
                      <pre className="text-xs text-slate-400 font-mono overflow-x-auto max-h-40 custom-scrollbar whitespace-pre-wrap break-words" dir="ltr">
                        {error.stack || 'غير متوفر'}
                      </pre>
                    </div>

                    {/* Component Stack */}
                    {errorInfo?.componentStack && (
                      <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Component Stack</div>
                        <pre className="text-xs text-slate-400 font-mono overflow-x-auto max-h-40 custom-scrollbar whitespace-pre-wrap break-words" dir="ltr">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={this.handleRetry}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-black text-sm hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 shadow-lg shadow-emerald-900/30"
                  >
                    <RefreshCw size={18} />
                    إعادة المحاولة
                  </button>
                  <button
                    onClick={this.copyErrorDetails}
                    className={`flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-bold text-sm transition-all duration-300 border ${copied
                        ? 'bg-emerald-600/20 border-emerald-600 text-emerald-400'
                        : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                  >
                    <Copy size={16} />
                    {copied ? 'تم النسخ!' : 'نسخ'}
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="flex items-center justify-center gap-2 py-3.5 px-5 bg-slate-800/50 border border-slate-700 text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-800 hover:border-slate-600 transition-all duration-300"
                  >
                    تحديث الصفحة
                  </button>
                </div>

                {/* Help Text */}
                <p className="text-center text-[10px] text-slate-600 pt-2">
                  إذا استمرت المشكلة، يرجى نسخ تفاصيل الخطأ والتواصل مع الدعم الفني
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6 text-slate-600 text-xs">
              الزهراء - نظام إدارة الأعمال
            </div>
          </div>
        </div>
      );
    }

    return this.props.children || null;
  }
}

export default ErrorBoundary;
