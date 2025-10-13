# ぷよぷよゲーム - ClojureScript版

ClojureScript でテスト駆動開発 (TDD) を実践しながら作るぷよぷよゲームです。

## プロジェクト構成

```
puyo-puyo-cljs/
├── package.json          # npm依存関係管理
├── gulpfile.js           # タスクランナー
├── shadow-cljs.edn       # shadow-cljsビルド設定
├── deps.edn              # Clojure CLI設定
├── .cljfmt.edn          # コードフォーマット設定
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

## セットアップ

### 必要な環境

- Node.js (v16以上推奨)
- Java JDK (v11以上推奨)
- Clojure CLI tools

### 依存関係のインストール

```bash
npm install
```

または、Gulp タスクを使用:

```bash
npx gulp setup
```

## 開発

### 開発サーバーの起動

```bash
npm run dev
```

または、Gulp タスクを使用:

```bash
npx gulp dev
```

開発サーバーが起動したら、ブラウザで `http://localhost:8080` にアクセスしてください。

### テストの実行

```bash
npm test
```

または、Gulp タスクを使用:

```bash
npx gulp test
```

### ビルド

プロダクションビルド:

```bash
npm run build
```

または、Gulp タスクを使用:

```bash
npx gulp build
```

### コード品質チェック

全ての品質チェックを実行:

```bash
npx gulp check
```

個別のチェック:

```bash
# 静的コード解析
npx gulp lint

# 複雑度測定
npx gulp complexity

# コードフォーマットチェック
npx gulp format

# コードフォーマット自動修正
npx gulp format-fix

# テストカバレッジ
npx gulp coverage
```

## Gulp タスク一覧

利用可能なタスクを表示:

```bash
npx gulp help
```

主要なタスク:

- `help` - ヘルプを表示
- `setup` - 依存関係のセットアップ
- `test` - テストを実行
- `build` - プロダクションビルド
- `dev` - 開発環境の起動
- `check` - 全ての品質チェックを実行
- `lint` - 静的コード解析
- `format` - コードフォーマットチェック
- `format-fix` - コードフォーマット自動修正

## 技術スタック

- **ClojureScript**: JavaScript にコンパイルされる Clojure の方言
- **shadow-cljs**: ClojureScript のビルドツール
- **cljs.test**: ClojureScript の標準テストフレームワーク
- **clj-kondo**: ClojureScript の静的コード解析ツール
- **lein-cljfmt**: ClojureScript のコードフォーマッター
- **Gulp**: タスクランナー

## 開発手法

このプロジェクトは **テスト駆動開発 (TDD)** の **Red-Green-Refactor** サイクルに従って開発されています:

1. **Red**: 失敗するテストを書く
2. **Green**: テストを通す最小限の実装を行う
3. **Refactor**: コードをリファクタリングして改善する

## ライセンス

MIT
