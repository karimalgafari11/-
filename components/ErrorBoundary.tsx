import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCcw, Home, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    pageName?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    showDetails: boolean;
}

/**
 * ErrorBoundary - مكون لالتقاط الأخطاء ومنع انهيار التطبيق
 * يوفر واجهة مستخدم ودية عند حدوث خطأ مع خيارات للتعافي
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            showDetails: false
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });

        // يمكن إرسال الخطأ لخدمة تتبع الأخطاء هنا
        // reportError(error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/#/';
    };

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    toggleDetails = () => {
        this.setState(prev => ({ showDetails: !prev.showDetails }));
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-6">
                    <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-rose-200 dark:border-rose-900/50 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-6 text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <AlertTriangle size={28} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black">حدث خطأ غير متوقع</h2>
                                    <p className="text-white/80 text-sm mt-1">
                                        {this.props.pageName ? `في صفحة ${this.props.pageName}` : 'في هذا القسم'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                نعتذر عن هذا الخطأ. يمكنك المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
                            </p>

                            {/* Error Message */}
                            {this.state.error && (
                                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
                                    <p className="text-rose-700 dark:text-rose-400 text-xs font-mono break-all">
                                        {this.state.error.message}
                                    </p>
                                </div>
                            )}

                            {/* Toggle Details */}
                            <button
                                onClick={this.toggleDetails}
                                className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                            >
                                {this.state.showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                {this.state.showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                            </button>

                            {/* Stack Trace */}
                            {this.state.showDetails && this.state.errorInfo && (
                                <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 overflow-x-auto">
                                    <pre className="text-[10px] text-slate-600 dark:text-slate-400 font-mono whitespace-pre-wrap">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={this.handleRetry}
                                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl transition-colors"
                                >
                                    <RefreshCcw size={18} />
                                    إعادة المحاولة
                                </button>
                                <button
                                    onClick={this.handleGoHome}
                                    className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 px-4 rounded-xl transition-colors"
                                >
                                    <Home size={18} />
                                    الرئيسية
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-[10px] text-slate-400 text-center">
                                إذا تكرر الخطأ، يرجى التواصل مع الدعم الفني
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
