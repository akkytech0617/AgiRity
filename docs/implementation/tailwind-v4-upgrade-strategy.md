# Tailwind CSS v4 アップグレード戦略

## 概要

Tailwind CSS v3.4.19 から v4.x へのアップグレード戦略を定義する。

## 現状分析

### 現在の構成

| 項目 | 現在の状態 |
|------|-----------|
| Tailwind CSS | v3.4.19 |
| tailwind-merge | v2.6.0 |
| PostCSS設定 | `postcss.config.js` |
| CSS設定 | `tailwind.config.js` (JavaScript) |
| CSSエントリ | `src/renderer/index.css` |
| ビルドツール | Vite |

### 使用状況

- **CSSファイル**: `src/renderer/index.css` のみ
- **Tailwindディレクティブ**: `@tailwind base/components/utilities` の標準構成
- **カスタム設定**: `tailwind.config.js` でカラー、フォント、スペーシング等をカスタマイズ
- **Tailwindクラス使用**: 13ファイル、326箇所
- **tailwind-merge使用**: `src/renderer/utils.ts` の `cn()` ユーティリティ

---

## v4の主要な変更点

### 1. アーキテクチャの変更

| v3 | v4 |
|----|-----|
| JavaScript設定 (`tailwind.config.js`) | CSS設定 (`@theme` ディレクティブ) |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| PostCSS経由 | Viteプラグイン推奨 |

### 2. デフォルト値の変更

| ユーティリティ | v3 | v4 |
|--------------|-----|-----|
| `border` | `gray-200` | `currentColor` |
| `ring-3` | `3px blue-500` | `1px currentColor` |
| `placeholder` | `gray-400` | `currentColor 50%` |

### 3. 関連パッケージ

| パッケージ | v3 | v4 |
|-----------|-----|-----|
| tailwind-merge | v2.x | v3.x必須 |
| PostCSS | `tailwindcss` | `@tailwindcss/postcss` |
| Vite | PostCSS経由 | `@tailwindcss/vite` 推奨 |

---

## アップグレード戦略

### Phase 1: 準備（事前作業）

#### 1.1 ブランチ作成

```bash
git checkout -b upgrade/tailwind-v4
```

#### 1.2 現在の動作確認

```bash
npm run build
npm run test
npm run dev  # 目視確認
```

### Phase 2: 自動アップグレードツールの実行

#### 2.1 公式アップグレードツール

```bash
npx @tailwindcss/upgrade
```

このツールは以下を自動で行う：
- 依存関係の更新
- `tailwind.config.js` → CSS `@theme` への変換
- `@tailwind` → `@import "tailwindcss"` への変換
- テンプレートファイルの更新

#### 2.2 Viteプラグインへの移行

**vite.config.ts の更新:**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
});
```

#### 2.3 PostCSS設定の簡素化

**postcss.config.js の更新（Viteプラグイン使用時は削除可能）:**

```javascript
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

### Phase 3: 手動対応が必要な項目

#### 3.1 tailwind-mergeのアップグレード

**package.json:**
```json
{
  "dependencies": {
    "tailwind-merge": "^3.4.0"
  }
}
```

#### 3.2 CSS設定の移行

**src/renderer/index.css の変更例:**

```css
/* Before (v3) */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* After (v4) */
@import "tailwindcss";

@theme {
  /* tailwind.config.js のカスタム設定を移行 */
  --color-primary-500: #4A90E2;
  --color-accent-blue: #0066FF;
  --color-accent-orange: #FF6B35;
  --color-surface: #F8F9FA;
  --color-border: #E5E7EB;
  --color-success: #10B981;
  --color-error: #EF4444;
  --color-warning: #F59E0B;
  
  --font-display: 'Raleway', sans-serif;
  --font-body: 'Inter', sans-serif;
  
  --radius-card: 16px;
  --radius-button: 8px;
}
```

#### 3.3 デフォルト値変更への対応

v3の挙動を維持する場合、以下のベーススタイルを追加：

```css
@layer base {
  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: var(--color-gray-200, currentColor);
  }
}
```

### Phase 4: 検証

#### 4.1 ビルド確認

```bash
npm run type-check
npm run build
npm run lint
```

#### 4.2 テスト実行

```bash
npm test
```

#### 4.3 目視確認

```bash
npm run dev
```

確認ポイント：
- [ ] ボーダーの色が正しいか
- [ ] リングのスタイルが正しいか
- [ ] プレースホルダーの色が正しいか
- [ ] カスタムカラーが適用されているか
- [ ] フォントが正しく読み込まれているか

---

## 影響を受けるファイル一覧

### 設定ファイル

| ファイル | 変更内容 |
|---------|---------|
| `package.json` | 依存関係の更新 |
| `tailwind.config.js` | 削除（CSSに移行） |
| `postcss.config.js` | 更新または削除 |
| `vite.config.ts` | Tailwindプラグイン追加 |

### ソースファイル

| ファイル | 変更内容 |
|---------|---------|
| `src/renderer/index.css` | `@import` と `@theme` に変更 |
| `src/renderer/utils.ts` | tailwind-merge v3対応（変更不要の可能性） |

### 確認が必要なコンポーネント

`border`、`ring-3`、`placeholder` を使用している箇所：

```bash
grep -r "border\|ring\|placeholder" --include="*.tsx" src/renderer/
```

---

## リスクと対策

### リスク1: デフォルト値変更による見た目の変化

**対策**: 
- アップグレードツール実行後、全画面を目視確認
- 必要に応じてベーススタイルでv3互換を維持

### リスク2: tailwind-merge v3との互換性

**対策**: 
- tailwind-mergeを同時にv3へアップグレード
- `cn()` ユーティリティの動作確認

### リスク3: カスタム設定の移行漏れ

**対策**: 
- `tailwind.config.js` の全設定をCSS `@theme` へ移行
- 各カスタムカラー・フォントの動作確認

---

## ロールバック手順

問題が発生した場合：

```bash
git checkout main -- package.json package-lock.json
git checkout main -- tailwind.config.js postcss.config.js
git checkout main -- src/renderer/index.css
npm install
```

---

## 参考リンク

- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [tailwind-merge v3 Releases](https://github.com/dcastil/tailwind-merge/releases)
- [@tailwindcss/vite](https://www.npmjs.com/package/@tailwindcss/vite)
