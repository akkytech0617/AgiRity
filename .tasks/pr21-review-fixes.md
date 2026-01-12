# PR #21 レビュー指摘対応プラン

**対応対象**: SonarCloud 8件 + CodeRabbit 18件 = **合計26件**

**開始日**: 2026-01-12  
**目標工数**: 約2.5時間

---

## タスク分解

### ✅ タスク 1: SonarCloud CRITICAL - void演算子削除

**工数**: 10分  
**ファイル**: `src/renderer/hooks/useWorkspaces.ts` (line 78)

#### 指摘内容
```
Rule: typescript:S3735
Severity: CRITICAL
Message: Remove this use of the "void" operator.
```

#### 対応内容
- line 78の `void` 演算子を削除
- 具体的な行を確認してリファクタリング

---

### ✅ タスク 2: アクセシビリティ対応（SonarCloud + CodeRabbit）

**工数**: 30分  
**対象件数**: 5件（SonarCloud 3 + CodeRabbit 2）

#### 2-1. PresetCard.tsx (lines 16-19)
- SonarCloud: S6848 (interactive element), S1082 (keyboard listener)
- CodeRabbit: keyboard accessibility 追加

対応:
```tsx
// 変更前
<div onClick={onLaunch} className="...">

// 変更後
<div 
  onClick={onLaunch} 
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onLaunch();
    }
  }}
  className="..."
>
```

#### 2-2. ToolCard.tsx (lines 30-33)
- SonarCloud: S6848, S1082
- CodeRabbit: keyboard accessibility 追加

対応: PresetCard と同様に role="button", tabIndex={0}, onKeyDown を追加

#### 2-3. WorkspaceList.tsx (lines 36-40)
- SonarCloud: S6819 (use `<output>` instead of "status" role)
- CodeRabbit: role 修正

対応:
```tsx
// 変更前
<div role="status">

// 変更後
<output>
```

---

### ✅ タスク 3: biome.json 修正

**工数**: 20分  
**対象件数**: 3件

#### 3-1. Formatter glob パターン修正 (lines 18-30)
- CodeRabbit: `!**/node_modules` → `!**/node_modules/**` など6パターン

対応パターン:
```json
// 変更前
"!**/node_modules",
"!**/dist",
"!**/dist-electron",
"!**/coverage",
"!**/.idea",
"!**/.vscode",

// 変更後
"!**/node_modules/**",
"!**/dist/**",
"!**/dist-electron/**",
"!**/coverage/**",
"!**/.idea/**",
"!**/.vscode/**",
```

#### 3-2. 重複 override ブロック削除 (lines 127-159 と 192-224)
- CodeRabbit: TS/TSX override が2回繰り返されている

対応:
- lines 192-224 の重複ブロック全体を削除

#### 3-3. 未使用 on* グローバル削除 (lines 244-382)
- CodeRabbit: 180+個の on* イベントハンドラが未使用

対応:
- TS/TSX override 内の `globals` 配列から on* で始まる要素をすべて削除
- 保持する: `exports`, `location` のみ確認して判断

---

### ✅ タスク 4: App.tsx 修正

**工数**: 20分  
**対象件数**: 2件

#### 4-1. エラー状態追加 (lines 29-39)
- CodeRabbit: catch で error を setError にも渡す

対応:
```tsx
// 追加
const [error, setError] = useState<string | null>(null);

// 修正
useEffect(() => {
  workspaceDataSource
    .load()
    .then((data) => {
      setWorkspaces(data);
      setError(null);
    })
    .catch((error: unknown) => {
      log.error('Failed to load workspaces:', error);
      setError(error instanceof Error ? error.message : 'Failed to load workspaces');
    })
    .finally(() => {
      setLoading(false);
    });
}, []);

// WorkspaceList に error を pass
<WorkspaceList
  workspaces={workspaces}
  error={error}
  ...
/>
```

#### 4-2. ハードコード id '1' → 'home' (lines 73-75, 111)
- CodeRabbit: hardcoded workspace id '1' は fragile

対応:
```tsx
// 変更前
const handleCreateWorkspace = () => {
  setActiveView({ type: 'workspace', id: '1' });
};

// 変更後
const handleCreateWorkspace = () => {
  setActiveView({ type: 'home' });
};

// cancel handler も同様
```

---

### ✅ タスク 5: UI/スタイル修正

**工数**: 30分  
**対象件数**: 8件

#### 5-1. Header.tsx (lines 103-105)
- CodeRabbit: Plus icon w-2 h-2 → w-3 h-3

対応:
```tsx
// 変更前
<Plus className="w-2 h-2" />

// 変更後
<Plus className="w-3 h-3" />
```

#### 5-2. WorkspaceDetail.tsx (lines 50-52)
- CodeRabbit: Edit2 icon w-2 h-2 → w-4 h-4

対応:
```tsx
// 変更前
<Edit2 className="w-2 h-2" />

// 変更後
<Edit2 className="w-4 h-4" />
```

#### 5-3. WorkspaceDetail.tsx (lines 92-96)
- CodeRabbit: React key item.name → item.id

対応:
```tsx
// 変更前
{workspace.items.map((item) => (
  <ToolCard key={item.name} ... />
))}

// 変更後
{workspace.items.map((item) => (
  <ToolCard key={item.id || item.name} ... />
))}
```

#### 5-4. WorkspaceList.tsx (lines 143-155)
- CodeRabbit: React key に index 追加

対応:
```tsx
// 変更前
{workspace.items.map((item) => (
  <div key={`${item.type}-${item.name}`} ... />
))}

// 変更後
{workspace.items.map((item, index) => (
  <div key={`${item.type}-${item.name}-${index}`} ... />
))}
```

#### 5-5. ToolCard.tsx (line 32)
- CodeRabbit: Tailwind utility rounded-card, border-border 未定義

対応: `src/renderer/index.css` に追加
```css
@utility rounded-card {
  border-radius: var(--radius-card);
}

@utility border-border {
  border-color: var(--color-border);
}
```

#### 5-6. WorkspaceSettings.tsx (lines 3-8)
- CodeRabbit: focus:ring-2 → focus-visible:ring-2

対応:
```tsx
// 変更前
className="... focus:ring-2 focus:ring-blue-500 ..."

// 変更後
className="... focus-visible:ring-2 focus-visible:ring-blue-500 ..."
```

※ `focus:ring-blue-500` や `focus:border-blue-500` も `focus-visible:` に

#### 5-7. index.css (lines 3-44)
- CodeRabbit: var(--color-gray-200) が未定義 → var(--color-border) に

対応:
```css
// 変更前
border-color: var(--color-gray-200, currentcolor);

// 変更後
border-color: var(--color-border);
```

#### 5-8. api/index.ts (line 18)
- SonarCloud: S7764 Prefer globalThis over window

対応:
```tsx
// 変更前
const launcherApi = (window as any).launcherApi;

// 変更後
const launcherApi = (globalThis as any).launcherApi;
```

（他の `window.` アクセスもすべて `globalThis.` に）

---

### ✅ タスク 6: その他（typo, docs, 最適化）

**工数**: 30分  
**対象件数**: 7件

#### 6-1. AGENTS.md (line 135)
- CodeRabbit: typo `memoory-manager` → `memory-manager`

対応: 該当行を修正

#### 6-2. package.json (line 17)
- CodeRabbit: Windows 対応 cross-env 追加

対応:
```json
// 変更前
"prebuild:e2e": "VITE_USE_MOCK_DATA=false tsc && vite build",

// 変更後
1. devDependencies に "cross-env": "^7.0.3" を追加
2. "prebuild:e2e": "cross-env VITE_USE_MOCK_DATA=false tsc && vite build",
```

#### 6-3. codebase_guide.md (lines 14-55)
- CodeRabbit: MD040 - コードブロック言語指定追加

対応:
```markdown
// 変更前
```
src/
...

// 変更後
```text
src/
...
```

3つのコードブロックすべてに言語指定を追加

#### 6-4. code_quality_rules.md
- CodeRabbit: ESLint/Prettier 記載を Biome に更新

対応: Biome を canonical tool として宣言

#### 6-5. WorkspaceList.tsx (line 118)
- SonarCloud: S7735 Unexpected negated condition

対応:
```tsx
// 変更前
if (!workspaces.length) { ... }

// 変更後
if (workspaces.length === 0) { ... }
```
（条件をポジティブに）

#### 6-6. AddItemModal.tsx (lines 278-282)
- CodeRabbit: バリデーション重複削除

対応:
```tsx
// 変更前
disabled={
  !name.trim() ||
  (itemType !== 'browser' && !path.trim()) ||
  (itemType === 'browser' && !urls.trim())
}

// 変更後
disabled={!isValidSubmission()}
```

#### 6-7. ToolCard/WorkspaceList/ItemEditor.tsx
- CodeRabbit: getItemIcon 共通ユーティリティ抽出（オプション）

対応（優先度低）:
- 同じロジックが3ファイルで重複
- `src/renderer/utils/icons.tsx` に共通関数を抽出（推奨）
- または各ファイルの copy を許容

---

## 実装手順

### 推奨順序（依存性を考慮）

1. **Task 1** - CRITICAL 対応（最優先）
2. **Task 3** - biome.json（重要な基盤）
3. **Task 4** - App.tsx（ビジネスロジック修正）
4. **Task 2** - アクセシビリティ（複数ファイル）
5. **Task 5** - UI/スタイル（前提が完了後）
6. **Task 6** - その他（最後）

### 各タスク実行後の確認

```bash
# lint/format チェック
just lint
just format
just type-check

# テスト実行
just test
```

---

## チェックリスト

- [x] Task 1: SonarCloud CRITICAL (void削除)
- [x] Task 2: アクセシビリティ (PresetCard/ToolCard/WorkspaceList)
- [x] Task 3: biome.json (glob/override/globals)
- [x] Task 4: App.tsx (error状態/hardcoded id)
- [x] Task 5: UI/スタイル (icon/key/utility/css変数)
- [x] Task 6: その他 (typo/docs/最適化)
- [x] 全テスト実行
- [x] Git commit (d3ca14d)

---

**作成日**: 2026-01-12  
**ステータス**: 準備完了
