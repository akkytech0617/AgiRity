/* eslint-disable no-console */
import { test, expect } from '../fixtures/electron.fixture';

const APP_ROOT_SELECTOR = '[data-testid="app-root"]';

test.describe('Smoke Tests', () => {
  test('should launch app without console errors', async ({ app }) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const window = await app.firstWindow();

    // Monitor console for errors and warnings
    window.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error') {
        errors.push(text);
      }
      if (msg.type() === 'warning') {
        warnings.push(text);
      }
    });

    // Wait for app to fully initialize (React app rendered)
    await window.waitForSelector(APP_ROOT_SELECTOR);

    // Check for critical errors (including process.env errors)
    expect(
      errors.filter(
        (err) =>
          err.includes('process.env') ||
          err.includes('Maximum call stack') ||
          err.includes('Uncaught ReferenceError')
      )
    ).toHaveLength(0);

    console.log(`Warnings detected: ${warnings.length}`);
    if (warnings.length > 0) {
      console.log('Warnings:', warnings);
    }
  });

  test('should create main window', async ({ app }) => {
    const window = await app.firstWindow();
    const title = await window.title();

    // Should have a meaningful title
    expect(title).toContain('AgiRity');
  });

  test('should load renderer process successfully', async ({ app }) => {
    const window = await app.firstWindow();

    // Check if React app has loaded
    await window.waitForSelector(APP_ROOT_SELECTOR);

    // Verify app is interactive
    const appRoot = window.locator(APP_ROOT_SELECTOR);
    await expect(appRoot).toBeVisible();
  });
});

test.describe('Console Error Monitoring', () => {
  test('should detect process.env access errors', async ({ app }) => {
    const errors: string[] = [];

    const window = await app.firstWindow();

    window.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error') {
        errors.push(text);
      }
    });

    // Wait for app to be fully rendered
    await window.waitForSelector(APP_ROOT_SELECTOR);

    // Check specifically for process.env related errors
    const processEnvErrors = errors.filter((err) => err.includes('process.env'));

    if (processEnvErrors.length > 0) {
      console.log('Process.env errors detected:', processEnvErrors);
    }

    // Should not have process.env errors in renderer
    expect(processEnvErrors).toHaveLength(0);
  });

  test('should detect infinite recursion', async ({ app }) => {
    const errors: string[] = [];

    const window = await app.firstWindow();

    window.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error') {
        errors.push(text);
      }
    });

    // Wait for app to be fully rendered
    await window.waitForSelector(APP_ROOT_SELECTOR);

    // Check for stack overflow errors
    const stackOverflowErrors = errors.filter(
      (err) =>
        err.includes('Maximum call stack size exceeded') ||
        (err.includes('stack') && err.includes('overflow'))
    );

    if (stackOverflowErrors.length > 0) {
      console.log('Stack overflow errors detected:', stackOverflowErrors);
    }

    // Should not have stack overflow errors
    expect(stackOverflowErrors).toHaveLength(0);
  });
});

test.describe('Workspace Management', () => {
  test('should show initial app state', async ({ app, takeScreenshot }) => {
    const window = await app.firstWindow();

    await window.waitForSelector(APP_ROOT_SELECTOR);

    // Take screenshot to see what the app looks like
    await takeScreenshot(window, 'dev-app-state.png');

    // Get page title to verify we're on the right page
    const title = await window.title();
    console.log('Page title:', title);
  });
});
/* eslint-enable no-console */
