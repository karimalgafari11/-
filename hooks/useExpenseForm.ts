
import { useState, useMemo, useCallback } from 'react';

export const useExpenseForm = () => {
  const [formData, setFormData] = useState({
    amount: 0,
    includeTax: true,
    description: '',
    category: '',
    paymentMethod: 'cash' as 'cash' | 'bank' | 'credit',
    date: new Date().toISOString().split('T')[0]
  });

  const calculations = useMemo(() => {
    const taxRate = formData.includeTax ? 0.15 : 0;
    const tax = formData.amount * taxRate;
    return {
      tax,
      total: formData.amount + tax
    };
  }, [formData.amount, formData.includeTax]);

  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      amount: 0,
      includeTax: true,
      description: '',
      category: '',
      paymentMethod: 'cash',
      date: new Date().toISOString().split('T')[0]
    });
  }, []);

  return {
    formData,
    calculations,
    updateField,
    resetForm
  };
};
