
import React from 'react';
import DataGrid, { Column } from '../../Grid/DataGrid';
import { SaleReturn } from '../../../types';
import { Eye, Trash2 } from 'lucide-react';
import { useSales } from '../../../context/SalesContext';
import { useCurrency } from '../../../hooks/useCurrency';

interface SaleReturnGridProps {
    data: SaleReturn[];
    onView?: (ret: SaleReturn) => void;
}

const SaleReturnGrid: React.FC<SaleReturnGridProps> = ({ data, onView }) => {
    const { deleteSaleReturn } = useSales();
    const { getCurrency } = useCurrency();

    const columns: Column[] = [
        { key: 'returnNumber', label: 'رقم المرتجع', width: 120 },
        { key: 'originalInvoiceNumber', label: 'الفاتورة الأصلية', width: 120 },
        { key: 'date', label: 'التاريخ', width: 100 },
        { key: 'customerName', label: 'العميل' },
        {
            key: 'grandTotal',
            label: 'المبلغ المسترد',
            width: 150,
            render: (row: SaleReturn) => (
                <span className="font-bold text-red-600">
                    -{row.grandTotal.toLocaleString()} {row.currency === 'YER' ? '﷼' : row.currency === 'SAR' ? 'ر.س' : row.currency}
                </span>
            )
        },
        {
            key: 'reason',
            label: 'سبب الإرجاع',
            render: (row: SaleReturn) => (
                <span className="text-xs text-slate-500 truncate max-w-[150px] block" title={row.reason}>
                    {row.reason}
                </span>
            )
        },
        {
            key: 'status',
            label: 'الحالة',
            width: 100,
            render: (row: SaleReturn) => (
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-600">
                    معتمد
                </span>
            )
        },
        {
            key: 'actions',
            label: 'إجراءات',
            width: 100,
            render: (row: SaleReturn) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => onView && onView(row)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="عرض التفاصيل"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('هل أنت متأكد من حذف هذا المرتجع؟')) {
                                deleteSaleReturn(row.id);
                            }
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="حذف"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return <DataGrid data={data} columns={columns} title="سجل المرتجعات" />;
};

export default SaleReturnGrid;
