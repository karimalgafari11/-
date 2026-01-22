/**
 * شريط البحث - VoucherSearch Component
 */

import React from 'react';
import { Search } from 'lucide-react';

interface VoucherSearchProps {
    theme: string;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

const VoucherSearch: React.FC<VoucherSearchProps> = ({
    theme,
    searchTerm,
    setSearchTerm
}) => {
    return (
        <div className={`flex items-center gap-3 p-3 rounded-xl border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'}`}>
            <Search size={18} className={theme === 'light' ? 'text-slate-400' : 'text-slate-500'} />
            <input
                type="text"
                placeholder="بحث عن سند..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`flex-1 bg-transparent outline-none text-sm font-bold ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}
            />
        </div>
    );
};

export default VoucherSearch;
