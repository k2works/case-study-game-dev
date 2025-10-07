# ぷよぷよゲーム - TypeScript版

テスト駆動開発（TDD）で作るぷよぷよゲーム

## 環境構築

```bash
# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev

# テストの実行
npm test

# テストの監視モード
npm run test:watch

# コードカバレッジ
npm run test:coverage
```

## 開発ツール

- **言語**: TypeScript
- **ビルドツール**: Vite
- **テストフレームワーク**: Vitest
- **リンター**: ESLint
- **フォーマッター**: Prettier
- **タスクランナー**: Gulp

## タスクランナー

```bash
# コード品質チェック（lint + format + test）
npm run check

# ファイル監視モード
npm run watch

# テスト監視モード（Guard）
npm run guard
```

## プロジェクト構造

```
typescript-4/
├── src/           # ソースコード
├── tests/         # テストコード
├── public/        # 静的ファイル
├── dist/          # ビルド成果物
└── coverage/      # カバレッジレポート
```

## コミット規約

Conventional Commits に従います：

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `test`: テスト追加・修正
- `refactor`: リファクタリング
- `chore`: その他の変更
