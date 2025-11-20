# AgiRity 開発ルール

## ブランチ戦略: GitHub Flow

### ブランチ構成
```
main (常にリリース可能)
 ├─ feature/workspace-launch
 ├─ feature/project-crud
 ├─ fix/launch-error
 ├─ docs/update-readme
 └─ refactor/simplify-service
```

### ブランチ命名規則

| Prefix | 用途 | 例 |
|--------|------|-----|
| `feature/*` | 新機能 | `feature/browser-url-support` |
| `fix/*` | バグ修正 | `fix/app-launch-error` |
| `docs/*` | ドキュメント | `docs/add-installation-guide` |
| `refactor/*` | リファクタリング | `refactor/project-service` |
| `test/*` | テスト追加 | `test/add-launcher-tests` |
| `chore/*` | その他 | `chore/update-dependencies` |

### ワークフロー
```bash
# 1. ブランチ作成
git checkout -b feature/workspace-launch

# 2. 開発・コミット
git add .
npm run commit  # Commitizen使用

# 3. Push
git push origin feature/workspace-launch

# 4. Pull Request作成 (GitHub)

# 5. CI通過確認

# 6. mainにマージ

# 7. ブランチ削除
git branch -d feature/workspace-launch
```

---

## コミットメッセージ規約: Conventional Commits

### フォーマット
```
<type>(<scope>): <subject>

<body> (optional)

<footer> (optional)
```

### Type一覧

| Type | 用途 | バージョン影響 | 例 |
|------|------|---------------|-----|
| `feat` | 新機能 | MINOR ⬆️ | `feat(launcher): add multi-instance support` |
| `fix` | バグ修正 | PATCH ⬆️ | `fix(ui): resolve dark mode layout issue` |
| `docs` | ドキュメント | - | `docs: update installation guide` |
| `style` | コードスタイル | - | `style: format with prettier` |
| `refactor` | リファクタリング | - | `refactor(service): simplify project creation` |
| `test` | テスト | - | `test(launcher): add unit tests` |
| `chore` | その他 | - | `chore: update dependencies` |
| `perf` | パフォーマンス | PATCH ⬆️ | `perf(launcher): optimize app detection` |

### Scope (オプション)

| Scope | 対象 |
|-------|------|
| `launcher` | アプリ起動関連 |
| `ui` | UI/コンポーネント |
| `service` | ビジネスロジック |
| `ipc` | プロセス間通信 |
| `config` | 設定関連 |

### 例
```bash
# 良い例
feat(launcher): add browser URL opening
fix(ui): resolve workspace card alignment
test(service): add ProjectService tests
docs: add development setup guide

# 悪い例
update stuff
fix bug
WIP
```

---

## Commitizen 使用

### インストール
```bash
npm install -D commitizen cz-conventional-changelog
```

### 使用方法
```bash
# 通常のgit commitの代わりに
npm run commit

# 対話式でコミットメッセージ作成
? Select the type of change: feat
? What is the scope: launcher
? Write a short description: add browser URL opening
? Provide a longer description: (optional)
? Are there any breaking changes: No
? Does this close any issues: (optional)
```

---

## バージョニング: Semantic Versioning

### フォーマット
```
MAJOR.MINOR.PATCH

例:
v0.1.0  - 初期プロトタイプ
v0.2.0  - 新機能追加
v0.2.1  - バグ修正
v1.0.0  - Phase 1完了
```

### バージョンアップルール

| 変更内容 | バージョン | 例 |
|---------|-----------|-----|
| **破壊的変更** | MAJOR | v1.0.0 → v2.0.0 |
| **新機能追加** | MINOR | v1.0.0 → v1.1.0 |
| **バグ修正** | PATCH | v1.0.0 → v1.0.1 |

### 自動判定

- `feat:` → MINOR ⬆️
- `fix:` → PATCH ⬆️
- `BREAKING CHANGE:` → MAJOR ⬆️

---

## リリースフロー: 自動リリース

### Standard Version 使用
```bash
# 1. mainブランチで最新状態
git checkout main
git pull

# 2. テスト実行
npm run test:all

# 3. バージョンアップ (自動判定)
npm run release

# これにより:
# - CHANGELOG.md 更新
# - package.json バージョンアップ
# - Git tag作成
# - コミット作成

# 4. タグをプッシュ
git push --follow-tags

# 5. GitHub Actionsが自動実行
# - ビルド
# - パッケージング
# - GitHub Releaseにバイナリアップロード
```

### 手動バージョン指定
```bash
# Minor バージョンアップ強制
npm run release -- --release-as minor

# Major バージョンアップ強制
npm run release -- --release-as major

# 最初のリリース
npm run release -- --first-release
```

---

## CHANGELOG

### 自動生成される内容
```markdown
# Changelog

## [0.2.0] - 2025-01-15

### Features

- **launcher**: add browser URL opening ([abc123])
- **ui**: add dark mode support ([def456])

### Bug Fixes

- **launcher**: resolve app path with spaces issue ([ghi789])
- **ui**: fix workspace card alignment ([jkl012])

### Documentation

- add installation guide ([mno345])

## [0.1.0] - 2025-01-01

### Features

- **launcher**: initial app launching functionality
- **ui**: basic workspace management UI
```

---

## バイナリ管理

### ファイル命名規則
```
agirity-{version}-{platform}-{arch}.{ext}

例:
agirity-0.1.0-darwin-arm64.dmg
agirity-0.1.0-darwin-x64.dmg
agirity-0.1.0-win32-x64.exe
agirity-0.2.0-darwin-arm64.dmg
```

### GitHub Release構成
```
v0.1.0
├── Assets
│   ├── agirity-0.1.0-darwin-arm64.dmg
│   ├── agirity-0.1.0-darwin-x64.dmg
│   ├── Source code (zip)
│   └── Source code (tar.gz)
│
└── Release Notes (CHANGELOG.mdから自動生成)
    - 新機能
    - バグ修正
    - 既知の問題
```

---

## Issue管理

### ラベル

| ラベル | 用途 | 色 |
|--------|------|-----|
| `bug` | バグ | 🔴 Red |
| `feature` | 新機能 | 🟢 Green |
| `enhancement` | 改善 | 🟡 Yellow |
| `documentation` | ドキュメント | 🔵 Blue |
| `good first issue` | 初心者向け | 🟣 Purple |
| `priority: high` | 優先度高 | 🔴 Red |
| `priority: low` | 優先度低 | ⚪ Gray |

### Issueテンプレート

#### Bug Report

**`.github/ISSUE_TEMPLATE/bug_report.md`:**
```markdown
---
name: Bug report
about: バグを報告
title: '[BUG] '
labels: bug
---

## 問題
何が起きたか簡潔に

## 再現手順
1. ...
2. ...
3. ...

## 期待する動作
本来どうあるべきか

## 環境
- OS: macOS 14.0
- Version: v0.1.0
```

#### Feature Request

**`.github/ISSUE_TEMPLATE/feature_request.md`:**
```markdown
---
name: Feature request
about: 新機能の提案
title: '[FEATURE] '
labels: feature
---

## 機能概要
何をしたいか

## 理由・背景
なぜ必要か

## 提案する実装
どう実装するか (オプション)
```

---

## Pull Request規約

### PRテンプレート

**`.github/pull_request_template.md`:**
```markdown
## 概要
このPRで何をしたか

## 変更内容
- [ ] 新機能追加
- [ ] バグ修正
- [ ] リファクタリング
- [ ] ドキュメント更新
- [ ] テスト追加

## 関連Issue
Closes #123

## テスト
- [ ] Unit tests追加/更新
- [ ] Integration tests追加/更新
- [ ] E2E tests追加/更新
- [ ] 手動テスト完了

## スクリーンショット (UIの変更がある場合)

## チェックリスト
- [ ] Lintエラーなし
- [ ] Type checkエラーなし
- [ ] テストがすべて通る
- [ ] CHANGELOGを更新 (必要なら)
```

---

## 日常の開発フロー

### 基本サイクル
```bash
# 1. 新しい機能を作る
git checkout -b feature/new-feature

# 2. テストファースト開発
# - テスト書く
# - 実装
# - テスト通る

# 3. コミット (Commitizen使用)
git add .
npm run commit
# → 対話式でコミットメッセージ作成

# 4. Push
git push origin feature/new-feature

# 5. GitHub でPR作成

# 6. CI確認 (自動実行)
# - Lint
# - Type check
# - Tests
# - Build

# 7. mainにマージ

# 8. リリースタイミングで
git checkout main
git pull
npm run release
git push --follow-tags
# → GitHub Actionsが自動リリース
```

---

## CI/CD パイプライン

### CI (継続的インテグレーション)

**トリガー:** Push, Pull Request

**ジョブ:**
1. Lint (`npm run lint`)
2. Type Check (`npm run type-check`)
3. Unit & Integration Tests (`npm run test:coverage`)
4. E2E Tests (`npm run test:e2e`)
5. Build (`npm run build`)

**所要時間:** 約2分

---

### Release (自動リリース)

**トリガー:** Tag push (`v*`)

**ジョブ:**
1. Tests (`npm run test:all`)
2. Build (`npm run build`)
3. Package (`npm run package`)
4. Create GitHub Release
5. Upload binaries

**所要時間:** 約5分

---

## コードレビュー

### レビュー観点

1. **機能**: 仕様通りに動くか
2. **テスト**: テストがあるか、適切か
3. **コード品質**: 読みやすいか、保守しやすいか
4. **パフォーマンス**: 性能問題ないか
5. **セキュリティ**: 脆弱性ないか

### セルフレビュー

PRを作成したら、自分でもう一度レビュー:
- [ ] コミットメッセージは適切か
- [ ] テストは通るか
- [ ] Lintエラーはないか
- [ ] 不要なコメントやデバッグコードは削除したか
- [ ] ドキュメントは更新したか

---

## リリース前チェックリスト
```markdown
## リリース前チェックリスト

- [ ] すべてのテストが通る (`npm run test:all`)
- [ ] Lintエラーなし (`npm run lint`)
- [ ] Type checkエラーなし (`npm run type-check`)
- [ ] 自分で動作確認済み
- [ ] CHANGELOG.md更新 (Standard Versionで自動)
- [ ] README.md更新 (必要なら)
- [ ] バージョン番号適切
- [ ] タグ作成済み
- [ ] バイナリビルド成功
```

---

## 開発サイクル (スプリント)

### 週単位のサイクル (柔軟に)
```
月曜: 
  - 今週のゴール設定
  - Issue作成

火〜金:
  - 開発
  - テスト
  - コミット

土日:
  - レビュー
  - リファクタリング
  - ドキュメント更新
```

---

## マイルストーン

| マイルストーン | バージョン | 期間 | ゴール |
|--------------|----------|------|--------|
| **Prototype** | v0.1.0 | Week 1-2 | 基本UIとデータ管理 |
| **MVP** | v0.2.0 | Week 3-4 | アプリ起動機能完成 |
| **Beta** | v0.5.0 | Week 5-6 | 自分で日常使用できる |
| **v1.0** | v1.0.0 | Week 7-8 | Phase 1完了、公開 |

---

## ドキュメント管理

### 必須ドキュメント

| ドキュメント | 場所 | 更新タイミング |
|------------|------|--------------|
| **README.md** | ルート | プロジェクト概要変更時 |
| **CHANGELOG.md** | ルート | リリース時 (自動) |
| **要件定義** | `/docs/01_requirements.md` | 要件変更時 |
| **技術選定** | `/docs/02_tech_stack.md` | 技術変更時 |
| **開発ルール** | `/docs/03_development_rules.md` | ルール変更時 |
| **API Docs** | `/docs/api` | コード変更時 (自動) |

---

## トラブルシューティング

### よくある問題

#### CI が失敗する
```bash
# ローカルで確認
npm run lint
npm run type-check
npm run test:all
npm run build
```

#### バージョニングがおかしい
```bash
# Standard Versionのドライラン
npm run release -- --dry-run

# 手動でバージョン指定
npm run release -- --release-as 0.2.0
```

#### ビルドが失敗する
```bash
# キャッシュクリア
rm -rf node_modules dist
npm install
npm run build
```

---

## ベストプラクティス

### DO (推奨)

✅ テストファースト開発
✅ 小さく頻繁にコミット
✅ 意味のあるコミットメッセージ
✅ コードレビュー (セルフレビュー含む)
✅ 継続的なリファクタリング
✅ ドキュメント更新

### DON'T (非推奨)

❌ テストなしでコミット
❌ 大きすぎるPR (500行以上)
❌ 曖昧なコミットメッセージ
❌ mainに直接Push
❌ CI失敗を無視
❌ ドキュメント放置

---

## 緊急時対応

### ホットフィックス
```bash
# 1. mainから直接ブランチ
git checkout main
git checkout -b fix/critical-bug

# 2. 修正・テスト
# ...

# 3. コミット
git add .
npm run commit  # fix: ...

# 4. Push & PR
git push origin fix/critical-bug

# 5. マージ後、即座にリリース
git checkout main
git pull
npm run release -- --release-as patch
git push --follow-tags
```

---

*このドキュメントはプロジェクトの成長に伴って更新されます。*
*最終更新: 2025-11-20*
