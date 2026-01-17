# 🏗️ Application Architecture

## Overview

This accounting application follows a **Clean Architecture** pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                             │
│                    (Pages, Components)                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                     Custom Hooks                            │
│           (useAddSale, useExpenses, etc.)                   │
│         Orchestration & Side Effect Management              │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    Context Layer                            │
│    (SalesContext, FinanceContext, InventoryContext)         │
│              STATE ONLY - No business logic                 │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    Domain Layer                             │
│                  src/domain/**/*.ts                         │
│        Pure TypeScript - All accounting logic here          │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   Services Layer                            │
│                  services/**/*.ts                           │
│         DUMB - Storage, API calls, orchestration            │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   Storage Layer                             │
│              LocalStorage / Supabase                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Domain Layer (`src/domain/`)

**The heart of the application.** Contains all business rules and accounting logic.

### Rules
- ✅ Pure TypeScript functions only
- ✅ No React, no Context, no database calls
- ✅ Deterministic and testable
- ✅ All calculations must be reproducible

### Modules

| Module | Location | Purpose |
|--------|----------|---------|
| **Accounting** | `domain/accounting/` | Journal entries, trial balance, validation |
| **Sales** | `domain/sales/` | Sale calculations, totals, profit margin |
| **Purchases** | `domain/purchases/` | Purchase totals, landed cost |
| **Inventory** | `domain/inventory/` | COGS, average cost, stock validation |
| **Finance** | `domain/finance/` | Currency, tax, financial summary |

### Key Files

```
src/domain/
├── accounting/
│   ├── journalBuilder.ts    ← Builds journal entry lines
│   ├── ledger.ts            ← Trial balance calculations
│   ├── validation.ts        ← Entry balance validation
│   └── financialStatements.ts
├── sales/
│   └── calculations.ts      ← Sale totals, validation, profit
├── purchases/
│   └── calculations.ts      ← Purchase totals, landed cost
├── inventory/
│   └── costing.ts           ← COGS, weighted average cost
├── finance/
│   ├── currency.ts          ← Money formatting, arithmetic
│   ├── tax.ts               ← Tax calculations
│   └── summary.ts           ← Financial summary
└── index.ts                 ← Central exports
```

---

## Type System (`src/types/domain/`)

Strict TypeScript types with no `any`.

### Branded IDs
```typescript
type AccountId = string & { readonly __brand: 'AccountId' };
type SaleId = string & { readonly __brand: 'SaleId' };
```

### Money Type
```typescript
interface Money {
    readonly amount: number;
    readonly currency: CurrencyCode;
}
```

### Enums
- `PaymentMethod`: cash, credit, bank_transfer
- `VoucherType`: receipt, payment
- `AccountType`: asset, liability, equity, revenue, expense

---

## Context Layer (`context/`)

**STATE ONLY.** No business logic.

| File | Responsibility |
|------|----------------|
| `SalesContext.tsx` | Store sales, customers, invoices |
| `FinanceContext.tsx` | Store transactions, expenses |
| `InventoryContext.tsx` | Store inventory, warehouses |

### ❌ What NOT to do in Context
```tsx
// BAD - Business logic in context
const addSale = async (sale) => {
    await AutoJournalService.createSaleEntry(sale, ...);  // ❌
};
```

### ✅ Correct approach
```tsx
// GOOD - Context only manages state
const addSale = (sale) => {
    setSales(prev => [sale, ...prev]);  // ✅
};

// Use hook for orchestration
const { addSaleWithJournal } = useAddSale();
```

---

## Custom Hooks (`hooks/`)

Orchestration layer that connects Domain, Context, and Services.

| Hook | Purpose |
|------|---------|
| `useAddSale` | Add sale + create journal entries |
| `useSaleForm` | Sale form state management |
| `useCurrency` | Currency formatting |

---

## Services Layer (`services/`)

**DUMB services.** Storage operations only.

| Service | Responsibility |
|---------|----------------|
| `autoJournalService.ts` | Orchestrate journal creation (calls domain) |
| `accountingService.ts` | CRUD for accounts, entries |
| `financeService.ts` | Financial data aggregation |

### Service Flow
```
Service.createSaleEntry()
   │
   ├─→ AccountingService.findAccount()  // Get account IDs
   │
   ├─→ journalBuilder.buildSaleJournalLines()  // Domain logic
   │
   └─→ AccountingService.createJournalEntry()  // Save to storage
```

---

## Testing

Domain layer has comprehensive unit tests:

```bash
npm test
```

### Test Locations
- `src/domain/accounting/tests/`
- `src/domain/sales/tests/`
- `src/domain/finance/tests/`

---

## Key Principles

1. **Separation of Concerns**: Each layer has one responsibility
2. **Testability**: Domain logic is pure and easy to test
3. **Auditability**: Accounting rules are isolated and traceable
4. **Type Safety**: Branded IDs prevent accidental ID mixing
5. **Immutability**: Money objects are frozen
