# AIエージェント作業ワークフロー標準

## 概要

このドキュメントは、AIエージェントがAgiRityプロジェクトで作業する際の標準ワークフローを定義します。
AGENTS.mdの簡潔なワークフローを詳細化したものです。

```
準備 → 理解 → 計画 → 実装 → 検証 → コミット・PR → 報告
```

---

## フェーズ0: 準備

### 0.1 Linearチケットの確認（該当する場合）

Linearチケットが与えられた場合：

1. **チケット情報を取得**
   - タイトル、説明、受け入れ基準を確認
   - 関連するチケットやブロッカーを確認

2. **ステータスを「In Progress」に更新**
   ```
   Linear: チケットのステータスを「In Progress」に変更
   ```

3. **作業開始コメントを追加**
   ```
   作業を開始します。
   - 担当: [エージェント名]
   - 開始時刻: [時刻]
   ```

### 0.2 ブランチ作成

1. **最新のmainを取得**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **ブランチを作成（命名規則に従う）**

   | Prefix | 用途 | 例 |
   |--------|------|-----|
   | `feature/*` | 新機能 | `feature/browser-url-support` |
   | `fix/*` | バグ修正 | `fix/app-launch-error` |
   | `docs/*` | ドキュメント | `docs/add-installation-guide` |
   | `refactor/*` | リファクタリング | `refactor/project-service` |
   | `test/*` | テスト追加 | `test/add-launcher-tests` |
   | `chore/*` | その他 | `chore/update-dependencies` |

   ```bash
   git checkout -b feature/[機能名]
   ```

---

## フェーズ1: 理解

### 1.1 要件の確認

1. **タスクの目的を明確化**
   - 誰のため？何のため？
   - 成功基準は何か？

2. **不明点があれば質問**（絶対原則「曖昧なら質問」）

   確認すべき観点：
   | 観点 | 確認すべき状況 | 質問例 |
   |------|---------------|--------|
   | 目的 | 「何のため」が不明 | 「この機能は誰がどんな場面で使いますか？」 |
   | 範囲 | 「どこまで」が不明 | 「〇〇も含みますか？」 |
   | 優先度 | 複数要素の優先順位不明 | 「速度と品質、どちらを優先？」 |
   | 制約 | 技術的制約が不明 | 「使用NGなライブラリは？」 |
   | 成功基準 | 完了条件が不明 | 「何ができれば完了？」 |

### 1.2 関連ドキュメントの参照（絶対原則「ドキュメントを読む」）

タスクに応じて以下を参照：

| タスク種別 | 参照すべきドキュメント |
|-----------|----------------------|
| 新機能実装 | `docs/product/01_requirment.md`, `docs/design/architecture.md` |
| UI変更 | `docs/product/02_tech_stacks.md`（React/Tailwind） |
| テスト追加 | `docs/implementation/testing_strategy.md` |
| バグ修正 | `docs/design/architecture.md`（該当箇所） |
| リファクタリング | `docs/design/architecture.md`, ADRs |

### 1.3 現状把握

1. **codebase-explorerで調査**（必要に応じて）
   ```
   codebase-explorer に委任:
   - 対象: [調査対象のディレクトリ/ファイル]
   - 目的: [何を把握したいか]
   ```

2. **結果をサマリーで保持**（絶対原則「コンテキストを軽く保つ」）
   ```
   調査結果:
   - 関連ファイル: src/main/services/[Service].ts
   - 既存パターン: [概要]
   - 注意点: [概要]
   ```

---

## フェーズ2: 計画

### 2.1 タスク分解

1. **1タスク = 1つの明確な成果物**に分解
2. **依存関係を整理**

### 2.2 TodoWriteで記録

```javascript
TodoWrite([
  { content: '現状把握: 既存コードの調査', status: 'completed' },
  { content: '実装: [機能1]', status: 'in_progress' },
  { content: '実装: [機能2]', status: 'pending' },
  { content: 'テスト: ユニットテスト追加', status: 'pending' },
  { content: '検証: just ci 実行', status: 'pending' },
]);
```

### 2.3 ユーザーに計画を提示

```markdown
## 作業計画

### タスク概要
[タスクの簡潔な説明]

### 分解タスク
1. [タスク1]: [成果物]
2. [タスク2]: [成果物]
3. ...

### 期待される成果物
- [ファイルパス1]
- [ファイルパス2]

### 完了条件
- [条件1]
- [条件2]

### やらないこと
- [スコープ外の事項]
```

---

## フェーズ3: 実装

### 3.1 サブエージェントへの委任（絶対原則「実装禁止」「明確に委任」）

**feature-developerへの委任形式：**

```markdown
## タスク
[具体的な作業内容を1文で]

## コンテキスト
- 対象: [ファイルパス]
- 前提: [知っておくべき情報]
- 制約: [守るべきルール]
- 参照: [関連ドキュメント]

## 期待する出力
- [ファイルパス1]
- [ファイルパス2]

## 完了条件
- [条件1]
- [条件2]
- テストが通ること
```

### 3.2 テストの追加・更新

**テスト追加の基準：**

| 変更内容 | 必要なテスト |
|----------|-------------|
| 新規関数/メソッド | ユニットテスト必須 |
| 既存ロジック変更 | 既存テスト更新 + 新規ケース追加 |
| UIコンポーネント追加 | React Testing Libraryテスト |
| IPC追加 | 統合テスト |
| 重要なユーザーフロー | E2Eテスト検討 |

### 3.3 実装時の注意事項

1. **既存パターンに従う**
   - DIコンテナの使用（`src/main/container.ts`）
   - Adapterパターン（`src/main/adapters/`）
   - Zodスキーマによるバリデーション

2. **セキュリティ考慮**
   - パス検証（traversal attack防止）
   - コマンドインジェクション防止（`spawn`使用、`exec`禁止）
   - 入力バリデーション（Zodスキーマ）

3. **ロギング**
   - electron-logを使用
   - 機密情報をログに含めない

---

## フェーズ4: 検証

### 4.1 コードレビュー

**code-reviewerへの委任：**

```markdown
## タスク
実装したコードのレビュー

## 対象ファイル
- [ファイルパス1]
- [ファイルパス2]

## レビュー観点
- 機能: 仕様通りに動作するか
- テスト: テストは十分か
- コード品質: 読みやすさ、保守性
- パフォーマンス: 性能問題はないか
- セキュリティ: 脆弱性はないか
```

### 4.2 just ci の実行

**必ずコミット前に実行：**

```bash
just ci
```

これにより以下が実行される：
1. `check` - type-check, format-check, lint
2. `test` - ユニットテスト
3. `e2e` - E2Eテスト
4. `security-all` - Snyk SCA/SAST
5. `build` - プロダクションビルド

### 4.3 エラー修正

**just ciが失敗した場合：**

| エラー種別 | 対処 |
|-----------|------|
| Type Error | 型定義を修正 |
| Lint Error | `just fix` で自動修正、または手動修正 |
| Format Error | `just format` で自動修正 |
| Test Failure | テストまたは実装を修正 |
| Security Issue | 依存関係更新または脆弱なコード修正 |
| Build Error | ビルド設定または実装を修正 |

**修正後、再度 `just ci` を実行して確認**

---

## フェーズ5: コミット・PR

コミットとPR作成はユーザーからの指示があった場合のみ行います。

**詳細は [git_release_guide.md](git_release_guide.md) を参照：**
- コミットメッセージ規約（Conventional Commits）
- バージョニング（Semantic Versioning）
- リリースフロー

### AIエージェントがコミット・PRを行う場合

1. **コミット前チェック**
   - `just ci` が成功していること
   - 不要なコメント・デバッグコードがないこと
   - 機密情報が含まれていないこと

2. **Lefthookによる自動チェック**
   - pre-commit: lint, format-check, type-check
   - pre-push: test, security-all

3. **Linearチケット更新（該当する場合）**
   - PRリンクをコメントに追加
   - ステータスを「In Review」に更新

---

## フェーズ6: 報告

### 6.1 完了報告

```markdown
## 完了報告

### 実施内容
[何をしたかの要約]

### 変更ファイル
- `src/main/services/[Service].ts` - [変更内容]
- `src/renderer/components/[Component].tsx` - [変更内容]
- `tests/unit/...` - テスト追加

### PR
[PRのURL]

### 注意点・残課題
- [注意すべき点]
- [残っている課題があれば]

### 次のアクション（あれば）
- [次にやるべきこと]
```

### 6.2 Linearチケット完了（該当する場合）

1. **ステータスを「In Review」に更新**

2. **完了コメントを追加**
   ```
   作業完了しました。

   PR: [URL]

   完了した内容:
   - [内容1]
   - [内容2]
   ```

---

## ベストプラクティス

### DO (推奨)

✅ テストファースト開発
✅ 小さく頻繁にコミット
✅ 意味のあるコミットメッセージ
✅ コードレビュー (セルフレビュー含む)
✅ 継続的なリファクタリング
✅ ドキュメント更新

### DON'T (非推奨)

❌ テストなしでコミット
❌ 大きすぎるPR (500行以上)
❌ 曖昧なコミットメッセージ
❌ mainに直接Push
❌ CI失敗を無視
❌ ドキュメント放置

---

## 横断的なルール

### 品質ゲート

#### Lefthookによる自動チェック

| フック | タイミング | 実行内容 |
|--------|-----------|---------|
| pre-commit | `git commit` 時 | lint, format-check, type-check |
| pre-push | `git push` 時 | test, security-all |

#### フックをスキップする場合（緊急時のみ）

```bash
git commit --no-verify -m "emergency fix"
git push --no-verify
```

**注意：** スキップは緊急時のみ。CIでチェックされるため、問題があれば検出される。

### セキュリティスキャン

#### Snyk（実装済み）

| スキャン | コマンド | 内容 |
|---------|---------|------|
| SCA | `just security` | 依存関係の脆弱性スキャン |
| SAST | `just security-code` | コードの脆弱性スキャン |
| 両方 | `just security-all` | 上記両方 |

#### 脆弱性が検出された場合

1. **重大度を確認**（Critical, High, Medium, Low）
2. **Criticalは即座に対応**
3. **Highは可能な限り早く対応**
4. **修正方法**
   - 依存関係の場合: バージョンアップ
   - コードの場合: 脆弱なパターンを修正

### 依存関係の追加

新しい依存関係を追加する場合：

1. **必要性を確認**
   - 本当に必要か？既存ライブラリで代替できないか？

2. **セキュリティ確認**
   ```bash
   npm install [package]
   just security  # 脆弱性チェック
   ```

3. **ライセンス確認**
   - MIT, Apache 2.0, BSD は OK
   - GPL は要確認（伝染性ライセンス）

4. **ドキュメント更新**
   - 重要な依存関係は `docs/product/02_tech_stacks.md` に追記

### ドキュメント更新

#### 更新が必要なケース

| 変更内容 | 更新すべきドキュメント |
|----------|----------------------|
| 新機能追加 | `docs/product/01_requirment.md`（機能一覧） |
| アーキテクチャ変更 | `docs/design/architecture.md` |
| 技術スタック変更 | `docs/product/02_tech_stacks.md` |
| 重要な設計判断 | ADR作成（`docs/adr/`） |
| テスト戦略変更 | `docs/implementation/testing_strategy.md` |
| 開発フロー変更 | `docs/development/` 配下 |

#### ADR作成の基準

以下の場合はADRを作成：
- アーキテクチャに影響する判断
- 技術選定（ライブラリ、フレームワーク）
- 重要なトレードオフを伴う判断

---

## エラー対応フロー

### just ci 失敗時の対処

```
just ci 失敗
    │
    ├─ type-check 失敗 → 型エラーを修正
    │
    ├─ lint 失敗 → just fix で自動修正、または手動修正
    │
    ├─ format-check 失敗 → just format で自動修正
    │
    ├─ test 失敗 → テストまたは実装を修正
    │
    ├─ e2e 失敗 → E2Eテストまたは実装を修正
    │
    ├─ security 失敗 → 脆弱性を修正（上記「セキュリティスキャン」参照）
    │
    └─ build 失敗 → ビルドエラーを修正

    ↓
再度 just ci 実行
    ↓
成功するまで繰り返す
```

### よくあるエラーと対処

| エラー | 原因 | 対処 |
|--------|------|------|
| `TS2345: Argument of type...` | 型不一致 | 型定義を確認・修正 |
| `ESLint: no-explicit-any` | any型使用 | 適切な型を定義 |
| `Test failed: Expected...` | テスト失敗 | 期待値または実装を修正 |
| `SNYK-JS-...` | 脆弱な依存関係 | バージョンアップ |
| `Build failed: Cannot find module` | インポートエラー | パスを確認・修正 |

---

## クイックリファレンス

### よく使うコマンド

```bash
# 開発
just dev          # 開発サーバー起動

# チェック
just check        # 全チェック（type-check + format-check + lint）
just fix          # ESLint自動修正
just format       # Prettier実行

# テスト
just test         # ユニットテスト
just e2e          # E2Eテスト
just coverage     # カバレッジレポート

# セキュリティ
just security-all # 全セキュリティスキャン

# CI
just ci           # ローカルCI（全チェック + テスト + ビルド）

# ビルド
just build        # プロダクションビルド
```

### チェックリスト（コミット前）

- [ ] `just ci` が成功
- [ ] テストを追加/更新した
- [ ] ドキュメント更新（必要な場合）
- [ ] コミットメッセージがConventional Commits形式
- [ ] 機密情報が含まれていない

---

## 関連ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [AGENTS.md](../../AGENTS.md) | エージェント行動指針（絶対原則） |
| [docs/development/cicd_guide.md](cicd_guide.md) | CI/CDガイド（Just, Lefthook, GitHub Actions） |
| [docs/development/code_quality_rules.md](code_quality_rules.md) | コード品質ルール（ESLint, Prettier, Snyk） |
| [git_release_guide.md](git_release_guide.md) | Git操作・リリース管理ガイド |
| [docs/implementation/testing_strategy.md](../implementation/testing_strategy.md) | テスト戦略 |

---

_最終更新: 2025-12-25_
