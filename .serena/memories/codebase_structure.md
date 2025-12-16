# Codebase Structure

```
src/
├── main/              # Electron backend (Node.js)
│   ├── services/      # Business logic (LauncherService)
│   ├── ipc/           # IPC handlers
│   ├── index.ts       # Main process entry
│   └── preload.ts     # Preload script
├── renderer/          # React frontend
│   ├── components/    # UI components (14 files)
│   │   ├── Layout.tsx, Header.tsx, Sidebar.tsx
│   │   ├── QuickLaunch.tsx, WorkspaceDetail.tsx, WorkspaceSettings.tsx
│   │   ├── CreateWorkspace.tsx, ItemEditor.tsx, AddItemModal.tsx
│   │   ├── Settings.tsx, ToolsRegistry.tsx, MCPServers.tsx
│   │   ├── WorkspaceRow.tsx (UNUSED - can be deleted)
│   │   └── WorkspaceCard.tsx (UNUSED - can be deleted)
│   ├── api/           # IPC abstraction layer
│   │   └── index.ts   # launcherApi
│   ├── App.tsx        # Main application component
│   ├── utils.ts       # Utility functions (cn helper)
│   └── index.tsx      # Renderer entry point
└── shared/            # Shared types and schemas
    └── types.ts       # Workspace, WorkspaceItem, IPC types

**Configuration Files**:
- `eslint.config.mjs`: ESLint v9 flat config (migrated from .eslintrc.json)
- `tsconfig.json`: Renderer TypeScript config (strict mode, noUnusedLocals)
- `tsconfig.node.json`: Main process TypeScript config
- `vite.config.ts`: Vite build configuration
- `tailwind.config.js`: Tailwind CSS configuration

**Documentation**:
- `AGENTS.md`: AI agent context and instructions
- `docs/`: Detailed project documentation
  - design/, planning/, management/, product/, implementation/
