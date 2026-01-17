
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useSales } from '../context/SalesContext';
import { useFinance } from '../context/FinanceContext';
import DataGrid from '../components/Grid/DataGrid';
import Button from '../components/UI/Button';
import CustomerStats from '../components/Customers/CustomerStats';
import CustomerFormModal from '../components/Customers/CustomerFormModal';
import CustomerLedgerModal from '../components/Customers/CustomerLedgerModal';
import CustomerCategoryManagerModal from '../components/Customers/CustomerCategoryManagerModal';
import CategoryCustomerListModal from '../components/Customers/CategoryCustomerListModal';
import {
  Users, Search, Plus, Eye, Edit, Trash2,
  FileText, PieChart, ShieldCheck, Mail, Phone, Settings2, Download, Star, TrendingUp
} from 'lucide-react';
import { Customer } from '../types';

const Customers: React.FC = () => {
  const { showNotification } = useApp();
  const { customers, customerCategories, addCustomer, updateCustomer, deleteCustomer, addCustomerCategory } = useSales();

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء.')) {
      deleteCustomer(id);
      showNotification('تم حذف العميل بنجاح', 'info');
    }
  };
  const { transactions } = useFinance();

  const [activeTab, setActiveTab] = useState<'all' | 'statements' | 'loyalty'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [isCatManagerOpen, setIsCatManagerOpen] = useState(false);
  const [isCatListOpen, setIsCatListOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => ({
    totalCustomers: customers.length,
    totalReceivables: customers.reduce((sum, c) => sum + (c.balance || 0), 0),
    activeCustomers: customers.filter(c => c.status === 'active').length,
    lateCustomers: customers.filter(c => c.status === 'late').length
  }), [customers]);

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.companyName.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  }, [customers, searchQuery]);

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleViewLedger = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsLedgerOpen(true);
  };

  const handleViewCategoryList = (cat: string) => {
    setSelectedCategory(cat);
    setIsCatListOpen(true);
  };

  const columns = {
    all: [
      { key: 'companyName', label: 'العميل / المؤسسة', width: 220 },
      { key: 'category', label: 'الفئة', width: 100 },
      { key: 'phone', label: 'رقم الجوال', width: 120 },
      {
        key: 'balance', label: 'المديونية', type: 'number' as const, width: 140, render: (row: Customer) => (
          <span className={`font-black tabular-nums ${(row.balance || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {(row.balance || 0).toLocaleString()} ر.س
          </span>
        )
      },
      {
        key: 'status', label: 'الحالة', width: 100, render: (row: Customer) => (
          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${row.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
            }`}>
            {row.status === 'active' ? 'نشط' : 'متأخر'}
          </span>
        )
      },
      {
        key: 'actions', label: 'إجراءات', width: 140, render: (row: Customer) => (
          <div className="flex gap-2">
            <button onClick={() => handleEdit(row)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Edit size={12} /></button>
            <button onClick={() => handleDelete(row.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"><Trash2 size={12} /></button>
            <button onClick={() => handleViewLedger(row)} className="p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"><FileText size={12} /></button>
          </div>
        )
      }
    ],
    statements: [
      { key: 'companyName', label: 'العميل', width: 250 },
      { key: 'balance', label: 'الرصيد القائم', type: 'number' as const, width: 180 },
      { key: 'lastPayment', label: 'آخر دفعة', width: 120, render: () => <span className="font-bold text-slate-400">12/10/2024</span> },
      {
        key: 'actions', label: 'كشف الحساب', width: 140, render: (row: Customer) => (
          <Button variant="outline" size="sm" icon={<Eye size={12} />} onClick={() => handleViewLedger(row)}>عرض وتصدير</Button>
        )
      }
    ]
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 shadow-sm w-fit overflow-hidden">
          {[
            { id: 'all', label: 'سجل العملاء', icon: Users },
            { id: 'statements', label: 'كشوفات الحساب', icon: FileText },
            { id: 'loyalty', label: 'الفئات والولاء', icon: PieChart }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-[10px] font-black flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
            >
              <tab.icon size={12} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <input
              type="text"
              placeholder="بحث..."
              className="pl-8 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold outline-none focus:border-primary w-48 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {activeTab === 'loyalty' ? (
            <Button variant="secondary" size="sm" icon={<Settings2 size={14} />} onClick={() => setIsCatManagerOpen(true)}>الإدارة</Button>
          ) : (
            <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => { setEditingCustomer(null); setIsFormOpen(true); }}>
              إضافة عميل
            </Button>
          )}
        </div>
      </div>

      <CustomerStats stats={stats} />

      <div className="flex-1 min-h-[400px]">
        {activeTab === 'all' && (
          <DataGrid title="قائمة العملاء المسجلين" headerColor="bg-blue-900" columns={columns.all} data={filteredData} />
        )}
        {activeTab === 'statements' && (
          <DataGrid title="تحليل أرصدة الذمم المدينة" headerColor="bg-slate-800" columns={columns.statements} data={filteredData} />
        )}
        {activeTab === 'loyalty' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {customerCategories.map((cat, i) => {
              const catCustomers = customers.filter(c => c.category === cat);
              const catBalance = catCustomers.reduce((sum, c) => sum + (c.balance || 0), 0);

              return (
                <div key={cat} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex flex-col items-center text-center transition-all hover:border-primary overflow-hidden shadow-sm">
                  {/* Compact Visual Header */}
                  <div className={`w-10 h-10 flex items-center justify-center mb-3 transition-transform group-hover:scale-110 z-10 ${i % 4 === 0 ? 'bg-emerald-50 text-emerald-600' :
                    i % 4 === 1 ? 'bg-blue-50 text-blue-600' :
                      i % 4 === 2 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'
                    }`}>
                    <Users size={18} />
                  </div>

                  <h4 className="text-[11px] font-black text-slate-800 dark:text-white mb-3 truncate w-full px-1">{cat}</h4>

                  <div className="w-full space-y-1 mb-4 z-10 text-[9px] font-bold">
                    <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-1">
                      <span className="text-slate-400">العدد</span>
                      <span className="text-slate-900 dark:text-white">{catCustomers.length}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-400">الذمم</span>
                      <span className="text-rose-600 tabular-nums">{catBalance.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewCategoryList(cat)}
                    className="w-full py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[8px] font-black uppercase tracking-tighter hover:bg-primary hover:text-white transition-all border border-slate-100 dark:border-slate-700"
                  >
                    التفاصيل
                  </button>
                </div>
              );
            })}

            {/* Add New Category Compact Card */}
            <button
              onClick={() => setIsCatManagerOpen(true)}
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 p-4 flex flex-col items-center justify-center text-slate-300 hover:text-primary hover:border-primary transition-all bg-gray-50/20 dark:bg-slate-900/10 h-full min-h-[140px]"
            >
              <Plus size={24} className="mb-2 opacity-30" />
              <span className="text-[8px] font-black uppercase tracking-tighter">إضافة فئة</span>
            </button>
          </div>
        )}
      </div>

      <CustomerFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        categories={customerCategories}
        onSave={(c) => {
          if (editingCustomer) { updateCustomer(c); showNotification('تم تحديث البيانات'); }
          else { addCustomer(c); showNotification('تم إضافة العميل'); }
        }}
        initialData={editingCustomer}
      />

      <CustomerLedgerModal
        isOpen={isLedgerOpen}
        onClose={() => setIsLedgerOpen(false)}
        customer={selectedCustomer}
        transactions={transactions}
      />

      <CustomerCategoryManagerModal
        isOpen={isCatManagerOpen}
        onClose={() => setIsCatManagerOpen(false)}
        categories={customerCategories}
        onAdd={(cat) => { addCustomerCategory(cat); showNotification('تم إضافة فئة'); }}
      />

      <CategoryCustomerListModal
        isOpen={isCatListOpen}
        onClose={() => setIsCatListOpen(false)}
        categoryName={selectedCategory || ''}
        customers={customers}
      />
    </div>
  );
};

export default Customers;
