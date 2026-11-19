# AgiRity コードベース構造ガイド

## プロジェクト概要

**AgiRity** は「3秒で作業開始」を目指すワークスペース管理ツールです。  
プロジェクト作業に必要なアプリ（IDE、ブラウザ、フォルダ等）を自動起動します。

**技術スタック**: Electron + React + TypeScript + Tailwind CSS

---

## ディレクトリ構造

```text
src/
├── main/              # 🔧 Electronバックエンド（Node.js環境）
│   ├── index.ts       # メインプロセスのエントリーポイント
│   ├── preload.ts     # Preloadスクリプト（IPC橋渡し）
│   ├── container.ts   # DIコンテナ
│   ├── services/      # ビジネスロジック
│   │   ├── LauncherService.ts   # アプリ起動ロジック ⭐重要
│   │   ├── ConfigService.ts     # 設定管理
│   │   └── ProjectService.ts    # プロジェクト管理
│   ├── ipc/
│   │   └── index.ts   # IPCハンドラー登録 ⭐重要
│   ├── adapters/      # 外部依存の抽象化
│   │   ├── ShellAdapter.ts      # シェルコマンド実行
│   │   ├── FileSystemAdapter.ts # ファイル操作
│   │   └── OSAdapter.ts         # OS固有機能
│   └── lib/           # ユーティリティ
│       ├── logger.ts  # ロギング
│       └── sentry.ts  # エラー監視
│
├── renderer/          # 🎨 Reactフロントエンド
│   ├── index.tsx      # Rendererエントリーポイント
│   ├── App.tsx        # メインアプリコンポーネント ⭐重要
│   ├── components/    # UIコンポーネント
│   │   ├── Layout.tsx           # メインレイアウト（Header + Content）
│   │   ├── Header.tsx           # ブラウザライクなタブバー（ロゴ + ワークスペースタブ + メニュー）
│   │   ├── WorkspaceDetail.tsx  # ワークスペース詳細（ヘッダー + 2カラムレイアウト）
│   │   ├── WorkspaceSettings.tsx # ワークスペース設定
│   │   ├── CreateWorkspace.tsx  # ワークスペース作成
│   │   ├── ItemEditor.tsx       # アイテム編集
│   │   ├── AddItemModal.tsx     # アイテム追加モーダル
│   │   ├── Settings.tsx         # 設定画面
│   │   ├── ToolsRegistry.tsx    # ツール登録画面
│   │   └── MCPServers.tsx       # MCPサーバー画面
│   ├── api/
│   │   └── index.ts   # IPC抽象化レイヤー ⭐重要
│   ├── utils.ts       # ユーティリティ（cn関数）
│   └── lib/           # フロント側ユーティリティ
│
└── shared/            # 🔗 共通コード
    └── types.ts       # 型定義・スキーマ ⭐重要
```

---

## アーキテクチャの流れ

```text
┌─────────────────┐     IPC      ┌─────────────────┐
│   Renderer      │◄────────────►│     Main        │
│   (React)       │              │   (Node.js)     │
├─────────────────┤              ├─────────────────┤
│  App.tsx        │              │  ipc/index.ts   │
│      ↓          │              │      ↓          │
│  api/index.ts   │──invoke──────│  LauncherService│
│  (launcherApi)  │              │  ConfigService  │
└─────────────────┘              └─────────────────┘
                                        ↓
                                 ┌─────────────────┐
                                 │   Adapters      │
                                 │  (Shell, FS)    │
                                 └─────────────────┘
```

---

## ケース別：どのファイルを編集するか

### 1. UIを変更したい場合

| やりたいこと                             | 編集ファイル                                  |
| ---------------------------------------- | --------------------------------------------- |
| 全体レイアウト変更（Header + Content）   | `src/renderer/components/Layout.tsx`          |
| ブラウザライクなタブバー・メニュー       | `src/renderer/components/Header.tsx`          |
| ワークスペース詳細（ヘッダー + 2カラム） | `src/renderer/components/WorkspaceDetail.tsx` |
| 新規ワークスペース作成画面               | `src/renderer/components/CreateWorkspace.tsx` |
| アイテム編集UI                           | `src/renderer/components/ItemEditor.tsx`      |
| ビュータイプ・状態管理・遷移             | `src/renderer/App.tsx`                        |

### 2. バックエンドのロジック変更

| やりたいこと            | 編集ファイル                                    |
| ----------------------- | ----------------------------------------------- |
| アプリ起動方法の変更    | `src/main/services/LauncherService.ts`          |
| 設定の読み書き          | `src/main/services/ConfigService.ts`            |
| 新しいIPCチャンネル追加 | `src/main/ipc/index.ts` + `src/shared/types.ts` |
| シェルコマンド実行方法  | `src/main/adapters/ShellAdapter.ts`             |
| ファイル操作            | `src/main/adapters/FileSystemAdapter.ts`        |

### 3. 新機能追加のパターン

```
1. src/shared/types.ts     → 型・スキーマ定義
2. src/main/services/      → ビジネスロジック実装
3. src/main/ipc/index.ts   → IPCハンドラー登録
4. src/renderer/api/       → フロント側API抽象化
5. src/renderer/components → UI実装
6. src/renderer/App.tsx    → ルーティング追加
```

### 4. データモデル変更

| やりたいこと            | 編集ファイル                                           |
| ----------------------- | ------------------------------------------------------ |
| Workspaceの項目追加     | `src/shared/types.ts` (WorkspaceSchema)                |
| WorkspaceItemの項目追加 | `src/shared/types.ts` (WorkspaceItemSchema)            |
| 新しいIPC型の追加       | `src/shared/types.ts` (IPC_CHANNELS, インターフェース) |

---

## 絶対に見ておくべきファイル（Top 5）

### 1. `src/shared/types.ts`

**理由**: 全ての型定義がここにある。Zodスキーマでバリデーションも行う。

- `Workspace`, `WorkspaceItem` の構造
- IPC通信のチャンネル定義 (`IPC_CHANNELS`)
- APIインターフェース (`ILauncherApi`, `IWorkspaceApi`)

### 2. `src/main/services/LauncherService.ts`

**理由**: コアビジネスロジック。アプリ・ブラウザ・フォルダの起動処理。

- `launchItem()` - アイテム種別に応じて起動
- `launchApp()`, `launchBrowser()`, `launchFolder()`

### 3. `src/main/ipc/index.ts`

**理由**: フロント↔バックエンド通信の全ハンドラー。

- `setupIpcHandlers()` - 全IPCハンドラーを登録
- 新機能追加時は必ずここにハンドラー追加

### 4. `src/renderer/App.tsx`

**理由**: Reactアプリのメイン。状態管理と画面遷移。

- `View` enumで画面管理
- `MOCK_WORKSPACES` - 現在はモックデータ（将来的に永続化）
- 各種ハンドラー関数

### 5. `src/renderer/api/index.ts`

**理由**: フロントからバックエンドを呼ぶ際の抽象化レイヤー。

- `launcherApi.launchItem()` - アイテム起動
- `workspaceApi.load/save/get/delete()` - ワークスペース操作

---

## 開発時の注意点

### コーディング規約

- **ESLint**: v9 flat config形式
- **TypeScript**: strict mode、`any`禁止
- **コミット**: Conventional Commits (`feat:`, `fix:`, `docs:`)

### 現在の既知の問題

1. `getItemIcon` 関数が4コンポーネントで重複
2. Item CRUD ロジックがWorkspaceSettings と CreateWorkspaceで重複
3. spawn Promise パターンがLauncherServiceで3箇所重複
4. テストカバレッジが0%（急務）
5. `MOCK_WORKSPACES` がハードコード（永続化未実装）

### 関連ドキュメント

実装前に必ず確認すべきドキュメント:

- [docs/design/architecture.md](../design/architecture.md) - アーキテクチャ詳細
- [docs/product/domain_glossary.md](../product/domain_glossary.md) - 用語定義
- [docs/development/code_quality_rules.md](./code_quality_rules.md) - コード品質ルール

---

## クイックスタート

```text
# 依存関係インストール
npm ci

# 開発サーバー起動
npm run dev

# Lint チェック
npm run lint

# TypeScript型チェック
npm run typecheck

# ビルド
npm run build
```

---

## UI構造の最新状況

### ブラウザライクなタブUI

アプリはデフォルトで最初のワークスペース（id:'1'）を表示します。ヘッダーにはロゴ、全ワークスペースのタブ、ハンバーガーメニューが配置されています。

```
Header: [Logo] [Tab1] [Tab2] [Tab3] [+] ... [≡ Menu]
Content: WorkspaceDetail（またはその他ビュー）
```

### WorkspaceDetail の2カラムレイアウト

- **ヘッダー**（全幅）: ワークスペース名、説明、タグ、編集ボタン
- **左カラム**: Launch Presetsをカード縦並び
- **右カラム**: Workspace Toolsをリスト縦並び
- 各カラムの見出し（タイトル）はカード/リスト内に統合

### View型の構成

```typescript
type View =
  | { type: 'workspace'; id: string } // ワークスペース詳細
  | { type: 'workspace-settings'; id: string } // ワークスペース編集
  | { type: 'create-workspace' } // 新規作成
  | { type: 'tools' } // ツール登録（Phase 2）
  | { type: 'mcp' } // MCPサーバー設定（Phase 2）
  | { type: 'settings' }; // アプリ設定
```

---

_Last updated: 2025-12-30_
