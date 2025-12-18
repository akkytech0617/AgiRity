# Tech Stack

**Desktop Framework**: Electron ^28.2.0
**UI Framework**: React ^18.2.0
**Language**: TypeScript ^5.9.3 (updated from 5.3.3)
**Styling**: Tailwind CSS ^3.4.1
**Build Tool**: Vite ^5.1.4
**Packaging**: electron-builder ^24.13.3

**Development Tools**:

- **Linting**: ESLint ^9.39.1 (flat config format)
  - @typescript-eslint/eslint-plugin ^8.48.0
  - @typescript-eslint/parser ^8.48.0
  - typescript-eslint ^8.48.0
  - eslint-plugin-react-hooks ^7.0.1
  - eslint-plugin-react-refresh ^0.4.24
  - globals ^16.5.0
- **Testing**: Vitest ^1.3.1, Playwright ^1.41.2
- **Icons**: lucide-react ^0.344.0
- **Utilities**: clsx ^2.1.1, tailwind-merge ^2.6.0, zod ^3.22.4

**Architecture**:

- **Multi-Process**: Main Process (Node.js) + Renderer Process (React)
- **IPC Communication**: Two-way invoke/handle pattern with strict type safety
- **Data Storage**: YAML format in `~/.agirity/workspaces.yaml` (planned)
- **Security**: Context isolation, no remote content loading

**Known Issues**:

- Test files not implemented (0 test coverage)
- Mock data hardcoded in App.tsx (MOCK_WORKSPACES)
- No production data persistence layer yet
