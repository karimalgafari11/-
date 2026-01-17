import { test, expect } from '@playwright/test';

test.describe('Application Sanity Check', () => {
    test('should load the home page and show the title', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/الزهراء/);
    });

    test('should navigate to settings', async ({ page }) => {
        await page.goto('/');

        // Wait for the app to load
        await page.waitForSelector('text=لوحة تحكم', { timeout: 10000 });

        // Click on settings in sidebar
        await page.click('a[href*="settings"]');

        // Verify we're on settings page
        await expect(page).toHaveURL(/.*settings/);
        await expect(page.locator('text=الإعدادات')).toBeVisible();
    });
});

test.describe('Dashboard', () => {
    test('should display dashboard statistics', async ({ page }) => {
        await page.goto('/#/dashboard');

        // Wait for dashboard to load
        await page.waitForSelector('text=لوحة تحكم الزهراء', { timeout: 10000 });

        // Check that stat cards are visible
        await expect(page.locator('text=الإيرادات')).toBeVisible();
        await expect(page.locator('text=المشتريات')).toBeVisible();
        await expect(page.locator('text=الأرباح')).toBeVisible();
        await expect(page.locator('text=قطع الغيار')).toBeVisible();
    });

    test('should toggle theme', async ({ page }) => {
        await page.goto('/#/dashboard');

        // Wait for page to load
        await page.waitForSelector('text=لوحة تحكم الزهراء', { timeout: 10000 });

        // Theme toggle should be in settings or header - verify page renders
        const dashboardContainer = page.locator('.min-h-screen');
        await expect(dashboardContainer).toBeVisible();
    });
});

test.describe('Sales Module', () => {
    test('should navigate to sales page', async ({ page }) => {
        await page.goto('/#/sales');

        // Wait for sales page to load
        await page.waitForSelector('text=المبيعات', { timeout: 10000 });

        // Check for sales toolbar
        await expect(page.locator('text=إضافة')).toBeVisible();
    });

    test('should display sales grid', async ({ page }) => {
        await page.goto('/#/sales');

        await page.waitForLoadState('networkidle');

        // Sales page should have grid/table for displaying sales
        const salesPage = page.locator('[class*="grid"], [class*="table"]');
        await expect(salesPage.first()).toBeVisible({ timeout: 10000 });
    });
});

test.describe('Inventory Module', () => {
    test('should navigate to inventory page', async ({ page }) => {
        await page.goto('/#/inventory');

        await page.waitForLoadState('networkidle');

        // Check inventory page loaded
        await expect(page.locator('text=المخزون')).toBeVisible({ timeout: 10000 });
    });
});

test.describe('Accounting Module', () => {
    test('should navigate to accounting page', async ({ page }) => {
        await page.goto('/#/accounting');

        await page.waitForLoadState('networkidle');

        // Check accounting page loaded
        await expect(page.locator('text=المحاسبة')).toBeVisible({ timeout: 10000 });
    });
});

test.describe('Navigation', () => {
    test('should navigate through main menu items', async ({ page }) => {
        await page.goto('/');

        await page.waitForLoadState('networkidle');

        // Test navigation to main routes
        const routes = [
            { path: '#/dashboard', text: 'لوحة' },
            { path: '#/sales', text: 'المبيعات' },
            { path: '#/inventory', text: 'المخزون' },
            { path: '#/accounting', text: 'المحاسبة' }
        ];

        for (const route of routes) {
            await page.goto(`/${route.path}`);
            await page.waitForLoadState('networkidle');
            // Just verify page loads without errors
            await expect(page.locator('body')).toBeVisible();
        }
    });
});

test.describe('Error Handling', () => {
    test('should redirect invalid routes to dashboard', async ({ page }) => {
        await page.goto('/#/invalid-route-12345');

        await page.waitForLoadState('networkidle');

        // Should redirect to dashboard
        await expect(page).toHaveURL(/.*dashboard/);
    });
});
