
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { usePurchases } from '../context/PurchasesContext';
import PurchaseStats from '../components/Purchases/PurchaseStats';
import PurchaseToolbar from '../components/Purchases/PurchaseToolbar';
import PurchaseAnalysisEngine from '../components/Purchases/Analytics/PurchaseAnalysisEngine';
import PurchaseExcelGrid from '../components/Purchases/PurchaseExcelGrid';
import PurchaseFormModal from '../components/Purchases/PurchaseFormModal';
import PurchaseDetailModal from '../components/Purchases/PurchaseDetailModal';
import SupplierPaymentModal from '../components/Purchases/SupplierPaymentModal';
import PurchaseReturnGrid from '../components/Purchases/Returns/PurchaseReturnGrid';
import PurchaseReturnFormModal from '../components/Purchases/Returns/PurchaseReturnFormModal';
import PurchaseReturnDetailModal from '../components/Purchases/Returns/PurchaseReturnDetailModal';
import { Purchase, PurchaseReturn } from '../types';

/**
 * Purchases Page - Orchestrator
 * المسؤول عن إدارة الحالة العامة لوحدة المشتريات وتنسيق المكونات الفرعية.
 */
const Purchases: React.FC = () => {
  const { showNotification } = useApp();
  // إضافة قيم افتراضية آمنة لمنع الأخطاء
  const {
    purchases = [],
    suppliers = [],
    addPurchase,
    updatePurchase,
    deletePurchase,
    addSupplierPayment,
    purchaseReturns = []
  } = usePurchases();

  const handleEditPurchase = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsFormOpen(true);
  };

  const handleDeletePurchase = (id: string) => {
    deletePurchase(id);
  };

  // State Management
  const [activeTab, setActiveTab] = useState<'all' | 'credit' | 'payments' | 'returns' | 'analytics'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  // Returns State
  const [isReturnFormOpen, setIsReturnFormOpen] = useState(false);
  const [isReturnDetailOpen, setIsReturnDetailOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<PurchaseReturn | null>(null);

  // Derived Data - Memoized for Performance
  const stats = useMemo(() => {
    const totalDebt = suppliers.reduce((sum, s) => sum + (s.balance || 0), 0);
    const overdueCount = purchases.filter(p => p.paymentMethod === 'credit' && p.paymentStatus !== 'paid').length;
    return {
      totalPurchases: purchases.reduce((sum, p) => sum + (p.grandTotal || 0), 0),
      totalDebt,
      overdueCount,
      invoiceCount: purchases.length
    };
  }, [purchases, suppliers]);

  const filteredPurchases = useMemo(() => {
    const q = searchQuery.toLowerCase();

    if (activeTab === 'returns') {
      return purchaseReturns.filter(r =>
        r.returnNumber.toLowerCase().includes(q) ||
        r.supplierName.toLowerCase().includes(q)
      );
    }

    let data = purchases.filter(p =>
      p.invoiceNumber.toLowerCase().includes(q) ||
      (p.supplierName || '').toLowerCase().includes(q)
    );
    if (activeTab === 'credit') data = data.filter(p => p.paymentMethod === 'credit');
    return data;
  }, [purchases, purchaseReturns, searchQuery, activeTab]);

  // Handlers
  const handleViewDetails = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsDetailOpen(true);
  };

  const handleViewReturnDetails = (ret: PurchaseReturn) => {
    setSelectedReturn(ret);
    setIsReturnDetailOpen(true);
  };

  if (activeTab === 'analytics') {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <PurchaseToolbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onNewPurchase={() => setIsFormOpen(true)}
          onNewPayment={() => setIsPaymentOpen(true)}
          onNewReturn={() => setIsReturnFormOpen(true)}
        />
        <PurchaseAnalysisEngine purchases={purchases} returns={purchaseReturns} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 select-none">
      {/* 1. Header & Navigation Section */}
      <PurchaseToolbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onNewPurchase={() => setIsFormOpen(true)}
        onNewPayment={() => setIsPaymentOpen(true)}
        onNewReturn={() => setIsReturnFormOpen(true)}
      />

      {/* 2. Key Metrics Section */}
      <PurchaseStats stats={stats} />

      {/* 3. Main Data Engine (Excel Grid) */}
      {activeTab === 'returns' ? (
        <PurchaseReturnGrid
          data={filteredPurchases as any}
          onView={handleViewReturnDetails}
        />
      ) : (
        <PurchaseExcelGrid
          data={filteredPurchases as Purchase[]}
          onRowDoubleClick={handleViewDetails}
          onViewAction={handleViewDetails}
          onEditAction={handleEditPurchase}
          onDeleteAction={handleDeletePurchase}
        />
      )}

      {/* 4. Modals Layer */}
      <PurchaseFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={addPurchase}
      />

      <SupplierPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSave={addSupplierPayment}
      />

      <PurchaseDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        purchase={selectedPurchase}
      />

      <PurchaseReturnFormModal
        isOpen={isReturnFormOpen}
        onClose={() => setIsReturnFormOpen(false)}
      />

      <PurchaseReturnDetailModal
        isOpen={isReturnDetailOpen}
        onClose={() => setIsReturnDetailOpen(false)}
        returnRecord={selectedReturn}
      />
    </div>
  );
};

export default Purchases;
