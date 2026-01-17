
import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../../Common/Modal';
import Button from '../../UI/Button';
import { useSales } from '../../../context/SalesContext';
import { useCurrency } from '../../../hooks/useCurrency';
import { Sale, SaleReturn, SaleItem } from '../../../types';
import { Search, Save, X, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SaleReturnFormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SaleReturnFormModal: React.FC<SaleReturnFormModalProps> = ({ isOpen, onClose }) => {
    const { sales, addSaleReturn } = useSales();
    const { getCurrency } = useCurrency();

    const [step, setStep] = useState<1 | 2>(1); // 1: Select Invoice, 2: Select Items
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [returnItems, setReturnItems] = useState<{ itemId: string; quantity: number; returnReason: string }[]>([]);
    const [generalReason, setGeneralReason] = useState('');
    const [refundMethod, setRefundMethod] = useState<'cash' | 'credit' | 'wallet'>('cash');

    // البحث عن الفواتير
    const filteredSales = useMemo(() => {
        if (!searchQuery) return [];
        const q = searchQuery.toLowerCase();
        return sales.filter(s =>
            s.invoiceNumber.toLowerCase().includes(q) ||
            s.customerName.toLowerCase().includes(q)
        ).slice(0, 5); // أظهر أول 5 نتائج فقط
    }, [sales, searchQuery]);

    const handleSelectSale = (sale: Sale) => {
        setSelectedSale(sale);
        // تهيئة عناصر الإرجاع بـ 0 كمية
        setReturnItems(sale.items.map(item => ({ itemId: item.id, quantity: 0, returnReason: '' })));
        setStep(2);
    };

    const handleApplyFullReturn = () => {
        if (!selectedSale) return;
        setReturnItems(saleItems.map(item => ({ itemId: item.id, quantity: item.quantity, returnReason: generalReason })));
    };

    const updateReturnItem = (itemId: string, field: 'quantity' | 'returnReason', value: any) => {
        setReturnItems(prev => prev.map(item => {
            if (item.itemId === itemId) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const saleItems = useMemo(() => selectedSale?.items || [], [selectedSale]);

    // حساب الإجماليات
    const totals = useMemo(() => {
        if (!selectedSale) return { subTotal: 0, taxTotal: 0, grandTotal: 0, displayTotal: 0 };

        let subTotalSAR = 0;
        let displayTotal = 0;

        returnItems.forEach(retItem => {
            const originalItem = saleItems.find(i => i.id === retItem.itemId);
            if (originalItem && retItem.quantity > 0) {
                // السعر الأصلي (مخزن بـ SAR عادة، أو حسب العملة - نأخذ الـ logic من SaleFormModal)
                // في SaleFormModal: unitPrice يخزن بـ SAR أو العملة الأساسية.
                // لنفترض أن unitPrice هو بالسعر الأساسي.

                // لكن انتظر، في SaleFormModal قمنا بتخزين exchangeRateUsed.
                // يجب أن نستخدم القيم الأصلية للفاتورة لضمان دقة الاسترداد.
                // SaleItem.unitPrice هو السعر الأساسي (SAR).

                const itemTotalSAR = originalItem.unitPrice * retItem.quantity;
                subTotalSAR += itemTotalSAR;

                // حساب القيمة المعروضة (بعملة البيع)
                // Sale.exchangeRateUsed هو سعر الصرف وقت البيع.
                // إذا كانت العملة مختلفة عن SAR، نقسم على الـ rate (إذا كانت العملة أجنبية والـ rate هو قيمة العملة مقابل SAR)
                // في useCurrency: rate هو قيمة العملة مقابل SAR. (مثلا 1 OMR = 9.7 SAR)
                // إذاً: Price(OMR) = Price(SAR) / Rate

                // ولكن، في SaleFormModal:
                // const priceInSAR = saleCurrency === BASE_CURRENCY ? priceInSaleCurrency : priceInSaleCurrency / currentRate;
                // إذن unitPrice هو دائماً SAR.

                // للعرض بعملة الفاتورة:
                const rate = selectedSale.exchangeRateUsed || 1;
                // إذا كانت العملة ليست SAR، نحتاج للتحويل العكسي.
                // لكن لحظة، exchangeRateUsed في SaleFormModal: هي `currentRate`.
                // `currentRate` = getCurrentRate(BASE_CURRENCY, saleCurrency). 
                // getCurrentRate يعود بـ conversion rate.

                // المعادلة: Amount(SaleCurrency) = Amount(SAR) * Rate
                // انتظر، دعنا نراجع logic التحويل في SaleFormModal مرة أخرى.
                // convertPrice: return priceInSAR * currentRate.
                // اذن:
                displayTotal += (itemTotalSAR * (selectedSale.exchangeRateUsed || 1));
            }
        });

        return {
            subTotal: subTotalSAR,
            taxTotal: 0, // مبدئياً 0 كما في المبيعات
            grandTotal: subTotalSAR, // هذا بالـ SAR
            displayTotal: displayTotal // هذا بعملة البيع
        };
    }, [selectedSale, returnItems, saleItems]);

    const handleSubmit = () => {
        if (!selectedSale) return;

        // تجميع العناصر المرجعة فقط
        const finalItems = returnItems
            .filter(i => i.quantity > 0)
            .map(i => {
                const originalItem = saleItems.find(oi => oi.id === i.itemId);
                if (!originalItem) return null;
                return {
                    ...originalItem,
                    quantity: i.quantity,
                    total: originalItem.unitPrice * i.quantity, // Total in SAR
                    returnReason: i.returnReason || generalReason
                };
            })
            .filter(Boolean) as any[];

        if (finalItems.length === 0) return;

        const returnData: SaleReturn = {
            id: `RET-${Date.now()}`,
            returnNumber: `RTN-${Math.floor(100000 + Math.random() * 900000)}`,
            originalSaleId: selectedSale.id,
            originalInvoiceNumber: selectedSale.invoiceNumber,
            date: new Date().toISOString().split('T')[0],
            customerId: selectedSale.customerId,
            customerName: selectedSale.customerName,
            items: finalItems,
            subTotal: totals.subTotal,
            taxTotal: totals.taxTotal,
            grandTotal: totals.displayTotal, // نحفظ المبلغ المسترد بنفس عملة الفاتورة الأصلية
            baseGrandTotal: totals.grandTotal, // المبلغ المسترد بالريال السعودي
            reason: generalReason,
            status: 'approved', // اعتماد مباشر حالياً
            refundMethod,
            currency: selectedSale.saleCurrency || 'SAR',
            exchangeRate: selectedSale.exchangeRateUsed || 1,
            notes: `مرتجع للفاتورة ${selectedSale.invoiceNumber}`
        };

        addSaleReturn(returnData);
        onClose();
        // Reset
        setStep(1);
        setSearchQuery('');
        setSelectedSale(null);
    };

    const currencySymbol = selectedSale?.saleCurrency ? getCurrency(selectedSale.saleCurrency)?.symbol : 'ر.س';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="تسجيل مرتجع مبيعات" size="lg">
            <div className="space-y-6">

                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="ابحث برقم الفاتورة أو اسم العميل..."
                                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {searchQuery && filteredSales.length === 0 && (
                                <div className="text-center py-8 text-slate-400">
                                    لا توجد نتائج مطابقة
                                </div>
                            )}

                            {filteredSales.map(sale => (
                                <div
                                    key={sale.id}
                                    onClick={() => handleSelectSale(sale)}
                                    className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md cursor-pointer transition-all group"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{sale.invoiceNumber}</span>
                                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{sale.date}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1">{sale.customerName}</p>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-slate-800">
                                            {sale.saleCurrency === 'SAR'
                                                ? (sale.baseGrandTotal || sale.grandTotal).toLocaleString()
                                                : sale.grandTotal.toLocaleString()}
                                            <span className="text-xs text-slate-500 mx-1">{sale.saleCurrency === "YER" ? "﷼" : sale.saleCurrency === "SAR" ? "ر.س" : sale.saleCurrency}</span>
                                        </p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${sale.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {sale.status === 'paid' ? 'مدفوع' : 'آجل'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {!searchQuery && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <RefreshCw size={32} />
                                </div>
                                <h3 className="text-slate-800 font-bold">ابحث عن الفاتورة الأصلية</h3>
                                <p className="text-slate-500 text-sm mt-1">قم بالبحث عن الفاتورة التي تريد إجراء استرجاع لها</p>
                            </div>
                        )}
                    </div>
                )}

                {step === 2 && selectedSale && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        {/* تفاصيل الفاتورة الأصلية */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                            <div>
                                <span className="text-xs text-slate-500 block">الفاتورة الأصلية</span>
                                <span className="font-bold text-slate-800">{selectedSale.invoiceNumber}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 block">العميل</span>
                                <span className="font-bold text-slate-800">{selectedSale.customerName}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 block">تاريخ الشراء</span>
                                <span className="font-bold text-slate-800">{selectedSale.date}</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => { setStep(1); setSelectedSale(null); }}>
                                تغيير الفاتورة
                            </Button>
                        </div>

                        {/* سبب الإرجاع العام */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">سبب الإرجاع (عام)</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                                placeholder="مثال: البضاعة تالفة، غير مطابق للمواصفات..."
                                value={generalReason}
                                onChange={e => setGeneralReason(e.target.value)}
                            />
                        </div>

                        {/* جدول المنتجات */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-slate-100 p-2 flex justify-between items-center border-b border-slate-200">
                                <h4 className="font-bold text-sm text-slate-700 px-2">حدد الكميات المرتجعة</h4>
                                <Button size="sm" variant="outline" onClick={handleApplyFullReturn}>إرجاع كامل الفاتورة</Button>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 sticky top-0">
                                        <tr>
                                            <th className="p-3 text-start">المنتج</th>
                                            <th className="p-3 text-center">الكمية المباعة</th>
                                            <th className="p-3 text-center">سعر الوحدة</th>
                                            <th className="p-3 text-center w-24">المرتجع</th>
                                            <th className="p-3 text-center">السبب (اختياري)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {saleItems.map((item) => {
                                            const returnItem = returnItems.find(r => r.itemId === item.id);
                                            const currentQty = returnItem?.quantity || 0;

                                            return (
                                                <tr key={item.id} className={currentQty > 0 ? 'bg-red-50/50' : ''}>
                                                    <td className="p-3 font-medium text-slate-800">
                                                        {item.name}
                                                        <span className="block text-[10px] text-slate-400">{item.sku}</span>
                                                    </td>
                                                    <td className="p-3 text-center text-slate-500">{item.quantity}</td>
                                                    <td className="p-3 text-center text-slate-600">
                                                        {(item.unitPrice * (selectedSale.exchangeRateUsed || 1)).toLocaleString()} {currencySymbol}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={item.quantity}
                                                            className={`w-16 p-1 text-center border rounded-lg outline-none focus:ring-2 ${currentQty > 0 ? 'border-red-300 bg-white ring-red-200' : 'border-slate-200 bg-slate-50'}`}
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
                                                            placeholder="سبب خاص..."
                                                            className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white outline-none focus:border-blue-500"
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

                        {/* الملخص */}
                        <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-xl shadow-lg">
                            <div>
                                <span className="text-slate-400 text-xs block mb-1">طريقة الاسترداد</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setRefundMethod('cash')}
                                        className={`text-xs px-2 py-1 rounded border ${refundMethod === 'cash' ? 'bg-white text-slate-900 border-white' : 'border-slate-700 text-slate-400'}`}
                                    >
                                        نقدي
                                    </button>
                                    <button
                                        onClick={() => setRefundMethod('credit')}
                                        className={`text-xs px-2 py-1 rounded border ${refundMethod === 'credit' ? 'bg-white text-slate-900 border-white' : 'border-slate-700 text-slate-400'}`}
                                    >
                                        رصيد دائن
                                    </button>
                                </div>
                            </div>

                            <div className="text-end">
                                <span className="text-slate-400 text-xs block">إجمالي المسترد</span>
                                <div className="flex items-end gap-1">
                                    <span className="text-2xl font-black text-emerald-400">{totals.displayTotal.toLocaleString()}</span>
                                    <span className="text-sm font-bold text-emerald-500 mb-1">{currencySymbol}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" fullWidth onClick={onClose}>إلغاء</Button>
                            <Button
                                variant="primary"
                                fullWidth
                                icon={<Save size={18} />}
                                disabled={totals.displayTotal === 0 || !generalReason && returnItems.every(i => !i.returnReason)}
                                onClick={handleSubmit}
                            >
                                تأكيد المرتجع
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default SaleReturnFormModal;
