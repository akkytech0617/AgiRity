# Tech Stack

**Desktop Framework**: Electron ^28.0.0
**UI Framework**: React ^18.2.0
**Language**: TypeScript ^5.3.0
**Styling**: Tailwind CSS ^3.4.0
**Build Tool**: Vite ^5.0.0
**Packaging**: electron-builder ^24.0.0

**Architecture**:
- **Multi-Process**: Main Process (Node.js) + Renderer Process (React)
- **IPC Communication**: Two-way invoke/handle pattern with strict type safety
- **Data Storage**: YAML format in `~/.agirity/workspaces.yaml`
- **Security**: Context isolation, no remote content loading
