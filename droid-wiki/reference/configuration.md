# 設定

## 環境変数

| 環境変数                          | 対象プロセス | デフォルト                | 説明                                                |
| --------------------------------- | ------------ | ------------------------- | --------------------------------------------------- |
| `SENTRY_DSN`                      | メイン       | -                         | Sentry DSN（メインプロセス用エラー追跡）            |
| `VITE_SENTRY_DSN`                 | レンダラー   | -                         | Sentry DSN（レンダラープロセス用）                  |
| `VITE_APP_VERSION`                | レンダラー   | `package.json` の version | アプリバージョン（Sentry リリース識別）             |
| `VITE_USE_MOCK_DATA`              | レンダラー   | `false`                   | `true` でモックデータ使用（UI 開発用）              |
| `VITE_PERF`                       | レンダラー   | `false`                   | `true` でレンダラーパフォーマンス計測有効           |
| `AGIRITY_PERF`                    | メイン       | `false`                   | `true` でメインプロセスパフォーマンス計測有効       |
| `AGIRITY_CONFIG_DIR`              | メイン       | `~/.agirity/`             | 設定ディレクトリのパスオーバーライド                |
| `AGIRITY_ALLOW_EXTERNAL_FAVICONS` | メイン       | `false`                   | `true` で外部ファビコンプロバイダー（Google）を許可 |

## 設定ファイル

| パス                         | 内容                              |
| ---------------------------- | --------------------------------- |
| `~/.agirity/workspaces.yaml` | ワークスペースデータ（YAML 形式） |
| `~/.agirity/logs/main.log`   | メインプロセスログ                |

## ビルド設定ファイル

| ファイル                             | 役割                                          |
| ------------------------------------ | --------------------------------------------- |
| `vite.config.ts`                     | Vite 開発サーバー・バンドル設定               |
| `tsconfig.json`                      | TypeScript 設定（レンダラー用）               |
| `tsconfig.node.json`                 | TypeScript 設定（メインプロセス・Node.js 用） |
| `biome.json`                         | Biome リント・フォーマット設定                |
| `postcss.config.js`                  | PostCSS 設定（Tailwind CSS 用）               |
| `lefthook.yml`                       | Lefthook Git フック設定                       |
| `Justfile`                           | Just タスクランナーレシピ定義                 |
| `.github/workflows/ci.yml`           | CI パイプライン                               |
| `.github/workflows/release.yml`      | リリース自動化                                |
| `.github/workflows/droid-review.yml` | 自動コードレビュー                            |
| `.github/workflows/droid.yml`        | Wiki 自動生成                                 |
| `.github/workflows/qa.yml`           | QA テスト                                     |
