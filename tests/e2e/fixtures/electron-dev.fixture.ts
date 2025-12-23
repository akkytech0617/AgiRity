/* eslint-disable react-hooks/rules-of-hooks, no-empty-pattern */
import { test as base, _electron as electron } from '@playwright/test';
import type { ElectronApplication } from 'playwright';

// Development mode fixture - uses source code instead of packaged app
export const test = base.extend<{ app: ElectronApplication }>({
  app: async ({}, use) => {
    const electronApp = await electron.launch({
      args: ['.'],
      timeout: 30000,
    });

    await use(electronApp);
    await electronApp.close();
  },
});

export { expect } from '@playwright/test';
/* eslint-enable react-hooks/rules-of-hooks, no-empty-pattern */
