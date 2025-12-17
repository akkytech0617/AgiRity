# ADR-003: React Testing Library for Renderer Layer

## Status

Accepted

## Date

2024-12-17

## Context

現在のテストカバレッジはMainプロセス（ConfigService, ProjectService, LauncherService）のみで、Rendererプロセス（Reactコンポーネント）のテストが不足していた。

### 課題
- UIコンポーネントの動作保証がない
- リファクタリング時の回帰テスト不可
- ユーザーインタラクションのテストがない

### 検討した選択肢

| ツール | 長所 | 短所 |
|--------|------|------|
| **React Testing Library** | ユーザー視点のテスト、アクセシビリティ重視 | E2Eほど包括的ではない |
| **Enzyme** | 実装詳細テスト可能 | React 18+サポート不十分、非推奨 |
| **Playwright Component Testing** | E2E風のテスト | セットアップ複雑、オーバーヘッド大 |

## Decision

**React Testing Library** を採用する。

### 理由

1. **ユーザー視点のテスト**: 実装詳細ではなく、ユーザー行動をテスト
2. **React公式推奨**: React docsで推奨されている
3. **アクセシビリティ**: `getByRole`, `getByLabelText`等のアクセシブルなクエリを強制
4. **軽量**: jsdom環境で高速実行
5. **実績**: React界隈のデファクトスタンダード

### セットアップ

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### vitest設定

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
});
```

### テスト戦略

| コンポーネントタイプ | テストアプローチ | 例 |
|---------------------|-----------------|-----|
| **プレゼンテーション** | Props → レンダリング確認 | Header, Layout |
| **インタラクティブ** | ユーザーイベント → コールバック確認 | Sidebar, QuickLaunch |
| **フォーム** | 入力 → バリデーション → 送信 | AddItemModal |

### 初期テストカバレッジ

| コンポーネント | テスト数 | カバレッジ |
|---------------|---------|-----------|
| Header | 8 | 基本機能 |
| Layout | 3 | 統合 |
| Sidebar | 7 | 検索・フィルタ |
| QuickLaunch | 5 | ワークスペース表示 |
| AddItemModal | 5 | フォーム動作 |

## Consequences

### Positive

- **回帰テスト**: コンポーネント変更時の安全性向上
- **リファクタリング**: 自信を持って実装変更可能
- **ドキュメント**: テストが使用例になる
- **アクセシビリティ**: テスト作成時にa11y意識が向上

### Negative

- **学習コスト**: Testing Libraryの思想（実装詳細を避ける）に慣れる必要
- **テスト保守**: UIの構造変更時にテスト更新が必要

### Neutral

- **カバレッジ目標**: 最終的に80%以上を目指すが、まずは主要コンポーネントから

## 補足

### ベストプラクティス

1. **アクセシブルなクエリ優先順位**:
   - `getByRole` > `getByLabelText` > `getByPlaceholderText` > `getByTestId`

2. **ユーザーイベント**:
   - `userEvent.setup()` → `await user.click()` の非同期パターン使用

3. **実装詳細を避ける**:
   - State、Props、クラス名に依存しない
   - ユーザーが見えるものでテスト

## テスト結果

```
Test Files  9 passed (9)
Tests  65 passed (37 main + 28 renderer)
```

## References

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [vitest.config.ts](../../vitest.config.ts)
