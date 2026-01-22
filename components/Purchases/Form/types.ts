/**
 * أنواع نموذج المشتريات
 */

import { Purchase, Supplier, PurchaseItem } from '../../../types';

export interface PurchaseFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (purchase: Purchase) => void;
}

export interface PurchaseInvoiceHeaderProps {
    company: {
        name?: string;
        logo?: string;
        phone?: string;
        address?: string;
    };
}

export interface PurchaseCurrencySelectorProps {
    currency: string;
    selectedCurrency: { nameAr: string; symbol: string } | undefined;
    activeCurrencies: { code: string; nameAr: string; symbol: string }[];
    onCurrencyChange: (currency: string) => void;
}

export interface PurchaseItemsTableProps {
    items: PurchaseItem[];
    selectedCurrency: { symbol: string } | undefined;
    onQuantityChange: (itemId: string, quantity: number) => void;
    onCostChange: (itemId: string, cost: number) => void;
    onRemoveItem: (itemId: string) => void;
    onAddItem: () => void;
}

export interface PurchaseSummaryProps {
    grandTotal: number;
    selectedCurrency: { symbol: string; nameAr: string } | undefined;
}

export interface PurchaseFormActionsProps {
    onClose: () => void;
    onSubmit: () => void;
    disabled: boolean;
}
