/**
 * Print Defaults - القيم الافتراضية للطباعة
 */

import { PrintSettings } from '../../../types/settings-extended';

export const getDefaultPrintSettings = (): PrintSettings => ({
    paperSize: 'A4',
    orientation: 'portrait',
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    showLogo: true,
    logoSize: 'medium',
    fontSize: 12,
    fontFamily: 'Cairo',
    thermalWidth: 80,
    thermalCopies: 1,
    autoPrint: false,
    reportHeader: true,
    reportFooter: true,
    pageNumbers: true
});
