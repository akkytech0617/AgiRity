/* eslint-disable react-hooks/rules-of-hooks, no-empty-pattern */
import { test as base, _electron as electron } from '@playwright/test';
import type { ElectronApplication } from 'playwright';
import { parseElectronApp } from 'electron-playwright-helpers';

export const test = base.extend<{ app: ElectronApplication }>({
  app: async ({}, use) => {
    // Pass correct build directory path to parseElectronApp directly
    // since electron-builder created app in dist/mac-arm64
    const buildPath = './dist/mac-arm64';
    const appInfo = parseElectronApp(buildPath);

    const app = await electron.launch({
      args: [appInfo.main],
      executablePath: appInfo.executable,
      timeout: 30000,
    });

    await use(app);
    await app.close();
  },
});

export { expect } from '@playwright/test';
/* eslint-enable react-hooks/rules-of-hooks, no-empty-pattern */
