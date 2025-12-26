# GitHub Actions バージョンアップ手順書

このドキュメントはDependabotが作成するGitHub Actionsのバージョンアップ PRをレビュー・マージする際の標準手順を定義します。

---

## 概要

GitHub Actionsのバージョンアップには以下の特徴があります：

- **Node.jsランタイムの変更**: 新バージョンでNode.jsの要求バージョンが上がる場合がある
- **Actions Runner要件**: 特定のRunnerバージョン以上が必要になる場合がある
- **Breaking Changes**: 入出力パラメータやデフォルト動作の変更
- **関連アクションとの互換性**: upload-artifact/download-artifact等のペア

これらのリスクを軽減するため、本手順に従って検証を実施してください。

---

## 確認フロー

```
┌─────────────────────────────────────────────────────────────────┐
│                GitHub Actions バージョンアップ                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. PRの変更内容を確認                                           │
│    - 変更されるアクションとバージョン                            │
│    - 変更ファイル（どのワークフローか）                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. CIステータスを確認                                           │
│    - 全チェックがパスしているか                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. リリースノートでBreaking Changesを確認                        │
│    - メジャーバージョン変更の場合は特に注意                      │
│    - Node.js/Runner要件の変更                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. 関連アクションとの互換性を確認                                │
│    - upload-artifact ↔ download-artifact                       │
│    - cache ↔ setup-node等                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. 使用方法がBreaking Changeに該当するか確認                     │
│    - 現在の使用パラメータを確認                                  │
│    - 影響を受ける使い方をしているか                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. マージ判断                                                   │
│    - 全項目問題なし → マージ可                                   │
│    - 問題あり → 修正対応または却下                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 詳細手順

### 1. PRの変更内容を確認

#### 1.1 変更対象の把握

PRの差分から以下を確認：

```bash
# GitHub CLIでPRの差分を確認
gh pr diff <PR番号>
```

確認項目：

| 項目 | 確認内容 |
|------|----------|
| アクション名 | 例: `actions/download-artifact` |
| 変更前バージョン | コミットSHAまたはタグ |
| 変更後バージョン | コミットSHAまたはタグ |
| 変更ファイル | どのワークフロー（`.github/workflows/*.yml`）か |

#### 1.2 バージョンの特定

コミットSHAからバージョンを特定する場合：

```bash
# GitHub CLIでタグ一覧を確認
gh api repos/actions/<action-name>/tags --jq '.[].name'

# 特定のコミットSHAがどのタグか確認
gh api repos/actions/<action-name>/tags --jq '.[] | select(.commit.sha == "<SHA>") | .name'
```

---

### 2. CIステータスを確認

PRのCIチェックが全てパスしているか確認：

```bash
gh pr checks <PR番号>
```

#### 2.1 確認すべき2種類のステータス

GitHub PRのステータスには**2種類**あり、両方を確認する必要があります：

| 種類 | 内容 | 例 |
|------|------|-----|
| **Check Runs** | GitHub Actions CI | build, test, lint等 |
| **Statuses** | 外部サービス連携 | Snyk, CodeRabbit, SonarCloud等 |

> **重要**: `mergeable_state: unstable`の場合、Check Runsの失敗が原因であることが多いです。Statusesのみがsuccessでも、Check Runsが失敗していればマージすべきではありません。

#### 2.2 確認方法

```bash
# Check Runs と Statuses の両方を確認
gh pr checks <PR番号>

# より詳細な確認（GitHub CLI）
gh pr view <PR番号> --json statusCheckRollup
```

#### 2.3 確認項目

- [ ] **Check Runs**: 全てパス（GitHub Actions CI）
- [ ] **Statuses**: 全てパス（外部サービス）
- [ ] ワークフローの実行が完了している
- [ ] `mergeable_state`が`clean`である

> **Note**: Dependabot PRはワークフローファイル自体の変更なので、変更後のワークフローでCIが実行されることに注意。

---

### 3. リリースノートでBreaking Changesを確認

#### 3.1 リリースノートの確認

```bash
# 最新リリースを確認
gh release view --repo actions/<action-name>

# 特定バージョンのリリースを確認
gh release view <tag> --repo actions/<action-name>
```

または直接GitHubのリリースページを確認：
`https://github.com/actions/<action-name>/releases`

#### 3.2 注意すべきキーワード

| キーワード | 意味 |
|-----------|------|
| `BREAKING CHANGE` | 互換性のない変更 |
| `Node.js XX` | ランタイム要件の変更 |
| `Runner vX.X.X` | Actions Runner要件 |
| `Deprecated` | 非推奨化 |
| `Removed` | 機能削除 |

#### 3.3 よくあるBreaking Changes

| アクション | よくある変更 |
|-----------|-------------|
| `actions/checkout` | サブモジュール動作、認証方式 |
| `actions/setup-node` | キャッシュ動作、Node.jsバージョン |
| `actions/upload-artifact` | アーティファクト保持期間、圧縮方式 |
| `actions/download-artifact` | ダウンロードパス動作、ID指定時の挙動 |
| `actions/cache` | キャッシュキー生成、復元動作 |

---

### 4. 関連アクションとの互換性を確認

#### 4.1 ペアアクションの確認

以下のアクションはペアで使用されるため、互換性を確認：

| アクション1 | アクション2 | 確認ポイント |
|------------|------------|-------------|
| `actions/upload-artifact` | `actions/download-artifact` | 同一メジャーバージョンが推奨 |
| `actions/cache` | `actions/cache/restore`, `actions/cache/save` | キャッシュキーの互換性 |

#### 4.2 現在のバージョン確認

```bash
# ワークフローファイルから使用中のアクションを抽出
grep -r "uses: actions/" .github/workflows/
```

---

### 5. 使用方法がBreaking Changeに該当するか確認

#### 5.1 現在の使用パラメータを確認

```bash
# 特定アクションの使用箇所を詳細確認
grep -A 10 "uses: actions/<action-name>" .github/workflows/*.yml
```

#### 5.2 影響判定の例

**download-artifact v5のBreaking Change例:**

```yaml
# v4以前: IDで単一アーティファクトをダウンロードした場合のパス動作
- uses: actions/download-artifact@v4
  with:
    artifact-id: 12345  # ← この使い方は影響を受ける

# name指定の場合は影響なし
- uses: actions/download-artifact@v7
  with:
    name: my-artifact   # ← この使い方は影響を受けない
```

---

### 6. マージ判断

#### 6.1 判断基準

| 条件 | 判断 |
|------|------|
| CIパス + Breaking Change影響なし | マージ可 |
| CIパス + Breaking Change影響あり（対応済み） | マージ可 |
| CI失敗 | 原因調査が必要 |
| Self-hosted Runner使用 + Runner要件変更 | Runner更新後にマージ |

#### 6.2 Runner要件の確認

Self-hosted Runnersを使用している場合：

```yaml
# ワークフローでself-hostedを使用しているか確認
grep -r "runs-on:.*self-hosted" .github/workflows/
```

GitHub-hosted Runnersのみの場合は、Runner要件は自動的に満たされます。

---

## チェックリスト

PRレビュー時に使用するチェックリスト：

```markdown
## GitHub Actions アップグレード検証

### 対象
- アクション名: 
- バージョン: vX.X.X → vY.Y.Y
- 変更ファイル: 

### 検証結果
- [ ] CIチェック全パス
- [ ] リリースノート確認
- [ ] Breaking Changes: あり / なし
- [ ] 関連アクションとの互換性確認
- [ ] 現在の使用方法がBreaking Changeに該当しないことを確認
- [ ] Runner要件: GitHub-hosted / Self-hosted（要件確認済み）

### 判定
- [ ] マージ可
- [ ] 修正が必要（理由: ）
```

---

## Dependabot PRの特徴

Dependabotが作成するGitHub Actions更新PRの形式：

| 項目 | 形式 |
|------|------|
| ブランチ名 | `dependabot/github_actions/<action-name>-X.X.X` |
| タイトル | `ci: bump <action-name> from X.X.X to Y.Y.Y` |
| 変更ファイル | `.github/workflows/*.yml` |
| コミット形式 | コミットSHA（セキュリティのためフルSHAを使用） |

### Dependabot PR特有の注意点

1. **コミットSHA使用**: セキュリティベストプラクティスとしてタグではなくコミットSHAを使用
2. **コメントのバージョン表記**: `# v4`等のコメントは参考情報（実際のバージョンはSHAで確認）
3. **複数メジャーバージョンスキップ**: 複数バージョンをスキップする場合、累積したBreaking Changesを確認

---

## 主要アクションのリリースページ

| アクション | リリースページ |
|-----------|---------------|
| actions/checkout | https://github.com/actions/checkout/releases |
| actions/setup-node | https://github.com/actions/setup-node/releases |
| actions/upload-artifact | https://github.com/actions/upload-artifact/releases |
| actions/download-artifact | https://github.com/actions/download-artifact/releases |
| actions/cache | https://github.com/actions/cache/releases |

---

## 参考リンク

- [GitHub Actions公式ドキュメント](https://docs.github.com/en/actions)
- [Dependabot公式ドキュメント](https://docs.github.com/en/code-security/dependabot)
- [actions/runner リリース](https://github.com/actions/runner/releases)
- [GitHub-hosted Runners仕様](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners)
