# ぷよぷよ MAUI (C#)

## 概要

### 目的

このプロジェクトは、.NET MAUI (Multi-platform App UI) を使用したぷよぷよゲームの実装です。
テスト駆動開発（TDD）の実践的な学習を目的としたケーススタディとして開発されています。

**主な学習目標**:
- テスト駆動開発（TDD）の Red-Green-Refactor サイクルの実践
- .NET MAUI によるクロスプラットフォーム開発
- ドメイン駆動設計（DDD）の基礎
- 単体テスト・統合テストの設計と実装
- 継続的インテグレーション（CI）とコード品質管理

### 前提

| ソフトウェア | バージョン | 備考 |
| :----------- | :--------- | :--- |
| .NET SDK | 9.0.x | .NET MAUI ワークロード含む |
| Rider / Visual Studio | 最新版 | .NET MAUI サポート必須 |
| Git | 2.x | バージョン管理 |

## 構成

- [Quick Start](#quick-start)
- [構築](#構築)
- [開発](#開発)
- [テスト](#テスト)
- [品質チェック](#品質チェック)

## 詳細

### Quick Start

```bash
# プロジェクトディレクトリに移動
cd app/csharp-2/maui

# 全品質チェックの実行（フォーマット、リント、ビルド、テスト）
dotnet cake build.cake --target=Check

# Windows でアプリを実行
dotnet run --project PuyoPuyoMAUI/PuyoPuyoMAUI.csproj -f net9.0-windows10.0.19041.0
```

### 構築

#### 1. .NET SDK のインストール

```bash
# .NET SDK 9.0 のインストール確認
dotnet --version

# .NET MAUI ワークロードのインストール
dotnet workload install maui
```

#### 2. IDE のセットアップ

**Rider（推奨）**:
```bash
# Rider をインストール
# .NET MAUI プラグインを有効化
# StyleCop.Analyzers の設定を確認
```

**Visual Studio**:
```bash
# Visual Studio Installer を起動
# .NET MAUI ワークロードを選択してインストール
# C# 開発環境をセットアップ
```

#### 3. 依存関係の復元

```bash
# パッケージの復元
dotnet restore PuyoPuyoMAUI.sln

# または Cake タスクを使用
dotnet cake build.cake --target=Restore
```

**[⬆ back to top](#構成)**

### 開発

#### プロジェクト構造

```
app/csharp-2/maui/
├── PuyoPuyoMAUI/              # メインアプリケーション
│   ├── MainPage.xaml          # UI 定義
│   ├── MainPage.xaml.cs       # UI ロジック
│   ├── Graphics/              # 描画ロジック
│   │   └── GameDrawable.cs   # ゲーム画面の描画
│   └── PuyoPuyoMAUI.csproj   # プロジェクトファイル
├── PuyoPuyoMAUI.Core/         # ドメインロジック
│   └── Domain/
│       ├── Board.cs           # ボード管理
│       ├── Cell.cs            # セル定義
│       ├── PuyoPair.cs        # ぷよペア
│       ├── GameLogic.cs       # ゲームロジック
│       └── PuyoColor.cs       # ぷよの色
├── PuyoPuyoMAUI.Tests/        # テスト
│   ├── Domain/                # 単体テスト
│   │   ├── BoardTests.cs
│   │   ├── PuyoPairTests.cs
│   │   └── GameLogicTests.cs
│   └── IntegrationTests.cs    # 統合テスト
├── build.cake                 # Cake ビルドスクリプト
├── .editorconfig              # コードスタイル設定
└── PuyoPuyoMAUI.sln          # ソリューションファイル
```

#### TDD サイクル

このプロジェクトは厳格な TDD アプローチで開発されています：

1. **Red フェーズ**: 失敗するテストを書く
2. **Green フェーズ**: テストを通す最小限のコードを書く
3. **Refactor フェーズ**: コードを改善する

```bash
# テストの実行
dotnet test

# 特定のテストクラスの実行
dotnet test --filter "FullyQualifiedName~BoardTests"

# 特定のテストメソッドの実行
dotnet test --filter "完全なゲームフロー"
```

#### 実装済みイテレーション

- ✅ イテレーション 0: プロジェクトセットアップ
- ✅ イテレーション 1: ボードとセルの基本実装
- ✅ イテレーション 2: ぷよペアの実装
- ✅ イテレーション 3: ぷよペアの移動と回転
- ✅ イテレーション 4: ぷよの着地と固定
- ✅ イテレーション 5: ぷよの消去判定
- ✅ イテレーション 6: 重力処理
- ✅ イテレーション 7: 連鎖処理
- ✅ イテレーション 8: スコアシステム（通常消去 + 全消しボーナス）
- ✅ イテレーション 9: ゲームオーバー判定とリスタート
- ✅ リリース: 統合テスト

**[⬆ back to top](#構成)**

### テスト

#### テスト戦略

テストピラミッドに基づく階層的テスト戦略：

- **単体テスト（62テスト）**: ドメインロジックの詳細な検証
- **統合テスト（3テスト）**: 複数コンポーネントの連携確認

```bash
# 全テストの実行
dotnet test

# テスト結果の詳細表示
dotnet test --logger "console;verbosity=detailed"

# カバレッジ付きテスト実行（計画中）
dotnet test /p:CollectCoverage=true
```

#### テストの種類

**単体テスト**:
- Board クラスのテスト（15テスト）
  - セルの設定と取得
  - ぷよペアの固定
  - 消去判定
  - 重力処理
  - 連鎖処理
- PuyoPair クラスのテスト（10テスト）
  - ランダム生成
  - 回転
  - 位置取得
- GameLogic クラスのテスト（37テスト）
  - 移動判定
  - 回転判定（壁キック含む）
  - ゲームオーバー判定

**統合テスト**:
- 完全なゲームフロー（着地→消去→重力→連鎖→スコア）
- 全消しボーナスシナリオ
- ゲームオーバー判定

**[⬆ back to top](#構成)**

### 品質チェック

#### Cake ビルドスクリプト

プロジェクトは Cake ビルドシステムを使用して品質を管理しています：

```bash
# 全品質チェックの実行
dotnet cake build.cake --target=Check

# 個別チェック
dotnet cake build.cake --target=Format   # コードフォーマット
dotnet cake build.cake --target=Restore  # パッケージ復元
dotnet cake build.cake --target=Lint     # 静的解析
dotnet cake build.cake --target=Build    # ビルド
dotnet cake build.cake --target=Test     # テスト実行
```

#### 品質基準

| 項目 | 基準 | 現在の状態 |
|------|------|-----------|
| テスト成功率 | 100% | ✅ 65/65 |
| コンパイラ警告 | 0個 | ✅ |
| Linter 警告 | 0個 | ✅ |
| テストカバレッジ | 80%以上 | 🎯 計画中 |

#### コーディング規約

- **StyleCop.Analyzers**: C# のコーディング規約を自動チェック
- **.editorconfig**: コードスタイルの統一
- **Conventional Commits**: セマンティックなコミットメッセージ

**[⬆ back to top](#構成)**

## 参照

### 関連ドキュメント

- [プロジェクトルート README](../../../README.md)
- [開発ガイド](../../../docs/reference/開発ガイド.md)
- [コーディングとテストガイド](../../../docs/reference/コーディングとテストガイド.md)
- [よいソフトウェアとは](../../../docs/reference/よいソフトウェアとは.md)

### 技術記事

- [ぷよぷよから始めるテスト駆動開発入門（C# MAUI編）](../../../docs/wiki/記事/開発/ぷよぷよから始めるテスト駆動開発入門/csharp_maui.md)

### 外部リンク

- [.NET MAUI 公式ドキュメント](https://learn.microsoft.com/ja-jp/dotnet/maui/)
- [xUnit.net ドキュメント](https://xunit.net/)
- [Cake Build 公式サイト](https://cakebuild.net/)
- [StyleCop.Analyzers](https://github.com/DotNetAnalyzers/StyleCopAnalyzers)
- [Clean Craftsmanship（書籍）](https://www.amazon.co.jp/dp/4048930656)

## ライセンス

MIT License
