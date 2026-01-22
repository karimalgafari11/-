/**
 * SearchableSelect Component - مكون البحث المنبثق
 * قائمة بحث منبثقة قابلة لإعادة الاستخدام للعملاء والموردين وغيرها
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface SelectItem {
    id: string;
    name: string;
    subtext?: string;
}

interface SearchableSelectProps {
    items: SelectItem[];
    value: string;
    selectedName: string;
    onSelect: (id: string, name: string) => void;
    onClear: () => void;
    placeholder?: string;
    emptyMessage?: string;
    noItemsMessage?: string;
    label?: string;
    maxItems?: number;
    className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
    items,
    value,
    selectedName,
    onSelect,
    onClear,
    placeholder = 'ابحث...',
    emptyMessage = 'لا توجد نتائج للبحث',
    noItemsMessage = 'لا توجد عناصر مسجلة',
    label,
    maxItems = 10,
    className = '',
}) => {
    const { theme } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [showList, setShowList] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // فلترة العناصر حسب البحث
    const filteredItems = searchTerm.trim()
        ? items.filter(item =>
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.subtext?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : items;

    // إغلاق القائمة عند النقر خارجها
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowList(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (item: SelectItem) => {
        onSelect(item.id, item.name);
        setShowList(false);
        setSearchTerm('');
    };

    const handleClear = () => {
        onClear();
        setSearchTerm('');
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {label && (
                <label className={`text-xs font-bold uppercase mb-1 block ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    {label}
                </label>
            )}

            <div className="relative">
                <Search
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}
                    size={16}
                />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={selectedName || searchTerm}
                    onChange={e => {
                        setSearchTerm(e.target.value);
                        if (selectedName) {
                            onClear();
                        }
                        setShowList(true);
                    }}
                    onFocus={() => setShowList(true)}
                    className={`w-full p-3 pl-10 border rounded-xl font-bold transition-colors ${theme === 'light'
                            ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'
                            : 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                        }`}
                />
                {selectedName && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* القائمة المنبثقة */}
            {showList && !selectedName && (
                <div className={`absolute z-50 w-full mt-1 rounded-xl border shadow-xl max-h-60 overflow-y-auto ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'
                    }`}>
                    {filteredItems.length > 0 ? (
                        filteredItems.slice(0, maxItems).map(item => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => handleSelect(item)}
                                className={`w-full text-start p-3 border-b last:border-b-0 transition-colors ${theme === 'light'
                                        ? 'border-slate-100 hover:bg-emerald-50'
                                        : 'border-slate-700 hover:bg-emerald-900/30'
                                    }`}
                            >
                                <div className={`font-bold text-sm ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                                    {item.name}
                                </div>
                                {item.subtext && (
                                    <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                                        {item.subtext}
                                    </div>
                                )}
                            </button>
                        ))
                    ) : (
                        <div className={`p-4 text-center text-sm ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                            {items.length === 0 ? noItemsMessage : emptyMessage}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
