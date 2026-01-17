// Re-export all types from sub-files for easy importing
export * from './common';
export * from './settings-extended';
export * from './sales';
export * from './expenses';
export * from './invoices';
export * from './inventory';
export * from './suppliers';
export * from './purchases';
export * from './finance';
export * from './ui';
export * from './customers';
export * from './vouchers';
export * from './returns';
export * from './webhooks';

// New types for multi-branch system
export * from './organization';
// Note: permissions.ts has conflicting exports with settings-extended.ts
// Import from './permissions' directly when needed
export * from './activityLog';
export * from './sync';
export * from './auth';

// Database types including Product
export type { Product } from './database';