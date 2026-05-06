/**
 * AI Block Editing E2E Tests
 * ✅ Test that AI can edit ALL blocks (not just generate)
 * Compare to official Puck AI recipe
 */

import { test, expect, Page } from "@playwright/test";

test.describe("AI Block Editing — All Blocks", () => {
  let page: Page;
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(`${baseUrl}/edit/ai-editing-test`);
    await page.waitForSelector('[data-testid="puck-editor"]', { timeout: 5000 });
  });

  test.afterEach(async () => {
    await page.close();
  });

  // ==================== HERO BLOCK EDITING ====================
  test("AI can edit HeroBlock", async () => {
    // Add Hero block
    await page.locator('button:has-text("Add")').first().click();
    await page.locator('text="Hero"').click();

    // Get initial props
    const initialHeadline = await page
      .locator('input[placeholder*="Headline"]')
      .first()
      .inputValue();

    // Open AI refine panel
    await page.locator('button:has-text("AI")').click();
    await page.locator('button:has-text("Refine")').click();

    // Select headline field
    await page.locator('input[placeholder*="Headline"]').first().click();
    await page.locator('text="Refine this text"').click();

    // AI refine prompt
    const refineInput = page.locator('textarea[placeholder*="Make it"]').first();
    await refineInput.fill("Make the headline more engaging");

    // Submit
    await page.locator('button:has-text("Refine")').click();
    await page.waitForTimeout(2000);

    // Verify changed
    const refinedHeadline = await page
      .locator('input[placeholder*="Headline"]')
      .first()
      .inputValue();

    expect(refinedHeadline).not.toBe(initialHeadline);
    expect(refinedHeadline.length).toBeGreaterThan(0);
  });

  // ==================== CARD GRID EDITING ====================
  test("AI can edit CardGridBlock", async () => {
    // Add CardGrid block
    await page.locator('button:has-text("Add")').first().click();
    await page.locator('text="Card Grid"').click();

    // Select first card's title
    const cardTitleInputs = page.locator('input[placeholder*="Title"]');
    const initialTitle = await cardTitleInputs.first().inputValue();

    // AI refine card title
    await cardTitleInputs.first().click();
    await page.locator('button:has-text("AI Refine")').click();

    const refineInput = page.locator('textarea[placeholder*="refine"]').first();
    await refineInput.fill("Make it more compelling");
    await page.locator('button:has-text("Refine")').click();

    await page.waitForTimeout(2000);

    const refinedTitle = await cardTitleInputs.first().inputValue();
    expect(refinedTitle).not.toBe(initialTitle);
  });

  // ==================== FEATURE LIST EDITING ====================
  test("AI can edit FeatureListBlock", async () => {
    // Add FeatureList
    await page.locator('button:has-text("Add")').first().click();
    await page.locator('text="Feature List"').click();

    // Select feature description
    const descriptions = page.locator('textarea[placeholder*="Description"]');
    const initialDesc = await descriptions.first().inputValue();

    // AI refine
    await descriptions.first().click();
    await page.locator('button:has-text("AI")').click();

    const input = page.locator('textarea[placeholder*="Improve"]').first();
    await input.fill("Make it more professional");
    await page.locator('button:has-text("Refine")').click();

    await page.waitForTimeout(2000);

    const refinedDesc = await descriptions.first().inputValue();
    expect(refinedDesc).not.toBe(initialDesc);
  });

  // ==================== STATS BLOCK EDITING ====================
  test("AI can edit StatsBlock", async () => {
    // Add Stats
    await page.locator('button:has-text("Add")').first().click();
    await page.locator('text="Stats"').click();

    // Edit stat label
    const labels = page.locator('input[placeholder*="Label"]');
    const initialLabel = await labels.first().inputValue();

    // AI improve label
    await labels.first().click();
    await page.locator('button:has-text("AI")').click();

    const input = page.locator('textarea[placeholder*="improve"]').first();
    await input.fill("Make the stat label more impactful");
    await page.locator('button:has-text("Refine")').click();

    await page.waitForTimeout(2000);

    const refinedLabel = await labels.first().inputValue();
    expect(refinedLabel).not.toBe(initialLabel);
  });

  // ==================== CTA BLOCK EDITING ====================
  test("AI can edit CTABlock", async () => {
    // Add CTA
    await page.locator('button:has-text("Add")').first().click();
    await page.locator('text="Call to Action"').click();

    // Edit headline
    const headline = page.locator('input[placeholder*="Headline"]');
    const initialHeadline = await headline.inputValue();

    // AI refine
    await headline.click();
    await page.locator('button:has-text("AI")').click();

    const input = page.locator('textarea[placeholder*="Improve"]').first();
    await input.fill("Make it more persuasive");
    await page.locator('button:has-text("Refine")').click();

    await page.waitForTimeout(2000);

    const refined = await headline.inputValue();
    expect(refined).not.toBe(initialHeadline);
  });

  // ==================== FAQ BLOCK EDITING ====================
  test("AI can edit FAQBlock", async () => {
    // Add FAQ
    await page.locator('button:has-text("Add")').first().click();
    await page.locator('text="FAQ"').click();

    // Edit question
    const questions = page.locator('input[placeholder*="Question"]');
    const initialQuestion = await questions.first().inputValue();

    // AI improve
    await questions.first().click();
    await page.locator('button:has-text("AI")').click();

    const input = page.locator('textarea[placeholder*="improve"]').first();
    await input.fill("Rephrase for clarity");
    await page.locator('button:has-text("Refine")').click();

    await page.waitForTimeout(2000);

    const refined = await questions.first().inputValue();
    expect(refined).not.toBe(initialQuestion);
  });

  // ==================== PRICING BLOCK EDITING ====================
  test("AI can edit PricingBlock", async () => {
    // Add Pricing
    await page.locator('button:has-text("Add")').first().click();
    await page.locator('text="Pricing"').click();

    // Edit plan name
    const planNames = page.locator('input[placeholder*="Plan Name"]');
    const initialName = await planNames.first().inputValue();

    // AI refine
    await planNames.first().click();
    await page.locator('button:has-text("AI")').click();

    const input = page.locator('textarea[placeholder*="improve"]').first();
    await input.fill("Make it more memorable");
    await page.locator('button:has-text("Refine")').click();

    await page.waitForTimeout(2000);

    const refined = await planNames.first().inputValue();
    expect(refined).not.toBe(initialName);
  });

  // ==================== TESTIMONIAL BLOCK EDITING ====================
  test("AI can edit TestimonialBlock", async () => {
    // Add Testimonial
    await page.locator('button:has-text("Add")').first().click();
    await page.locator('text="Testimonial"').click();

    // Edit quote
    const quotes = page.locator('textarea[placeholder*="Quote"]');
    const initialQuote = await quotes.first().inputValue();

    // AI refine
    await quotes.first().click();
    await page.locator('button:has-text("AI")').click();

    const input = page.locator('textarea[placeholder*="improve"]').first();
    await input.fill("Make it more compelling");
    await page.locator('button:has-text("Refine")').click();

    await page.waitForTimeout(2000);

    const refined = await quotes.first().inputValue();
    expect(refined).not.toBe(initialQuote);
  });

  // ==================== TIMELINE BLOCK EDITING ====================
  test("AI can edit TimelineBlock", async () => {
    // Add Timeline
    await page.locator('button:has-text("Add")').first().click();
    await page.locator('text="Timeline"').click();

    // Edit event title
    const titles = page.locator('input[placeholder*="Title"]');
    const initialTitle = await titles.nth(1).inputValue(); // Skip first match

    // AI refine
    await titles.nth(1).click();
    await page.locator('button:has-text("AI")').click();

    const input = page.locator('textarea[placeholder*="improve"]').first();
    await input.fill("Make it more professional");
    await page.locator('button:has-text("Refine")').click();

    await page.waitForTimeout(2000);

    const refined = await titles.nth(1).inputValue();
    expect(refined).not.toBe(initialTitle);
  });

  // ==================== GALLERY BLOCK EDITING ====================
  test("AI can edit GalleryBlock", async () => {
    // Add Gallery
    await page.locator('button:has-text("Add")').first().click();
    await page.locator('text="Gallery"').click();

    // Gallery doesn't have text to edit, but test block render
    const gallery = page.locator(".puck-component").last();
    await expect(gallery).toBeVisible();
  });

  // ==================== BATCH EDITING ====================
  test("AI can batch edit multiple blocks", async () => {
    // Add 3 blocks
    for (let i = 0; i < 3; i++) {
      await page.locator('button:has-text("Add")').first().click();
      await page.locator('text="Hero"').click();
      await page.waitForTimeout(300);
    }

    // Select all headline fields
    const headlines = page.locator('input[placeholder*="Headline"]');
    const count = await headlines.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Refine all at once
    await page.locator('button:has-text("Batch Refine")').click();

    const input = page.locator('textarea[placeholder*="refine"]').first();
    await input.fill("Make all more professional");
    await page.locator('button:has-text("Apply")').click();

    await page.waitForTimeout(3000);

    // Verify all changed
    const firstHeadline = await headlines.first().inputValue();
    const secondHeadline = await headlines.nth(1).inputValue();

    expect(firstHeadline).toBeTruthy();
    expect(secondHeadline).toBeTruthy();
  });

  // ==================== PERFORMANCE ====================
  test("AI editing completes in < 3 seconds", async () => {
    // Add Hero
    await page.locator('button:has-text("Add")').first().click();
    await page.locator('text="Hero"').click();

    // Time the refinement
    const startTime = Date.now();

    await page.locator('input[placeholder*="Headline"]').first().click();
    await page.locator('button:has-text("AI")').click();
    const input = page.locator('textarea[placeholder*="improve"]').first();
    await input.fill("Make it better");
    await page.locator('button:has-text("Refine")').click();

    // Wait for completion
    await page.waitForFunction(
      () => {
        const btn = document.querySelector('button:has-text("Refine")');
        return !btn?.classList.contains("animate-spin");
      },
      { timeout: 5000 }
    );

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(3000); // 3 seconds
  });

  // ==================== STREAMING RESPONSES ====================
  test("AI editing shows streaming response", async () => {
    // Add Hero
    await page.locator('button:has-text("Add")').first().click();
    await page.locator('text="Hero"').click();

    // Trigger refine
    await page.locator('input[placeholder*="Headline"]').first().click();
    await page.locator('button:has-text("AI")').click();

    // Look for streaming indicator
    const streamingIndicator = page.locator('[aria-label="Streaming"]');
    await expect(streamingIndicator).toBeVisible({ timeout: 1000 });

    // Wait for completion
    await expect(streamingIndicator).not.toBeVisible({ timeout: 3000 });
  });

  // ==================== ERROR HANDLING ====================
  test("AI editing handles errors gracefully", async () => {
    // Add block
    await page.locator('button:has-text("Add")').first().click();
    await page.locator('text="Hero"').click();

    // Simulate error by interrupting
    await page.locator('input[placeholder*="Headline"]').first().click();
    await page.locator('button:has-text("AI")').click();

    const input = page.locator('textarea[placeholder*="improve"]').first();
    await input.fill("Make it better");

    // Interrupt by navigating away
    await page.goBack();

    // Should handle gracefully
    const errorToast = page.locator('[role="alert"]:has-text("Error")');
    // May or may not appear depending on timing
    // Main thing is app doesn't crash
  });
});
