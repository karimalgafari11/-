/**
 * أنواع نموذج المبيعات
 */

import { Sale, Customer, SaleItem } from '../../../types';

export interface SaleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (sale: Sale) => void;
}

export interface InvoiceHeaderProps {
    company: {
        name?: string;
        logo?: string;
        phone?: string;
        address?: string;
    };
}

export interface CurrencySelectorProps {
    saleCurrency: string;
    baseCurrency: string;
    currentRate: number;
    activeCurrencies: { code: string; nameAr: string; symbol: string }[];
    onCurrencyChange: (currency: string) => void;
}

export interface ItemsTableProps {
    items: SaleItem[];
    selectedCurrency: { symbol: string } | undefined;
    onQuantityChange: (itemId: string, quantity: number) => void;
    onPriceChange: (itemId: string, price: number) => void;
    onRemoveItem: (itemId: string) => void;
    onAddItem: () => void;
    convertPrice: (price: number) => number;
    handleKeyDown: (e: React.KeyboardEvent, rowIndex: number, colIndex: number) => void;
    setInputRef: (rowIndex: number, colIndex: number) => (el: HTMLInputElement | null) => void;
}

export interface InvoiceSummaryProps {
    subtotal: number;
    displayAmount: number;
    selectedCurrency: { symbol: string; nameAr: string } | undefined;
}

export interface FormActionsProps {
    onClose: () => void;
    onSubmit: () => void;
    disabled: boolean;
}
