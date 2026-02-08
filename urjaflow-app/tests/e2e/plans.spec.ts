import { test, expect } from './auth-helper';

test.describe('Plans Page', () => {
    test('should display all subscription plans', async ({ authenticatedPage: page }) => {
        await page.goto('/plans');

        // Check for plans heading
        await expect(page.getByRole('heading', { name: /choose your plan/i })).toBeVisible();

        // Should show all three plans from seeded data
        await expect(page.getByText('Basic')).toBeVisible();
        await expect(page.getByText('Professional')).toBeVisible();
        await expect(page.getByText('Enterprise')).toBeVisible();
    });

    test('should display plan features', async ({ authenticatedPage: page }) => {
        await page.goto('/plans');

        // Check for feature lists
        await expect(page.getByText(/real-time monitoring/i)).toBeVisible();
    });
});
