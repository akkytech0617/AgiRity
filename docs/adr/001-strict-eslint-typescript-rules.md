# ADR-001: Strict ESLint/TypeScript Rules

## Status

Accepted

## Date

2025-12-17

## Context

AIコーディングツール（Claude Code、GitHub Copilotなど）の普及により、コード生成の速度は向上したが、以下の課題が顕在化している：

1. AIは「動くコード」を生成するが、「最適なコード」とは限らない
2. 過剰な防御的コード（不要なnullチェック）が生成されやすい
3. 曖昧な条件式（`if (value)` vs `if (value != null)`）が混在しやすい
4. 人間のレビュー負荷が増大している

## Decision

ESLintに`typescript-eslint`の厳格なルールセットを導入し、全ての主要ルールを`error`レベルで適用する。

### 採用したルールセット

```javascript
// typescript-eslint recommended configs
...tseslint.configs.strictTypeChecked,
...tseslint.configs.stylisticTypeChecked,
```

### 明示的に`error`として設定したルール

| ルール                          | 目的                           |
| ------------------------------- | ------------------------------ |
| `no-explicit-any`               | 型安全性の強制                 |
| `no-unsafe-assignment`          | 暗黙のany伝播防止              |
| `no-unsafe-call`                | 暗黙のany伝播防止              |
| `no-unsafe-member-access`       | 暗黙のany伝播防止              |
| `no-unsafe-return`              | 暗黙のany伝播防止              |
| `no-floating-promises`          | 未処理のPromise検出            |
| `await-thenable`                | 不要なawait検出                |
| `no-misused-promises`           | Promise誤用検出                |
| `require-await`                 | 不要なasync検出                |
| `strict-boolean-expressions`    | 曖昧な条件式の禁止             |
| `no-unnecessary-condition`      | 到達不能コード検出             |
| `restrict-template-expressions` | テンプレートリテラルの型安全性 |

### 緩和したルール（テストファイルのみ）

```javascript
// tests/**/*.ts
'@typescript-eslint/unbound-method': 'off',
'@typescript-eslint/no-unsafe-assignment': 'off',
'@typescript-eslint/no-unsafe-call': 'off',
'@typescript-eslint/no-unsafe-member-access': 'off',
```

理由：テストではモックの型が複雑になりがちで、過度な型付けは可読性を下げる。

### 緩和したルール（preload.tsのみ）

```javascript
// src/main/preload.ts
'@typescript-eslint/no-unsafe-argument': 'off',
```

理由：Electron IPCの`contextBridge.exposeInMainWorld`は型が複雑。

## Consequences

### Positive

- **AIコード生成の品質ゲート**: 不要なコード、曖昧なコードが自動的に弾かれる
- **レビュー負荷軽減**: 人間はロジックに集中できる
- **可読性の一貫性**: 条件式の書き方が統一される
- **バグ予防**: 型安全性により実行時エラーを防ぐ

### Negative

- **初期導入コスト**: 既存コードの修正が必要（完了済み）
- **学習コスト**: 厳格なルールに慣れる必要がある

### Neutral

- **ビルド時間**: 型チェックにより若干増加するが、許容範囲内

## References

- [typescript-eslint Strict Type-Checked Config](https://typescript-eslint.io/users/configs#strict-type-checked)
- [ESLint Configuration](../../../eslint.config.mjs)
