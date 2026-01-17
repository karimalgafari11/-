
import React, { useMemo, useEffect } from 'react';
import { Customer, GENERAL_CUSTOMER } from '../../../types';
import { User, Wallet, Clock, CreditCard, UserCircle } from 'lucide-react';

interface SaleFormHeaderProps {
  customers: Customer[];
  customerId: string;
  setCustomerId: (id: string) => void;
  paymentMethod: 'cash' | 'credit' | 'bank';
  setPaymentMethod: (m: 'cash' | 'credit' | 'bank') => void;
}

const SaleFormHeader: React.FC<SaleFormHeaderProps> = ({
  customers, customerId, setCustomerId, paymentMethod, setPaymentMethod
}) => {
  // دمج الزبون العام مع قائمة العملاء
  const allCustomers = useMemo(() => {
    return [GENERAL_CUSTOMER, ...customers];
  }, [customers]);

  // تحديد العميل المختار
  const selectedCustomer = useMemo(() => {
    return allCustomers.find(c => c.id === customerId);
  }, [allCustomers, customerId]);

  // هل العميل نقدي فقط؟
  const isCashOnly = selectedCustomer?.cashOnly === true;

  // إذا كان العميل نقدي فقط وطريقة الدفع آجل، غيّر إلى نقدي
  useEffect(() => {
    if (isCashOnly && paymentMethod === 'credit') {
      setPaymentMethod('cash');
    }
  }, [isCashOnly, paymentMethod, setPaymentMethod]);

  // تعيين الزبون العام كافتراضي
  useEffect(() => {
    if (!customerId) {
      setCustomerId(GENERAL_CUSTOMER.id);
    }
  }, [customerId, setCustomerId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/50 p-5 border border-slate-200 dark:border-slate-800 shadow-inner">
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">العميل المستهدف</label>
        <div className="relative">
          {selectedCustomer?.isGeneral ? (
            <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500" size={14} />
          ) : (
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          )}
          <select
            className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:border-primary appearance-none"
            value={customerId}
            onChange={e => setCustomerId(e.target.value)}
          >
            {allCustomers.map(c => (
              <option key={c.id} value={c.id}>
                {c.isGeneral ? `🏷️ ${c.name}` : c.companyName || c.name}
              </option>
            ))}
          </select>
        </div>
        {isCashOnly && (
          <p className="text-[9px] text-amber-600 dark:text-amber-400 font-bold">
            ⚠️ هذا العميل نقدي فقط - لا يُسمح بالبيع الآجل
          </p>
        )}
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">آلية التحصيل</label>
        <div className="flex gap-2 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 h-[42px]">
          {[
            { id: 'cash', icon: Wallet, label: 'نقدي', disabled: false },
            { id: 'credit', icon: Clock, label: 'آجل', disabled: isCashOnly },
            { id: 'bank', icon: CreditCard, label: 'بنكي', disabled: false }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => !m.disabled && setPaymentMethod(m.id as any)}
              disabled={m.disabled}
              className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-black transition-all ${m.disabled
                  ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed line-through'
                  : paymentMethod === m.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 uppercase'
                }`}
            >
              <m.icon size={12} /> {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SaleFormHeader;

