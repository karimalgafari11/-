/**
 * رأس صفحة السندات - VoucherHeader Component
 */

import React from 'react';
import { Receipt, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import Button from '../../../components/UI/Button';
import { PrivacyToggle } from '../../../components/Common/PrivacyToggle';

interface VoucherHeaderProps {
    theme: string;
    onAddReceipt: () => void;
    onAddPayment: () => void;
}

const VoucherHeader: React.FC<VoucherHeaderProps> = ({
    theme,
    onAddReceipt,
    onAddPayment
}) => {
    return (
        <div className={`
            p-6 rounded-2xl border
            ${theme === 'light'
                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
                : 'bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border-emerald-800/30'
            }
        `}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className={`
                        w-14 h-14 rounded-2xl flex items-center justify-center
                        ${theme === 'light'
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30'
                            : 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-lg shadow-emerald-900/30'
                        }
                    `}>
                        <Receipt className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-black ${theme === 'light' ? 'text-emerald-900' : 'text-emerald-100'}`}>
                            السندات المالية
                        </h1>
                        <p className={`text-sm ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`}>
                            سندات القبض والدفع
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <PrivacyToggle showLabel={false} />
                    <Button
                        variant="success"
                        size="sm"
                        icon={<ArrowDownCircle size={16} />}
                        onClick={onAddReceipt}
                    >
                        <span className="hidden sm:inline">سند قبض جديد</span>
                        <span className="sm:hidden">قبض</span>
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        icon={<ArrowUpCircle size={16} />}
                        onClick={onAddPayment}
                    >
                        <span className="hidden sm:inline">سند دفع جديد</span>
                        <span className="sm:hidden">دفع</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default VoucherHeader;
