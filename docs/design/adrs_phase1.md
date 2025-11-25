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
*   **Status**: Accepted
*   **Date**: 2025-11-23
*   **Deciders**: Droid (AI Agent)

## Context
We need to launch various types of items: Applications (.app), URLs, and Folders.
Different items require different OS commands.

## Decision
We will use the macOS `open` command via `child_process.spawn` as the primary launch mechanism for Phase 1.

*   **Apps**: `open -a "Application Name"`
*   **URLs**: `open "https://..."`
*   **Folders**: `open "/path/to/folder"`

For VS Code specifically, we will attempt to detect the `code` CLI, but fallback to `open -a "Visual Studio Code" "/path/to/folder"`.

## Rationale
*   **Uniformity**: The `open` command handles most file associations and URL schemes automatically.
*   **Simplicity**: Reduces the complexity of implementing custom logic for every file type.

## Consequences
*   **Positive**: Fast implementation for MVP.
*   **Negative**: Limited control over window positioning or specific arguments compared to direct execution.

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
