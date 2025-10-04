# ぷよぷよゲーム - ClojureScript版

ClojureScript とテスト駆動開発（TDD）で実装したぷよぷよゲーム

## 環境構築

### 必要なソフトウェア

- Node.js (v18 以上)
- Clojure CLI (v1.11 以上)
- Java (v11 以上)

### セットアップ

```bash
# 依存関係のインストール
npx gulp setup

# または
npm install
```

## 開発

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:8080` にアクセスします。

### テストの実行

```bash
# 全テストの実行
npm test

# または Gulp タスク
npx gulp test
```

### 品質チェック

```bash
# 全ての品質チェックを実行
npx gulp check

# 個別実行
npx gulp lint        # 静的解析
npx gulp format      # フォーマットチェック
npx gulp complexity  # 循環複雑度測定
npx gulp coverage    # カバレッジ測定
```

### コードフォーマット

```bash
# フォーマット確認
npm run format

# 自動修正
npm run format-fix
```

## ビルド

```bash
# 開発ビルド
npm run build

# リリースビルド
npx gulp release
```

## プロジェクト構成

```
puyo-puyo-cljs/
├── package.json          # npm依存関係管理
├── gulpfile.js           # タスクランナー
├── shadow-cljs.edn       # shadow-cljsビルド設定
├── deps.edn              # Clojure CLI設定
├── README.md             # プロジェクト説明
├── .gitignore           # Git無視ファイル設定
├── public/
│   └── index.html       # HTMLエントリーポイント
├── src/
│   └── puyo/
│       └── core.cljs    # Puyo Puyoゲームメイン実装
└── test/
    └── puyo/
        └── core_test.cljs # Puyo Puyoテスト
```

## 技術スタック

- **言語**: ClojureScript
- **ビルドツール**: shadow-cljs
- **テストフレームワーク**: cljs.test
- **タスクランナー**: Gulp
- **バージョン管理**: Git
- **静的解析**: clj-kondo

## 参考資料

- [ClojureScript 公式ドキュメント](https://clojurescript.org/)
- [shadow-cljs 公式ガイド](https://shadow-cljs.github.io/docs/UsersGuide.html)
- Kent Beck『テスト駆動開発』
- Rich Hickey「Simple Made Easy」
