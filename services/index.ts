/**
 * Services Index - تصدير جميع الخدمات
 */

// Core Services
export { productsService as ProductService } from './productsService';
export { customersService as CustomerService } from './customersService';
export { SalesService } from './salesService';
export { AccountingService } from './accountingService';
export { ActivityLogger } from './activityLogger';
export { SyncService } from './syncService';
export { OrganizationService } from './organizationService';
export { PermissionsService } from './permissionsService';
export { DatabaseService } from './databaseService';

// ERP Core Services
export { authService } from './authService';
export { companyService } from './companyService';
export { profileService } from './profileService';
export { rolesService } from './rolesService';

// Accounting Services
export { accountsService } from './accountsService';
export { journalEntriesService } from './journalEntriesService';
export { fiscalYearsService } from './fiscalYearsService';
export { costCentersService } from './costCentersService';

// Partner Services
export { businessPartnersService } from './businessPartnersService';
export { customersService } from './customersService';
export { suppliersService } from './suppliersService';

// Product & Inventory Services
export { productsService } from './productsService';
export { productCategoriesService } from './productCategoriesService';
export { productVariantsService } from './productVariantsService';
export { unitsService } from './unitsService';
export { inventoryService } from './inventoryService';
export { warehousesService } from './warehousesService';
export { storageLocationsService } from './storageLocationsService';
export { transferOrdersService } from './transferOrdersService';

// Document & Invoice Services
export { invoicesService } from './invoicesService';
export { quotationsService } from './quotationsService';
export { returnsService } from './returnsService';
export { documentTemplatesService } from './documentTemplatesService';
export { documentPaymentsService } from './documentPaymentsService';

// Payment Services
export { vouchersService } from './vouchersService';
export { paymentMethodsService } from './paymentMethodsService';

// Currency Services
export { CurrencyService as currencyService } from './currencyService';

// Project Services
export { projectsService } from './projectsService';

// إعادة تصدير الأنواع المفيدة
export type { JournalEntryWithLines, CreateJournalEntryData } from './accountingService';
export type { TransferOrderWithItems, CreateTransferData } from './transferOrdersService';
export type { DocumentPaymentWithDetails } from './documentPaymentsService';

