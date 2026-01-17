/**
 * Branch Selector Component
 * مكون محذوف - النظام المبسط لا يحتاج فروع
 * @deprecated هذا المكون محذوف، يُرجى عدم استخدامه
 */

import React from 'react';

interface BranchSelectorProps {
    compact?: boolean;
    onBranchChange?: (branch: any) => void;
}

/**
 * @deprecated لم يعد هناك فروع في النظام المبسط
 */
const BranchSelector: React.FC<BranchSelectorProps> = () => {
    // لا يعرض شيء - النظام المبسط لا يحتاج فروع
    return null;
};

export default BranchSelector;
