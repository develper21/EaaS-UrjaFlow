/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect, Page } from '@playwright/test';

// Test users with real data from database
const testUsers = {
  SUPER_ADMIN: {
    email: 'admin@urjaflow.com',
    password: 'password123',
    role: 'SUPER_ADMIN',
    expectedFeatures: ['admin', 'organizations', 'billing', 'plans', 'analytics', 'reports', 'support']
  },
  ORG_ADMIN: {
    email: 'org.admin@techsolutions.com',
    password: 'password123',
    role: 'ORG_ADMIN',
    expectedFeatures: ['organizations', 'billing', 'plans', 'analytics', 'reports', 'support']
  },
  MANAGER: {
    email: 'manager@techsolutions.com',
    password: 'password123',
    role: 'MANAGER',
    expectedFeatures: ['analytics', 'reports', 'support']
  },
  VIEWER: {
    email: 'demo@urjaflow.com',
    password: 'password123',
    role: 'VIEWER',
    expectedFeatures: ['analytics', 'reports']
  }
};

// Helper function to login as specific role
async function loginAs(page: Page, role: keyof typeof testUsers) {
  const user = testUsers[role];
  
  await page.goto('/auth/signin');
  await page.fill('#email', user.email);
  await page.fill('#password', user.password);
  await page.click('button:has-text("Sign in")');
  await page.waitForURL('/');
  
  // Verify user is logged in with correct role
  await expect(page.locator('text=Dashboard')).toBeVisible();
  
  return user;
}

// Helper function to login as demo user (backward compatibility)
async function loginAsDemo(page: Page) {
  return await loginAs(page, 'VIEWER');
}

// Helper function to verify role-based navigation
async function verifyNavigation(page: Page, expectedFeatures: string[]) {
  const navigation = page.locator('nav[aria-label="Main navigation"]');
  
  // Check that expected features are visible
  for (const feature of expectedFeatures) {
    await expect(navigation.locator(`text=${feature.charAt(0).toUpperCase() + feature.slice(1)}`)).toBeVisible();
  }
  
  // Check that unexpected features are not visible
  const allFeatures = ['admin', 'organizations', 'billing', 'plans', 'analytics', 'reports', 'support'];
  const unexpectedFeatures = allFeatures.filter(f => !expectedFeatures.includes(f));
  
  for (const feature of unexpectedFeatures) {
    await expect(navigation.locator(`text=${feature.charAt(0).toUpperCase() + feature.slice(1)}`)).not.toBeVisible();
  }
}

// Helper function to verify real data is loaded
async function verifyRealData(page: Page) {
  // Check dashboard has real data
  await expect(page.locator('text=Total Energy Generated')).toBeVisible();
  await expect(page.locator('text=Active Devices')).toBeVisible();
  await expect(page.locator('text=Current Generation')).toBeVisible();
  
  // Check data is not placeholder
  const energyValue = await page.locator('[data-testid="total-energy"]').textContent();
  expect(energyValue).not.toBe('--');
  expect(energyValue).not.toBe('0');
}

// Extend base test with authenticated page fixtures for different roles
export const test = base.extend<{ 
  authenticatedPage: Page, 
  superAdminPage: Page,
  orgAdminPage: Page,
  managerPage: Page,
  viewerPage: Page
}>({
  authenticatedPage: async ({ page }, use) => {
    const user = await loginAs(page, 'VIEWER');
    await verifyNavigation(page, user.expectedFeatures);
    await verifyRealData(page);
    await use(page);
  },
  superAdminPage: async ({ page }, use) => {
    const user = await loginAs(page, 'SUPER_ADMIN');
    await verifyNavigation(page, user.expectedFeatures);
    await verifyRealData(page);
    await use(page);
  },
  orgAdminPage: async ({ page }, use) => {
    const user = await loginAs(page, 'ORG_ADMIN');
    await verifyNavigation(page, user.expectedFeatures);
    await verifyRealData(page);
    await use(page);
  },
  managerPage: async ({ page }, use) => {
    const user = await loginAs(page, 'MANAGER');
    await verifyNavigation(page, user.expectedFeatures);
    await verifyRealData(page);
    await use(page);
  },
  viewerPage: async ({ page }, use) => {
    const user = await loginAs(page, 'VIEWER');
    await verifyNavigation(page, user.expectedFeatures);
    await verifyRealData(page);
    await use(page);
  },
});

export { expect, testUsers, loginAs, loginAsDemo, verifyNavigation, verifyRealData };
