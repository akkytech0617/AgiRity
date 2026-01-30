# Zod v4 アップグレード戦略

## 概要

Zod v3.25.76 から v4.x へのアップグレード戦略を定義する。

## 現状分析

### 現在の構成

| 項目 | 現在の状態 |
|------|-----------|
| Zod | v3.25.76 |
| 使用ファイル数 | 3ファイル |

### 使用箇所

| ファイル | 用途 |
|---------|------|
| `src/shared/types.ts` | スキーマ定義・型生成 |
| `src/main/services/ProjectService.ts` | YAMLファイルのバリデーション |
| `src/main/ipc/index.ts` | IPC入力のバリデーション |

### 使用しているZod API

```typescript
// src/shared/types.ts
z.object()
z.enum()
z.string()
z.string().min()
z.string().optional()
z.string().url()        // ← v4で非推奨
z.string().uuid()       // ← v4で非推奨
z.string().datetime()   // ← v4で非推奨
z.array()
z.number()
z.number().min()
z.boolean()
z.any()
z.infer<>

// src/main/ipc/index.ts
z.string().uuid()       // ← v4で非推奨
z.ZodError

// src/main/services/ProjectService.ts
z.object()
z.enum()
z.string()
z.string().uuid()       // ← v4で非推奨
z.array()
z.number()
z.ZodError
```

---

## v4の主要な変更点

### 1. String Format APIの変更（必須対応）

| v3 (非推奨) | v4 (推奨) |
|-------------|-----------|
| `z.string().email()` | `z.email()` |
| `z.string().uuid()` | `z.uuid()` |
| `z.string().url()` | `z.url()` |
| `z.string().datetime()` | `z.iso.datetime()` |

**注意**: v3形式も動作するが非推奨となる。

### 2. UUID検証の厳格化

- v4では RFC 9562/4122 準拠が必須
- バージョンビット・バリアントビットの検証が厳格化
- 任意の8-4-4-4-12形式には `z.guid()` を使用

### 3. その他の変更

| 変更点 | 詳細 |
|--------|------|
| `z.coerce` 入力型 | `string` → `unknown` |
| エラーマップ優先順位 | スキーマレベルが優先 |
| `._def` プロパティ | `._zod.def` に移動 |
| `z.number().int()` | 安全な整数のみ許可 |

---

## アップグレード戦略

### Phase 1: 準備（事前作業）

#### 1.1 ブランチ作成

```bash
git checkout -b upgrade/zod-v4
```

#### 1.2 現在の動作確認

```bash
npm run type-check
npm run test
npm run build
```

### Phase 2: 依存関係の更新

#### 2.1 package.json の更新

```json
{
  "dependencies": {
    "zod": "^4.2.1"
  }
}
```

#### 2.2 インストール

```bash
npm install
```

### Phase 3: コード修正

#### 3.1 src/shared/types.ts の修正

**変更前:**
```typescript
import { z } from 'zod';

export const WorkspaceItemSchema = z.object({
  type: z.enum(['app', 'browser', 'folder']),
  name: z.string().min(1),
  category: z.string().optional(),
  path: z.string().optional(),
  urls: z.array(z.string().url()).optional(),  // ← 変更対象
  folder: z.string().optional(),
  waitTime: z.number().min(0).optional(),
  dependsOn: z.string().optional(),
});

export const WorkspaceSchema = z.object({
  id: z.string().uuid(),  // ← 変更対象
  name: z.string().min(1),
  description: z.string().optional(),
  items: z.array(WorkspaceItemSchema),
  presets: z.array(WorkspacePresetSchema).optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.string().datetime(),  // ← 変更対象
  updatedAt: z.string().datetime(),  // ← 変更対象
});
```

**変更後:**
```typescript
import { z } from 'zod';

export const WorkspaceItemSchema = z.object({
  type: z.enum(['app', 'browser', 'folder']),
  name: z.string().min(1),
  category: z.string().optional(),
  path: z.string().optional(),
  urls: z.array(z.url()).optional(),  // ← z.url() に変更
  folder: z.string().optional(),
  waitTime: z.number().min(0).optional(),
  dependsOn: z.string().optional(),
});

export const WorkspaceSchema = z.object({
  id: z.uuid(),  // ← z.uuid() に変更
  name: z.string().min(1),
  description: z.string().optional(),
  items: z.array(WorkspaceItemSchema),
  presets: z.array(WorkspacePresetSchema).optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.iso.datetime(),  // ← z.iso.datetime() に変更
  updatedAt: z.iso.datetime(),  // ← z.iso.datetime() に変更
});
```

#### 3.2 src/main/ipc/index.ts の修正

**変更前:**
```typescript
const validatedId = z.string().uuid().parse(id);
```

**変更後:**
```typescript
const validatedId = z.uuid().parse(id);
```

#### 3.3 src/main/services/ProjectService.ts の修正

**変更前:**
```typescript
const WorkspaceSchema = z.object({
  id: z.string().uuid(),
  // ...
});
```

**変更後:**
```typescript
const WorkspaceSchema = z.object({
  id: z.uuid(),
  // ...
});
```

### Phase 4: 検証

#### 4.1 型チェック

```bash
npm run type-check
```

#### 4.2 テスト実行

```bash
npm test
```

特に以下のテストファイルを重点確認：
- `tests/unit/shared/types.test.ts`
- `tests/unit/main/services/ProjectService.test.ts`

#### 4.3 ビルド確認

```bash
npm run build
```

#### 4.4 動作確認

```bash
npm run dev
```

確認ポイント：
- [ ] ワークスペースの読み込みが正常か
- [ ] ワークスペースの保存が正常か
- [ ] バリデーションエラーが適切に表示されるか

---

## 影響を受けるファイル一覧

### ソースファイル

| ファイル | 変更内容 |
|---------|---------|
| `src/shared/types.ts` | Format API の更新 |
| `src/main/ipc/index.ts` | Format API の更新 |
| `src/main/services/ProjectService.ts` | Format API の更新 |

### テストファイル

| ファイル | 確認内容 |
|---------|---------|
| `tests/unit/shared/types.test.ts` | スキーマテストの動作確認 |
| `tests/unit/main/services/ProjectService.test.ts` | バリデーションテストの動作確認 |

---

## 変更箇所の詳細マッピング

### z.string().uuid() → z.uuid()

| ファイル | 行 | 変更前 | 変更後 |
|---------|-----|--------|--------|
| `src/shared/types.ts` | 約18行 | `z.string().uuid()` | `z.uuid()` |
| `src/main/services/ProjectService.ts` | 約28行 | `z.string().uuid()` | `z.uuid()` |
| `src/main/ipc/index.ts` | 約51行 | `z.string().uuid().parse()` | `z.uuid().parse()` |
| `src/main/ipc/index.ts` | 約73行 | `z.string().uuid().parse()` | `z.uuid().parse()` |

### z.string().url() → z.url()

| ファイル | 行 | 変更前 | 変更後 |
|---------|-----|--------|--------|
| `src/shared/types.ts` | 約10行 | `z.array(z.string().url())` | `z.array(z.url())` |

### z.string().datetime() → z.iso.datetime()

| ファイル | 行 | 変更前 | 変更後 |
|---------|-----|--------|--------|
| `src/shared/types.ts` | 約25行 | `z.string().datetime()` | `z.iso.datetime()` |
| `src/shared/types.ts` | 約26行 | `z.string().datetime()` | `z.iso.datetime()` |

---

## UUID検証の厳格化への対応

### 確認事項

v4では UUID が RFC 9562/4122 に厳密に準拠する必要がある：

```typescript
// 有効な UUID（v4の例）
"550e8400-e29b-41d4-a716-446655440000"  // ✅ バージョン4、バリアント1

// 無効になる可能性のある形式
"00000000-0000-0000-0000-000000000000"  // ⚠️ バージョンビットが0
```

### 対応方針

1. **既存データの確認**: 保存済みワークスペースのIDが有効か確認
2. **UUID生成の確認**: `crypto.randomUUID()` を使用していれば問題なし
3. **必要に応じて移行**: 不正なUUIDがある場合はマイグレーションが必要

現在のコードでは `crypto.randomUUID()` で生成しているため、問題なし。

---

## リスクと対策

### リスク1: UUID検証の厳格化

**対策**: 
- 既存のワークスペースファイルでテスト
- 必要に応じて `z.guid()` を使用（緩い検証）

### リスク2: エラーマップ優先順位の変更

**対策**: 
- 現在カスタムエラーマップを使用していないため影響なし
- 今後追加する場合はv4の仕様に準拠

### リスク3: 型推論の変更

**対策**: 
- `z.infer<>` の結果が変わる可能性を確認
- TypeScript型チェックで検出可能

---

## ロールバック手順

問題が発生した場合：

```bash
git checkout main -- package.json package-lock.json
git checkout main -- src/shared/types.ts
git checkout main -- src/main/ipc/index.ts
git checkout main -- src/main/services/ProjectService.ts
npm install
```

---

## 参考リンク

- [Zod v4 Migration Guide](https://zod.dev/v4/changelog)
- [Zod v4 Release Notes](https://zod.dev/v4)
- [RFC 9562 - UUID](https://www.rfc-editor.org/rfc/rfc9562.html)
