/**
 * أنواع TypeScript الخاصة بدليل الحسابات
 */

// نوع الحساب الرئيسي
export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

// تصنيف الحساب بالعربية
export const AccountTypeLabels: Record<AccountType, string> = {
    asset: 'الأصول',
    liability: 'الخصوم',
    equity: 'حقوق الملكية',
    revenue: 'الإيرادات',
    expense: 'المصروفات'
};

// ألوان كل نوع حساب
export const AccountTypeColors: Record<AccountType, { bg: string; text: string; border: string }> = {
    asset: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
    liability: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' },
    equity: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
    revenue: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
    expense: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' }
};

// واجهة الحساب
export interface Account {
    id: string;
    code: string;
    name: string;
    nameEn?: string;
    type: AccountType;
    parentId?: string;
    level: number;
    isActive: boolean;
    balance: number;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

// واجهة سطر دفتر الأستاذ
export interface LedgerEntry {
    id: string;
    date: string;
    accountId: string;
    accountCode: string;
    accountName: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
    reference?: string;
}

// واجهة ملخص الحسابات
export interface AccountsSummary {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
}

// دليل الحسابات الافتراضي
export const DEFAULT_ACCOUNTS: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>[] = [
    // الأصول
    { code: '1000', name: 'الأصول', type: 'asset', level: 0, isActive: true, balance: 0 },
    { code: '1100', name: 'الأصول المتداولة', type: 'asset', parentId: '1000', level: 1, isActive: true, balance: 0 },
    { code: '1110', name: 'النقدية والبنوك', type: 'asset', parentId: '1100', level: 2, isActive: true, balance: 0 },
    { code: '1111', name: 'الصندوق', type: 'asset', parentId: '1110', level: 3, isActive: true, balance: 0 },
    { code: '1112', name: 'البنك', type: 'asset', parentId: '1110', level: 3, isActive: true, balance: 0 },
    { code: '1120', name: 'حسابات العملاء', type: 'asset', parentId: '1100', level: 2, isActive: true, balance: 0 },
    { code: '1130', name: 'المخزون', type: 'asset', parentId: '1100', level: 2, isActive: true, balance: 0 },
    { code: '1200', name: 'الأصول الثابتة', type: 'asset', parentId: '1000', level: 1, isActive: true, balance: 0 },
    { code: '1210', name: 'المعدات والأجهزة', type: 'asset', parentId: '1200', level: 2, isActive: true, balance: 0 },
    { code: '1220', name: 'الأثاث والتجهيزات', type: 'asset', parentId: '1200', level: 2, isActive: true, balance: 0 },

    // الخصوم
    { code: '2000', name: 'الخصوم', type: 'liability', level: 0, isActive: true, balance: 0 },
    { code: '2100', name: 'الخصوم المتداولة', type: 'liability', parentId: '2000', level: 1, isActive: true, balance: 0 },
    { code: '2110', name: 'حسابات الموردين', type: 'liability', parentId: '2100', level: 2, isActive: true, balance: 0 },
    { code: '2120', name: 'القروض قصيرة الأجل', type: 'liability', parentId: '2100', level: 2, isActive: true, balance: 0 },
    { code: '2200', name: 'الخصوم طويلة الأجل', type: 'liability', parentId: '2000', level: 1, isActive: true, balance: 0 },

    // حقوق الملكية
    { code: '3000', name: 'حقوق الملكية', type: 'equity', level: 0, isActive: true, balance: 0 },
    { code: '3100', name: 'رأس المال', type: 'equity', parentId: '3000', level: 1, isActive: true, balance: 0 },
    { code: '3200', name: 'الأرباح المحتجزة', type: 'equity', parentId: '3000', level: 1, isActive: true, balance: 0 },

    // الإيرادات
    { code: '4000', name: 'الإيرادات', type: 'revenue', level: 0, isActive: true, balance: 0 },
    { code: '4100', name: 'إيراد المبيعات', type: 'revenue', parentId: '4000', level: 1, isActive: true, balance: 0 },
    { code: '4200', name: 'إيرادات أخرى', type: 'revenue', parentId: '4000', level: 1, isActive: true, balance: 0 },

    // المصروفات
    { code: '5000', name: 'المصروفات', type: 'expense', level: 0, isActive: true, balance: 0 },
    { code: '5100', name: 'تكلفة البضاعة المباعة', type: 'expense', parentId: '5000', level: 1, isActive: true, balance: 0 },
    { code: '5200', name: 'مصروفات تشغيلية', type: 'expense', parentId: '5000', level: 1, isActive: true, balance: 0 },
    { code: '5210', name: 'رواتب وأجور', type: 'expense', parentId: '5200', level: 2, isActive: true, balance: 0 },
    { code: '5220', name: 'إيجارات', type: 'expense', parentId: '5200', level: 2, isActive: true, balance: 0 },
    { code: '5230', name: 'فواتير ومرافق', type: 'expense', parentId: '5200', level: 2, isActive: true, balance: 0 },
    { code: '5240', name: 'تسويق وإعلان', type: 'expense', parentId: '5200', level: 2, isActive: true, balance: 0 },
    { code: '5250', name: 'صيانة', type: 'expense', parentId: '5200', level: 2, isActive: true, balance: 0 },
];
