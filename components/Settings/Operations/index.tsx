/**
 * Operations Settings - Main Component
 * المكون الرئيسي لإعدادات العمليات
 */

import React, { useState } from 'react';
import SalesSettings from './SalesSettings';
import PurchasesSettings from './PurchasesSettings';
import InventorySettings from './InventorySettings';
import {
    ShoppingCart, Package, Warehouse, Tag, Percent, Receipt
} from 'lucide-react';

// Lazy imports for code splitting
const ProductsSettings = React.lazy(() => import('./ProductsSettings'));
const TaxSettings = React.lazy(() => import('./TaxSettings'));
const InvoiceSettings = React.lazy(() => import('./InvoiceSettings'));

type OperationsTab = 'sales' | 'purchases' | 'inventory' | 'products' | 'tax' | 'invoice';

const OperationsSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<OperationsTab>('sales');

    const tabs = [
        { id: 'sales', label: 'المبيعات', icon: ShoppingCart, color: 'text-green-500' },
        { id: 'purchases', label: 'المشتريات', icon: Package, color: 'text-blue-500' },
        { id: 'inventory', label: 'المخزون', icon: Warehouse, color: 'text-amber-500' },
        { id: 'products', label: 'المنتجات', icon: Tag, color: 'text-purple-500' },
        { id: 'tax', label: 'الضرائب', icon: Percent, color: 'text-red-500' },
        { id: 'invoice', label: 'الفواتير', icon: Receipt, color: 'text-indigo-500' }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'sales':
                return <SalesSettings />;
            case 'purchases':
                return <PurchasesSettings />;
            case 'inventory':
                return <InventorySettings />;
            case 'products':
                return (
                    <React.Suspense fallback={<div className="p-8 text-center">جاري التحميل...</div>}>
                        <ProductsSettings />
                    </React.Suspense>
                );
            case 'tax':
                return (
                    <React.Suspense fallback={<div className="p-8 text-center">جاري التحميل...</div>}>
                        <TaxSettings />
                    </React.Suspense>
                );
            case 'invoice':
                return (
                    <React.Suspense fallback={<div className="p-8 text-center">جاري التحميل...</div>}>
                        <InvoiceSettings />
                    </React.Suspense>
                );
            default:
                return <SalesSettings />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as OperationsTab)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-1 justify-center ${activeTab === tab.id
                                ? 'bg-white dark:bg-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon size={14} className={activeTab === tab.id ? tab.color : ''} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {renderContent()}
        </div>
    );
};

export default OperationsSettings;
