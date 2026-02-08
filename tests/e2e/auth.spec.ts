import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test('should login successfully with demo credentials', async ({ page }) => {
        await page.goto('/auth/signin');

        // Fill in credentials
        await page.fill('#email', 'demo@urjaflow.com');
        await page.fill('#password', 'demo123');

        // Click sign in button
        await page.click('button:has-text("Sign in")');

        // Should redirect to dashboard
        await expect(page).toHaveURL('/');
        await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/auth/signin');

        await page.fill('#email', 'wrong@example.com');
        await page.fill('#password', 'wrongpass');
        await page.click('button:has-text("Sign in")');

        // Should show error message
        await expect(page.getByText('Invalid email or password')).toBeVisible();
    });
});
