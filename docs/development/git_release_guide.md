# Git操作・リリース管理ガイド

このドキュメントはGit操作とリリース管理に関する詳細ルールを定義します。

日常の開発ワークフローについては [agent_workflow.md](agent_workflow.md) を参照してください。

---

## コミットメッセージ規約: Conventional Commits

### フォーマット

```
<type>(<scope>): <subject>

<body> (optional)

<footer> (optional)
```

### Type一覧

| Type       | 用途             | バージョン影響 | 例                                             |
| ---------- | ---------------- | -------------- | ---------------------------------------------- |
| `feat`     | 新機能           | MINOR ⬆️       | `feat(launcher): add multi-instance support`   |
| `fix`      | バグ修正         | PATCH ⬆️       | `fix(ui): resolve dark mode layout issue`      |
| `docs`     | ドキュメント     | -              | `docs: update installation guide`              |
| `style`    | コードスタイル   | -              | `style: format with prettier`                  |
| `refactor` | リファクタリング | -              | `refactor(service): simplify project creation` |
| `test`     | テスト           | -              | `test(launcher): add unit tests`               |
| `chore`    | その他           | -              | `chore: update dependencies`                   |
| `perf`     | パフォーマンス   | PATCH ⬆️       | `perf(launcher): optimize app detection`       |

### Scope (オプション)

| Scope      | 対象              |
| ---------- | ----------------- |
| `launcher` | アプリ起動関連    |
| `ui`       | UI/コンポーネント |
| `service`  | ビジネスロジック  |
| `ipc`      | プロセス間通信    |
| `config`   | 設定関連          |

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

| 変更内容       | バージョン | 例              |
| -------------- | ---------- | --------------- |
| **破壊的変更** | MAJOR      | v1.0.0 → v2.0.0 |
| **新機能追加** | MINOR      | v1.0.0 → v1.1.0 |
| **バグ修正**   | PATCH      | v1.0.0 → v1.0.1 |

### コミットからの自動判定

- `feat:` → MINOR ⬆️
- `fix:` → PATCH ⬆️
- `BREAKING CHANGE:` → MAJOR ⬆️

---

## リリースフロー: Standard Version

### 通常リリース

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

## 緊急時対応: ホットフィックス

本番で重大なバグが発生した場合の手順:

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

## トラブルシューティング

### バージョニングがおかしい

```bash
# Standard Versionのドライラン
npm run release -- --dry-run

# 手動でバージョン指定
npm run release -- --release-as 0.2.0
```

### ビルドが失敗する

```bash
# キャッシュクリア
rm -rf node_modules dist
npm install
npm run build
```

---

## 関連ドキュメント

| ドキュメント                           | 内容             |
| -------------------------------------- | ---------------- |
| [agent_workflow.md](agent_workflow.md) | 開発ワークフロー |
| [cicd_guide.md](cicd_guide.md)         | CI/CDガイド      |

---

_最終更新: 2025-12-25_
