# ぷよぷよゲーム (C# + Blazor WebAssembly 版)

テスト駆動開発で学ぶ C# と Blazor WebAssembly によるぷよぷよゲームの実装です。

## 環境構築

### 必要なツール

- .NET SDK 10.0 以上
- C# コンパイラ
- IDE (Visual Studio, Rider, VS Code など)

### プロジェクト構成

```
blazor/
├── PuyoPuyoTDD/           # メインプロジェクト (Blazor WebAssembly)
├── PuyoPuyoTDD.Tests/     # テストプロジェクト (xUnit)
├── PuyoPuyoTDD.sln        # ソリューションファイル
├── .editorconfig          # エディタ設定
└── .gitignore             # Git除外設定
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
dotnet run --project PuyoPuyoTDD/PuyoPuyoTDD.csproj
```

### Cake タスクランナー

このプロジェクトでは Cake を使用してビルド、テスト、品質チェックを自動化しています。

#### Cake のインストール

```bash
dotnet tool install -g Cake.Tool
```

#### 利用可能なタスク

- **Clean**: ビルド成果物とテスト結果をクリーンアップ
- **Restore**: NuGet パッケージを復元
- **Format**: コードをフォーマット
- **Build**: プロジェクトをビルド
- **Lint**: コードの Lint チェック（警告をエラーとして扱う）
- **Test**: テストを実行
- **Coverage**: カバレッジを測定してレポート生成
- **Quality**: すべての品質チェックを実行（デフォルト）
- **Run**: アプリケーションを実行
- **Watch**: ファイル監視と自動テスト実行
- **CI**: CI 環境で実行するタスク（Clean, Restore, Format, Lint, Test）

#### タスクの実行

```bash
# デフォルトタスク（Quality）を実行
dotnet cake

# 特定のタスクを実行
dotnet cake --target=Clean
dotnet cake --target=Format
dotnet cake --target=Build
dotnet cake --target=Lint
dotnet cake --target=Test
dotnet cake --target=Coverage

# すべての品質チェックを実行
dotnet cake --target=Quality

# アプリケーションを実行
dotnet cake --target=Run

# ファイル監視と自動テスト実行
dotnet cake --target=Watch

# CI 環境で実行
dotnet cake --target=CI
```

## 開発ガイドライン

このプロジェクトはテスト駆動開発 (TDD) に従って開発されています。

### TDD サイクル

1. **Red (赤)**: 失敗するテストを書く
2. **Green (緑)**: テストが通る最小限のコードを実装
3. **Refactor (リファクタリング)**: コードの品質を改善

### イテレーション計画

- イテレーション 0: 環境の構築 ✅
- イテレーション 1: ゲーム開始の実装 (予定)
- イテレーション 2: ぷよの移動の実装 (予定)
- イテレーション 3: ぷよの回転の実装 (予定)
- イテレーション 4: ぷよの自由落下の実装 (予定)
- イテレーション 5: ぷよの高速落下の実装 (予定)
- イテレーション 6: ぷよの消去の実装 (予定)
- イテレーション 7: 連鎖反応の実装 (予定)
- イテレーション 8: 全消しボーナスの実装 (予定)
- イテレーション 9: ゲームオーバーの実装 (予定)
- イテレーション 10: ゲーム再開の実装 (予定)
- イテレーション 11: スコア計算の実装 (予定)
- イテレーション 12: 次のぷよ表示の実装 (予定)

## 技術スタック

- **言語**: C#
- **UI フレームワーク**: Blazor WebAssembly
- **テストフレームワーク**: xUnit
- **テストライブラリ**: bUnit
- **静的コード解析**: Microsoft.CodeAnalysis.Analyzers, StyleCop.Analyzers
- **コードカバレッジ**: Coverlet
