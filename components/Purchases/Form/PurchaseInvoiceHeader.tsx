/**
 * رأس فاتورة المشتريات
 */

import React from 'react';
import { Phone, MapPin, Truck, Calendar, Package } from 'lucide-react';
import { PurchaseInvoiceHeaderProps } from './types';

const PurchaseInvoiceHeader: React.FC<PurchaseInvoiceHeaderProps> = ({ company }) => {
    return (
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
                <div className="flex items-center justify-between gap-4">
                    {/* اللوجو والاسم */}
                    <div className="flex items-center gap-3 sm:gap-4">
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
    );
};

export default PurchaseInvoiceHeader;
