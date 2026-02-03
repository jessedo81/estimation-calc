import { test, expect } from '@playwright/test';

test('app loads successfully', async ({ page }) => {
  await page.goto('/interior');
  await expect(page).toHaveTitle(/EstimationCalc|Vite/);
});

test('displays main content', async ({ page }) => {
  await page.goto('/interior');
  // Wait for React to render
  await page.waitForSelector('[data-color-scheme]', { timeout: 5000 });
  // Check that the main content is visible (interior estimation page)
  await expect(page.getByRole('heading', { name: /interior estimate/i })).toBeVisible();
});

test('can navigate between interior and exterior', async ({ page }) => {
  await page.goto('/interior');
  await expect(page.getByRole('heading', { name: /interior estimate/i })).toBeVisible();

  // Click exterior navigation (NavLink contains Button, so look for button text)
  await page.getByRole('button', { name: /exterior/i }).click();
  await expect(page.getByRole('heading', { name: /exterior estimate/i })).toBeVisible();

  // Click interior navigation to go back
  await page.getByRole('button', { name: /interior/i }).click();
  await expect(page.getByRole('heading', { name: /interior estimate/i })).toBeVisible();
});
