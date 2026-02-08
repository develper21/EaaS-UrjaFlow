import { test, expect } from './auth-helper';

test.describe('Billing & Subscriptions', () => {
    test('should display billing information', async ({ authenticatedPage: page }) => {
        await page.goto('/billing');

        // Check for billing heading
        await expect(page.getByRole('heading', { name: /billing/i })).toBeVisible();

        // Should show current subscription
        await expect(page.getByText(/current plan/i)).toBeVisible();
    });

    test('should display invoices', async ({ authenticatedPage: page }) => {
        await page.goto('/billing');

        // Check for invoices section
        await expect(page.getByText(/invoice/i)).toBeVisible();
    });
});
