
import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/app/ThemeContext';
import { NotificationProvider } from './context/app/NotificationContext';
import { UserProvider } from './context/app/UserContext';
import { SettingsProvider } from './context/SettingsContext';
import { FinanceProvider } from './context/FinanceContext';
import { InventoryProvider } from './context/InventoryContext';
import { PurchasesProvider } from './context/PurchasesContext';
import { SalesProvider } from './context/SalesContext';
import { VouchersProvider } from './context/VouchersContext';

import { OrganizationProvider } from './context/OrganizationContext';
import { SyncProvider } from './context/SyncContext';
import { PrivacyProvider } from './components/Common/PrivacyToggle';
import MainLayout from './components/Layout/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/Common/LoadingScreen';

// Lazy loading for modules
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Accounting = lazy(() => import('./pages/Accounting'));
const Sales = lazy(() => import('./pages/Sales'));
const Purchases = lazy(() => import('./pages/Purchases'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Invoices = lazy(() => import('./pages/Invoices'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Suppliers = lazy(() => import('./pages/Suppliers'));
const Customers = lazy(() => import('./pages/Customers'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const Vouchers = lazy(() => import('./pages/Vouchers'));
const ActivityLog = lazy(() => import('./pages/ActivityLog'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const POS = lazy(() => import('./pages/POS'));

/**
 * مكون غلاف الصفحة مع حماية من الأخطاء
 */
const PageWrapper: React.FC<{ children: React.ReactNode; pageName: string }> = ({ children, pageName }) => (
  <ErrorBoundary pageName={pageName}>
    <Suspense fallback={<LoadingScreen />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

const App: React.FC = () => {
  return (
    <ErrorBoundary pageName="التطبيق الرئيسي">
      <ThemeProvider>
        <NotificationProvider>
          <UserProvider>
            <AppProvider>
              <>
                <OrganizationProvider>
                  <SyncProvider>
                    <SettingsProvider>
                      <FinanceProvider>
                        <InventoryProvider>
                          <PurchasesProvider>
                            <SalesProvider>
                              <VouchersProvider>
                                <PrivacyProvider>
                                  <HashRouter>
                                    <Routes>
                                      {/* Login Page - Standalone */}
                                      <Route path="/login" element={
                                        <PageWrapper pageName="تسجيل الدخول">
                                          <LoginPage />
                                        </PageWrapper>
                                      } />

                                      {/* Main App Routes */}
                                      <Route path="/" element={<MainLayout />}>
                                        <Route index element={<Navigate to="/dashboard" replace />} />
                                        <Route path="dashboard" element={
                                          <PageWrapper pageName="لوحة التحكم">
                                            <Dashboard />
                                          </PageWrapper>
                                        } />
                                        <Route path="accounting" element={
                                          <PageWrapper pageName="المحاسبة">
                                            <Accounting />
                                          </PageWrapper>
                                        } />
                                        <Route path="sales" element={
                                          <PageWrapper pageName="المبيعات">
                                            <Sales />
                                          </PageWrapper>
                                        } />
                                        <Route path="pos" element={
                                          <PageWrapper pageName="نقطة البيع">
                                            <POS />
                                          </PageWrapper>
                                        } />
                                        <Route path="purchases" element={
                                          <PageWrapper pageName="المشتريات">
                                            <Purchases />
                                          </PageWrapper>
                                        } />
                                        <Route path="expenses" element={
                                          <PageWrapper pageName="المصروفات">
                                            <Expenses />
                                          </PageWrapper>
                                        } />
                                        <Route path="invoices" element={
                                          <PageWrapper pageName="الفواتير">
                                            <Invoices />
                                          </PageWrapper>
                                        } />
                                        <Route path="inventory" element={
                                          <PageWrapper pageName="المخزون">
                                            <Inventory />
                                          </PageWrapper>
                                        } />
                                        <Route path="suppliers" element={
                                          <PageWrapper pageName="الموردين">
                                            <Suppliers />
                                          </PageWrapper>
                                        } />
                                        <Route path="customers" element={
                                          <PageWrapper pageName="العملاء">
                                            <Customers />
                                          </PageWrapper>
                                        } />
                                        <Route path="vouchers" element={
                                          <PageWrapper pageName="السندات">
                                            <Vouchers />
                                          </PageWrapper>
                                        } />
                                        <Route path="reports" element={
                                          <PageWrapper pageName="التقارير">
                                            <Reports />
                                          </PageWrapper>
                                        } />
                                        <Route path="settings" element={
                                          <PageWrapper pageName="الإعدادات">
                                            <Settings />
                                          </PageWrapper>
                                        } />
                                        <Route path="activity-log" element={
                                          <PageWrapper pageName="سجل النشاط">
                                            <ActivityLog />
                                          </PageWrapper>
                                        } />
                                      </Route>
                                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                                    </Routes>
                                  </HashRouter>
                                </PrivacyProvider>
                              </VouchersProvider>
                            </SalesProvider>
                          </PurchasesProvider>
                        </InventoryProvider>
                      </FinanceProvider>
                    </SettingsProvider>
                  </SyncProvider>
                </OrganizationProvider>
              </>
            </AppProvider>
          </UserProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
