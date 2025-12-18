# AI コードレビューチェックリスト

AIエージェントが生成したコードに対するレビュー基準。

## 1. セキュリティ (Critical)

- [ ] **File Permission**: ファイル書き込み時に `mode: 0o600` (User Read/Write only) を指定しているか？
- [ ] **Path Injection**: ユーザー入力パスに対して `path.normalize()` とディレクトリトラバーサルチェックを行っているか？
- [ ] **Command Injection**: `exec` ではなく `spawn` を使い、引数を配列で渡しているか？
- [ ] **IPC Safety**: `contextIsolation: true`, `nodeIntegration: false` が維持されているか？
- [ ] **Secrets**: ログ出力やコード内に機密情報（APIキー、パスワード）が含まれていないか？

## 2. パフォーマンス

- [ ] **Async I/O**: `fs.readFileSync` などの同期APIを避け、`fs.promises` を使用しているか？
- [ ] **Event Cleanup**: `useEffect` や `ipcMain.on` でリスナーの削除 (removeListener) が実装されているか？
- [ ] **React Render**: 不要な再レンダリングを防ぐため `useCallback`, `useMemo` が適切に使われているか？

## 3. エラーハンドリング

- [ ] **User Feedback**: エラー時にログ出力だけでなく、ユーザーへの通知（Dialog/Toast）があるか？
- [ ] **No Silent Fail**: `catch` ブロックでエラーを握りつぶしていないか？
- [ ] **Retry Logic**: ネットワークや外部プロセス起動失敗時にリトライロジックがあるか？

## 4. コード品質

- [ ] **Type Safety**: `any` 型を避け、適切なインターフェース定義を行っているか？
- [ ] **Naming**: 変数・関数名は具体的で意味のあるものか？ (e.g., `x` -> `filePath`)
- [ ] **Constants**: マジックナンバーやハードコードされた文字列を定数化しているか？

## 5. Electron/React 特有

- [ ] **IPC Types**: IPCチャンネル名と引数が型定義されているか？
- [ ] **State**: Propsのバケツリレーを避け、Contextや適切なState管理を行っているか？
- [ ] **Deprecations**: `remote` モジュールなど、廃止されたAPIを使用していないか？

## 6. 判定基準

| 判定                | 条件                                                        |
| ------------------- | ----------------------------------------------------------- |
| **Approve**         | Criticalな指摘なし、カバレッジ70%以上、CIパス               |
| **Request Changes** | セキュリティ懸念あり、同期I/Oの使用、エラーハンドリング不足 |
