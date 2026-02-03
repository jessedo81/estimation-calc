import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Known accessibility issues in @tarva/ui components that we exclude
// These are documented and tracked for upstream fixes
const KNOWN_THIRD_PARTY_ISSUES = [
  '.bg-destructive', // Button contrast in @tarva/ui
];

// Rules to disable for known Radix/third-party issues
const DISABLED_RULES = [
  'aria-hidden-focus', // Radix Dialog implementation issue
];

test.describe('Accessibility', () => {
  test('empty state has no accessibility violations', async ({ page }) => {
    await page.goto('/interior');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('estimation page with rooms has no critical accessibility violations', async ({ page }) => {
    await page.goto('/interior');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Add a room
    await page.getByRole('button', { name: /add.*room/i }).click();

    // Enter some values
    const sqftInput = page.locator('input[type="number"]').first();
    await sqftInput.fill('200');

    let builder = new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']);

    // Exclude known third-party issues
    for (const selector of KNOWN_THIRD_PARTY_ISSUES) {
      builder = builder.exclude(selector);
    }

    const accessibilityScanResults = await builder.analyze();

    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations:');
      accessibilityScanResults.violations.forEach((violation) => {
        console.log(`- ${violation.id}: ${violation.description}`);
        violation.nodes.forEach((node) => {
          console.log(`  Target: ${node.target}`);
        });
      });
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('dialog has no critical accessibility violations', async ({ page }) => {
    await page.goto('/interior');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Add a room
    await page.getByRole('button', { name: /add.*room/i }).click();

    // Open reset dialog
    await page.getByRole('contentinfo').getByRole('button', { name: /reset/i }).click();

    // Wait for dialog to appear
    await expect(page.getByRole('alertdialog')).toBeVisible();

    let builder = new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(DISABLED_RULES);

    // Exclude known third-party issues
    for (const selector of KNOWN_THIRD_PARTY_ISSUES) {
      builder = builder.exclude(selector);
    }

    const accessibilityScanResults = await builder.analyze();

    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Dialog accessibility violations:');
      accessibilityScanResults.violations.forEach((violation) => {
        console.log(`- ${violation.id}: ${violation.description}`);
      });
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
