/* eslint-disable react-hooks/rules-of-hooks, no-empty-pattern */
import { test as base, _electron as electron } from '@playwright/test';
import type { ElectronApplication, Page } from 'playwright';
import path from 'path';

// Screenshot helper type
type ScreenshotHelper = (page: Page, filename: string) => Promise<void>;

// Development mode fixture - uses built main file from dist-electron
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
