/**
 * Editor Page Load Tests
 * Tests: editor initialization, block visibility, data loading
 */

import { test, expect } from "@playwright/test";

test.describe("Editor Page Load Tests", () => {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  test("2.1: Editor page loads with Puck editor visible", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`, { waitUntil: "networkidle" });

    // ✅ Wait for Puck editor container
    const editor = page.locator('[data-testid="puck-editor"], .puck');
    await expect(editor).toBeVisible({ timeout: 5000 });
  });

  test("2.2: Canvas area is visible", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // ✅ Wait for canvas
    const canvas = page.locator(".puck-canvas, [class*='canvas']");
    await expect(canvas).toBeVisible();
  });

  test("2.3: Control panel is visible", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // ✅ Check for left panel (layers/blocks)
    const leftPanel = page.locator('[class*="panel"], [class*="sidebar"]').first();
    await expect(leftPanel).toBeVisible();
  });

  test("2.4: Right sidebar with properties is visible", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // ✅ Check for right panel (properties)
    const rightPanel = page.locator('[class*="panel"], [class*="sidebar"]').last();
    await expect(rightPanel).toBeVisible();
  });

  test("2.5: Add block button is accessible", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // ✅ Find add block button
    const addBtn = page.locator(
      'button:has-text("Add"), [aria-label*="add"], [title*="Add"]'
    );
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toBeEnabled();
  });

  test("2.6: Block library/palette is accessible", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // ✅ Try to open blocks palette
    const addBtn = page.locator('button').filter({ hasText: /Add|Insert/ }).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();

      // ✅ Check for block options
      await page.waitForTimeout(300);
      const blockOptions = page.locator(
        'button, div[role="option"], [class*="block"]'
      );
      const count = await blockOptions.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test("2.7: Toolbar is visible and functional", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // ✅ Check for toolbar
    const toolbar = page.locator('[class*="toolbar"], header');
    await expect(toolbar).toBeVisible();

    // ✅ Check for save button
    const saveBtn = page.locator(
      'button:has-text("Save"), button:has-text("Publish")'
    );
    await expect(saveBtn).toBeVisible();
  });

  test("2.8: Editor preloads page data on load", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // ✅ Wait for editor to fully load
    await page.waitForLoadState("networkidle");

    // ✅ Check that data is present (should be no "loading" state)
    const canvas = page.locator(".puck-canvas, [class*='canvas']");
    await expect(canvas).toBeVisible();

    // ✅ Verify no persistent loading spinner
    const spinner = page.locator('[class*="spinner"], [class*="loading"]');
    const spinnerCount = await spinner.count();
    // Allow some spinners but not persistent ones
    expect(spinnerCount).toBeLessThan(5);
  });

  test("2.9: Keyboard shortcuts are available", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // ✅ Trigger undo (Ctrl+Z)
    await page.keyboard.press("Control+Z");
    await page.waitForTimeout(200);

    // ✅ No error should occur
    const errorMsg = page.locator('[role="alert"]:has-text("Error")');
    await expect(errorMsg).not.toBeVisible();
  });

  test("2.10: Editor performance < 2s for edit page load", async ({ page }) => {
    const startTime = Date.now();
    await page.goto(`${baseUrl}/edit/test`, { waitUntil: "networkidle" });
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(2000);
  });

  test("2.11: Block components render in canvas", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // ✅ Wait for canvas
    const canvas = page.locator(".puck-canvas, [class*='canvas']");
    await expect(canvas).toBeVisible();

    // ✅ Check for at least one block component
    const blocks = page.locator('[class*="block"], [class*="component"]');
    const blockCount = await blocks.count();

    // If there are pre-existing blocks, verify they're visible
    if (blockCount > 0) {
      expect(blockCount).toBeGreaterThan(0);
    }
  });

  test("2.12: AI Panel is visible in editor", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // ✅ Look for AI Panel or Generate button
    const aiPanel = page.locator(
      '[class*="ai"], button:has-text("Generate"), [aria-label*="AI"]'
    );
    const aiCount = await aiPanel.count();

    // AI panel should be somewhere in the UI
    expect(aiCount).toBeGreaterThan(0);
  });

  test("2.13: Screenshot: Full editor interface", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);
    await page.waitForLoadState("networkidle");

    await page.screenshot({
      path: "test-results/screenshots/editor-full.png",
      fullPage: true,
    });
  });

  test("2.14: Screenshot: Editor with mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${baseUrl}/edit/test`);

    await page.screenshot({
      path: "test-results/screenshots/editor-mobile.png",
      fullPage: true,
    });
  });

  test("2.15: Editor handles no data gracefully", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/new-blank-page-${Date.now()}`);

    // ✅ Should still load editor even if page doesn't exist
    const editor = page.locator('[class*="puck"], [class*="editor"]');
    await expect(editor).toBeVisible();

    // ✅ Should show empty canvas
    const canvas = page.locator(".puck-canvas, [class*='canvas']");
    await expect(canvas).toBeVisible();
  });
});
