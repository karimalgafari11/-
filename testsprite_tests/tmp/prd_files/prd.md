 

 

# Product Requirements Document (PRD)

## Alzhra Accounting System

---

## 1. Introduction

**Alzhra Accounting System** is a professional, web-based accounting application designed for small and medium-sized businesses.
The system is built with **financial accuracy, auditability, and architectural correctness** as first-class requirements.

Alzhra strictly follows **Double-Entry Accounting principles** and **Clean Architecture**, ensuring that all financial logic is deterministic, testable, and independent of the user interface.

---

## 2. Product Objectives

1. Guarantee **financial correctness and audit safety**
2. Enforce **strict separation of concerns**
3. Support scalable accounting operations (Sales, Purchases, Inventory)
4. Enable future expansion (AI, Mobile Apps, APIs)
5. Provide a clean, fast, and reliable user experience

---

## 3. Technology Stack & Architecture

### Technology

* **Language:** TypeScript (Strict Mode, no `any`)
* **Frontend:** React
* **Database:** Supabase / PostgreSQL
* **State Management:** React Context (State Only)

### Architecture Pattern

**Clean Architecture (Mandatory)**

```
UI (Pages / Components)
 → Custom Hooks (Application Logic)
   → Domain Layer (Accounting & Business Logic)
     → Services (Data Access / APIs)
       → Database / Storage
```

### Architectural Rules

* Domain layer is **framework-agnostic**
* No accounting logic inside UI, Context, or Services
* Services are stateless and dumb
* Context manages state only, never business rules

---

## 4. Core Domain Modules

### 4.1 Accounting Core

`src/domain/accounting/`

**Responsibilities:**

* Double-entry journal enforcement
* Chart of Accounts
* Trial Balance validation
* Balance Sheet & Income Statement generation
* Period locking (Fiscal Years)

**Rules:**

* Total Debits MUST equal Total Credits
* Posted journals are immutable
* Every financial record must be traceable

---

### 4.2 Sales Domain

`src/domain/sales/`

**Responsibilities:**

* Sales invoices
* Tax calculations
* Revenue recognition
* Customer balances
* Payment allocation (partial / full)

**Accounting Impact:**

* Accounts Receivable
* Revenue
* Tax Liability
* COGS (linked to inventory)

---

### 4.3 Purchases Domain

`src/domain/purchases/`

**Responsibilities:**

* Purchase invoices
* Supplier balances
* Expense classification
* Landed cost calculation

**Accounting Impact:**

* Accounts Payable
* Inventory / Expenses
* Tax credits (if applicable)

---

### 4.4 Inventory Domain

`src/domain/inventory/`

**Responsibilities:**

* Stock movements
* Inventory valuation
* Weighted Average Cost
* COGS calculation
* Stock adjustments & write-offs

**Rules:**

* Inventory value must always reconcile with ledger
* No negative stock unless explicitly allowed

---

### 4.5 Finance Domain

`src/domain/finance/`

**Responsibilities:**

* Multi-currency calculations
* Exchange rate handling
* Financial summaries
* Tax engine abstraction

**Rules:**

* No implicit currency conversion
* Currency must always be explicit
* Rounding rules must be consistent and documented

---

## 5. Non-Functional Requirements

* 100% deterministic financial calculations
* High performance with large datasets
* Full audit trail
* Secure data isolation per company
* Future-ready for AI analysis

---

## 6. User Experience Flow

1. Dashboard overview (KPIs)
2. Transaction entry (Sales / Purchases / Expenses)
3. Automatic journal posting
4. Reports & financial statements
5. Configuration & settings

---

## 7. Testing & Quality Assurance

* Unit tests required for all Domain logic
* Tests must validate:

  * Journal balancing
  * Inventory valuation
  * Tax & currency calculations
* No financial logic without test coverage

---

## 8. Future Roadmap

* Role-Based Access Control (RBAC)
* AI Accounting Assistant
* Advanced Financial Analytics
* Mobile Application
* Open API

---

## Final Statement

> Alzhra must be treated as a **real-world accounting system subject to financial audit and legal accountability**.
> Architectural shortcuts are not acceptable.

-
