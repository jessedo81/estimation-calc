import { test, expect } from '@playwright/test';

test('app loads successfully', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/EstimationCalc|Vite/);
});

test('displays main content', async ({ page }) => {
  await page.goto('/');
  // Check that the root element exists
  await expect(page.locator('#root')).toBeVisible();
});
