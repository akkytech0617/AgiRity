# ADR-004: MainプロセスにおけるPromiseチェーンによる初期化 (ESM環境)

## Status

Accepted

## Date

2025-12-19

## Context

AgiRityプロジェクトはESM（ECMAScript Modules）へと移行済みであり、`tsconfig.json` では `target: "ES2022"`, `module: "ESNext"` が指定されている。
この環境下では、静的解析ツール（SonarCloud等）が `async IIFE` や Promiseチェーンよりもトップレベル `await` を使用することを推奨する。

しかし、Electronのメインプロセスにおいて `app.whenReady()` をトップレベル `await` で待機させると、以下の問題が発生することが判明した：

1.  モジュールの初期化プロセスがブロックされ、Electronの内部イベントループが正常に開始されない。
2.  その結果、`app.whenReady()` が解決されず、アプリケーションが起動プロセス中にハング（フリーズ）する。

## Decision

メインプロセスの初期化（`src/main/index.ts`）において、**トップレベル `await` を避け、Promiseチェーン (`app.whenReady().then()`) を使用する**。

静的解析ツールの指摘については、意図的な設計判断であることを示すために `// nosonar` コメントを付与して抑制する。

## Rationale

- **起動の安定性**: Electronのライフサイクル管理において、イベントループをブロックせずに初期化を完了させる必要がある。
- **信頼性**: `createWindow` はElectronが完全に準備できた後に呼び出される必要があり、Promiseチェーンはこの順序を確実に保証する。
- **保守性**: `// nosonar` コメントを付与することで、将来の修正時に誤って破壊的な変更（トップレベルawaitへの再移行）が行われるのを防ぐ。

## Consequences

### Positive

- ESM環境下でもElectronアプリが確実に起動する。
- 静的解析ツールのエラーを解消しつつ、設計意図をコード内に明記できる。

### Negative

- ESMの一般的なベストプラクティス（トップレベルawait推奨）とは異なる例外的な書き方となる。

## References

- [Electron Documentation: app.whenReady()](https://www.electronjs.org/docs/latest/api/app#appwhenready)
- SonarCloud Rule: typescript:S7785 (Prefer top-level await over using a promise chain)
