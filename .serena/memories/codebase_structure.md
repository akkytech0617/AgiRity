# Codebase Structure

```
src/
├── main/              # Electron backend (Node.js)
│   ├── services/      # Business logic (Config, Project, Launcher)
│   ├── ipc/           # IPC handlers
│   └── utils/         # Utilities
├── renderer/          # React frontend
│   ├── components/    # UI components
│   ├── hooks/         # React hooks
│   └── api/           # IPC abstraction layer
└── shared/            # Shared types and schemas
```

- `AGENTS.md`: Comprehensive context and instructions for AI agents.
- `docs/`: Detailed project documentation.
