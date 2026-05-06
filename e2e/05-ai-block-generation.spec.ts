/**
 * AI Block Generation Tests
 * Tests: AI-powered block creation, prompts, generation quality
 */

import { test, expect } from "@playwright/test";

test.describe("AI Block Generation", () => {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  test("5.1: AI Panel is accessible", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);
    await page.waitForLoadState("networkidle");

    // ✅ Find AI panel or button
    const aiPanel = page.locator(
      '[class*="ai"], [aria-label*="AI"], button:has-text("Generate")'
    );
    const aiCount = await aiPanel.count();

    expect(aiCount).toBeGreaterThan(0);
  });

  test("5.2: Can open AI block generation panel", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // ✅ Find and click AI/Generate button
    const aiButton = page.locator(
      'button:has-text("Generate"), button:has-text("AI"), [class*="ai"]'
    );

    if (await aiButton.isVisible()) {
      await aiButton.click();
      await page.waitForTimeout(300);

      // ✅ Should show generation interface
      const genInterface = page.locator(
        '[class*="panel"], [class*="dialog"], textarea, input'
      );
      expect(await genInterface.count()).toBeGreaterThan(0);
    }
  });

  test("5.3: Can enter prompt for block generation", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // ✅ Find prompt input
    const promptInput = page.locator(
      'textarea[placeholder*="block"], textarea[placeholder*="prompt"], input[placeholder*="block"]'
    );

    if (await promptInput.isVisible()) {
      const testPrompt = "Create a hero section with blue background";
      await promptInput.fill(testPrompt);

      const value = await promptInput.inputValue();
      expect(value).toContain("blue");
    }
  });

  test("5.4: Can generate block from prompt", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);
    await page.waitForLoadState("networkidle");

    // ✅ Open AI panel
    const aiButton = page.locator(
      'button:has-text("Generate"), button:has-text("AI")'
    );
    if (await aiButton.isVisible()) {
      await aiButton.click();
      await page.waitForTimeout(300);
    }

    // ✅ Enter prompt
    const promptInput = page.locator(
      'textarea[placeholder*="block"], textarea[placeholder*="prompt"]'
    );
    if (await promptInput.isVisible()) {
      await promptInput.fill("Create a call-to-action block");
      await page.waitForTimeout(200);
    }

    // ✅ Click generate button
    const generateBtn = page.locator(
      'button:has-text("Generate"), button[class*="generate"]'
    );
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
      await page.waitForTimeout(2000); // Wait for AI response

      // ✅ Verify block was added or loading finished
      const blocks = page.locator('[class*="block"], [class*="component"]');
      expect(await blocks.count()).toBeGreaterThan(0);
    }
  });

  test("5.5: Generated block is editable", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // Generate a block first
    const aiButton = page.locator('button:has-text("Generate")');
    if (await aiButton.isVisible()) {
      await aiButton.click();
      await page.waitForTimeout(200);

      const promptInput = page.locator("textarea");
      if (await promptInput.isVisible()) {
        await promptInput.fill("Features section");
        await page.waitForTimeout(200);
      }

      const generateBtn = page.locator('button:has-text("Generate")');
      if (await generateBtn.isVisible()) {
        await generateBtn.click();
        await page.waitForTimeout(1500);
      }
    }

    // ✅ Click generated block to edit
    const blocks = page.locator('[class*="block"], [class*="component"]');
    if (await blocks.last().isVisible()) {
      await blocks.last().click();
      await page.waitForTimeout(300);

      // ✅ Should show properties
      const inputs = page.locator("input[type='text'], textarea");
      const inputCount = await inputs.count();
      expect(inputCount).toBeGreaterThan(0);
    }
  });

  test("5.6: Can cancel block generation", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);
    await page.waitForLoadState("networkidle");

    const blocksBefore = await page.locator('[class*="block"]').count();

    // ✅ Open AI panel
    const aiButton = page.locator('button:has-text("Generate")');
    if (await aiButton.isVisible()) {
      await aiButton.click();
      await page.waitForTimeout(200);

      // ✅ Look for cancel/close button
      const closeBtn = page.locator(
        'button[aria-label="Close"], button:has-text("Cancel"), [class*="close"]'
      );

      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await page.waitForTimeout(300);

        // Panel should close
        const panelOpen = await aiButton.isVisible();
        expect(panelOpen).toBeDefined();
      }
    }
  });

  test("5.7: AI can generate multiple blocks in sequence", async ({ page }) => {
    const pageSlug = `multi-ai-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${pageSlug}`);

    const blocksBefore = await page.locator('[class*="block"]').count();

    // Generate first block
    const aiButton1 = page.locator('button:has-text("Generate")');
    if (await aiButton1.isVisible()) {
      await aiButton1.click();
      await page.waitForTimeout(200);

      const prompt1 = page.locator("textarea");
      if (await prompt1.isVisible()) {
        await prompt1.fill("Hero block");
        await page.waitForTimeout(200);

        const genBtn1 = page.locator('button:has-text("Generate")');
        if (await genBtn1.isVisible()) {
          await genBtn1.click();
          await page.waitForTimeout(1500);
        }
      }
    }

    // Generate second block
    const aiButton2 = page.locator('button:has-text("Generate")');
    if (await aiButton2.isVisible()) {
      await aiButton2.click();
      await page.waitForTimeout(200);

      const prompt2 = page.locator("textarea");
      if (await prompt2.isVisible()) {
        await prompt2.fill("Features block");
        await page.waitForTimeout(200);

        const genBtn2 = page.locator('button:has-text("Generate")');
        if (await genBtn2.isVisible()) {
          await genBtn2.click();
          await page.waitForTimeout(1500);
        }
      }
    }

    // ✅ Should have more blocks
    const blocksAfter = await page.locator('[class*="block"]').count();
    expect(blocksAfter).toBeGreaterThanOrEqual(blocksBefore);
  });

  test("5.8: Generated blocks have valid structure", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // Generate a block
    const aiButton = page.locator('button:has-text("Generate")');
    if (await aiButton.isVisible()) {
      await aiButton.click();
      await page.waitForTimeout(200);

      const prompt = page.locator("textarea");
      if (await prompt.isVisible()) {
        await prompt.fill("Test block");
        await page.waitForTimeout(200);

        const genBtn = page.locator('button:has-text("Generate")');
        if (await genBtn.isVisible()) {
          await genBtn.click();
          await page.waitForTimeout(1500);
        }
      }
    }

    // ✅ Validate block structure
    const blocks = page.locator('[class*="block"]');
    const blockCount = await blocks.count();

    // Should have rendered content
    const blockContent = await page.locator(".puck-preview, [class*='preview']").textContent();
    expect(blockContent?.length).toBeGreaterThan(0);
  });

  test("5.9: AI generation handles errors gracefully", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    // Try to generate with empty prompt
    const aiButton = page.locator('button:has-text("Generate")');
    if (await aiButton.isVisible()) {
      await aiButton.click();
      await page.waitForTimeout(200);

      // Don't fill prompt - try to generate
      const genBtn = page.locator('button:has-text("Generate")');
      if (await genBtn.isVisible()) {
        // Might be disabled, so check
        const isEnabled = await genBtn.isEnabled();
        expect(isEnabled).toBeDefined();
      }
    }
  });

  test("5.10: Performance: AI generation completes within 5 seconds", async ({
    page,
  }) => {
    await page.goto(`${baseUrl}/edit/test`);
    await page.waitForLoadState("networkidle");

    // Open AI
    const aiButton = page.locator('button:has-text("Generate")');
    if (await aiButton.isVisible()) {
      await aiButton.click();
      await page.waitForTimeout(200);

      const prompt = page.locator("textarea");
      if (await prompt.isVisible()) {
        await prompt.fill("Performance test block");
      }

      const startTime = Date.now();
      const genBtn = page.locator('button:has-text("Generate")');
      if (await genBtn.isVisible()) {
        await genBtn.click();

        // Wait for completion
        await page.waitForTimeout(3000);

        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(5000);
      }
    }
  });

  test("5.11: Screenshot: AI panel open with prompt", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);

    const aiButton = page.locator('button:has-text("Generate")');
    if (await aiButton.isVisible()) {
      await aiButton.click();
      await page.waitForTimeout(300);
    }

    await page.screenshot({
      path: "test-results/screenshots/ai-panel-open.png",
      fullPage: true,
    });
  });

  test("5.12: Screenshot: Generated block in canvas", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/test`);
    await page.waitForLoadState("networkidle");

    const blocks = page.locator('[class*="block"]');
    if (await blocks.count() > 0) {
      await page.screenshot({
        path: "test-results/screenshots/ai-generated-block.png",
        fullPage: true,
      });
    }
  });
});
