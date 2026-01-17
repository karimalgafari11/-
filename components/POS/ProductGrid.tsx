import React from 'react';
import { Package } from 'lucide-react';
import { POSProduct } from './types';

interface ProductGridProps {
    products: POSProduct[];
    viewMode: 'grid' | 'list';
    onProductClick: (product: POSProduct) => void;
    formatCurrency: (amount: number) => string;
}

/**
 * شبكة عرض المنتجات
 */
export const ProductGrid: React.FC<ProductGridProps> = ({
    products,
    viewMode,
    onProductClick,
    formatCurrency
}) => {
    if (products.length === 0) {
        return (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-400">
                <Package size={48} className="mb-3" />
                <p className="font-bold">لا توجد منتجات</p>
                <p className="text-xs">جرب تغيير البحث أو الفئة</p>
            </div>
        );
    }

    return (
        <div className={`flex-1 overflow-y-auto p-3 ${viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 auto-rows-min'
                : 'space-y-2'
            }`}>
            {products.map((product) => (
                <button
                    key={product.id}
                    onClick={() => onProductClick(product)}
                    disabled={product.quantity <= 0}
                    className={`
                        ${viewMode === 'grid'
                            ? 'flex flex-col p-3 h-auto'
                            : 'flex items-center gap-3 p-3'
                        }
                        bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700
                        hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10
                        transition-all duration-200 text-start group
                        ${product.quantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    {/* صورة المنتج */}
                    <div className={`
                        ${viewMode === 'grid' ? 'w-full h-20 mb-2' : 'w-14 h-14 flex-shrink-0'}
                        bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800
                        rounded-lg flex items-center justify-center
                    `}>
                        <Package
                            className="text-slate-400 group-hover:text-indigo-500 transition-colors"
                            size={viewMode === 'grid' ? 32 : 24}
                        />
                    </div>

                    {/* معلومات المنتج */}
                    <div className={viewMode === 'grid' ? '' : 'flex-1 min-w-0'}>
                        <p className="font-bold text-slate-800 dark:text-white text-xs truncate">
                            {product.name}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                            {product.sku}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                            <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
                                {formatCurrency(product.salePrice)}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${product.quantity <= 5
                                    ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                                    : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                }`}>
                                {product.quantity}
                            </span>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default ProductGrid;
