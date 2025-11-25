# AgiRity テスト戦略

## 1. 戦略概要

### テストピラミッド（トロフィー型）
- **Static Analysis**: 重視（型チェック, Lint）
- **Unit Tests**: 中程度（ビジネスロジック）
- **Integration Tests**: 重視（IPC通信, 重要なフロー）
- **E2E Tests**: 最小限（Critical Pathのみ）

### カバレッジ目標
- **全体**: 70%以上
- **ビジネスロジック**: 80%以上
- **IPC通信**: 90%以上

---

## 2. テストレベル定義

### Static Analysis
- **ツール**: TypeScript, ESLint, Prettier
- **タイミング**: コミット前 (Husky), CI
- **ルール**: `no-unused-vars`, `react-hooks/exhaustive-deps` 必須

### Unit Tests
- **対象**: `src/main/services/`, `src/renderer/hooks/`, Utils
- **ツール**: Vitest
- **命名規則**: `*.test.ts` / `*.test.tsx`
- **要件**:
  - 外部依存（File System, IPC）はモック化
  - Arrange-Act-Assert パターン遵守
  - `describe`, `it`, `expect` 使用

### Integration Tests
- **対象**: IPC通信 (`ipcMain` handler), ConfigService (File I/O)
- **ツール**: Vitest
- **要件**:
  - 実際の Electron API はモック化するが、ハンドラー登録ロジックはテスト
  - ファイル操作は一時ディレクトリを使用 (`os.tmpdir()`)

### E2E Tests
- **対象**: アプリ起動 → ワークスペース作成 → 保存
- **ツール**: Playwright for Electron
- **タイミング**: `main` ブランチへのマージ時
- **要件**:
  - `_electron.launch()` を使用
  - 実際のビルド成果物 (`dist/`) を使用してテスト

---

## 3. セキュリティテスト要件

### 必須チェック項目
1. **File Permission**: 設定ファイルが `0600` で作成されること
2. **Path Injection**: `../` を含む不正パスが拒否されること
3. **IPC Validation**: レンダラーからの入力型検証 (Zod等)

---

## 4. パフォーマンステスト要件

### 閾値
- **起動時間**: < 1000ms
- **レスポンス**: < 100ms (IPC)

---

## 5. CI/CD パイプライン

```yaml
# .github/workflows/test.yml
jobs:
  test:
    steps:
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:coverage
  e2e:
    if: branch == 'main'
    steps:
      - run: npm run build
      - run: npm run test:e2e
```
