/**
 * رأس الفاتورة - التصميم المتحرك
 */

import React from 'react';
import { Phone, MapPin, Calendar, Gauge, Cog, Zap } from 'lucide-react';
import { InvoiceHeaderProps } from './types';

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({ company }) => {
    return (
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
    );
};

export default InvoiceHeader;
