# AgiRity CI/CD ガイド

## 1. 概要

AgiRity の CI/CD は以下の3層で構成されています:

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions                            │
│   (CI/CD パイプライン - リモート実行)                         │
├─────────────────────────────────────────────────────────────┤
│                      Lefthook                                │
│   (Git Hooks - コミット/プッシュ時の自動チェック)             │
├─────────────────────────────────────────────────────────────┤
│                      Justfile                                │
│   (タスクランナー - ローカル開発用コマンド)                   │
└─────────────────────────────────────────────────────────────┘
```

| レイヤー     | ツール         | 役割               | 実行タイミング      |
| ------------ | -------------- | ------------------ | ------------------- |
| ローカル開発 | Just           | タスクランナー     | 手動実行            |
| Git Hooks    | Lefthook       | 品質ゲート         | コミット/プッシュ時 |
| リモート CI  | GitHub Actions | 自動テスト・ビルド | Push/PR 時          |

---

## 2. Just (タスクランナー)

### 2.1 概要

[Just](https://just.systems/) は `make` の代替となるシンプルなタスクランナーです。
`Justfile` に定義されたタスクを実行します。

### 2.2 インストール

```bash
# macOS
brew install just

# Windows
winget install just

# Linux (Arch)
pacman -S just

# Linux (Ubuntu) - Rust経由
cargo install just
```

### 2.3 利用可能なコマンド

```bash
just          # 利用可能なタスク一覧を表示
just --list   # 同上
```

#### 開発

| コマンド       | 説明                                      |
| -------------- | ----------------------------------------- |
| `just dev`     | 開発サーバー起動 (Electron + React + HMR) |
| `just install` | 依存関係インストール                      |

#### チェック

| コマンド            | 説明                                              |
| ------------------- | ------------------------------------------------- |
| `just check`        | 全チェック実行 (type-check + format-check + lint) |
| `just type-check`   | TypeScript 型チェック                             |
| `just lint`         | ESLint 実行                                       |
| `just fix`          | ESLint 自動修正                                   |
| `just format-check` | Prettier フォーマットチェック                     |
| `just format`       | Prettier フォーマット実行                         |

#### テスト

| コマンド          | 説明                         |
| ----------------- | ---------------------------- |
| `just test`       | Unit テスト実行              |
| `just test-watch` | Unit テスト (ウォッチモード) |
| `just coverage`   | Unit テスト + カバレッジ     |
| `just e2e`        | E2E テスト実行               |

#### ビルド・リリース

| コマンド       | 説明                           |
| -------------- | ------------------------------ |
| `just clean`   | ビルド成果物削除               |
| `just build`   | プロダクションビルド           |
| `just package` | インストーラー作成             |
| `just release` | リリース (タグ作成 + プッシュ) |

#### セキュリティ

| コマンド             | 説明                        |
| -------------------- | --------------------------- |
| `just security`      | Snyk 依存関係スキャン (SCA) |
| `just security-code` | Snyk コードスキャン (SAST)  |
| `just security-all`  | 全セキュリティスキャン      |
| `just sonar`         | SonarCloud スキャン         |

#### CI

| コマンド  | 説明                                                         |
| --------- | ------------------------------------------------------------ |
| `just ci` | ローカル CI 実行 (check + test + e2e + security-all + build) |

### 2.4 よく使うワークフロー

```bash
# 開発開始
just dev

# PR 作成前のチェック
just ci

# コード整形
just format
just fix

# テスト実行
just test
just coverage
```

---

## 3. Lefthook (Git Hooks)

### 3.1 概要

[Lefthook](https://github.com/evilmartians/lefthook) は高速な Git hooks マネージャーです。
コミットやプッシュ時に自動的にチェックを実行し、品質を担保します。

### 3.2 設定ファイル

`lefthook.yml`:

```yaml
pre-commit:
  parallel: true
  commands:
    lint:
      glob: '*.{ts,tsx}'
      run: just --color never lint
    format-check:
      glob: '*.{ts,tsx,json,md,yml,yaml}'
      run: just --color never format-check
    typecheck:
      run: just --color never type-check

pre-push:
  parallel: true
  commands:
    test:
      run: just --color never test
    scan:
      run: just --color never security-all
```

### 3.3 実行タイミング

| フック       | 実行タイミング      | 実行内容                       |
| ------------ | ------------------- | ------------------------------ |
| `pre-commit` | `git commit` 実行時 | lint, format-check, type-check |
| `pre-push`   | `git push` 実行時   | test, security-all             |

### 3.4 インストール・セットアップ

```bash
# 依存関係インストール時に自動セットアップ
npm install
# → lefthook install が自動実行される (package.json の "prepare" スクリプト)
```

### 3.5 手動インストール

```bash
# Lefthook のインストール
npm install -D lefthook

# Git hooks のセットアップ
npx lefthook install
```

### 3.6 スキップ方法

緊急時にフックをスキップしたい場合:

```bash
# pre-commit をスキップ
git commit --no-verify -m "emergency fix"

# pre-push をスキップ
git push --no-verify
```

**注意**: スキップは緊急時のみ使用してください。CI でチェックされるため、問題があれば検出されます。

### 3.7 トラブルシューティング

#### フックが動作しない

```bash
# 再インストール
npx lefthook install
```

#### 特定のコマンドが失敗する

```bash
# 手動で実行して詳細を確認
just lint
just format-check
just type-check
```

---

## 4. GitHub Actions (CI/CD パイプライン)

### 4.1 概要

GitHub Actions でリモート CI/CD を実行します。

### 4.2 現在のワークフロー

#### E2E Tests (`.github/workflows/e2e-tests.yml`)

**ステータス**: 実装済み

| トリガー     | 対象ブランチ      |
| ------------ | ----------------- |
| Push         | `main`, `develop` |
| Pull Request | `main`            |

**実行内容**:

1. 依存関係インストール
2. Playwright インストール
3. アプリビルド
4. Smoke テスト実行
5. 失敗時: スクリーンショット・動画をアップロード

### 4.3 計画中のワークフロー

> 詳細は `docs/implementation/cicd_implementation_plan.md` を参照

#### CI Workflow (TBD)

**トリガー**: すべての Push, Pull Request

```yaml
jobs:
  check: # type-check, format-check, lint
  test: # unit tests + coverage
  security: # Snyk, SonarCloud
  build: # multi-OS build
  e2e: # Playwright tests
```

#### Release Workflow (TBD)

**トリガー**: `v*.*.*` タグ Push

```yaml
jobs:
  semantic-release: # バージョン決定
  build-and-release: # multi-OS ビルド + GitHub Releases
```

### 4.4 GitHub Secrets (TBD)

| Secret              | 用途                        |
| ------------------- | --------------------------- |
| `SNYK_TOKEN`        | Snyk API トークン           |
| `SONAR_ORG`         | SonarCloud 組織             |
| `SONAR_PROJECT_KEY` | SonarCloud プロジェクトキー |
| `SONARCLOUD_TOKEN`  | SonarCloud トークン         |

### 4.5 ブランチ保護ルール (TBD)

**対象**: `main` ブランチ

- Require status checks to pass:
  - `check`
  - `test`
  - `e2e-tests`
- Require branches to be up to date
- Require linear history

---

## 5. ローカル vs リモートの役割分担

### 5.1 実行内容の比較

| チェック項目  | Lefthook (ローカル) | GitHub Actions (リモート) |
| ------------- | ------------------- | ------------------------- |
| Type Check    | pre-commit          | CI                        |
| Lint          | pre-commit          | CI                        |
| Format Check  | pre-commit          | CI                        |
| Unit Tests    | pre-push            | CI                        |
| Security Scan | pre-push            | CI                        |
| E2E Tests     | -                   | CI                        |
| Build         | -                   | CI                        |

### 5.2 設計思想

1. **Lefthook (ローカル)**: 素早いフィードバック
   - コミット前に軽量なチェック
   - プッシュ前にテスト・セキュリティスキャン
   - 問題を早期発見

2. **GitHub Actions (リモート)**: 確実な品質ゲート
   - マージ前の最終チェック
   - マルチ OS ビルド検証
   - E2E テスト実行
   - リリース自動化

---

## 6. npm scripts との関係

Just コマンドは内部で npm scripts を呼び出しています:

| Just コマンド | npm script             |
| ------------- | ---------------------- |
| `just dev`    | `npm run dev`          |
| `just test`   | `npm run test`         |
| `just lint`   | `npm run lint`         |
| `just build`  | `npm run build`        |
| `just e2e`    | `npm run test:e2e:dev` |

**なぜ Just を使うのか?**

1. **統一されたインターフェース**: `just ci` で全チェック実行
2. **依存関係の管理**: `just build` = `clean` + `npm run build`
3. **クロスプラットフォーム**: Windows/macOS/Linux で同じコマンド
4. **ドキュメント性**: `just --list` でタスク一覧表示

---

## 7. 開発フロー

### 7.1 日常の開発

```bash
# 1. 開発開始
just dev

# 2. コード変更

# 3. コミット (Lefthook が自動チェック)
git add .
git commit -m "feat: add new feature"
# → pre-commit: lint, format-check, type-check

# 4. プッシュ (Lefthook が自動テスト)
git push
# → pre-push: test, security-all
```

### 7.2 PR 作成前

```bash
# ローカルで CI 相当のチェックを実行
just ci

# すべてパスしたら PR 作成
```

### 7.3 リリース

```bash
# バージョン更新 + タグ作成 + プッシュ
just release
# → GitHub Actions がリリースビルドを実行 (TBD)
```

---

## 8. トラブルシューティング

### 8.1 Just が見つからない

```bash
# インストール確認
which just

# インストールされていない場合
brew install just  # macOS
```

### 8.2 Lefthook が動作しない

```bash
# 再インストール
npx lefthook install

# .git/hooks を確認
ls -la .git/hooks/
```

### 8.3 CI が失敗する

1. ローカルで `just ci` を実行して再現
2. エラーメッセージを確認
3. 該当のチェックを個別に実行:
   ```bash
   just type-check
   just lint
   just test
   ```

### 8.4 セキュリティスキャンが失敗する

```bash
# Snyk CLI がインストールされているか確認
snyk --version

# トークンが設定されているか確認
snyk auth
```

---

## 9. 関連ドキュメント

| ドキュメント                                      | 内容                               |
| ------------------------------------------------- | ---------------------------------- |
| `docs/development/code_quality_rules.md`          | コード品質ルール (ESLint/Prettier) |
| `docs/implementation/cicd_implementation_plan.md` | CI/CD 導入計画 (詳細設計)          |
| `docs/implementation/testing_strategy.md`         | テスト戦略                         |
| `docs/product/03_development_rules.md`            | 開発ルール・ブランチ戦略           |

---

## 10. 実装状況

| 項目                | ステータス  | 備考                                |
| ------------------- | ----------- | ----------------------------------- |
| Justfile            | ✅ 実装済み | 全コマンド利用可能                  |
| Lefthook            | ✅ 実装済み | pre-commit, pre-push 設定済み       |
| E2E Tests Workflow  | ✅ 実装済み | Smoke テスト実行                    |
| CI Workflow (full)  | TBD         | check, test, security, build        |
| Release Workflow    | TBD         | semantic-release + electron-builder |
| Branch Protection   | TBD         | main ブランチ保護ルール             |
| Codecov Integration | TBD         | カバレッジレポート                  |
| Dependabot          | TBD         | 依存関係自動更新                    |

---

_最終更新: 2025-12-23_
