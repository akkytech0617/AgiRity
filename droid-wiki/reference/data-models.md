# データモデル

## スキーマ定義

全てのスキーマは `src/shared/types.ts` で Zod を用いて定義されています。

## Workspace

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `id` | `string` (UUID) | ✅ | ワークスペースの一意識別子 |
| `name` | `string` | ✅ | ワークスペース名 |
| `description` | `string` | - | ワークスペースの説明 |
| `items` | `WorkspaceItem[]` | ✅ | 起動アイテムの配列 |
| `presets` | `WorkspacePreset[]` | - | プリセット定義の配列 |
| `tags` | `string[]` | - | タグ配列 |
| `createdAt` | `string` (ISO 8601) | ✅ | 作成日時 |
| `updatedAt` | `string` (ISO 8601) | ✅ | 更新日時 |

## WorkspaceItem

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `type` | `'app' \| 'browser' \| 'folder'` | ✅ | アイテムタイプ |
| `name` | `string` | ✅ | アイテム名 |
| `category` | `string` | - | カテゴリ |
| `path` | `string` | - | アプリまたはフォルダのパス |
| `urls` | `string[]` (URL) | - | ブラウザアイテムの URL 配列 |
| `folder` | `string` | - | アプリ起動時の作業フォルダ |
| `waitTime` | `number` | - | 起動後の待機時間（ミリ秒） |
| `dependsOn` | `string` | - | 依存先アイテム名 |

## WorkspacePreset

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `name` | `string` | ✅ | プリセット名 |
| `description` | `string` | - | プリセットの説明 |
| `itemNames` | `string[]` | ✅ | 対象アイテム名の配列 |

## Result 型

### LaunchResult

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `success` | `boolean` | 起動成功フラグ |
| `error` | `string` | エラーメッセージ（失敗時） |

### IconResult

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `success` | `boolean` | 取得成功フラグ |
| `data` | `string` | Base64 画像データ または Lucide アイコン名 |
| `error` | `string` | エラーメッセージ（失敗時） |

### WorkspaceResult

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `success` | `boolean` | 操作成功フラグ |
| `data` | `Workspace \| Workspace[] \| null \| boolean` | 操作結果データ |
| `error` | `string` | エラーメッセージ（失敗時） |

## YAML 保存形式

```yaml
schemaVersion: 1
workspaces:
  - id: "550e8400-e29b-41d4-a716-446655440000"
    name: "My Project"
    description: "フロントエンド開発環境"
    items:
      - type: "app"
        name: "VS Code"
        path: "/Applications/Visual Studio Code.app"
        folder: "~/projects/my-app"
      - type: "browser"
        name: "Localhost"
        urls:
          - "http://localhost:3000"
      - type: "folder"
        name: "Project Folder"
        path: "~/projects/my-app"
    presets:
      - name: "開発"
        description: "開発に必要なアプリのみ"
        itemNames:
          - "VS Code"
          - "Localhost"
    tags:
      - "frontend"
      - "react"
    createdAt: "2025-01-01T00:00:00.000Z"
    updatedAt: "2025-06-01T12:00:00.000Z"
```

### YAML 書き込みオプション

| オプション | 値 | 説明 |
|-----------|-----|------|
| `indent` | 2 | インデント幅 |
| `lineWidth` | -1 | 行折り返しなし |
| `noRefs` | true | YAML 参照（アンカー/エイリアス）を使用しない |
