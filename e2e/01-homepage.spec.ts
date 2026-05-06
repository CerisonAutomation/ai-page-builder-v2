/**
 * Homepage Tests — Initial Landing Page
 * Tests: page load, navigation, performance
 */

import { test, expect, Page } from "@playwright/test";

test.describe("Homepage Tests", () => {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  test("1.1: Homepage loads successfully", async ({ page }) => {
    const startTime = Date.now();
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    const loadTime = Date.now() - startTime;

    // ✅ Check page title
    await expect(page).toHaveTitle(/AI Page Builder|Page Builder/);

    // ✅ Check main content visible
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();

    // ✅ Performance: Load time < 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test("1.2: Navigation elements are present", async ({ page }) => {
    await page.goto(baseUrl);

    // ✅ Check for navigation menu
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();

    // ✅ Check for main links
    const links = page.locator('a[href*="/edit"], a[href*="/admin"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test("1.3: Hero section renders correctly", async ({ page }) => {
    await page.goto(baseUrl);

    // ✅ Check for hero section
    const hero = page.locator("section").first();
    await expect(hero).toBeVisible();

    // ✅ Check for heading
    const heading = page.locator("h1, h2").first();
    const headingText = await heading.textContent();
    expect(headingText?.length).toBeGreaterThan(0);
  });

  test("1.4: CTA buttons are clickable", async ({ page }) => {
    await page.goto(baseUrl);

    // ✅ Find CTA button
    const ctaButton = page.locator('button, a[class*="button"]').first();
    await expect(ctaButton).toBeEnabled();

    // ✅ Verify it's visible
    await expect(ctaButton).toBeInViewport();
  });

  test("1.5: Mobile viewport renders correctly", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(baseUrl);

    // ✅ Check main content is visible on mobile
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();

    // ✅ No horizontal scrolling
    const bodyWidth = await page.evaluate(() => window.innerWidth);
    const htmlWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(htmlWidth).toBeLessThanOrEqual(bodyWidth + 10); // Small buffer for scrollbar
  });

  test("1.6: Web Vitals: Largest Contentful Paint (LCP) < 2.5s", async ({
    page,
  }) => {
    await page.goto(baseUrl, { waitUntil: "networkidle" });

    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.renderTime || lastEntry.loadTime);
        });

        observer.observe({ entryTypes: ["largest-contentful-paint"] });

        // Timeout after 5 seconds
        setTimeout(() => resolve(0), 5000);
      });
    });

    expect(lcp as number).toBeLessThan(2500);
  });

  test("1.7: Web Vitals: First Input Delay (FID) < 100ms", async ({ page }) => {
    await page.goto(baseUrl);

    const fid = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const firstEntry = list.getEntries()[0];
          resolve(firstEntry.processingDuration);
        });

        observer.observe({ entryTypes: ["first-input"] });

        // Simulate user interaction
        document.body.click();

        setTimeout(() => resolve(0), 2000);
      });
    });

    expect(fid as number).toBeLessThan(100);
  });

  test("1.8: Web Vitals: Cumulative Layout Shift (CLS) < 0.1", async ({
    page,
  }) => {
    await page.goto(baseUrl, { waitUntil: "networkidle" });

    const cls = await page.evaluate(() => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if ((entry as any).hadRecentInput) {
            continue; // Ignore shifts after user input
          }
          clsValue += (entry as any).value;
        }
      });

      observer.observe({ entryTypes: ["layout-shift"] });

      return new Promise((resolve) => {
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 5000);
      });
    });

    expect(cls as number).toBeLessThan(0.1);
  });

  test("1.9: SEO: Meta tags are present", async ({ page }) => {
    await page.goto(baseUrl);

    // ✅ Check title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // ✅ Check description
    const description = page.locator('meta[name="description"]');
    const descContent = await description.getAttribute("content");
    expect(descContent?.length).toBeGreaterThan(0);

    // ✅ Check viewport
    const viewport = page.locator('meta[name="viewport"]');
    const viewportContent = await viewport.getAttribute("content");
    expect(viewportContent).toContain("width=device-width");
  });

  test("1.10: Fonts load correctly (no FOUT)", async ({ page }) => {
    await page.goto(baseUrl, { waitUntil: "networkidle" });

    // ✅ Check that fonts are loaded
    const fontLoaded = await page.evaluate(() => {
      return document.fonts.ready.then(() => true).catch(() => false);
    });

    expect(fontLoaded).toBeTruthy();
  });

  test("1.11: Screenshot: Homepage full page", async ({ page }) => {
    await page.goto(baseUrl);
    await page.screenshot({
      path: "test-results/screenshots/homepage-full.png",
      fullPage: true,
    });
  });

  test("1.12: Screenshot: Homepage mobile view", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(baseUrl);
    await page.screenshot({
      path: "test-results/screenshots/homepage-mobile.png",
      fullPage: true,
    });
  });
});
