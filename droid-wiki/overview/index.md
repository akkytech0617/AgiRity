# AgiRity 概要

AgiRityは、プロジェクト作業に必要な複数アプリをワンクリックで起動するElectronデスクトップアプリです。ワークスペース（アプリ、URL、フォルダーの集合）を定義し、プリセットで部分起動でき、「3秒で作業開始」というコンセプトです。

MVPフェーズ（v0.1.0）で、開発者・エンジニアを対象としています。現在はmacOS対応（Linux/Windows対応を予定）。

## クイックリンク

- [アーキテクチャ](architecture.md) — メインプロセス、レンダラー、共有レイヤーの接続
- [はじめ方](getting-started.md) — 前提条件、インストール、ビルド、テスト、実行
- [用語集](glossary.md) — プロジェクト固有の用語とデータモデル

## 技術スタック

| レイヤー | 技術 |
|---|---|
| デスクトップランタイム | Electron 39 |
| UIフレームワーク | React 19 + HeroUI (v2.8+) |
| スタイリング | Tailwind CSS v4、ダークモードのみ |
| 言語 | TypeScript（strict mode） |
| ビルド | Vite 7 + vite-plugin-electron |
| パッケージング | electron-builder |
| テスト | Vitest（ユニット）、Playwright（E2E） |
| リント/フォーマット | Biome |
| CI | GitHub Actions + Just |
| ロギング | electron-log + Sentry |
| バリデーション | Zod |

## リポジトリ構成

```
src/
├── main/           Electronメインプロセス（Node.js）
│   ├── adapters/   ファイルシステム、OS、シェル、アプリアダプター（DI対応）
│   ├── services/   ConfigService、ProjectService、LauncherService
│   ├── ipc/        IPCハンドラー登録
│   ├── lib/        Logger、Sentry、PerfTracker
│   └── container.ts  DIコンテナ（アダプター→サービスの配線）
├── renderer/       Reactフロントエンド
│   ├── components/
│   │   ├── layout/     AppShell、AppHeader、MainPanel、EmptyWorkspacePanel
│   │   └── workspace/  WorkspaceSwitcher、LaunchButton、PresetChips、LaunchItemCard
│   ├── api/        型付きIPCラッパー（workspaceApi、launcherApi）
│   ├── data/       workspaceDataSource（モックまたはリアルIPC）
│   ├── hooks/      useWorkspaces
│   └── lib/        Logger、Sentry、PerfTracker
└── shared/         共有型、Zodスキーマ、PerfTracker、ワークスペースユーティリティ
```

## ドキュメント

`docs/` ディレクトリに製品・設計ドキュメントがあります：

- `docs/product/` — 要件定義、技術スタック、ドメイン用語集
- `docs/design/` — アーキテクチャ、ADR、RFCテンプレート
- `docs/adr/` — 番号付きアーキテクチャ決定記録
- `docs/development/` — コードベースガイド、エージェントワークフロー、CI/CDガイド
- `docs/implementation/` — テスト戦略、CI/CD計画、対応アプリ
- `docs/management/` — LinearタスクSOP
