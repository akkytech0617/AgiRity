# システム

AgiRityを構成する主要システムの概要です。

| システム                   | 説明                                                           | 詳細                                           |
| -------------------------- | -------------------------------------------------------------- | ---------------------------------------------- |
| メインプロセス             | Electronメインプロセスのライフサイクル、DIコンテナ、サービス群 | [main-process.md](main-process.md)             |
| IPCとプリロード            | メイン↔レンダラー間の安全な通話、コンテキストブリッジ          | [ipc-and-preload.md](ipc-and-preload.md)       |
| レンダラーアプリシェル     | Reactアプリケーションのルーティング、データ層、UIシェル        | [renderer-app-shell.md](renderer-app-shell.md) |
| パフォーマンストラッキング | 起動時間・操作時間の計測、メモリスナップショット               | [perf-tracker.md](perf-tracker.md)             |
| ロギングとSentry           | ログ管理、エラー監視、Sentry統合                               | [logging-and-sentry.md](logging-and-sentry.md) |
