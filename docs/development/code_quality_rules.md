# AgiRity コード品質ルール

## 1. 概要

AgiRity では以下のツールでコード品質を担保しています:

| ツール         | 役割                             | 実行タイミング         |
| -------------- | -------------------------------- | ---------------------- |
| **ESLint**     | コード品質・セキュリティチェック | 開発時、pre-commit、CI |
| **Prettier**   | コードフォーマット               | 開発時、pre-commit     |
| **TypeScript** | 型チェック                       | 開発時、pre-commit、CI |
| **SonarCloud** | 継続的コード品質分析             | CI (TBD)               |

---

## 2. ESLint

### 2.1 設定ファイル

`eslint.config.mjs` (Flat Config 形式)

### 2.2 採用プラグイン

| プラグイン                     | 目的                       | 設定                                        |
| ------------------------------ | -------------------------- | ------------------------------------------- |
| `@eslint/js`                   | JavaScript 基本ルール      | `recommended`                               |
| `typescript-eslint`            | TypeScript 厳格ルール      | `strictTypeChecked`, `stylisticTypeChecked` |
| `eslint-plugin-react-hooks`    | React Hooks ルール         | `recommended`                               |
| `eslint-plugin-react-refresh`  | React Fast Refresh 対応    | カスタム                                    |
| `eslint-plugin-security`       | セキュリティ脆弱性検出     | `recommended`                               |
| `eslint-plugin-sonarjs`        | コード品質・複雑度         | `recommended`                               |
| `@microsoft/eslint-plugin-sdl` | Microsoft SDL セキュリティ | `common`, `electron`, `react`               |
| `eslint-config-prettier`       | Prettier との競合回避      | -                                           |

### 2.3 TypeScript 厳格ルール

> **ADR**: [ADR-001: Strict ESLint/TypeScript Rules](../adr/001-strict-eslint-typescript-rules.md)

AI コード生成の品質ゲートとして、以下のルールを `error` レベルで適用:

| ルール                                             | 目的                           |
| -------------------------------------------------- | ------------------------------ |
| `@typescript-eslint/no-explicit-any`               | `any` 型の禁止                 |
| `@typescript-eslint/no-unsafe-assignment`          | 暗黙の `any` 伝播防止          |
| `@typescript-eslint/no-unsafe-call`                | 暗黙の `any` 伝播防止          |
| `@typescript-eslint/no-unsafe-member-access`       | 暗黙の `any` 伝播防止          |
| `@typescript-eslint/no-unsafe-return`              | 暗黙の `any` 伝播防止          |
| `@typescript-eslint/no-floating-promises`          | 未処理の Promise 検出          |
| `@typescript-eslint/await-thenable`                | 不要な `await` 検出            |
| `@typescript-eslint/no-misused-promises`           | Promise 誤用検出               |
| `@typescript-eslint/require-await`                 | 不要な `async` 検出            |
| `@typescript-eslint/strict-boolean-expressions`    | 曖昧な条件式の禁止             |
| `@typescript-eslint/no-unnecessary-condition`      | 到達不能コード検出             |
| `@typescript-eslint/restrict-template-expressions` | テンプレートリテラルの型安全性 |

**採用理由**:

- AI は「動くコード」を生成するが、「最適なコード」とは限らない
- 過剰な防御的コード（不要な null チェック）が生成されやすい
- 曖昧な条件式が混在しやすい
- 人間のレビュー負荷を軽減

### 2.4 セキュリティルール

> **ADR**: [ADR-003: Security Linter Configuration](../adr/003-security-linter-configuration.md)

#### eslint-plugin-security

Node.js 向けセキュリティパターンを検出:

| ルール                                  | 検出対象                      |
| --------------------------------------- | ----------------------------- |
| `detect-unsafe-regex`                   | ReDoS 脆弱性のある正規表現    |
| `detect-buffer-noassert`                | Buffer の noAssert オプション |
| `detect-child-process`                  | 危険な child_process 使用     |
| `detect-disable-mustache-escape`        | Mustache エスケープ無効化     |
| `detect-eval-with-expression`           | eval() の動的使用             |
| `detect-no-csrf-before-method-override` | CSRF 脆弱性                   |
| `detect-non-literal-fs-filename`        | 動的ファイルパス              |
| `detect-non-literal-regexp`             | 動的正規表現                  |
| `detect-non-literal-require`            | 動的 require                  |
| `detect-object-injection`               | オブジェクトインジェクション  |
| `detect-possible-timing-attacks`        | タイミング攻撃                |
| `detect-pseudoRandomBytes`              | 弱い乱数生成                  |

#### @microsoft/eslint-plugin-sdl

Microsoft Security Development Lifecycle ルール:

- `common`: 一般的なセキュリティルール
- `electron`: Electron 固有のセキュリティルール
- `react`: React 固有のセキュリティルール

### 2.5 その他のルール

| ルール                                 | 設定    | 理由                |
| -------------------------------------- | ------- | ------------------- |
| `no-console`                           | `error` | logger を使用すべき |
| `react-refresh/only-export-components` | `warn`  | HMR 最適化          |

### 2.6 ルール緩和（例外）

#### テストファイル (`tests/**/*.ts`, `tests/**/*.tsx`)

```javascript
'@typescript-eslint/unbound-method': 'off',
'@typescript-eslint/no-unsafe-assignment': 'off',
'@typescript-eslint/no-unsafe-call': 'off',
'@typescript-eslint/no-unsafe-member-access': 'off',
```

**理由**: テストではモックの型が複雑になりがちで、過度な型付けは可読性を下げる。

#### Preload ファイル (`src/main/preload.ts`)

```javascript
'@typescript-eslint/no-unsafe-argument': 'off',
```

**理由**: Electron IPC の `contextBridge.exposeInMainWorld` は型が複雑。

### 2.7 警告の抑制方法

特定の行で警告を抑制する場合:

```typescript
// eslint-disable-next-line security/detect-object-injection
const value = obj[key];
```

ファイル全体で抑制する場合:

```typescript
/* eslint-disable security/detect-non-literal-fs-filename */
```

**注意**: 抑制する場合は理由をコメントで記載すること。

---

## 3. Prettier

### 3.1 設定ファイル

`.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### 3.2 ルール詳細

| ルール           | 値       | 説明                           |
| ---------------- | -------- | ------------------------------ |
| `semi`           | `true`   | セミコロンを付ける             |
| `singleQuote`    | `true`   | シングルクォートを使用         |
| `tabWidth`       | `2`      | インデント幅 2 スペース        |
| `trailingComma`  | `es5`    | ES5 互換の末尾カンマ           |
| `printWidth`     | `100`    | 1行の最大文字数                |
| `bracketSpacing` | `true`   | オブジェクトリテラルのスペース |
| `arrowParens`    | `always` | アロー関数の引数に常に括弧     |
| `endOfLine`      | `lf`     | 改行コード LF                  |

### 3.3 除外設定

`.prettierignore`:

```
node_modules
dist
dist-electron
coverage
.idea
.vscode
.DS_Store
package-lock.json
pnpm-lock.yaml
yarn.lock
```

---

## 4. TypeScript

### 4.1 設定ファイル

- `tsconfig.json`: メイン設定
- `tsconfig.node.json`: Node.js (Vite 設定ファイル等) 用

### 4.2 厳格オプション

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### 4.3 パスエイリアス

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

使用例:

```typescript
import { ConfigService } from '@/main/services/ConfigService';
```

---

## 5. Snyk

### 5.1 概要

[Snyk](https://snyk.io/) はセキュリティスキャンツールです。AgiRity では以下の2つの機能を使用しています:

| 機能                       | 説明                     | コマンド             |
| -------------------------- | ------------------------ | -------------------- |
| **Snyk Open Source (SCA)** | 依存関係の脆弱性スキャン | `just security`      |
| **Snyk Code (SAST)**       | ソースコードの静的解析   | `just security-code` |

### 5.2 Snyk Open Source (SCA)

#### 機能

- `package.json` / `package-lock.json` の依存関係をスキャン
- 既知の脆弱性 (CVE) を検出
- 修正可能なバージョンを提案

#### 実行方法

```bash
# 依存関係スキャン
just security

# または直接実行
snyk test
```

#### 出力例

```
Testing /path/to/project...

✗ High severity vulnerability found in lodash
  Description: Prototype Pollution
  Info: https://snyk.io/vuln/SNYK-JS-LODASH-567746
  Introduced through: some-package@1.0.0
  Fix: Upgrade to lodash@4.17.21
```

#### 対応方針

| 深刻度       | 対応                         |
| ------------ | ---------------------------- |
| **Critical** | 即時対応（リリースブロック） |
| **High**     | 1週間以内に対応              |
| **Medium**   | 次回リリースまでに対応       |
| **Low**      | バックログに追加             |

### 5.3 Snyk Code (SAST)

#### 機能

- ソースコードの静的解析
- セキュリティ脆弱性パターンを検出
- コードの品質問題を検出

#### 実行方法

```bash
# ソースコードスキャン
just security-code

# または直接実行
snyk code test
```

#### 検出対象

| カテゴリ             | 例                                         |
| -------------------- | ------------------------------------------ |
| **Injection**        | SQL Injection, Command Injection, XSS      |
| **Cryptography**     | 弱い暗号化、ハードコードされたシークレット |
| **Input Validation** | 未検証の入力                               |
| **Error Handling**   | 不適切なエラーハンドリング                 |
| **Code Quality**     | 到達不能コード、未使用変数                 |

### 5.4 全スキャン実行

```bash
# SCA + SAST を両方実行
just security-all
```

### 5.5 セットアップ

#### CLI インストール

```bash
# npm 経由
npm install -g snyk

# または Homebrew (macOS)
brew install snyk
```

#### 認証

```bash
# Snyk アカウントで認証
snyk auth
```

#### 環境変数 (CI 用)

| 変数名       | 説明              |
| ------------ | ----------------- |
| `SNYK_TOKEN` | Snyk API トークン |

### 5.6 Git Hooks との統合

`lefthook.yml` で `pre-push` 時に自動実行:

```yaml
pre-push:
  commands:
    scan:
      run: just --color never security-all
```

### 5.7 脆弱性の無視 (例外設定)

誤検知や対応不要な脆弱性を無視する場合:

```bash
# 特定の脆弱性を無視
snyk ignore --id=SNYK-JS-EXAMPLE-123456

# 理由を記載
snyk ignore --id=SNYK-JS-EXAMPLE-123456 --reason="False positive, not applicable"
```

無視設定は `.snyk` ファイルに保存されます。

### 5.8 無料枠

| プラン | 制限          |
| ------ | ------------- |
| Free   | 200 テスト/月 |
| Team   | 無制限        |

---

## 6. SonarCloud (TBD)

### 6.1 概要

SonarCloud は継続的なコード品質分析ツールです。

### 6.2 Quality Gate 基準 (計画)

| 指標                   | 閾値   |
| ---------------------- | ------ |
| Coverage               | >= 70% |
| Duplicated Lines       | < 3%   |
| Maintainability Rating | A      |
| Reliability Rating     | A      |
| Security Rating        | A      |

### 6.3 重視する指標 (計画)

| 指標                  | 説明                             |
| --------------------- | -------------------------------- |
| **Code Smells**       | 保守性を下げるコード             |
| **Bugs**              | 潜在的なバグ                     |
| **Vulnerabilities**   | セキュリティ脆弱性               |
| **Security Hotspots** | セキュリティレビューが必要な箇所 |
| **Technical Debt**    | 修正に必要な推定時間             |

### 6.4 実装状況

- [ ] SonarCloud プロジェクト設定
- [ ] GitHub Actions 統合
- [ ] Quality Gate 設定
- [ ] PR コメント有効化

---

## 6. コマンド

### 6.1 Lint

```bash
# ESLint 実行
just lint

# ESLint 自動修正
just fix

# npm script 直接実行
npm run lint
npm run lint:fix
```

### 6.2 Format

```bash
# フォーマットチェック
just format-check

# フォーマット実行
just format

# npm script 直接実行
npm run format:check
npm run format
```

### 6.3 型チェック

```bash
# TypeScript 型チェック
just type-check

# npm script 直接実行
npm run type-check
```

### 6.4 全チェック

```bash
# type-check + format-check + lint
just check
```

---

## 7. エディタ設定

### 7.1 VS Code 推奨設定

`.vscode/settings.json` (推奨):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### 7.2 推奨拡張機能

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens) (エラー表示強化)

---

## 8. トラブルシューティング

### 8.1 ESLint エラーが解決できない

```bash
# キャッシュクリア
rm -rf node_modules/.cache

# 依存関係再インストール
rm -rf node_modules
npm install
```

### 8.2 Prettier と ESLint が競合する

`eslint-config-prettier` が最後に読み込まれていることを確認:

```javascript
// eslint.config.mjs
export default tseslint.config(
  // ... 他の設定 ...
  eslintConfigPrettier // 最後に配置
);
```

### 8.3 型エラーが IDE に表示されない

```bash
# TypeScript 言語サーバー再起動 (VS Code)
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

---

## 9. 関連ドキュメント

| ドキュメント                                                                            | 内容                               |
| --------------------------------------------------------------------------------------- | ---------------------------------- |
| [ADR-001: Strict ESLint/TypeScript Rules](../adr/001-strict-eslint-typescript-rules.md) | TypeScript 厳格ルール採用の決定    |
| [ADR-003: Security Linter Configuration](../adr/003-security-linter-configuration.md)   | セキュリティ Linter 採用の決定     |
| [CI/CD ガイド](./cicd_guide.md)                                                         | CI/CD パイプラインでのチェック実行 |
| [テスト戦略](../implementation/testing_strategy.md)                                     | テスト品質基準                     |

---

## 10. ルール変更時の手順

1. `eslint.config.mjs` または `.prettierrc` を変更
2. `just check` で全ファイルをチェック
3. 必要に応じて既存コードを修正
4. ADR を作成（大きな変更の場合）
5. PR を作成してレビュー

---

_最終更新: 2025-12-23_
