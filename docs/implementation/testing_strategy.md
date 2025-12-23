# AgiRity テスト戦略

## 1. 概要

### テストピラミッド

```
           /\
          /E2E\           Smoke + Critical Path (Playwright)
         /------\
        /  Unit  \        Services, Components, Schemas (Vitest)
       /----------\
      /   Static   \      TypeScript, ESLint, Prettier
     /--------------\
```

### テストツール構成

| レベル | ツール | 対象 |
|--------|--------|------|
| Static Analysis | TypeScript, ESLint, Prettier | 型安全性、コード品質 |
| Unit Tests | Vitest + Testing Library | Services, Components, Schemas |
| E2E Tests | Playwright for Electron | アプリ起動、重要フロー |

### カバレッジ目標

| 対象 | 目標 |
|------|------|
| 全体 | 70% 以上 |
| ビジネスロジック (Services) | 80% 以上 |
| IPC 通信 | 90% 以上 |

---

## 2. ディレクトリ構造

```
tests/
├── unit/                           # Unit テスト
│   ├── setup.ts                    # Vitest セットアップ
│   ├── mocks/                      # 共有モック
│   │   └── adapters.ts             # Adapter/Service モックファクトリ
│   ├── main/                       # Main プロセステスト
│   │   ├── services/               # Service テスト
│   │   │   ├── ConfigService.test.ts
│   │   │   ├── ProjectService.test.ts
│   │   │   └── LauncherService.test.ts
│   │   └── lib/                    # ユーティリティテスト
│   │       └── sentry.test.ts
│   ├── renderer/                   # Renderer プロセステスト
│   │   └── components/             # React コンポーネントテスト
│   │       ├── Layout.test.tsx
│   │       ├── Sidebar.test.tsx
│   │       ├── Header.test.tsx
│   │       ├── QuickLaunch.test.tsx
│   │       └── AddItemModal.test.tsx
│   └── shared/                     # 共有コードテスト
│       └── types.test.ts           # Zod スキーマテスト
├── e2e/                            # E2E テスト
│   ├── playwright.config.ts        # Playwright 設定
│   ├── fixtures/                   # テストフィクスチャ
│   │   ├── electron.fixture.ts     # 本番ビルド用
│   │   └── electron-dev.fixture.ts # 開発モード用
│   ├── smoke/                      # Smoke テスト
│   │   └── app-launch.spec.ts
│   └── dev-mode-test.spec.ts       # 開発モードテスト
└── results/                        # テスト結果出力
    └── e2e/
        ├── html/                   # HTML レポート
        └── junit.xml               # JUnit レポート
```

---

## 3. Unit テスト

### 設定ファイル

**vitest.config.ts**:
```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    setupFiles: ['./tests/unit/setup.ts'],
    mockReset: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});
```

**tests/unit/setup.ts**:
```typescript
import '@testing-library/jest-dom/vitest';
```

### モックファクトリ (`tests/unit/mocks/adapters.ts`)

DI コンテナに対応したモックファクトリを提供:

```typescript
// Adapter モック
createMockFileSystemAdapter()    // IFileSystemAdapter
createMockOSAdapter(homeDir)     // IOSAdapter
createMockShellAdapter()         // IShellAdapter

// Service モック
createMockConfigService(homeDir) // IConfigService
createMockProjectService()       // IProjectService
createMockLauncherService()      // ILauncherService
```

### テストパターン

#### Service テスト例

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigService } from '@/main/services/ConfigService';
import { createMockFileSystemAdapter, createMockOSAdapter } from '../../mocks/adapters';

describe('ConfigService', () => {
  const TEST_HOME_DIR = '/test/home';
  let mockOsAdapter: ReturnType<typeof createMockOSAdapter>;
  let mockFsAdapter: ReturnType<typeof createMockFileSystemAdapter>;
  let service: ConfigService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOsAdapter = createMockOSAdapter(TEST_HOME_DIR);
    mockFsAdapter = createMockFileSystemAdapter();
    service = new ConfigService(mockOsAdapter, mockFsAdapter);
  });

  describe('getConfigDir', () => {
    it('should return the correct config directory path', () => {
      expect(service.getConfigDir()).toBe(`${TEST_HOME_DIR}/.agirity`);
    });
  });
});
```

#### React コンポーネントテスト例

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Header } from '@/renderer/components/Header';

describe('Header', () => {
  it('should render title', () => {
    render(<Header title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
```

#### Zod スキーマテスト例

```typescript
import { describe, it, expect } from 'vitest';
import { WorkspaceSchema, WorkspaceItemSchema } from '@/shared/types';

describe('WorkspaceItemSchema', () => {
  it('should validate app item with path', () => {
    const item = { type: 'app', name: 'VS Code', path: '/Applications/VS Code.app' };
    expect(() => WorkspaceItemSchema.parse(item)).not.toThrow();
  });

  it('should reject browser item without urls', () => {
    const item = { type: 'browser', name: 'Chrome' };
    expect(() => WorkspaceItemSchema.parse(item)).toThrow();
  });
});
```

### npm scripts

```bash
npm run test           # 全 Unit テスト実行
npm run test:watch     # ウォッチモード
npm run test:coverage  # カバレッジ付き実行
```

---

## 4. E2E テスト

### 設定ファイル

**tests/e2e/playwright.config.ts**:
```typescript
export default defineConfig({
  testDir: '.',
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  retries: 2,
  reporter: [
    ['html', { outputFolder: '../results/e2e/html' }],
    ['junit', { outputFile: '../results/e2e/junit.xml' }],
    ['github'],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```

### フィクスチャ

#### 本番ビルド用 (`electron.fixture.ts`)

```typescript
import { test as base, _electron as electron } from '@playwright/test';
import { parseElectronApp } from 'electron-playwright-helpers';

export const test = base.extend<{ app: ElectronApplication }>({
  app: async ({}, use) => {
    const buildPath = './dist/mac-arm64';
    const appInfo = parseElectronApp(buildPath);
    const app = await electron.launch({
      args: [appInfo.main],
      executablePath: appInfo.executable,
    });
    await use(app);
    await app.close();
  },
});
```

#### 開発モード用 (`electron-dev.fixture.ts`)

開発サーバー経由でテスト実行。ビルド不要で高速。

### テストカテゴリ

#### Smoke テスト (`tests/e2e/smoke/`)

最低限の動作確認:

- アプリ起動
- コンソールエラーなし
- メインウィンドウ表示
- React アプリ読み込み

```typescript
test('should launch app without console errors', async ({ app }) => {
  const errors: string[] = [];
  const window = await app.firstWindow();

  window.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await window.waitForLoadState('domcontentloaded');

  expect(errors.filter(err =>
    err.includes('process.env') ||
    err.includes('Maximum call stack')
  )).toHaveLength(0);
});
```

#### 機能テスト

ワークスペース管理などの重要フロー:

- ワークスペース作成 → 保存 → 一覧表示
- アイテム追加 → 起動
- 設定変更

### npm scripts

```bash
npm run test:e2e        # 全 E2E テスト (本番ビルド必要)
npm run test:e2e:dev    # 開発モードテスト
npm run test:e2e:ui     # Playwright UI モード
npm run test:e2e:debug  # デバッグモード
npm run test:smoke      # Smoke テストのみ
```

---

## 5. セキュリティテスト

### 必須チェック項目

| 項目 | テスト内容 | テストファイル |
|------|-----------|---------------|
| Path Injection | `../` を含むパスが拒否される | `LauncherService.test.ts` |
| Zod Validation | 不正な入力が拒否される | `types.test.ts` |
| Protocol Whitelist | 許可されたプロトコルのみ | `LauncherService.test.ts` |

### 例: パスインジェクションテスト

```typescript
it('should reject path traversal attempts', async () => {
  const item = { type: 'folder', name: 'Evil', path: '../../../etc/passwd' };
  await expect(service.launchItem(item)).rejects.toThrow();
});
```

---

## 6. CI/CD 統合

### GitHub Actions ワークフロー

```yaml
name: Test

on: [push, pull_request]

jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v4

  e2e-test:
    runs-on: macos-latest
    needs: unit-test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: e2e-results
          path: tests/results/e2e/
```

### テスト実行タイミング

| イベント | Unit | E2E |
|---------|------|-----|
| Push (feature/*) | Yes | No |
| Pull Request | Yes | Yes (Smoke のみ) |
| Merge to main | Yes | Yes (全て) |
| Release | Yes | Yes (全て) |

---

## 7. ベストプラクティス

### テスト作成ガイドライン

1. **Arrange-Act-Assert パターン**を遵守
2. **1テスト1アサーション**を心がける
3. **モックは最小限**に（DI で注入されたもののみ）
4. **テスト名は日本語 OK**（何をテストしているか明確に）

### 命名規則

| 種類 | パターン | 例 |
|------|---------|-----|
| Unit テスト | `*.test.ts` / `*.test.tsx` | `ConfigService.test.ts` |
| E2E テスト | `*.spec.ts` | `app-launch.spec.ts` |

### テストデータ

- **Unit**: インラインまたは `mocks/` ディレクトリ
- **E2E**: `fixtures/` ディレクトリ

---

## 8. トラブルシューティング

### よくある問題

#### E2E テストが起動しない

```bash
# ビルドが必要
npm run build
npm run test:e2e
```

#### モックがリセットされない

```typescript
// beforeEach で vi.clearAllMocks() を呼ぶ
beforeEach(() => {
  vi.clearAllMocks();
});
```

#### React コンポーネントテストで window API エラー

```typescript
// setup.ts でグローバルモックを設定
vi.mock('@/renderer/api', () => ({
  workspaceApi: { load: vi.fn() },
  launcherApi: { launchItem: vi.fn() },
}));
```

---

_最終更新: 2025-12-23_
