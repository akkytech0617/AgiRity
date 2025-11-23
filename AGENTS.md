# AgiRity AI Agent Context

## 1. Project Overview

**Project Name**: AgiRity  
**Concept**: "Start working in 3 seconds, not 3 minutes" - Workspace management tool that automatically launches multiple applications for project work  
**Target Users**: Developers and Engineers (Phase 1)  
**Core Value**: Reduce morning routine friction from 3 minutes to 3 seconds  

### Key Problem Solving
- **Morning Routine Automation**: Eliminates manual app launching sequence  
- **Project Context Switching**: Instant workspace switching with proper tool setup  
- **Dependency Management**: Automatic handling of app startup order and timing  

---

## 2. Technical Stack & Architecture

### Core Technologies
```
Desktop Framework: Electron ^28.0.0
UI Framework: React ^18.2.0
Language: TypeScript ^5.3.0
Styling: Tailwind CSS ^3.4.0
Build Tool: Vite ^5.0.0
Packaging: electron-builder ^24.0.0
```

### Architecture Pattern
- **Multi-Process**: Main Process (Node.js) + Renderer Process (React)
- **IPC Communication**: Two-way invoke/handle pattern with strict type safety
- **Data Storage**: YAML format in `~/.agirity/workspaces.yaml`
- **Security**: Context isolation, no remote content loading

### Directory Structure
```
src/
├── main/              # Electron backend (Node.js)
│   ├── services/      # Business logic (Config, Project, Launcher)
│   ├── ipc/          # IPC handlers
│   └── utils/         # Utilities
├── renderer/          # React frontend
│   ├── components/   # UI components
│   ├── hooks/        # React hooks
│   └── api/          # IPC abstraction layer
└── shared/            # Shared types and schemas
```

---

## 3. Core Domain Concepts

### Workspace Model
- **Workspace**: Collection of apps, URLs, folders for specific work context
- **Workspace Item**: Individual launchable element (app, browser, folder)
- **Tags**: Classification system for workspace organization

### Data Models
```yaml
Workspace:
  id: UUID (v4)
  name: string (required)
  description: string
  items: WorkspaceItem[] (required)
  tags: string[]
  createdAt: ISO8601
  updatedAt: ISO8601

WorkspaceItem:
  type: "app" | "browser" | "folder" (required)
  name: string (required)
  path: string (required for app, folder)
  urls: string[] (required for browser)
  folder: string (VS Code project folder)
  waitTime: number (startup delay in seconds)
  dependsOn: string (preceding item name)
```

### Tool Types & Behaviors
- **Singleton**: Teams, Slack, Outlook (skip if already running)
- **Multi-Instance**: VS Code, Terminal (open new window)
- **Browser**: Chrome, Edge (open new tabs)

---

## 4. Development Workflow & Standards

### Branch Strategy: GitHub Flow
```
main (releasable)
├── feature/*
├── fix/*
├── docs/*
└── refactor/*
```

### Commit Convention: Conventional Commits
```
<type>(<scope>): <subject>

Types: feat, fix, docs, refactor, test, chore
Scopes: launcher, ui, service, ipc, config
```

### Testing Strategy
- **Test Pyramid**: 60% Unit, 30% Integration, 10% E2E
- **Tools**: Vitest (Unit/Integration), Playwright (E2E)
- **Coverage Goals**: 70% overall, 80% business logic, 90% IPC

### Code Quality Standards
- **Linting**: ESLint + Prettier with pre-commit hooks
- **Type Safety**: Strict TypeScript, no `any` types
- **Security**: Path validation, command injection prevention, context isolation

---

## 5. Available Documentation References

### Essential Reading (Priority Order)
1. **Requirements**: `docs/product/01_requirment.md` - Project scope, MVP definition, success metrics
2. **Architecture**: `docs/design/architecture.md` - System design, IPC patterns, security considerations
3. **Development Rules**: `docs/product/03_development_rules.md` - Branch strategy, commit conventions, CI/CD flow
4. **Tech Stack**: `docs/product/02_tech_stacks.md` - Dependencies, tools, performance targets

### Implementation Guides
5. **Domain Glossary**: `docs/product/domain_glossary.md` - Data models, YAML examples, terminology
6. **Testing Strategy**: `docs/implementation/testing_strategy.md` - Test pyramid, coverage goals, CI setup
7. **Code Review Checklist**: `docs/implementation/ai_code_review_checklist.md` - Security, performance, code quality standards

### Templates & Automation
8. **RFC Template**: `docs/design/rfc_template.md` - AI-optimized structure for design proposals
9. **ADR Template**: `docs/design/adr_template.md` - Architecture decision recording format
10. **Linear SOP**: `docs/management/linear_task_sop.md` - Task creation and management workflow

### Planning & Onboarding
11. **Task Breakdown**: `docs/planning/task_breakdown_template.md` - Step-by-step work decomposition for AI agents
12. **Onboarding Checklist**: `docs/development/onboarding_checklist.md` - 4-week developer setup plan

---

## 6. Current Phase & Goals

### Phase 1: MVP (Week 1-8)
**Goal**: Basic workspace management and app launching functionality

#### Required Features (v0.2.0)
- [x] App launching (click to start)
- [x] Multiple app launching (sequential or simultaneous)
- [x] Project workspace management (CRUD operations)
- [x] Workspace listing and execution
- [x] Local data persistence (YAML)

#### Performance Targets
- App startup: < 1 second
- Execution response: < 0.1 seconds
- Memory usage: < 100MB (idle)
- Crash rate: < 0.1%

---

## 7. Development Commands Reference

### Essential Commands
```bash
# Development
npm run dev              # Start Electron with hot reload

# Testing
npm run test:watch        # Unit tests with file watching
npm run test:coverage     # With coverage report
npm run test:e2e          # End-to-end tests

# Code Quality
npm run lint              # Check code style
npm run lint:fix          # Auto-fix issues
npm run type-check         # TypeScript validation

# Build & Release
npm run build             # Production build
npm run package           # Create distributable
npm run release            # Version bump + Git tag + GitHub Release
```

### AI Agent Specific Commands
```bash
# Task Management (using Droid sub-agent)
agirity create-task "Implement browser URL support" --priority high
agirity list-tasks --status backlog
agirity assign-task --to "developer-name"

# Project Analysis
agirity analyze-codebase --focus security
agirity check-dependencies --outdated
agirity generate-docs --from src/main/services
```

---

## 8. Security Guidelines

### Critical Rules for AI Code Generation
1. **Path Validation**: Always use `path.normalize()` and traversal checks before file operations
2. **Command Injection**: Use `spawn` with argument arrays, never `exec` with concatenated strings
3. **IPC Safety**: Maintain `contextIsolation: true`, expose only specific API methods
4. **Secrets Protection**: Never log API keys, passwords, or sensitive file contents
5. **Input Validation**: Use Zod schemas for all user inputs from renderer

### File Permissions
```bash
~/.agirity/
├── workspaces.yaml (600: user read/write only)
└── logs/ (700: user access only)
```

---

## 9. Performance Optimization Guidelines

### React Best Practices
- Use `useCallback` and `useMemo` for expensive computations
- Implement proper cleanup in `useEffect` dependencies
- Avoid unnecessary re-renders with stable component references

### Electron Best Practices
- Use `fs.promises` instead of synchronous file operations
- Implement proper event listener cleanup for IPC handlers
- Minimize main process blocking operations

### Async I/O Patterns
```typescript
// Good: Async operations
const workspaces = await fs.promises.readFile(configPath, 'utf8');

// Bad: Synchronous operations
const workspaces = fs.readFileSync(configPath, 'utf8');
```

---

## 10. Common Pitfalls & Solutions

### Issue: IPC Communication Errors
**Cause**: Incorrect channel naming or argument types  
**Solution**: Use shared type definitions and validate arguments on both sides

### Issue: App Launch Failures
**Cause**: Incorrect app paths or executable permissions  
**Solution**: Implement path validation and error handling with user feedback

### Issue: Memory Leaks
**Cause**: Unclosed event listeners or unreleased resources  
**Solution**: Implement proper cleanup patterns and monitor with developer tools

### Issue: Context Bridge Security
**Cause**: Exposing entire `ipcRenderer` instead of specific methods  
**Solution**: Use preload script with selective API exposure

---

## 11. Integration & External Systems

### Linear Integration
- **Purpose**: Task management and issue tracking
- **Droid Agent**: `agility-pm-linear-task-manager` for automated task creation
- **Workflow**: Design docs → Linear issues → Development → PR tracking

### Notion Integration
- **Purpose**: Architecture Decision Records (ADR) storage
- **Database**: "Architecture Decision Records" with structured properties
- **Access**: Via Notion API for automated ADR management

---

## 12. Quick Reference for Common Tasks

### Adding New App Type Support
1. Update `WorkspaceItem` type in `shared/types.ts`
2. Implement launch logic in `LauncherService.ts`
3. Add IPC handlers for new type
4. Create UI components for configuration
5. Add tests for all layers

### Implementing New Feature
1. Create Linear issue using SOP template
2. Design component architecture
3. Write tests first (TDD approach)
4. Implement business logic in services
5. Create UI components
6. Add IPC communication layer
7. Update documentation
8. Submit PR for review

### Debugging Common Issues
```bash
# Enable verbose logging
DEBUG=agirity:* npm run dev

# Check file permissions
ls -la ~/.agirity/

# Validate configuration file
agirity validate ~/.agirity/workspaces.yaml
```

---

## 13. Agent Best Practices

### When Working on AgiRity
- **Read Documentation First**: Always check relevant docs before implementation
- **Follow Test Pyramid**: Prioritize unit tests, ensure integration coverage
- **Use Type Safety**: Leverage TypeScript for compile-time error prevention
- **Security First**: Validate all inputs, follow IPC safety patterns
- **Performance Mindful**: Consider memory usage and startup time impact

### Code Generation Guidelines
- **Avoid Magic Numbers**: Use named constants with clear semantic meaning
- **Implement Error Boundaries**: Provide user-friendly error messages
- **Follow Existing Patterns**: Use established architectural patterns
- **Document Decisions**: Use ADR template for significant architectural choices

---

*This document is maintained as the single source of truth for AI agents working on AgiRity project.*  
*Last updated: 2025-11-23*
