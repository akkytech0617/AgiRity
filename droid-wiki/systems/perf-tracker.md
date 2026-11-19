# パフォーマンストラッキング

> アクティブコントリビューター: akkytech, Akihide Ito

## 目的

アプリケーションの起動時間、IPC通信時間、React初回レンダリング時間を計測し、パフォーマンスの可視化とボトルネック特定を支援します。

## インターフェース階層

```
IPerfTracker (インターフェース)
├── PerfTrackerImpl  # 実際の計測実装
└── NoopPerfTracker  # 無効化時の何もしない実装
```

| 型                   | 役割                                                           |
| -------------------- | -------------------------------------------------------------- |
| `IPerfTracker`       | `mark`, `measure`, `memorySnapshot`, `report`の4メソッドを定義 |
| `PerfTrackerImpl`    | `performance.now()`ベースの実際の計測                          |
| `NoopPerfTracker`    | パフォーマンス計測無効時のNo-op実装                            |
| `PerfReport`         | 計測結果とメモリスナップショットのコンテナ                     |
| `PerfMeasurement`    | 個別の計測結果（名前、開始/終了マーク、所要時間）              |
| `PerfMemorySnapshot` | メモリ使用量スナップショット（RSS, Heap）                      |

## 有効化設定

| プロセス   | 環境変数       | 条件                      |
| ---------- | -------------- | ------------------------- |
| メイン     | `AGIRITY_PERF` | `AGIRITY_PERF=true`で有効 |
| レンダラー | `VITE_PERF`    | `VITE_PERF=true`で有効    |

無効化時は`NOOP_TRACKER`（NoopPerfTracker）が使用され、オーバーヘッドなし。

## 計測イベント

### メインプロセス

| イベント名                                  | 説明                              |
| ------------------------------------------- | --------------------------------- |
| `main:start`                                | プロセス起動の開始                |
| `container:start` / `container:end`         | DIコンテナ生成                    |
| `ipc:start` / `ipc:end`                     | IPCハンドラ登録                   |
| `app:whenReady:start` / `app:whenReady:end` | Electron ready待ち                |
| `window:start` / `window:end`               | BrowserWindow生成                 |
| `main:startup`                              | 起動全体の所要時間                |
| `ipc:launcher:launchItem`                   | アイテム起動のIPC所要時間         |
| `ipc:workspace:load`                        | ワークスペース読み込みIPC所要時間 |
| `ipc:workspace:save`                        | ワークスペース保存IPC所要時間     |

### レンダラープロセス

| イベント名          | 説明                         |
| ------------------- | ---------------------------- |
| `renderer:start`    | レンダラー初期化開始         |
| `react:firstRender` | React初回レンダリング完了    |
| `renderer:ready`    | データ読み込み完了           |
| `renderer:startup`  | レンダラー起動全体           |
| `workspace:load`    | ワークスペースデータ読み込み |

## メモリスナップショット

| ラベル     | プロセス   | 取得タイミング           |
| ---------- | ---------- | ------------------------ |
| `main`     | メイン     | BrowserWindow生成後      |
| `renderer` | レンダラー | 初回データ読み込み完了後 |

メインプロセスでは`process.memoryUsage()`からRSS、ヒープ使用量を取得。レンダラーでは`performance.memory`（Chromium限定）からヒープ情報を取得します。

## 主要ソースファイル

| ファイル                             | 役割                                                   |
| ------------------------------------ | ------------------------------------------------------ |
| `src/shared/lib/perf/PerfTracker.ts` | `IPerfTracker`, `PerfTrackerImpl`, `NoopPerfTracker`   |
| `src/shared/lib/perf/config.ts`      | メインプロセス用有効化判定（`AGIRITY_PERF`）           |
| `src/main/lib/perf.ts`               | メインプロセスのパフォーマンス初期化・レポート出力     |
| `src/renderer/lib/perf.ts`           | レンダラープロセスのパフォーマンス初期化・レポート出力 |
