/**
 * نموذج المشتريات المُحسَّن
 * 
 * تم تقسيم المكونات إلى:
 * - PurchaseInvoiceHeader - رأس الفاتورة
 * - PurchaseCurrencySelector - محدد العملة
 * - PurchaseItemsTable - جدول البنود
 * - PurchaseSummary - ملخص الفاتورة
 * - PurchaseFormActions - أزرار التحكم
 * - PurchaseFormHeader - معلومات المورد
 */

import React, { useState, useCallback } from 'react';
import Modal from '../Common/Modal';
import { usePurchases } from '../../context/PurchasesContext';
import { useInventory } from '../../context/InventoryContext';
import { useSettings } from '../../context/SettingsContext';
import { usePurchaseForm } from '../../hooks/usePurchaseForm';
import { useCurrency, DEFAULT_PURCHASE_CURRENCY } from '../../hooks/useCurrency';
import ItemSelectorModal from '../Sales/ItemSelectorModal';
import { Purchase } from '../../types';
import {
  PurchaseInvoiceHeader,
  PurchaseCurrencySelector,
  PurchaseItemsTable,
  PurchaseSummary,
  PurchaseFormActions,
  PurchaseFormHeader
} from './Form';

interface PurchaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (purchase: Purchase) => void;
}

const PurchaseFormModal: React.FC<PurchaseFormModalProps> = ({ isOpen, onClose, onSave }) => {
  const { suppliers } = usePurchases();
  const { warehouses } = useInventory();
  const { settings: fullSettings } = useSettings();
  const { items, totals, addItem, updateItem, removeItem, resetItems } = usePurchaseForm();
  const { activeCurrencies, getCurrency } = useCurrency();

  const [supplierId, setSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [reference, setReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit'>('cash');
  const [currency, setCurrency] = useState(DEFAULT_PURCHASE_CURRENCY);
  const [isItemSelectorOpen, setIsItemSelectorOpen] = useState(false);

  const selectedCurrency = getCurrency(currency);
  const company = fullSettings.company;
  const grandTotal = items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);

  const handleSubmit = useCallback(() => {
    if (!supplierId || items.length === 0) return;
    const supplier = suppliers.find(s => s.id === supplierId);

    const purchase: Purchase = {
      id: `PUR-${Date.now()}`,
      invoiceNumber: `PUR-INV-${Math.floor(1000 + Math.random() * 9000)}`,
      referenceNumber: reference,
      date: new Date().toISOString().split('T')[0],
      supplierId,
      supplierName: supplierName || supplier?.name || supplier?.companyName || 'مورد عام',
      items,
      subTotal: grandTotal,
      taxTotal: 0,
      grandTotal: grandTotal,
      paymentMethod,
      status: 'completed',
      currency: currency
    };

    onSave(purchase);
    resetItems();
    setSupplierId('');
    setSupplierName('');
    setReference('');
    setCurrency(DEFAULT_PURCHASE_CURRENCY);
    onClose();
  }, [supplierId, items, suppliers, supplierName, reference, grandTotal, paymentMethod, currency, onSave, resetItems, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="full">
      <div className="space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <PurchaseInvoiceHeader company={company} />

        <PurchaseFormHeader
          suppliers={suppliers}
          warehouses={warehouses}
          supplierId={supplierId}
          supplierName={supplierName}
          setSupplierId={setSupplierId}
          setSupplierName={setSupplierName}
          warehouseId={warehouseId}
          setWarehouseId={setWarehouseId}
          reference={reference}
          setReference={setReference}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
        />

        <PurchaseCurrencySelector
          currency={currency}
          selectedCurrency={selectedCurrency}
          activeCurrencies={activeCurrencies}
          onCurrencyChange={setCurrency}
        />

        <PurchaseItemsTable
          items={items}
          selectedCurrency={selectedCurrency}
          onQuantityChange={(id, qty) => updateItem(id, 'quantity', qty)}
          onCostChange={(id, cost) => updateItem(id, 'costPrice', cost)}
          onRemoveItem={removeItem}
          onAddItem={() => setIsItemSelectorOpen(true)}
        />

        <PurchaseSummary
          grandTotal={grandTotal}
          selectedCurrency={selectedCurrency}
        />

        <PurchaseFormActions
          onClose={onClose}
          onSubmit={handleSubmit}
          disabled={!supplierId || items.length === 0}
        />
      </div>

      <ItemSelectorModal
        isOpen={isItemSelectorOpen}
        onClose={() => setIsItemSelectorOpen(false)}
        onSelect={(item) => addItem(item, warehouseId || warehouses[0]?.id)}
      />
    </Modal>
  );
};

export default PurchaseFormModal;
