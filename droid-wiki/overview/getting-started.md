# はじめ方

## 前提条件

- **Node.js** 20以上
- **npm**（Node.jsに同梱）
- **macOS**（主要プラットフォーム。Linux/Windows対応を予定）
- **Just** — タスクランナー（macOSでは `brew install just`）

## インストールと実行

```bash
git clone https://github.com/akkytech0617/AgiRity.git
cd AgiRity
npm install
npm run dev
```

開発サーバーはViteを起動し、レンダラーのホットリロードとメインプロセスの変更時再コンパイルを行います。

## ビルド

```bash
just build          # クリーン + 本番ビルド + electron-builderパッケージング
just build-ci       # TypeScript コンパイル + Viteビルド（パッケージングなし、CI用）
```

## テスト

```bash
just test           # ユニットテスト（Vitest）
just coverage       # カバレッジ付きユニットテスト
just e2e            # E2Eテスト（Playwright、ビルドが必要）
```

## リント・フォーマット

```bash
just check          # 型チェック + フォーマットチェック + リント（一括）
just lint           # Biomeリントのみ
just format         # Biomeフォーマット（自動修正）
just fix            # Biomeリント（自動修正）
```

## 主要npmスクリプト

| スクリプト | 内容 |
|---|---|
| `npm run dev` | Vite開発サーバー＋Electron起動 |
| `npm run build` | `tsc` + `vite build` + `electron-builder` |
| `npm run test` | Vitest単発実行 |
| `npm run test:watch` | Vitestウォッチモード |
| `npm run test:coverage` | v8カバレッジ付きVitest |
| `npm run test:e2e` | ビルド + Playwright E2Eテスト |
| `npm run type-check` | TypeScript `--noEmit`（両tsconfig対象） |
| `npm run lint` | Biomeリント |
| `npm run package` | electron-builderパッケージング |

## Gitフック

Lefthookが `pre-commit`（リント、フォーマットチェック、型チェック）と `pre-push`（ユニットテスト）を実行します。クローン後に `npm run prepare` でフックをインストールしてください。

## CI

GitHub Actionsは `main`、`develop`、`feat/**`、`fix/**` へのプッシュおよび `main`/`develop` へのPRで実行されます。パイプライン：

1. **チェック** — 型チェック、フォーマット、リント
2. **ユニットテスト** — カバレッジアップロード付き
3. **SonarCloud** — コード品質スキャン
4. **ビルド** — macOSビルド（Linux/Windowsはフィーチャーフラグ背後）
5. **E2E** — Playwrightテスト（フィーチャーフラグ背後）

Snyk は手動・任意です。`just security`、`just security-code`、`just security-all` は利用できますが、GitHub Actions、`just ci`、Git hooks では実行しません。

詳細は `.github/workflows/ci.yml` を参照してください。
