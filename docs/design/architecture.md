# AgiRity Architecture (Phase 1)

## 1. Overview

AgiRity is an Electron-based desktop application built with React and TypeScript.
It follows a standard Electron multi-process architecture with strict separation of concerns.

```mermaid
graph TD
    User[User] --> UI[Renderer Process (React)]
    UI -- IPC (Invoke) --> Main[Main Process (Node.js)]
    Main -- IPC (Result) --> UI
    
    subgraph "Main Process"
        Handler[IPC Handlers]
        Service_Proj[Project Service]
        Service_Launcher[Launcher Service]
        Service_Config[Config Service]
        
        Handler --> Service_Proj
        Service_Proj --> Service_Config
        Service_Proj --> Service_Launcher
    end
    
    subgraph "External System"
        FS[File System (~/.agirity)]
        OS[OS Shell (open/exec)]
    end
    
    Service_Config -- Read/Write --> FS
    Service_Launcher -- Spawn --> OS
```

---

## 2. Core Components

### 2.1 Renderer Process (Frontend)
- **Tech Stack**: React 18, TypeScript, Tailwind CSS, Vite
- **Role**: Presentation layer only. No direct file system access or shell execution.
- **State Management**: React Context + Hooks (local state).
- **Communication**: Calls `window.electron.invoke('channel', args)` via Context Bridge.

### 2.2 Main Process (Backend)
- **Tech Stack**: Node.js 18+, TypeScript, Electron API
- **Role**: Business logic, system operations, data persistence.

#### Services
1.  **ConfigService**
    - **Responsibility**: Read/Write `workspaces.yaml`.
    - **Pattern**: Repository pattern.
    - **Security**: Validates schema using Zod.

2.  **ProjectService**
    - **Responsibility**: Domain logic for Workspaces.
    - **Features**: CRUD operations, validating business rules.

3.  **LauncherService**
    - **Responsibility**: Execute external applications.
    - **Strategy** (macOS `open` command):
        - **App**: `open -a "App.app"` or `open -a "App.app" "folder"` (with project folder)
        - **Browser**: `open "url"`
        - **Folder**: `open "path"` (opens in Finder)
    - **Path Handling**: Tilde (`~`) expansion via `os.homedir()`
    - **Security**: Path validation (prevent command injection), uses `spawn` instead of `exec`.

---

## 3. IPC Design (Inter-Process Communication)

We use **Two-way IPC (invoke/handle)** for all operations.

| Channel | Type | Args | Return | Description |
|---|---|---|---|---|
| `workspace:list` | Invoke | - | `Workspace[]` | Get all workspaces |
| `workspace:create` | Invoke | `Omit<Workspace, 'id'>` | `Workspace` | Create new |
| `workspace:update` | Invoke | `Workspace` | `Workspace` | Update existing |
| `workspace:delete` | Invoke | `id: string` | `void` | Delete |
| `workspace:launch` | Invoke | `id: string` | `void` | Launch all items |
| `app:search` | Invoke | `query: string` | `AppInfo[]` | Search installed apps |

**Security Rules (Context Isolation):**
- Preload script exposes **only** specific API methods, not the entire `ipcRenderer`.
- Validation happens on **both** sides (Zod in Renderer for UX, Zod in Main for Security).

---

## 4. Data Storage

- **Format**: YAML (See `ADR-001`)
- **Location**: `~/.agirity/workspaces.yaml`
- **Backup**: `~/.agirity/workspaces.yaml.bak` (Created before every write)

---

## 5. Security Considerations

1.  **No Remote Content**: We do not load remote URLs in the main window.
2.  **Path Validation**: All paths from Renderer must be validated (absolute path check, traversal check) before execution.
3.  **Safe Execution**: Use `child_process.spawn` instead of `exec` where possible to avoid shell injection.

---

## 6. Directory Structure

```
src/
├── main/
│   ├── main.ts             # Entry point
│   ├── preload.ts          # Context Bridge
│   ├── ipc/
│   │   └── handlers.ts     # IPC registration
│   ├── services/
│   │   ├── ConfigService.ts
│   │   ├── ProjectService.ts
│   │   └── LauncherService.ts
│   └── utils/
│       └── logger.ts
├── renderer/
│   ├── App.tsx             # Main app + routing logic
│   ├── index.tsx           # Entry point
│   ├── components/
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   ├── Header.tsx          # Top header bar
│   │   ├── QuickLaunch.tsx     # Dashboard / home view
│   │   ├── WorkspaceDetail.tsx # Workspace detail with presets
│   │   ├── WorkspaceSettings.tsx # Workspace edit form
│   │   ├── CreateWorkspace.tsx # New workspace creation
│   │   ├── ItemEditor.tsx      # Individual item editor
│   │   ├── AddItemModal.tsx    # Modal for adding items
│   │   ├── ToolsRegistry.tsx   # Tools registry view (Phase 2)
│   │   ├── MCPServers.tsx      # MCP servers config (Phase 2)
│   │   └── Settings.tsx        # Global settings view
│   ├── hooks/              # Custom React hooks
│   └── api/                # IPC abstraction layer
└── shared/
    ├── types.ts            # Shared Interfaces
    └── schemas.ts          # Zod Schemas
```

---

## 7. UI Architecture

### 7.1 View Structure
The application follows a sidebar + main content layout pattern.

```
┌────────────────────────────────────────────────────────┐
│  Sidebar (w-64)    │  Main Content                     │
│  ┌──────────────┐  │  ┌──────────────────────────────┐ │
│  │ Logo/Home    │  │  │ Header (title, actions)      │ │
│  ├──────────────┤  │  ├──────────────────────────────┤ │
│  │ Workspaces   │  │  │                              │ │
│  │  - AgiRity   │  │  │ Content Area                 │ │
│  │  - Morning   │  │  │ (scrollable)                 │ │
│  │  + Add       │  │  │                              │ │
│  ├──────────────┤  │  │                              │ │
│  │ Library      │  │  │                              │ │
│  │  - Tools     │  │  │                              │ │
│  │  - MCP       │  │  │                              │ │
│  ├──────────────┤  │  │                              │ │
│  │ Settings     │  │  │                              │ │
│  └──────────────┘  │  └──────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### 7.2 View Types
Navigation is handled via a discriminated union `View` type:

| View Type | Description |
|---|---|
| `quick-launch` | Dashboard showing all workspaces as cards |
| `workspace` | Workspace detail view with presets and items |
| `workspace-settings` | Edit form for workspace configuration |
| `create-workspace` | New workspace creation wizard |
| `tools` | Tools Registry (Phase 2 placeholder) |
| `mcp` | MCP Servers configuration (Phase 2 placeholder) |
| `settings` | Global application settings |

### 7.3 Component Responsibilities

| Component | Responsibility |
|---|---|
| `App.tsx` | View state management, routing, layout composition |
| `Sidebar` | Navigation, workspace list, search/filter |
| `QuickLaunch` | Workspace cards grid, quick item launch |
| `WorkspaceDetail` | Preset cards, item grid, launch actions |
| `CreateWorkspace` / `WorkspaceSettings` | Form handling, item management |
| `ItemEditor` | Individual item configuration with drag/reorder |
