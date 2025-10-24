# PuyoPuyo

## 概要

### 目的

F# と Fabulous.Maui を使用したクロスプラットフォームのぷよぷよゲームアプリケーション。
Test-Driven Development (TDD) の実践を通じて、保守性と拡張性の高いコードベースを構築する。

### 前提

| ソフトウェア | バージョン | 備考                            |
| :----------- | :--------- | :------------------------------ |
| .NET SDK     | 9.0.306    | global.json で固定              |
| F#           | 9.0.303    |                                 |
| Fabulous     | 2.4.0      | MVU パターンの UI フレームワーク |
| MAUI         | 9.0.111    | クロスプラットフォーム対応      |

**対応プラットフォーム:**

- Android (API 21+)
- iOS (14.2+)
- macOS Catalyst (14.0+)
- Windows (10.0.17763.0+)

## 構成

- [Quick Start](#quick-start)
- [構築](#構築)
- [開発](#開発)
- [テスト](#テスト)
- [ビルド](#ビルド)
- [アーキテクチャ](#アーキテクチャ)

## 詳細

### Quick Start

```bash
# 依存関係の復元
dotnet restore

# テストの実行
dotnet test

# アプリの起動 (Windows)
dotnet build -t:Run -f net9.0-windows10.0.19041.0
```

**[⬆ back to top](#構成)**

### 構築

#### 前提条件

```bash
# .NET SDK のインストール確認
dotnet --version
# 9.0.306 が表示されることを確認

# MAUI ワークロードのインストール
dotnet workload install maui
```

#### プロジェクトのセットアップ

```bash
# リポジトリのクローン
git clone <repository-url>
cd case-study-game-dev/app/fsharp-2/maui

# 依存関係の復元
dotnet restore
```

**[⬆ back to top](#構成)**

### 開発

#### プロジェクト構造

```
PuyoPuyo/
├── src/
│   ├── PuyoPuyo.App/       # MAUI アプリケーション層
│   │   ├── App.fs          # MVU パターンの実装
│   │   └── MauiProgram.fs  # アプリケーションエントリポイント
│   └── PuyoPuyo.Core/      # ドメインロジック層
│       ├── Domain/         # ドメインモデル
│       └── GameLogic/      # ゲームロジック
└── tests/
    └── PuyoPuyo.Tests/     # 単体・統合テスト
```

#### 開発フロー

このプロジェクトは TDD (Test-Driven Development) で開発されています。

1. **Red**: 失敗するテストを書く
2. **Green**: テストを通す最小限のコードを実装
3. **Refactor**: コードを改善（テストは常に通る状態を維持）

```bash
# テスト駆動開発のサイクル
dotnet watch test --project tests/PuyoPuyo.Tests
```

#### コード品質管理

```bash
# フォーマットチェック
dotnet fantomas --check .

# フォーマット適用
dotnet fantomas .

# リンターチェック
dotnet fsharplint lint PuyoPuyo.sln
```

**[⬆ back to top](#構成)**

### テスト

```bash
# すべてのテストを実行
dotnet test

# 詳細な出力で実行
dotnet test --verbosity normal

# カバレッジレポート付きで実行
dotnet test --collect:"XPlat Code Coverage"
```

**[⬆ back to top](#構成)**

### ビルド

#### Cake ビルドスクリプト

```bash
# Windows
.\build.ps1

# macOS/Linux
./build.sh
```

#### プラットフォーム別ビルド

```bash
# Android
dotnet build -f net9.0-android

# iOS (macOS のみ)
dotnet build -f net9.0-ios

# Windows
dotnet build -f net9.0-windows10.0.19041.0
```

#### リリースビルド

```bash
# Windows
dotnet publish -f net9.0-windows10.0.19041.0 -c Release

# Android APK
dotnet publish -f net9.0-android -c Release
```

**[⬆ back to top](#構成)**

### アーキテクチャ

#### MVU パターン (Model-View-Update)

Fabulous は Elm Architecture (MVU) を採用しています。

```fsharp
// Model: アプリケーションの状態
type Model = { Board: Board; Score: int; ... }

// Msg: 状態を変更するイベント
type Msg = | MoveLeft | MoveRight | Rotate | ...

// Update: Msg を受け取り Model を更新
let update (msg: Msg) (model: Model) = ...

// View: Model を受け取り UI を生成
let view (model: Model) = ...
```

#### レイヤー構成

- **App 層**: UI とユーザーインタラクション (Fabulous.Maui)
- **Core 層**: ゲームロジックとドメインモデル (Pure F#)
- **Tests 層**: 単体テスト・統合テスト

#### 設計原則

- **単一責任の原則**: 各モジュールは明確な責務を持つ
- **不変性**: F# の特性を活かした immutable なデータ構造
- **純粋関数**: 副作用のない関数による状態管理
- **型安全性**: 判別共用体とパターンマッチによる堅牢性

**[⬆ back to top](#構成)**

## 参照

- [Fabulous Documentation](https://docs.fabulous.dev/)
- [.NET MAUI Documentation](https://learn.microsoft.com/ja-jp/dotnet/maui/)
- [F# Language Guide](https://learn.microsoft.com/ja-jp/dotnet/fsharp/)