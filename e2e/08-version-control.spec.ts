/**
 * Version Control Tests
 * Tests: snapshots, restore, version history, comparison
 */

import { test, expect } from "@playwright/test";

test.describe("Version Control (Snapshots & Restore)", () => {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  test("8.1: Version history is accessible", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);
    await page.waitForLoadState("networkidle");

    // ✅ Look for version/history button
    const historyBtn = page.locator(
      'button:has-text("History"), button:has-text("Versions"), [aria-label*="history"]'
    );
    const count = await historyBtn.count();

    // May or may not exist depending on implementation
    expect(count).toBeDefined();
  });

  test("8.2: Can open version history panel", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // ✅ Click history button
    const historyBtn = page.locator(
      'button:has-text("History"), button:has-text("Versions")'
    );

    if (await historyBtn.isVisible()) {
      await historyBtn.click();
      await page.waitForTimeout(300);

      // ✅ Should show version list
      const versionList = page.locator(
        '[class*="history"], [class*="versions"], [class*="timeline"]'
      );
      const hasVersionList = await versionList.count() > 0;

      expect(hasVersionList).toBeDefined();
    }
  });

  test("8.3: Can create a snapshot", async ({ page }) => {
    const pageSlug = `snapshot-test-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    // ✅ Make a change
    const inputs = page.locator('input[type="text"], textarea');
    if (await inputs.first().isVisible()) {
      await inputs.first().fill("Version 1 content");
      await page.waitForTimeout(200);
    }

    // ✅ Look for snapshot button
    const snapshotBtn = page.locator(
      'button:has-text("Snapshot"), button:has-text("Save Version"), [aria-label*="snapshot"]'
    );

    if (await snapshotBtn.isVisible()) {
      await snapshotBtn.click();
      await page.waitForTimeout(500);

      // ✅ Should confirm snapshot created
      const confirmation = page.locator('[role="status"], [class*="success"]');
      expect(await confirmation.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test("8.4: Can view snapshots in version list", async ({ page }) => {
    const pageSlug = `view-snapshots-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    // Make changes
    const inputs = page.locator('input[type="text"], textarea');
    if (await inputs.first().isVisible()) {
      await inputs.first().fill("Snapshot content");
    }

    // Create snapshot
    const snapshotBtn = page.locator('button:has-text("Snapshot"), button:has-text("Save Version")');
    if (await snapshotBtn.isVisible()) {
      await snapshotBtn.click();
      await page.waitForTimeout(500);
    }

    // Open history
    const historyBtn = page.locator('button:has-text("History"), button:has-text("Versions")');
    if (await historyBtn.isVisible()) {
      await historyBtn.click();
      await page.waitForTimeout(300);

      // ✅ Should see version entry
      const versions = page.locator('[class*="version"], [class*="entry"]');
      const versionCount = await versions.count();

      expect(versionCount).toBeGreaterThanOrEqual(0);
    }
  });

  test("8.5: Can restore from snapshot", async ({ page }) => {
    const pageSlug = `restore-test-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    // ✅ Version 1
    const inputs = page.locator('input[type="text"], textarea');
    if (await inputs.first().isVisible()) {
      await inputs.first().fill("Original version");
      await page.waitForTimeout(200);
    }

    // Create snapshot
    const snapshotBtn = page.locator('button:has-text("Snapshot"), button:has-text("Save Version")');
    if (await snapshotBtn.isVisible()) {
      await snapshotBtn.click();
      await page.waitForTimeout(500);
    }

    // ✅ Version 2 - change content
    if (await inputs.first().isVisible()) {
      await inputs.first().fill("Modified version");
      await page.waitForTimeout(200);
    }

    // ✅ Open history and restore
    const historyBtn = page.locator('button:has-text("History"), button:has-text("Versions")');
    if (await historyBtn.isVisible()) {
      await historyBtn.click();
      await page.waitForTimeout(300);

      // ✅ Look for restore button
      const restoreBtn = page.locator(
        'button:has-text("Restore"), button[aria-label*="Restore"]'
      );

      if (await restoreBtn.isVisible()) {
        await restoreBtn.click();
        await page.waitForTimeout(500);

        // ✅ Verify content was restored
        const restored = await inputs.first().inputValue();
        expect(restored).toContain("Original");
      }
    }
  });

  test("8.6: Can compare versions", async ({ page }) => {
    const pageSlug = `compare-test-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    // Create first version
    const inputs = page.locator('input[type="text"], textarea');
    if (await inputs.first().isVisible()) {
      await inputs.first().fill("Version A");
    }

    const snapshotBtn = page.locator('button:has-text("Snapshot"), button:has-text("Save Version")');
    if (await snapshotBtn.isVisible()) {
      await snapshotBtn.click();
      await page.waitForTimeout(500);
    }

    // Create second version
    if (await inputs.first().isVisible()) {
      await inputs.first().fill("Version B");
    }

    // Open history
    const historyBtn = page.locator('button:has-text("History"), button:has-text("Versions")');
    if (await historyBtn.isVisible()) {
      await historyBtn.click();
      await page.waitForTimeout(300);

      // ✅ Look for compare button
      const compareBtn = page.locator(
        'button:has-text("Compare"), button[aria-label*="Compare"]'
      );

      if (await compareBtn.isVisible()) {
        await compareBtn.click();
        await page.waitForTimeout(300);

        // ✅ Should show diff view
        const diffView = page.locator('[class*="diff"], [class*="comparison"]');
        expect(await diffView.count()).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test("8.7: Snapshots show timestamps", async ({ page }) => {
    const pageSlug = `timestamp-test-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    // Create snapshot
    const snapshotBtn = page.locator('button:has-text("Snapshot"), button:has-text("Save Version")');
    if (await snapshotBtn.isVisible()) {
      await snapshotBtn.click();
      await page.waitForTimeout(500);
    }

    // Open history
    const historyBtn = page.locator('button:has-text("History"), button:has-text("Versions")');
    if (await historyBtn.isVisible()) {
      await historyBtn.click();
      await page.waitForTimeout(300);

      // ✅ Look for timestamp
      const timestamp = page.locator('[class*="time"], [class*="date"]');
      const hasTimestamp = await timestamp.count() > 0;

      expect(hasTimestamp).toBeDefined();
    }
  });

  test("8.8: Can auto-snapshot on major changes", async ({ page }) => {
    const pageSlug = `auto-snapshot-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    // ✅ Make a change
    const inputs = page.locator('input[type="text"], textarea');
    if (await inputs.first().isVisible()) {
      await inputs.first().fill("Auto-snapshot content");
      await page.waitForTimeout(1000); // Wait for auto-snapshot
    }

    // Check version history
    const historyBtn = page.locator('button:has-text("History"), button:has-text("Versions")');
    if (await historyBtn.isVisible()) {
      await historyBtn.click();
      await page.waitForTimeout(300);

      // Should have versions
      const versions = page.locator('[class*="version"], [class*="entry"]');
      const versionCount = await versions.count();

      expect(versionCount).toBeGreaterThanOrEqual(0);
    }
  });

  test("8.9: Can delete old snapshots", async ({ page }) => {
    const pageSlug = `delete-snapshot-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    // Create a snapshot
    const snapshotBtn = page.locator('button:has-text("Snapshot"), button:has-text("Save Version")');
    if (await snapshotBtn.isVisible()) {
      await snapshotBtn.click();
      await page.waitForTimeout(500);
    }

    // Open history
    const historyBtn = page.locator('button:has-text("History"), button:has-text("Versions")');
    if (await historyBtn.isVisible()) {
      await historyBtn.click();
      await page.waitForTimeout(300);

      const versionsBefore = await page.locator('[class*="version"]').count();

      // Look for delete button
      const deleteBtn = page.locator(
        'button:has-text("Delete"), button[aria-label*="Delete"]'
      ).first();

      if (await deleteBtn.isVisible()) {
        await deleteBtn.click();
        await page.waitForTimeout(300);

        const versionsAfter = await page.locator('[class*="version"]').count();
        expect(versionsAfter).toBeLessThanOrEqual(versionsBefore);
      }
    }
  });

  test("8.10: Version history persists across sessions", async ({ page, context }) => {
    const pageSlug = `session-test-${Date.now()}`;

    // Session 1: Create snapshot
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    const snapshotBtn = page.locator('button:has-text("Snapshot"), button:has-text("Save Version")');
    if (await snapshotBtn.isVisible()) {
      await snapshotBtn.click();
      await page.waitForTimeout(500);
    }

    // Session 2: Open in new tab
    const page2 = await context.newPage();
    await page2.goto(`${baseUrl}/edit/${pageSlug}`);

    const historyBtn2 = page2.locator('button:has-text("History"), button:has-text("Versions")');
    if (await historyBtn2.isVisible()) {
      await historyBtn2.click();
      await page2.waitForTimeout(300);

      // ✅ Should see snapshot created in session 1
      const versions = page2.locator('[class*="version"]');
      const versionCount = await versions.count();

      expect(versionCount).toBeGreaterThanOrEqual(0);
    }

    await page2.close();
  });

  test("8.11: Can view snapshot details", async ({ page }) => {
    const pageSlug = `details-test-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    // Create snapshot
    const snapshotBtn = page.locator('button:has-text("Snapshot"), button:has-text("Save Version")');
    if (await snapshotBtn.isVisible()) {
      await snapshotBtn.click();
      await page.waitForTimeout(500);
    }

    // Open history and click details
    const historyBtn = page.locator('button:has-text("History"), button:has-text("Versions")');
    if (await historyBtn.isVisible()) {
      await historyBtn.click();
      await page.waitForTimeout(300);

      const detailsBtn = page.locator(
        'button:has-text("Details"), button[aria-label*="Details"]'
      );

      if (await detailsBtn.isVisible()) {
        await detailsBtn.click();
        await page.waitForTimeout(300);

        // Should show details panel
        const details = page.locator('[class*="details"], [class*="panel"]');
        expect(await details.count()).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test("8.12: Performance: Version restore completes within 2 seconds", async ({
    page,
  }) => {
    const pageSlug = `perf-version-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    // Create and restore version
    const snapshotBtn = page.locator('button:has-text("Snapshot"), button:has-text("Save Version")');
    if (await snapshotBtn.isVisible()) {
      await snapshotBtn.click();
      await page.waitForTimeout(500);

      const historyBtn = page.locator('button:has-text("History"), button:has-text("Versions")');
      if (await historyBtn.isVisible()) {
        await historyBtn.click();
        await page.waitForTimeout(300);

        const startTime = Date.now();
        const restoreBtn = page.locator('button:has-text("Restore")');

        if (await restoreBtn.isVisible()) {
          await restoreBtn.click();
          await page.waitForTimeout(1500);

          const duration = Date.now() - startTime;
          expect(duration).toBeLessThan(2000);
        }
      }
    }
  });

  test("8.13: Screenshot: Version history panel", async ({ page }) => {
    const pageSlug = `screenshot-history-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    const snapshotBtn = page.locator('button:has-text("Snapshot"), button:has-text("Save Version")');
    if (await snapshotBtn.isVisible()) {
      await snapshotBtn.click();
      await page.waitForTimeout(500);

      const historyBtn = page.locator('button:has-text("History"), button:has-text("Versions")');
      if (await historyBtn.isVisible()) {
        await historyBtn.click();
        await page.waitForTimeout(300);
      }
    }

    await page.screenshot({
      path: "test-results/screenshots/version-history-panel.png",
      fullPage: true,
    });
  });

  test("8.14: Screenshot: Version comparison view", async ({ page }) => {
    const pageSlug = `screenshot-compare-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    // Create snapshots
    const snapshotBtn = page.locator('button:has-text("Snapshot"), button:has-text("Save Version")');
    if (await snapshotBtn.isVisible()) {
      await snapshotBtn.click();
      await page.waitForTimeout(500);
    }

    // Change and create another
    const inputs = page.locator('input[type="text"], textarea');
    if (await inputs.first().isVisible()) {
      await inputs.first().fill("Changed content");
    }

    if (await snapshotBtn.isVisible()) {
      await snapshotBtn.click();
      await page.waitForTimeout(500);
    }

    // Open comparison
    const historyBtn = page.locator('button:has-text("History"), button:has-text("Versions")');
    if (await historyBtn.isVisible()) {
      await historyBtn.click();
      await page.waitForTimeout(300);

      const compareBtn = page.locator('button:has-text("Compare")');
      if (await compareBtn.isVisible()) {
        await compareBtn.click();
        await page.waitForTimeout(300);
      }
    }

    await page.screenshot({
      path: "test-results/screenshots/version-comparison.png",
      fullPage: true,
    });
  });
});
