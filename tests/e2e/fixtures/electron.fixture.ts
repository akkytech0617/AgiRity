/* eslint-disable react-hooks/rules-of-hooks, no-empty-pattern */
import { test as base, _electron as electron } from '@playwright/test';
import type { ElectronApplication, Page } from 'playwright';
import path from 'node:path';

/**
 * Screenshot helper type
 * Simplifies screenshot capture with centralized path management
 */
type ScreenshotHelper = (page: Page, filename: string) => Promise<void>;

/**
 * Electron E2E Test Fixture
 *
 * This fixture provides:
 * - app: ElectronApplication instance (launches from dist-electron/main/index.js)
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
    const electronApp = await electron.launch({
      args: ['dist-electron/main/index.js'],
      timeout: 30000,
    });

    await use(electronApp);
    await electronApp.close();
  },

  takeScreenshot: async ({}, use) => {
    const screenshotDir = 'tests/results/e2e/ss';
    const helper: ScreenshotHelper = async (page, filename) => {
      await page.screenshot({ path: path.join(screenshotDir, filename) });
    };
    await use(helper);
  },
});

export { expect } from '@playwright/test';
/* eslint-enable react-hooks/rules-of-hooks, no-empty-pattern */
