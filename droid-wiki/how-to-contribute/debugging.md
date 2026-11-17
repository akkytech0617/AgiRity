# デバッグ

## ログ

### electron-log

AgiRity は `electron-log` を使用して構造化ログを出力します。

| プロセス | 出力先 | 設定ファイル |
|---------|--------|-------------|
| メインプロセス | `~/.agirity/logs/main.log` + コンソール | `src/main/lib/logger.ts` |
| レンダラープロセス | コンソールのみ | `src/renderer/lib/logger.ts` |

### ログレベル

- `log.info()` — 一般情報（起動、終了、ワークスペース操作）
- `log.error()` — エラー（起動失敗、IPC エラー、ファイル読み書き失敗）
- `log.warn()` — 警告

## パフォーマンス計測

### メインプロセス

環境変数 `AGIRITY_PERF=true` を設定して起動すると、パフォーマンスメトリクスが収集されます。

```bash
AGIRITY_PERF=true npm run dev
```

メトリクス: コンテナ作成時間、IPC セットアップ時間、ウィンドウ作成時間、全体スタートアップ時間

### レンダラープロセス

環境変数 `VITE_PERF=true` を設定すると、レンダラー側のパフォーマンスが計測されます。

```bash
VITE_PERF=true npm run dev
```

メトリクス: 初回レンダー時間、ワークスペース読込時間、レンダラー準備完了時間

### 両方同時有効化

```bash
just perf
# または
AGIRITY_PERF=true VITE_PERF=true npm run dev
```

## Sentry エラー追跡

- **DSN 設定:** `SENTRY_DSN`（メイン）/ `VITE_SENTRY_DSN`（レンダラー）
- **アプリバージョン:** `VITE_APP_VERSION`
- **フラッシュ:** アプリ終了前に `flushSentry()` でバッファを送信（2 秒タイムアウト）
- **設定ファイル:** `src/main/lib/sentry.ts`

## よくある問題

| 問題 | 原因 | 解決方法 |
|------|------|---------|
| `workspaces.yaml not found` | 初回起動でファイルが存在しない | 正常動作。空配列として処理される |
| Zod バリデーションエラー | YAML ファイルのスキーマが不正 | `workspaces.yaml` の構造を `WorkspaceSchema` に合わせて修正 |
| アイコン取得失敗 | sips タイムアウトまたはパス間違い | アプリパスが正しいか確認。フォールバックアイコンが使用される |
| ファビコン取得失敗 | SSRF 防御によるブロックまたはタイムアウト | `AGIRITY_ALLOW_EXTERNAL_FAVICONS=true` で外部プロバイダーを有効化 |
| ポート競合 | Vite 開発サーバーのポート使用中 | 他のプロセスを終了またはポート設定を変更 |
| モックデータ不一致 | `VITE_USE_MOCK_DATA=true` で古いモック | `src/renderer/mocks/workspaces.ts` のデータを更新 |
| `ENOENT` エラー | 設定ディレクトリ未作成 | `ensureConfigDir()` が自動作成するはず。権限を確認 |

## DevTools

Electron のレンダラープロセスで Chrome DevTools が利用可能です。

- **macOS:** `Cmd+Option+I`
- **Windows/Linux:** `Ctrl+Shift+I`

React Developer Tools はインストールされていませんが、標準の Elements / Console / Network パネルは利用可能です。

## UI のみテスト（モックモード）

`VITE_USE_MOCK_DATA=true` を設定すると、IPC を使用せずインメモリのモックデータで UI 開発が可能です。

```bash
VITE_USE_MOCK_DATA=true npm run dev
```

このモードでは:
- Electron のメインプロセスとの通信が不要
- `workspaceDataSource` がインメモリ配列を使用
- UI コンポーネントの開発・テストに最適
