# パターンと規約

## TypeScript

- **strict モード** 有効（`tsconfig.json`）
- **パスエイリアス:** `@/` → `src/`
- **設定ファイル:** `tsconfig.json`（レンダラー用）, `tsconfig.node.json`（メインプロセス用）

## 依存性注入（DI）

コンストラクタ注入パターンを採用。`createContainer()` で全依存関係を組み立てます。

```typescript
// src/main/container.ts
export function createContainer(overrides?: Partial<AppContainer>): AppContainer {
  const fileSystem = overrides?.fileSystem ?? new FileSystemAdapter();
  const os = overrides?.os ?? new OSAdapter();
  const shell = overrides?.shell ?? new ShellAdapter(os);
  const app = overrides?.app ?? new AppAdapter();
  const config = overrides?.config ?? new ConfigService(os, fileSystem);
  const project = overrides?.project ?? new ProjectService(config, fileSystem);
  const launcher = overrides?.launcher ?? new LauncherService(shell, config, app);
  return { fileSystem, os, shell, app, config, project, launcher };
}
```

## アダプターパターン

外部依存（ファイルシステム、シェル、OS、アプリ）はアダプターインターフェースで抽象化します。

| アダプター | インターフェース | 実装 | 役割 |
|-----------|-----------------|------|------|
| FileSystemAdapter | `IFileSystemAdapter` | `FileSystemAdapter` | ファイル読み書き・ディレクトリ作成 |
| ShellAdapter | `IShellAdapter` | `ShellAdapter` | `openPath`, `openExternal`, `launchApp` |
| OSAdapter | `IOSAdapter` | `OSAdapter` | `homedir()` 等の OS 情報 |
| AppAdapter | `IAppAdapter` | `AppAdapter` | sips アイコン抽出、favicon 取得 |

## エラーハンドリング

| レイヤー | 方針 |
|---------|------|
| サービス層 | エラーを **スロー** する（`throw new Error()`） |
| IPC 層 | エラーをキャッチして `{ success: false, error: string }` を返却 |
| レンダラー | `result.success` をチェックし、失敗時は `log.error()` + ユーザー通知 |

```typescript
// IPC レスポンス型
interface WorkspaceResult {
  success: boolean;
  data?: Workspace | Workspace[] | null | boolean;
  error?: string;
}
```

## Zod バリデーション

メインプロセスとレンダラープロセスの両側で Zod スキーマによる検証を実施。

- **共有スキーマ:** `src/shared/types.ts` で一元管理
- **ProjectService:** 読込時・保存時の両方でスキーマ検証
- **IPC チャンネル:** 型安全なチャンネル名を `IPC_CHANNELS` で定義

## 状態管理

外部ライブラリ（Redux 等）は使用せず、React の標準フックのみ。

| フック | 用途 |
|--------|------|
| `useState` | ローカル状態（ワークスペース一覧、ローディング、エラー） |
| `useEffect` | 副作用（データ読込、ライフサイクル） |
| `useCallback` | コールバックのメモ化 |
| `useRef` | DOM 参照、パフォーマンス計測用マーカー |

## スタイリング

- **Tailwind CSS v4** + `@tailwindcss/postcss`
- **HeroUI** コンポーネントライブラリ（ダークモード対応）
- **tailwind-merge** でクラス名のマージ（`clsx` + `twMerge`）
- **カラートークン:** `text-text-primary`, `text-text-secondary`, `bg-surface`, `border-border` 等

## 命名規約

### ファイル・ディレクトリ

| 種類 | 規約 | 例 |
|------|------|-----|
| コンポーネント | PascalCase | `WorkspaceEditor.tsx` |
| サービス | PascalCase + Service | `ProjectService.ts` |
| アダプター | PascalCase + Adapter | `FileSystemAdapter.ts` |
| ユーティリティ | camelCase | `workspace-utils.ts` |
| 型定義 | types.ts | `src/shared/types.ts` |

### コンポーネント

| 規約 | 例 |
|------|-----|
| 関数コンポーネント + 名前付きエクスポート | `export function AppHeader()` |
| Props は `Readonly<>` で型付け | `props: Readonly<AppHeaderProps>` |
| イベントハンドラーは `on` プレフィックス | `onSelect`, `onLaunch`, `onOpenSettings` |

### Zod スキーマ

| 規約 | 例 |
|------|-----|
| スキーマ名: PascalCase + Schema | `WorkspaceSchema`, `WorkspaceItemSchema` |
| 型名: スキーマ名から Schema を除去 | `type Workspace = z.infer<typeof WorkspaceSchema>` |

### IPC チャンネル

`domain:action` 形式の定数。

```typescript
export const IPC_CHANNELS = {
  LAUNCHER_LAUNCH_ITEM: 'launcher:launchItem',
  WORKSPACE_LOAD: 'workspace:load',
  WORKSPACE_SAVE: 'workspace:save',
  // ...
} as const;
```

## Git 規約

- **コミットメッセージ:** Conventional Commits 形式（`feat:`, `fix:`, `chore:` 等）
- **マージ戦略:** Squash merge（PR 単位で 1 コミットに圧縮）
- **ブランチ:** `feat/`, `fix/`, `spike/` プレフィックス（[開発ワークフロー](development-workflow.md)参照）
