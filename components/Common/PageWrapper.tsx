import React, { Suspense, ReactNode } from 'react';
import ErrorBoundary from '../ErrorBoundary';
import LoadingScreen from './LoadingScreen';

interface PageWrapperProps {
    children: ReactNode;
    pageName?: string;
}

/**
 * PageWrapper - غلاف للصفحات مع حماية من الأخطاء
 * يوفر Suspense للتحميل الكسول و ErrorBoundary لمنع انهيار التطبيق بالكامل
 */
const PageWrapper: React.FC<PageWrapperProps> = ({ children, pageName }) => {
    return (
        <ErrorBoundary pageName={pageName}>
            <Suspense fallback={<LoadingScreen />}>
                {children}
            </Suspense>
        </ErrorBoundary>
    );
};

export default PageWrapper;
