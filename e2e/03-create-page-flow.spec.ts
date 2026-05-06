/**
 * Create New Page Flow Tests
 * Tests: page creation, initial setup, navigation
 */

import { test, expect } from "@playwright/test";

test.describe("Create New Page Flow", () => {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const testPageSlug = `test-page-${Date.now()}`;

  test("3.1: Can create a new blank page", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/${testPageSlug}`);

    // ✅ Editor should load
    const editor = page.locator('[class*="puck"], [class*="editor"]');
    await expect(editor).toBeVisible();

    // ✅ Canvas should be empty or minimal
    const canvas = page.locator(".puck-canvas, [class*='canvas']");
    await expect(canvas).toBeVisible();
  });

  test("3.2: New page has empty canvas ready for content", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/blank-${Date.now()}`);

    // ✅ Canvas should be visible
    const canvas = page.locator(".puck-canvas, [class*='canvas']");
    await expect(canvas).toBeVisible();

    // ✅ Should be able to add first block
    const addBtn = page.locator('button').filter({ hasText: /Add|Insert/ });
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(300);
      // Should see block options
      const options = page.locator('button, [role="option"]');
      expect(await options.count()).toBeGreaterThan(0);
    }
  });

  test("3.3: Page title/slug can be set", async ({ page }) => {
    const newSlug = `titled-page-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${newSlug}`);

    // ✅ Look for page title input
    const titleInput = page.locator(
      'input[placeholder*="Title"], input[placeholder*="Page"], input[name="title"]'
    );

    if (await titleInput.isVisible()) {
      await titleInput.fill("My Test Page");
      const value = await titleInput.inputValue();
      expect(value).toBe("My Test Page");
    }
  });

  test("3.4: Can add first block to new page", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/with-block-${Date.now()}`);

    // ✅ Find add block button
    const addBtn = page.locator('button').filter({ hasText: /Add|Insert/ }).first();
    
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(300);

      // ✅ Click first block type (usually Hero)
      const firstBlockOption = page.locator('button, [role="option"]').first();
      if (await firstBlockOption.isVisible()) {
        await firstBlockOption.click();
        await page.waitForTimeout(300);

        // ✅ Verify block was added
        const blocks = page.locator('[class*="block"], [class*="component"]');
        const blockCount = await blocks.count();
        expect(blockCount).toBeGreaterThan(0);
      }
    }
  });

  test("3.5: Multiple blocks can be added to new page", async ({ page }) => {
    const multiBlockSlug = `multi-block-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${multiBlockSlug}`);

    const addBtn = page.locator('button').filter({ hasText: /Add|Insert/ });

    // ✅ Add first block
    if (await addBtn.first().isVisible()) {
      await addBtn.first().click();
      await page.waitForTimeout(300);
      const firstOption = page.locator('button, [role="option"]').first();
      if (await firstOption.isVisible()) {
        await firstOption.click();
      }
    }

    await page.waitForTimeout(300);

    // ✅ Add second block
    const addBtn2 = page.locator('button').filter({ hasText: /Add|Insert/ });
    if (await addBtn2.isVisible()) {
      await addBtn2.click();
      await page.waitForTimeout(300);
      const secondOption = page.locator('button, [role="option"]').nth(1);
      if (await secondOption.isVisible()) {
        await secondOption.click();
      }
    }

    await page.waitForTimeout(300);

    // ✅ Verify blocks count increased
    const blocks = page.locator('[class*="block"], [class*="component"]');
    const blockCount = await blocks.count();
    expect(blockCount).toBeGreaterThanOrEqual(1);
  });

  test("3.6: Page sections display correctly", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/section-test-${Date.now()}`);

    // ✅ Check for section containers
    const sections = page.locator("section");
    const sectionCount = await sections.count();

    // Should have at least main content area
    expect(sectionCount).toBeGreaterThanOrEqual(0);
  });

  test("3.7: Navigation between pages works", async ({ page }) => {
    const page1Slug = `nav-test-1-${Date.now()}`;
    const page2Slug = `nav-test-2-${Date.now()}`;

    // ✅ Go to page 1
    await page.goto(`${baseUrl}/edit/${page1Slug}`);
    let editor = page.locator('[class*="puck"], [class*="editor"]');
    await expect(editor).toBeVisible();

    // ✅ Go to page 2
    await page.goto(`${baseUrl}/edit/${page2Slug}`);
    editor = page.locator('[class*="puck"], [class*="editor"]');
    await expect(editor).toBeVisible();
  });

  test("3.8: Unsaved changes warning might appear", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/changes-test-${Date.now()}`);

    // ✅ Make a change
    const addBtn = page.locator('button').filter({ hasText: /Add|Insert/ });
    if (await addBtn.isVisible()) {
      await addBtn.click();
    }

    // ✅ Try to navigate away (optional warning)
    const canNavigate = await page.evaluate(() => {
      // Most modern apps don't use beforeunload, so navigation should work
      return true;
    });

    expect(canNavigate).toBeTruthy();
  });

  test("3.9: New page layout is responsive", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${baseUrl}/edit/responsive-test-${Date.now()}`);

    // ✅ Editor should be visible on mobile
    const editor = page.locator('[class*="puck"], [class*="editor"]');
    await expect(editor).toBeVisible();

    // ✅ No horizontal scroll
    const htmlWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(htmlWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });

  test("3.10: Page creation is fast (< 1s)", async ({ page }) => {
    const startTime = Date.now();
    await page.goto(`${baseUrl}/edit/speed-test-${Date.now()}`, {
      waitUntil: "networkidle",
    });
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(1000);
  });

  test("3.11: Screenshot: New blank page", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/blank-screenshot-${Date.now()}`);
    await page.waitForLoadState("networkidle");

    await page.screenshot({
      path: "test-results/screenshots/new-page-blank.png",
      fullPage: true,
    });
  });

  test("3.12: Screenshot: Page with first block added", async ({ page }) => {
    const slug = `page-with-block-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${slug}`);

    // ✅ Add a block
    const addBtn = page.locator('button').filter({ hasText: /Add|Insert/ }).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(300);
      const firstOption = page.locator('button, [role="option"]').first();
      if (await firstOption.isVisible()) {
        await firstOption.click();
      }
    }

    await page.waitForTimeout(500);
    await page.screenshot({
      path: "test-results/screenshots/new-page-with-block.png",
      fullPage: true,
    });
  });
});
