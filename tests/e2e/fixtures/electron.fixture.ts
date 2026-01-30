/* eslint-disable no-empty-pattern, react-hooks/rules-of-hooks */

import fs from 'node:fs';
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
 * Electron E2E Test Fixture (Development Mode)
 *
 * This fixture launches Electron directly from the development build
 * (dist-electron/main/index.js) for faster test execution.
 *
 * For packaged app testing, use a separate fixture with findLatestBuild().
 *
 * This fixture provides:
 * - app: ElectronApplication instance
 * - takeScreenshot: Helper function for capturing screenshots with centralized path
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

    const electronApp = await electron.launch({
      args: [MAIN_ENTRY_PATH],
      timeout: ELECTRON_LAUNCH_TIMEOUT_MS,
    });

    await use(electronApp);
    await electronApp.close();
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
