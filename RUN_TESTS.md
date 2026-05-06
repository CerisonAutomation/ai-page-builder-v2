# Running Playwright Tests — AI Page Builder V2

This guide covers everything you need to run the comprehensive test suite.

---

## Prerequisites

### System Requirements

- **Node.js:** 18+ (check: `node --version`)
- **npm:** 8+ (check: `npm --version`)
- **Disk Space:** 1GB+ for Playwright browsers
- **RAM:** 4GB+ recommended

### Installation

```bash
# 1. Navigate to project
cd ai-page-builder-v2

# 2. Install dependencies (if not already done)
npm install

# 3. Install Playwright
npm install -D @playwright/test

# 4. Install Playwright browsers (one-time)
npx playwright install

# Optional: Install Playwright system dependencies
npx playwright install-deps
```

---

## Starting the App

The test suite needs your app running. Playwright will start it automatically, but you can also start it manually:

```bash
# Start development server
npm run dev

# Should see:
# > ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

Leave this running in a separate terminal while running tests.

---

## Running Tests

### 1. Run All Tests

```bash
npm test
```

**What happens:**
- Playwright starts development server (if not running)
- Launches multiple browser instances
- Runs all 152+ tests in parallel
- Generates HTML report
- Exits when complete

**Time:** ~10-15 minutes (first run with browser installs)

---

### 2. Run Tests with UI (Recommended for First Time)

```bash
npm run test:ui
```

**Features:**
- Interactive test browser
- Watch mode (re-runs on file changes)
- Visual step-by-step playback
- Time-travel debugging
- Network/console inspection

**How to use:**
1. Choose test to run from sidebar
2. Click ▶️ to play
3. Click ⏸️ to pause
4. Click ↪️ to step back
5. View console/network in panels

---

### 3. Run Tests with Browser Visible

```bash
npm run test:headed
```

**What happens:**
- Browser window opens
- You see each test action in real-time
- Browser closes when tests complete

**Good for:**
- Debugging failures
- Understanding test flow
- Visual verification

---

### 4. Run Specific Test File

```bash
# Run homepage tests only
npm test 01-homepage.spec.ts

# Run editor tests
npm test 02-editor-page-load.spec.ts

# Run AI block generation tests
npm test 05-ai-block-generation.spec.ts

# Run all admin tests
npm test 09-admin-cms.spec.ts
```

---

### 5. Run Tests Matching Pattern

```bash
# Run all tests with "performance" in name
npm test -- --grep "performance"

# Run all tests with "AI" in name
npm test -- --grep "AI"

# Run all tests with "publish" in name
npm test -- --grep "publish"
```

---

### 6. Run Tests in Specific Browser

```bash
# Chrome only
npm test -- --project=chromium

# Firefox only
npm test -- --project=firefox

# Safari only
npm test -- --project=webkit

# Mobile Chrome only
npm test -- --project="Mobile Chrome"

# All browsers
npm test  # (default)
```

---

### 7. Debug Mode (Step-by-Step)

```bash
npm run test:debug
```

**Features:**
- Inspector opens
- Click each action to execute
- Inspect elements
- Type in console
- View source code

**Keyboard shortcuts:**
- `F10` - Next action
- `F9` - Previous action
- `Space` - Pause/Resume

---

### 8. Run Single Test

```bash
# Run specific test (requires full test name)
npm test -- --grep "Can save page changes"

# Run tests in specific file starting at line
npm test 07-save-publish.spec.ts -- --grep "save"
```

---

### 9. Run with Custom Base URL

```bash
# Test against different server
BASE_URL=http://localhost:3001 npm test

# Test against production (careful!)
BASE_URL=https://app.example.com npm test

# Test against staging
BASE_URL=https://staging.example.com npm test
```

---

### 10. Run Tests in Serial (One at a time)

```bash
# Run tests sequentially instead of parallel
npm test -- --workers=1
```

**Use when:**
- Database conflicts
- Shared resources
- Need deterministic output
- Debugging timing issues

---

## Viewing Results

### View Interactive HTML Report

```bash
npm run test:report
```

**Opens browser with:**
- Test timeline
- Screenshots
- Video playback
- Network traces
- Console logs
- Timing breakdown

### View Results in Terminal

After tests complete, you'll see summary:

```
✓ 152 passed (2m45s)
✗ 0 failed
⊘ 0 skipped

Artifacts saved to test-results/
```

---

## Test Reports Location

All reports saved to:

```
project-root/
├── test-results/
│   ├── results.json          # Raw data
│   ├── results.xml           # JUnit format
│   └── screenshots/          # Failure screenshots
│       ├── homepage-full.png
│       ├── editor-full.png
│       └── ...
└── playwright-report/
    └── index.html            # Main report
```

---

## Troubleshooting

### Tests Timeout

**Problem:** Tests timeout with "Timeout of 30000ms exceeded"

**Solutions:**
```bash
# Increase timeout for all tests
npm test -- --timeout=60000

# Run with single worker (less resource contention)
npm test -- --workers=1

# Check if server is running
# In another terminal: npm run dev
```

### Browser Crash

**Problem:** "Browser process exited unexpectedly"

**Solutions:**
```bash
# Update Playwright
npm install -D @playwright/test@latest
npx playwright install

# Clear Playwright cache
rm -rf ~/.cache/ms-playwright

# Run in debug mode to see error
npm run test:debug
```

### "Base URL not working"

**Problem:** Tests can't reach `http://localhost:3000`

**Solutions:**
```bash
# 1. Start server
npm run dev

# 2. Or specify custom URL
BASE_URL=http://localhost:3001 npm test

# 3. Check server is actually running
curl http://localhost:3000
```

### Selector Not Found

**Problem:** "locator.click: Target closed" or "locator not found"

**Solutions:**
1. Use UI mode to inspect:
   ```bash
   npm run test:ui
   ```

2. Add better wait:
   ```typescript
   await element.waitFor({ state: 'visible' });
   ```

3. Update selector:
   ```typescript
   // Instead of: page.locator('button')
   // Use: page.locator('button:has-text("Save")')
   ```

### Port Already in Use

**Problem:** "Error: listen EADDRINUSE :::3000"

**Solutions:**
```bash
# Kill process using port 3000 (Mac/Linux)
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or use different port
npm run dev -- -p 3001
BASE_URL=http://localhost:3001 npm test

# Windows: Use Task Manager to kill Node.exe
```

### Tests Run Too Slowly

**Problem:** Tests complete but take 20+ minutes

**Solutions:**
```bash
# Run with more workers
npm test -- --workers=4

# Run on fast SSD (if possible)

# Skip video/trace for speed
# Edit playwright.config.ts:
# video: "off"
# trace: "off"
```

---

## CI/CD Integration Examples

### GitHub Actions

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"
      
      - run: npm install
      - run: npx playwright install --with-deps
      
      - run: npm test
      
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### GitLab CI

```yaml
e2e-tests:
  image: mcr.microsoft.com/playwright:v1.40.0-jammy
  script:
    - npm install
    - npm test
  artifacts:
    paths:
      - playwright-report/
    when: always
  only:
    - merge_requests
    - main
```

### Jenkins

```groovy
pipeline {
  agent any
  
  stages {
    stage('Test') {
      steps {
        sh 'npm install'
        sh 'npx playwright install --with-deps'
        sh 'npm test'
      }
    }
    
    stage('Report') {
      steps {
        junit 'test-results/results.xml'
        publishHTML([
          reportDir: 'playwright-report',
          reportFiles: 'index.html',
          reportName: 'Playwright Report'
        ])
      }
    }
  }
}
```

---

## Advanced Usage

### Run Tests with Custom Environment

```bash
# Set environment variables
export HEADLESS=false
export DEBUG=pw:api
npm test

# Or inline
DEBUG=pw:api npm test
```

### Filter Tests by Tag

```bash
# Tests can be tagged with @tag
# @smoke, @critical, @performance, etc.

# Run critical tests only
npm test -- --grep "@critical"

# Run smoke tests
npm test -- --grep "@smoke"
```

### Run Tests Against Specific Page

```bash
# Edit test to use specific slug
# Then run:
npm test -- --grep "specific-test-name"
```

### Capture Network Traffic

Tests automatically record network in video.
View in HTML report after failures.

### Generate Coverage Report

```bash
# Note: Playwright doesn't generate code coverage by default
# For coverage, you'd need to integrate with Istanbul/nyc
# This is typically done at integration/unit test level

npm test  # View results in playwright-report/
```

---

## Performance Tips

### Make Tests Faster

1. **Use single worker for specific test:**
   ```bash
   npm test -- --workers=1 01-homepage.spec.ts
   ```

2. **Run critical tests only:**
   ```bash
   npm test -- --grep "critical"
   ```

3. **Disable videos:**
   ```bash
   # Edit playwright.config.ts
   # video: "off"
   ```

4. **Disable traces:**
   ```bash
   # Edit playwright.config.ts
   # trace: "off"
   ```

5. **Use headless mode (default):**
   ```bash
   npm test  # (headless is default)
   ```

---

## Common Commands Quick Reference

```bash
# Install & setup
npm install
npx playwright install

# Run tests
npm test                        # All tests
npm run test:ui                 # Interactive mode
npm run test:headed             # See browser
npm run test:debug              # Step through
npm run test:report             # View results

# Specific tests
npm test 01-homepage.spec.ts    # Single file
npm test -- --grep "save"       # Pattern match
npm test -- --project=firefox   # Browser

# Advanced
BASE_URL=http://localhost:3001 npm test  # Custom URL
npm test -- --workers=1                  # Serial
npm test -- --timeout=60000              # More time
```

---

## Performance Baseline

Expected test execution times:

| Scenario | Time |
|----------|------|
| All tests (parallel, 4 workers) | 10-15 min |
| All tests (serial, 1 worker) | 25-35 min |
| Single test file | 2-3 min |
| Quick smoke tests (@smoke) | 2-5 min |
| Debug mode (interactive) | As long as you need |

---

## Monitoring Test Health

### Weekly Maintenance

```bash
# Run full test suite
npm test

# Check for new failures
npm run test:report

# Update snapshots if needed
npm test -- --update-snapshots
```

### Monthly Reviews

1. Update Playwright if new version available
2. Review and update slow selectors
3. Add tests for new features
4. Remove tests for deprecated features

---

## Getting Help

### Debug Information to Collect

When reporting test failures:

1. **Test name and file:**
   ```
   e2e/01-homepage.spec.ts > 1.1: Homepage loads successfully
   ```

2. **Error message:**
   ```
   Timeout: 30000ms exceeded
   ```

3. **Screenshot:**
   ```
   From: test-results/screenshots/error-*.png
   ```

4. **Environment:**
   ```
   Node: 18.17.0
   OS: macOS 14.0
   ```

### Useful Commands for Debugging

```bash
# Verbose logging
DEBUG=pw:api npm test

# Check Playwright version
npx playwright --version

# List all tests
npm test -- --list

# Show test reporter options
npx playwright test --help
```

---

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Install Playwright: `npx playwright install`
3. ✅ Run interactive mode: `npm run test:ui`
4. ✅ Review results: `npm run test:report`
5. ✅ Read test documentation: See `e2e/README.md`

---

## Support

- 📚 [Playwright Docs](https://playwright.dev)
- 🎯 [API Reference](https://playwright.dev/docs/api/class-test)
- 🐛 [Common Issues](https://playwright.dev/docs/troubleshooting)
- 💬 [GitHub Discussions](https://github.com/microsoft/playwright/discussions)

---

**Last Updated:** May 6, 2026  
**Playwright:** 1.40.0+  
**Status:** Ready to Run ✅
