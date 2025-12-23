import { test, expect } from './fixtures/electron-dev.fixture';

test.describe('Development Mode Tests', () => {
  test('should launch app in development mode', async ({ app }) => {
    const window = await app.firstWindow();
    await window.screenshot({ path: 'dev-mode-screenshot.png' });
    expect(window).toBeDefined();
  });

  test('should have app window', async ({ app }) => {
    const isPackaged = await app.evaluate(({ app }) => {
      return app.isPackaged;
    });
    expect(isPackaged).toBe(false); // Should be in development mode
  });

  test('should access main process', async ({ app }) => {
    const appName = await app.evaluate(({ app }) => {
      return app.getName();
    });
    expect(appName).toBe('agirity');
  });
});
