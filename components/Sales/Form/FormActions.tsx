/**
 * أزرار التحكم بالنموذج
 */

import React from 'react';
import { Save } from 'lucide-react';
import Button from '../../UI/Button';
import { FormActionsProps } from './types';

const FormActions: React.FC<FormActionsProps> = ({
    onClose,
    onSubmit,
    disabled
}) => {
    return (
        <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={onClose}>إلغاء</Button>
            <Button
                variant="primary"
                fullWidth
                icon={<Save size={18} />}
                onClick={onSubmit}
                disabled={disabled}
            >
                حفظ الفاتورة
            </Button>
        </div>
    );
};

export default FormActions;
