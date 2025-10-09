# PuyoPuyo Game - F# Elmish WPF

ぷよぷよゲームの F# + Elmish + WPF 実装

## 必要な環境

- .NET 9.0 SDK
- Windows OS (WPF アプリケーション)

## ビルドタスク

### 開発

```bash
# アプリケーションを実行
dotnet cake --target=Run

# ホットリロードで実行
dotnet cake --target=Watch

# テストをホットリロードで実行
dotnet cake --target=Watch-Test
```

### ビルドとテスト

```bash
# デフォルト（テスト実行）
dotnet cake

# ビルドのみ
dotnet cake --target=Build

# テスト実行
dotnet cake --target=Test

# カバレッジ測定
dotnet cake --target=Coverage
```

### コード品質

```bash
# コードフォーマット
dotnet cake --target=Format

# フォーマットチェック
dotnet cake --target=Format-Check

# 静的解析
dotnet cake --target=Lint
```

### CI/CD

```bash
# CI環境での完全なビルドとテスト
dotnet cake --target=CI

# アプリケーションを公開（Windows x64）
dotnet cake --target=Publish

# リリースパッケージ作成（ZIP）
dotnet cake --target=Package

# リリースビルド（CI + パッケージング）
dotnet cake --target=Release
```

## プロジェクト構成

```
wpf/
├── src/
│   └── PuyoPuyo.WPF/          # メインアプリケーション
│       ├── Domain/            # ドメインロジック
│       ├── Elmish/            # Elmish (MVU)
│       ├── Components/        # UI コンポーネント
│       └── Program.fs         # エントリーポイント
├── tests/
│   └── PuyoPuyo.Tests/        # テスト
│       ├── Domain/            # ドメインロジックのテスト
│       └── Elmish/            # Elmish のテスト
├── build.cake                 # ビルドスクリプト
└── PuyoPuyo.sln              # ソリューションファイル
```

## アーキテクチャ

Elmish (MVU) パターンを採用：

- **Model**: ゲームの状態
- **View**: WPF による UI
- **Update**: メッセージに基づく状態更新

## リリース

リリースパッケージの作成：

```bash
dotnet cake --target=Release
```

生成物は `packages/` ディレクトリに出力されます。
