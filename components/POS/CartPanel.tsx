import React from 'react';
import { ShoppingCart, Trash2, Plus, Minus, X, User } from 'lucide-react';
import { CartItem } from './types';
import { Customer } from '../../types';
import { GENERAL_CUSTOMER } from '../../types/customers';

interface CartPanelProps {
    cart: CartItem[];
    cartTotal: number;
    cartItemsCount: number;
    customerId: string;
    customers: Customer[];
    onCustomerChange: (customerId: string) => void;
    onUpdateQuantity: (cartItemId: string, quantity: number) => void;
    onRemoveItem: (cartItemId: string) => void;
    onClearCart: () => void;
    onCashPayment: () => void;
    onCreditPayment: () => void;
    formatCurrency: (amount: number) => string;
}

/**
 * لوحة السلة - عرض المنتجات المختارة
 */
export const CartPanel: React.FC<CartPanelProps> = ({
    cart,
    cartTotal,
    cartItemsCount,
    customerId,
    customers,
    onCustomerChange,
    onUpdateQuantity,
    onRemoveItem,
    onClearCart,
    onCashPayment,
    onCreditPayment,
    formatCurrency
}) => {
    return (
        <div className="w-96 flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
            {/* رأس السلة */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                        <ShoppingCart size={20} />
                        السلة
                        {cartItemsCount > 0 && (
                            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                                {cartItemsCount}
                            </span>
                        )}
                    </h2>
                    {cart.length > 0 && (
                        <button
                            onClick={onClearCart}
                            className="text-white/70 hover:text-white text-xs font-bold flex items-center gap-1"
                        >
                            <Trash2 size={14} /> مسح
                        </button>
                    )}
                </div>

                {/* اختيار العميل */}
                <div className="mt-3 flex items-center gap-2 bg-white/10 rounded-lg p-2">
                    <User size={16} className="text-white/70" />
                    <select
                        value={customerId}
                        onChange={(e) => onCustomerChange(e.target.value)}
                        className="flex-1 bg-transparent text-white text-sm font-bold outline-none"
                    >
                        <option value={GENERAL_CUSTOMER.id} className="text-slate-800">
                            {GENERAL_CUSTOMER.name}
                        </option>
                        {customers.map(c => (
                            <option key={c.id} value={c.id} className="text-slate-800">
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* عناصر السلة */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {cart.length > 0 ? cart.map((item) => (
                    <div
                        key={item.id}
                        className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 flex items-center gap-3"
                    >
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 dark:text-white text-xs truncate">
                                {item.product.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                                {formatCurrency(item.price)} × {item.quantity}
                            </p>
                        </div>

                        {/* أزرار الكمية */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                className="w-7 h-7 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="w-8 text-center font-black text-slate-800 dark:text-white text-sm">
                                {item.quantity}
                            </span>
                            <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.quantity}
                                className="w-7 h-7 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-600 transition-colors disabled:opacity-50"
                            >
                                <Plus size={14} />
                            </button>
                        </div>

                        {/* إجمالي العنصر */}
                        <div className="text-end">
                            <p className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
                                {formatCurrency(item.price * item.quantity)}
                            </p>
                        </div>

                        <button
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <ShoppingCart size={48} className="mb-3 opacity-50" />
                        <p className="font-bold">السلة فارغة</p>
                        <p className="text-xs">اضغط على المنتج لإضافته</p>
                    </div>
                )}
            </div>

            {/* تذييل السلة - الإجمالي وأزرار الدفع */}
            <CartFooter
                cartTotal={cartTotal}
                cartEmpty={cart.length === 0}
                customerId={customerId}
                onCashPayment={onCashPayment}
                onCreditPayment={onCreditPayment}
                formatCurrency={formatCurrency}
            />
        </div>
    );
};

/**
 * تذييل السلة - الإجمالي وأزرار الدفع
 */
interface CartFooterProps {
    cartTotal: number;
    cartEmpty: boolean;
    customerId: string;
    onCashPayment: () => void;
    onCreditPayment: () => void;
    formatCurrency: (amount: number) => string;
}

const CartFooter: React.FC<CartFooterProps> = ({
    cartTotal,
    cartEmpty,
    customerId,
    onCashPayment,
    onCreditPayment,
    formatCurrency
}) => {
    return (
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-3">
            {/* الإجمالي */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <span className="text-white/70 font-bold">الإجمالي</span>
                    <span className="text-2xl font-black text-white tabular-nums">
                        {formatCurrency(cartTotal)}
                    </span>
                </div>
            </div>

            {/* أزرار الدفع */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={onCashPayment}
                    disabled={cartEmpty}
                    className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-black py-3 rounded-xl transition-colors"
                >
                    💵 نقدي
                </button>
                <button
                    onClick={onCreditPayment}
                    disabled={cartEmpty || customerId === GENERAL_CUSTOMER.id}
                    className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white font-black py-3 rounded-xl transition-colors"
                >
                    💳 آجل
                </button>
            </div>

            {customerId === GENERAL_CUSTOMER.id && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    ⚠️ البيع الآجل غير متاح للزبون العام
                </p>
            )}
        </div>
    );
};

export default CartPanel;
