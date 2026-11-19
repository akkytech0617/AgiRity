# 用語集

AgiRityコードベースとドキュメントで使用される用語。

## コア概念

| 用語                       | 定義                                                                                                                    |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **ワークスペース**         | アプリ、URL、フォルダーの集合体。プロジェクトやタスクのコンテキストを表す。`~/.agirity/workspaces.yaml` に保存。        |
| **ワークスペースアイテム** | ワークスペース内の個別の起動対象。`type`（app、browser、folder）、名前、タイプ固有フィールドを持つ。                    |
| **プリセット**             | ワークスペース内のアイテム名のグループ。部分起動を可能にする（例: "Code Only"、"Full Dev"）。`WorkspacePreset` で定義。 |
| **タグ**                   | ワークスペースの分類・検索用ラベル。                                                                                    |
| **起動（Launch）**         | ワークスペース内の全アイテム（またはプリセットのサブセット）を順番に起動すること。                                      |

## システムコンポーネント

| 用語                     | 定義                                                                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **メインプロセス**       | ElectronのNode.jsプロセス。ファイルシステムアクセス、シェル実行、データ永続化を担当。エントリーポイント: `src/main/index.ts`。    |
| **レンダラープロセス**   | Chromium上で動作するReact SPA。システムへの直接アクセスはなく、IPCでのみ通信。エントリーポイント: `src/renderer/index.tsx`。      |
| **プリロードスクリプト** | `contextBridge` 経由で型付きAPI（`workspaceApi`、`launcherApi`）をレンダラーに公開するブリッジスクリプト。`src/main/preload.ts`。 |
| **IPC**                  | プロセス間通信。すべてElectronの `invoke`/`handle` パターン（双方向、Promiseベース）を使用。                                      |
| **アダプター**           | 外部依存（ファイルシステム、OS、シェル、アプリアイコン）の抽象化。DIコンテナでテスト可能性を確保。                                |
| **サービス**             | メインプロセスのビジネスロジッククラス（`ConfigService`、`ProjectService`、`LauncherService`）。                                  |
| **DIコンテナ**           | `src/main/container.ts` の `createContainer()` 関数。アダプターをサービスに配線し、テスト用のオーバーライドを受け付ける。         |

## データ型

| 用語              | 定義                                                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `WorkspaceItem`   | Zod検証付き: `{ type: 'app' \| 'browser' \| 'folder', name, path?, urls?, folder?, waitTime?, dependsOn?, category? }` |
| `WorkspacePreset` | `{ name, description?, itemNames: string[] }` — アイテムを名前で参照。                                                 |
| `Workspace`       | `{ id (UUID), name, description?, items[], presets?, tags?, createdAt, updatedAt }`                                    |
| `LaunchResult`    | `{ success: boolean, error?: string }` — 全IPC起動呼び出しの戻り値。                                                   |
| `WorkspaceResult` | `{ success: boolean, data?: T, error?: string }` — 汎用IPC結果ラッパー。                                               |
| `IconResult`      | `{ success: boolean, data?: string (base64 PNGまたはフォールバック名), error?: string }`                               |

## ファイルパス

| パス                             | 用途                                                          |
| -------------------------------- | ------------------------------------------------------------- |
| `~/.agirity/`                    | 設定ディレクトリ（`AGIRITY_CONFIG_DIR` 環境変数で上書き可能） |
| `~/.agirity/workspaces.yaml`     | 全ワークスペース定義                                          |
| `~/.agirity/workspaces.yaml.bak` | 書き込み前に作成されるバックアップ                            |
| `~/.agirity/logs/main.log`       | メインプロセスログファイル                                    |

## 外部ツール

| 用語         | 定義                                                                                                      |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| **Just**     | コマンドランナー（リポジトリルートの `Justfile`）。全ビルド/テスト/リントコマンドはJustレシピ経由。       |
| **Lefthook** | Gitフックマネージャー。`pre-commit` でリント/フォーマット/型チェック、`pre-push` でユニットテストを実行。 |
| **Biome**    | オールインワンリンター・フォーマッター（ESLint + Prettier の代替）。                                      |
| **Snyk**     | 手動・任意の依存関係スキャン（SCA）と静的コード解析（SAST）。必須 CI/Git hooks からは実行しない。         |
| **Sentry**   | エラー監視と構造化ロギング。`SENTRY_DSN` が未設定なら自動的に無効化。                                     |
