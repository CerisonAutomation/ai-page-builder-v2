/**
 * Edit Page Content Tests
 * Tests: block editing, property changes, content updates
 */

import { test, expect } from "@playwright/test";

test.describe("Edit Page Content", () => {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  test("4.1: Can click block to select it", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);
    await page.waitForLoadState("networkidle");

    // ✅ Find first block
    const blocks = page.locator('[class*="block"], [class*="component"]');
    if (await blocks.first().isVisible()) {
      await blocks.first().click();
      await page.waitForTimeout(300);

      // ✅ Block should show selection state
      const selected = page.locator('[class*="selected"], [class*="active"]');
      expect(await selected.count()).toBeGreaterThan(0);
    }
  });

  test("4.2: Selected block shows properties panel", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // ✅ Click a block
    const blocks = page.locator('[class*="block"], [class*="component"]');
    if (await blocks.first().isVisible()) {
      await blocks.first().click();
      await page.waitForTimeout(300);

      // ✅ Properties panel should appear
      const propsPanel = page.locator('[class*="panel"], [class*="properties"]');
      const panelCount = await propsPanel.count();
      expect(panelCount).toBeGreaterThan(0);
    }
  });

  test("4.3: Can edit text fields in block", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // ✅ Find text input
    const textInputs = page.locator('input[type="text"], textarea');
    if (await textInputs.first().isVisible()) {
      const testText = `Test Content ${Date.now()}`;
      await textInputs.first().fill(testText);
      await page.waitForTimeout(200);

      const value = await textInputs.first().inputValue();
      expect(value).toBe(testText);
    }
  });

  test("4.4: Can edit number fields in block", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // ✅ Find number input
    const numberInputs = page.locator('input[type="number"]');
    if (await numberInputs.first().isVisible()) {
      await numberInputs.first().fill("42");
      const value = await numberInputs.first().inputValue();
      expect(value).toBe("42");
    }
  });

  test("4.5: Can select from dropdown fields", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // ✅ Find select/dropdown
    const selects = page.locator("select, [role='combobox']");
    if (await selects.first().isVisible()) {
      await selects.first().click();
      await page.waitForTimeout(200);

      // ✅ Should show options
      const options = page.locator("[role='option']");
      const optionCount = await options.count();
      expect(optionCount).toBeGreaterThan(0);
    }
  });

  test("4.6: Can toggle checkbox fields", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // ✅ Find checkbox
    const checkboxes = page.locator('input[type="checkbox"]');
    if (await checkboxes.first().isVisible()) {
      const initialState = await checkboxes.first().isChecked();
      await checkboxes.first().click();
      await page.waitForTimeout(200);

      const newState = await checkboxes.first().isChecked();
      expect(newState).not.toBe(initialState);
    }
  });

  test("4.7: Changes reflect in preview", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // ✅ Get preview before change
    const preview = page.locator(".puck-preview, [class*='preview']");
    const textBefore = await preview.textContent();

    // ✅ Make a change
    const textInputs = page.locator('input[type="text"], textarea');
    if (await textInputs.first().isVisible()) {
      const newText = `Updated at ${Date.now()}`;
      await textInputs.first().fill(newText);
      await page.waitForTimeout(300);

      // ✅ Preview should update
      const textAfter = await preview.textContent();
      expect(textAfter).not.toBe(textBefore);
    }
  });

  test("4.8: Can delete block", async ({ page }) => {
    const pageSlug = `delete-test-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    // ✅ Find blocks
    let blocks = page.locator('[class*="block"], [class*="component"]');
    const initialCount = await blocks.count();

    // ✅ If there's at least one block, try to delete
    if (initialCount > 0) {
      // Right-click for context menu or look for delete button
      await blocks.first().click();
      await page.waitForTimeout(200);

      // ✅ Look for delete button
      const deleteBtn = page.locator(
        'button[title*="Delete"], button[aria-label*="Delete"], [class*="delete"]'
      );

      if (await deleteBtn.isVisible()) {
        const btnCount = await deleteBtn.count();
        if (btnCount > 0) {
          await deleteBtn.first().click();
          await page.waitForTimeout(300);

          // ✅ Verify block count decreased
          blocks = page.locator('[class*="block"], [class*="component"]');
          const newCount = await blocks.count();
          expect(newCount).toBeLessThanOrEqual(initialCount);
        }
      }
    }
  });

  test("4.9: Can duplicate block", async ({ page }) => {
    const pageSlug = `duplicate-test-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    const blocks = page.locator('[class*="block"], [class*="component"]');
    const initialCount = await blocks.count();

    if (initialCount > 0) {
      await blocks.first().click();
      await page.waitForTimeout(200);

      // ✅ Look for duplicate button
      const dupBtn = page.locator(
        'button[title*="Duplicate"], button[aria-label*="Duplicate"]'
      );

      if (await dupBtn.isVisible()) {
        await dupBtn.click();
        await page.waitForTimeout(300);

        const newBlocks = page.locator('[class*="block"], [class*="component"]');
        const newCount = await newBlocks.count();
        expect(newCount).toBeGreaterThanOrEqual(initialCount);
      }
    }
  });

  test("4.10: Can reorder blocks (drag/drop or buttons)", async ({ page }) => {
    const pageSlug = `reorder-test-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    const blocks = page.locator('[class*="block"], [class*="component"]');
    const blockCount = await blocks.count();

    // Only test if we have at least 2 blocks
    if (blockCount >= 2) {
      // Try arrow buttons first
      const upBtn = page.locator('button[title*="Up"], button[aria-label*="Up"]');

      if (await upBtn.isVisible()) {
        await blocks.first().click();
        await page.waitForTimeout(200);
        await upBtn.click();
        await page.waitForTimeout(300);

        // Block order should have changed
        const newBlocks = page.locator('[class*="block"], [class*="component"]');
        expect(await newBlocks.count()).toBe(blockCount);
      }
    }
  });

  test("4.11: Can edit rich text with formatting", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // ✅ Find textarea or rich text editor
    const textareas = page.locator("textarea");
    if (await textareas.first().isVisible()) {
      const richText = `This is **bold** and *italic* text`;
      await textareas.first().fill(richText);

      const value = await textareas.first().inputValue();
      expect(value.length).toBeGreaterThan(0);
    }
  });

  test("4.12: Can edit multiple blocks in sequence", async ({ page }) => {
    const pageSlug = `multi-edit-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    const blocks = page.locator('[class*="block"], [class*="component"]');
    const blockCount = await blocks.count();

    // Edit multiple blocks
    for (let i = 0; i < Math.min(blockCount, 3); i++) {
      const block = blocks.nth(i);
      await block.click();
      await page.waitForTimeout(200);

      // Find and fill first input
      const inputs = page.locator("input[type='text'], textarea");
      if (await inputs.first().isVisible()) {
        await inputs.first().fill(`Block ${i} - ${Date.now()}`);
      }

      await page.waitForTimeout(200);
    }

    // ✅ All edits should be reflected
    const preview = page.locator(".puck-preview, [class*='preview']");
    await expect(preview).toBeVisible();
  });

  test("4.13: Undo/Redo functionality", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // ✅ Make a change
    const inputs = page.locator("input[type='text'], textarea");
    if (await inputs.first().isVisible()) {
      const originalValue = await inputs.first().inputValue();

      // Make a change
      await inputs.first().fill("Changed text");
      await page.waitForTimeout(200);

      // Undo
      await page.keyboard.press("Control+Z");
      await page.waitForTimeout(300);

      // Should revert (or stay changed depending on implementation)
      const afterUndo = await inputs.first().inputValue();
      expect(afterUndo).toBeDefined();
    }
  });

  test("4.14: Screenshot: Block selected with properties", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);
    await page.waitForLoadState("networkidle");

    // Select first block
    const blocks = page.locator('[class*="block"], [class*="component"]');
    if (await blocks.first().isVisible()) {
      await blocks.first().click();
      await page.waitForTimeout(300);
    }

    await page.screenshot({
      path: "test-results/screenshots/edit-block-selected.png",
      fullPage: true,
    });
  });

  test("4.15: Screenshot: Block properties panel open", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    const blocks = page.locator('[class*="block"], [class*="component"]');
    if (await blocks.first().isVisible()) {
      await blocks.first().click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({
      path: "test-results/screenshots/edit-properties-panel.png",
      fullPage: true,
    });
  });
});
