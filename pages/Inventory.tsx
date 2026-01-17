
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useInventory } from '../context/InventoryContext';
import DataGrid from '../components/Grid/DataGrid';
import Modal from '../components/Common/Modal';
import Button from '../components/UI/Button';
import InventoryStats from '../components/Inventory/InventoryStats';
import ItemDetailModal from '../components/Inventory/ItemDetailModal';
import ItemFormModal from '../components/Inventory/ItemFormModal';
import AuditSessionModal from '../components/Inventory/AuditSessionModal';
import WarehouseManagerModal from '../components/Inventory/WarehouseManagerModal';
import TransferStockModal from '../components/Inventory/TransferStockModal';
import {
  Package, Search, Eye, Warehouse as WarehouseIcon,
  ArrowRightLeft, ClipboardList, Calculator, Plus, Truck, TrendingDown, Edit, Trash2
} from 'lucide-react';
import { InventoryItem, StockAudit, StockTransfer, Warehouse } from '../types';
import InventoryAnalysisEngine from '../components/Inventory/Analytics/InventoryAnalysisEngine';

const Inventory: React.FC = () => {
  const { showNotification } = useApp();
  const {
    inventory, warehouses, transfers, audits,
    addInventoryItem, updateInventoryItem, deleteInventoryItem, addAudit, addWarehouse, addTransfer
  } = useInventory();

  const handleDeleteItem = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
      deleteInventoryItem(id);
    }
  };

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [activeTab, setActiveTab] = useState<'items' | 'warehouses' | 'transfers' | 'audit' | 'analytics'>('items');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAuditDetailOpen, setIsAuditDetailOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<StockAudit | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const itemStats = useMemo(() => ({
    totalItems: inventory.length,
    totalQty: inventory.reduce((s, i) => s + i.quantity, 0),
    totalValue: inventory.reduce((s, i) => s + (i.quantity * i.costPrice), 0),
    lowStock: inventory.filter(i => i.quantity <= i.minQuantity).length
  }), [inventory]);

  const auditStats = useMemo(() => ({
    totalSessions: audits.length,
    pendingSessions: audits.filter(a => a.status === 'draft').length,
    totalVarianceValue: audits.reduce((sum, a) => sum + a.totalVarianceValue, 0)
  }), [audits]);

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    switch (activeTab) {
      case 'items': return inventory.filter(i => i.name.toLowerCase().includes(q) || i.itemNumber.toLowerCase().includes(q));
      case 'warehouses': return warehouses.filter(w => w.name.toLowerCase().includes(q));
      case 'transfers': return transfers.filter(t => t.itemName.toLowerCase().includes(q));
      case 'audit': return audits.filter(a => a.warehouseName.toLowerCase().includes(q));
      default: return [];
    }
  }, [activeTab, inventory, warehouses, transfers, audits, searchQuery]);

  const columnsMap = {
    items: [
      { key: 'name', label: 'اسم الصنف', width: 220 },
      { key: 'itemNumber', label: 'رقم الصنف', width: 140 },
      { key: 'quantity', label: 'الكمية الكلية', type: 'number' as const, width: 100 },
      { key: 'category', label: 'الفئة', width: 120 },
      {
        key: 'actions', label: 'إدارة', width: 120, render: (row: InventoryItem) => (
          <div className="flex gap-1">
            <button onClick={() => { setSelectedItem(row); setIsDetailOpen(true) }} className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"><Eye size={12} /></button>
            <button onClick={() => { setEditingItem(row); setIsItemFormOpen(true); }} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Edit size={12} /></button>
            <button onClick={() => handleDeleteItem(row.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"><Trash2 size={12} /></button>
          </div>
        )
      }
    ],
    warehouses: [
      { key: 'name', label: 'الموقع', width: 200 },
      { key: 'location', label: 'العنوان', width: 180 },
      { key: 'manager', label: 'المسؤول', width: 140 },
      {
        key: 'status', label: 'الحالة', width: 100, render: (row: Warehouse) => (
          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${row.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
            {row.status === 'active' ? 'نشط' : row.status === 'full' ? 'ممتلئ' : 'صيانة'}
          </span>
        )
      }
    ],
    transfers: [
      { key: 'date', label: 'التاريخ', width: 120, render: (row: StockTransfer) => <span className="font-bold tabular-nums">{row.date.split('T')[0]}</span> },
      { key: 'itemName', label: 'الصنف المنقول' },
      { key: 'quantity', label: 'الكمية', type: 'number' as const, width: 90 },
      { key: 'fromLocationName', label: 'من', width: 140 },
      { key: 'toLocationName', label: 'إلى', width: 140 },
      { key: 'status', label: 'الحالة', width: 100, render: (row: StockTransfer) => <span className="text-[9px] font-black text-emerald-600 uppercase">مكتمل</span> }
    ],
    audit: [
      { key: 'date', label: 'التاريخ', width: 120, render: (row: StockAudit) => <span className="font-bold tabular-nums">{row.date.split('T')[0]}</span> },
      { key: 'warehouseName', label: 'المستودع', width: 180 },
      {
        key: 'totalVarianceValue', label: 'الفروقات', width: 150, render: (row: StockAudit) => (
          <span className={`font-black tabular-nums ${row.totalVarianceValue < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{row.totalVarianceValue.toLocaleString()} SAR</span>
        )
      },
      {
        key: 'actions', label: 'تفاصيل', width: 80, render: (row: StockAudit) => (
          <button onClick={() => { setSelectedAudit(row); setIsAuditDetailOpen(true) }} className="p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"><Eye size={12} /></button>
        )
      }
    ]
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-4">
        {/* Tabs - scrollable on mobile */}
        <div className="overflow-x-auto -mx-3 px-3">
          <div className="flex bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 shadow-sm w-fit min-w-full sm:min-w-0 mobile-scroll-tabs">
            {[
              { id: 'items', label: 'الأصناف', icon: Package },
              { id: 'warehouses', label: 'المستودعات', icon: WarehouseIcon },
              { id: 'transfers', label: 'المناقلات', icon: ArrowRightLeft },
              { id: 'audit', label: 'الجرد', icon: ClipboardList },
              { id: 'analytics', label: 'تحليل', icon: TrendingDown }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} className={`px-3 sm:px-6 py-2 sm:py-2.5 text-[9px] sm:text-[10px] font-black flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap flex-shrink-0 ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <tab.icon size={14} /> <span className="hidden sm:inline">{tab.label}</span><span className="sm:hidden">{tab.label.slice(0, 6)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="بحث..." className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold outline-none focus:border-primary transition-colors mobile-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <div className="flex gap-2">
            {activeTab === 'items' && (
              <Button variant="primary" icon={<Plus size={16} />} onClick={() => setIsItemFormOpen(true)} className="flex-1 sm:flex-none">إضافة صنف</Button>
            )}
            {activeTab === 'audit' && (
              <Button variant="primary" icon={<Calculator size={16} />} onClick={() => setIsAuditModalOpen(true)} className="flex-1 sm:flex-none">بدء جرد</Button>
            )}
            {activeTab === 'warehouses' && (
              <Button variant="success" icon={<Plus size={16} />} onClick={() => setIsWarehouseModalOpen(true)} className="flex-1 sm:flex-none">إضافة مستودع</Button>
            )}
            {activeTab === 'transfers' && (
              <Button variant="primary" icon={<Truck size={16} />} onClick={() => setIsTransferModalOpen(true)} className="flex-1 sm:flex-none">مناقلة</Button>
            )}
          </div>
        </div>
      </div>

      <InventoryStats activeTab={activeTab} itemStats={itemStats} auditStats={auditStats} />


      {activeTab === 'analytics' ? (
        <InventoryAnalysisEngine inventory={inventory} warehouses={warehouses} />
      ) : (
        <div className="h-[calc(100vh-340px)] min-h-[500px]">
          <DataGrid
            title={activeTab === 'items' ? "سجل المخزون العام" : activeTab === 'audit' ? "أرشيف عمليات الجرد" : activeTab === 'warehouses' ? "إدارة المواقع والقدرات" : "سجل المناقلات البينية"}
            headerColor="bg-slate-900"
            columns={columnsMap[activeTab as keyof typeof columnsMap] || []}
            data={filteredData}
          />
        </div>
      )}

      {/* Modals Orchestration */}
      <ItemFormModal
        isOpen={isItemFormOpen}
        onClose={() => setIsItemFormOpen(false)}
        onSave={(item) => { addInventoryItem(item); showNotification('تم إضافة الصنف للمخزون'); }}
      />
      <ItemDetailModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} item={selectedItem} />

      <AuditSessionModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        warehouses={warehouses}
        inventory={inventory}
        onComplete={(audit) => { addAudit(audit); showNotification('تم اعتماد نتائج الجرد وتحديث الأرصدة'); }}
      />

      <WarehouseManagerModal
        isOpen={isWarehouseModalOpen}
        onClose={() => setIsWarehouseModalOpen(false)}
        onSave={(w) => { addWarehouse(w); showNotification('تمت إضافة الموقع التخزيني الجديد'); }}
      />

      <TransferStockModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        warehouses={warehouses}
        inventory={inventory}
        onTransfer={(t) => { addTransfer(t); showNotification('تمت مناقلة المخزون بنجاح'); }}
      />

      <Modal isOpen={isAuditDetailOpen} onClose={() => setIsAuditDetailOpen(false)} title="تفاصيل الجلسة المؤرشفة" size="lg">
        {selectedAudit && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">{selectedAudit.warehouseName}</h4>
                <p className="text-[10px] font-bold text-slate-400 tracking-widest">{selectedAudit.date.split('T')[0]}</p>
              </div>
              <div className="text-end">
                <p className={`text-xl font-black ${selectedAudit.totalVarianceValue < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{selectedAudit.totalVarianceValue.toLocaleString()} SAR</p>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">صافي التسوية</span>
              </div>
            </div>
            <div className="border border-slate-200 dark:border-slate-800 rounded overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-black uppercase text-[9px]">
                  <tr><th className="p-3 text-start">الصنف</th><th className="p-3 text-center">النظام</th><th className="p-3 text-center">الفعلي</th><th className="p-3 text-center">الفارق</th></tr>
                </thead>
                <tbody>
                  {selectedAudit.items.map(item => (
                    <tr key={item.itemId} className="border-b border-slate-50 dark:border-slate-800">
                      <td className="p-3 font-bold">{item.itemName}</td>
                      <td className="p-3 text-center font-mono">{item.expectedQty}</td>
                      <td className="p-3 text-center font-black text-primary">{item.actualQty}</td>
                      <td className={`p-3 text-center font-black ${item.variance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{item.variance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button variant="ghost" fullWidth onClick={() => setIsAuditDetailOpen(false)}>إغلاق</Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Inventory;
