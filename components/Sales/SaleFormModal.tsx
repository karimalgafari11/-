/**
 * نموذج المبيعات المُحسَّن
 * 
 * تم تقسيم المكونات إلى:
 * - InvoiceHeader - رأس الفاتورة
 * - CurrencySelector - محدد العملة
 * - ItemsTable - جدول البنود
 * - InvoiceSummary - ملخص الفاتورة
 * - FormActions - أزرار التحكم
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import Modal from '../Common/Modal';
import { useApp } from '../../context/AppContext';
import { useSales } from '../../context/SalesContext';
import { useSettings } from '../../context/SettingsContext';
import { useSaleForm } from '../../hooks/useSaleForm';
import { useCurrency, DEFAULT_SALE_CURRENCY } from '../../hooks/useCurrency';
import SaleFormHeader from './Form/SaleFormHeader';
import ItemSelectorModal from './ItemSelectorModal';
import { Sale } from '../../types';
import {
  InvoiceHeader,
  CurrencySelector,
  ItemsTable,
  InvoiceSummary,
  FormActions
} from './Form';

interface SaleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sale: Sale) => void;
}

const SaleFormModal: React.FC<SaleFormModalProps> = ({ isOpen, onClose, onSave }) => {
  const { settings } = useApp();
  const { settings: fullSettings } = useSettings();
  const { customers } = useSales();
  const { items, totals, addItem, updateItem, removeItem, resetForm } = useSaleForm(0);
  const {
    activeCurrencies,
    calculateSaleAmount,
    getCurrentRate,
    BASE_CURRENCY,
    getCurrency
  } = useCurrency();

  const [customerId, setCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | 'bank'>('cash');
  const [saleCurrency, setSaleCurrency] = useState(DEFAULT_SALE_CURRENCY);
  const [isItemSelectorOpen, setIsItemSelectorOpen] = useState(false);

  const company = fullSettings.company;
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  const convertedTotals = useMemo(() => {
    return calculateSaleAmount(totals.subTotal, saleCurrency);
  }, [totals.subTotal, saleCurrency, calculateSaleAmount]);

  const currentRate = useMemo(() => {
    return getCurrentRate(BASE_CURRENCY, saleCurrency);
  }, [saleCurrency, getCurrentRate, BASE_CURRENCY]);

  const selectedCurrency = useMemo(() => {
    return getCurrency(saleCurrency);
  }, [saleCurrency, getCurrency]);

  const convertPrice = useCallback((priceInSAR: number) => {
    if (saleCurrency === BASE_CURRENCY) return priceInSAR;
    return priceInSAR * currentRate;
  }, [saleCurrency, currentRate, BASE_CURRENCY]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
    const moveToCell = (newRow: number, newCol: number) => {
      const input = inputRefs.current[newRow]?.[newCol];
      if (input) {
        e.preventDefault();
        input.focus();
        input.select();
      }
    };

    switch (e.key) {
      case 'ArrowDown':
      case 'Enter':
        if (rowIndex < items.length - 1) {
          moveToCell(rowIndex + 1, colIndex);
        }
        break;
      case 'ArrowUp':
        if (rowIndex > 0) {
          moveToCell(rowIndex - 1, colIndex);
        }
        break;
      case 'ArrowRight':
      case 'Tab':
        if (!e.shiftKey && colIndex < 1) {
          moveToCell(rowIndex, colIndex + 1);
        } else if (!e.shiftKey && colIndex === 1 && rowIndex < items.length - 1) {
          moveToCell(rowIndex + 1, 0);
        }
        break;
      case 'ArrowLeft':
        if (colIndex > 0) {
          moveToCell(rowIndex, colIndex - 1);
        } else if (colIndex === 0 && rowIndex > 0) {
          moveToCell(rowIndex - 1, 1);
        }
        break;
    }
  }, [items.length]);

  const setInputRef = useCallback((rowIndex: number, colIndex: number) => (el: HTMLInputElement | null) => {
    if (!inputRefs.current[rowIndex]) {
      inputRefs.current[rowIndex] = [];
    }
    inputRefs.current[rowIndex][colIndex] = el;
  }, []);

  const handleSubmit = useCallback(() => {
    if (items.length === 0) return;
    const customer = customers.find(c => c.id === customerId);

    const sale: Sale = {
      id: `SALE-${Date.now()}`,
      invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString().split('T')[0],
      customerId: customerId || 'general-customer',
      customerName: customer?.companyName || customer?.name || 'زبون عام',
      items,
      subTotal: totals.subTotal,
      taxTotal: 0,
      discount: 0,
      grandTotal: convertedTotals.displayAmount,
      paymentMethod,
      status: paymentMethod === 'credit' ? 'pending' : 'paid',
      saleCurrency: saleCurrency,
      exchangeRateUsed: convertedTotals.exchangeRate,
      baseGrandTotal: totals.subTotal
    };

    onSave(sale);
    resetForm();
    setCustomerId('');
    setSaleCurrency(DEFAULT_SALE_CURRENCY);
    onClose();
  }, [items, customers, customerId, totals, convertedTotals, paymentMethod, saleCurrency, onSave, resetForm, onClose]);

  const handlePriceChange = useCallback((itemId: string, priceInSaleCurrency: number) => {
    const priceInSAR = saleCurrency === BASE_CURRENCY ? priceInSaleCurrency : priceInSaleCurrency / currentRate;
    updateItem(itemId, 'unitPrice', priceInSAR);
  }, [saleCurrency, BASE_CURRENCY, currentRate, updateItem]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="full">
      <div className="space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <InvoiceHeader company={company} />

        <SaleFormHeader
          customers={customers}
          customerId={customerId}
          setCustomerId={setCustomerId}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
        />

        <CurrencySelector
          saleCurrency={saleCurrency}
          baseCurrency={BASE_CURRENCY}
          currentRate={currentRate}
          activeCurrencies={activeCurrencies}
          onCurrencyChange={setSaleCurrency}
        />

        <ItemsTable
          items={items}
          selectedCurrency={selectedCurrency}
          onQuantityChange={(id, qty) => updateItem(id, 'quantity', qty)}
          onPriceChange={handlePriceChange}
          onRemoveItem={removeItem}
          onAddItem={() => setIsItemSelectorOpen(true)}
          convertPrice={convertPrice}
          handleKeyDown={handleKeyDown}
          setInputRef={setInputRef}
        />

        <InvoiceSummary
          subtotal={totals.subTotal}
          displayAmount={convertedTotals.displayAmount}
          selectedCurrency={selectedCurrency}
        />

        <FormActions
          onClose={onClose}
          onSubmit={handleSubmit}
          disabled={!customerId || items.length === 0}
        />
      </div>

      <ItemSelectorModal
        isOpen={isItemSelectorOpen}
        onClose={() => setIsItemSelectorOpen(false)}
        onSelect={(item) => addItem(item)}
      />
    </Modal>
  );
};

export default SaleFormModal;
