# ツール

## ビルドシステム

| ツール                        | バージョン | 役割                               |
| ----------------------------- | ---------- | ---------------------------------- |
| Vite                          | ^7.3.0     | 開発サーバー・バンドラー           |
| vite-plugin-electron          | ^0.29.0    | Electron 向け Vite プラグイン      |
| vite-plugin-electron-renderer | ^0.14.5    | レンダラープロセス向けプラグイン   |
| electron-builder              | ^25.1.8    | パッケージング・インストーラー作成 |
| TypeScript                    | ^5.9.3     | 型チェック・コンパイル             |

## ビルドコマンド

| コマンド        | 内容                                       |
| --------------- | ------------------------------------------ |
| `just dev`      | 開発サーバー起動（Electron + React + HMR） |
| `just build`    | クリーン + 本番ビルド + パッケージング     |
| `just build-ci` | CI 用ビルド（electron-builder なし）       |
| `just package`  | インストーラー作成                         |
| `just release`  | タグ付け + プッシュでリリース              |

## Biome（リント・フォーマット）

Biome でリントとフォーマットを統合管理。

| コマンド            | 内容                              |
| ------------------- | --------------------------------- |
| `just lint`         | リントチェック                    |
| `just fix`          | リント自動修正                    |
| `just format`       | コードフォーマット                |
| `just format-check` | フォーマットチェック              |
| `just check`        | リント + フォーマット統合チェック |
| `just check:fix`    | 統合チェック自動修正              |

**設定ファイル:** `biome.json`

## Just タスクランナー

[Just](https://github.com/casey/just) をタスクランナーとして使用。主要レシピ：

| レシピ              | 内容                                      |
| ------------------- | ----------------------------------------- |
| `just dev`          | 開発サーバー起動                          |
| `just ci`           | ローカル CI（check → test → e2e → build） |
| `just check`        | type-check + format-check + lint          |
| `just test`         | 単体テスト                                |
| `just coverage`     | カバレッジ付きテスト                      |
| `just e2e`          | E2E テスト                                |
| `just security-all` | 手動・任意の SCA + SAST スキャン          |
| `just perf`         | パフォーマンス計測モード                  |
| `just clean`        | ビルド成果物の削除                        |

**設定ファイル:** `Justfile`

## Lefthook Git フック

| フック     | タイミング      | 実行内容                               |
| ---------- | --------------- | -------------------------------------- |
| pre-commit | `git commit` 前 | lint, format-check, type-check（並列） |
| pre-push   | `git push` 前   | test                                   |

**設定ファイル:** `lefthook.yml`

## GitHub Actions ワークフロー

| ワークフロー | ファイル                             | 内容                                               |
| ------------ | ------------------------------------ | -------------------------------------------------- |
| CI           | `.github/workflows/ci.yml`           | リント・型チェック・テスト・SonarCloud分析・ビルド |
| Release      | `.github/workflows/release.yml`      | タグプッシュ時の自動リリース・パッケージング       |
| Droid Review | `.github/workflows/droid-review.yml` | Factory Droid による自動コードレビュー             |
| Droid Wiki   | `.github/workflows/droid.yml`        | Factory Droid による Wiki 自動生成                 |
| QA           | `.github/workflows/qa.yml`           | 自動 QA テスト                                     |

## セキュリティツール

Snyk は手動・任意です。GitHub Actions、`just ci`、Git hooks からは実行しません。CLI・設定・依存関係は維持しています。

| ツール     | 用途                         | コマンド             |
| ---------- | ---------------------------- | -------------------- |
| Snyk SCA   | 依存関係の脆弱性スキャン     | `just security`      |
| Snyk SAST  | ソースコードの脆弱性スキャン | `just security-code` |
| SonarCloud | コード品質・セキュリティ分析 | `just sonar`         |

## 依存関係管理

| ツール     | 用途                          | 設定                       |
| ---------- | ----------------------------- | -------------------------- |
| Dependabot | GitHub Actions の自動更新     | `.github/dependabot.yml`   |
| Snyk       | npm パッケージの自動更新 PR   | Snyk ダッシュボード        |
| npm ci     | CI 環境での確定的インストール | `package-lock.json` ベース |
