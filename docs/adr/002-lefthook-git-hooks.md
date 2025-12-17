# ADR-002: lefthook for Git Hooks

## Status

Accepted

## Date

2024-12-17

## Context

OSSプロジェクトとして公開予定のため、コントリビューターに対して以下を強制する仕組みが必要：

1. コミット前のLintチェック
2. コミット前のフォーマットチェック
3. コミット前の型チェック
4. プッシュ前のテスト実行

### 検討した選択肢

| 方法                    | 長所                          | 短所                      |
| ----------------------- | ----------------------------- | ------------------------- |
| **Husky + lint-staged** | 高い認知度、npm標準的         | 設定ファイル複数、依存2つ |
| **lefthook**            | 1ファイル設定、並列実行、高速 | 認知度中程度              |
| **simple-git-hooks**    | 最小構成                      | lint-staged別途必要       |
| **Git hooks直接**       | 依存なし                      | 共有困難                  |

## Decision

**lefthook** を採用する。

### 理由

1. **justfileとの思想的一貫性**: シンプルなYAML設定ファイル1つで完結
2. **並列実行がデフォルト**: lint, format, type-checkを同時実行し高速
3. **ステージファイル対応**: `{staged_files}` で変更ファイルのみ処理
4. **十分な実績**: Shopify, GitLab等の大規模プロジェクトで使用

### 設定内容

```yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    lint:
      glob: '*.{ts,tsx}'
      run: npx eslint {staged_files}
      stage_fixed: true
    format-check:
      glob: '*.{ts,tsx,json,md,yml,yaml}'
      run: npx prettier --check {staged_files}
    typecheck:
      run: npm run type-check

pre-push:
  parallel: true
  commands:
    test:
      run: npm test
```

### 開発者のセットアップ

新規コントリビューターは以下で自動的にhooksがインストールされる：

```bash
npm install  # postinstallでlefthook installが実行される
```

## Consequences

### Positive

- **品質ゲート**: 不正なコードがリポジトリに入らない
- **高速フィードバック**: 並列実行でコミット待ち時間を最小化
- **設定の簡潔さ**: 1ファイルで全hook設定を管理
- **OSS対応**: コントリビューター全員に自動適用

### Negative

- **Huskyより認知度低い**: ドキュメント化で補完
- **初回コミット時間増加**: 許容範囲内（約2秒）

### Neutral

- **CI/CDとの二重チェック**: 冗長だがセーフティネットとして有効

## References

- [lefthook GitHub](https://github.com/evilmartians/lefthook)
- [ADR-001: Strict ESLint/TypeScript Rules](./001-strict-eslint-typescript-rules.md)
- [lefthook.yml](../../../lefthook.yml)
