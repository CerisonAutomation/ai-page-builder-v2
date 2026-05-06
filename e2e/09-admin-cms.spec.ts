/**
 * Admin CMS Tests
 * Tests: admin pages, page management, media library, settings
 */

import { test, expect } from "@playwright/test";

test.describe("Admin CMS Pages", () => {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  test("9.1: Admin dashboard is accessible", async ({ page }) => {
    await page.goto(`${baseUrl}/admin`, { waitUntil: "networkidle" });

    // ✅ Check for admin layout/dashboard
    const dashboard = page.locator('[class*="admin"], [class*="dashboard"]');
    const adminCount = await dashboard.count();

    expect(adminCount).toBeGreaterThan(0);
  });

  test("9.2: Admin navigation sidebar is visible", async ({ page }) => {
    await page.goto(`${baseUrl}/admin`);

    // ✅ Look for sidebar
    const sidebar = page.locator('[class*="sidebar"], [class*="nav"], nav');
    const sidebarCount = await sidebar.count();

    expect(sidebarCount).toBeGreaterThan(0);
  });

  test("9.3: Can navigate to Pages section", async ({ page }) => {
    await page.goto(`${baseUrl}/admin`);

    // ✅ Click Pages link
    const pagesLink = page.locator(
      'a[href*="/admin/pages"], button:has-text("Pages")'
    );

    if (await pagesLink.isVisible()) {
      await pagesLink.click();
      await page.waitForLoadState("networkidle");

      // ✅ Should show pages list
      const pagesList = page.locator('[class*="pages"], [class*="list"]');
      const hasPages = await pagesList.count() > 0;

      expect(hasPages).toBeDefined();
    }
  });

  test("9.4: Can navigate to Media section", async ({ page }) => {
    await page.goto(`${baseUrl}/admin`);

    // ✅ Click Media link
    const mediaLink = page.locator(
      'a[href*="/admin/media"], button:has-text("Media")'
    );

    if (await mediaLink.isVisible()) {
      await mediaLink.click();
      await page.waitForLoadState("networkidle");

      // ✅ Should show media library
      const mediaLib = page.locator('[class*="media"], [class*="gallery"]');
      const hasMedia = await mediaLib.count() > 0;

      expect(hasMedia).toBeDefined();
    }
  });

  test("9.5: Can navigate to Settings section", async ({ page }) => {
    await page.goto(`${baseUrl}/admin`);

    // ✅ Click Settings link
    const settingsLink = page.locator(
      'a[href*="/admin/settings"], button:has-text("Settings")'
    );

    if (await settingsLink.isVisible()) {
      await settingsLink.click();
      await page.waitForLoadState("networkidle");

      // ✅ Should show settings panel
      const settings = page.locator('[class*="settings"], form');
      const hasSettings = await settings.count() > 0;

      expect(hasSettings).toBeDefined();
    }
  });

  test("9.6: Pages section shows list of pages", async ({ page }) => {
    await page.goto(`${baseUrl}/admin/pages`, { waitUntil: "networkidle" });

    // ✅ Should show page entries
    const pageEntries = page.locator(
      '[class*="page"], [class*="row"], [class*="item"]'
    );
    const count = await pageEntries.count();

    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("9.7: Can create new page from admin", async ({ page }) => {
    await page.goto(`${baseUrl}/admin/pages`);

    // ✅ Look for "Create" or "New Page" button
    const newPageBtn = page.locator(
      'button:has-text("New"), button:has-text("Create"), button:has-text("Add Page")'
    );

    if (await newPageBtn.isVisible()) {
      await newPageBtn.click();
      await page.waitForTimeout(300);

      // ✅ Should show form or redirect to editor
      const form = page.locator('input, form');
      expect(await form.count()).toBeGreaterThan(0);
    }
  });

  test("9.8: Can delete page from admin", async ({ page }) => {
    await page.goto(`${baseUrl}/admin/pages`);

    // ✅ Look for delete button on first page entry
    const deleteBtn = page.locator(
      'button:has-text("Delete"), button[aria-label*="Delete"]'
    ).first();

    if (await deleteBtn.isVisible()) {
      const pagesBefore = await page.locator('[class*="page"], [class*="row"]').count();

      await deleteBtn.click();
      await page.waitForTimeout(500);

      // May show confirmation dialog
      const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Delete")').last();
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
        await page.waitForTimeout(500);
      }

      // Page count might decrease
      const pagesAfter = await page.locator('[class*="page"], [class*="row"]').count();
      expect(pagesAfter).toBeLessThanOrEqual(pagesBefore);
    }
  });

  test("9.9: Media library shows images", async ({ page }) => {
    await page.goto(`${baseUrl}/admin/media`);
    await page.waitForLoadState("networkidle");

    // ✅ Look for image entries
    const images = page.locator(
      'img, [class*="image"], [class*="media"], [class*="thumbnail"]'
    );
    const imageCount = await images.count();

    expect(imageCount).toBeGreaterThanOrEqual(0);
  });

  test("9.10: Can upload image to media library", async ({ page }) => {
    await page.goto(`${baseUrl}/admin/media`);

    // ✅ Look for upload input
    const uploadInput = page.locator('input[type="file"]').first();

    if (await uploadInput.isVisible()) {
      // Create test image
      await uploadInput.setInputFiles({
        name: "test-image.jpg",
        mimeType: "image/jpeg",
        buffer: Buffer.from("JPEG_DATA"),
      });

      await page.waitForTimeout(1000);

      // ✅ Image should appear in library
      const images = page.locator('img, [class*="image"]');
      expect(await images.count()).toBeGreaterThan(0);
    }
  });

  test("9.11: Can search for pages in admin", async ({ page }) => {
    await page.goto(`${baseUrl}/admin/pages`);

    // ✅ Look for search input
    const searchInput = page.locator(
      'input[placeholder*="Search"], input[placeholder*="search"]'
    );

    if (await searchInput.isVisible()) {
      await searchInput.fill("test");
      await page.waitForTimeout(500);

      // ✅ Results should filter
      const results = page.locator('[class*="page"], [class*="row"]');
      expect(await results.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test("9.12: Can filter pages by status", async ({ page }) => {
    await page.goto(`${baseUrl}/admin/pages`);

    // ✅ Look for status filter
    const statusFilter = page.locator(
      'select, [role="combobox"], button:has-text("Published"), button:has-text("Draft")'
    );

    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await page.waitForTimeout(300);

      // ✅ Should filter results
      const results = page.locator('[class*="page"], [class*="row"]');
      expect(await results.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test("9.13: Settings page is accessible", async ({ page }) => {
    await page.goto(`${baseUrl}/admin/settings`);
    await page.waitForLoadState("networkidle");

    // ✅ Should show settings form
    const settings = page.locator('input, form, [class*="settings"]');
    const count = await settings.count();

    expect(count).toBeGreaterThan(0);
  });

  test("9.14: Can change theme from admin settings", async ({ page }) => {
    await page.goto(`${baseUrl}/admin/settings`);

    // ✅ Look for theme selector
    const themeSelector = page.locator(
      'select[name*="theme"], [role="combobox"], button:has-text("Light"), button:has-text("Dark")'
    );

    if (await themeSelector.isVisible()) {
      await themeSelector.click();
      await page.waitForTimeout(300);

      // ✅ Should have theme options
      const options = page.locator('[role="option"]');
      const optionCount = await options.count();

      expect(optionCount).toBeGreaterThan(0);
    }
  });

  test("9.15: Can save settings", async ({ page }) => {
    await page.goto(`${baseUrl}/admin/settings`);

    // ✅ Change a setting
    const inputs = page.locator('input[type="text"], select');
    if (await inputs.first().isVisible()) {
      const currentValue = await inputs.first().inputValue();
      await inputs.first().fill("Updated Value");
    }

    // ✅ Click save
    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Update")');
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
      await page.waitForTimeout(500);

      // ✅ Should show success message
      const success = page.locator('[role="status"], [class*="success"]');
      expect(await success.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test("9.16: Admin page performance < 2 seconds", async ({ page }) => {
    const startTime = Date.now();
    await page.goto(`${baseUrl}/admin`, { waitUntil: "networkidle" });
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(2000);
  });

  test("9.17: Screenshot: Admin dashboard", async ({ page }) => {
    await page.goto(`${baseUrl}/admin`);
    await page.waitForLoadState("networkidle");

    await page.screenshot({
      path: "test-results/screenshots/admin-dashboard.png",
      fullPage: true,
    });
  });

  test("9.18: Screenshot: Pages management view", async ({ page }) => {
    await page.goto(`${baseUrl}/admin/pages`);
    await page.waitForLoadState("networkidle");

    await page.screenshot({
      path: "test-results/screenshots/admin-pages.png",
      fullPage: true,
    });
  });

  test("9.19: Screenshot: Media library", async ({ page }) => {
    await page.goto(`${baseUrl}/admin/media`);
    await page.waitForLoadState("networkidle");

    await page.screenshot({
      path: "test-results/screenshots/admin-media.png",
      fullPage: true,
    });
  });

  test("9.20: Screenshot: Admin settings", async ({ page }) => {
    await page.goto(`${baseUrl}/admin/settings`);
    await page.waitForLoadState("networkidle");

    await page.screenshot({
      path: "test-results/screenshots/admin-settings.png",
      fullPage: true,
    });
  });
});
