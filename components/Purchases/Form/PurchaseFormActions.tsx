/**
 * أزرار التحكم بنموذج المشتريات
 */

import React from 'react';
import { Save } from 'lucide-react';
import Button from '../../UI/Button';
import { PurchaseFormActionsProps } from './types';

const PurchaseFormActions: React.FC<PurchaseFormActionsProps> = ({
    onClose,
    onSubmit,
    disabled
}) => {
    return (
        <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={onClose}>إلغاء</Button>
            <Button
                variant="success"
                fullWidth
                icon={<Save size={18} />}
                onClick={onSubmit}
                disabled={disabled}
            >
                اعتماد الفاتورة
            </Button>
        </div>
    );
};

export default PurchaseFormActions;
