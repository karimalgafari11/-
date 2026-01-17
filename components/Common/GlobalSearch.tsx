import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Box, Users, FileText, Building2, Wallet, X, ChevronRight } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useSales } from '../../context/SalesContext';
import { usePurchases } from '../../context/PurchasesContext';
import { useFinance } from '../../context/FinanceContext';
import { useSettings } from '../../context/SettingsContext';

interface SearchResult {
    id: string;
    type: 'item' | 'customer' | 'supplier' | 'invoice' | 'purchase' | 'company' | 'account' | 'voucher';
    title: string;
    subtitle: string;
    link: string;
    icon: React.ElementType;
}

const GlobalSearch: React.FC = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Contexts
    const { inventory: items } = useInventory();
    const { customers, invoices: saleInvoices } = useSales();
    const { suppliers, purchases } = usePurchases();
    const { expenses } = useFinance();
    const { companies } = useSettings();

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search Logic
    useEffect(() => {
        if (!query || query.length < 2) {
            setResults([]);
            return;
        }

        const q = query.toLowerCase();
        const searchResults: SearchResult[] = [];

        // 1. Inventory Items (Name, Part Number, SKU)
        items.forEach(item => {
            if (
                item.name.toLowerCase().includes(q) ||
                (item.itemNumber && item.itemNumber.toLowerCase().includes(q)) ||
                (item.sku && item.sku.toLowerCase().includes(q))
            ) {
                searchResults.push({
                    id: item.id,
                    type: 'item',
                    title: item.name,
                    subtitle: `SKU: ${item.sku || '-'} | الكمية: ${item.quantity}`,
                    link: '/inventory',
                    icon: Box
                });
            }
        });

        // 2. Customers
        customers.forEach(castomer => {
            if (
                castomer.name.toLowerCase().includes(q) ||
                (castomer.phone && castomer.phone.includes(q))
            ) {
                searchResults.push({
                    id: castomer.id,
                    type: 'customer',
                    title: castomer.name,
                    subtitle: castomer.phone || 'لا يوجد هاتف',
                    link: '/customers',
                    icon: Users
                });
            }
        });

        // 3. Suppliers
        suppliers.forEach(supplier => {
            if (
                supplier.name.toLowerCase().includes(q) ||
                (supplier.phone && supplier.phone.includes(q))
            ) {
                searchResults.push({
                    id: supplier.id,
                    type: 'supplier',
                    title: supplier.name,
                    subtitle: supplier.phone || 'لا يوجد هاتف',
                    link: '/suppliers',
                    icon: Building2
                });
            }
        });

        // 4. Sales Invoices
        saleInvoices.forEach(inv => {
            if (
                inv.invoiceNumber.toLowerCase().includes(q) ||
                inv.customerName.toLowerCase().includes(q)
            ) {
                searchResults.push({
                    id: inv.id,
                    type: 'invoice',
                    title: `فاتورة مبيعات #${inv.invoiceNumber}`,
                    subtitle: `العميل: ${inv.customerName} | القيمة: ${inv.amount}`,
                    link: '/sales',
                    icon: FileText
                });
            }
        });

        // 5. Purchases (Invoices)
        purchases.forEach(pur => {
            if (
                pur.invoiceNumber.toLowerCase().includes(q) ||
                pur.supplierName.toLowerCase().includes(q)
            ) {
                searchResults.push({
                    id: pur.id,
                    type: 'purchase',
                    title: `فاتورة مشتريات #${pur.invoiceNumber}`,
                    subtitle: `المورد: ${pur.supplierName} | القيمة: ${pur.grandTotal}`,
                    link: '/purchases',
                    icon: FileText
                });
            }
        });

        // 6. Companies
        companies.forEach(company => {
            if (company.name.toLowerCase().includes(q)) {
                searchResults.push({
                    id: company.id,
                    type: 'company',
                    title: company.name,
                    subtitle: 'شركة',
                    link: '/settings',
                    icon: Building2
                });
            }
        });

        setResults(searchResults.slice(0, 10));
    }, [query, items, customers, suppliers, saleInvoices, purchases, companies]);

    const handleSelect = (result: SearchResult) => {
        navigate(result.link);
        setIsOpen(false);
        setQuery('');
    };

    const getGroupLabel = (type: string) => {
        switch (type) {
            case 'item': return 'المنتجات';
            case 'customer': return 'العملاء';
            case 'supplier': return 'الموردين';
            case 'invoice': return 'فواتير المبيعات';
            case 'purchase': return 'فواتير المشتريات';
            case 'company': return 'الشركات';
            default: return 'أخرى';
        }
    };

    return (
        <div ref={searchRef} className="relative w-full max-w-md hidden md:block">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="ابحث عن العميل، الصنف، الفاتورة..."
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all text-slate-700 dark:text-slate-200"
                />
                <div className="absolute right-3 top-2.5 text-slate-400">
                    <Search size={18} />
                </div>
                {query && (
                    <button
                        onClick={() => { setQuery(''); setResults([]); }}
                        className="absolute left-3 top-2.5 text-slate-400 hover:text-red-500"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {isOpen && query.length >= 2 && (
                <div className="absolute top-full right-0 w-full mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 max-h-[400px] overflow-y-auto no-scrollbar z-50 animate-in fade-in slide-in-from-top-2">
                    {results.length > 0 ? (
                        <div className="py-2">
                            {results.reduce((acc: React.ReactNode[], result, index, array) => {
                                const prevType = index > 0 ? array[index - 1].type : null;
                                if (result.type !== prevType) {
                                    acc.push(
                                        <div key={`header-${result.type}`} className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0">
                                            {getGroupLabel(result.type)}
                                        </div>
                                    );
                                }
                                acc.push(
                                    <button
                                        key={result.id}
                                        onClick={() => handleSelect(result)}
                                        className="w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-right border-b border-slate-50 dark:border-slate-800/50 last:border-0"
                                    >
                                        <div className={`p-2 rounded-lg ${result.type === 'item' ? 'bg-blue-50 text-blue-600' :
                                            result.type === 'customer' ? 'bg-emerald-50 text-emerald-600' :
                                                result.type === 'supplier' ? 'bg-purple-50 text-purple-600' :
                                                    result.type === 'company' ? 'bg-slate-100 text-slate-600' :
                                                        'bg-amber-50 text-amber-600'
                                            }`}>
                                            <result.icon size={18} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{result.title}</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">{result.subtitle}</p>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-300 mt-1 opacity-0 group-hover:opacity-100" />
                                    </button>
                                );
                                return acc;
                            }, [])}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-500">
                            <p className="text-sm">لا توجد نتائج مطابقة لـ "{query}"</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
