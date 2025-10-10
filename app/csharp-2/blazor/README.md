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
