# AgiRity Phase 1 実装状況調査報告

## 調査概要
- **調査日**: 2026-01-12
- **対象**: docs/product/01_requirment.md のPhase 1機能 (No.1-18)
- **調査方法**: src/renderer/components/, src/main/, src/shared/ のコード解析

## 機能別実装状況

### ✅ 完了 (9機能)

| No | カテゴリ | 機能 | 実装状況 | 関連ファイル |
|----|---------|------|---------|-------------|
| 1 | ワークスペース | 作成・編集・削除 | ✅ 完了 | CreateWorkspace.tsx, WorkspaceSettings.tsx, ProjectService.ts |
| 2 | ワークスペース | 複数保存 | ✅ 完了 | ProjectService.ts (saveWorkspace/loadWorkspaces) |
| 3 | ワークスペース | 一覧表示 | ✅ 完了 | WorkspaceList.tsx |
| 5 | アプリ起動 | デスクトップアプリ起動 | ✅ 完了 | LauncherService.ts (launchApp) |
| 10 | ブラウザ | 複数URL起動 | ✅ 完了 | LauncherService.ts (launchBrowser) |
| 11 | ブラウザ | デフォルトブラウザ対応 | ✅ 完了 | LauncherService.ts (shell.openExternal) |
| 12 | ファイル | フォルダを開く | ✅ 完了 | LauncherService.ts (launchFolder) |
| 13 | データ | ローカル保存 | ✅ 完了 | ProjectService.ts (YAML形式で保存) |
| 17 | UI | ツール追加UI | ✅ 完了 | AddItemModal.tsx, ItemEditor.tsx |

### 🚧 部分実装 (7機能)

| No | カテゴリ | 機能 | 実装状況 | 関連ファイル | 備考 |
|----|---------|------|---------|-------------|------|
| 4 | ワークスペース | 実行(起動) | 🚧 部分 | WorkspaceDetail.tsx, useWorkspaces.ts | アイテムごとの個別起動は実装済みだが、プリセット起動機能が未完成 |
| 4a | ワークスペース | プリセット起動 | 🚧 部分 | PresetCard.tsx, WorkspaceDetail.tsx | UIは実装済みだが、プリセット指定の起動ロジック未実装（常に全アイテム起動） |
| 6 | アプリ起動 | 起動順序指定 | 🚧 部分 | ItemEditor.tsx, WorkspaceSettings.tsx | UIで順序付けは可能だが、実際の起動順序制御ロジック未実装 |
| 7 | アプリ起動 | 遅延起動 | 🚧 部分 | ItemEditor.tsx, WorkspaceSettings.tsx | UIでwaitTime設定は可能だが、実際の待機ロジック未実装 |
| 14 | UI | メイン画面 (Quick Launch) | 🚧 部分 | WorkspaceList.tsx | ワークスペース一覧表示は実装済みだが、Quick Launch機能が不完全 |
| 15 | UI | ワークスペース詳細画面 | 🚧 部分 | WorkspaceDetail.tsx | プリセット表示は実装済みだが、プリセット起動未完成 |
| 18 | UI | サイドバーナビゲーション | 🚧 部分 | Header.tsx | タブ形式のナビゲーションは実装済みだが、サイドバー形式ではない |

### ❌ 未実装 (2機能)

| No | カテゴリ | 機能 | 実装状況 | 関連ファイル | 備考 |
|----|---------|------|---------|-------------|------|
| 8 | アプリ起動 | シングルトン判定 | ❌ 未実装 | LauncherService.ts | 既に起動中かどうかの判定ロジックが実装されていない |
| 9 | アプリ起動 | マルチインスタンス対応 | ❌ 未実装 | LauncherService.ts | 常に新しいインスタンスを開くかどうかの制御が実装されていない |
| 16 | UI | ワークスペース編集画面 | ❌ 未実装 | WorkspaceSettings.tsx | 設定画面はあるが、編集画面の実装状況を要確認 |

## 技術的な詳細

### 起動ロジックの制限事項

**src/renderer/hooks/useWorkspaces.ts の launchWorkspace()**:
```typescript
for (const item of workspace.items) {
  try {
    const result = await launcherApi.launchItem(item);
    // ...
  } catch (error) {
    // ...
  }
}
```

**問題点**:
1. **waitTime未使用**: アイテムごとの遅延設定が反映されていない
2. **dependsOn未使用**: 依存関係に基づく起動順序制御が実装されていない
3. **プリセット未対応**: 常に `workspace.items` 全体を起動しており、プリセットの itemNames が考慮されていない

### データ構造

**WorkspaceItem のフィールド (src/shared/types.ts)**:
```typescript
{
  type: 'app' | 'browser' | 'folder',
  name: string,
  category?: string,
  path?: string,
  urls?: string[],
  folder?: string,
  waitTime?: number,        // ⚠️ 設定可能だが使用されていない
  dependsOn?: string        // ⚠️ 設定可能だが使用されていない
}
```

### IPCチャンネル

**実装済み (src/main/ipc/index.ts)**:
- `LAUNCHER_LAUNCH_ITEM`: アイテム起動
- `LAUNCHER_GET_ITEM_ICON`: アイコン取得
- `WORKSPACE_LOAD`: ワークスペース一覧読み込み
- `WORKSPACE_GET`: ワークスペース詳細取得
- `WORKSPACE_SAVE`: ワークスペース保存
- `WORKSPACE_DELETE`: ワークスペース削除

## 完了度サマリー

### 全体進捗
- ✅ 完了: 9/18 (50%)
- 🚧 部分実装: 7/18 (39%)
- ❌ 未実装: 2/18 (11%)

### カテゴリ別進捗
| カテゴリ | 進捗 | 備考 |
|---------|-------|------|
| ワークスペース | 🚧 75% | 基本管理機能は完了、プリセット起動が未完成 |
| アプリ起動 | 🚧 40% | 基本起動は実装済み、順序制御と単独/複数インスタンス判定が未実装 |
| ブラウザ | ✅ 100% | 複数URL起動、デフォルトブラウザ対応完了 |
| ファイル | ✅ 100% | フォルダを開く機能完了 |
| データ | ✅ 100% | YAML形式でのローカル保存完了 |
| UI | 🚧 67% | 基本UIは実装済みだが、起動機能との連携が未完成 |

## 実装優先度による推奨対応順

### 🔥 最高優先度（コア機能完成に必須）
1. **プリセット起動ロジックの実装** (No.4a) - useWorkspaces.ts の launchWorkspace をプリセット対応に修正
2. **起動順序制御の実装** (No.6, No.7) - waitTime と dependsOn を使用した起動ロジック
3. **シングルトン判定の実装** (No.8) - 実行中プロセスのチェック

### ⚡ 高優先度（実用レベルに必須）
4. **マルチインスタンス対応** (No.9) - アプリタイプに応じた起動制御
5. **Quick Launch機能の強化** (No.14) - ワンクリックでプリセット起動可能に
6. **サイドバーナビゲーションの実装** (No.18) - 要求通りのUI形式

### 💚 中優先度（改善）
7. **Workspace Settings UIの強化** (No.16) - 編集画面のUX改善

## 確認したファイル一覧

### メインプロセス
- src/main/index.ts
- src/main/container.ts
- src/main/ipc/index.ts
- src/main/preload.ts
- src/main/services/ConfigService.ts
- src/main/services/ProjectService.ts
- src/main/services/LauncherService.ts
- src/main/services/interfaces.ts
- src/main/adapters/ShellAdapter.ts
- src/main/adapters/interfaces.ts
- src/main/lib/logger.ts

### レンダラープロセス
- src/renderer/App.tsx
- src/renderer/api/index.ts
- src/renderer/data/workspaceDataSource.ts
- src/renderer/hooks/useWorkspaces.ts
- src/renderer/components/Layout.tsx
- src/renderer/components/Header.tsx
- src/renderer/components/WorkspaceList.tsx
- src/renderer/components/WorkspaceDetail.tsx
- src/renderer/components/WorkspaceSettings.tsx
- src/renderer/components/CreateWorkspace.tsx
- src/renderer/components/AddItemModal.tsx
- src/renderer/components/ItemEditor.tsx
- src/renderer/components/PresetCard.tsx
- src/renderer/components/ToolCard.tsx
- src/renderer/components/Settings.tsx
- src/renderer/components/MCPServers.tsx
- src/renderer/components/ToolsRegistry.tsx

### 共通
- src/shared/types.ts
- src/shared/lib/

### テスト・モック
- src/renderer/mocks/workspaces.ts
- tests/unit/main/...
- tests/unit/renderer/...
- tests/unit/shared/...

## 備考

### 既知の問題
1. **起動順序制御**: UIで設定可能だが、実際の起動ロジックで使用されていない
2. **プリセット起動**: PresetCard でプリセット選択可能だが、実際の起動は常に全アイテム
3. **シングルトン/マルチインスタンス**: 判定ロジックが実装されていない
4. **UIの不一致**: 要件定義ではサイドバーナビゲーションだが、実装はヘッダーのタブ形式

### 設計上の考慮事項
- 起動ロジックは LauncherService と useWorkspaces.hook に分散
- IPC通信を経由しているため、起動制御はレンダラー側で管理される
- 非同期起動の実装が必要（waitTime の待機）
