
import { useState, useMemo, useCallback } from 'react';
import { SaleItem, InventoryItem } from '../types';

export const useSaleForm = (taxRate: number = 0.15, initialItems: SaleItem[] = []) => {
  const [items, setItems] = useState<SaleItem[]>(initialItems);

  const totals = useMemo(() => {
    const subTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxTotal = items.reduce((sum, item) => sum + item.tax, 0);
    return {
      subTotal,
      taxTotal,
      grandTotal: subTotal + taxTotal,
      itemCount: items.length
    };
  }, [items]);

  const addItem = useCallback((inventoryItem: InventoryItem) => {
    const existing = items.find(i => i.itemId === inventoryItem.id);
    if (existing) {
      setItems(prev => prev.map(i => i.itemId === inventoryItem.id ? {
        ...i,
        quantity: i.quantity + 1,
        tax: (i.quantity + 1) * i.unitPrice * taxRate,
        total: (i.quantity + 1) * i.unitPrice * (1 + taxRate)
      } : i));
    } else {
      const itemPrice = inventoryItem.price || 0;
      const newItem: SaleItem = {
        id: `SI-${Date.now()}-${Math.random()}`,
        itemId: inventoryItem.id,
        sku: inventoryItem.sku || '',
        name: inventoryItem.name,
        quantity: 1,
        unitPrice: itemPrice,
        tax: itemPrice * taxRate,
        total: itemPrice * (1 + taxRate)
      };
      setItems(prev => [...prev, newItem]);
    }
  }, [items, taxRate]);

  // نوع محدد لقيم عناصر الفاتورة
  type SaleItemValue = string | number;

  const updateItem = useCallback((id: string, field: keyof SaleItem, value: SaleItemValue) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.tax = updatedItem.quantity * updatedItem.unitPrice * taxRate;
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice * (1 + taxRate);
        }
        return updatedItem;
      }
      return item;
    }));
  }, [taxRate]);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const resetForm = useCallback(() => setItems([]), []);

  return { items, totals, addItem, updateItem, removeItem, resetForm };
};
