import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should display dashboard with stats', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/UrjaFlow/);

    // Check for main heading
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Check for stat cards
    await expect(page.getByText('Live Generation')).toBeVisible();
    await expect(page.getByText('Live Consumption')).toBeVisible();
    await expect(page.getByText('Battery Level')).toBeVisible();
    await expect(page.getByText('Monthly Savings')).toBeVisible();
  });

  test('should navigate to plans page', async ({ page }) => {
    await page.goto('/');

    // Click on Plans link
    await page.getByRole('link', { name: 'Plans' }).click();

    // Check if we're on the plans page
    await expect(page).toHaveURL('/plans');
    await expect(page.getByRole('heading', { name: 'Choose Your Plan' })).toBeVisible();
  });
});
