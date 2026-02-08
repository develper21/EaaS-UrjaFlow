import { test, expect } from './auth-helper';

test.describe('Notifications Page', () => {
    test('should display notifications', async ({ authenticatedPage: page }) => {
        await page.goto('/notifications');

        // Check for notifications heading
        await expect(page.getByRole('heading', { name: /notification/i })).toBeVisible();
    });

    test('should show notification list', async ({ authenticatedPage: page }) => {
        await page.goto('/notifications');

        // Should have notifications from seeded data
        await expect(page.getByText(/welcome to urjaflow/i)).toBeVisible();
    });
});
