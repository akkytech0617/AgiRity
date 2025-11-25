# Style Guide & Conventions

### Code Quality Standards
- **Linting**: ESLint + Prettier with pre-commit hooks.
- **Type Safety**: Strict TypeScript, no `any` types.
- **Security**: Path validation, command injection prevention, context isolation.

### Commit Convention: Conventional Commits
```
<type>(<scope>): <subject>
Types: feat, fix, docs, refactor, test, chore
Scopes: launcher, ui, service, ipc, config
```

### Testing Strategy
- **Test Pyramid**: 60% Unit, 30% Integration, 10% E2E.
- **Tools**: Vitest (Unit/Integration), Playwright (E2E).
- **Coverage Goals**: 70% overall, 80% business logic, 90% IPC.

### Best Practices
- **React**: Use `useCallback` and `useMemo`, cleanup in `useEffect`.
- **Electron**: Use `fs.promises` (async), proper event cleanup, minimize blocking.
- **Security**: Always validate paths (`path.normalize()`), use `spawn` with args array, never log secrets.
