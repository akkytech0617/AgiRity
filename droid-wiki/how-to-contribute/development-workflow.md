# 開発ワークフロー

## ブランチ命名パターン

| プレフィックス  | 用途                              | 例                                                       |
| --------------- | --------------------------------- | -------------------------------------------------------- |
| `feat/`         | 新機能追加                        | `feat/akk-100-workspace-editor`                          |
| `fix/`          | バグ修正                          | `fix/akk-140-preset-launch-filter`                       |
| `spike/`        | 技術検証・プロトタイプ            | `spike/investigate-electron-builder`                     |
| `snyk-upgrade-` | Snyk による依存関係アップグレード | `snyk-upgrade-d61e21f6654ce676ba908bc59a8764a8`          |
| `dependabot/`   | Dependabot による自動更新         | `dependabot/github_actions/extractions/setup-just-3.1.0` |

## ワークフロー手順

```
1. ブランチ作成   → feat/ または fix/ プレフィックスで作成
2. コーディング   → 型チェック・リント・フォーマットを意識
3. テスト         → 単体テスト・型チェックが通ることを確認
4. PR 作成        → GitHub で Pull Request を作成
5. レビュー       → コードレビュー + CI チェック通過
6. マージ         → Squash merge で main に統合
```

## Lefthook Git フック

[Lefthook](https://github.com/evilmartians/lefthook) により、Git 操作時に自動チェックが実行されます。

### pre-commit（並列実行）

| コマンド            | 対象ファイル                  | 内容                  |
| ------------------- | ----------------------------- | --------------------- |
| `just lint`         | `*.{ts,tsx}`                  | Biome によるリント    |
| `just format-check` | `*.{ts,tsx,json,md,yml,yaml}` | フォーマットチェック  |
| `just type-check`   | 全ファイル                    | TypeScript 型チェック |

### pre-push（並列実行）

| コマンド    | 内容                  |
| ----------- | --------------------- |
| `just test` | Vitest 単体テスト実行 |

Snyk SCA/SAST は手動・任意の `just security-all` で実行できます。Git hooks、`just ci`、GitHub Actions からは実行しません。

## CI パイプライン

GitHub Actions（`.github/workflows/ci.yml`）で以下のステップが実行されます。

| ステップ             | 内容                       |
| -------------------- | -------------------------- |
| 依存関係インストール | `npm ci`                   |
| リント               | Biome チェック             |
| 型チェック           | TypeScript コンパイル検証  |
| フォーマット         | Biome フォーマットチェック |
| 単体テスト           | Vitest 実行                |
| カバレッジ           | v8 カバレッジレポート      |
| ビルド               | `tsc && vite build`        |

## Linear 連携

チケット管理は [Linear](https://linear.app) を使用します。

| フェーズ     | Linear ステータス | タイミング     |
| ------------ | ----------------- | -------------- |
| 作業開始     | **In Progress**   | ブランチ作成時 |
| レビュー依頼 | **In Review**     | PR 作成時      |
| 完了         | **Done**          | マージ完了時   |

### タスク作成 SOP

`docs/management/linear_task_sop.md` に従い、設計ドキュメントからタスクを分解して Linear に登録します。
