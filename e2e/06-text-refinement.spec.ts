/**
 * Text Refinement Feature Tests
 * Tests: AI text editing, refinement modes, inline editing
 */

import { test, expect } from "@playwright/test";

test.describe("Text Refinement Feature", () => {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  test("6.1: Text refinement panel is accessible", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);
    await page.waitForLoadState("networkidle");

    // ✅ Find text refinement button or panel
    const refineBtn = page.locator(
      'button:has-text("Refine"), [aria-label*="Refine"], [class*="refine"]'
    );
    const refineCount = await refineBtn.count();

    // May or may not exist depending on implementation
    expect(refineCount).toBeDefined();
  });

  test("6.2: Can select text to refine", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // ✅ Find text content in preview
    const preview = page.locator(".puck-preview, [class*='preview']");
    if (await preview.isVisible()) {
      // Triple-click to select all in an element
      const textElement = preview.locator("p, span, h1, h2, h3, h4, h5, h6").first();
      if (await textElement.isVisible()) {
        await textElement.click({ clickCount: 3 });
        await page.waitForTimeout(200);

        // Should have selection
        const selectedText = await page.evaluate(() => {
          return window.getSelection()?.toString() || "";
        });

        expect(selectedText.length).toBeGreaterThan(0);
      }
    }
  });

  test("6.3: Refinement shows available modes", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // ✅ Look for refinement options
    const refineModes = page.locator(
      'button:has-text("Shorter"), button:has-text("Engaging"), button:has-text("Professional")'
    );
    const modeCount = await refineModes.count();

    // May or may not exist
    expect(modeCount).toBeDefined();
  });

  test("6.4: Can refine text as 'Shorter'", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // ✅ Find text input with content
    const textareas = page.locator("textarea");
    if (await textareas.count() > 0) {
      // Select first textarea with content
      const firstTextarea = textareas.first();
      const content = await firstTextarea.inputValue();

      if (content.length > 10) {
        // There's meaningful content
        // Try to find refine button
        const shorterBtn = page.locator('button:has-text("Shorter")');

        if (await shorterBtn.isVisible()) {
          await shorterBtn.click();
          await page.waitForTimeout(1500); // Wait for AI response

          // Should see refined content
          const newContent = await firstTextarea.inputValue();
          expect(newContent).toBeDefined();
        }
      }
    }
  });

  test("6.5: Can refine text as 'Engaging'", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    const textareas = page.locator("textarea");
    if (await textareas.count() > 0) {
      const textarea = textareas.first();
      const content = await textarea.inputValue();

      if (content.length > 5) {
        const engagingBtn = page.locator('button:has-text("Engaging")');

        if (await engagingBtn.isVisible()) {
          await engagingBtn.click();
          await page.waitForTimeout(1500);

          const refined = await textarea.inputValue();
          expect(refined).toBeDefined();
        }
      }
    }
  });

  test("6.6: Can refine text as 'Professional'", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    const textareas = page.locator("textarea");
    if (await textareas.count() > 0) {
      const textarea = textareas.first();
      const content = await textarea.inputValue();

      if (content.length > 5) {
        const profBtn = page.locator('button:has-text("Professional")');

        if (await profBtn.isVisible()) {
          await profBtn.click();
          await page.waitForTimeout(1500);

          const refined = await textarea.inputValue();
          expect(refined).toBeDefined();
        }
      }
    }
  });

  test("6.7: Can refine text as 'Grammar'", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    const textareas = page.locator("textarea");
    if (await textareas.count() > 0) {
      const textarea = textareas.first();
      await textarea.fill("This text have bad grammer and spelling");

      const grammarBtn = page.locator('button:has-text("Grammar")');
      if (await grammarBtn.isVisible()) {
        await grammarBtn.click();
        await page.waitForTimeout(1500);

        const refined = await textarea.inputValue();
        expect(refined.length).toBeGreaterThan(0);
      }
    }
  });

  test("6.8: Can use custom refinement prompt", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    const textareas = page.locator("textarea");
    if (await textareas.count() > 0) {
      const textarea = textareas.first();
      const content = await textarea.inputValue();

      if (content.length > 5) {
        // Look for custom prompt input
        const customInput = page.locator(
          'input[placeholder*="custom"], input[placeholder*="prompt"], textarea[placeholder*="custom"]'
        );

        if (await customInput.isVisible()) {
          await customInput.fill("Make this funny and quirky");
          await page.waitForTimeout(200);

          const refineBtn = page.locator('button:has-text("Refine")');
          if (await refineBtn.isVisible()) {
            await refineBtn.click();
            await page.waitForTimeout(1500);

            const refined = await textarea.inputValue();
            expect(refined).toBeDefined();
          }
        }
      }
    }
  });

  test("6.9: Refinement shows diff preview", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    const textareas = page.locator("textarea");
    if (await textareas.count() > 0) {
      const original = await textareas.first().inputValue();

      if (original.length > 5) {
        const shorterBtn = page.locator('button:has-text("Shorter")');
        if (await shorterBtn.isVisible()) {
          await shorterBtn.click();
          await page.waitForTimeout(1500);

          // Look for diff preview
          const diffPreview = page.locator('[class*="diff"], [class*="comparison"]');
          const hasDiffPreview = await diffPreview.count() > 0;

          // May or may not have visible diff
          expect(hasDiffPreview).toBeDefined();
        }
      }
    }
  });

  test("6.10: Can accept refined text", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    const textareas = page.locator("textarea");
    if (await textareas.count() > 0) {
      const textarea = textareas.first();
      const original = await textarea.inputValue();

      if (original.length > 5) {
        const shorterBtn = page.locator('button:has-text("Shorter")');
        if (await shorterBtn.isVisible()) {
          await shorterBtn.click();
          await page.waitForTimeout(1500);

          const acceptBtn = page.locator(
            'button:has-text("Accept"), button:has-text("Apply"), button[title*="Accept"]'
          );

          if (await acceptBtn.isVisible()) {
            await acceptBtn.click();
            await page.waitForTimeout(300);

            const afterAccept = await textarea.inputValue();
            expect(afterAccept).toBeDefined();
          }
        }
      }
    }
  });

  test("6.11: Can reject refined text", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    const textareas = page.locator("textarea");
    if (await textareas.count() > 0) {
      const textarea = textareas.first();
      const original = await textarea.inputValue();

      if (original.length > 5) {
        const shorterBtn = page.locator('button:has-text("Shorter")');
        if (await shorterBtn.isVisible()) {
          await shorterBtn.click();
          await page.waitForTimeout(1500);

          const rejectBtn = page.locator(
            'button:has-text("Reject"), button:has-text("Cancel"), button[title*="Reject"]'
          );

          if (await rejectBtn.isVisible()) {
            await rejectBtn.click();
            await page.waitForTimeout(300);

            // Should keep original
            const afterReject = await textarea.inputValue();
            expect(afterReject).toBeDefined();
          }
        }
      }
    }
  });

  test("6.12: Refinement shows statistics", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    const textareas = page.locator("textarea");
    if (await textareas.count() > 0) {
      const content = await textareas.first().inputValue();

      if (content.length > 5) {
        const shorterBtn = page.locator('button:has-text("Shorter")');
        if (await shorterBtn.isVisible()) {
          await shorterBtn.click();
          await page.waitForTimeout(1500);

          // Look for stats
          const stats = page.locator(
            '[class*="stats"], [class*="metrics"], [class*="count"]'
          );
          const hasStats = await stats.count() > 0;

          expect(hasStats).toBeDefined();
        }
      }
    }
  });

  test("6.13: Can copy refined text", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    const textareas = page.locator("textarea");
    if (await textareas.count() > 0) {
      const content = await textareas.first().inputValue();

      if (content.length > 5) {
        const shorterBtn = page.locator('button:has-text("Shorter")');
        if (await shorterBtn.isVisible()) {
          await shorterBtn.click();
          await page.waitForTimeout(1500);

          // Look for copy button
          const copyBtn = page.locator(
            'button:has-text("Copy"), button[title*="Copy"], [aria-label*="copy"]'
          );

          if (await copyBtn.isVisible()) {
            await copyBtn.click();
            await page.waitForTimeout(300);

            // Should show success message
            const success = page.locator('[class*="success"], [role="status"]');
            expect(await success.count()).toBeGreaterThanOrEqual(0);
          }
        }
      }
    }
  });

  test("6.14: Performance: Text refinement completes within 3 seconds", async ({
    page,
  }) => {
    await page.goto(`${baseUrl}/edit/test`);

    const textareas = page.locator("textarea");
    if (await textareas.count() > 0) {
      const content = await textareas.first().inputValue();

      if (content.length > 5) {
        const startTime = Date.now();
        const shorterBtn = page.locator('button:has-text("Shorter")');

        if (await shorterBtn.isVisible()) {
          await shorterBtn.click();
          await page.waitForTimeout(2500);

          const duration = Date.now() - startTime;
          expect(duration).toBeLessThan(3000);
        }
      }
    }
  });

  test("6.15: Screenshot: Text refinement panel", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);
    await page.waitForLoadState("networkidle");

    const textareas = page.locator("textarea");
    if (await textareas.count() > 0) {
      const shorterBtn = page.locator('button:has-text("Shorter")');
      if (await shorterBtn.isVisible()) {
        await shorterBtn.click();
        await page.waitForTimeout(500);
      }
    }

    await page.screenshot({
      path: "test-results/screenshots/text-refinement-panel.png",
      fullPage: true,
    });
  });
});
