# ADR-001: IPC Communication Pattern

## Status
*   **Status**: Accepted
*   **Date**: 2025-11-23
*   **Deciders**: Droid (AI Agent)

## Context
We need a standard way for the React frontend (Renderer) to communicate with the Node.js backend (Main).
Electron offers multiple patterns: `remote` module (deprecated), `ipcRenderer.send/on` (event-based), and `ipcRenderer.invoke/handle` (promise-based).

## Decision
We will use **`ipcRenderer.invoke` / `ipcMain.handle` (Two-way IPC)** for all request-response operations.

## Rationale
*   **Promise-based**: Matches modern async/await patterns in frontend code. Easier to handle errors and results than event listeners.
*   **Security**: Unlike `remote` module, it keeps the renderer isolated.
*   **Simplicity**: Reduces the need for managing paired event listeners (`reply` channels).

## Consequences
*   **Positive**: Cleaner code in React components (`const data = await api.getData()`).
*   **Negative**: Slightly more boilerplate in `preload.ts` to expose typed APIs.

---

# ADR-002: Application Launch Strategy (macOS)

## Status
*   **Status**: Accepted (Updated 2025-11-27)
*   **Date**: 2025-11-23
*   **Deciders**: Droid (AI Agent)

## Context
We need to launch various types of items: Applications (.app), URLs, and Folders.
Different items require different OS commands.

## Decision
We will use the macOS `open` command via `child_process.spawn` as the primary launch mechanism for Phase 1.

### Launch Commands by Type

| Type | Command | Example |
|------|---------|---------|
| **App** (no folder) | `open -a "App"` | `open -a /Applications/Slack.app` |
| **App** (with folder) | `open -a "App" "folder"` | `open -a /Applications/Zed.app ~/workspace/project` |
| **Browser** | `open "url"` | `open https://linear.app/` |
| **Folder** | `open "path"` | `open ~/Documents` |

### Path Handling
- **Tilde Expansion**: Paths starting with `~/` are automatically expanded to the user's home directory using `os.homedir()`.
- **Validation**: All paths are validated before execution.

### WorkspaceItem Schema
```typescript
interface WorkspaceItem {
  type: 'app' | 'browser' | 'folder';
  name: string;
  path?: string;    // App path or folder path
  urls?: string[];  // Browser URLs
  folder?: string;  // For app type: open this folder with the app
  waitTime?: number;
  dependsOn?: string;
}
```

## Rationale
*   **Uniformity**: The `open` command handles most file associations and URL schemes automatically.
*   **Simplicity**: Reduces the complexity of implementing custom logic for every file type.
*   **Flexibility**: The `folder` property on `app` type allows editors/IDEs to open specific projects.

## Consequences
*   **Positive**: Fast implementation for MVP. Editors like Zed, VS Code can open project folders directly.
*   **Negative**: Limited control over window positioning or specific arguments compared to direct execution.
*   **Known Issue**: Some apps (e.g., Terminal.app) may not respect the folder argument with `open -a`. Alternative approaches may be needed for specific apps.

---

# ADR-003: Task Runner Selection

## Status
*   **Status**: Accepted
*   **Date**: 2025-11-23
*   **Deciders**: Droid (AI Agent), User

## Context
The project uses multiple tools (Vite, Electron, TypeScript, ESLint, etc.) which require complex shell commands.
Managing these via `npm scripts` alone can lead to verbose, hard-to-read `package.json` files and difficulties in chaining commands or adding arguments.
We need a task runner that improves developer experience while maintaining cross-platform compatibility.

## Decision
We will use **Just** (https://github.com/casey/just) as the primary task runner.

## Rationale
*   **Cross-Platform**: Works well on macOS, Linux, and Windows, avoiding shell-specific syntax issues common with `Makefile`.
*   **Readability**: Syntax is cleaner than JSON-based `npm scripts` and supports comments/variables naturally.
*   **Flexibility**: Easy to pass arguments to commands and chain tasks.

## Consequences
*   **Positive**: Simplified command execution (e.g., `just dev`, `just build`). Centralized documentation of common tasks.
*   **Negative**: Requires developers to install the `just` binary, adding a step to the onboarding process.

---

# ADR-004: UI Layout and Navigation Pattern

## Status
*   **Status**: Accepted
*   **Date**: 2025-11-25
*   **Deciders**: Droid (AI Agent)

## Context
The UI prototype required a navigation pattern that supports:
1. Quick access to multiple workspaces
2. Clear distinction between workspace views and global settings
3. Future extensibility for Phase 2 features (Tools Registry, MCP Servers)

## Decision
We will use a **Sidebar + Main Content** layout with the following structure:
- Fixed-width sidebar (collapsible on smaller screens) containing navigation
- Main content area with header + scrollable content
- View state managed via discriminated union type in `App.tsx`

### View Types
```typescript
type View = 
  | { type: 'quick-launch' }           // Dashboard
  | { type: 'workspace', id: string }  // Workspace detail
  | { type: 'workspace-settings', id: string }
  | { type: 'create-workspace' }
  | { type: 'tools' }                  // Phase 2
  | { type: 'mcp' }                    // Phase 2
  | { type: 'settings' };              // Global settings
```

## Rationale
*   **Familiar Pattern**: Sidebar navigation is common in productivity tools (Linear, Notion, Slack), reducing learning curve.
*   **Type Safety**: Discriminated union ensures exhaustive handling of views and enables IDE autocompletion.
*   **Scalability**: Easy to add new view types without refactoring existing code.
*   **No Router Dependency**: Simple enough for Phase 1 without adding react-router complexity.

## Consequences
*   **Positive**: Clean separation of navigation and content. Easy to understand code flow.
*   **Negative**: No URL-based navigation or deep linking (acceptable for desktop app).

---

# ADR-005: Workspace Presets Feature

## Status
*   **Status**: Accepted
*   **Date**: 2025-11-25
*   **Deciders**: Droid (AI Agent)

## Context
Users often need to launch only a subset of their workspace items:
- "Code Only" mode without Docker/browsers
- "Review Mode" with just browser tabs
- "Full Development" with everything

Launching all items every time is inefficient and doesn't match real-world usage patterns.

## Decision
We will add an optional `presets` array to the Workspace model:

```typescript
interface WorkspacePreset {
  name: string;
  description?: string;
  itemNames: string[];  // References WorkspaceItem.name
}
```

### UI Behavior
- Presets are displayed as cards at the top of WorkspaceDetail view
- Each preset shows a preview of included items and a "Launch" button
- If no presets are defined, a default "Launch All" preset is auto-generated

## Rationale
*   **User Control**: Allows flexible partial launches without modifying workspace structure.
*   **Backward Compatible**: `presets` is optional, existing workspaces continue to work.
*   **Reference by Name**: Using `itemNames` instead of indices is more readable and resilient to reordering.

## Consequences
*   **Positive**: Addresses real user need for scenario-based launching. Simple mental model.
*   **Negative**: If an item is renamed, presets may break (mitigation: validation on load).
