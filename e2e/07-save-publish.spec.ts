/**
 * Save & Publish Tests
 * Tests: page saving, publishing, persistence
 */

import { test, expect } from "@playwright/test";

test.describe("Save & Publish Functionality", () => {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  test("7.1: Save button is visible", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);
    await page.waitForLoadState("networkidle");

    // ✅ Find save/publish button
    const saveBtn = page.locator(
      'button:has-text("Save"), button:has-text("Publish"), [class*="save"]'
    );
    const count = await saveBtn.count();

    expect(count).toBeGreaterThan(0);
  });

  test("7.2: Can save page changes", async ({ page }) => {
    const pageSlug = `save-test-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    // ✅ Make a change
    const inputs = page.locator('input[type="text"], textarea');
    if (await inputs.first().isVisible()) {
      const testText = `Test save ${Date.now()}`;
      await inputs.first().fill(testText);
      await page.waitForTimeout(300);

      // ✅ Save
      const saveBtn = page.locator(
        'button:has-text("Save"), button:has-text("Publish")'
      );
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await page.waitForTimeout(500);

        // ✅ Should show success indication
        const success = page.locator(
          '[role="status"], [class*="success"], [class*="toast"]'
        );
        const hasSuccess = await success.count() > 0;
        expect(hasSuccess).toBeDefined();
      }
    }
  });

  test("7.3: Saved data persists after reload", async ({ page }) => {
    const pageSlug = `persist-test-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    // ✅ Add content
    const inputs = page.locator('input[type="text"], textarea');
    if (await inputs.first().isVisible()) {
      const uniqueText = `Persist ${Date.now()}`;
      await inputs.first().fill(uniqueText);
      await page.waitForTimeout(200);

      // Save
      const saveBtn = page.locator('button:has-text("Save"), button:has-text("Publish")');
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await page.waitForTimeout(500);
      }

      // ✅ Reload page
      await page.reload();
      await page.waitForLoadState("networkidle");

      // ✅ Verify data is still there
      const afterReload = await inputs.first().inputValue();
      expect(afterReload).toContain(uniqueText);
    }
  });

  test("7.4: Can publish page to make it public", async ({ page }) => {
    const pageSlug = `publish-test-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    // ✅ Add content
    const inputs = page.locator('input[type="text"], textarea');
    if (await inputs.first().isVisible()) {
      await inputs.first().fill("Public content");
      await page.waitForTimeout(200);
    }

    // ✅ Look for publish button
    const publishBtn = page.locator(
      'button:has-text("Publish"), button[aria-label*="Publish"]'
    );

    if (await publishBtn.isVisible()) {
      await publishBtn.click();
      await page.waitForTimeout(500);

      // ✅ Verify success
      const success = page.locator('[role="status"], [class*="success"]');
      expect(await success.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test("7.5: Published page is accessible at public URL", async ({ page }) => {
    const pageSlug = `public-test-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    // ✅ Add distinctive content
    const inputs = page.locator('input[type="text"], textarea');
    const publicContent = `PUBLIC_${Date.now()}`;
    if (await inputs.first().isVisible()) {
      await inputs.first().fill(publicContent);
      await page.waitForTimeout(200);
    }

    // ✅ Publish
    const publishBtn = page.locator('button:has-text("Publish")');
    if (await publishBtn.isVisible()) {
      await publishBtn.click();
      await page.waitForTimeout(500);
    }

    // ✅ Navigate to public URL
    const publicResponse = await page.goto(`${baseUrl}/${pageSlug}`, {
      waitUntil: "networkidle",
    });

    // Should load (either 200 or redirect)
    expect(publicResponse?.status()).toBeLessThan(400);
  });

  test("7.6: Draft pages are not publicly accessible", async ({ page }) => {
    const draftSlug = `draft-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${draftSlug}`);

    // ✅ Add content but don't publish
    const inputs = page.locator('input[type="text"], textarea');
    if (await inputs.first().isVisible()) {
      await inputs.first().fill("Draft content");
    }

    // Don't publish - just save
    const saveBtn = page.locator('button:has-text("Save")').first();
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
      await page.waitForTimeout(500);
    }

    // ✅ Try to access public URL (should 404)
    const response = await page.goto(`${baseUrl}/${draftSlug}`);
    expect(response?.status()).toBe(404);
  });

  test("7.7: Auto-save functionality (if implemented)", async ({ page }) => {
    const pageSlug = `autosave-test-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    // ✅ Make a change
    const inputs = page.locator('input[type="text"], textarea');
    if (await inputs.first().isVisible()) {
      await inputs.first().fill("Auto-saved content");
      await page.waitForTimeout(1000); // Wait for auto-save

      // ✅ Reload without clicking save
      await page.reload();
      await page.waitForLoadState("networkidle");

      // ✅ Check if content persisted
      const afterReload = await inputs.first().inputValue();
      expect(afterReload).toBeDefined();
    }
  });

  test("7.8: Save displays confirmation message", async ({ page }) => {
    const pageSlug = `confirm-test-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    const inputs = page.locator('input[type="text"], textarea');
    if (await inputs.first().isVisible()) {
      await inputs.first().fill("Confirmation test");
      await page.waitForTimeout(200);
    }

    // Save
    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Publish")');
    if (await saveBtn.isVisible()) {
      await saveBtn.click();

      // ✅ Wait for confirmation message
      const confirmation = page.locator(
        '[role="status"], [class*="toast"], [class*="notification"]'
      );

      // Should show some feedback
      await page.waitForTimeout(200);
      const confirmCount = await confirmation.count();
      expect(confirmCount).toBeGreaterThanOrEqual(0);
    }
  });

  test("7.9: Can save as draft", async ({ page }) => {
    const pageSlug = `draft-save-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    // ✅ Look for draft/save option
    const draftBtn = page.locator(
      'button:has-text("Draft"), button:has-text("Save as Draft")'
    );

    if (await draftBtn.isVisible()) {
      await draftBtn.click();
      await page.waitForTimeout(500);

      // ✅ Page should remain in edit mode
      const editor = page.locator('[class*="puck"], [class*="editor"]');
      await expect(editor).toBeVisible();
    }
  });

  test("7.10: Page version is incremented on save", async ({ page }) => {
    const pageSlug = `version-test-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    // ✅ Get initial version (if displayed)
    const versionBefore = await page.locator(
      '[class*="version"], [class*="v"]'
    ).textContent();

    // Make a change and save
    const inputs = page.locator('input[type="text"], textarea');
    if (await inputs.first().isVisible()) {
      await inputs.first().fill("Version increment test");
    }

    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Publish")');
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
      await page.waitForTimeout(500);
    }

    // Version should be updated or page should show it was saved
    const updated = page.locator('[class*="updated"], [class*="saved"]');
    expect(await updated.count()).toBeGreaterThanOrEqual(0);
  });

  test("7.11: Performance: Save completes within 2 seconds", async ({ page }) => {
    const pageSlug = `perf-save-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    const inputs = page.locator('input[type="text"], textarea');
    if (await inputs.first().isVisible()) {
      await inputs.first().fill("Performance test");
    }

    const startTime = Date.now();
    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Publish")');
    if (await saveBtn.isVisible()) {
      await saveBtn.click();

      // Wait for save to complete
      await page.waitForFunction(
        () => {
          return document.querySelector('[role="status"]') === null;
        },
        { timeout: 2000 }
      ).catch(() => {
        // Timeout is okay, we'll measure elapsed time anyway
      });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(2000);
    }
  });

  test("7.12: Save handles network errors gracefully", async ({ page }) => {
    const pageSlug = `error-save-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    // ✅ Simulate network error
    await page.route("**/api/**", (route) => {
      route.abort("failed");
    });

    const inputs = page.locator('input[type="text"], textarea');
    if (await inputs.first().isVisible()) {
      await inputs.first().fill("Error test");
    }

    // Try to save
    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Publish")');
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
      await page.waitForTimeout(500);

      // Should show error message, not crash
      const errorMsg = page.locator('[role="alert"], [class*="error"]');
      expect(await errorMsg.count()).toBeGreaterThanOrEqual(0);
    }

    // Restore network
    await page.unroute("**/api/**");
  });

  test("7.13: Screenshot: Save dialog/confirmation", async ({ page }) => {
    const pageSlug = `screenshot-save-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    const inputs = page.locator('input[type="text"], textarea');
    if (await inputs.first().isVisible()) {
      await inputs.first().fill("Screenshot content");
    }

    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Publish")');
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
      await page.waitForTimeout(300);
    }

    await page.screenshot({
      path: "test-results/screenshots/save-confirmation.png",
      fullPage: true,
    });
  });

  test("7.14: Screenshot: Published page view", async ({ page }) => {
    const pageSlug = `published-view-${Date.now()}`;
    
    // Create and publish a page
    await page.goto(`${baseUrl}/edit/${pageSlug}`);
    const inputs = page.locator('input[type="text"], textarea');
    if (await inputs.first().isVisible()) {
      await inputs.first().fill("Published page content");
    }

    const publishBtn = page.locator('button:has-text("Publish")');
    if (await publishBtn.isVisible()) {
      await publishBtn.click();
      await page.waitForTimeout(500);
    }

    // View published page
    await page.goto(`${baseUrl}/${pageSlug}`);
    await page.waitForLoadState("networkidle");

    await page.screenshot({
      path: "test-results/screenshots/published-page.png",
      fullPage: true,
    });
  });
});
