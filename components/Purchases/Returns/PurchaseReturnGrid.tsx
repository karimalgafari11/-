
import React from 'react';
import DataGrid, { Column } from '../../Grid/DataGrid';
import { PurchaseReturn } from '../../../types';
import { Eye, Trash2 } from 'lucide-react';
import { usePurchases } from '../../../context/PurchasesContext';

interface PurchaseReturnGridProps {
    data: PurchaseReturn[];
    onView?: (ret: PurchaseReturn) => void;
}

const PurchaseReturnGrid: React.FC<PurchaseReturnGridProps> = ({ data, onView }) => {
    const { deletePurchaseReturn } = usePurchases();

    const columns: Column[] = [
        { key: 'returnNumber', label: 'رقم المرتجع', width: 120 },
        { key: 'originalInvoiceNumber', label: 'فاتورة الشراء', width: 120 },
        { key: 'date', label: 'التاريخ', width: 100 },
        { key: 'supplierName', label: 'المورد' },
        {
            key: 'grandTotal',
            label: 'القيمة',
            width: 150,
            render: (row: PurchaseReturn) => (
                <span className="font-bold text-amber-600">
                    {row.grandTotal.toLocaleString()} {row.currency === 'YER' ? '﷼' : 'ر.س'}
                </span>
            )
        },
        {
            key: 'reason',
            label: 'السبب',
            render: (row: PurchaseReturn) => (
                <span className="text-xs text-slate-500 truncate max-w-[150px] block" title={row.reason}>{row.reason}</span>
            )
        },
        {
            key: 'actions',
            label: '',
            width: 100,
            render: (row: PurchaseReturn) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => onView && onView(row)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('حذف المرتجع؟')) deletePurchaseReturn(row.id);
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return <DataGrid data={data} columns={columns} title="سجل مرتجعات المشتريات" />;
};

export default PurchaseReturnGrid;
