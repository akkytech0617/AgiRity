# AgiRity

[![CI](https://github.com/akkytech0617/AgiRity/actions/workflows/ci.yml/badge.svg)](https://github.com/akkytech0617/AgiRity/actions/workflows/ci.yml)
[![Release](https://github.com/akkytech0617/AgiRity/actions/workflows/release.yml/badge.svg)](https://github.com/akkytech0617/AgiRity/actions/workflows/release.yml)

> Start working in 3 seconds, not 3 minutes

[English](README.md)

## 概要

毎朝の「VS Code開いて、Slack開いて、ブラウザでGitHub開いて...」という"儀式"に疲れていませんか？

AgiRityは、プロジェクトや作業ごとにワークスペースを定義し、必要なアプリを一覧化、ワンクリック起動できるワークスペース管理ツールです。

## 機能

- **ワークスペース管理** - ワークスペースの作成・編集・削除
- **アプリ管理** - 利用するアプリをワークスペースごとに一元管理
- **アプリ一括起動** - 起動順序と遅延時間を指定して複数アプリを起動
- **複数URL同時オープン** - ブラウザで複数のURLを一度に開く
- **フォルダ指定起動** - VS Code等を特定のプロジェクトフォルダで起動

## クイックスタート

### インストール

> 現在は開発初期段階のため、リリースビルドはまだありません。

開発版を試すには:

```bash
git clone https://github.com/akkytech0617/AgiRity.git
cd AgiRity
npm install
npm run dev
```

### 基本的な使い方

1. 新しいワークスペースを作成
2. 起動したいアプリやURLを追加
3. 「Launch」をクリック

## 開発

### セットアップ

```bash
npm install
npm run dev
```

詳細な開発ガイドは [docs/development/](docs/development/) を参照してください。

## ロードマップ

| フェーズ | 状態 | 内容 |
|---------|------|------|
| **Phase 1 (MVP)** | 🚧 開発中 | ワークスペース管理、アプリ一括起動 |
| **Phase 2** | 📋 計画中 | ツールレジストリ、設定エクスポート/インポート |
| **Phase 3** | 💭 構想中 | CLI、MCP統合、クラウド同期 |

詳細は [要件定義書](docs/product/01_requirment.md) を参照してください。

## ドキュメント

- [要件定義書](docs/product/01_requirment.md)
- [アーキテクチャ](docs/design/architecture.md)
- [テスト戦略](docs/implementation/testing_strategy.md)
- [開発ガイド](docs/development/)

## コントリビューション

TBD

## ライセンス

MIT
