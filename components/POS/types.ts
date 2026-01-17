/**
 * نوع المنتج في نقطة البيع
 */
export interface POSProduct {
    id: string;
    name: string;
    nameEn?: string;
    sku: string;
    barcode?: string;
    category: string;
    unit: string;
    salePrice: number;
    costPrice: number;
    quantity: number;
    minQuantity: number;
    description?: string;
    image?: string;
    isActive: boolean;
}

/**
 * عنصر في السلة
 */
export interface CartItem {
    id: string;
    product: POSProduct;
    quantity: number;
    price: number;
}

/**
 * إعدادات الدفع
 */
export interface PaymentSettings {
    customerId: string;
    paymentMethod: 'cash' | 'credit';
    amountPaid: number;
}

/**
 * مبالغ سريعة للدفع
 */
export const QUICK_AMOUNTS = [1000, 5000, 10000, 25000, 50000, 100000];
