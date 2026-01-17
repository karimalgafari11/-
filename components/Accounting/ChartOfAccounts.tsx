import React, { useState, useMemo } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import AddAccountModal from './AddAccountModal';
import {
    FolderTree, ChevronLeft, ChevronDown, Plus, Edit2, Trash2,
    Wallet, Scale, Crown, TrendingUp, TrendingDown
} from 'lucide-react';
import { Account, AccountType, AccountTypeLabels, AccountTypeColors, DEFAULT_ACCOUNTS } from '../../types/accounts';

// إنشاء الحسابات الافتراضية مع IDs
const createDefaultAccounts = (): Account[] => {
    return DEFAULT_ACCOUNTS.map((acc, index) => ({
        ...acc,
        id: acc.code,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }));
};

interface AccountNodeProps {
    account: Account;
    accounts: Account[];
    level: number;
    expandedIds: Set<string>;
    onToggle: (id: string) => void;
    onEdit: (account: Account) => void;
    onDelete: (id: string) => void;
}

const AccountNode: React.FC<AccountNodeProps> = ({
    account, accounts, level, expandedIds, onToggle, onEdit, onDelete
}) => {
    const children = accounts.filter(a => a.parentId === account.code);
    const hasChildren = children.length > 0;
    const isExpanded = expandedIds.has(account.id);
    const colors = AccountTypeColors[account.type];

    const TypeIcon = {
        asset: Wallet,
        liability: Scale,
        equity: Crown,
        revenue: TrendingUp,
        expense: TrendingDown
    }[account.type];

    return (
        <div>
            <div
                className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 group ${level === 0 ? 'bg-gray-50 dark:bg-slate-800/30' : ''
                    }`}
                style={{ paddingRight: `${level * 20 + 12}px` }}
            >
                {/* Toggle Button */}
                <button
                    onClick={() => hasChildren && onToggle(account.id)}
                    className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${hasChildren
                        ? 'text-gray-400 hover:text-primary hover:bg-primary/10'
                        : 'text-transparent'
                        }`}
                >
                    {hasChildren && (isExpanded ? <ChevronDown size={14} /> : <ChevronLeft size={14} />)}
                </button>

                {/* Icon */}
                <div className={`p-1.5 rounded ${colors.bg} ${colors.text}`}>
                    <TypeIcon size={12} />
                </div>

                {/* Code */}
                <span className="font-mono text-[11px] font-black text-gray-400 min-w-[50px]">
                    {account.code}
                </span>

                {/* Name */}
                <span className={`flex-1 text-sm font-bold ${level === 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                    {account.name}
                </span>

                {/* Type Badge */}
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${colors.bg} ${colors.text}`}>
                    {AccountTypeLabels[account.type]}
                </span>

                {/* Balance */}
                <span className="font-mono text-xs font-bold text-gray-500 min-w-[80px] text-left tabular-nums">
                    {account.balance.toLocaleString()}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(account)}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                        <Edit2 size={12} />
                    </button>
                    {level > 0 && (
                        <button
                            onClick={() => onDelete(account.id)}
                            className="p-1 text-gray-400 hover:text-rose-500 transition-colors"
                        >
                            <Trash2 size={12} />
                        </button>
                    )}
                </div>
            </div>

            {/* Children */}
            {hasChildren && isExpanded && (
                <div>
                    {children.map(child => (
                        <AccountNode
                            key={child.id}
                            account={child}
                            accounts={accounts}
                            level={level + 1}
                            expandedIds={expandedIds}
                            onToggle={onToggle}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const ChartOfAccounts: React.FC = () => {
    const [accounts, setAccounts] = useState<Account[]>(createDefaultAccounts);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['1000', '2000', '3000', '4000', '5000']));
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const rootAccounts = useMemo(() => {
        return accounts.filter(a => !a.parentId || a.level === 0);
    }, [accounts]);

    const filteredAccounts = useMemo(() => {
        if (!searchTerm) return accounts;
        const term = searchTerm.toLowerCase();
        return accounts.filter(a =>
            a.name.toLowerCase().includes(term) ||
            a.code.includes(term)
        );
    }, [accounts, searchTerm]);

    const handleToggle = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleExpandAll = () => {
        setExpandedIds(new Set(accounts.map(a => a.id)));
    };

    const handleCollapseAll = () => {
        setExpandedIds(new Set());
    };

    const [editingAccount, setEditingAccount] = useState<Account | null>(null);

    const handleDelete = (id: string) => {
        setAccounts(prev => prev.filter(a => a.id !== id));
    };

    const handleEdit = (account: Account) => {
        setEditingAccount(account);
        setIsAddModalOpen(true);
    };

    const handleSaveAccount = (accountData: {
        code: string;
        name: string;
        type: AccountType;
        parentId?: string;
        description?: string;
    }) => {
        if (editingAccount) {
            // Edit Mode
            setAccounts(prev => prev.map(acc =>
                acc.id === editingAccount.id
                    ? { ...acc, ...accountData, updatedAt: new Date().toISOString() }
                    : acc
            ));
            setEditingAccount(null);
        } else {
            // Add Mode
            const parentAccount = accountData.parentId
                ? accounts.find(a => a.code === accountData.parentId)
                : null;

            const account: Account = {
                id: accountData.code,
                code: accountData.code,
                name: accountData.name,
                type: accountData.type,
                parentId: accountData.parentId,
                level: parentAccount ? parentAccount.level + 1 : 0,
                isActive: true,
                balance: 0,
                description: accountData.description,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            setAccounts(prev => [...prev, account]);
        }
        setIsAddModalOpen(false);
    };

    const accountTypeSummary = useMemo(() => {
        const summary: Record<AccountType, { count: number; total: number }> = {
            asset: { count: 0, total: 0 },
            liability: { count: 0, total: 0 },
            equity: { count: 0, total: 0 },
            revenue: { count: 0, total: 0 },
            expense: { count: 0, total: 0 }
        };

        accounts.forEach(a => {
            summary[a.type].count++;
            summary[a.type].total += a.balance;
        });

        return summary;
    }, [accounts]);

    return (
        <div className="h-full flex flex-col gap-4">
            {/* ملخص أنواع الحسابات */}
            <div className="grid grid-cols-5 gap-2">
                {(Object.keys(accountTypeSummary) as AccountType[]).map(type => {
                    const colors = AccountTypeColors[type];
                    const data = accountTypeSummary[type];
                    return (
                        <div
                            key={type}
                            className={`${colors.bg} ${colors.border} border rounded-lg p-3 transition-all hover:scale-[1.02]`}
                        >
                            <p className={`text-[10px] font-black uppercase tracking-wider ${colors.text}`}>
                                {AccountTypeLabels[type]}
                            </p>
                            <p className={`text-lg font-black ${colors.text} mt-1`}>
                                {data.count}
                                <span className="text-[10px] font-bold opacity-60 mr-1">حساب</span>
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* شريط الأدوات */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="البحث في الحسابات..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-indigo-800/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64"
                    />
                    <button
                        onClick={handleExpandAll}
                        className="px-3 py-1.5 text-[10px] font-bold text-gray-500 hover:text-primary bg-gray-50 dark:bg-slate-800 rounded-lg transition-colors"
                    >
                        توسيع الكل
                    </button>
                    <button
                        onClick={handleCollapseAll}
                        className="px-3 py-1.5 text-[10px] font-bold text-gray-500 hover:text-primary bg-gray-50 dark:bg-slate-800 rounded-lg transition-colors"
                    >
                        طي الكل
                    </button>
                </div>

                <Button
                    variant="success"
                    size="sm"
                    icon={<Plus size={14} />}
                    onClick={() => setIsAddModalOpen(true)}
                >
                    إضافة حساب
                </Button>
            </div>

            {/* شجرة الحسابات */}
            <Card className="flex-1 overflow-auto p-2">
                <div className="space-y-0.5">
                    {(searchTerm ? filteredAccounts.filter(a => a.level === 0) : rootAccounts).map(account => (
                        <AccountNode
                            key={account.id}
                            account={account}
                            accounts={searchTerm ? filteredAccounts : accounts}
                            level={0}
                            expandedIds={expandedIds}
                            onToggle={handleToggle}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            </Card>

            {/* نافذة إضافة/تعديل حساب */}
            <AddAccountModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditingAccount(null);
                }}
                onSave={handleSaveAccount}
                initialData={editingAccount || undefined}
            />
        </div>
    );
};

export default ChartOfAccounts;
