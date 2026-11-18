# 沿革

> AgiRityの開発史を時代ごとに振り返ります。

## 初期セットアップ（2025年11月）

- 2025年11月23日: 初回コミット。Electron + React + TypeScriptの基本スキャフォールドを作成
- `src/shared/types.ts` が最も変更の少ないファイルとして現存
- 基本的なプロジェクト構造（main/renderer/shared）を確立
- Vite + Electronのビルドパイプラインを構築

## 開発スプリント（2025年12月）

- 月間109コミット — プロジェクト全体で最も活動的な月
- DIコンテナ（`src/main/container.ts`）を導入し、アダプタパターンを確立
- アダプタ群を実装: `FileSystemAdapter`, `OSAdapter`, `ShellAdapter`, `AppAdapter`
- サービス群を実装: `ConfigService`, `ProjectService`, `LauncherService`
- IPCハンドラ（6チャネル）を構築
- `electron-log`によるロギング基盤を構築
- `@sentry/electron`によるエラー監視を統合
- パフォーマンストラッキング（`IPerfTracker` / `PerfTrackerImpl`）を導入
- テストインフラ（Vitest + Testing Library）を構築
- ZodスキーマによるIPC入力バリデーションを実装
- `WorkspaceList`, `WorkspaceEditor`, `ItemEditor`, `AddItemModal`など主要コンポーネントを実装
- `PresetCard`, `ToolCard`などのUIコンポーネントを実装

## 安定化（2026年1月〜2月）

- 2026年1月: 39コミット。バグ修正と既存機能の安定化に注力
- `WorkspaceEditor`の改善とバリデーション強化
- エラーハンドリングの改善
- 2026年2月: 7コミットと静かな月。内部的な整理が中心
- パフォーマンス測定の精度改善

## UIリデザイン（2026年3月〜4月）

- 2026年3月: 16コミット。HeroUI（旧NextUI）へのマイグレーション開始
- 新しいレイアウトコンポーネント群を導入:
  - `AppShell` — アプリケーション全体のレイアウト枠
  - `AppHeader` — 新ヘッダー
  - `MainPanel` — ワークスペース詳細パネル
  - `EmptyWorkspacePanel` — 空状態パネル
- 旧コンポーネント（`Header.tsx`, `Layout.tsx`）を削除
- 新しいワークスペースコンポーネント群を追加:
  - `LaunchButton`, `LaunchItemCard`, `PresetChips`, `WorkspaceSwitcher`
- 2026年4月: 25コミット。リデザイン継続
- `WorkspaceDetail`コンポーネントの導入
- `AppAdapter.ts`がSSRF保護（プライベートIPブロック）を実装
- ビルド依存のアップグレード（Electron 39, Vite 7, React 19）

## 最も長く残存する機能

- **ProjectService** — 2025年12月から現在まで、ワークスペースCRUDの中核
- **LauncherService** — 2025年12月から現在まで、アプリ起動の中核
- **DIコンテナ** — 2025年12月導入、テスト容易性の基盤として不変

## 非推奨化・削除済み

- タブヘッダー（旧`Header.tsx`） — 2026年3月に削除
- 旧サイドバー（旧`Layout.tsx`） — 2026年3月に削除
- `QuickLaunch` — ワークスペース詳細内の直接起動に統合
- 旧コンポーネント群 — HeroUIリデザインで一新

## 大規模リライト

- **2026年3〜4月のUIリデザイン**がプロジェクト史上最大の変更
  - レイアウトアーキテクチャの全面刷新
  - UIライブラリの移行（カスタム → HeroUI）
  - 旧コンポーネントの完全削除と新規実装
