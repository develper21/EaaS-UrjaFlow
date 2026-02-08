import { test, expect, testUsers } from './auth-helper';

test.describe('Dashboard - Real Data Testing', () => {
  test.describe('SUPER_ADMIN Dashboard', () => {
    test('should display complete dashboard with all features', async ({ superAdminPage: page }) => {
      // Check page title
      await expect(page).toHaveTitle(/UrjaFlow/);

      // Check for main heading
      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

      // Check for real-time stats
      await expect(page.getByText('Total Energy Generated')).toBeVisible();
      await expect(page.getByText('Live Generation')).toBeVisible();
      await expect(page.getByText('Live Consumption')).toBeVisible();
      await expect(page.getByText('Battery Level')).toBeVisible();
      await expect(page.getByText('Monthly Savings')).toBeVisible();

      // Verify real data is loaded (not placeholders)
      const energyValue = await page.locator('[data-testid="total-energy"]').textContent();
      expect(energyValue).not.toBe('--');
      expect(energyValue).not.toBe('0');

      // Check admin-specific features are visible
      await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Organizations' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Billing' })).toBeVisible();
    });

    test('should display real devices from database', async ({ superAdminPage: page }) => {
      // Check for devices section
      await expect(page.getByText('Connected Devices')).toBeVisible();

      // Should have real devices from seeded data
      await expect(page.getByText('Rooftop Solar Array')).toBeVisible();
      await expect(page.getByText('Home Battery Storage')).toBeVisible();
      await expect(page.getByText('Solar Inverter')).toBeVisible();
      await expect(page.getByText('Smart Energy Meter')).toBeVisible();

      // Verify device data is real
      const deviceCountText = await page.locator('[data-testid="device-count"]').textContent();
      const deviceCount = parseInt(deviceCountText || '0');
      expect(deviceCount).toBeGreaterThan(0);
    });
  });

  test.describe('ORG_ADMIN Dashboard', () => {
    test('should display dashboard with organization features', async ({ orgAdminPage: page }) => {
      // Check page title
      await expect(page).toHaveTitle(/UrjaFlow/);

      // Check for main heading
      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

      // Check for stats
      await expect(page.getByText('Total Energy Generated')).toBeVisible();
      await expect(page.getByText('Live Generation')).toBeVisible();
      await expect(page.getByText('Live Consumption')).toBeVisible();

      // Check organization-specific features
      await expect(page.getByRole('link', { name: 'Organizations' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Billing' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Plans' })).toBeVisible();

      // Admin features should not be visible
      await expect(page.getByRole('link', { name: 'Admin' })).not.toBeVisible();
    });
  });

  test.describe('MANAGER Dashboard', () => {
    test('should display dashboard with limited features', async ({ managerPage: page }) => {
      // Check page title
      await expect(page).toHaveTitle(/UrjaFlow/);

      // Check for main heading
      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

      // Check for stats
      await expect(page.getByText('Total Energy Generated')).toBeVisible();
      await expect(page.getByText('Live Generation')).toBeVisible();
      await expect(page.getByText('Live Consumption')).toBeVisible();

      // Check manager-specific features
      await expect(page.getByRole('link', { name: 'Analytics' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Reports' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Support' })).toBeVisible();

      // Admin and organization features should not be visible
      await expect(page.getByRole('link', { name: 'Admin' })).not.toBeVisible();
      await expect(page.getByRole('link', { name: 'Organizations' })).not.toBeVisible();
      await expect(page.getByRole('link', { name: 'Billing' })).not.toBeVisible();
      await expect(page.getByRole('link', { name: 'Plans' })).not.toBeVisible();
    });
  });

  test.describe('VIEWER Dashboard', () => {
    test('should display read-only dashboard', async ({ viewerPage: page }) => {
      // Check page title
      await expect(page).toHaveTitle(/UrjaFlow/);

      // Check for main heading
      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

      // Check for stats (read-only)
      await expect(page.getByText('Total Energy Generated')).toBeVisible();
      await expect(page.getByText('Live Generation')).toBeVisible();
      await expect(page.getByText('Live Consumption')).toBeVisible();

      // Check viewer-specific features
      await expect(page.getByRole('link', { name: 'Analytics' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Reports' })).toBeVisible();

      // All admin/management features should not be visible
      await expect(page.getByRole('link', { name: 'Admin' })).not.toBeVisible();
      await expect(page.getByRole('link', { name: 'Organizations' })).not.toBeVisible();
      await expect(page.getByRole('link', { name: 'Billing' })).not.toBeVisible();
      await expect(page.getByRole('link', { name: 'Plans' })).not.toBeVisible();
      await expect(page.getByRole('link', { name: 'Support' })).not.toBeVisible();
    });
  });

  test.describe('Real Data Verification', () => {
    test('should verify dashboard data matches database', async ({ superAdminPage: page }) => {
      // Wait for data to load
      await page.waitForSelector('[data-testid="total-energy"]', { timeout: 10000 });

      // Verify energy data is realistic
      const totalEnergyText = await page.locator('[data-testid="total-energy"]').textContent();
      const totalEnergy = parseFloat(totalEnergyText?.replace(/[^0-9.]/g, '') || '0');
      expect(totalEnergy).toBeGreaterThan(0);
      expect(totalEnergy).toBeLessThan(10000); // Reasonable range

      // Verify device count matches seeded data
      const deviceCountText = await page.locator('[data-testid="device-count"]').textContent();
      const deviceCount = parseInt(deviceCountText || '0');
      expect(deviceCount).toBe(4); // Should match seeded data

      // Verify generation/consumption data exists
      const generation = await page.locator('[data-testid="current-generation"]').textContent();
      const consumption = await page.locator('[data-testid="current-consumption"]').textContent();
      
      expect(generation).not.toBe('--');
      expect(consumption).not.toBe('--');
    });
  });
});
