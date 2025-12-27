# ADR-005: ライブラリバージョンアップグレード方針

## Status

Accepted

## Date

2025-12-26

## Context

プロジェクトの依存ライブラリにはバージョンが比較的新しいものと古いものが混在していた。実装初期段階のうちに依存関係を最新化し、技術的負債を解消することを目的として、全ライブラリのバージョンアップを検討した。

調査の結果、一部のライブラリについては最新バージョンへのアップグレードが適切でないと判断した。本ADRではその判断理由を記録する。

## Decision

### 1. @types/node - 現状維持（22.x）

| 項目 | 内容 |
|------|------|
| 現在バージョン | 22.19.3 |
| 最新バージョン | 25.0.3 |
| 決定 | **アップグレードしない** |

**理由:**

Electron 39はNode.js 22.20.0をバンドルしている。`@types/node`はNode.jsの型定義であり、実際に使用しているNode.jsバージョンと一致させる必要がある。

- Electron 39 = Chromium 142 + Node.js 22.20.0 + V8 14.2
- `@types/node` 25.xはNode.js 25の型定義
- Node.js 25固有のAPIを誤って使用するリスクを回避

**参考:**
- [Electron Releases](https://www.electronjs.org/docs/latest/tutorial/electron-timelines)
- [Moving our Ecosystem to Node 22 | Electron](https://www.electronjs.org/blog/ecosystem-node-22)

---

### 2. electron-builder - 25.1.8へアップグレード済み

| 項目 | 内容 |
|------|------|
| 変更前バージョン | 24.13.3 |
| 変更後バージョン | 25.1.8 |
| 最新バージョン | 26.4.0 |
| 決定 | **25.1.8へアップグレード**（最新版は見送り） |

**理由:**

electron-builder 26.xには多くのビルド問題が報告されている：

- v26.0.4以降でWindows/macOSのビルドが破損する問題
- node-module-collectorの変更による依存関係解決エラー
- パッケージマネージャ（npm/yarn/pnpm）との互換性問題
- Volta/Protoなどのバージョンマネージャとの非互換

v25.1.8はv24系からの安定したアップグレードパスであり、これらの問題を回避できる。

**参考:**
- [builds broken since v26.0.4 · Issue #8842](https://github.com/electron-userland/electron-builder/issues/8842)
- [v26.0.12 breaks build in multiple ways · Issue #9020](https://github.com/electron-userland/electron-builder/issues/9020)

---

### 3. eslint-plugin-react-hooks - 5.2.0を維持

| 項目 | 内容 |
|------|------|
| 現在バージョン | 5.2.0 |
| 最新バージョン | 7.0.1 |
| 決定 | **アップグレードしない** |

**理由:**

- React 19と同時にリリースされた5.xが安定版
- 7.xは新しいリリースだが、eslint-plugin-react-hooksの安定バージョンは5.x系
- React公式ドキュメントでも5.x系が推奨されている

---

### 4. tailwindcss - v4.xへアップグレード予定

| 項目 | 内容 |
|------|------|
| 現在バージョン | 3.4.19 |
| 移行先バージョン | 4.x |
| 決定 | **アップグレード予定** |

**変更点:**

Tailwind CSS v4.0はアーキテクチャの根本的な変更を伴う：

1. **設定ファイルの廃止**: `tailwind.config.js`（JavaScript）から`@theme`ディレクティブ（CSS）への移行
2. **インポート構文の変更**: `@tailwind base/components/utilities` → `@import 'tailwindcss'`
3. **Viteプラグインの導入**: `@tailwindcss/vite` による高速化
4. **デフォルト値の変更**: border、ring、placeholderなどの挙動変更

**移行戦略:**
- 詳細は `docs/implementation/tailwind-v4-upgrade-strategy.md` を参照

**参考:**
- [Tailwind CSS Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)

---

### 5. tailwind-merge - v3.xへアップグレード予定

| 項目 | 内容 |
|------|------|
| 現在バージョン | 2.6.0 |
| 移行先バージョン | 3.x |
| 決定 | **アップグレード予定（Tailwind v4と同時）** |

**変更点:**

tailwind-merge v3.0はTailwind CSS v4専用：

- Tailwind CSS v3のサポートが削除
- Tailwind CSS v4と同時にアップグレードが必要

**移行戦略:**
- Tailwind CSS v4アップグレード時に同時対応
- 詳細は `docs/implementation/tailwind-v4-upgrade-strategy.md` を参照

**参考:**
- [tailwind-merge Releases](https://github.com/dcastil/tailwind-merge/releases)

---

### 6. zod - v4.xへアップグレード予定

| 項目 | 内容 |
|------|------|
| 現在バージョン | 3.25.76 |
| 移行先バージョン | 4.x |
| 決定 | **アップグレード予定** |

**変更点:**

Zod v4には以下のBreaking Changesがある：

1. **String Format APIの変更**: `z.string().email()` → `z.email()`、`z.string().uuid()` → `z.uuid()`
2. **UUID検証の厳格化**: RFC 9562/4122準拠が必須に
3. **エラーマップの優先順位変更**: スキーマレベルのエラーが優先されるように

本プロジェクトでは`.uuid()`、`.url()`、`.datetime()`を使用しており、コード変更が必要。

**移行戦略:**
- 詳細は `docs/implementation/zod-v4-upgrade-strategy.md` を参照

**参考:**
- [Zod v4 Migration Guide](https://zod.dev/v4/changelog)

---

### 7. electron-updater - 6.7.3を維持

| 項目 | 内容 |
|------|------|
| 現在バージョン | 6.7.3 |
| npmの"Latest"表示 | 6.6.2 |
| 決定 | **現状維持** |

**理由:**

npmの"Latest"タグが6.6.2を指しているが、実際には6.7.3の方が新しいバージョンである。現在のバージョンが最新であるため、変更不要。

---

## Consequences

### Positive

- **安定性の確保**: 既知の問題があるバージョン（electron-builder v26等）を回避
- **互換性の維持**: Electron/Node.jsとの整合性を保持
- **計画的な移行**: Tailwind v4、Zod v4への移行戦略を文書化

### Negative

- **移行作業が必要**: Tailwind v4、Zod v4への移行にはコード変更が伴う

### Neutral

- **定期的な再評価が必要**: 各ライブラリの安定性を継続的に監視

## 今後の対応

| ライブラリ | 対応方針 | 参照ドキュメント |
|-----------|---------|-----------------|
| tailwindcss | v4.xへアップグレード | `docs/implementation/tailwind-v4-upgrade-strategy.md` |
| tailwind-merge | tailwindcss v4と同時にv3.xへ | `docs/implementation/tailwind-v4-upgrade-strategy.md` |
| zod | v4.xへアップグレード | `docs/implementation/zod-v4-upgrade-strategy.md` |
| electron-builder | v26系の安定化を待つ | Issue #8842の解決後に再評価 |
