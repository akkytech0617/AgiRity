# AgiRity ドメイン用語集 & データモデル

## 1. 用語集 (Glossary)

### コアコンセプト
- **Workspace (ワークスペース)**: 特定の作業（例: "A社案件開発", "月次レポート作成"）に必要なアプリケーション、URL、フォルダ設定の集合体。
- **Workspace Item (アイテム)**: ワークスペースを構成する個々の要素。アプリ、ブラウザURL、フォルダパスなどが含まれる。
- **Workspace Preset (プリセット)**: ワークスペース内のアイテムをグループ化した起動設定。用途別（開発のみ、レビューのみ等）の部分起動を可能にする。
- **Tag (タグ)**: ワークスペースを分類・検索するためのラベル（例: "frontend", "design", "urgent"）。

### システムコンポーネント
- **App Launcher**: ローカルアプリケーションを起動する機能。OSごとの差異（macOS `.app`, Windows `.exe`）を吸収する。
- **Config Service**: ワークスペース設定（YAML）の読み書きを担当するサービス。
- **Main Process**: Electronのメインプロセス。システム操作（アプリ起動、ファイルアクセス）を担当。
- **Renderer Process**: Reactで構築されたUI層。ユーザー操作を受け付ける。

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

### WorkspacePreset
ワークスペース内のアイテムをグループ化した起動プリセット。部分的な起動やシナリオ別の起動を可能にする。

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | ✅ | プリセットの表示名（例: "Full Development", "Code Only"） |
| `description` | string | | プリセットの説明 |
| `itemNames` | string[] | ✅ | 起動対象のアイテム名リスト（`WorkspaceItem.name` を参照） |

---

## 3. 設定ファイル例 (workspaces.yaml)

```yaml
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

    # 2. VS Code with project folder (depends on Docker)
    - type: "app"
      name: "VS Code"
      path: "/Applications/Visual Studio Code.app"
      folder: "~/workspace/client-a-frontend"
      dependsOn: "Docker Desktop"

    # 3. References
    - type: "browser"
      name: "Reference Links"
      urls:
        - "https://github.com/client-a/repo"
        - "https://figma.com/file/xyz"
  
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
```
