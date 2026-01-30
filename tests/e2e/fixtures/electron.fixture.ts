/* eslint-disable no-empty-pattern, react-hooks/rules-of-hooks */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test as base, _electron as electron } from '@playwright/test';
import type { ElectronApplication, Page } from 'playwright';

/**
 * Screenshot helper type
 * Simplifies screenshot capture with centralized path management
 */
type ScreenshotHelper = (page: Page, filename: string) => Promise<void>;

const SCREENSHOT_OUTPUT_DIR = 'tests/results/e2e/ss';
const MAIN_ENTRY_PATH = 'dist-electron/main/index.js';
const ELECTRON_LAUNCH_TIMEOUT_MS = 30000;

/**
 * Create a unique test config directory for isolation
 * Uses tmpdir + process ID + timestamp to ensure uniqueness across parallel runs
 */
function createTestConfigDir(): string {
  const testDir = path.join(os.tmpdir(), 'agirity-e2e-test', `${process.pid}-${Date.now()}`);
  fs.mkdirSync(testDir, { recursive: true });
  return testDir;
}

/**
 * Clean up test config directory after test completion
 */
function cleanupTestConfigDir(testDir: string): void {
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors - OS will clean tmpdir eventually
  }
}

/**
 * Electron E2E Test Fixture (Development Mode)
 *
 * This fixture launches Electron directly from the development build
 * (dist-electron/main/index.js) for faster test execution.
 *
 * For packaged app testing, use a separate fixture with findLatestBuild().
 *
 * This fixture provides:
 * - app: ElectronApplication instance with isolated test data directory
 * - takeScreenshot: Helper function for capturing screenshots with centralized path
 *
 * Test data isolation:
 * - Each test run uses a unique temporary directory for workspace data
 * - AGIRITY_CONFIG_DIR environment variable is set to isolate test data
 * - Directory is automatically cleaned up after test completion
 *
 * Usage:
 *   test('example', async ({ app, takeScreenshot }) => {
 *     const window = await app.firstWindow();
 *     await takeScreenshot(window, 'example.png');
 *   });
 */
export const test = base.extend<{
  app: ElectronApplication;
  takeScreenshot: ScreenshotHelper;
}>({
  app: async ({}, use) => {
    // Validate that build exists before launching
    if (!fs.existsSync(MAIN_ENTRY_PATH)) {
      throw new Error(
        `Build not found at ${MAIN_ENTRY_PATH}. ` +
          'Please run "npm run prebuild:e2e" or "tsc && vite build" before running E2E tests.'
      );
    }

    // Create isolated test config directory
    const testConfigDir = createTestConfigDir();

    const electronApp = await electron.launch({
      args: [MAIN_ENTRY_PATH],
      env: {
        ...process.env,
        AGIRITY_CONFIG_DIR: testConfigDir,
      },
      timeout: ELECTRON_LAUNCH_TIMEOUT_MS,
    });

    await use(electronApp);
    await electronApp.close();

    // Clean up test data
    cleanupTestConfigDir(testConfigDir);
  },

  takeScreenshot: async ({}, use) => {
    // Ensure screenshot directory exists
    if (!fs.existsSync(SCREENSHOT_OUTPUT_DIR)) {
      fs.mkdirSync(SCREENSHOT_OUTPUT_DIR, { recursive: true });
    }

    const helper: ScreenshotHelper = async (page, filename) => {
      await page.screenshot({ path: path.join(SCREENSHOT_OUTPUT_DIR, filename) });
    };
    await use(helper);
  },
});

export { expect } from '@playwright/test';
/* eslint-enable no-empty-pattern, react-hooks/rules-of-hooks */
