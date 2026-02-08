import { test, expect } from './auth-helper';

test.describe('Settings & Profile', () => {
    test('should display user settings', async ({ authenticatedPage: page }) => {
        await page.goto('/settings');

        // Check for settings heading
        await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();
    });

    test('should display account page', async ({ authenticatedPage: page }) => {
        await page.goto('/account');

        // Check for account information
        await expect(page.getByText('demo@urjaflow.com')).toBeVisible();
    });
});
