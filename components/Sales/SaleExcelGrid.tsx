
import React, { useState, useMemo } from 'react';
import { Sale } from '../../types';
import { Settings2, Eye, Edit, Trash2 } from 'lucide-react';
import VirtualDataGrid, { Column } from '../Grid/VirtualDataGrid';

interface SaleExcelGridProps {
  data: Sale[];
  onViewAction: (sale: Sale) => void;
  onEditAction?: (sale: Sale) => void;
  onDeleteAction?: (id: string) => void;
}

const SaleExcelGrid: React.FC<SaleExcelGridProps> = ({ data, onViewAction, onEditAction, onDeleteAction }) => {
  const [showColumnPicker, setShowColumnPicker] = useState(false);

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء.')) {
      onDeleteAction?.(id);
    }
  };

  // Column definitions for VirtualDataGrid
  // Note: We are not using the resize logic from the previous component as VirtualDataGrid doesn't support drag-resize yet,
  // but it does support fixed width columns which is what we need for performance.
  const columns: Column[] = useMemo(() => [
    { key: 'invoiceNumber', label: 'رقم الفاتورة', width: 150 },
    { key: 'date', label: 'التاريخ', width: 120 },
    { key: 'customerName', label: 'العميل', width: 200 },
    {
      key: 'paymentMethod',
      label: 'طريقة الدفع',
      width: 100,
      render: (row: Sale) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${row.paymentMethod === 'cash' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
          {row.paymentMethod === 'cash' ? 'نقدي' : 'آجل'}
        </span>
      )
    },
    { key: 'status', label: 'الحالة', width: 100 },
    {
      key: 'grandTotal',
      label: 'الإجمالي',
      width: 130,
      render: (row: Sale) => (
        <span className="font-black tabular-nums">{row.grandTotal.toLocaleString()} {row.saleCurrency === 'YER' ? '﷼' : row.saleCurrency === 'SAR' ? 'ر.س' : row.saleCurrency || 'ر.س'}</span>
      )
    },
    {
      key: 'actions',
      label: 'إجراءات',
      width: 120,
      render: (row: Sale) => (
        <div className="flex gap-1">
          <button onClick={() => onViewAction(row)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors rounded-full">
            <Eye size={12} />
          </button>
          {onEditAction && (
            <button onClick={() => onEditAction(row)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors rounded-full">
              <Edit size={12} />
            </button>
          )}
          {onDeleteAction && (
            <button onClick={() => handleDelete(row.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors rounded-full">
              <Trash2 size={12} />
            </button>
          )}
        </div>
      )
    }
  ], [onViewAction, onEditAction, onDeleteAction]);


  return (
    <div className="h-[calc(100vh-280px)] min-h-[500px]">
      {/* We can keep the column picker button if we implement it, but for now focusing on performance */}
      <VirtualDataGrid
        columns={columns}
        data={data}
        title="سجل المبيعات"
      />
    </div>
  );
};

export default SaleExcelGrid;
