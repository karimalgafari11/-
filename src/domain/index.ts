/**
 * Domain Index
 * تصدير جميع وظائف الدومين
 */

// Accounting
export * from './accounting/ledger';
export * from './accounting/validation';
export * from './accounting/financialStatements';
export * from './accounting/journalBuilder';

// Finance
export * from './finance/currency';
// Note: finance/tax.ts calculateTax conflicts with sales/calculations.ts
// Exporting only non-conflicting exports:
export { calculateAmountBeforeTax, calculateTotalWithTax } from './finance/tax';
export * from './finance/summary';

// Sales
export * from './sales/calculations';

// Purchases
export * from './purchases/calculations';

// Inventory
export * from './inventory/costing';
