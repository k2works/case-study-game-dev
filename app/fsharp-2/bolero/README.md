# ぷよぷよ F#/Bolero版

## 概要

F# と Bolero を使用したぷよぷよゲームの実装です。TDD（テスト駆動開発）手法に従って開発されています。

### 目的

- F# による関数型プログラミングの実践
- Bolero を使用した WebAssembly アプリケーション開発
- Elmish アーキテクチャ（Model-View-Update パターン）の理解
- TDD によるゲーム開発の学習

### 前提

| ソフトウェア | バージョン | 備考 |
| :----------- | :--------- | :--- |
| .NET SDK     | 9.0以上    | F# コンパイラを含む |
| Bolero       | 0.24.18    | Blazor WebAssembly フレームワーク |
| xUnit        | 3.0以上    | テストフレームワーク |
| FsUnit       | 7.1以上    | F# テストアサーション |
| Cake         | 5.1以上    | ビルド自動化ツール |

## 構成

- [Quick Start](#quick-start)
- [進捗状況](#進捗状況)
- [構築](#構築)
- [配置](#配置)
- [開発](#開発)
- [テスト](#テスト)

## 詳細

### Quick Start

```bash
# 依存関係の復元とビルド
dotnet cake

# 開発サーバーの起動
dotnet cake --target=Watch

# ブラウザで https://localhost:5001 を開く
```

**[⬆ back to top](#構成)**

### 進捗状況

#### 完了したイテレーション

| イテレーション | 機能 | テスト数 | 状態 |
|:---|:---|---:|:---:|
| 0 | 環境セットアップ | - | ✅ |
| 1 | ゲーム開始とドメインモデル | 18 | ✅ |
| 2 | ぷよの移動 | 27 | ✅ |
| 3 | ぷよの回転（壁キック対応） | 35 | ✅ |
| 4 | 自動落下ぷよ | 39 | ✅ |
| 5 | 高速落下（↓キー） | 45 | ✅ |
| 6 | ぷよ消去と重力 | 54 | ✅ |
| 7 | 連鎖反応 | 58 | ✅ |
| 8 | 全消しボーナス | 60 | ✅ |

#### 主な技術的成果

- ✅ Elmish アーキテクチャ（Model-View-Update）の実装
- ✅ BFS アルゴリズムによる連結ぷよ検出
- ✅ パイプライン演算子を活用した関数型プログラミング
- ✅ TDD による段階的な機能開発
- ✅ 不変データ構造によるゲーム状態管理
- ✅ エッジケースの発見と修正（浮遊ぷよ問題）
- ✅ 再帰関数による連鎖反応の実装
- ✅ 全消し判定とボーナススコアシステム

**[⬆ back to top](#構成)**

### 構築

#### 初回セットアップ

```bash
# 依存関係のインストール
dotnet restore

# ローカルツールの復元
dotnet tool restore
```

#### プロジェクト構造

```
app/fsharp-2/bolero/
├── src/
│   └── bolero.Client/
│       ├── Domain/                 # ドメイン層
│       │   ├── Types.fs            # 基本型定義
│       │   ├── Board.fs            # ボード操作
│       │   ├── PuyoPair.fs         # ぷよペア
│       │   └── GameLogic.fs        # ゲームロジック
│       ├── Elmish/                 # Elmish層
│       │   ├── Model.fs            # モデル定義
│       │   ├── Update.fs           # 更新ロジック
│       │   └── Subscription.fs     # サブスクリプション
│       ├── Components/             # コンポーネント層
│       │   └── GameView.fs         # ビュー
│       ├── Main.fs                 # エントリーポイント
│       └── wwwroot/
│           ├── index.html
│           └── css/
│               └── index.css
├── tests/
│   └── PuyoPuyo.Tests/
│       ├── Domain/                 # ドメイン層テスト
│       │   ├── BoardTests.fs
│       │   ├── PuyoPairTests.fs
│       │   └── GameLogicTests.fs
│       ├── Elmish/                 # Elmish層テスト
│       │   └── UpdateTests.fs
│       └── Program.fs
├── build.cake                      # Cake ビルドスクリプト
├── PuyoPuyo.sln                   # ソリューションファイル
└── README.md                      # このファイル
```

**[⬆ back to top](#構成)**

### 配置

#### 開発環境

```bash
# 開発サーバーの起動（ホットリロード有効）
dotnet cake --target=Watch

# または直接実行
dotnet watch run --project src/bolero.Client/bolero.Client.fsproj
```

開発サーバーは https://localhost:5001 で起動します。

#### 本番ビルド

```bash
# 本番用ビルド
dotnet cake --target=Build --configuration=Release

# ビルド成果物は src/bolero.Client/bin/Release に出力
```

**[⬆ back to top](#構成)**

### 開発

#### 利用可能なコマンド

```bash
# デフォルトタスク（テスト実行）
dotnet cake

# クリーンビルド
dotnet cake --target=Clean

# 依存関係の復元
dotnet cake --target=Restore

# ビルドのみ
dotnet cake --target=Build

# テストの実行
dotnet cake --target=Test

# アプリケーションの起動
dotnet cake --target=Run

# 開発サーバー（ホットリロード）
dotnet cake --target=Watch

# テストのウォッチモード
dotnet cake --target=Watch-Test

# CI環境用（クリーン + テスト）
dotnet cake --target=CI
```

#### ゲームの操作方法

- **←→キー**: ぷよペアを左右に移動
- **↑キー**: ぷよペアを右回転
- **↓キー**: 高速落下
- **Rキー**: ゲームオーバー後にリスタート

#### 実装済み・予定機能

- [x] ステージの表示（6列×13行）
- [x] ぷよペアの生成と操作
- [x] ぷよの回転（壁キック対応）
- [x] 自由落下と着地
- [x] 高速落下（↓キー）
- [x] 重力処理
- [x] ぷよの消去（4つ以上の同色つながり）
- [x] 連鎖反応
- [x] 全消しボーナス
- [ ] スコア計算（連鎖ボーナス）
- [ ] ゲームオーバー判定
- [ ] リスタート機能

#### 開発の進め方

このプロジェクトは TDD（テスト駆動開発）で開発されています：

1. **Red**: 失敗するテストを書く
2. **Green**: テストを通す最小限の実装
3. **Refactor**: コードを改善

テストは xUnit と FsUnit を使用しています。

**[⬆ back to top](#構成)**

### テスト

#### テストの実行

```bash
# すべてのテストを実行
dotnet cake --target=Test

# または直接実行
dotnet test

# テストをウォッチモードで実行（ファイル変更時に自動実行）
dotnet cake --target=Watch-Test
```

#### テストカバレッジ

現在のテスト数：**60テスト**（イテレーション8完了時点）

- Domain層（Board, PuyoPair, GameLogic）: 33テスト
- Elmish層（Update）: 27テスト
- すべてのテストが成功 ✅

**[⬆ back to top](#構成)**

## 技術スタック

### フロントエンド

- **F# 9.0**: 関数型プログラミング言語
- **Bolero 0.24.18**: Blazor WebAssembly フレームワーク
- **Elmish**: Model-View-Update アーキテクチャ

### テスト

- **xUnit 3.0**: .NET テストフレームワーク
- **FsUnit 7.1**: F# 用テストアサーション

### 開発ツール

- **Cake 5.1**: C# ビルド自動化ツール
- **dotnet watch**: ホットリロード機能

## アーキテクチャ

このプロジェクトは **Elmish アーキテクチャ**（Model-View-Update パターン）を採用し、レイヤードアーキテクチャで整理されています：

### Domain層（ドメインロジック）

ゲームのコアロジックを実装：

- **Types.fs**: 基本型定義（PuyoColor, Cell, Direction, GameStatus）
- **Board.fs**: ボード操作（生成、取得、設定、消去、重力）
- **PuyoPair.fs**: ぷよペア操作（生成、回転、位置計算）
- **GameLogic.fs**: ゲームルール（移動判定、回転、壁キック）

### Elmish層（アプリケーションロジック）

Elmish アーキテクチャに基づく状態管理：

- **Model**: ゲーム全体の状態（Board, CurrentPiece, Score, Status など）
- **Message**: 状態変更イベント（MoveLeft, Rotate, Tick など）
- **Update**: メッセージを受け取り新しい状態を生成
- **Subscription**: 外部イベント（タイマーなど）の購読

### Components層（UI）

ユーザーインターフェース：

- **GameView**: ゲーム画面の描画とユーザー入力処理

### 特徴

- **不変データ構造**: すべてのデータは不変、状態変更は新しいデータを生成
- **純粋関数**: 副作用のない関数による予測可能な動作
- **パイプライン演算子**: `|>` を活用した読みやすいコード
- **TDD**: テスト駆動開発による高品質な実装

## 参照

- [Bolero 公式ドキュメント](https://fsbolero.io/)
- [F# 公式サイト](https://fsharp.org/)
- [Elmish 公式ドキュメント](https://elmish.github.io/elmish/)
- [ぷよぷよ TDD 入門チュートリアル](../../docs/reference/case-5/)
