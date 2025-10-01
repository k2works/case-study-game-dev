# ぷよぷよゲーム - ClojureScript 実装

ClojureScript と shadow-cljs を使用したぷよぷよゲームの実装です。

## 概要

### 目的

TDD（テスト駆動開発）に基づいた ClojureScript によるぷよぷよゲームの実装

### 前提

| ソフトウェア | バージョン | 備考 |
| :----------- | :--------- | :--- |
| Node.js      | 18.x以上   | shadow-cljs実行に必要 |
| Java         | 11以上     | ClojureScript実行に必要 |

## 構成

- [構築](#構築)
- [配置](#配置)
- [運用](#運用)
- [開発](#開発)

## 詳細

### Quick Start

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:8020` を開いてゲームをプレイできます。

### 構築

#### 初回セットアップ

```bash
# 依存関係のインストール
npm install

# shadow-cljs のインストール確認
npx shadow-cljs --version
```

**[⬆ back to top](#構成)**

### 配置

#### 本番ビルド

```bash
# 最適化ビルド
npm run build
```

ビルド成果物は `public/js/main.js` に出力されます。

**[⬆ back to top](#構成)**

### 運用

#### 開発サーバー起動

```bash
npm run dev
```

- ホットリロード有効
- ブラウザ REPL 利用可能
- ポート: 8020

#### テスト実行

```bash
npm test
```

#### コード品質チェック

```bash
# リント
npm run lint

# フォーマットチェック
npm run format

# フォーマット自動修正
npm run format-fix

# 複雑度チェック
npm run complexity

# コードメトリクス
npm run metrics
```

**[⬆ back to top](#構成)**

### 開発

#### プロジェクト構成

```
app/clojure/
├── src/
│   └── puyo/
│       └── core.cljs          # メインロジック
├── public/
│   ├── index.html             # HTML エントリーポイント
│   └── js/
│       └── main.js            # ビルド済み JavaScript
├── shadow-cljs.edn            # shadow-cljs 設定
└── package.json               # npm 設定
```

#### ゲーム仕様

- **ボードサイズ**: 8×12 マス（幅 8、高さ 12）
- **ぷよの色**: 5 色（赤、緑、青、黄、紫）
- **消去ルール**: 同色 4 つ以上の接続で消去
- **連鎖システム**: 消去後の落下により新たな接続が形成される
- **スコアリング**: 基本スコア + 連鎖ボーナス + 全消しボーナス

#### 操作方法

- `←` `→` : 左右移動
- `↓` : 高速落下
- `↑` : 回転
- `スペース` : ハードドロップ
- `R` : リスタート

#### 技術スタック

- **ClojureScript**: Lisp ベースの関数型プログラミング言語
- **shadow-cljs**: ClojureScript のビルドツール
- **Reagent**: React のラッパーライブラリ

#### 開発プロセス

このプロジェクトは TDD に基づいて開発されました：

1. Phase 1: 基盤システム（ボード、ぷよ、組ぷよ）
2. Phase 2: ぷよ管理システム（ランダム生成、配置、移動）
3. Phase 3: 落下と衝突判定
4. Phase 4: 消去判定と連鎖システム
5. Phase 5: UI とゲームループ

#### アーキテクチャ

関数型プログラミングパターンに従った実装：

- **純粋関数**: 副作用のない関数
- **不変データ構造**: Clojure の永続データ構造を使用
- **データ駆動**: マップとベクターによるデータ表現
- **Reagent/Ratom**: リアクティブな状態管理

**[⬆ back to top](#構成)**

## 参照

- [ClojureScript](https://clojurescript.org/)
- [shadow-cljs](https://shadow-cljs.github.io/docs/UsersGuide.html)
- [Reagent](https://reagent-project.github.io/)
