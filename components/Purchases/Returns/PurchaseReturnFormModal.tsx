
import React, { useState, useMemo } from 'react';
import Modal from '../../Common/Modal';
import Button from '../../UI/Button';
import { usePurchases } from '../../../context/PurchasesContext';
import { Purchase, PurchaseReturn } from '../../../types';
import { Search, Save, RefreshCw } from 'lucide-react';

interface PurchaseReturnFormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PurchaseReturnFormModal: React.FC<PurchaseReturnFormModalProps> = ({ isOpen, onClose }) => {
    const { purchases, addPurchaseReturn } = usePurchases();

    const [step, setStep] = useState<1 | 2>(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
    const [returnItems, setReturnItems] = useState<{ itemId: string; quantity: number; returnReason: string }[]>([]);
    const [generalReason, setGeneralReason] = useState('');

    const filteredPurchases = useMemo(() => {
        if (!searchQuery) return [];
        const q = searchQuery.toLowerCase();
        return purchases.filter(p =>
            p.invoiceNumber.toLowerCase().includes(q) ||
            p.supplierName.toLowerCase().includes(q)
        ).slice(0, 5);
    }, [purchases, searchQuery]);

    const handleSelectPurchase = (purchase: Purchase) => {
        setSelectedPurchase(purchase);
        setReturnItems(purchase.items.map(item => ({ itemId: item.id, quantity: 0, returnReason: '' })));
        setStep(2);
    };

    const handleApplyFullReturn = () => {
        if (!selectedPurchase) return;
        setReturnItems(selectedPurchase.items.map(item => ({ itemId: item.id, quantity: item.quantity, returnReason: generalReason })));
    };

    const updateReturnItem = (itemId: string, field: 'quantity' | 'returnReason', value: any) => {
        setReturnItems(prev => prev.map(item => {
            if (item.itemId === itemId) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    // مجاميع
    const totals = useMemo(() => {
        if (!selectedPurchase) return { subTotal: 0, grandTotal: 0 };

        let subTotal = 0;
        returnItems.forEach(retItem => {
            const originalItem = selectedPurchase.items.find(i => i.id === retItem.itemId);
            if (originalItem && retItem.quantity > 0) {
                subTotal += (originalItem.costPrice * retItem.quantity);
            }
        });

        return {
            subTotal,
            grandTotal: subTotal
        };
    }, [selectedPurchase, returnItems]);

    const handleSubmit = () => {
        if (!selectedPurchase) return;

        const finalItems = returnItems
            .filter(i => i.quantity > 0)
            .map(i => {
                const originalItem = selectedPurchase.items.find(oi => oi.id === i.itemId);
                if (!originalItem) return null;
                return {
                    ...originalItem,
                    quantity: i.quantity,
                    total: originalItem.costPrice * i.quantity,
                    returnReason: i.returnReason || generalReason
                };
            })
            .filter(Boolean) as any[];

        if (finalItems.length === 0) return;

        const returnData: PurchaseReturn = {
            id: `RET-P-${Date.now()}`,
            returnNumber: `RTN-P-${Math.floor(100000 + Math.random() * 900000)}`,
            originalPurchaseId: selectedPurchase.id,
            originalInvoiceNumber: selectedPurchase.invoiceNumber,
            date: new Date().toISOString().split('T')[0],
            supplierId: selectedPurchase.supplierId,
            supplierName: selectedPurchase.supplierName,
            items: finalItems,
            subTotal: totals.subTotal,
            taxTotal: 0,
            grandTotal: totals.grandTotal,
            reason: generalReason,
            status: 'completed',
            currency: selectedPurchase.currency || 'SAR',
            notes: `مرتجع مشتريات للفاتورة ${selectedPurchase.invoiceNumber}`
        };

        addPurchaseReturn(returnData);
        onClose();
        setStep(1);
        setSearchQuery('');
        setSelectedPurchase(null);
    };

    const symbol = selectedPurchase?.currency === 'YER' ? '﷼' : 'ر.س';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="تسجيل مرتجع مشتريات" size="lg">
            <div className="space-y-6">

                {step === 1 && (
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="ابحث برقم فاتورة الشراء أو اسم المورد..."
                                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {searchQuery && filteredPurchases.length === 0 && (
                                <div className="text-center py-8 text-slate-400">لا توجد نتائج</div>
                            )}
                            {filteredPurchases.map(purchase => (
                                <div
                                    key={purchase.id}
                                    onClick={() => handleSelectPurchase(purchase)}
                                    className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-red-500 hover:shadow-md cursor-pointer transition-all group"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-800 group-hover:text-red-600 transition-colors">{purchase.invoiceNumber}</span>
                                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{purchase.date}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1">{purchase.supplierName}</p>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-slate-800">{purchase.grandTotal.toLocaleString()} <span className="text-xs">{symbol}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {!searchQuery && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <RefreshCw size={32} />
                                </div>
                                <h3 className="text-slate-800 font-bold">ابحث عن فاتورة الشراء</h3>
                                <p className="text-slate-500 text-sm mt-1">للبدء في عملية الإرجاع للمورد</p>
                            </div>
                        )}
                    </div>
                )}

                {step === 2 && selectedPurchase && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                            <div>
                                <span className="text-xs text-slate-500 block">فاتورة الشراء</span>
                                <span className="font-bold text-slate-800">{selectedPurchase.invoiceNumber}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 block">المورد</span>
                                <span className="font-bold text-slate-800">{selectedPurchase.supplierName}</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => { setStep(1); setSelectedPurchase(null); }}>
                                تغيير
                            </Button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">سبب الإرجاع للمورد</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-red-500"
                                value={generalReason}
                                onChange={e => setGeneralReason(e.target.value)}
                            />
                        </div>

                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-slate-100 p-2 flex justify-between items-center border-b border-slate-200">
                                <h4 className="font-bold text-sm text-slate-700 px-2">حدد الكميات المرتجعة</h4>
                                <Button size="sm" variant="outline" onClick={handleApplyFullReturn}>إرجاع الكل</Button>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 sticky top-0">
                                        <tr>
                                            <th className="p-3 text-start">المنتج</th>
                                            <th className="p-3 text-center">الكمية المشتراة</th>
                                            <th className="p-3 text-center">سعر التكلفة</th>
                                            <th className="p-3 text-center w-24">المرتجع</th>
                                            <th className="p-3 text-center">ملاحظات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {selectedPurchase.items.map((item) => {
                                            const returnItem = returnItems.find(r => r.itemId === item.id);
                                            const currentQty = returnItem?.quantity || 0;

                                            return (
                                                <tr key={item.id} className={currentQty > 0 ? 'bg-amber-50/50' : ''}>
                                                    <td className="p-3 font-medium text-slate-800">{item.name}</td>
                                                    <td className="p-3 text-center text-slate-500">{item.quantity}</td>
                                                    <td className="p-3 text-center text-slate-600">{item.costPrice.toLocaleString()}</td>
                                                    <td className="p-3 text-center">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={item.quantity}
                                                            className={`w-16 p-1 text-center border rounded-lg outline-none focus:ring-2 ${currentQty > 0 ? 'border-amber-300 bg-white ring-amber-200' : 'border-slate-200 bg-slate-50'}`}
                                                            value={currentQty}
                                                            onChange={(e) => {
                                                                const val = Math.min(Math.max(0, parseInt(e.target.value) || 0), item.quantity);
                                                                updateReturnItem(item.id, 'quantity', val);
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="p-3">
                                                        <input
                                                            type="text"
                                                            className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white outline-none focus:border-red-500"
                                                            value={returnItem?.returnReason || ''}
                                                            onChange={(e) => updateReturnItem(item.id, 'returnReason', e.target.value)}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-xl shadow-lg">
                            <span className="text-slate-400 text-sm">إجمالي قيمة المرتجع</span>
                            <div className="flex items-end gap-1">
                                <span className="text-2xl font-black text-amber-400">{totals.grandTotal.toLocaleString()}</span>
                                <span className="text-sm font-bold text-amber-500 mb-1">{symbol}</span>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" fullWidth onClick={onClose}>إلغاء</Button>
                            <Button
                                variant="primary"
                                fullWidth
                                icon={<Save size={18} />}
                                disabled={totals.grandTotal === 0}
                                onClick={handleSubmit}
                            >
                                حفظ المرتجع
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default PurchaseReturnFormModal;
