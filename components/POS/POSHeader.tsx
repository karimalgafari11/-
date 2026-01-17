import React from 'react';
import { Search, Barcode, Grid3X3, List, Receipt } from 'lucide-react';

interface POSHeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
}

/**
 * رأس صفحة نقطة البيع - البحث وأزرار العرض
 */
export const POSHeader: React.FC<POSHeaderProps> = ({
    searchQuery,
    onSearchChange,
    viewMode,
    onViewModeChange
}) => {
    return (
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-black text-white flex items-center gap-2">
                    <Receipt size={24} />
                    نقطة البيع
                </h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onViewModeChange('grid')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                                ? 'bg-white/20 text-white'
                                : 'text-white/60 hover:text-white'
                            }`}
                    >
                        <Grid3X3 size={20} />
                    </button>
                    <button
                        onClick={() => onViewModeChange('list')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'list'
                                ? 'bg-white/20 text-white'
                                : 'text-white/60 hover:text-white'
                            }`}
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>

            {/* البحث */}
            <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="ابحث بالاسم، الباركود، أو رمز الصنف..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 bg-white dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-white/50"
                />
                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            </div>
        </div>
    );
};

export default POSHeader;
