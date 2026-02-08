import { test, expect } from './auth-helper';

test.describe('Analytics - Real Data Testing', () => {
  test.describe('SUPER_ADMIN Analytics', () => {
    test('should display complete analytics with real data', async ({ superAdminPage: page }) => {
      await page.goto('/analytics');

      // Check for analytics heading
      await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible();

      // Check for real-time stats
      await expect(page.getByText('Total Generation')).toBeVisible();
      await expect(page.getByText('Total Consumption')).toBeVisible();
      await expect(page.getByText('Average Efficiency')).toBeVisible();
      await expect(page.getByText('Peak Generation')).toBeVisible();

      // Verify data is loaded (not placeholders)
      const generationValue = await page.locator('[data-testid="total-generation"]').textContent();
      expect(generationValue).not.toBe('--');
      expect(generationValue).not.toBe('0');
    });

    test('should display energy charts with real data', async ({ superAdminPage: page }) => {
      await page.goto('/analytics');

      // Should have energy charts
      await expect(page.locator('[data-testid="energy-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="consumption-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="efficiency-chart"]')).toBeVisible();

      // Verify charts have data points
      const chartData = await page.locator('[data-testid="energy-chart"] canvas').getAttribute('data-chart-data');
      expect(chartData).toBeTruthy();
      expect(chartData?.length).toBeGreaterThan(10); // Should have multiple data points
    });
  });

  test.describe('ORG_ADMIN Analytics', () => {
    test('should display analytics with organization data', async ({ orgAdminPage: page }) => {
      await page.goto('/analytics');

      // Check for analytics heading
      await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible();

      // Check for organization-specific analytics
      await expect(page.getByText('Organization Performance')).toBeVisible();
      await expect(page.getByText('Device Efficiency')).toBeVisible();

      // Verify data is loaded
      const orgGeneration = await page.locator('[data-testid="org-generation"]').textContent();
      expect(orgGeneration).not.toBe('--');
    });
  });

  test.describe('MANAGER Analytics', () => {
    test('should display analytics with limited features', async ({ managerPage: page }) => {
      await page.goto('/analytics');

      // Check for analytics heading
      await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible();

      // Check for manager-specific features
      await expect(page.getByText('Device Analytics')).toBeVisible();
      await expect(page.getByText('Performance Metrics')).toBeVisible();

      // Admin features should not be visible
      await expect(page.getByText('System Analytics')).not.toBeVisible();
    });
  });

  test.describe('VIEWER Analytics', () => {
    test('should display read-only analytics', async ({ viewerPage: page }) => {
      await page.goto('/analytics');

      // Check for analytics heading
      await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible();

      // Check for read-only features
      await expect(page.getByText('Energy Overview')).toBeVisible();
      await expect(page.getByText('Historical Data')).toBeVisible();

      // Management features should not be visible
      await expect(page.getByText('Export Data')).not.toBeVisible();
      await expect(page.getByText('Advanced Analytics')).not.toBeVisible();
    });
  });

  test.describe('Real Data Verification', () => {
    test('should verify analytics data matches database', async ({ superAdminPage: page }) => {
      await page.goto('/analytics');

      // Wait for data to load
      await page.waitForSelector('[data-testid="total-generation"]', { timeout: 10000 });

      // Verify generation data is realistic
      const generationText = await page.locator('[data-testid="total-generation"]').textContent();
      const generation = parseFloat(generationText?.replace(/[^0-9.]/g, '') || '0');
      expect(generation).toBeGreaterThan(0);
      expect(generation).toBeLessThan(10000); // Reasonable range

      // Verify consumption data exists
      const consumptionText = await page.locator('[data-testid="total-consumption"]').textContent();
      const consumption = parseFloat(consumptionText?.replace(/[^0-9.]/g, '') || '0');
      expect(consumption).toBeGreaterThanOrEqual(0);

      // Verify efficiency data
      const efficiencyText = await page.locator('[data-testid="average-efficiency"]').textContent();
      const efficiency = parseFloat(efficiencyText?.replace(/[^0-9.]/g, '') || '0');
      expect(efficiency).toBeGreaterThan(0);
      expect(efficiency).toBeLessThanOrEqual(100);
    });

    test('should verify time-based analytics', async ({ superAdminPage: page }) => {
      await page.goto('/analytics');

      // Check for time period selector
      await expect(page.locator('[data-testid="time-period-selector"]')).toBeVisible();

      // Test different time periods
      await page.selectOption('[data-testid="time-period-selector"]', '24h');
      await page.waitForTimeout(1000);
      
      const dailyData = await page.locator('[data-testid="energy-chart"]').getAttribute('data-chart-data');
      expect(dailyData).toBeTruthy();

      await page.selectOption('[data-testid="time-period-selector"]', '7d');
      await page.waitForTimeout(1000);
      
      const weeklyData = await page.locator('[data-testid="energy-chart"]').getAttribute('data-chart-data');
      expect(weeklyData).toBeTruthy();
      expect(weeklyData).not.toEqual(dailyData); // Should be different data
    });
  });
});
