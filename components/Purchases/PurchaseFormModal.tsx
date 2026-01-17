
import React, { useState } from 'react';
import Modal from '../Common/Modal';
import Button from '../UI/Button';
import { usePurchases } from '../../context/PurchasesContext';
import { useInventory } from '../../context/InventoryContext';
import { useSettings } from '../../context/SettingsContext';
import { usePurchaseForm } from '../../hooks/usePurchaseForm';
import { useCurrency, DEFAULT_PURCHASE_CURRENCY } from '../../hooks/useCurrency';
import PurchaseFormHeader from './Form/PurchaseFormHeader';
import ItemSelectorModal from '../Sales/ItemSelectorModal';
import { Boxes, Plus, Trash2, Save, Coins, Phone, MapPin, Truck, Calendar, Package } from 'lucide-react';
import { Purchase } from '../../types';

interface PurchaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (purchase: Purchase) => void;
}

const PurchaseFormModal: React.FC<PurchaseFormModalProps> = ({ isOpen, onClose, onSave }) => {
  const { suppliers } = usePurchases();
  const { warehouses } = useInventory();
  const { settings: fullSettings } = useSettings();
  const { items, totals, addItem, updateItem, removeItem, resetItems } = usePurchaseForm();
  const { activeCurrencies, getCurrency } = useCurrency();

  const [supplierId, setSupplierId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [reference, setReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit'>('cash');
  const [currency, setCurrency] = useState(DEFAULT_PURCHASE_CURRENCY);
  const [isItemSelectorOpen, setIsItemSelectorOpen] = useState(false);

  const selectedCurrency = getCurrency(currency);
  const company = fullSettings.company;

  const grandTotal = items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);

  const handleSubmit = () => {
    if (!supplierId || items.length === 0) return;
    const supplier = suppliers.find(s => s.id === supplierId);

    const purchase: Purchase = {
      id: `PUR-${Date.now()}`,
      invoiceNumber: `PUR-INV-${Math.floor(1000 + Math.random() * 9000)}`,
      referenceNumber: reference,
      date: new Date().toISOString().split('T')[0],
      supplierId,
      supplierName: supplier?.companyName || 'مورد عام',
      items,
      subTotal: grandTotal,
      taxTotal: 0,
      grandTotal: grandTotal,
      paymentMethod,
      status: 'completed',
      currency: currency
    };

    onSave(purchase);
    resetItems();
    setSupplierId('');
    setReference('');
    setCurrency(DEFAULT_PURCHASE_CURRENCY);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="full">
      <div className="space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* ═══════════════ رأس الفاتورة - تصميم مُحسَّن ═══════════════ */}
        <div className="relative -mx-6 -mt-4 overflow-hidden">
          {/* خلفية متحركة */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
            {/* جزيئات متحركة */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-emerald-400/30 rounded-full animate-pulse"
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
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal-500 to-transparent" />

          <div className="relative px-4 py-4 sm:px-6 sm:py-5">
            {/* الصف الرئيسي - شعار + معلومات */}
            <div className="flex items-center justify-between gap-4">
              {/* اللوجو والاسم */}
              <div className="flex items-center gap-3 sm:gap-4">
                {/* اللوجو مع تأثير توهج */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition-opacity animate-pulse" />
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl flex items-center justify-center border border-emerald-500/40 shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                    {company.logo ? (
                      <img src={company.logo} alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
                    ) : (
                      <div className="relative">
                        <Package className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600 animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>

                {/* اسم الشركة */}
                <div>
                  <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                    {company.name || 'اسم الشركة'}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {company.phone && (
                      <span className="flex items-center gap-1 text-[9px] sm:text-[10px] text-white/70 bg-white/10 px-2 py-0.5 rounded-full">
                        <Phone size={9} /> {company.phone}
                      </span>
                    )}
                    {company.address && (
                      <span className="hidden sm:flex items-center gap-1 text-[10px] text-white/70 bg-white/10 px-2 py-0.5 rounded-full">
                        <MapPin size={9} /> {company.address}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* نوع المستند والتاريخ */}
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg border border-white/30">
                  <Truck className="text-white" size={16} />
                  <span className="text-white font-black text-sm sm:text-base">فاتورة مشتريات</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-white/70">
                  <Calendar size={10} />
                  {new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <PurchaseFormHeader
          suppliers={suppliers}
          warehouses={warehouses}
          supplierId={supplierId}
          setSupplierId={setSupplierId}
          warehouseId={warehouseId}
          setWarehouseId={setWarehouseId}
          reference={reference}
          setReference={setReference}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
        />

        {/* اختيار العملة */}
        <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <Coins size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">عملة الشراء</span>
              <p className="text-sm font-black text-slate-700 dark:text-slate-200">{selectedCurrency?.nameAr}</p>
            </div>
          </div>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 text-sm font-black text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none rounded-xl transition-all"
          >
            {activeCurrencies.map(curr => (
              <option key={curr.code} value={curr.code}>
                {curr.nameAr} ({curr.symbol})
              </option>
            ))}
          </select>
        </div>

        {/* بنود الفاتورة */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Boxes size={18} className="text-emerald-500" /> بنود الفاتورة
              {items.length > 0 && (
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              )}
            </h4>
            <Button variant="success" size="sm" icon={<Plus size={14} />} onClick={() => setIsItemSelectorOpen(true)}>
              إضافة صنف
            </Button>
          </div>

          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white">
                  <th className="p-4 text-start font-black">الصنف</th>
                  <th className="p-4 text-center font-black w-28">الكمية</th>
                  <th className="p-4 text-center font-black w-32">التكلفة</th>
                  <th className="p-4 text-center font-black w-36">الإجمالي</th>
                  <th className="p-4 text-center font-black w-14"></th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? items.map((item, index) => (
                  <tr key={item.id} className={`border-b border-slate-100 dark:border-slate-800 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors ${index % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}`}>
                    <td className="p-4">
                      <div>
                        <span className="font-black text-slate-800 dark:text-slate-200 block">{item.name}</span>
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded mt-1 inline-block">
                          ID: {item.itemId.slice(-6)}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        className="w-full p-2.5 text-center bg-white dark:bg-slate-800 font-black text-emerald-600 dark:text-emerald-400 outline-none border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        value={item.quantity || ''}
                        placeholder=""
                        onChange={(e) => updateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 0))}
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        className="w-full p-2.5 text-center bg-white dark:bg-slate-800 font-black text-slate-700 dark:text-slate-200 outline-none border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        value={item.costPrice || ''}
                        placeholder=""
                        onChange={(e) => updateItem(item.id, 'costPrice', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-black text-lg text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {(item.quantity * item.costPrice).toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-400 block">{selectedCurrency?.symbol}</span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-9 h-9 flex items-center justify-center text-rose-400 hover:text-white hover:bg-rose-500 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                          <Boxes size={28} className="text-slate-300" />
                        </div>
                        <p className="font-bold">لا توجد أصناف</p>
                        <p className="text-[10px]">اضغط "إضافة صنف" للبدء</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ملخص الفاتورة */}
        <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-cyan-900 p-6 rounded-2xl shadow-2xl">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-white/70 font-bold text-sm">إجمالي المشتريات</span>
              <p className="text-[10px] text-white/50">{selectedCurrency?.nameAr}</p>
            </div>
            <span className="text-4xl font-black text-white tabular-nums">
              {grandTotal.toLocaleString()}
              <span className="text-emerald-300 text-lg mr-2">{selectedCurrency?.symbol}</span>
            </span>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose}>إلغاء</Button>
          <Button
            variant="success"
            fullWidth
            icon={<Save size={18} />}
            onClick={handleSubmit}
            disabled={!supplierId || items.length === 0}
          >
            اعتماد الفاتورة
          </Button>
        </div>
      </div>

      <ItemSelectorModal isOpen={isItemSelectorOpen} onClose={() => setIsItemSelectorOpen(false)} onSelect={(item) => addItem(item, warehouseId || warehouses[0]?.id)} />
    </Modal>
  );
};

export default PurchaseFormModal;
