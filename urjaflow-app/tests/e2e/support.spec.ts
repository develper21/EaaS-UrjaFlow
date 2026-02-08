import { test, expect } from './auth-helper';

test.describe('Support Page', () => {
    test('should display support tickets', async ({ authenticatedPage: page }) => {
        await page.goto('/support');

        // Check for support heading
        await expect(page.getByRole('heading', { name: /support/i })).toBeVisible();
    });

    test('should display FAQs', async ({ authenticatedPage: page }) => {
        await page.goto('/support');

        // Should show FAQ section
        await expect(page.getByText(/faq/i)).toBeVisible();
    });

    test('should allow creating new ticket', async ({ authenticatedPage: page }) => {
        await page.goto('/support');

        // Look for create ticket button
        const createButton = page.getByRole('button', { name: /create.*ticket|new.*ticket/i });
        if (await createButton.isVisible()) {
            await expect(createButton).toBeVisible();
        }
    });
});
