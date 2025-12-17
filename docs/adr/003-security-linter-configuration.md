# 3. Security Linter Configuration

Date: 2025-12-17

## Status

Accepted

## Context

Following a security review by Coderabbit, vulnerabilities related to unvalidated inputs in `shell.openExternal` were identified. These issues were not caught by existing CI tools (Snyk, standard ESLint rules). To prevent similar issues and improve overall code security, we needed to enhance our static analysis capabilities.

The primary requirement was to strengthen security scanning without introducing high-maintenance custom ESLint rules or strictly prohibiting necessary Electron APIs like `openExternal`.

## Decision

We have decided to integrate **`eslint-plugin-security`** into our ESLint configuration.

### Key Changes

1.  **Plugin Installation**: Added `eslint-plugin-security` to dev dependencies.
2.  **Configuration**: Enabled `security.configs.recommended` in `eslint.config.mjs`.
3.  **Warning Suppression**:
    - Suppressed `security/detect-non-literal-fs-filename` in `FileSystemAdapter.ts` as it wraps file system operations by design.
    - Suppressed `security/detect-object-injection` in `ProjectService.ts` and React components (`CreateWorkspace.tsx`, `WorkspaceSettings.tsx`) where object key access is type-safe and controlled.

## Consequences

### Positive

- **Broad Security Coverage**: Automatically detects common Node.js security patterns (e.g., ReDoS, unsafe child_process usage).
- **Low Maintenance**: Relies on a community-maintained standard plugin rather than custom rules.
- **Improved Awareness**: Developers are alerted to potential security risks during development and CI.

### Negative

- **False Positives**: Some valid patterns (like wrapper classes or safe object access) trigger warnings, requiring explicit suppression comments.
- **Limited Electron Specifics**: Does not specifically target Electron APIs like `openExternal`. This gap will be covered by AI review tools (Coderabbit CLI) and careful code review practices.

## References

- [eslint-plugin-security](https://github.com/eslint-community/eslint-plugin-security)
- Pull Request Review by Coderabbit
