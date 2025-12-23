# CI/CD導入計画

## 1. 背景と目的

### 背景

現在、AgiRityプロジェクトには以下のツールが整備されているが、CI/CDパイプラインが未構築：

- ✅ **Justfile**: ローカル開発用タスクランナー（`just ci`, `just check`, `just test`等）
- ✅ **Lefthook**: Pre-commitフック（format-check, typecheck, lint）
- ✅ **package.json scripts**: ビルド、テスト、リリーススクリプト
- ✅ **セキュリティツール**: Snyk, SonarCloud（設定済み）
- ❌ **GitHub Actions**: 未実装

### 目的

- **品質保証の自動化**: PR時の自動テスト実行
- **早期フィードバック**: コミット直後のビルド・テスト結果
- **マルチOS対応**: macOS, Windows, Linux向けビルドの自動化
- **自動リリース**: タグプッシュ時の自動ビルド＆リリース
- **セキュリティスキャン**: 依存関係とコードの脆弱性検知

---

## 2. 技術選定

### 2.1 CI/CDプラットフォーム: GitHub Actions

#### 選定理由

- ✅ **GitHubネイティブ**: リポジトリと完全統合
- ✅ **マルチOS対応**: ubuntu-latest, windows-latest, macos-latest
- ✅ **無料枠充実**: Public repositoryは無制限
- ✅ **豊富なMarketplace**: electron-builder, setup-just等の公式アクション
- ✅ **Justfile活用可能**: [setup-just](https://github.com/marketplace/actions/setup-just)アクションで簡単統合

#### 参考資料

- [Electron Builder Action - GitHub Marketplace](https://github.com/marketplace/actions/electron-builder-action)
- [Multi-OS Electron Build & Release with GitHub Actions](https://dev.to/supersuman/multi-os-electron-build-release-with-github-actions-f3n)
- [Building an electron app on github actions](https://medium.com/@johnjjung/building-an-electron-app-on-github-actions-windows-and-macos-53ab69703f7c)
- [Setup just - GitHub Marketplace](https://github.com/marketplace/actions/setup-just)

### 2.2 リリース自動化: semantic-release + electron-builder

#### アプローチ

- **Conventional Commits**による自動バージョニング
- **semantic-release**でバージョン決定とタグ作成
- **electron-builder**でマルチOSビルド＆GitHub Releases公開

#### 参考資料

- [Release Electron App Using Semantic Release And Electron Builder](https://shahid.pro/blog/2023/02/20/release-electron-app-to-github-using-semantic-release-and-electron-builder/)
- [semantic-release-github-electron-builder](https://github.com/mystster/semantic-release-github-electron-builder)
- [electron-builder - Publishing and Updating](https://www.electronjs.org/docs/latest/tutorial/tutorial-publishing-updating)

### 2.3 既存ツールの活用

| ツール         | 用途             | CI統合方法                         |
| -------------- | ---------------- | ---------------------------------- |
| **Justfile**   | タスク実行       | `just ci`を GitHub Actionsで実行   |
| **Lefthook**   | Pre-commit       | CIでは無効化（`.git`なし）         |
| **Snyk**       | 依存関係スキャン | `SNYK_TOKEN`シークレット使用       |
| **SonarCloud** | SASTスキャン     | `SONARCLOUD_TOKEN`シークレット使用 |

---

## 3. CI/CDパイプライン設計

### 3.1 ワークフロー全体像

```
┌─────────────────┐
│  Push / PR作成  │
└────────┬────────┘
         │
    ┌────▼────┐
    │   CI    │── format-check
    │ (check) │── type-check
    │         │── lint
    │         │── test (unit)
    └────┬────┘
         │
    ┌────▼────────┐
    │  Security   │── Snyk (SCA)
    │   Scan      │── Snyk Code (SAST)
    │             │── SonarCloud
    └────┬────────┘
         │
    ┌────▼─────┐
    │  Build   │── macOS, Windows, Linux
    │  (Test)  │── E2E Tests (Smoke)
    └────┬─────┘
         │
    ┌────▼──────────┐
    │  Release      │── (Tag push時のみ)
    │  (Production) │── semantic-release
    │               │── electron-builder
    │               │── GitHub Releases
    └───────────────┘
```

### 3.2 ワークフロー定義

#### 3.2.1 CI Workflow (`.github/workflows/ci.yml`)

**トリガー**: すべてのPush, Pull Request  
**実行内容**: チェック、テスト、ビルド

```yaml
name: CI

on:
  push:
    branches: [main, develop, feat/*, fix/*]
  pull_request:
    branches: [main, develop]

jobs:
  # Job 1: Checks (format, type, lint)
  check:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Setup Just
        uses: extractions/setup-just@v2

      - name: Install dependencies
        run: npm ci

      - name: Run checks with Just
        run: just check
        # just check = type-check + format-check + lint

  # Job 2: Unit Tests
  test:
    runs-on: ubuntu-latest
    needs: check

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - uses: extractions/setup-just@v2

      - run: npm ci

      - name: Run tests with coverage
        run: just coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          fail_ci_if_error: true

  # Job 3: Security Scans
  security:
    runs-on: ubuntu-latest
    needs: check

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - uses: extractions/setup-just@v2

      - run: npm ci

      - name: Run Snyk security scans
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        run: just security-all
        continue-on-error: true # 警告でもCIは継続

      - name: Run SonarCloud scan
        env:
          SONAR_ORG: ${{ secrets.SONAR_ORG }}
          SONAR_PROJECT_KEY: ${{ secrets.SONAR_PROJECT_KEY }}
          SONARCLOUD_TOKEN: ${{ secrets.SONARCLOUD_TOKEN }}
        run: just sonar
        continue-on-error: true

  # Job 4: Build Test (Multi-OS)
  build:
    needs: [check, test]
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - uses: extractions/setup-just@v2

      - run: npm ci

      - name: Build application
        run: just build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-${{ matrix.os }}
          path: |
            dist/
            dist-electron/
          retention-days: 7

  # Job 5: E2E Tests (macOS only)
  e2e:
    needs: build
    runs-on: macos-latest
    if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Download build artifact
        uses: actions/download-artifact@v4
        with:
          name: build-macos-latest

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload E2E results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: e2e-results
          path: e2e-results/
          retention-days: 7
```

#### 3.2.2 Release Workflow (`.github/workflows/release.yml`)

**トリガー**: `v*.*.*` タグのpush  
**実行内容**: semantic-release + マルチOSビルド + GitHub Releases

```yaml
name: Release

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  # Job 1: Semantic Release (バージョン決定 & タグ作成)
  semantic-release:
    runs-on: ubuntu-latest
    outputs:
      new-release-published: ${{ steps.semantic.outputs.new-release-published }}
      new-release-version: ${{ steps.semantic.outputs.new-release-version }}

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # 全履歴取得（semantic-release必須）

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Run semantic-release
        id: semantic
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npx semantic-release

  # Job 2: Build & Release (Multi-OS)
  build-and-release:
    needs: semantic-release
    if: needs.semantic-release.outputs.new-release-published == 'true'
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Build and package
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          # macOS code signing (optional)
          # CSC_LINK: ${{ secrets.MAC_CERTS }}
          # CSC_KEY_PASSWORD: ${{ secrets.MAC_CERTS_PASSWORD }}
          # Windows code signing (optional)
          # CSC_LINK: ${{ secrets.WINDOWS_CERTS }}
          # CSC_KEY_PASSWORD: ${{ secrets.WINDOWS_CERTS_PASSWORD }}
        run: npm run package

      - name: Upload release assets
        uses: actions/upload-artifact@v4
        with:
          name: release-${{ matrix.os }}
          path: release/
          retention-days: 30
```

#### 3.2.3 Nightly Build Workflow (`.github/workflows/nightly.yml`) (Optional)

**トリガー**: 毎日深夜 or 手動  
**実行内容**: 最新mainのビルド＆テスト

```yaml
name: Nightly Build

on:
  schedule:
    - cron: '0 2 * * *' # 毎日 AM 2:00 (UTC)
  workflow_dispatch: # 手動実行可能

jobs:
  nightly:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - uses: extractions/setup-just@v2

      - run: npm ci

      - name: Run full CI pipeline
        run: just ci

      - name: Notify on failure
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Nightly Build Failed',
              body: 'Nightly build failed on main branch. Check workflow run: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}'
            })
```

---

## 4. 導入フェーズ

### Phase 1: 基本CI構築（優先度: 高）

**期間**: 1週間  
**目標**: PR時の自動チェック＆テスト

#### 4.1 実装タスク

1. **ディレクトリ作成**

   ```bash
   mkdir -p .github/workflows
   ```

2. **CI Workflowファイル作成**
   - `.github/workflows/ci.yml` （上記3.2.1参照）
   - checkジョブ、testジョブのみ先行実装

3. **GitHub Secretsの設定**
   - `SNYK_TOKEN` (Snyk API Token)
   - `SONAR_ORG` (SonarCloud Organization)
   - `SONAR_PROJECT_KEY` (SonarCloud Project Key)
   - `SONARCLOUD_TOKEN` (SonarCloud Token)

4. **README.md更新**

   ```markdown
   ## CI/CD Status

   [![CI](https://github.com/{org}/{repo}/actions/workflows/ci.yml/badge.svg)](https://github.com/{org}/{repo}/actions/workflows/ci.yml)
   ```

#### 4.2 完了条件

- ✅ PR作成時にCIが自動実行される
- ✅ check, testジョブが成功する
- ✅ ステータスバッジがREADMEに表示される

---

### Phase 2: セキュリティ＆ビルド統合（優先度: 中）

**期間**: 1週間  
**目標**: セキュリティスキャン＆マルチOSビルドテスト

#### 4.3 実装タスク

1. **securityジョブ追加**
   - Snyk, SonarCloud統合
   - `continue-on-error: true`で警告許容

2. **buildジョブ追加**
   - matrixでmacOS, Windows, Linux
   - アーティファクトアップロード

3. **Codecov統合** (Optional)
   - カバレッジレポート自動送信
   - PRへのコメント機能

#### 4.4 完了条件

- ✅ セキュリティスキャンがCI上で実行される
- ✅ 3OS向けビルドが成功する
- ✅ ビルドアーティファクトがダウンロード可能

---

### Phase 3: E2Eテスト統合（優先度: 中）

**期間**: 1週間（E2Eテスト実装完了後）  
**目標**: PR時のSmoke Test自動実行

#### 4.5 実装タスク

1. **e2eジョブ追加**
   - macOS環境でPlaywright実行
   - Smoke Testのみ（高速化）

2. **条件付き実行**
   - PR時: Smoke Testのみ
   - main merge時: 全E2Eテスト

#### 4.6 完了条件

- ✅ PR時にE2Eテストが自動実行される
- ✅ テスト失敗時にスクリーンショットが確認できる
- ✅ 実行時間 < 10分

---

### Phase 4: リリース自動化（優先度: 低）

**期間**: 2週間  
**目標**: タグプッシュで自動リリース

#### 4.7 実装タスク

1. **semantic-release設定**

   ```bash
   npm install -D semantic-release @semantic-release/commit-analyzer \
     @semantic-release/release-notes-generator @semantic-release/npm \
     @semantic-release/git @semantic-release/github \
     semantic-release-export-data
   ```

2. **.releaserc.json作成**

   ```json
   {
     "branches": ["main"],
     "plugins": [
       "@semantic-release/commit-analyzer",
       "@semantic-release/release-notes-generator",
       "@semantic-release/npm",
       "@semantic-release/git",
       "@semantic-release/github",
       "semantic-release-export-data"
     ]
   }
   ```

3. **Release Workflow作成**
   - `.github/workflows/release.yml`（上記3.2.2参照）

4. **Conventional Commits導入**
   - `commitlint` + `husky`設定
   - コミットメッセージルール統一

5. **Code Signing設定** (Optional)
   - macOS: `MAC_CERTS`, `MAC_CERTS_PASSWORD`
   - Windows: `WINDOWS_CERTS`, `WINDOWS_CERTS_PASSWORD`

#### 4.8 完了条件

- ✅ `v1.0.0`形式のタグでリリースが自動作成される
- ✅ GitHub Releasesに実行ファイルが添付される
- ✅ CHANGELOGが自動生成される

---

## 5. Justfileとの統合設計

### 5.1 既存Justfileの活用

現在のJustfileには `just ci` コマンドがあり、これは以下を実行：

```justfile
ci: check test security-all build
```

### 5.2 GitHub Actionsでの実行方法

```yaml
- uses: extractions/setup-just@v2

- name: Run full CI locally
  run: just ci
```

### 5.3 個別ジョブでの活用

| GitHub Actionsジョブ | Justコマンド        | 説明                             |
| -------------------- | ------------------- | -------------------------------- |
| check                | `just check`        | type-check + format-check + lint |
| test                 | `just coverage`     | テスト + カバレッジ              |
| security             | `just security-all` | Snyk SCA + SAST                  |
| build                | `just build`        | プロダクションビルド             |

### 5.4 ローカル開発との一貫性

開発者は**ローカルで `just ci` を実行することで、CIと同じチェックを事前に実行可能**。

```bash
# PR作成前のローカル確認
just ci
```

---

## 6. ブランチ戦略とCI/CD統合

### 6.1 推奨ブランチ戦略: GitHub Flow

```
main (保護ブランチ)
  ├── feat/feature-name
  ├── fix/bug-name
  └── develop (Optional)
```

### 6.2 ブランチ保護ルール設定

**Settings > Branches > Branch protection rules**

- **Branch name pattern**: `main`
- **Require status checks to pass**:
  - ✅ `check`
  - ✅ `test`
  - ✅ `build`
  - ✅ `e2e` (Smoke Test)
- **Require branches to be up to date**: ✅
- **Require linear history**: ✅ (推奨)
- **Do not allow bypassing**: ✅

### 6.3 CI実行ルール

| ブランチ/イベント      | check | test | security | build | e2e | release |
| ---------------------- | ----- | ---- | -------- | ----- | --- | ------- |
| `feat/*`, `fix/*` push | ✅    | ✅   | ✅       | -     | -   | -       |
| PR → `main`            | ✅    | ✅   | ✅       | ✅    | ✅  | -       |
| `main` push            | ✅    | ✅   | ✅       | ✅    | ✅  | -       |
| Tag `v*.*.*` push      | -     | -    | -        | -     | -   | ✅      |

---

## 7. コスト見積もり

### 7.1 GitHub Actions無料枠

| プラン             | 月間無料時間 | 備考              |
| ------------------ | ------------ | ----------------- |
| Public Repository  | **無制限**   | AgiRityは該当     |
| Private Repository | 2,000分/月   | 超過時: $0.008/分 |

### 7.2 予想実行時間

| ワークフロー      | 実行時間 | 月間実行回数 | 月間合計       |
| ----------------- | -------- | ------------ | -------------- |
| CI (check + test) | 5分      | 100回        | 500分          |
| CI (build)        | 10分     | 20回         | 200分          |
| E2E               | 10分     | 20回         | 200分          |
| Release           | 30分     | 4回          | 120分          |
| **合計**          | -        | -            | **1,020分/月** |

**結論**: Public Repositoryのため**コスト0円**

---

## 8. モニタリング＆メンテナンス

### 8.1 定期レビュー

- **週次**: CI失敗率レビュー（目標: < 5%）
- **月次**: ワークフロー実行時間レビュー（目標: < 10分/CI）
- **四半期**: 依存関係更新（GitHub Actions, npm packages）

### 8.2 アラート設定

```yaml
# .github/workflows/nightly.ymlに統合
- name: Notify on failure
  if: failure()
  uses: actions/github-script@v7
  with:
    script: |
      github.rest.issues.create({
        title: 'CI Failure Alert',
        body: 'Workflow failed: ${{ github.workflow }}'
      })
```

### 8.3 Dependabot設定

`.github/dependabot.yml`

```yaml
version: 2
updates:
  # GitHub Actions
  - package-ecosystem: 'github-actions'
    directory: '/'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 5

  # npm
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 10
```

---

## 9. トラブルシューティング

### 9.1 よくある問題と対処

| 問題                  | 原因                    | 対処                     |
| --------------------- | ----------------------- | ------------------------ |
| ビルド失敗（Windows） | パス区切り文字          | `path.join()`使用        |
| E2Eフレーキーテスト   | タイミング問題          | `waitForLoadState()`追加 |
| Snyk失敗              | トークン期限切れ        | Secretsを更新            |
| npm ci失敗            | package-lock.json不一致 | `npm install`後コミット  |

### 9.2 デバッグ方法

```yaml
# Workflow内でデバッグ情報を出力
- name: Debug info
  run: |
    echo "Node version: $(node --version)"
    echo "npm version: $(npm --version)"
    echo "OS: ${{ runner.os }}"
    ls -la dist/ || echo "dist/ not found"
```

---

## 10. 成功指標（KPI）

### 定量指標

- **CI成功率**: > 95%
- **平均ビルド時間**: < 10分
- **リリースサイクル**: 月2回以上
- **セキュリティ脆弱性検知**: 月1件以上
- **カバレッジ**: > 70%

### 定性指標

- ✅ PRマージまでの時間が50%短縮
- ✅ 手動リリース作業が不要
- ✅ 開発者がCIを信頼してリファクタリング可能
- ✅ セキュリティ問題が早期発見される

---

## 11. リスクと対策

| リスク             | 影響               | 対策                             |
| ------------------ | ------------------ | -------------------------------- |
| CI実行時間の増加   | PR待ち時間増       | 並列実行、キャッシュ活用         |
| フレーキーテスト   | 信頼性低下         | retries設定、適切な待機          |
| GitHub Actions障害 | CI停止             | ローカル`just ci`でバイパス      |
| シークレット漏洩   | セキュリティリスク | GitHub Secretsで管理、ログマスク |
| 依存関係の脆弱性   | アプリの脆弱性     | Dependabot自動PR                 |

---

## 12. 参考資料

### GitHub Actions

- [Electron Builder Action - GitHub Marketplace](https://github.com/marketplace/actions/electron-builder-action)
- [Multi-OS Electron Build & Release with GitHub Actions](https://dev.to/supersuman/multi-os-electron-build-release-with-github-actions-f3n)
- [Building an electron app on github actions](https://medium.com/@johnjjung/building-an-electron-app-on-github-actions-windows-and-macos-53ab69703f7c)
- [action-electron-builder - GitHub](https://github.com/samuelmeuli/action-electron-builder)

### Just Integration

- [Setup just - GitHub Marketplace](https://github.com/marketplace/actions/setup-just)
- [extractions/setup-just - GitHub](https://github.com/extractions/setup-just)

### Semantic Release

- [Release Electron App Using Semantic Release And Electron Builder](https://shahid.pro/blog/2023/02/20/release-electron-app-to-github-using-semantic-release-and-electron-builder/)
- [semantic-release-github-electron-builder](https://github.com/mystster/semantic-release-github-electron-builder)
- [electron-builder - Publishing and Updating](https://www.electronjs.org/docs/latest/tutorial/tutorial-publishing-updating)

### Best Practices

- [Build and Publish a Multi-Platform Electron App on GitHub](https://dev.to/erikhofer/build-and-publish-a-multi-platform-electron-app-on-github-3lnd)
- [Continuous Cross-Platform Deployment with GitHub Actions](https://www.zettlr.com/post/continuous-cross-platform-deployment-github-actions)

---

## 13. 次のステップ

### 即座に開始可能

1. `.github/workflows/` ディレクトリ作成
2. `ci.yml` ファイル作成（Phase 1）
3. GitHub Secrets設定

### Phase 1完了後

- [ ] Phase 2（セキュリティ＆ビルド）実装
- [ ] ブランチ保護ルール設定
- [ ] README.mdにバッジ追加

### 承認後のアクション

- [ ] Phase 1 実装開始
- [ ] 週次で進捗共有
- [ ] Phase 1完了後にPhase 2計画詳細化

---

**作成日**: 2024-12-20  
**作成者**: AI Assistant (Claude)  
**ステータス**: Draft  
**次回レビュー**: Phase 1完了後
