# ぷよぷよ F#/Fable版

## 概要

F# と Fable を使用したぷよぷよゲームの実装です。TDD（テスト駆動開発）手法に従って開発されています。

### 目的

- F# による関数型プログラミングの実践
- Fable を使用した F# から JavaScript へのトランスパイル
- TDD によるゲーム開発の学習

### 前提

| ソフトウェア | バージョン | 備考 |
| :----------- | :--------- | :--- |
| .NET SDK     | 8.0以上    | F# コンパイラを含む |
| Node.js      | 18.0以上   | npm 9.0以上推奨 |
| Fable        | 4.21.0     | F# to JS トランスパイラ |

## 構成

- [Quick Start](#quick-start)
- [構築](#構築)
- [配置](#配置)
- [開発](#開発)
- [テスト](#テスト)

## 詳細

### Quick Start

```bash
# 依存関係のインストール
npm run setup

# 開発サーバーの起動
npm run dev

# ブラウザで http://localhost:3000 を開く
```

### 構築

#### 初回セットアップ

```bash
# Node.js の依存関係をインストール
npm install

# .NET ツールと依存関係をインストール
npm run install-deps
```

#### プロジェクト構造

```
app/fsharp-2/fable/
├── src/                    # ソースコード
│   ├── Types.fs           # 型定義
│   ├── Stage.fs           # ステージロジック
│   ├── Player.fs          # プレイヤーロジック
│   ├── Score.fs           # スコア計算
│   ├── Game.fs            # ゲームロジック
│   ├── App.fs             # エントリーポイント
│   └── PuyoPuyo.fsproj    # F# プロジェクトファイル
├── tests/                  # テストコード
│   ├── StageTests.fs
│   ├── PlayerTests.fs
│   ├── GameTests.fs
│   └── PuyoPuyo.Tests.fsproj
├── index.html             # HTML エントリーポイント
├── package.json           # npm 設定
└── vite.config.mjs        # Vite 設定
```

**[⬆ back to top](#構成)**

### 配置

#### 開発環境

```bash
# 開発サーバーの起動（ホットリロード有効）
npm run dev
```

開発サーバーは http://localhost:3000 で起動します（ポートが使用中の場合は自動的に次のポートを使用）。

#### 本番ビルド

```bash
# 本番用ビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

ビルド成果物は `dist/` フォルダに出力されます。

**[⬆ back to top](#構成)**

### 開発

#### 利用可能なコマンド

```bash
# 開発サーバーの起動
npm run dev

# 本番ビルド
npm run build

# テストの実行
npm test

# テストのウォッチモード
npm run test:watch

# コードフォーマット
npm run format

# コードフォーマットチェック
npm run format:check

# リント
npm run lint

# ビルド成果物の削除
npm run clean
```

#### ゲームの操作方法

- **←→キー**: ぷよペアを左右に移動
- **↑キー**: ぷよペアを右回転
- **↓キー**: 高速落下
- **Rキー**: ゲームオーバー後にリスタート

#### 実装済み機能

- ✅ ステージの表示（6列×12行）
- ✅ ぷよペアの生成と操作
- ✅ ぷよの回転（壁キック対応）
- ✅ 自由落下と着地
- ✅ 重力処理
- ✅ ぷよの消去（4つ以上の同色つながり）
- ✅ 連鎖反応
- ✅ スコア計算（連鎖ボーナス）
- ✅ 全消しボーナス（3600点）
- ✅ ゲームオーバー判定
- ✅ リスタート機能

#### 開発の進め方

このプロジェクトは TDD（テスト駆動開発）で開発されています：

1. **Red**: 失敗するテストを書く
2. **Green**: テストを通す最小限の実装
3. **Refactor**: コードを改善

テストは Fable.Mocha を使用しています。

**[⬆ back to top](#構成)**

### テスト

#### テストの実行

```bash
# すべてのテストを実行
npm test

# テストをウォッチモードで実行（ファイル変更時に自動実行）
npm run test:watch
```

#### テストカバレッジ

現在のテスト数：**47テスト**

- ステージ機能：12テスト
- プレイヤー機能：27テスト
- ゲーム機能：8テスト

すべてのテストがパスしています ✅

**[⬆ back to top](#構成)**

## 技術スタック

### フロントエンド

- **F# 8.0**: 関数型プログラミング言語
- **Fable 4.21.0**: F# to JavaScript トランスパイラ
- **Vite 5.0**: 高速ビルドツール

### テスト

- **Fable.Mocha 2.17.0**: F# 用テストフレームワーク
- **Mocha 10.2.0**: JavaScript テストランナー

### 開発ツール

- **Fantomas**: F# コードフォーマッター
- **FSharpLint**: F# リンター

## 参照

- [Fable 公式ドキュメント](https://fable.io/)
- [F# 公式サイト](https://fsharp.org/)
- [Vite 公式ドキュメント](https://vitejs.dev/)
- [ぷよぷよ TDD 入門チュートリアル](../../../docs/reference/case-5/)
