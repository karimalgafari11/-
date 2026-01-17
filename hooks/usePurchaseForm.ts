
import { useState, useMemo, useCallback } from 'react';
import { PurchaseItem, InventoryItem } from '../types';

export const usePurchaseForm = (initialItems: PurchaseItem[] = []) => {
  const [items, setItems] = useState<PurchaseItem[]>(initialItems);

  const totals = useMemo(() => {
    const subTotal = items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
    const taxTotal = subTotal * 0.15; // الضريبة الافتراضية 15%
    return {
      subTotal,
      taxTotal,
      grandTotal: subTotal + taxTotal,
      itemCount: items.length
    };
  }, [items]);

  const addItem = useCallback((inventoryItem: InventoryItem, warehouseId: string) => {
    const existing = items.find(i => i.itemId === inventoryItem.id && i.warehouseId === warehouseId);
    if (existing) {
      // دمج الأصناف المكررة
      setItems(prev => prev.map(i => i.itemId === inventoryItem.id && i.warehouseId === warehouseId ? {
        ...i,
        quantity: i.quantity + 1,
        tax: (i.quantity + 1) * i.costPrice * 0.15,
        total: (i.quantity + 1) * i.costPrice * 1.15
      } : i));
    } else {
      const newItem: PurchaseItem = {
        id: `PI-${Date.now()}-${Math.random()}`,
        itemId: inventoryItem.id,
        name: inventoryItem.name,
        quantity: 1,
        costPrice: inventoryItem.costPrice,
        tax: inventoryItem.costPrice * 0.15,
        total: inventoryItem.costPrice * 1.15,
        warehouseId: warehouseId
      };
      setItems(prev => [...prev, newItem]);
    }
  }, [items]);

  const updateItem = useCallback((id: string, field: keyof PurchaseItem, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'costPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.costPrice * 1.15;
          updatedItem.tax = updatedItem.quantity * updatedItem.costPrice * 0.15;
        }
        return updatedItem;
      }
      return item;
    }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const resetItems = useCallback(() => setItems([]), []);

  return {
    items,
    totals,
    addItem,
    updateItem,
    removeItem,
    resetItems
  };
};
