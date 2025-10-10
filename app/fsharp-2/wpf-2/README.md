# ぷよぷよゲーム (F# + Elmish.WPF 版)

テスト駆動開発で学ぶ F# と Elmish.WPF によるぷよぷよゲームの実装です。

## 環境構築

### 必要なツール

- .NET SDK 10.0 以上
- F# コンパイラ
- IDE (Visual Studio, Rider, VS Code など)

### プロジェクト構成

```
wpf-2/
├── src/
│   ├── PuyoPuyo.Core/       # ドメインロジック (ゲームルール)
│   └── PuyoPuyo.App/        # UI (Elmish.WPF)
├── tests/
│   └── PuyoPuyo.Tests/      # テスト
└── PuyoPuyo.sln             # ソリューションファイル
```

### ビルド

```bash
dotnet build
```

### テスト実行

```bash
dotnet test
```

### アプリケーション実行

```bash
dotnet run --project src/PuyoPuyo.App
```

### Cake タスク

Cake を使用してビルド・テスト・リリースを自動化できます。

```bash
# 基本タスク
dotnet cake --target=Build      # ビルド
dotnet cake --target=Test       # テスト実行
dotnet cake --target=Run        # アプリケーション実行

# 開発支援
dotnet cake --target=Watch      # ホットリロード（アプリケーション）
dotnet cake --target=Watch-Test # ホットリロード（テスト）
dotnet cake --target=Format     # コードフォーマット
dotnet cake --target=Lint       # 静的解析

# CI/CD
dotnet cake --target=CI         # CI パイプライン（フォーマット・Lint・テスト・カバレッジ）
dotnet cake --target=Coverage   # テストカバレッジ測定
dotnet cake --target=Publish    # リリースビルド（単一実行ファイル生成）
```

## 開発ガイドライン

このプロジェクトはテスト駆動開発 (TDD) に従って開発されています。

### TDD サイクル

1. **Red (赤)**: 失敗するテストを書く
2. **Green (緑)**: テストが通る最小限のコードを実装
3. **Refactor (リファクタリング)**: コードの品質を改善

### イテレーション計画

- イテレーション 0: 環境の構築 ✅
- イテレーション 1: ゲーム開始の実装 ✅
- イテレーション 2: ぷよの移動の実装 ✅
- イテレーション 3: ぷよの回転の実装 ✅
- イテレーション 4: ぷよの自由落下の実装 ✅
- イテレーション 5: ぷよの高速落下の実装 ✅
- イテレーション 6: ぷよの消去の実装 ✅
- イテレーション 7: 連鎖反応の実装 ✅
- イテレーション 8: 全消しボーナスの実装 ✅
- イテレーション 9: ゲームオーバーの実装 ✅
- イテレーション 10: ゲーム再開の実装 ✅
- イテレーション 11: スコア計算の実装 ✅
- イテレーション 12: 次のぷよ表示の実装 ✅

## 実装済み機能

- ✅ ゲーム開始・再開
- ✅ ぷよの移動（左右）
- ✅ ぷよの回転
- ✅ ぷよの自由落下・高速落下
- ✅ ぷよの消去（4つ以上つながると消える）
- ✅ 連鎖反応
- ✅ スコア計算（基本スコア + 全消しボーナス）
- ✅ 次のぷよ表示
- ✅ ゲームオーバー判定

## 技術スタック

- **言語**: F#
- **UI フレームワーク**: Elmish.WPF (WPF + Elmish アーキテクチャ)
- **テストフレームワーク**: xUnit
- **アサーションライブラリ**: FsUnit
