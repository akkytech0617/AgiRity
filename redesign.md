# AgiRity UI Redesign Spec

**対象:** Droid (Factory.ai) へのハンドオフ用指示書  
**作成日:** 2026-04-30  
**ステータ:** 実装待ち

---

## 背景・目的

現在のブラウザ風ヘッダー＋タブ形式のUIを廃止し、
以下の原則に基づいて再設計する。

- メインパネルを最大化する（ワークスペース切り替えにサイドバーを使わない）
- UIの完成度＝プロダクトの信頼感として最優先で扱う
- HeroUI v2.8以上を採用し、コンポーネントの品質・一貫性を担保する

---

## Step 0: HeroUI 導入

### インストール

```bash
npm install @heroui/react framer-motion
```

### globals.css に追記

```css
@import "tailwindcss";
@plugin "./hero.ts";
@source "../../node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}";
```

### hero.ts を作成

```ts
import { heroui } from '@heroui/react';
export default heroui();
```

### main.tsx に HeroUIProvider を追加

```tsx
import { HeroUIProvider } from '@heroui/react';

<HeroUIProvider>
  <App />
</HeroUIProvider>;
```

### 注意事項

- AgiRityは現在 Tailwind v4 を使用。HeroUI v2.8以上を必ず指定すること
- framer-motion は HeroUI の必須依存

---

## Step 1: レイアウト構造の変更

### 廃止するもの

- ブラウザ風ヘッダー（タブ形式）
- 左サイドバー（常時表示のワークスペース一覧）

### 新しいレイアウト

```
┌─────────────────────────────────────────────┐
│ HEADER (44px固定)                           │
│ [logo] | [WorkspaceSwitcher▼] ... [Launch]   │
├─────────────────────────────────────────────┤
│ MAIN PANEL                                  │
│  ワークスペース名                           │
│  [Full Dev][Code Only][Review] ← Presets     │
│                                             │
│  1. 🐳 Rancher Desktop  30秒待機  ●          │
│  2. 💻 VS Code  ~/projects/...   ●          │
│  3. 🌐 Chrome  GitHub·Azure·...  ●          │
│  4. 💬 Slack  singleton          ○          │
└─────────────────────────────────────────────┘
```

---

## Step 2: コンポーネント実装仕様

### 2-1. Header

**ファイル:** `src/renderer/components/layout/AppHeader.tsx`

```tsx
// 構成要素（左から右）
// [ロゴマーク 22px] [Divider] [WorkspaceSwitcher] [spacer] [LaunchButton]

高さ: 44px (固定)
背景: HeroUI の Navbar コンポーネントを使用
```

**使用HeroUIコンポーネント:**

- `Navbar`, `NavbarBrand`, `NavbarContent` — 全体構造
- `Divider` — ロゴとスイッチャーの区切り
- `Button` — Launchボタン

---

### 2-2. WorkspaceSwitcher（ヘッダー内）

**ファイル:** `src/renderer/components/workspace/WorkspaceSwitcher.tsx`

```tsx
// ワークスペース名をクリック → ドロップダウンで一覧表示・切り替え
// 新規追加ボタンをドロップダウン最下部に配置

表示内容:
  - カラードット（ワークスペース識別色）
  - ワークスペース名
  - シェブロンアイコン（開閉状態で回転）

ドロップダウン各行:
  - カラードット + ワークスペース名 + アイテム数バッジ
  - アクティブ行はハイライト
  - 最下部: "+ New workspace"
```

**使用HeroUIコンポーネント:**

- `Dropdown`, `DropdownTrigger`, `DropdownMenu`, `DropdownItem`
- `Badge` — アイテム数表示
- `Chip` — カラードット代替案

---

### 2-3. LaunchButton

**ファイル:** `src/renderer/components/workspace/LaunchButton.tsx`

```tsx
// 現在のワークスペースの全アイテムを順番通りに起動
// 起動中はローディング状態を表示
// 起動完了後はチェックアイコンに変化（2秒後に戻る）
```

**使用HeroUIコンポーネント:**

- `Button` (color="primary", variant="solid")
- `Spinner` — 起動中の表示

---

### 2-4. MainPanel

**ファイル:** `src/renderer/components/layout/MainPanel.tsx`

```tsx
// ヘッダー直下のメインエリア
// 上部: ワークスペース名 + サブテキスト（アイテム数・最終起動）
// 中部: プリセットチップ一覧
// 下部: アイテムカード一覧（スクロール可）
```

---

### 2-5. PresetChips

**ファイル:** `src/renderer/components/workspace/PresetChips.tsx`

```tsx
// 利用可能なプリセットをChipで横並び表示
// 選択中のプリセットはvariant="solid"、非選択はvariant="bordered"
```

**使用HeroUIコンポーネント:**

- `Chip` (clickable, variant切り替え)

---

### 2-6. LaunchItemCard

**ファイル:** `src/renderer/components/workspace/LaunchItemCard.tsx`

```tsx
// 各起動アイテムを1カードで表示
// 左: 順序番号
// 中左: アイコン（アプリ種別に応じた絵文字またはアイコン）
// 中: アイテム名 + 詳細（パス・URL・待機時間）
// 右: ステータスドット（起動済み=緑 / 未起動=グレー）

カードはホバーでborderが強調される
ドラッグ&ドロップによる順序変更はPhase 2
```

**使用HeroUIコンポーネント:**

- `Card`, `CardBody` — カード全体
- `Chip` — singleton/待機時間などのバッジ

---

## Step 3: ダークモード設定

HeroUIのデフォルトテーマをdarkに設定する。

```tsx
<HeroUIProvider>
  <main className="dark text-foreground bg-background">
    <App />
  </main>
</HeroUIProvider>;
```

カラーパレットは既存の要件定義（`docs/product/01_requirment.md`）のDark Modeカラーを参照:

```
Background: #111827
Surface:    #1F2937
Border:     #374151
Primary:    #60A5FA
```

---

## Step 4: 既存コードの削除・移行

### 削除対象（確認してから削除）

- 既存のタブ形式ヘッダーコンポーネント
- 既存のサイドバーコンポーネント
- タブ切り替えに関連するstate・ロジック

### 移行対象（ロジックは維持・UIのみ置き換え）

- ワークスペースのCRUD操作
- 起動ロジック（ElectronのipcRenderer/mainとのやり取り）
- 設定ファイルの読み書き（YAML/JSON）

### 注意事項

- **ロジック層には触れない**。UIコンポーネントの置き換えのみ
- 既存のテストが通ることを確認しながら進める
- `npm run test` と `npm run type-check` を各ステップ後に実行

---

## Step 5: 完了確認チェックリスト

- [ ] HeroUI導入・ビルドエラーなし
- [ ] ダークモードが正しく適用されている
- [ ] WorkspaceSwitcherドロップダウンが動作する
- [ ] Launchボタンで既存の起動ロジックが動く
- [ ] PresetChipsが切り替わる
- [ ] LaunchItemCardが全アイテムを表示する
- [ ] `npm run test` が通る
- [ ] `npm run type-check` が通る

---

## 参考モックアップ

このSpecと合わせて、Claudeとの会話セッション内で作成した
インタラクティブモックアップを参照すること（コンパクトヘッダー型）。

レイアウトの詳細はモックアップのHTMLコードが最も正確。

---

## やらないこと（スコープ外）

- Svelteへの移行（別プロジェクトで学習する）
- カンバンボード（Phase 2）
- ドラッグ&ドロップによる順序変更（Phase 2）
- ライトモード対応（Phase 2）
