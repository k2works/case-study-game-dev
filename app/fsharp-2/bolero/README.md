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
│       ├── Main.fs                # エントリーポイント
│       └── wwwroot/
│           └── index.html
├── tests/
│   └── PuyoPuyo.Tests/
│       ├── Tests.fs               # テストファイル
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

#### 実装予定機能

- [ ] ステージの表示（6列×13行）
- [ ] ぷよペアの生成と操作
- [ ] ぷよの回転（壁キック対応）
- [ ] 自由落下と着地
- [ ] 重力処理
- [ ] ぷよの消去（4つ以上の同色つながり）
- [ ] 連鎖反応
- [ ] スコア計算（連鎖ボーナス）
- [ ] 全消しボーナス
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

現在のテスト数：**0テスト**（イテレーション0完了時点）

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

このプロジェクトは **Elmish アーキテクチャ**（Model-View-Update パターン）を採用しています：

### Model（状態）
アプリケーションの現在の状態を表現します。

### Message（イベント）
状態を変更するためのイベントを定義します。

### Update（更新関数）
メッセージを受け取り、新しい状態を返します。

### View（ビュー関数）
状態を HTML に変換します。

## 参照

- [Bolero 公式ドキュメント](https://fsbolero.io/)
- [F# 公式サイト](https://fsharp.org/)
- [Elmish 公式ドキュメント](https://elmish.github.io/elmish/)
- [ぷよぷよ TDD 入門チュートリアル](../../docs/reference/case-5/)
