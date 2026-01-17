
import React, { useState, useMemo, useRef, useCallback } from 'react';
import Modal from '../Common/Modal';
import Button from '../UI/Button';
import { useApp } from '../../context/AppContext';
import { useSales } from '../../context/SalesContext';
import { useSettings } from '../../context/SettingsContext';
import { useSaleForm } from '../../hooks/useSaleForm';
import { useCurrency, DEFAULT_SALE_CURRENCY } from '../../hooks/useCurrency';
import SaleFormHeader from './Form/SaleFormHeader';
import ItemSelectorModal from './ItemSelectorModal';
import { Plus, Trash2, Save, Coins, ArrowLeftRight, Phone, MapPin, Calendar, Gauge, Cog, Zap } from 'lucide-react';
import { Sale } from '../../types';

interface SaleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sale: Sale) => void;
}

const SaleFormModal: React.FC<SaleFormModalProps> = ({ isOpen, onClose, onSave }) => {
  const { settings } = useApp();
  const { settings: fullSettings } = useSettings();
  const { customers } = useSales();
  const { items, totals, addItem, updateItem, removeItem, resetForm } = useSaleForm(0);
  const {
    activeCurrencies,
    calculateSaleAmount,
    getCurrentRate,
    BASE_CURRENCY,
    getCurrency
  } = useCurrency();

  const [customerId, setCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | 'bank'>('cash');
  const [saleCurrency, setSaleCurrency] = useState(DEFAULT_SALE_CURRENCY);
  const [isItemSelectorOpen, setIsItemSelectorOpen] = useState(false);

  const company = fullSettings.company;
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  const convertedTotals = useMemo(() => {
    return calculateSaleAmount(totals.subTotal, saleCurrency);
  }, [totals.subTotal, saleCurrency, calculateSaleAmount]);

  const currentRate = useMemo(() => {
    return getCurrentRate(BASE_CURRENCY, saleCurrency);
  }, [saleCurrency, getCurrentRate, BASE_CURRENCY]);

  const selectedCurrency = useMemo(() => {
    return getCurrency(saleCurrency);
  }, [saleCurrency, getCurrency]);

  // تحويل السعر لعملة البيع
  const convertPrice = useCallback((priceInSAR: number) => {
    if (saleCurrency === BASE_CURRENCY) return priceInSAR;
    return priceInSAR * currentRate;
  }, [saleCurrency, currentRate, BASE_CURRENCY]);

  // التنقل بالكيبورد
  const handleKeyDown = useCallback((e: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
    const moveToCell = (newRow: number, newCol: number) => {
      const input = inputRefs.current[newRow]?.[newCol];
      if (input) {
        e.preventDefault();
        input.focus();
        input.select();
      }
    };

    switch (e.key) {
      case 'ArrowDown':
      case 'Enter':
        if (rowIndex < items.length - 1) {
          moveToCell(rowIndex + 1, colIndex);
        }
        break;
      case 'ArrowUp':
        if (rowIndex > 0) {
          moveToCell(rowIndex - 1, colIndex);
        }
        break;
      case 'ArrowRight':
      case 'Tab':
        if (!e.shiftKey && colIndex < 1) {
          moveToCell(rowIndex, colIndex + 1);
        } else if (!e.shiftKey && colIndex === 1 && rowIndex < items.length - 1) {
          moveToCell(rowIndex + 1, 0);
        }
        break;
      case 'ArrowLeft':
        if (colIndex > 0) {
          moveToCell(rowIndex, colIndex - 1);
        } else if (colIndex === 0 && rowIndex > 0) {
          moveToCell(rowIndex - 1, 1);
        }
        break;
    }
  }, [items.length]);

  const setInputRef = useCallback((rowIndex: number, colIndex: number) => (el: HTMLInputElement | null) => {
    if (!inputRefs.current[rowIndex]) {
      inputRefs.current[rowIndex] = [];
    }
    inputRefs.current[rowIndex][colIndex] = el;
  }, []);

  const handleSubmit = () => {
    if (items.length === 0) return;
    const customer = customers.find(c => c.id === customerId);

    const sale: Sale = {
      id: `SALE-${Date.now()}`,
      invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString().split('T')[0],
      customerId: customerId || 'general-customer',
      customerName: customer?.companyName || customer?.name || 'زبون عام',
      items,
      subTotal: totals.subTotal,
      taxTotal: 0,
      discount: 0,
      grandTotal: convertedTotals.displayAmount,
      paymentMethod,
      status: paymentMethod === 'credit' ? 'pending' : 'paid',
      saleCurrency: saleCurrency,
      exchangeRateUsed: convertedTotals.exchangeRate,
      baseGrandTotal: totals.subTotal
    };

    onSave(sale);
    resetForm();
    setCustomerId('');
    setSaleCurrency(DEFAULT_SALE_CURRENCY);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="full">
      <div className="space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* ═══════════════ رأس الفاتورة - تصميم مُحسَّن ═══════════════ */}
        <div className="relative -mx-6 -mt-4 overflow-hidden">
          {/* خلفية متحركة */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
            {/* جزيئات متحركة */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-cyan-400/30 rounded-full animate-pulse"
                  style={{
                    left: `${15 + i * 15}%`,
                    top: `${20 + (i % 3) * 30}%`,
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: `${2 + i * 0.5}s`
                  }}
                />
              ))}
            </div>
          </div>

          {/* خطوط متحركة */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent" style={{ animationDelay: '0.5s' }} />

          <div className="relative px-4 py-4 sm:px-6 sm:py-5">
            {/* الصف الرئيسي - شعار + معلومات */}
            <div className="flex items-center justify-between gap-4">
              {/* اللوجو والاسم */}
              <div className="flex items-center gap-3 sm:gap-4">
                {/* اللوجو مع تأثير توهج */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition-opacity animate-pulse" />
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center border border-cyan-500/40 shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                    {company.logo ? (
                      <img src={company.logo} alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
                    ) : (
                      <div className="relative">
                        <Gauge className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400 animate-pulse" />
                        <Cog className="w-4 h-4 text-orange-400 absolute -bottom-1 -right-1 animate-spin" style={{ animationDuration: '3s' }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* اسم الشركة */}
                <div>
                  <h2 className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 tracking-tight">
                    {company.name || 'قطع غيار السيارات'}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {company.phone && (
                      <span className="flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full">
                        <Phone size={9} className="text-cyan-400" /> {company.phone}
                      </span>
                    )}
                    {company.address && (
                      <span className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full">
                        <MapPin size={9} className="text-orange-400" /> {company.address}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* نوع المستند والتاريخ */}
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-3 py-1.5 rounded-lg border border-cyan-500/30">
                  <Zap className="text-cyan-400" size={16} />
                  <span className="text-white font-black text-sm sm:text-base">فاتورة مبيعات</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Calendar size={10} className="text-orange-400" />
                  {new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <SaleFormHeader
          customers={customers}
          customerId={customerId}
          setCustomerId={setCustomerId}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
        />

        {/* اختيار العملة */}
        <div className="flex items-center justify-between bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800/50 dark:to-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Coins size={22} className="text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">عملة البيع</span>
              {saleCurrency !== BASE_CURRENCY && (
                <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold flex items-center gap-1">
                  <ArrowLeftRight size={10} /> 1 {BASE_CURRENCY} = {currentRate.toLocaleString()} {saleCurrency}
                </p>
              )}
            </div>
          </div>
          <select
            value={saleCurrency}
            onChange={(e) => setSaleCurrency(e.target.value)}
            className="px-5 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 text-sm font-black text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none rounded-xl transition-all cursor-pointer"
          >
            {activeCurrencies.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.nameAr} ({currency.symbol})
              </option>
            ))}
          </select>
        </div>

        {/* بنود الفاتورة */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Cog size={18} className="text-cyan-500" /> قائمة القطع
              {items.length > 0 && (
                <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow">
                  {items.length}
                </span>
              )}
            </h4>
            <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setIsItemSelectorOpen(true)}>
              إضافة قطعة
            </Button>
          </div>

          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-lg">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
                  <th className="p-4 text-start font-black">القطعة</th>
                  <th className="p-4 text-center font-black w-28">الكمية</th>
                  <th className="p-4 text-center font-black w-36">السعر ({selectedCurrency?.symbol})</th>
                  <th className="p-4 text-center font-black w-40">الإجمالي</th>
                  <th className="p-4 text-center font-black w-14"></th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? items.map((item, rowIndex) => (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-cyan-50/30 dark:hover:bg-cyan-900/10 transition-colors group">
                    <td className="p-4">
                      <div>
                        <span className="font-black text-slate-800 dark:text-slate-200 block group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">{item.name}</span>
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded mt-1 inline-block">
                          {item.sku}
                        </span>
                      </div>
                    </td>
                    <td className="p-2">
                      <input
                        ref={setInputRef(rowIndex, 0)}
                        type="number"
                        className="w-full p-3 text-center bg-slate-50 dark:bg-slate-800 font-black text-cyan-600 dark:text-cyan-400 text-lg outline-none border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all"
                        value={item.quantity || ''}
                        placeholder=""
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, 0)}
                        onChange={(e) => updateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 0))}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        ref={setInputRef(rowIndex, 1)}
                        type="number"
                        className="w-full p-3 text-center bg-slate-50 dark:bg-slate-800 font-black text-slate-700 dark:text-slate-200 text-lg outline-none border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all"
                        value={convertPrice(item.unitPrice) || ''}
                        placeholder=""
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, 1)}
                        onChange={(e) => {
                          const priceInSaleCurrency = parseFloat(e.target.value) || 0;
                          const priceInSAR = saleCurrency === BASE_CURRENCY ? priceInSaleCurrency : priceInSaleCurrency / currentRate;
                          updateItem(item.id, 'unitPrice', priceInSAR);
                        }}
                      />
                    </td>
                    <td className="p-4 text-center">
                      <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 rounded-xl py-2 px-3">
                        <span className="font-black text-xl text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {convertPrice(item.quantity * item.unitPrice).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 block">{selectedCurrency?.symbol}</span>
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-10 h-10 flex items-center justify-center text-rose-400 hover:text-white hover:bg-gradient-to-br hover:from-rose-500 hover:to-pink-600 rounded-xl transition-all shadow-sm hover:shadow-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center">
                          <Cog size={36} className="text-slate-300 dark:text-slate-600" />
                        </div>
                        <p className="font-bold text-lg">لا توجد قطع</p>
                        <p className="text-[11px]">اضغط "إضافة قطعة" لإضافة منتجات للفاتورة</p>
                        <p className="text-[9px] text-slate-300 dark:text-slate-600 mt-2">
                          💡 يمكنك التنقل بين الحقول باستخدام الأسهم أو Tab
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ملخص الفاتورة */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 p-6 rounded-2xl shadow-2xl">
          {/* خط مضيء */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-orange-500" />

          <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
            <span className="text-slate-400 font-bold">المجموع بالسعودي</span>
            <span className="text-white font-black text-xl tabular-nums">{totals.subTotal.toLocaleString()} ر.س</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-black text-xl">المبلغ المطلوب</span>
              <p className="text-[10px] text-slate-500">{selectedCurrency?.nameAr}</p>
            </div>
            <div className="text-end">
              <span className="text-4xl font-black text-white tabular-nums">
                {convertedTotals.displayAmount.toLocaleString()}
              </span>
              <span className="text-cyan-400 text-lg font-black mr-2">{selectedCurrency?.symbol}</span>
            </div>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose}>إلغاء</Button>
          <Button
            variant="primary"
            fullWidth
            icon={<Save size={18} />}
            onClick={handleSubmit}
            disabled={!customerId || items.length === 0}
          >
            حفظ الفاتورة
          </Button>
        </div>
      </div>

      <ItemSelectorModal isOpen={isItemSelectorOpen} onClose={() => setIsItemSelectorOpen(false)} onSelect={(item) => addItem(item)} />
    </Modal>
  );
};

export default SaleFormModal;
