/**
 * صفحة نقطة البيع (POS)
 * تم إعادة هيكلتها لاستخدام مكونات منفصلة
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useSales } from '../context/SalesContext';
import { useSettings } from '../context/SettingsContext';
import { useCurrency } from '../hooks/useCurrency';
import { GENERAL_CUSTOMER } from '../types/customers';
import { Keyboard } from 'lucide-react';

// استيراد المكونات
import {
    POSHeader,
    CategoryTabs,
    ProductGrid,
    CartPanel,
    PaymentModal,
    POSProduct,
    CartItem
} from '../components/POS';

import { Sale } from '../types';

const POSPage: React.FC = () => {
    const { products = [] } = useInventory();
    const { customers = [], addSale } = useSales();
    const { settings } = useSettings();
    const { formatCurrency } = useCurrency();

    // State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [customerId, setCustomerId] = useState(GENERAL_CUSTOMER.id);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit'>('cash');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [amountPaid, setAmountPaid] = useState(0);
    const [barcodeInput, setBarcodeInput] = useState('');

    // تحويل المنتجات لنوع POSProduct
    const posProducts: POSProduct[] = useMemo(() => {
        return products.map(p => ({
            id: p.id,
            name: p.name,
            nameEn: p.nameEn,
            sku: p.sku,
            barcode: p.barcode,
            category: p.category,
            unit: p.unit,
            salePrice: p.salePrice,
            costPrice: p.costPrice,
            quantity: p.quantity,
            minQuantity: p.minQuantity,
            description: p.description,
            image: p.image,
            isActive: p.isActive
        }));
    }, [products]);

    // الفئات
    const categories = useMemo(() => {
        const cats = new Set(posProducts.map(p => p.category).filter(Boolean));
        return ['all', ...Array.from(cats)];
    }, [posProducts]);

    // المنتجات المفلترة
    const filteredProducts = useMemo(() => {
        return posProducts.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.barcode?.includes(searchQuery);
            const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
            return matchesSearch && matchesCategory && p.quantity > 0;
        });
    }, [posProducts, searchQuery, selectedCategory]);

    // حسابات السلة
    const cartTotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [cart]);

    const cartItemsCount = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }, [cart]);

    // إضافة للسلة
    const addToCart = useCallback((product: POSProduct) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                if (existing.quantity >= product.quantity) return prev;
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                id: `cart-${Date.now()}`,
                product,
                quantity: 1,
                price: product.salePrice
            }];
        });
    }, []);

    // تحديث الكمية
    const updateQuantity = useCallback((cartItemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            setCart(prev => prev.filter(item => item.id !== cartItemId));
        } else {
            setCart(prev => prev.map(item =>
                item.id === cartItemId ? { ...item, quantity: newQuantity } : item
            ));
        }
    }, []);

    // حذف من السلة
    const removeFromCart = useCallback((cartItemId: string) => {
        setCart(prev => prev.filter(item => item.id !== cartItemId));
    }, []);

    // مسح السلة
    const clearCart = useCallback(() => {
        setCart([]);
        setAmountPaid(0);
    }, []);

    // مسح الباركود
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && barcodeInput) {
                const product = posProducts.find(p => p.barcode === barcodeInput || p.sku === barcodeInput);
                if (product) {
                    addToCart(product);
                }
                setBarcodeInput('');
            } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey) {
                setBarcodeInput(prev => prev + e.key);
                setTimeout(() => setBarcodeInput(''), 100);
            }
        };

        window.addEventListener('keypress', handleKeyPress);
        return () => window.removeEventListener('keypress', handleKeyPress);
    }, [barcodeInput, posProducts, addToCart]);

    // معالجة البيع
    const processSale = useCallback(() => {
        if (cart.length === 0) return;

        const customer = customers.find(c => c.id === customerId) || GENERAL_CUSTOMER;

        const sale: Sale = {
            id: `POS-${Date.now()}`,
            invoiceNumber: `POS-${Math.floor(100000 + Math.random() * 900000)}`,
            date: new Date().toISOString().split('T')[0],
            customerId: customerId,
            customerName: customer.name,
            items: cart.map(item => ({
                id: item.id,
                itemId: item.product.id,
                name: item.product.name,
                sku: item.product.sku || '',
                quantity: item.quantity,
                unitPrice: item.price,
                total: item.price * item.quantity,
                costPrice: item.product.costPrice || 0,
                discount: 0,
                tax: 0
            })),
            subTotal: cartTotal,
            taxTotal: 0,
            discount: 0,
            netTotal: cartTotal,
            paidAmount: amountPaid,
            remainingAmount: Math.max(0, cartTotal - amountPaid),
            paymentMethod,
            status: 'paid',
            currency: settings.currency?.defaultCurrency || 'IQD'
        };

        addSale(sale);
        clearCart();
        setShowPaymentModal(false);
    }, [cart, customerId, customers, cartTotal, amountPaid, paymentMethod, settings, addSale, clearCart]);

    // فتح نافذة الدفع النقدي
    const handleCashPayment = useCallback(() => {
        setPaymentMethod('cash');
        setAmountPaid(cartTotal);
        setShowPaymentModal(true);
    }, [cartTotal]);

    // الدفع الآجل
    const handleCreditPayment = useCallback(() => {
        setPaymentMethod('credit');
        processSale();
    }, [processSale]);

    return (
        <div className="h-[calc(100vh-120px)] flex gap-4 overflow-hidden">
            {/* الجانب الأيسر - المنتجات */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
                <POSHeader
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />

                <CategoryTabs
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                />

                <ProductGrid
                    products={filteredProducts}
                    viewMode={viewMode}
                    onProductClick={addToCart}
                    formatCurrency={formatCurrency}
                />
            </div>

            {/* الجانب الأيمن - السلة */}
            <CartPanel
                cart={cart}
                cartTotal={cartTotal}
                cartItemsCount={cartItemsCount}
                customerId={customerId}
                customers={customers}
                onCustomerChange={setCustomerId}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
                onClearCart={clearCart}
                onCashPayment={handleCashPayment}
                onCreditPayment={handleCreditPayment}
                formatCurrency={formatCurrency}
            />

            {/* نافذة الدفع */}
            <PaymentModal
                isOpen={showPaymentModal}
                cartTotal={cartTotal}
                amountPaid={amountPaid}
                onAmountChange={setAmountPaid}
                onConfirm={processSale}
                onClose={() => setShowPaymentModal(false)}
                formatCurrency={formatCurrency}
            />

            {/* تلميح اختصارات لوحة المفاتيح */}
            <div className="fixed bottom-4 left-4 flex items-center gap-2 bg-slate-800/90 text-white/70 text-[10px] px-3 py-2 rounded-lg">
                <Keyboard size={14} />
                <span>استخدم ماسح الباركود للإضافة السريعة</span>
            </div>
        </div>
    );
};

export default POSPage;
