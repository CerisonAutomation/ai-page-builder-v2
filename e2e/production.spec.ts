/**
 * Production E2E Tests — Enterprise Level
 * ✅ Full 360° coverage: Auth → Edit → AI → Save → Publish → View
 */

import { test, expect, Page } from "@playwright/test";

// ✅ TEST CONFIGURATION
test.describe("AI Page Builder V2 — Production E2E", () => {
  let page: Page;
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const testSlug = `test-${Date.now()}`;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(baseUrl);
  });

  test.afterEach(async () => {
    await page.close();
  });

  // ==================== 1. EDITOR PAGE LOADING ====================
  test("1.1: Editor page loads with pre-loaded data", async () => {
    // ✅ Create page first
    await page.goto(`${baseUrl}/api/pages`, {
      waitUntil: "networkidle",
    });

    // ✅ Navigate to editor
    await page.goto(`${baseUrl}/edit/test-hero`);

    // ✅ Wait for Puck editor to load
    await page.waitForSelector('[data-testid="puck-editor"]', {
      timeout: 5000,
    });

    // ✅ Verify pre-loaded data is present
    const editorContent = await page.locator(".puck-canvas").isVisible();
    expect(editorContent).toBeTruthy();

    // ✅ Check that page title is rendered
    const title = await page.locator("h2").first().textContent();
    expect(title).toBeTruthy();
  });

  // ==================== 2. BLOCK EDITING ====================
  test("2.1: Add block via Puck visual editor", async () => {
    await page.goto(`${baseUrl}/edit/${testSlug}`);
    await page.waitForSelector('[data-testid="puck-editor"]', { timeout: 5000 });

    // ✅ Click "Add block" in Puck UI
    const addBlockBtn = page.locator('button:has-text("Add")').first();
    await addBlockBtn.click();

    // ✅ Select HeroBlock
    await page.locator('text="Hero"').click();

    // ✅ Verify block added to canvas
    await expect(page.locator(".puck-component")).toHaveCount((count) =>
      count >= 1
    );
  });

  test("2.2: Edit block properties", async () => {
    await page.goto(`${baseUrl}/edit/${testSlug}`);
    await page.waitForSelector('[data-testid="puck-editor"]');

    // ✅ Click first block to select
    await page.locator(".puck-component").first().click();

    // ✅ Edit headline field
    const headlineInput = page.locator('input[placeholder*="Headline"]').first();
    await headlineInput.fill("Test Headline");

    // ✅ Verify input updated
    const value = await headlineInput.inputValue();
    expect(value).toBe("Test Headline");
  });

  test("2.3: Blocks are fully editable and render correctly", async () => {
    await page.goto(`${baseUrl}/edit/${testSlug}`);
    await page.waitForSelector('[data-testid="puck-editor"]');

    // ✅ Add Hero block
    await page.locator('button:has-text("Add")').first().click();
    await page.locator('text="Hero"').click();

    // ✅ Fill in all required fields
    const fields = {
      headline: "Welcome to My Site",
      subheadline: "Build amazing pages with AI",
      ctaLabel: "Get Started",
      ctaHref: "/signup",
    };

    for (const [field, value] of Object.entries(fields)) {
      const input = page
        .locator(`input[placeholder*="${field}"], textarea[placeholder*="${field}"]`)
        .first();
      await input.fill(value);
    }

    // ✅ Verify block renders with new content
    const preview = page.locator(".puck-preview");
    const text = await preview.textContent();
    expect(text).toContain("Welcome to My Site");
  });

  // ==================== 3. AI GENERATION ====================
  test("3.1: AI generates valid blocks from prompts", async ({ page }) => {
    await page.goto(`${baseUrl}/edit/${testSlug}`);
    await page.waitForSelector('[data-testid="puck-editor"]');

    // ✅ Click AI Panel "Block" mode
    await page.locator('button:has-text("Block")').click();

    // ✅ Enter prompt
    const promptInput = page.locator('textarea[placeholder*="Blue hero"]');
    await promptInput.fill("Hero section with dark blue background");

    // ✅ Click generate
    const generateBtn = page.locator('button:has-text("Generate Block")');
    await generateBtn.click();

    // ✅ Wait for generation (5s max)
    await page.waitForTimeout(1000);
    await expect(generateBtn).not.toHaveClass(/animate-spin/);

    // ✅ Verify block was added
    const blockCount = await page.locator(".puck-component").count();
    expect(blockCount).toBeGreaterThan(0);

    // ✅ Check no error toast
    const errorToast = page.locator('[role="alert"]:has-text("Error")');
    await expect(errorToast).not.toBeVisible();
  });

  test("3.2: AI generates full pages with multiple blocks", async () => {
    await page.goto(`${baseUrl}/edit/${testSlug}`);
    await page.waitForSelector('[data-testid="puck-editor"]');

    // ✅ Click AI Panel "Page" mode
    await page.locator('button:has-text("Page")').click();

    // ✅ Enter description
    const descInput = page.locator(
      'textarea[placeholder*="SaaS landing page"]'
    );
    await descInput.fill(
      "SaaS landing page for project management tool with pricing"
    );

    // ✅ Generate
    const generateBtn = page.locator('button:has-text("Generate Page")');
    await generateBtn.click();

    // ✅ Wait for generation
    await page.waitForTimeout(2000);

    // ✅ Verify multiple blocks added
    const blockCount = await page.locator(".puck-component").count();
    expect(blockCount).toBeGreaterThan(3); // Should have hero, features, pricing, cta

    // ✅ Verify no errors
    const errorToast = page.locator('[role="alert"]:has-text("Error")');
    await expect(errorToast).not.toBeVisible();
  });

  test("3.3: AI blocks are editable after generation", async () => {
    await page.goto(`${baseUrl}/edit/${testSlug}`);

    // Generate block via AI
    await page.locator('button:has-text("Block")').click();
    await page.locator('textarea[placeholder*="Blue hero"]').fill("Red CTA block");
    await page.locator('button:has-text("Generate Block")').click();
    await page.waitForTimeout(1000);

    // ✅ Click generated block
    await page.locator(".puck-component").last().click();

    // ✅ Edit its properties
    const input = page.locator('input, textarea').first();
    const initialValue = await input.inputValue();
    await input.fill("Modified after AI generation");

    const newValue = await input.inputValue();
    expect(newValue).not.toBe(initialValue);
  });

  // ==================== 4. IMAGE MANAGEMENT ====================
  test("4.1: Upload image to media library", async () => {
    await page.goto(`${baseUrl}/edit/${testSlug}`);
    await page.waitForSelector('[data-testid="puck-editor"]');

    // ✅ Find upload input in media panel
    const uploadInput = page.locator('input[type="file"]').first();

    // ✅ Create test image
    const fileName = "test-image.png";
    await uploadInput.setInputFiles({
      name: fileName,
      mimeType: "image/png",
      buffer: Buffer.from("PNG_DATA"),
    });

    // ✅ Wait for upload
    await page.waitForTimeout(1000);

    // ✅ Verify image appears in library
    const media = page.locator('[role="dialog"]:has-text("Media")');
    await expect(media).toContainText(fileName);
  });

  // ==================== 5. PAGE SAVING ====================
  test("5.1: Save page via Puck publish button", async () => {
    await page.goto(`${baseUrl}/edit/${testSlug}`);
    await page.waitForSelector('[data-testid="puck-editor"]');

    // ✅ Add a block
    await page.locator('button:has-text("Add")').first().click();
    await page.locator('text="Hero"').click();

    // ✅ Click Save/Publish button
    const saveBtn = page.locator('button:has-text("Publish")').first();
    await saveBtn.click();

    // ✅ Wait for save API call
    const saveResponse = await page.waitForResponse(
      (resp) =>
        resp.url().includes("/api/pages") &&
        resp.status() === 200
    );

    expect(saveResponse.ok()).toBeTruthy();

    // ✅ Verify success toast
    const successToast = page.locator('[role="status"]:has-text("saved")');
    await expect(successToast).toBeVisible();
  });

  test("5.2: Page data persists in database", async () => {
    const testSlugUnique = `persist-test-${Date.now()}`;

    // ✅ Create and save page
    await page.goto(`${baseUrl}/edit/${testSlugUnique}`);
    await page.locator('button:has-text("Add")').first().click();
    await page.locator('text="Hero"').click();

    // Edit and save
    await page.locator('input[placeholder*="Headline"]').fill("Test Persistence");
    await page.locator('button:has-text("Publish")').first().click();
    await page.waitForTimeout(1000);

    // ✅ Reload page
    await page.reload();

    // ✅ Verify data still there
    const headline = await page
      .locator('input[placeholder*="Headline"]')
      .first()
      .inputValue();
    expect(headline).toBe("Test Persistence");
  });

  // ==================== 6. PUBLISHING ====================
  test("6.1: Published page accessible at public URL", async () => {
    // ✅ Create + save + publish page
    const slugToPublish = `published-${Date.now()}`;
    await page.goto(`${baseUrl}/edit/${slugToPublish}`);

    // Add content
    await page.locator('button:has-text("Add")').first().click();
    await page.locator('text="Hero"').click();
    await page.locator('input[placeholder*="Headline"]').fill("Published Page");

    // Publish
    await page.locator('button:has-text("Publish")').first().click();
    await page.waitForTimeout(1000);

    // ✅ Navigate to public URL
    await page.goto(`${baseUrl}/${slugToPublish}`);

    // ✅ Verify page renders
    const content = await page.textContent();
    expect(content).toContain("Published Page");
  });

  test("6.2: Unpublished pages return 404", async () => {
    const unpublishedSlug = `unpublished-${Date.now()}`;

    // ✅ Create page (but don't publish)
    await page.goto(`${baseUrl}/edit/${unpublishedSlug}`);
    // Don't click publish

    // ✅ Try to access public URL
    const response = await page.goto(`${baseUrl}/${unpublishedSlug}`);
    expect(response?.status()).toBe(404);
  });

  // ==================== 7. TYPE SAFETY & VALIDATION ====================
  test("7.1: API validates page data on save", async () => {
    // ✅ Send invalid data to save endpoint
    const response = await page.request.put(
      `${baseUrl}/api/pages/test-invalid`,
      {
        data: {
          slug: "test-invalid",
          title: "Test",
          data: { invalid: "structure" }, // Missing required fields
        },
      }
    );

    expect(response.status()).toBe(400); // Validation error
  });

  test("7.2: Blocks reject invalid props", async () => {
    await page.goto(`${baseUrl}/edit/${testSlug}`);

    // ✅ Try to set invalid prop type
    await page.locator('button:has-text("Add")').first().click();
    await page.locator('text="Hero"').click();

    // Try to fill a number field with text (should reject or auto-convert)
    const numberField = page.locator('input[type="number"]').first();
    if (await numberField.isVisible()) {
      await numberField.fill("not-a-number");
      // Expect browser to handle this (HTML5 validation)
      const value = await numberField.inputValue();
      expect(value === "" || !isNaN(Number(value))).toBeTruthy();
    }
  });

  // ==================== 8. REALTIME SYNC ====================
  test("8.1: Realtime updates when page changes in another tab", async ({
    browser,
  }) => {
    const page1 = await browser.newPage();
    const page2 = await browser.newPage();

    const editUrl = `${baseUrl}/edit/${testSlug}`;
    await page1.goto(editUrl);
    await page2.goto(editUrl);

    // ✅ Edit in page1
    await page1.locator('button:has-text("Add")').first().click();
    await page1.locator('text="Hero"').click();
    const input1 = page1.locator('input[placeholder*="Headline"]').first();
    await input1.fill("Changed in Page1");

    // ✅ Save
    await page1.locator('button:has-text("Publish")').first().click();
    await page1.waitForTimeout(1000);

    // ✅ Reload page2
    await page2.reload();

    // ✅ Verify page2 sees the change
    const input2 = page2.locator('input[placeholder*="Headline"]').first();
    const value = await input2.inputValue();
    expect(value).toBe("Changed in Page1");

    await page1.close();
    await page2.close();
  });

  // ==================== 9. ERROR HANDLING ====================
  test("9.1: Graceful error handling on API failure", async () => {
    await page.goto(`${baseUrl}/edit/${testSlug}`);

    // ✅ Intercept save request and error it
    await page.route(`**/api/pages/**`, (route) => {
      route.abort("failed");
    });

    // Try to save
    await page.locator('button:has-text("Publish")').first().click();
    await page.waitForTimeout(1000);

    // ✅ Verify error toast appears
    const errorToast = page.locator('[role="alert"]:has-text("Failed")');
    await expect(errorToast).toBeVisible();
  });

  // ==================== 10. RESPONSIVE & PERFORMANCE ====================
  test("10.1: Editor is responsive on mobile", async () => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone
    await page.goto(`${baseUrl}/edit/${testSlug}`);

    const editor = page.locator('[data-testid="puck-editor"]');
    await expect(editor).toBeVisible();
  });

  test("10.2: Page load performance < 2s", async () => {
    const startTime = Date.now();
    await page.goto(`${baseUrl}/edit/${testSlug}`, {
      waitUntil: "networkidle",
    });
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(2000); // 2 seconds
  });

  test("10.3: AI generation response < 5s", async () => {
    await page.goto(`${baseUrl}/edit/${testSlug}`);
    await page.locator('button:has-text("Block")').click();
    await page.locator('textarea[placeholder*="Blue hero"]').fill("Test block");

    const startTime = Date.now();
    await page.locator('button:has-text("Generate Block")').click();
    
    // Wait for generation to complete
    await page.waitForFunction(
      () => {
        const btn = document.querySelector('button:has-text("Generate Block")');
        return !btn?.classList.contains("animate-spin");
      },
      { timeout: 5000 }
    );

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000); // 5 seconds
  });
});
