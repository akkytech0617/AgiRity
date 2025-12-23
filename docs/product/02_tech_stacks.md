# AgiRity 技術選定書

## コア技術スタック

### 概要

| カテゴリ           | 技術             | バージョン | 理由                                      |
| ------------------ | ---------------- | ---------- | ----------------------------------------- |
| **デスクトップFW** | Electron         | ^28.0.0    | 学習コスト低、React対応、Claude Code相性◎ |
| **UI Framework**   | React            | ^18.2.0    | Figma Make連携、コンポーネント指向        |
| **スタイリング**   | Tailwind CSS     | ^3.4.0     | ユーティリティファースト、高速開発        |
| **言語**           | TypeScript       | ^5.3.0     | 型安全、保守性、レビュー可能              |
| **ビルドツール**   | Vite             | ^5.0.0     | 高速、モダン、HMR                         |
| **パッケージング** | electron-builder | ^24.0.0    | 標準的、クロスプラットフォーム            |

---

## 開発環境

| 項目                     | 内容                |
| ------------------------ | ------------------- |
| **OS**                   | macOS (arm64 / x64) |
| **Node.js**              | v18+                |
| **パッケージマネージャ** | npm                 |
| **エディタ**             | VS Code (推奨)      |
| **AI開発ツール**         | Claude Code         |
| **デザインツール**       | Figma + Figma Make  |

---

## 将来的な移行検討

### Electron → Wails/Tauri

**タイミング:** Phase 1.5 (MVP完成後)

**理由:**

- 軽量化 (150MB → 10-15MB)
- 起動速度向上 (1秒 → 0.3秒)
- 単一バイナリ配布
- メモリ効率改善

**移行の容易性:**

- フロントエンド (React): 90%そのまま
- バックエンド: 書き直し (ただしロジックは単純)

---

## テスト戦略

### テストピラミッド

```
        /\
       /E2E\          10% (5-10 tests)
      /------\
     /Integration\    30% (20-30 tests)
    /------------\
   /  Unit Tests  \   60% (50-70 tests)
  /----------------\
```

### ツール構成

| テストレベル    | ツール                   | 対象               | 実行頻度       |
| --------------- | ------------------------ | ------------------ | -------------- |
| **E2E**         | Playwright for Electron  | 重要フロー         | コミット前、CI |
| **Integration** | Vitest + Testing Library | コンポーネント統合 | 常時(watch)    |
| **Unit**        | Vitest                   | 関数・ロジック     | 常時(watch)    |

### テストツール詳細

#### Vitest

```bash
npm install -D vitest @vitest/ui @vitest/coverage-v8
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D happy-dom
```

**特徴:**

- Viteとの統合
- Jest互換API
- 高速実行
- HMR対応

**設定:** `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
});
```

#### Playwright

```bash
npm install -D @playwright/test
```

**特徴:**

- Electron対応
- 自動待機
- スクリーンショット・動画記録
- デバッグツール

**設定:** `playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
});
```

---

### テストカバレッジ目標

| カテゴリ                | Phase 1目標 | 測定方法                |
| ----------------------- | ----------- | ----------------------- |
| **コアロジック**        | 80%+        | `npm run test:coverage` |
| **ユーティリティ**      | 70%+        | 同上                    |
| **Reactコンポーネント** | 60%+        | 同上                    |
| **全体**                | 65-70%      | 同上                    |

---

## コード品質・Linting

### ESLint

```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D eslint-plugin-react eslint-plugin-react-hooks
npm install -D eslint-config-prettier
```

**設定:** `.eslintrc.json`

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "react", "react-hooks"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        "argsIgnorePattern": "^_"
      }
    ]
  }
}
```

---

### Prettier

```bash
npm install -D prettier
```

**設定:** `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

---

### Git Hooks: Husky + lint-staged

```bash
npm install -D husky lint-staged
npx husky init
```

**`.husky/pre-commit`:**

```bash
#!/usr/bin/env sh
npx lint-staged
```

**`package.json`:**

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

---

## セキュリティ・依存関係管理

### Dependabot (GitHub標準)

**`.github/dependabot.yml`:**

```yaml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 5
```

**特徴:**

- 自動依存関係更新PR
- 脆弱性検出
- 完全無料

---

### Snyk

```bash
npm install -D snyk
```

**特徴:**

- 脆弱性スキャン
- ライセンス監視
- 自動修正PR

**GitHub Actions統合:**

```yaml
- name: Run Snyk
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

**無料枠:** 200スキャン/月

---

### SonarCloud

**特徴:**

- コード品質スコア
- バグ・コードスメル検出
- セキュリティホットスポット
- 技術的負債可視化

**GitHub Actions統合:**

```yaml
- name: SonarCloud Scan
  uses: SonarSource/sonarcloud-github-action@master
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

**無料枠:** パブリックリポジトリ無料

---

## ロギング・エラー監視

### electron-log (アプリケーションログ)

```bash
npm install electron-log
```

AgiRity では Main/Renderer 両プロセスで electron-log を使用しています。

**設定ファイル:**
- Main: `src/main/lib/logger.ts`
- Renderer: `src/renderer/lib/logger.ts`
- 共通設定: `src/shared/lib/logging/config.ts`

**ログ出力先:**

| 出力先 | Development | Production |
|--------|-------------|------------|
| ファイル (`~/.agirity/logs/main.log`) | debug | info |
| コンソール | debug | warn |

**ファイルローテーション:**
- 最大サイズ: 5MB
- 保持ファイル数: 3

**使用例:**

```typescript
import { log } from '@/main/lib/logger';

log.error('クラッシュ、重大なエラー');
log.warn('警告、起動失敗');
log.info('起動成功、ユーザー操作');
log.debug('詳細な動作ログ');
```

---

### Sentry (エラー監視)

```bash
npm install @sentry/electron
```

AgiRity では Sentry を使用してエラー監視とログ集約を行っています。

**設定ファイル:**
- Main: `src/main/lib/sentry.ts`
- Renderer: `src/renderer/lib/sentry.ts`

**環境変数:**

| 変数名 | プロセス | 説明 |
|--------|---------|------|
| `SENTRY_DSN` | Main | Main プロセス用 Sentry DSN |
| `VITE_SENTRY_DSN` | Renderer | Renderer プロセス用 Sentry DSN |

**Note**: DSN が未設定の場合、Sentry 機能は自動的に無効化されます。

**機能:**

| 関数 | 説明 |
|------|------|
| `sendLog(message, level)` | Sentry Logs にログ送信 |
| `captureIssue(message, level)` | Sentry Issues にエラー/警告を送信 |
| `captureException(error)` | 例外を Sentry Issues に送信 |
| `flushSentry()` | アプリ終了前にバッファをフラッシュ |

**連携動作:**

electron-log の hook により、すべてのログが自動的に Sentry にも送信されます:
- `info`, `debug` → Sentry Logs のみ
- `warn` → Sentry Logs + Sentry Issues (warning)
- `error` → Sentry Logs + Sentry Issues (error)

**無料枠:** 5,000 events/月

---

## ドキュメント

### TypeDoc (API ドキュメント)

```bash
npm install -D typedoc
```

**設定:** `typedoc.json`

```json
{
  "entryPoints": ["src"],
  "out": "docs",
  "exclude": ["**/*.test.ts", "**/node_modules/**"]
}
```

**生成:**

```bash
npm run docs
# → GitHub Pagesで公開
```

---

### Docusaurus (ユーザードキュメント - Phase 2)

```
docs.agirity.com
├── Getting Started
├── User Guide
├── API Reference (TypeDoc統合)
└── Developer Guide
```

---

## コミット規約・バージョニング

### Commitlint + Commitizen

```bash
npm install -D @commitlint/cli @commitlint/config-conventional
npm install -D commitizen cz-conventional-changelog
```

**`.commitlintrc.json`:**

```json
{
  "extends": ["@commitlint/config-conventional"]
}
```

**使用:**

```bash
npm run commit
# → 対話式でコミットメッセージ作成
```

---

### Standard Version (自動バージョニング)

```bash
npm install -D standard-version
```

**使用:**

```bash
npm run release
# → CHANGELOG.md 更新
# → package.json バージョンアップ
# → Git tag作成
```

---

## CI/CD

### GitHub Actions

#### CI Pipeline

**`.github/workflows/ci.yml`:**

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:coverage
      - run: npm run build
```

#### Release Pipeline

**`.github/workflows/release.yml`:**

```yaml
name: Release

on:
  push:
    tags: ['v*']

jobs:
  release:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - run: npm ci
      - run: npm run test:all
      - run: npm run package

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: dist/*.dmg
```

---

## プロジェクト構成

```
agirity/
├── src/
│   ├── main/              # Electronメインプロセス
│   │   ├── main.ts
│   │   ├── services/      # ビジネスロジック
│   │   │   ├── ProjectService.ts
│   │   │   └── ProjectService.test.ts
│   │   ├── utils/         # ユーティリティ
│   │   │   ├── launcher.ts
│   │   │   └── launcher.test.ts
│   │   └── ipc/           # IPC通信
│   │       ├── handlers.ts
│   │       └── handlers.test.ts
│   │
│   ├── renderer/          # Reactアプリ
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── components/
│   │   │   │   ├── WorkspaceCard.tsx
│   │   │   │   ├── WorkspaceCard.test.tsx
│   │   │   │   └── ...
│   │   │   ├── hooks/
│   │   │   │   ├── useWorkspaces.ts
│   │   │   │   └── useWorkspaces.test.ts
│   │   │   └── api/       # 抽象化レイヤー
│   │   │       └── workspace.ts
│   │   ├── index.html
│   │   └── main.tsx
│   │
│   └── test/              # テストユーティリティ
│       ├── setup.ts
│       ├── fixtures/
│       └── utils/
│
├── e2e/                   # E2Eテスト
│   ├── helpers/
│   │   └── electron.ts
│   ├── workspace-launch.spec.ts
│   └── project-crud.spec.ts
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── release.yml
│   │   └── security.yml
│   └── ISSUE_TEMPLATE/
│
├── .husky/                # Git hooks
├── dist/                  # ビルド成果物
├── resources/             # アイコン等
│
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── electron.vite.config.ts
├── tailwind.config.js
├── .eslintrc.json
├── .prettierrc
├── .commitlintrc.json
└── README.md
```

---

## パッケージ一覧

### dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "electron-log": "^5.2.0",
  "@sentry/electron": "^4.17.0",
  "yaml": "^2.3.0",
  "zod": "^3.22.0"
}
```

### devDependencies

```json
{
  "electron": "^28.0.0",
  "electron-builder": "^24.0.0",
  "vite": "^5.0.0",
  "@vitejs/plugin-react": "^4.2.0",

  "typescript": "^5.3.0",
  "@types/node": "^20.0.0",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",

  "vitest": "^1.2.0",
  "@vitest/ui": "^1.2.0",
  "@vitest/coverage-v8": "^1.2.0",
  "@testing-library/react": "^14.1.0",
  "@testing-library/jest-dom": "^6.1.0",
  "@testing-library/user-event": "^14.5.0",
  "happy-dom": "^12.10.0",

  "@playwright/test": "^1.40.0",

  "eslint": "^8.56.0",
  "@typescript-eslint/eslint-plugin": "^6.18.0",
  "@typescript-eslint/parser": "^6.18.0",
  "eslint-plugin-react": "^7.33.0",
  "eslint-plugin-react-hooks": "^4.6.0",
  "eslint-config-prettier": "^9.1.0",
  "prettier": "^3.1.0",

  "husky": "^8.0.0",
  "lint-staged": "^15.2.0",
  "@commitlint/cli": "^18.4.0",
  "@commitlint/config-conventional": "^18.4.0",
  "commitizen": "^4.3.0",
  "cz-conventional-changelog": "^3.3.0",
  "standard-version": "^9.5.0",

  "snyk": "^1.1200.0",
  "typedoc": "^0.25.0",

  "tailwindcss": "^3.4.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0"
}
```

---

## npm scripts

```json
{
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "preview": "electron-vite preview",

    "lint": "eslint src e2e --ext .ts,.tsx",
    "lint:fix": "eslint src e2e --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json}\" \"e2e/**/*.{ts,tsx}\"",
    "type-check": "tsc --noEmit",

    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test:coverage && npm run test:e2e",

    "commit": "cz",
    "release": "standard-version",

    "package": "npm run build && electron-builder --mac --arm64",
    "package:all": "npm run build && electron-builder --mac --arm64 --x64",

    "docs": "typedoc",

    "prepare": "husky install"
  }
}
```

---

## 対応OS・アーキテクチャ

| OS              | Phase 1 | Phase 2 | Phase 3 |
| --------------- | ------- | ------- | ------- |
| **macOS arm64** | ✅      | ✅      | ✅      |
| **macOS x64**   | -       | ✅      | ✅      |
| **Windows x64** | -       | ✅      | ✅      |
| **Linux x64**   | -       | -       | ✅      |

---

## 無料サービス枠

| サービス           | 無料枠          | Phase 1で十分? |
| ------------------ | --------------- | -------------- |
| **GitHub Actions** | 2,000分/月      | ✅             |
| **Dependabot**     | 無制限          | ✅             |
| **Snyk**           | 200スキャン/月  | ✅             |
| **SonarCloud**     | Public無料      | ✅             |
| **Codecov**        | Public無料      | ✅             |
| **Sentry**         | 5,000 events/月 | ✅             |

**→ Phase 1は完全無料で運用可能!**

---

## パフォーマンス目標

| 項目               | 目標値             | 測定方法         |
| ------------------ | ------------------ | ---------------- |
| **起動時間**       | < 1秒              | ストップウォッチ |
| **実行レスポンス** | < 0.1秒            | ログ分析         |
| **メモリ使用量**   | < 100MB (アイドル) | Activity Monitor |
| **CPU使用率**      | < 1% (アイドル)    | Activity Monitor |
| **アプリサイズ**   | 100-150MB          | ビルド成果物     |

---

## セキュリティ対策

### 機密情報管理

1. **環境変数**: `.env` ファイル (Gitignore)
2. **キーチェーン**: macOS Keychain / Windows Credential Manager
3. **暗号化**: 機密情報は暗号化して保存

### ファイルパーミッション

```bash
~/.agirity/
├── projects.yaml (600: ユーザーのみ読み書き)
└── logs/ (700: ユーザーのみアクセス)
```

---

## 開発ワークフロー

```
1. Issue作成
   ↓
2. ブランチ作成 (feature/*)
   ↓
3. テストファースト開発
   ↓
4. コミット (Commitizen)
   ↓
5. Push → PR作成
   ↓
6. CI自動実行
   ↓
7. レビュー → マージ
   ↓
8. リリース (自動)
```

---

_このドキュメントは技術の進化に伴って更新されます。_
_最終更新: 2025-11-20_
