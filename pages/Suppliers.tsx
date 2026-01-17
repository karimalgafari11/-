
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { usePurchases } from '../context/PurchasesContext';
import { useFinance } from '../context/FinanceContext';
import { useInventory } from '../context/InventoryContext';
import DataGrid from '../components/Grid/DataGrid';
import Button from '../components/UI/Button';
import SupplierStats from '../components/Suppliers/SupplierStats';
import SupplierFormModal from '../components/Suppliers/SupplierFormModal';
import SupplierLedgerModal from '../components/Suppliers/SupplierLedgerModal';
import CategoryManagerModal from '../components/Suppliers/CategoryManagerModal';
import {
  Users, Search, Plus, Eye, Edit, Trash2,
  FileText, PieChart, ShieldCheck, Filter, Settings2
} from 'lucide-react';
import { Supplier } from '../types';

const Suppliers: React.FC = () => {
  const { showNotification, t } = useApp();
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = usePurchases();
  const { transactions } = useFinance();
  const { categories, addCategory } = useInventory();

  const [activeTab, setActiveTab] = useState<'all' | 'statements' | 'categories'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [isCatManagerOpen, setIsCatManagerOpen] = useState(false);

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => ({
    totalSuppliers: suppliers.length,
    totalBalance: suppliers.reduce((s, sup) => s + sup.balance, 0),
    activeSuppliers: suppliers.filter(s => s.status === 'active').length,
    blockedSuppliers: suppliers.filter(s => s.status === 'blocked').length
  }), [suppliers]);

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return suppliers.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.companyName.toLowerCase().includes(q) ||
      s.taxNumber.includes(q)
    );
  }, [suppliers, searchQuery]);

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleViewLedger = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsLedgerOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المورد؟ لا يمكن التراجع عن هذا الإجراء.')) {
      deleteSupplier(id);
      showNotification('تم حذف المورد بنجاح', 'info');
    }
  };

  const columns = {
    all: [
      { key: 'companyName', label: 'اسم الشركة', width: 220 },
      { key: 'category', label: 'التصنيف', width: 120 },
      { key: 'phone', label: 'الهاتف', width: 120 },
      {
        key: 'balance', label: 'الرصيد', type: 'number' as const, width: 140, render: (row: Supplier) => (
          <span className={`font-black tabular-nums ${(row.balance || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {(row.balance || 0).toLocaleString()} ر.س
          </span>
        )
      },
      {
        key: 'status', label: 'الحالة', width: 100, render: (row: Supplier) => (
          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${row.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
            row.status === 'blocked' ? 'bg-rose-50 text-rose-600 border-rose-100' :
              'bg-slate-50 text-slate-600 border-slate-100'
            }`}>
            {row.status === 'active' ? 'نشط' : row.status === 'blocked' ? 'محظور' : 'غير نشط'}
          </span>
        )
      },
      {
        key: 'actions', label: 'إجراءات', width: 120, render: (row: Supplier) => (
          <div className="flex gap-2">
            <button onClick={() => handleEdit(row)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Edit size={12} /></button>
            <button onClick={() => handleDelete(row.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"><Trash2 size={12} /></button>
          </div>
        )
      }
    ],
    statements: [
      { key: 'companyName', label: 'اسم المورد', width: 250 },
      {
        key: 'balance', label: 'الرصيد المستحق', type: 'number' as const, width: 180, render: (row: Supplier) => (
          <span className="font-black tabular-nums text-slate-900 dark:text-white">{(row.balance || 0).toLocaleString()} ر.س</span>
        )
      },
      { key: 'lastDate', label: 'آخر حركة', width: 120, render: () => <span className="font-bold text-slate-400 tabular-nums">2024-10-20</span> },
      {
        key: 'actions', label: 'كشف الحساب', width: 140, render: (row: Supplier) => (
          <Button variant="outline" size="sm" icon={<FileText size={12} />} onClick={() => handleViewLedger(row)}>عرض الكشف</Button>
        )
      }
    ]
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 shadow-sm w-fit overflow-hidden">
          {[
            { id: 'all', label: 'قائمة الموردين', icon: Users },
            { id: 'statements', label: 'كشوفات الحساب', icon: FileText },
            { id: 'categories', label: 'التصنيفات', icon: PieChart }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2.5 text-[10px] font-black flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="بحث سريع..."
              className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold outline-none focus:border-primary w-64 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {activeTab === 'categories' ? (
            <Button variant="secondary" icon={<Settings2 size={16} />} onClick={() => setIsCatManagerOpen(true)}>إدارة التصنيفات</Button>
          ) : (
            <Button variant="primary" icon={<Plus size={16} />} onClick={() => { setEditingSupplier(null); setIsFormOpen(true); }}>
              إضافة مورد جديد
            </Button>
          )}
        </div>
      </div>

      <SupplierStats stats={stats} />

      <div className="h-[calc(100vh-340px)] min-h-[500px]">
        {activeTab === 'all' && (
          <DataGrid title="سجل الموردين المعتمدين" headerColor="bg-indigo-900" columns={columns.all} data={filteredData} />
        )}
        {activeTab === 'statements' && (
          <DataGrid title="الأرصدة والذمم المستحقة" headerColor="bg-slate-800" columns={columns.statements} data={filteredData} />
        )}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between hover:border-primary transition-all group">
                <div>
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center mb-4">
                    <PieChart size={24} />
                  </div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1">{cat}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    موردين مسجلين: {suppliers.filter(s => s.category === cat).length}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-black text-primary">
                    {suppliers.filter(s => s.category === cat).reduce((sum, s) => sum + s.balance, 0).toLocaleString()} ر.س
                  </span>
                  <button className="text-[10px] font-black text-slate-400 group-hover:text-primary uppercase tracking-widest transition-colors">عرض التفاصيل</button>
                </div>
              </div>
            ))}
            <button
              onClick={() => setIsCatManagerOpen(true)}
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all"
            >
              <Plus size={32} className="mb-2 opacity-20" />
              <span className="text-[10px] font-black uppercase tracking-widest">إضافة تصنيف جديد</span>
            </button>
          </div>
        )}
      </div>

      {/* Modals Orchestration */}
      <SupplierFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={(s) => {
          if (editingSupplier) { updateSupplier(s); showNotification('تم تحديث بيانات المورد'); }
          else { addSupplier(s); showNotification('تم إضافة المورد الجديد بنجاح'); }
        }}
        initialData={editingSupplier}
      />

      <SupplierLedgerModal
        isOpen={isLedgerOpen}
        onClose={() => setIsLedgerOpen(false)}
        supplier={selectedSupplier}
        transactions={transactions}
      />

      <CategoryManagerModal
        isOpen={isCatManagerOpen}
        onClose={() => setIsCatManagerOpen(false)}
        categories={categories}
        onAdd={(cat) => { addCategory(cat); showNotification('تمت إضافة التصنيف الجديد'); }}
      />
    </div>
  );
};

export default Suppliers;
