# AgiRity ドメイン用語集 & データモデル

## 1. 用語集 (Glossary)

### コアコンセプト
- **Workspace (ワークスペース)**: 特定の作業（例: "A社案件開発", "月次レポート作成"）に必要なアプリケーション、URL、フォルダ設定の集合体。
- **Workspace Item (アイテム)**: ワークスペースを構成する個々の要素。アプリ、ブラウザURL、フォルダパスなどが含まれる。
- **Workspace Preset (プリセット)**: ワークスペース内のアイテムをグループ化した起動設定。用途別（開発のみ、レビューのみ等）の部分起動を可能にする。
- **Tag (タグ)**: ワークスペースを分類・検索するためのラベル（例: "frontend", "design", "urgent"）。

### システムコンポーネント
- **App Launcher (LauncherService)**: ローカルアプリケーションを起動する機能。OSごとの差異（macOS `.app`, Windows `.exe`）を吸収する。`src/main/services/LauncherService.ts` に実装。
- **Config Service**: 設定ファイルのパス管理（`~/.agirity/`）とディレクトリ作成を担当。`src/main/services/ConfigService.ts` に実装。
- **Project Service**: ワークスペース設定（YAML）のCRUD操作を担当。Zodによるスキーマバリデーション付き。`src/main/services/ProjectService.ts` に実装。
- **Main Process**: Electronのメインプロセス。システム操作（アプリ起動、ファイルアクセス）を担当。
- **Renderer Process**: Reactで構築されたUI層。ユーザー操作を受け付ける。
- **IPC Handlers**: Main ProcessとRenderer Process間の通信を仲介。`src/main/ipc/index.ts` に実装。

---

## 2. データモデル (Entity Definitions)

### Workspace
ワークスペースの定義。`~/.agirity/workspaces.yaml` に保存される。

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | UUID (v4) | ✅ | 一意の識別子 |
| `name` | string | ✅ | ワークスペースの表示名 |
| `description` | string | | 概要説明 |
| `items` | WorkspaceItem[] | ✅ | 含まれるアイテムのリスト |
| `tags` | string[] | | 検索用タグ |
| `presets` | WorkspacePreset[] | | 起動プリセットのリスト |
| `createdAt` | ISO8601 | ✅ | 作成日時 |
| `updatedAt` | ISO8601 | ✅ | 最終更新日時 |

### WorkspaceItem
ワークスペースに含まれる個々の起動対象。

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | `app` \| `browser` \| `folder` | ✅ | アイテムの種類 |
| `name` | string | ✅ | アイテムの表示名 |
| `path` | string | ⚠️ | `app`, `folder` の場合必須。絶対パス。 |
| `urls` | string[] | ⚠️ | `browser` の場合必須。起動するURLリスト。 |
| `folder` | string | | `app` (VSCode等) で開く対象のフォルダパス。 |
| `waitTime` | number | | 起動後の待機時間（秒）。依存関係がある場合に利用。 |
| `dependsOn` | string | | 先に起動すべきアイテムの `name`。 |
| `category` | string | | 分類・グルーピング用ラベル。 |

### WorkspacePreset
ワークスペース内のアイテムをグループ化した起動プリセット。部分的な起動やシナリオ別の起動を可能にする。

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | ✅ | プリセットの表示名（例: "Full Development", "Code Only"） |
| `description` | string | | プリセットの説明 |
| `itemNames` | string[] | ✅ | 起動対象のアイテム名リスト（`WorkspaceItem.name` を参照） |

---

## 3. 設定ファイル仕様 (workspaces.yaml)

### ファイル構造

| Field | Type | Required | Description |
|---|---|---|---|
| `schemaVersion` | number | ✅ | スキーマバージョン（現在: 1）。将来のマイグレーション用。 |
| `workspaces` | Workspace[] | ✅ | ワークスペース定義の配列 |

### バリデーション
- **Zodスキーマ**: `src/main/services/ProjectService.ts` で定義
- **UUID形式**: `id` フィールドはUUID v4形式で検証
- **必須フィールド**: `type`, `name`, `items`, `createdAt`, `updatedAt`
- **条件付き必須**: `path`（app/folder時）、`urls`（browser時）

### エラーハンドリング
| ケース | 挙動 |
|--------|------|
| ファイル不在 (ENOENT) | 空配列を返す（初回起動時の正常動作） |
| 空ファイル | エラー: "Invalid workspace file format" |
| 不正なYAML構文 | エラー: YAMLパースエラー |
| スキーマ不一致 | エラー: "Invalid workspace file format" + 詳細 |

### 設定ファイル例

```yaml
schemaVersion: 1
workspaces:
  - id: "550e8400-e29b-41d4-a716-446655440000"
    name: "Client A Development"
    description: "Frontend development environment for Client A"
    tags: ["work", "frontend"]
    items:
      # 1. Docker (DB) start
      - type: "app"
        name: "Docker Desktop"
        path: "/Applications/Docker.app"
        waitTime: 30
        category: "development"

      # 2. VS Code with project folder (depends on Docker)
      - type: "app"
        name: "VS Code"
        path: "/Applications/Visual Studio Code.app"
        folder: "~/workspace/client-a-frontend"
        dependsOn: "Docker Desktop"
        category: "development"

      # 3. References
      - type: "browser"
        name: "Reference Links"
        urls:
          - "https://github.com/client-a/repo"
          - "https://figma.com/file/xyz"
        category: "reference"
    
    # Launch Presets (optional)
    presets:
      - name: "Full Development"
        description: "Start everything for full stack dev"
        itemNames: ["Docker Desktop", "VS Code", "Reference Links"]
      - name: "Code Only"
        description: "Just the editor without Docker"
        itemNames: ["VS Code"]
      - name: "Review Mode"
        description: "Browser tools for PR review"
        itemNames: ["Reference Links"]
    
    createdAt: "2024-01-01T00:00:00.000Z"
    updatedAt: "2024-01-15T00:00:00.000Z"
```

---

## 4. IPC通信チャンネル

Main ProcessとRenderer Process間の通信に使用するチャンネル定義。

| チャンネル | 方向 | 説明 |
|-----------|------|------|
| `launcher:launchItem` | Renderer → Main | アイテムを起動 |
| `workspace:load` | Renderer → Main | 全ワークスペースを読み込み |
| `workspace:get` | Renderer → Main | IDで単一ワークスペースを取得 |
| `workspace:save` | Renderer → Main | ワークスペースを保存（追加/更新） |
| `workspace:delete` | Renderer → Main | ワークスペースを削除 |

### 型定義
```typescript
// src/shared/types.ts
export const IPC_CHANNELS = {
  LAUNCHER_LAUNCH_ITEM: 'launcher:launchItem',
  WORKSPACE_LOAD: 'workspace:load',
  WORKSPACE_GET: 'workspace:get',
  WORKSPACE_SAVE: 'workspace:save',
  WORKSPACE_DELETE: 'workspace:delete',
} as const;
```
