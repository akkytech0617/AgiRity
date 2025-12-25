import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  retries: 2,
  reporter: [
    ['html', { outputFolder: '../results/e2e/html' }],
    ['junit', { outputFile: '../results/e2e/junit.xml' }],
    ['github'],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  outputDir: '../results/e2e/ss',
});
