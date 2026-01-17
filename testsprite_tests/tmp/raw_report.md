
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** alzhra
- **Date:** 2026-01-17
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 Successful login with valid credentials and role-based access
- **Test Code:** [TC001_Successful_login_with_valid_credentials_and_role_based_access.py](./TC001_Successful_login_with_valid_credentials_and_role_based_access.py)
- **Test Error:** User login with valid credentials failed due to persistent form validation errors preventing submission. No successful login or dashboard access was achieved. Role-based permission verification could not be performed.
Browser Console Logs:
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:44:23.658Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:45:16.003Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:46:28.923Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:47:32.446Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:48:43.584Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dd66d72e-4889-4ed1-9e47-5e2308322652/4d3399fd-d4c7-4507-b537-6684ecb61f23
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 Login failure with invalid credentials
- **Test Code:** [TC002_Login_failure_with_invalid_credentials.py](./TC002_Login_failure_with_invalid_credentials.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dd66d72e-4889-4ed1-9e47-5e2308322652/f8af1be5-3539-4fc1-94ac-1fafdf4eb3b6
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 Dashboard KPI loading and display
- **Test Code:** [TC003_Dashboard_KPI_loading_and_display.py](./TC003_Dashboard_KPI_loading_and_display.py)
- **Test Error:** Unable to verify the dashboard financial overview KPIs because login with the provided credentials failed. The page remains on the login screen with no error messages or navigation to the dashboard. The issue has been reported for further investigation.
Browser Console Logs:
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:44:24.109Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://fonts.gstatic.com/s/cairo/v31/SLXVc1nY6HkvangtZmpQdkhzfH5lkSscQyyS4J0.woff2:0:0)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:45:05.643Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[ERROR] Failed to load resource: the server responded with a status of 500 () (at https://swkqfcxrmgzaimjxxlys.supabase.co/rest/v1/profiles?select=*&id=eq.c44def77-ff01-4ca7-b329-287b0df76a2e:0:0)
[ERROR] Failed to load resource: the server responded with a status of 500 () (at https://swkqfcxrmgzaimjxxlys.supabase.co/rest/v1/profiles?select=*&id=eq.c44def77-ff01-4ca7-b329-287b0df76a2e:0:0)
[WARNING] The width(-1) and height(-1) of chart should be greater than 0,
       please check the style of container, or the props width(100%) and height(100%),
       or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the
       height and width. (at http://localhost:3000/node_modules/.vite/deps/recharts.js?v=ff4b7bf8:9037:16)
[WARNING] The width(-1) and height(-1) of chart should be greater than 0,
       please check the style of container, or the props width(100%) and height(100%),
       or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the
       height and width. (at http://localhost:3000/node_modules/.vite/deps/recharts.js?v=ff4b7bf8:9037:16)
[WARNING] The width(-1) and height(-1) of chart should be greater than 0,
       please check the style of container, or the props width(100%) and height(100%),
       or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the
       height and width. (at http://localhost:3000/node_modules/.vite/deps/recharts.js?v=ff4b7bf8:9037:16)
[WARNING] The width(-1) and height(-1) of chart should be greater than 0,
       please check the style of container, or the props width(100%) and height(100%),
       or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the
       height and width. (at http://localhost:3000/node_modules/.vite/deps/recharts.js?v=ff4b7bf8:9037:16)
[WARNING] The width(-1) and height(-1) of chart should be greater than 0,
       please check the style of container, or the props width(100%) and height(100%),
       or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the
       height and width. (at http://localhost:3000/node_modules/.vite/deps/recharts.js?v=ff4b7bf8:9037:16)
[WARNING] The width(-1) and height(-1) of chart should be greater than 0,
       please check the style of container, or the props width(100%) and height(100%),
       or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the
       height and width. (at http://localhost:3000/node_modules/.vite/deps/recharts.js?v=ff4b7bf8:9037:16)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:46:14.579Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] Could not fetch profile (timeout or error): Error: Profile fetch timeout
    at http://localhost:3000/services/authService.ts:41:46 (at http://localhost:3000/services/authService.ts:47:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dd66d72e-4889-4ed1-9e47-5e2308322652/495e2a8f-cb6d-4053-82bd-c6970b7bc614
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 Entry of valid sales transaction and invoice generation
- **Test Code:** [TC004_Entry_of_valid_sales_transaction_and_invoice_generation.py](./TC004_Entry_of_valid_sales_transaction_and_invoice_generation.py)
- **Test Error:** Login attempts with provided credentials failed repeatedly without error messages or navigation to sales entry page. Unable to proceed with sales transaction entry verification. Please verify credentials or system status.
Browser Console Logs:
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:44:31.865Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://fonts.gstatic.com/s/cairo/v31/SLXVc1nY6HkvangtZmpQdkhzfH5lkSscQyyS4J0.woff2:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://fonts.gstatic.com/s/cairo/v31/SLXVc1nY6HkvangtZmpQdkhzfH5lkSscRiyS.woff2:0:0)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/index.tsx:0:0)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:45:51.360Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[ERROR] Failed to load resource: the server responded with a status of 500 () (at https://swkqfcxrmgzaimjxxlys.supabase.co/rest/v1/profiles?select=*&id=eq.c44def77-ff01-4ca7-b329-287b0df76a2e:0:0)
[ERROR] Failed to load resource: the server responded with a status of 500 () (at https://swkqfcxrmgzaimjxxlys.supabase.co/rest/v1/profiles?select=*&id=eq.c44def77-ff01-4ca7-b329-287b0df76a2e:0:0)
[WARNING] The width(-1) and height(-1) of chart should be greater than 0,
       please check the style of container, or the props width(100%) and height(100%),
       or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the
       height and width. (at http://localhost:3000/node_modules/.vite/deps/recharts.js?v=ff4b7bf8:9037:16)
[WARNING] The width(-1) and height(-1) of chart should be greater than 0,
       please check the style of container, or the props width(100%) and height(100%),
       or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the
       height and width. (at http://localhost:3000/node_modules/.vite/deps/recharts.js?v=ff4b7bf8:9037:16)
[WARNING] The width(-1) and height(-1) of chart should be greater than 0,
       please check the style of container, or the props width(100%) and height(100%),
       or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the
       height and width. (at http://localhost:3000/node_modules/.vite/deps/recharts.js?v=ff4b7bf8:9037:16)
[WARNING] The width(-1) and height(-1) of chart should be greater than 0,
       please check the style of container, or the props width(100%) and height(100%),
       or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the
       height and width. (at http://localhost:3000/node_modules/.vite/deps/recharts.js?v=ff4b7bf8:9037:16)
[WARNING] The width(-1) and height(-1) of chart should be greater than 0,
       please check the style of container, or the props width(100%) and height(100%),
       or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the
       height and width. (at http://localhost:3000/node_modules/.vite/deps/recharts.js?v=ff4b7bf8:9037:16)
[WARNING] The width(-1) and height(-1) of chart should be greater than 0,
       please check the style of container, or the props width(100%) and height(100%),
       or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the
       height and width. (at http://localhost:3000/node_modules/.vite/deps/recharts.js?v=ff4b7bf8:9037:16)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dd66d72e-4889-4ed1-9e47-5e2308322652/40f04243-2875-48bc-80ac-55f70891f480
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 Validation of double-entry ledger balancing on journal posting
- **Test Code:** [TC005_Validation_of_double_entry_ledger_balancing_on_journal_posting.py](./TC005_Validation_of_double_entry_ledger_balancing_on_journal_posting.py)
- **Test Error:** Unable to proceed with the task as the login attempts with the provided credentials repeatedly fail to navigate beyond the login page. No error messages are shown, but the system does not grant access to the dashboard or journal entry features. Therefore, verification of journal entries for double-entry accounting principle and immutability cannot be completed.
Browser Console Logs:
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/context/app/NotificationContext.tsx:0:0)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:44:43.669Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[ERROR] Failed to load resource: the server responded with a status of 500 () (at https://swkqfcxrmgzaimjxxlys.supabase.co/rest/v1/profiles?select=*&id=eq.c44def77-ff01-4ca7-b329-287b0df76a2e:0:0)
[ERROR] Failed to load resource: the server responded with a status of 500 () (at https://swkqfcxrmgzaimjxxlys.supabase.co/rest/v1/profiles?select=*&id=eq.c44def77-ff01-4ca7-b329-287b0df76a2e:0:0)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:45:42.181Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] Could not fetch profile (timeout or error): Error: Profile fetch timeout
    at http://localhost:3000/services/authService.ts:41:46 (at http://localhost:3000/services/authService.ts:47:12)
[WARNING] Could not fetch profile (timeout or error): Error: Profile fetch timeout
    at http://localhost:3000/services/authService.ts:41:46 (at http://localhost:3000/services/authService.ts:47:12)
[WARNING] Could not fetch profile (timeout or error): Error: Profile fetch timeout
    at http://localhost:3000/services/authService.ts:41:46 (at http://localhost:3000/services/authService.ts:47:12)
[ERROR] Failed to load resource: the server responded with a status of 500 () (at https://swkqfcxrmgzaimjxxlys.supabase.co/rest/v1/profiles?select=*%2Ccompanies%28*%29&id=eq.c44def77-ff01-4ca7-b329-287b0df76a2e:0:0)
[ERROR] Error fetching profile: {code: 42P17, details: null, hint: null, message: infinite recursion detected in policy for relation "profiles"} (at http://localhost:3000/services/companyService.ts:16:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] Could not fetch profile (timeout or error): Error: Profile fetch timeout
    at http://localhost:3000/services/authService.ts:41:46 (at http://localhost:3000/services/authService.ts:47:12)
[ERROR] Failed to load resource: the server responded with a status of 500 () (at https://swkqfcxrmgzaimjxxlys.supabase.co/rest/v1/profiles?select=*&id=eq.c44def77-ff01-4ca7-b329-287b0df76a2e:0:0)
[WARNING] Could not fetch profile (timeout or error): Error: Profile fetch timeout
    at http://localhost:3000/services/authService.ts:41:46 (at http://localhost:3000/services/authService.ts:47:12)
[WARNING] Could not fetch profile (timeout or error): Error: Profile fetch timeout
    at http://localhost:3000/services/authService.ts:41:46 (at http://localhost:3000/services/authService.ts:47:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dd66d72e-4889-4ed1-9e47-5e2308322652/ef6a2a4c-8e5c-46c9-8f19-d5687eb8aedd
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 Trial Balance computation with correct aggregation from chart of accounts
- **Test Code:** [TC006_Trial_Balance_computation_with_correct_aggregation_from_chart_of_accounts.py](./TC006_Trial_Balance_computation_with_correct_aggregation_from_chart_of_accounts.py)
- **Test Error:** The task to verify the trial balance report could not be completed because login to the system failed repeatedly despite correct credentials. The issue has been reported. No journal entries could be posted, and the trial balance report could not be accessed or verified. Please resolve the login issue to proceed with testing.
Browser Console Logs:
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:44:23.155Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:45:08.946Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:46:15.662Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dd66d72e-4889-4ed1-9e47-5e2308322652/b1ea7e7d-7599-4db3-bf75-aa58db17e9df
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 Purchase order creation and landed cost calculation validation
- **Test Code:** [TC007_Purchase_order_creation_and_landed_cost_calculation_validation.py](./TC007_Purchase_order_creation_and_landed_cost_calculation_validation.py)
- **Test Error:** Login failed despite correct credentials input. Cannot proceed with purchase order creation and landed cost verification. Reporting issue and stopping further testing.
Browser Console Logs:
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:44:20.292Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:45:09.897Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:46:16.598Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dd66d72e-4889-4ed1-9e47-5e2308322652/3f926406-9f79-4c2c-a7d3-c5f606add6cd
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 Inventory stock update and weighted average costing after goods receipt
- **Test Code:** [TC008_Inventory_stock_update_and_weighted_average_costing_after_goods_receipt.py](./TC008_Inventory_stock_update_and_weighted_average_costing_after_goods_receipt.py)
- **Test Error:** The task to verify inventory quantities and weighted average cost calculations following stock receipts could not be completed because the login page of the application is not loading properly. The page is completely empty with no input fields or buttons visible, preventing login and further testing steps. This issue has been reported. Please resolve the login page loading problem to proceed with the testing.
Browser Console Logs:
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:44:15.610Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://fonts.gstatic.com/s/cairo/v31/SLXVc1nY6HkvangtZmpQdkhzfH5lkSscQyyS4J0.woff2:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://fonts.gstatic.com/s/cairo/v31/SLXVc1nY6HkvangtZmpQdkhzfH5lkSscRiyS.woff2:0:0)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/context/SettingsContext.tsx:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dd66d72e-4889-4ed1-9e47-5e2308322652/42ab556e-3d63-426a-a3b8-a325f3181fe3
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Inventory stock reduction and COGS calculation upon sales
- **Test Code:** [TC009_Inventory_stock_reduction_and_COGS_calculation_upon_sales.py](./TC009_Inventory_stock_reduction_and_COGS_calculation_upon_sales.py)
- **Test Error:** The task to verify correct inventory stock reduction and cost of goods sold calculation after posting a sales transaction cannot be completed due to a login failure issue. The login form reloads with empty fields after submitting valid credentials, preventing access to the system. This issue has been reported. No further actions can be taken until the login problem is resolved.
Browser Console Logs:
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:44:14.406Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://fonts.gstatic.com/s/cairo/v31/SLXVc1nY6HkvangtZmpQdkhzfH5lkSscQyyS4J0.woff2:0:0)
[ERROR] Failed to load resource: the server responded with a status of 500 () (at https://swkqfcxrmgzaimjxxlys.supabase.co/rest/v1/profiles?select=*&id=eq.c44def77-ff01-4ca7-b329-287b0df76a2e:0:0)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:45:18.682Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] Could not fetch profile (timeout or error): Error: Profile fetch timeout
    at http://localhost:3000/services/authService.ts:41:46 (at http://localhost:3000/services/authService.ts:47:12)
[WARNING] Could not fetch profile (timeout or error): Error: Profile fetch timeout
    at http://localhost:3000/services/authService.ts:41:46 (at http://localhost:3000/services/authService.ts:47:12)
[ERROR] Failed to load resource: the server responded with a status of 500 () (at https://swkqfcxrmgzaimjxxlys.supabase.co/rest/v1/profiles?select=*%2Ccompanies%28*%29&id=eq.c44def77-ff01-4ca7-b329-287b0df76a2e:0:0)
[ERROR] Error fetching profile: {code: 42P17, details: null, hint: null, message: infinite recursion detected in policy for relation "profiles"} (at http://localhost:3000/services/companyService.ts:16:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[ERROR] Failed to load resource: the server responded with a status of 500 () (at https://swkqfcxrmgzaimjxxlys.supabase.co/rest/v1/profiles?select=*&id=eq.c44def77-ff01-4ca7-b329-287b0df76a2e:0:0)
[ERROR] Failed to load resource: the server responded with a status of 500 () (at https://swkqfcxrmgzaimjxxlys.supabase.co/rest/v1/profiles?select=*&id=eq.c44def77-ff01-4ca7-b329-287b0df76a2e:0:0)
[WARNING] Could not fetch profile (timeout or error): Error: Profile fetch timeout
    at http://localhost:3000/services/authService.ts:41:46 (at http://localhost:3000/services/authService.ts:47:12)
[ERROR] Failed to load resource: the server responded with a status of 500 () (at https://swkqfcxrmgzaimjxxlys.supabase.co/rest/v1/profiles?select=*&id=eq.c44def77-ff01-4ca7-b329-287b0df76a2e:0:0)
[ERROR] Failed to load resource: the server responded with a status of 500 () (at https://swkqfcxrmgzaimjxxlys.supabase.co/rest/v1/profiles?select=*%2Ccompanies%28*%29&id=eq.c44def77-ff01-4ca7-b329-287b0df76a2e:0:0)
[ERROR] Error fetching profile: {code: 42P17, details: null, hint: null, message: infinite recursion detected in policy for relation "profiles"} (at http://localhost:3000/services/companyService.ts:16:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dd66d72e-4889-4ed1-9e47-5e2308322652/378f801d-56b8-441a-ba87-8f3a691fa15d
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 Multi-currency transaction handling with rounding rules
- **Test Code:** [TC010_Multi_currency_transaction_handling_with_rounding_rules.py](./TC010_Multi_currency_transaction_handling_with_rounding_rules.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dd66d72e-4889-4ed1-9e47-5e2308322652/7caaed22-c7f3-4f14-a50f-ba17ba326d7e
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011 Permission enforcement on accessing restricted financial reports
- **Test Code:** [TC011_Permission_enforcement_on_accessing_restricted_financial_reports.py](./TC011_Permission_enforcement_on_accessing_restricted_financial_reports.py)
- **Test Error:** The login page is currently broken due to a module fetch error, preventing any login attempts. As a result, it is impossible to verify that only authorized users with proper roles can access and generate financial reports and sensitive data. The issue has been reported, and no further testing could be performed. Please fix the login page issue to enable proper role-based access testing.
Browser Console Logs:
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:44:15.858Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://fonts.gstatic.com/s/cairo/v31/SLXVc1nY6HkvangtZmpQdkhzfH5lkSscQyyS4J0.woff2:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://fonts.gstatic.com/s/cairo/v31/SLXVc1nY6HkvangtZmpQdkhzfH5lkSscRiyS.woff2:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/pages/LoginPage.tsx:0:0)
[ERROR] %o

%s

%s
 TypeError: Failed to fetch dynamically imported module: http://localhost:3000/pages/LoginPage.tsx The above error occurred in one of your React components. React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary. (at http://localhost:3000/node_modules/.vite/deps/react-dom_client.js?v=ff4b7bf8:7000:18)
[ERROR] ErrorBoundary caught an error: TypeError: Failed to fetch dynamically imported module: http://localhost:3000/pages/LoginPage.tsx {componentStack: 
    at Lazy (<anonymous>)
    at Suspense (<anony…s/ErrorBoundary.tsx:7:5)
    at App (<anonymous>)} (at http://localhost:3000/components/ErrorBoundary.tsx:30:12)
[ERROR] %o

%s

%s
 TypeError: Failed to fetch dynamically imported module: http://localhost:3000/pages/LoginPage.tsx The above error occurred in one of your React components. React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary. (at http://localhost:3000/node_modules/.vite/deps/react-dom_client.js?v=ff4b7bf8:7000:18)
[ERROR] ErrorBoundary caught an error: TypeError: Failed to fetch dynamically imported module: http://localhost:3000/pages/LoginPage.tsx {componentStack: 
    at Lazy (<anonymous>)
    at Suspense (<anony…s/ErrorBoundary.tsx:7:5)
    at App (<anonymous>)} (at http://localhost:3000/components/ErrorBoundary.tsx:30:12)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:45:06.778Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://fonts.gstatic.com/s/cairo/v31/SLXVc1nY6HkvangtZmpQdkhzfH5lkSscQyyS4J0.woff2:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://fonts.gstatic.com/s/cairo/v31/SLXVc1nY6HkvangtZmpQdkhzfH5lkSscRiyS.woff2:0:0)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:46:15.017Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dd66d72e-4889-4ed1-9e47-5e2308322652/54e2c846-c75f-4fec-acaf-0e14916eff4e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 Audit trail validation for all financial postings
- **Test Code:** [TC012_Audit_trail_validation_for_all_financial_postings.py](./TC012_Audit_trail_validation_for_all_financial_postings.py)
- **Test Error:** Unable to login with provided credentials and password reset did not proceed. Please provide valid login credentials or alternative access to continue verifying financial transactions and audit trail logging.
Browser Console Logs:
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:44:14.454Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:45:24.831Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] Could not fetch profile (timeout or error): Error: Profile fetch timeout
    at http://localhost:3000/services/authService.ts:41:46 (at http://localhost:3000/services/authService.ts:47:12)
[ERROR] Failed to load resource: the server responded with a status of 500 () (at https://swkqfcxrmgzaimjxxlys.supabase.co/rest/v1/profiles?select=*%2Ccompanies%28*%29&id=eq.c44def77-ff01-4ca7-b329-287b0df76a2e:0:0)
[ERROR] Error fetching profile: {code: 42P17, details: null, hint: null, message: infinite recursion detected in policy for relation "profiles"} (at http://localhost:3000/services/companyService.ts:16:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[ERROR] Failed to load resource: the server responded with a status of 500 () (at https://swkqfcxrmgzaimjxxlys.supabase.co/rest/v1/profiles?select=*&id=eq.c44def77-ff01-4ca7-b329-287b0df76a2e:0:0)
[WARNING] Could not fetch profile (timeout or error): Error: Profile fetch timeout
    at http://localhost:3000/services/authService.ts:41:46 (at http://localhost:3000/services/authService.ts:47:12)
[ERROR] Failed to load resource: the server responded with a status of 500 () (at https://swkqfcxrmgzaimjxxlys.supabase.co/rest/v1/profiles?select=*&id=eq.c44def77-ff01-4ca7-b329-287b0df76a2e:0:0)
[WARNING] Could not fetch profile (timeout or error): Error: Profile fetch timeout
    at http://localhost:3000/services/authService.ts:41:46 (at http://localhost:3000/services/authService.ts:47:12)
[ERROR] Failed to load resource: the server responded with a status of 500 () (at https://swkqfcxrmgzaimjxxlys.supabase.co/rest/v1/profiles?select=*&id=eq.c44def77-ff01-4ca7-b329-287b0df76a2e:0:0)
[WARNING] Could not fetch profile (timeout or error): Error: Profile fetch timeout
    at http://localhost:3000/services/authService.ts:41:46 (at http://localhost:3000/services/authService.ts:47:12)
[WARNING] Could not fetch profile (timeout or error): Error: Profile fetch timeout
    at http://localhost:3000/services/authService.ts:41:46 (at http://localhost:3000/services/authService.ts:47:12)
[ERROR] Failed to load resource: the server responded with a status of 500 () (at https://swkqfcxrmgzaimjxxlys.supabase.co/rest/v1/profiles?select=*&id=eq.c44def77-ff01-4ca7-b329-287b0df76a2e:0:0)
[ERROR] Failed to load resource: the server responded with a status of 500 () (at https://swkqfcxrmgzaimjxxlys.supabase.co/rest/v1/profiles?select=*%2Ccompanies%28*%29&id=eq.c44def77-ff01-4ca7-b329-287b0df76a2e:0:0)
[ERROR] Error fetching profile: {code: 42P17, details: null, hint: null, message: infinite recursion detected in policy for relation "profiles"} (at http://localhost:3000/services/companyService.ts:16:16)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dd66d72e-4889-4ed1-9e47-5e2308322652/b1caa14b-c908-4a3c-94c2-b1f30fb8602b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 Performance test with large dataset financial calculations
- **Test Code:** [TC013_Performance_test_with_large_dataset_financial_calculations.py](./TC013_Performance_test_with_large_dataset_financial_calculations.py)
- **Test Error:** Testing stopped due to empty dashboard page after login. Unable to proceed with generating transactions, reports, or performance verification. Please investigate and fix the dashboard loading issue.
Browser Console Logs:
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:44:25.130Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://fonts.gstatic.com/s/cairo/v31/SLXVc1nY6HkvangtZmpQdkhzfH5lkSscQyyS4J0.woff2:0:0)
[ERROR] Failed to load resource: the server responded with a status of 500 () (at https://swkqfcxrmgzaimjxxlys.supabase.co/rest/v1/profiles?select=*&id=eq.c44def77-ff01-4ca7-b329-287b0df76a2e:0:0)
[ERROR] Failed to load resource: the server responded with a status of 500 () (at https://swkqfcxrmgzaimjxxlys.supabase.co/rest/v1/profiles?select=*&id=eq.c44def77-ff01-4ca7-b329-287b0df76a2e:0:0)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:45:30.503Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] Could not fetch profile (timeout or error): Error: Profile fetch timeout
    at http://localhost:3000/services/authService.ts:41:46 (at http://localhost:3000/services/authService.ts:47:12)
[ERROR] Failed to load resource: the server responded with a status of 500 () (at https://swkqfcxrmgzaimjxxlys.supabase.co/rest/v1/profiles?select=*&id=eq.c44def77-ff01-4ca7-b329-287b0df76a2e:0:0)
[WARNING] Could not fetch profile (timeout or error): Error: Profile fetch timeout
    at http://localhost:3000/services/authService.ts:41:46 (at http://localhost:3000/services/authService.ts:47:12)
[ERROR] Failed to load resource: the server responded with a status of 500 () (at https://swkqfcxrmgzaimjxxlys.supabase.co/rest/v1/profiles?select=*%2Ccompanies%28*%29&id=eq.c44def77-ff01-4ca7-b329-287b0df76a2e:0:0)
[WARNING] Could not fetch profile (timeout or error): Error: Profile fetch timeout
    at http://localhost:3000/services/authService.ts:41:46 (at http://localhost:3000/services/authService.ts:47:12)
[ERROR] Error fetching profile: {code: 42P17, details: null, hint: null, message: infinite recursion detected in policy for relation "profiles"} (at http://localhost:3000/services/companyService.ts:16:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] Could not fetch profile (timeout or error): Error: Profile fetch timeout
    at http://localhost:3000/services/authService.ts:41:46 (at http://localhost:3000/services/authService.ts:47:12)
[WARNING] Could not fetch profile (timeout or error): Error: Profile fetch timeout
    at http://localhost:3000/services/authService.ts:41:46 (at http://localhost:3000/services/authService.ts:47:12)
[ERROR] Failed to load resource: the server responded with a status of 500 () (at https://swkqfcxrmgzaimjxxlys.supabase.co/rest/v1/profiles?select=*&id=eq.c44def77-ff01-4ca7-b329-287b0df76a2e:0:0)
[ERROR] Failed to load resource: the server responded with a status of 500 () (at https://swkqfcxrmgzaimjxxlys.supabase.co/rest/v1/profiles?select=*%2Ccompanies%28*%29&id=eq.c44def77-ff01-4ca7-b329-287b0df76a2e:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dd66d72e-4889-4ed1-9e47-5e2308322652/07c3a706-e16b-4c6c-bdbe-2ad11b601924
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014 User configuration settings update and enforcement
- **Test Code:** [TC014_User_configuration_settings_update_and_enforcement.py](./TC014_User_configuration_settings_update_and_enforcement.py)
- **Test Error:** The task to verify authorized users can update configuration settings could not be completed because login with valid credentials failed repeatedly. The issue has been reported. Further testing is blocked until the login problem is resolved.
Browser Console Logs:
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:44:26.470Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[ERROR] TypeError: Failed to fetch
    at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=ff4b7bf8:7226:23
    at _handleRequest2 (http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=ff4b7bf8:7516:20)
    at _request (http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=ff4b7bf8:7506:22)
    at SupabaseAuthClient.signInWithPassword (http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=ff4b7bf8:9267:21)
    at Object.signIn (http://localhost:3000/services/authService.ts:68:51)
    at handleSubmit (http://localhost:3000/pages/LoginPage.tsx:77:72)
    at executeDispatch (http://localhost:3000/node_modules/.vite/deps/react-dom_client.js?v=ff4b7bf8:13622:11)
    at runWithFiberInDEV (http://localhost:3000/node_modules/.vite/deps/react-dom_client.js?v=ff4b7bf8:997:72)
    at processDispatchQueue (http://localhost:3000/node_modules/.vite/deps/react-dom_client.js?v=ff4b7bf8:13658:37)
    at http://localhost:3000/node_modules/.vite/deps/react-dom_client.js?v=ff4b7bf8:14071:11 (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=ff4b7bf8:7517:12)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:45:27.821Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] [2026-01-17T18:46:34.985Z] [WARN] ⚠️ Gemini API key is not configured. AI features will be disabled. (at http://localhost:3000/lib/logger.ts:31:28)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
[WARNING] No company ID found (at http://localhost:3000/services/productsService.ts:29:16)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/dd66d72e-4889-4ed1-9e47-5e2308322652/1942d8d7-a354-4452-8377-413f5bf9bb24
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **14.29** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---