# ぷよぷよから始めるテスト駆動開発入門

## 概要

### 目的

このプロジェクトは、テスト駆動開発（TDD）の実践的な学習を目的としたケーススタディです。
ぷよぷよゲームの実装を通じて、以下の実践スキルを習得します：

- テスト駆動開発（TDD）の Red-Green-Refactor サイクル
- 単体テスト・統合テストの設計と実装
- ドメイン駆動設計（DDD）の基礎
- .NET MAUI によるクロスプラットフォーム開発
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
# リポジトリのクローン
git clone <repository-url>
cd case-study-game-dev

# プロジェクトのビルドとテスト実行
cd app/csharp-2/maui
dotnet cake build.cake --target=Check
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

**Rider（推奨）:**
- .NET MAUI プラグインを有効化
- StyleCop.Analyzers の設定を確認

**Visual Studio:**
- .NET MAUI ワークロードを選択してインストール
- C# 開発環境をセットアップ

#### 3. MCP サーバーのセットアップ（オプション）

```bash
# GitHub MCP サーバー
claude mcp add github npx @modelcontextprotocol/server-github -e GITHUB_PERSONAL_ACCESS_TOKEN=xxxxxxxxxxxxxxx

# Byterover MCP サーバー
claude mcp add --transport http byterover-mcp --scope user https://mcp.byterover.dev/v2/mcp

# プロジェクトスコープの GitHub MCP
claude mcp add github npx -y @modelcontextprotocol/server-github -s project
```

**[⬆ back to top](#構成)**

### 開発

#### プロジェクト構造

```
app/csharp-2/maui/
├── PuyoPuyoMAUI/              # メインアプリケーション
│   ├── MainPage.xaml          # UI 定義
│   ├── MainPage.xaml.cs       # UI ロジック
│   └── Graphics/              # 描画ロジック
├── PuyoPuyoMAUI.Core/         # ドメインロジック
│   └── Domain/
│       ├── Board.cs           # ボード管理
│       ├── Cell.cs            # セル定義
│       ├── PuyoPair.cs        # ぷよペア
│       ├── GameLogic.cs       # ゲームロジック
│       └── PuyoColor.cs       # ぷよの色
├── PuyoPuyoMAUI.Tests/        # テスト
│   ├── Domain/                # 単体テスト
│   └── IntegrationTests.cs    # 統合テスト
└── build.cake                 # ビルドスクリプト
```

#### TDD サイクル

このプロジェクトは厳格な TDD アプローチで開発されています：

1. **Red フェーズ**: 失敗するテストを書く
2. **Green フェーズ**: テストを通す最小限のコードを書く
3. **Refactor フェーズ**: コードを改善する

```bash
# テストの実行
cd app/csharp-2/maui
dotnet test

# 特定のテストの実行
dotnet test --filter "完全なゲームフロー"
```

#### イテレーション一覧

- [x] イテレーション 0: プロジェクトセットアップ
- [x] イテレーション 1: ボードとセルの基本実装
- [x] イテレーション 2: ぷよペアの実装
- [x] イテレーション 3: ぷよペアの移動と回転
- [x] イテレーション 4: ぷよの着地と固定
- [x] イテレーション 5: ぷよの消去判定
- [x] イテレーション 6: 重力処理
- [x] イテレーション 7: 連鎖処理
- [x] イテレーション 8: スコアシステム（通常消去 + 全消しボーナス）
- [x] イテレーション 9: ゲームオーバー判定とリスタート
- [x] リリース: 統合テスト

**[⬆ back to top](#構成)**

### テスト

#### テスト戦略

テストピラミッドに基づく階層的テスト戦略：

- **単体テスト（62テスト）**: ドメインロジックの詳細な検証
- **統合テスト（3テスト）**: 複数コンポーネントの連携確認
- **E2E テスト（計画中）**: ユーザーシナリオの検証

```bash
# 全テストの実行
dotnet test

# カバレッジ付きテスト実行（計画中）
dotnet test /p:CollectCoverage=true
```

#### テストの種類

**単体テスト:**
- Board クラスのテスト（15テスト）
- PuyoPair クラスのテスト（10テスト）
- GameLogic クラスのテスト（37テスト）

**統合テスト:**
- 完全なゲームフロー（着地→消去→重力→連鎖→スコア）
- 全消しボーナスシナリオ
- ゲームオーバー判定

**[⬆ back to top](#構成)**

### 品質チェック

#### Cake ビルドスクリプト

プロジェクトは Cake ビルドシステムを使用して品質を管理しています：

```bash
cd app/csharp-2/maui

# 全品質チェックの実行
dotnet cake build.cake --target=Check

# 個別チェック
dotnet cake build.cake --target=Format   # フォーマット
dotnet cake build.cake --target=Lint     # 静的解析
dotnet cake build.cake --target=Build    # ビルド
dotnet cake build.cake --target=Test     # テスト
```

#### 品質基準

| 項目 | 基準 | 状態 |
|------|------|------|
| テスト成功率 | 100% | ✅ 65/65 |
| コンパイラ警告 | 0個 | ✅ |
| Linter 警告 | 0個 | ✅ |
| テストカバレッジ | 80%以上 | 🎯 計画中 |

**[⬆ back to top](#構成)**

## 参照

### ドキュメント

- [開発ガイド](docs/reference/開発ガイド.md)
- [コーディングとテストガイド](docs/reference/コーディングとテストガイド.md)
- [よいソフトウェアとは](docs/reference/よいソフトウェアとは.md)

### 技術記事

- [ぷよぷよから始めるテスト駆動開発入門（C# MAUI編）](docs/wiki/記事/開発/ぷよぷよから始めるテスト駆動開発入門/csharp_maui.md)

### 外部リンク

- [.NET MAUI 公式ドキュメント](https://learn.microsoft.com/ja-jp/dotnet/maui/)
- [xUnit.net ドキュメント](https://xunit.net/)
- [Clean Craftsmanship（書籍）](https://www.amazon.co.jp/dp/4048930656)

## ライセンス

MIT License
