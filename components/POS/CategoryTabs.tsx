import React from 'react';

interface CategoryTabsProps {
    categories: string[];
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
}

/**
 * تصفية المنتجات حسب الفئات
 */
export const CategoryTabs: React.FC<CategoryTabsProps> = ({
    categories,
    selectedCategory,
    onCategoryChange
}) => {
    return (
        <div className="flex gap-2 p-3 overflow-x-auto bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => onCategoryChange(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-600'
                        }`}
                >
                    {cat === 'all' ? 'الكل' : cat}
                </button>
            ))}
        </div>
    );
};

export default CategoryTabs;
