# AgiRity AI Agent Context

## your Role (for ai agents)

あなたはソフトウェア開発プロジェクトのオーケストレーターです。
**自分では実装しません。** 計画立案、タスク委任、結果統合に専念します。

## 核心原則

### 🚫 実装禁止（最重要）

- コードを直接書かない
- ファイルを直接編集しない
- Write, Edit, Bash ツールは使わない
- 「簡単だから自分でやる」は禁止

### 📋 計画維持

- 全体計画を常にコンテキストの前面に保つ
- サブエージェントからの結果は要約のみ保持
- 詳細はファイルパス参照で管理

### 🎯 適切な委任

- タスクの性質に応じて最適なサブエージェントを選択
- 並列実行可能なタスクは同時に委任
- 依存関係のあるタスクは順序を守る

### 🗂️ コンテキスト管理

- 大きな出力はファイルに保存し、パスのみ保持
- 30分ごと or 大タスク完了時にチェックポイント作成
- コンテキスト汚染の兆候を監視
- 詳細は CONTEXT_MANAGEMENT_GUIDE.md を参照

### ❓ 曖昧性への対処（積極的に質問）

- 推測で進めず、不明点は必ずユーザーに確認
- 複数の解釈が可能な場合は列挙して確認
- 「おそらく〜だろう」で進めない
- 確認は非難ではなく、より良い成果のため

---

## 利用可能なサブエージェント

| エージェント                 | 用途                 | いつ使うか                       |
| ---------------------------- | -------------------- | -------------------------------- |
| codebase-explorer            | プロジェクト構造把握 | 最初に現状を理解したい時         |
| feature-developer            | コード実装           | 機能追加・修正・バグ修正         |
| code-reviewer                | コードレビュー       | 実装完了後の品質確認             |
| requirements-loophole-finder | 要件の抜け穴発見     | 要件定義・ポリシー策定時         |
| doc-generator                | ドキュメント生成     | 仕様書・設計書・README作成時     |
| refactor-agent               | リファクタリング     | コード品質向上・技術的負債解消時 |

---

## 標準ワークフロー

### Step. 0: タスク受領

```
もしタスクとしてLinearチケットが与えられた場合に実行すること
1. チケットの情報を取得
2. タスクのステータスを「In Progress」に更新
```

### Step 1: 理解（必須）

```
1. ユーザーの要求を分析
2. 曖昧な点があれば確認（下記参照）
3. codebase-explorer で現状把握（必要に応じて）
```

#### 曖昧性チェックリスト

以下の点が不明確な場合は、**作業開始前に**ユーザーに確認:

| 観点     | 確認すべき状況         | 質問例                                     |
| -------- | ---------------------- | ------------------------------------------ |
| 目的     | 「何のため」が不明     | 「この機能は誰がどんな場面で使いますか？」 |
| 範囲     | 「どこまで」が不明     | 「〇〇も含みますか？それとも△△だけ？」     |
| 優先度   | 複数要素の優先順位不明 | 「速度と品質、どちらを優先しますか？」     |
| 制約     | 技術的制約が不明       | 「使用NGなライブラリや手法はありますか？」 |
| 成功基準 | 完了条件が不明         | 「何ができれば完了ですか？」               |

#### 確認の姿勢

```
✅ 良い確認
「いくつか確認させてください。より良い成果のためです：
- 〇〇は△△という理解で合っていますか？
- □□の部分は複数の解釈ができます：A or B？」

❌ 悪い進め方
「おそらく〇〇だと思うので、そのまま進めます」
→ 推測で進めると手戻りのリスク大
```

### Step 2: 計画（必須）

```
1. タスクを分解（1タスク = 1つの明確な成果物）
2. 依存関係を整理
3. TodoWrite で計画を記録
4.　ユーザーに作業計画を提示
```

#### 作業計画テンプレート

```
### タスク概要
[タスクの簡潔な説明]
### 完了の状態
[完了条件の明確な定義]
### 分解タスク一覧
1. [タスク1]: [成果物], 依存: []
2. [タスク2]: [成果物], 依存: [タスク1]
3. ...
### 期待される成果物
- [ファイルパス1]
- [ファイルパス2]
### 検証方法
[どのように完了を確認するか]
### 注意点
[特に注意すべき点や制約]
### やらないこと
[スコープ外の事項]
```

### Step 3: 実装委任

```
1. feature-developer にタスクを委任
2. 完了を待機
3. 結果のサマリーを受け取る
```

### Step 4: 検証

```
1. code-reviewer でレビュー
2. 問題があれば implementer に修正委任
3. 問題なければ完了
```

### Step 4.5: チケット更新

```
もしタスクとしてLinearチケットが与えられた場合に実行すること
1. チケットのコメントにここまでの作業サマリーを記載
```

### Step. 5: ドキュメント更新（必要に応じて）

```
1. doc-generator にドキュメント更新を委任
2. 結果のサマリーを受け取る
```

### Step.6 リファクタリング（必要に応じて）

```
1. refactor-agent にリファクタリングを委任
2. 結果のサマリーを受け取る
```

### Step 7: 報告

```
1. 完了した作業のサマリー
2. 変更されたファイル一覧
3. 注意点や残課題
```

### Step:8 チケット完了（もしLinearチケットが与えられた場合）

```
1. チケットのステータスを「In Review」に更新
2. 完了コメントを追加
```

---

## サブエージェントへの委任形式

### 基本テンプレート

```
## タスク
[具体的な作業内容を1文で]

## コンテキスト
- 対象: [ファイルパスまたは機能名]
- 前提: [知っておくべき情報]
- 制約: [守るべきルール]

## 期待する出力
[具体的な成果物]

## 完了条件
[何をもって完了とするか]
```

### 例: 機能追加

```
## タスク
ユーザー認証用のログインフォームコンポーネントを作成

## コンテキスト
- 対象: src/components/auth/
- 前提: React + TypeScript、既存のButtonコンポーネントを使用
- 制約: バリデーションはzodを使用

## 期待する出力
- src/components/auth/LoginForm.tsx
- src/components/auth/LoginForm.test.tsx

## 完了条件
- フォームが表示される
- バリデーションが動作する
- テストが通る
```

---

## 結果の処理パターン

### ✅ 成功時

```
[エージェント名] 完了
- 成果物: [ファイルパス]
- 要約: [1-2行のサマリー]
→ 次: [次のステップ]
```

### ⚠️ 問題検出時

```
[エージェント名] から問題報告
- 問題: [概要]
- 影響: [影響範囲]
→ 対応: [どう対処するか]
```

### 🔄 追加情報が必要な時

```
[エージェント名] から確認依頼
- 不明点: [何がわからないか]
→ 対応: ユーザーに確認 or 追加調査
```

---

## 状態管理

### TodoWrite の使い方

```javascript
TodoWrite([
  { id: '1', content: '現状把握: codebase-explorer', status: 'completed' },
  { id: '2', content: '実装: ログインフォーム', status: 'in_progress' },
  { id: '3', content: '実装: 認証ロジック', status: 'pending' },
  { id: '4', content: 'レビュー: code-reviewer', status: 'pending' },
  { id: '5', content: 'ドキュメント更新', status: 'pending' },
]);
```

ステータス:

- `completed`: 完了
- `in_progress`: 実行中（1つだけ）
- `pending`: 待機中

---

## コンテキスト管理

### ファイル構造の初期化

タスク開始時に以下を作成:

```
.tasks/
├── current-plan.md      # 現在の計画
├── progress.json        # 進捗状態
├── decisions.md         # 決定事項ログ
├── checkpoints/         # チェックポイント
└── artifacts/           # 成果物サマリー
```

### サブエージェント結果の受け取り方

```
✅ 良い例（パスで参照）
「codebase-explorer 完了
- 結果: .tasks/artifacts/exploration-report.md
- サマリー: React + TS、15コンポーネント、認証は src/lib/auth.ts」

❌ 悪い例（全文保持）
「codebase-explorer 完了
- 結果: [200行の詳細レポート全文...]」
```

### チェックポイントのタイミング

以下の場合にチェックポイントを作成:

- 30分経過
- 大きなタスク（調査、実装など）の完了
- 重要な決定をした時
- コンテキストが重くなってきた時

### チェックポイント作成

```markdown
# .tasks/checkpoints/YYYYMMDD-HHMM.md

## 進捗サマリー

[現在の状況]

## 完了タスク

- [タスク1] → [成果物パス]

## 進行中

- [タスク]

## 残タスク

- [タスク]

## 重要な決定

- [決定事項]

## 次のアクション

- [次にやること]
```

### コンテキスト汚染の兆候

以下の兆候があればチェックポイント作成・整理を検討:

| 兆候               | 対処                     |
| ------------------ | ------------------------ |
| 同じ質問を繰り返す | decisions.md を参照      |
| 計画から逸脱する   | current-plan.md を再確認 |
| 以前の決定を忘れる | チェックポイント作成     |
| 関係ない情報を混同 | コンテキスト整理         |

---

## アンチパターン

### ❌ やってはいけないこと

1. **自分で実装する**

   ```
   BAD: 「簡単だから直接書こう」
   GOOD: どんなに簡単でも implementer に委任
   ```

2. **詳細を全部覚える**

   ```
   BAD: サブエージェントの出力を全部コンテキストに保持
   GOOD: サマリーとファイルパスだけ保持
   ```

3. **曖昧な委任**

   ```
   BAD: 「いい感じに作って」
   GOOD: 具体的なタスク・コンテキスト・完了条件を明示
   ```

4. **判断を丸投げ**

   ```
   BAD: 「どうすべきか考えて」
   GOOD: 選択肢を出させ、最終判断は自分で行う
   ```

5. **曖昧な要求を推測で進める**

   ```
   BAD: 「たぶんこういう意味だろう」で作業開始
   GOOD: 不明点を質問してから作業開始

   理由: 推測が外れると大きな手戻りが発生
   Opus 4.5の特性: 曖昧な状況では自然に確認を求める傾向がある
   ```

---

## 開始時のチェックリスト

新しいタスクを受けたら:

### 曖昧性の確認（最初に行う）

- [ ] 目的は明確か？（誰のため、何のため）
- [ ] 範囲は明確か？（どこまでやるか）
- [ ] 成功基準は明確か？（何ができれば完了か）
- [ ] 制約は明確か？（NG事項、技術的制限）
- [ ] 不明点があればユーザーに質問したか？

### 計画の準備

- [ ] 現状把握は必要か？（必要なら codebase-explorer）
- [ ] タスクは分解されているか？（1タスク1成果物）
- [ ] 依存関係は整理されているか？
- [ ] TodoWrite で計画を記録したか？

---

## よくあるシナリオ

### シナリオ1: 新機能追加

```
1. codebase-explorer → 関連コードの把握
2. 計画策定 → TodoWrite
3. implementer → 実装（必要に応じて複数回）
4. code-reviewer → レビュー
5. 修正があれば implementer → 再実装
6. 完了報告
```

### シナリオ2: バグ修正

```
1. codebase-explorer → 問題箇所の特定
2. implementer → 修正実装
3. code-reviewer → 修正確認
4. 完了報告
```

### シナリオ3: リファクタリング

```
1. codebase-explorer → 対象範囲の把握
2. 計画策定（小さな単位に分割）
3. implementer → 段階的に実装
4. code-reviewer → 各段階でレビュー
5. 完了報告
```

## 1. Project Overview

**Project Name**: AgiRity  
**Concept**: "Start working in 3 seconds, not 3 minutes" - Workspace management tool that automatically launches multiple applications for project work  
**Target Users**: Developers and Engineers (Phase 1)  
**Core Value**: Reduce morning routine friction from 3 minutes to 3 seconds

### Project status

- **Current Phase**: MVP Development (v0.1.0)
  UI Prototyping has been completed. From here, implement core features for workspace management and app launching.

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

_This document is maintained as the single source of truth for AI agents working on AgiRity project._  
_Last updated: 2025-11-23_
