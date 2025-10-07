# ぷよぷよ - Elm 版

## 概要

### 目的

「ぷよぷよから始めるテスト駆動開発入門」を Elm で実装したプロジェクトです。Test-Driven Development (TDD) の実践を通じて、以下を学習します：

- Elm アーキテクチャ (TEA: The Elm Architecture)
- 純粋関数型プログラミング
- 型安全なゲームロジックの実装
- elm-test を使った単体テスト

### 前提

| ソフトウェア | バージョン | 備考                              |
| :----------- | :--------- | :-------------------------------- |
| Elm          | 0.19.1     | 関数型プログラミング言語          |
| Node.js      | 18.x 以上  | npm scripts の実行に必要          |
| elm-test     | 0.19.1     | Elm のテストフレームワーク        |

## 構成

- [構築](#構築)
- [配置](#配置)
- [運用](#運用)
- [開発](#開発)

## 詳細

### Quick Start

```bash
# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev
# ブラウザで http://localhost:8000 にアクセス
# src/Main.elm を選択してゲームを実行

# テストの実行
npm test
```

### 構築

```bash
# Elm パッケージのインストール
elm install elm/browser
elm install elm/core
elm install elm/html
elm install elm/json
elm install elm/random
elm install elm/time

# テスト用パッケージのインストール
elm install elm-explorations/test --test
```

**[⬆ back to top](#構成)**

### 配置

```bash
# 開発用ビルド
npm run build:dev

# 本番用ビルド（最適化あり）
npm run build

# ビルド成果物の確認
ls dist/main.js
```

**[⬆ back to top](#構成)**

### 運用

本プロジェクトは学習用のため、本番運用は想定していません。

**[⬆ back to top](#構成)**

### 開発

#### npm scripts

```bash
# テストの実行
npm test

# テストの監視モード
npm run watch

# 開発サーバーの起動
npm run dev

# 開発用ビルド
npm run build:dev

# 本番用ビルド（最適化あり）
npm run build

# ビルド成果物とキャッシュの削除
npm run clean

# リリースタスク（テスト→ビルド）
npm run release
```

#### ディレクトリ構造

```
elm-2/
├── src/
│   ├── Main.elm           # メインエントリポイント（TEA パターン）
│   ├── Board.elm          # ゲーム盤面のデータ構造と操作
│   ├── Cell.elm           # セルの型定義
│   ├── GameLogic.elm      # ゲームロジック（連鎖、消去、重力）
│   ├── PuyoColor.elm      # ぷよの色の型定義
│   └── PuyoPair.elm       # ぷよペアの移動と回転
├── tests/
│   ├── MainTests.elm      # Main モジュールのテスト
│   ├── GameLogicTests.elm # GameLogic モジュールのテスト
│   ├── PuyoPairTests.elm  # PuyoPair モジュールのテスト
│   └── BoardTests.elm     # Board モジュールのテスト
├── dist/                  # ビルド成果物（.gitignore）
├── elm.json               # Elm プロジェクト設定
├── package.json           # npm scripts 定義
└── README.md              # このファイル
```

#### イテレーション履歴

- **Iteration 0**: プロジェクトセットアップ
- **Iteration 1**: ボード表示
- **Iteration 2**: ぷよペアの生成と表示
- **Iteration 3**: ぷよペアの移動
- **Iteration 4**: 自動落下
- **Iteration 5**: 高速落下
- **Iteration 6**: ぷよ消去
- **Iteration 7**: 連鎖反応
- **Iteration 8**: 全消しボーナス
- **Iteration 9**: ゲームオーバーとリスタート

#### テスト

```bash
# すべてのテストを実行
npm test

# テストの監視モード（ファイル変更時に自動実行）
npm run watch

# 特定のシード値でテストを再現
npx elm-test --seed 123456789
```

現在のテスト数: **36 個**

#### 主要機能

- ✅ 6×12 のゲーム盤面
- ✅ ぷよペアの左右移動
- ✅ ぷよペアの回転（壁キック対応）
- ✅ 自動落下
- ✅ 高速落下（↓キー）
- ✅ ぷよの消去（4 つ以上つながった場合）
- ✅ 重力適用（浮いたぷよの落下）
- ✅ 連鎖反応とスコア計算
- ✅ 全消しボーナス（3600 点）
- ✅ ゲームオーバー判定
- ✅ リスタート機能（R キー）
- ✅ ランダムな色のぷよ生成

#### 操作方法

- **←/→キー**: ぷよペアの左右移動
- **↑キー**: ぷよペアの回転
- **↓キー**: 高速落下
- **R キー**: ゲームオーバー後のリスタート

**[⬆ back to top](#構成)**

## 参照

- [Elm 公式サイト](https://elm-lang.org/)
- [Elm Guide](https://guide.elm-lang.org/)
- [elm-test ドキュメント](https://package.elm-lang.org/packages/elm-explorations/test/latest/)
- [ぷよぷよから始めるテスト駆動開発入門](https://github.com/J-Sokawa/puyo-puyo-tetris) (元の教材)
