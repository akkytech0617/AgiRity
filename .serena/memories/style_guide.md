# Style Guide & Conventions

### Code Quality Standards

- **Linting**: ESLint v9 (flat config) with TypeScript-ESLint ^8.48.0
- **Type Safety**: Strict TypeScript, `@typescript-eslint/no-explicit-any: error`
- **Unused Code Detection**: `noUnusedLocals: true`, `noUnusedParameters: true` in tsconfig.json
- **Security**: Path validation, command injection prevention, context isolation

### ESLint Configuration (eslint.config.mjs)

```javascript
// Flat config format (ESLint v9)
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactHooks from 'eslint-plugin-react-hooks';
```

### Commit Convention: Conventional Commits

```
<type>(<scope>): <subject>
Types: feat, fix, docs, refactor, test, chore
Scopes: launcher, ui, service, ipc, config
```

### Testing Strategy (Not Yet Implemented)

- **Test Pyramid**: 60% Unit, 30% Integration, 10% E2E
- **Tools**: Vitest (Unit/Integration), Playwright (E2E)
- **Coverage Goals**: 70% overall, 80% business logic, 90% IPC
- **Current Status**: 0% coverage - urgent priority

### Best Practices

- **React**: Use `useCallback` and `useMemo`, cleanup in `useEffect`
- **Electron**: Use `fs.promises` (async), proper event cleanup, minimize blocking
- **Security**: Always validate paths, use `spawn` with args array, never log secrets
- **TypeScript**: Enable strict mode, avoid type assertions when possible

### Code Duplication Issues (To Be Refactored)

- `getItemIcon` function duplicated in 4 components
- Item CRUD logic duplicated in WorkspaceSettings and CreateWorkspace
- spawn Promise pattern duplicated 3 times in LauncherService
