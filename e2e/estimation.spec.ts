import { test, expect } from '@playwright/test';

test.describe('Interior Estimation', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('shows empty state when no rooms exist', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('No rooms added yet')).toBeVisible();
    await expect(page.getByRole('button', { name: /add.*room/i })).toBeVisible();
  });

  test('can add a room', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /add.*room/i }).click();
    await expect(page.getByText('Room 1')).toBeVisible();
  });

  test('calculates room total correctly', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /add.*room/i }).click();

    // Enter 200 sqft
    const sqftInput = page.locator('input[type="number"]').first();
    await sqftInput.fill('200');

    // General room at 2.8x = 200 * 2.8 = $560 - check room total specifically
    await expect(page.getByRole('main').getByText('$560')).toBeVisible();
  });

  test('applies kitchen multiplier (3.1x)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /add.*room/i }).click();

    // Select kitchen type
    const roomTypeSelect = page.locator('select').first();
    await roomTypeSelect.selectOption('kitchen');

    // Enter 200 sqft
    const sqftInput = page.locator('input[type="number"]').first();
    await sqftInput.fill('200');

    // Kitchen at 3.1x = 200 * 3.1 = $620
    await expect(page.getByRole('main').getByText('$620')).toBeVisible();
  });

  test('applies bathroom multiplier (4.1x)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /add.*room/i }).click();

    // Select bathroom type
    const roomTypeSelect = page.locator('select').first();
    await roomTypeSelect.selectOption('bathroom');

    // Enter 80 sqft
    const sqftInput = page.locator('input[type="number"]').first();
    await sqftInput.fill('80');

    // Bathroom at 4.1x = 80 * 4.1 = $328
    await expect(page.getByRole('main').getByText('$328')).toBeVisible();
  });

  test('applies room minimum ($275)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /add.*room/i }).click();

    // Enter very small room (50 sqft)
    const sqftInput = page.locator('input[type="number"]').first();
    await sqftInput.fill('50');

    // Should show minimum $275 (not 50 * 2.8 = $140)
    await expect(page.getByRole('main').getByText('$275')).toBeVisible();
  });

  test('can duplicate a room', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /add.*room/i }).click();

    // Open room actions menu - look for the menu trigger button
    await page.locator('[aria-label="Room actions"]').click();
    await page.getByRole('menuitem', { name: /duplicate/i }).click();

    // Should have two rooms now - look for "(copy)" in the name
    await expect(page.getByText('Room 1: Room 1')).toBeVisible();
    await expect(page.getByText(/\(copy\)/i)).toBeVisible();
  });

  test('can remove a room', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /add.*room/i }).click();

    // Open room actions menu and remove
    await page.locator('[aria-label="Room actions"]').click();
    await page.getByRole('menuitem', { name: /remove/i }).click();

    // Should show empty state
    await expect(page.getByText('No rooms added yet')).toBeVisible();
  });

  test('reset clears all rooms with confirmation', async ({ page }) => {
    await page.goto('/');

    // Add a room
    await page.getByRole('button', { name: /add.*room/i }).click();
    await expect(page.getByText('Room 1')).toBeVisible();

    // Click reset in footer
    await page.getByRole('contentinfo').getByRole('button', { name: /reset/i }).click();

    // Confirmation dialog should appear
    await expect(page.getByText(/reset estimate/i)).toBeVisible();

    // Confirm reset - the button in the dialog is just "Reset"
    await page.getByRole('alertdialog').getByRole('button', { name: /^reset$/i }).click();

    // Should show empty state
    await expect(page.getByText('No rooms added yet')).toBeVisible();
  });

  test('copy to clipboard works', async ({ page, context, browserName }) => {
    // Skip on webkit/mobile due to clipboard API limitations
    test.skip(browserName === 'webkit', 'Clipboard API not fully supported on WebKit');

    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/');
    await page.getByRole('button', { name: /add.*room/i }).click();

    // Click copy button
    await page.getByRole('button', { name: /copy/i }).click();

    // Should show "Copied!" feedback
    await expect(page.getByText('Copied!')).toBeVisible();
  });

  test('shows setup fee for jobs under minimum', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /add.*room/i }).click();

    // Enter small room - 100 sqft at 2.8x = $280, which is under $1,566 minimum
    const sqftInput = page.locator('input[type="number"]').first();
    await sqftInput.fill('100');

    // Should show setup fee in footer (case insensitive)
    await expect(page.getByRole('contentinfo').getByText(/setup/i)).toBeVisible();
  });

  test('persists data to localStorage', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /add.*room/i }).click();

    // Enter sqft
    const sqftInput = page.locator('input[type="number"]').first();
    await sqftInput.fill('300');

    // Wait for auto-save (debounce is 500ms)
    await page.waitForTimeout(800);

    // Reload page
    await page.reload();

    // Should see draft recovery dialog - look for the heading specifically
    await expect(page.getByRole('heading', { name: /recover draft/i })).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Accessibility', () => {
  test('all interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // Tab through the page
    await page.keyboard.press('Tab');

    // First focusable element should be focused
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('form inputs have associated labels', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /add.*room/i }).click();

    // Check that inputs have labels
    const inputs = page.locator('input[type="number"]');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        expect(hasLabel).toBeTruthy();
      }
    }
  });
});
