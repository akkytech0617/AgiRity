# テスト

## フレームワーク

| フレームワーク | 用途 | パッケージ |
|---------------|------|-----------|
| Vitest | 単体テスト | `vitest` ^4.0.16 |
| Playwright | E2E テスト | `@playwright/test` ^1.57.0 |
| v8 Coverage | カバレッジ計測 | `@vitest/coverage-v8` ^4.0.16 |
| React Testing Library | React コンポーネントテスト | `@testing-library/react` ^16.3.1 |
| Testing Library Jest DOM | DOM アサーション | `@testing-library/jest-dom` ^6.9.1 |
| Testing Library User Event | ユーザー操作シミュレーション | `@testing-library/user-event` ^14.6.1 |
| jsdom | ブラウザ環境シミュレーション | `jsdom` ^27.4.0 |
| electron-playwright-helpers | Electron E2E テスト補助 | `electron-playwright-helpers` ^2.0.1 |

## 実行コマンド

| コマンド | 内容 |
|---------|------|
| `just test` | 単体テスト実行 |
| `just test-watch` | ウォッチモードでテスト実行 |
| `just coverage` | カバレッジレポート付きテスト |
| `just e2e` | E2E テスト実行 |
| `npm run test:unit` | 単体テストのみ実行 |
| `npm run test:e2e:ui` | Playwright UI モードで E2E |
| `npm run test:e2e:debug` | デバッグモードで E2E |
| `npm run test:smoke` | スモークテスト |

## テストディレクトリ構造

```
tests/
├── unit/
│   ├── main/
│   │   ├── services/
│   │   │   ├── ProjectService.test.ts
│   │   │   ├── LauncherService.test.ts
│   │   │   └── ConfigService.test.ts
│   │   └── adapters/
│   │       ├── AppAdapter.test.ts
│   │       ├── ShellAdapter.test.ts
│   │       └── FileSystemAdapter.test.ts
│   ├── renderer/
│   │   └── components/
│   │       ├── WorkspaceEditor.test.tsx
│   │       └── ...
│   └── shared/
│       └── lib/
│           └── workspace-utils.test.ts
├── e2e/
│   ├── playwright.config.ts
│   ├── dev-mode-test.spec.ts
│   └── smoke/
└── ...
```

## 単体テストパターン

### モックアダプター注入（`createContainer()`）

DI コンテナの `createContainer(overrides)` を使用して、テスト時にアダプターをモックに差し替えます。

```typescript
import { createContainer } from '@/main/container';

const mockFs = { readFile: vi.fn(), writeFile: vi.fn(), mkdir: vi.fn() };
const container = createContainer({ fileSystem: mockFs });
```

### React Testing Library（jsdom 環境）

コンポーネントテストは jsdom 環境で React Testing Library を使用します。

- `render()` でコンポーネントをマウント
- `screen.getByText()`, `screen.getByRole()` で要素を取得
- `userEvent.click()` でユーザー操作をシミュレート
- `@testing-library/jest-dom` のマッチャー（`toBeInTheDocument()` 等）を使用

### 共有ユーティリティテスト

`src/shared/lib/` 配下の純粋関数は、モックなしで直接テスト可能です。

```typescript
import { selectItemsToLaunch } from '@/shared/lib/workspace-utils';
// モック不要、入力と出力の検証のみ
```

## カバレッジ設定

- プロバイダー: `v8`
- 設定ファイル: `vitest.config.ts`（または `vite.config.ts`）
- レポート形式: テキスト + HTML
- カバレッジ目標は `docs/implementation/testing_strategy.md` を参照

## E2E テスト

- **フレームワーク:** Playwright + `electron-playwright-helpers`
- **設定:** `tests/e2e/playwright.config.ts`
- **前提:** `VITE_USE_MOCK_DATA=false` でビルド済みであること
- **コマンド:** `just e2e` または `npm run test:e2e`

### E2E テストの種類

| テスト | ファイル | 内容 |
|--------|---------|------|
| 開発モードテスト | `dev-mode-test.spec.ts` | 基本的な動作確認 |
| スモークテスト | `smoke/` | 主要機能の迅速な検証 |

## 主要ファイル

| ファイル | 役割 |
|---------|------|
| `vitest.config.ts` / `vite.config.ts` | Vitest 設定 |
| `tests/e2e/playwright.config.ts` | Playwright 設定 |
| `src/main/container.ts` | テスト用 DI コンテナ |
| `src/renderer/mocks/workspaces.ts` | モックワークスペースデータ |
| `docs/implementation/testing_strategy.md` | テスト戦略ドキュメント |
