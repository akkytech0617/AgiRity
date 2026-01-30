import { expect, test } from '../fixtures/electron.fixture';

/**
 * Navigation E2E Tests
 * Tests view transitions in the AgiRity application
 */

const APP_ROOT_SELECTOR = '[data-testid="app-root"]';
const HOME_BUTTON_SELECTOR = 'button:has-text("Home")';
const MENU_BUTTON_SELECTOR = 'button:has(svg.lucide-menu)';
const NEW_WORKSPACE_BUTTON_SELECTOR = 'button[title="New Workspace"]';
// More specific selector to avoid conflicts with workspace names containing "Cancel"
const CANCEL_BUTTON_SELECTOR = 'button.rounded-button:has(svg.lucide-x):has-text("Cancel")';

test.describe('Navigation Tests', () => {
  test('should display Home screen on initial load', async ({ app }) => {
    const window = await app.firstWindow();

    // Wait for app to load
    await window.waitForSelector(APP_ROOT_SELECTOR);

    // Verify we're on Home screen by checking for workspace list or empty state
    const homeButton = window.locator(HOME_BUTTON_SELECTOR);
    await expect(homeButton).toHaveClass(/bg-white/);
  });

  test('should navigate to Settings and back to Home', async ({ app }) => {
    const window = await app.firstWindow();
    await window.waitForSelector(APP_ROOT_SELECTOR);

    // Open menu
    const menuButton = window.locator(MENU_BUTTON_SELECTOR);
    await menuButton.click();

    // Click Settings
    const settingsMenuItem = window.locator('button:has-text("Settings")');
    await settingsMenuItem.click();

    // Verify Settings view is displayed
    await expect(window.locator('h2:has-text("Settings")')).toBeVisible();

    // Navigate back to Home
    const homeButton = window.locator(HOME_BUTTON_SELECTOR);
    await homeButton.click();

    // Verify we're back on Home (Home button should have active state)
    await expect(homeButton).toHaveClass(/bg-white/);
  });

  test('should navigate to Tools Registry and back to Home', async ({ app }) => {
    const window = await app.firstWindow();
    await window.waitForSelector(APP_ROOT_SELECTOR);

    // Open menu
    const menuButton = window.locator(MENU_BUTTON_SELECTOR);
    await menuButton.click();

    // Click Tools Registry
    const toolsMenuItem = window.locator('button:has-text("Tools Registry")');
    await toolsMenuItem.click();

    // Verify Tools view is displayed
    await expect(window.locator('h2:has-text("Tool Registry")')).toBeVisible();

    // Navigate back to Home
    const homeButton = window.locator(HOME_BUTTON_SELECTOR);
    await homeButton.click();

    // Verify we're back on Home
    await expect(homeButton).toHaveClass(/bg-white/);
  });

  test('should navigate to MCP Servers and back to Home', async ({ app }) => {
    const window = await app.firstWindow();
    await window.waitForSelector(APP_ROOT_SELECTOR);

    // Open menu
    const menuButton = window.locator(MENU_BUTTON_SELECTOR);
    await menuButton.click();

    // Click MCP Servers
    const mcpMenuItem = window.locator('button:has-text("MCP Servers")');
    await mcpMenuItem.click();

    // Verify MCP view is displayed
    await expect(window.locator('h2:has-text("MCP Servers")')).toBeVisible();

    // Navigate back to Home
    const homeButton = window.locator(HOME_BUTTON_SELECTOR);
    await homeButton.click();

    // Verify we're back on Home
    await expect(homeButton).toHaveClass(/bg-white/);
  });

  test('should open New Workspace editor and cancel back to Home', async ({ app }) => {
    const window = await app.firstWindow();
    await window.waitForSelector(APP_ROOT_SELECTOR);

    // Click New Workspace button (+ button)
    const newWorkspaceButton = window.locator(NEW_WORKSPACE_BUTTON_SELECTOR);
    await newWorkspaceButton.click();

    // Verify workspace editor is displayed
    await expect(window.locator('h2:has-text("Create New Workspace")')).toBeVisible();

    // Click Cancel button (using more specific selector)
    await window.locator(CANCEL_BUTTON_SELECTOR).click();

    // Verify we're back on Home
    const homeButton = window.locator(HOME_BUTTON_SELECTOR);
    await expect(homeButton).toHaveClass(/bg-white/);
  });

  test('should navigate through multiple views in sequence', async ({ app }) => {
    const window = await app.firstWindow();
    await window.waitForSelector(APP_ROOT_SELECTOR);

    // 1. Settings
    await window.locator(MENU_BUTTON_SELECTOR).click();
    await window.locator('button:has-text("Settings")').click();
    await expect(window.locator('h2:has-text("Settings")')).toBeVisible();

    // 2. Tools
    await window.locator(MENU_BUTTON_SELECTOR).click();
    await window.locator('button:has-text("Tools Registry")').click();
    await expect(window.locator('h2:has-text("Tool Registry")')).toBeVisible();

    // 3. MCP
    await window.locator(MENU_BUTTON_SELECTOR).click();
    await window.locator('button:has-text("MCP Servers")').click();
    await expect(window.locator('h2:has-text("MCP Servers")')).toBeVisible();

    // 4. Back to Home
    await window.locator(HOME_BUTTON_SELECTOR).click();
    const homeButton = window.locator(HOME_BUTTON_SELECTOR);
    await expect(homeButton).toHaveClass(/bg-white/);
  });
});
