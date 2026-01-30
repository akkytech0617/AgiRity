import { expect, test } from '../fixtures/electron.fixture';

/**
 * Workspace CRUD E2E Tests
 * Tests workspace creation, editing, and validation
 */

const APP_ROOT_SELECTOR = '[data-testid="app-root"]';
const NEW_WORKSPACE_BUTTON_SELECTOR = 'button[title="New Workspace"]';
const WORKSPACE_NAME_INPUT = 'input#workspace-name';
const WORKSPACE_DESCRIPTION_INPUT = 'textarea#workspace-description';
const SAVE_BUTTON_SELECTOR = 'button:has-text("Create Workspace")';
const SAVE_CHANGES_BUTTON_SELECTOR = 'button:has-text("Save Changes")';
// More specific selector to avoid conflicts with workspace names containing "Cancel"
const CANCEL_BUTTON_SELECTOR = 'button.rounded-button:has(svg.lucide-x):has-text("Cancel")';

test.describe('Workspace CRUD Tests', () => {
  test.describe('Create New Workspace', () => {
    test('should create a new workspace successfully', async ({ app }) => {
      const window = await app.firstWindow();
      await window.waitForSelector(APP_ROOT_SELECTOR);

      // Click New Workspace button
      await window.locator(NEW_WORKSPACE_BUTTON_SELECTOR).click();

      // Verify editor is displayed
      await expect(window.locator('h2:has-text("Create New Workspace")')).toBeVisible();

      // Fill in workspace details
      const workspaceName = `Test Workspace ${Date.now()}`;
      await window.locator(WORKSPACE_NAME_INPUT).fill(workspaceName);
      await window.locator(WORKSPACE_DESCRIPTION_INPUT).fill('A test workspace for E2E testing');

      // Click Save
      const saveButton = window.locator(SAVE_BUTTON_SELECTOR);
      await expect(saveButton).toBeEnabled();
      await saveButton.click();

      // Verify we're redirected to the workspace detail view
      // Note: This may take a moment for the workspace to save and load
      await window.waitForTimeout(1000);
      await expect(window.locator(`h1:has-text("${workspaceName}")`)).toBeVisible({
        timeout: 5000,
      });
    });

    test('should show validation error when name is empty', async ({ app }) => {
      const window = await app.firstWindow();
      await window.waitForSelector(APP_ROOT_SELECTOR);

      // Click New Workspace button
      await window.locator(NEW_WORKSPACE_BUTTON_SELECTOR).click();

      // Verify editor is displayed
      await expect(window.locator('h2:has-text("Create New Workspace")')).toBeVisible();

      // Try to save without entering name
      const saveButton = window.locator(SAVE_BUTTON_SELECTOR);

      // Save button should be disabled
      await expect(saveButton).toBeDisabled();

      // Enter name and verify button becomes enabled
      await window.locator(WORKSPACE_NAME_INPUT).fill('Valid Name');
      await expect(saveButton).toBeEnabled();

      // Clear name and verify button becomes disabled again
      await window.locator(WORKSPACE_NAME_INPUT).clear();
      await expect(saveButton).toBeDisabled();
    });

    test('should cancel workspace creation and return to Home', async ({ app }) => {
      const window = await app.firstWindow();
      await window.waitForSelector(APP_ROOT_SELECTOR);

      // Click New Workspace button
      await window.locator(NEW_WORKSPACE_BUTTON_SELECTOR).click();

      // Fill in some data
      await window.locator(WORKSPACE_NAME_INPUT).fill('Temporary Workspace');
      await window.locator(WORKSPACE_DESCRIPTION_INPUT).fill('This will be cancelled');

      // Click Cancel
      await window.locator(CANCEL_BUTTON_SELECTOR).click();

      // Verify we're back on Home
      const homeButton = window.locator('button:has-text("Home")');
      await expect(homeButton).toHaveClass(/bg-white/);
    });
  });

  test.describe('Edit Existing Workspace', () => {
    test('should edit workspace and save changes', async ({ app }) => {
      const window = await app.firstWindow();
      await window.waitForSelector(APP_ROOT_SELECTOR);

      // First, create a workspace
      await window.locator(NEW_WORKSPACE_BUTTON_SELECTOR).click();
      const originalName = `Original Workspace ${Date.now()}`;
      await window.locator(WORKSPACE_NAME_INPUT).fill(originalName);
      await window.locator(SAVE_BUTTON_SELECTOR).click();

      // Wait for workspace detail to load
      await window.waitForTimeout(1000);
      await expect(window.locator(`h1:has-text("${originalName}")`)).toBeVisible({
        timeout: 5000,
      });

      // Click Edit button (pencil icon button)
      const editButton = window.locator('button[title="Edit workspace"]');
      await editButton.click();

      // Verify we're in edit mode
      await expect(window.locator('h2:has-text("Edit Workspace")')).toBeVisible();

      // Verify the form is pre-filled with existing data
      await expect(window.locator(WORKSPACE_NAME_INPUT)).toHaveValue(originalName);

      // Modify the workspace
      const updatedName = `${originalName} - Updated`;
      await window.locator(WORKSPACE_NAME_INPUT).clear();
      await window.locator(WORKSPACE_NAME_INPUT).fill(updatedName);
      await window.locator(WORKSPACE_DESCRIPTION_INPUT).fill('Updated description');

      // Save changes
      const saveChangesButton = window.locator(SAVE_CHANGES_BUTTON_SELECTOR);
      await expect(saveChangesButton).toBeEnabled();
      await saveChangesButton.click();

      // Verify changes are reflected in the detail view
      await window.waitForTimeout(1000);
      await expect(window.locator(`h1:has-text("${updatedName}")`)).toBeVisible({
        timeout: 5000,
      });
    });

    test('should cancel workspace editing without saving changes', async ({ app }) => {
      const window = await app.firstWindow();
      await window.waitForSelector(APP_ROOT_SELECTOR);

      // First, create a workspace (avoid using "Cancel" in the name)
      await window.locator(NEW_WORKSPACE_BUTTON_SELECTOR).click();
      const originalName = `Workspace Edit Test ${Date.now()}`;
      await window.locator(WORKSPACE_NAME_INPUT).fill(originalName);
      await window.locator(SAVE_BUTTON_SELECTOR).click();

      // Wait for workspace detail to load
      await window.waitForTimeout(1000);
      await expect(window.locator(`h1:has-text("${originalName}")`)).toBeVisible({
        timeout: 5000,
      });

      // Click Edit button
      const editButton = window.locator('button[title="Edit workspace"]');
      await editButton.click();

      // Modify the workspace
      await window.locator(WORKSPACE_NAME_INPUT).clear();
      await window.locator(WORKSPACE_NAME_INPUT).fill('Modified Name - Not Saved');

      // Click Cancel (using more specific selector)
      await window.locator(CANCEL_BUTTON_SELECTOR).click();

      // Verify we're back on workspace detail with original name
      await expect(window.locator(`h1:has-text("${originalName}")`)).toBeVisible();
    });
  });

  test.describe('Workspace Form Validation', () => {
    test('should trim whitespace from workspace name', async ({ app }) => {
      const window = await app.firstWindow();
      await window.waitForSelector(APP_ROOT_SELECTOR);

      // Click New Workspace button
      await window.locator(NEW_WORKSPACE_BUTTON_SELECTOR).click();

      // Enter name with leading/trailing whitespace
      const workspaceName = `Trimmed Workspace ${Date.now()}`;
      await window.locator(WORKSPACE_NAME_INPUT).fill(`  ${workspaceName}  `);

      // Save
      await window.locator(SAVE_BUTTON_SELECTOR).click();

      // Wait for workspace detail to load
      await window.waitForTimeout(1000);

      // Verify the trimmed name is displayed (without leading/trailing spaces)
      await expect(window.locator(`h1:has-text("${workspaceName}")`)).toBeVisible({
        timeout: 5000,
      });
    });

    test('should disable save button when name contains only whitespace', async ({ app }) => {
      const window = await app.firstWindow();
      await window.waitForSelector(APP_ROOT_SELECTOR);

      // Click New Workspace button
      await window.locator(NEW_WORKSPACE_BUTTON_SELECTOR).click();

      // Enter only whitespace in name field
      await window.locator(WORKSPACE_NAME_INPUT).fill('     ');

      // Save button should be disabled
      const saveButton = window.locator(SAVE_BUTTON_SELECTOR);
      await expect(saveButton).toBeDisabled();
    });
  });
});
