
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useSales } from '../context/SalesContext';
import SaleStats from '../components/Sales/SaleStats';
import SaleToolbar from '../components/Sales/SaleToolbar';
import SalesAnalysisEngine from '../components/Sales/Analytics/SalesAnalysisEngine';
import SaleExcelGrid from '../components/Sales/SaleExcelGrid';
import SaleFormModal from '../components/Sales/SaleFormModal';
import SaleDetailModal from '../components/Sales/SaleDetailModal';
import SaleReturnGrid from '../components/Sales/Returns/SaleReturnGrid';
import SaleReturnFormModal from '../components/Sales/Returns/SaleReturnFormModal';
import SaleReturnDetailModal from '../components/Sales/Returns/SaleReturnDetailModal';
import { Sale, SaleReturn } from '../types';

const Sales: React.FC = () => {
  const { showNotification } = useApp();
  // إضافة قيم افتراضية آمنة لمنع الأخطاء
  const { sales = [], addSale, updateSale, deleteSale, salesReturns = [] } = useSales();

  const handleEditSale = (sale: Sale) => {
    setSelectedSale(sale);
    setIsFormOpen(true);
  };

  const handleDeleteSale = (id: string) => {
    deleteSale(id);
    showNotification('تم حذف الفاتورة بنجاح', 'info');
  };

  // State
  const [activeTab, setActiveTab] = useState<'all' | 'credit' | 'analytics' | 'returns'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Returns State
  const [isReturnFormOpen, setIsReturnFormOpen] = useState(false);
  const [isReturnDetailOpen, setIsReturnDetailOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<SaleReturn | null>(null);

  // Stats - Memoized
  const stats = useMemo(() => ({
    totalSales: sales.reduce((sum, s) => sum + (s.baseGrandTotal || (s.saleCurrency === 'SAR' ? s.grandTotal : 0)), 0),
    cashSales: sales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + (s.baseGrandTotal || (s.saleCurrency === 'SAR' ? s.grandTotal : 0)), 0),
    creditSales: sales.filter(s => s.paymentMethod === 'credit').reduce((sum, s) => sum + (s.baseGrandTotal || (s.saleCurrency === 'SAR' ? s.grandTotal : 0)), 0),
    invoiceCount: sales.length
  }), [sales]);

  // Filtering
  const filteredSales = useMemo(() => {
    const q = searchQuery.toLowerCase();

    if (activeTab === 'returns') {
      return salesReturns.filter(r =>
        r.returnNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q)
      );
    }

    let data = sales.filter(s =>
      s.invoiceNumber.toLowerCase().includes(q) ||
      s.customerName.toLowerCase().includes(q)
    );
    if (activeTab === 'credit') data = data.filter(s => s.paymentMethod === 'credit');
    return data;
  }, [sales, salesReturns, searchQuery, activeTab]);

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailOpen(true);
  };

  const handleViewReturnDetails = (ret: SaleReturn) => {
    setSelectedReturn(ret);
    setIsReturnDetailOpen(true);
  };

  if (activeTab === 'analytics') {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <SaleToolbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onNewSale={() => setIsFormOpen(true)}
        />
        <SalesAnalysisEngine sales={sales} returns={salesReturns} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 select-none">
      <SaleToolbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onNewSale={() => setIsFormOpen(true)}
        onNewReturn={() => setIsReturnFormOpen(true)}
      />

      <SaleStats stats={stats} />

      {activeTab === 'returns' ? (
        <SaleReturnGrid
          data={filteredSales as any} // TypeScript trick as filteredSales returns Returns or Sales based on tab
          onView={handleViewReturnDetails}
        />
      ) : (
        <SaleExcelGrid
          data={filteredSales as Sale[]}
          onViewAction={handleViewDetails}
          onEditAction={handleEditSale}
          onDeleteAction={handleDeleteSale}
        />
      )}

      <SaleFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={(sale) => {
          addSale(sale);
          showNotification(`تم إصدار الفاتورة ${sale.invoiceNumber} بنجاح`);
        }}
      />

      <SaleDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        sale={selectedSale}
      />

      <SaleReturnFormModal
        isOpen={isReturnFormOpen}
        onClose={() => setIsReturnFormOpen(false)}
      />

      <SaleReturnDetailModal
        isOpen={isReturnDetailOpen}
        onClose={() => setIsReturnDetailOpen(false)}
        returnRecord={selectedReturn}
      />
    </div>
  );
};

export default Sales;
