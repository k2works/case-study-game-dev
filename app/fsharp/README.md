# MlTddFSharp - F# による機械学習 TDD プロジェクト

テスト駆動開発（TDD）で作る F# 機械学習プロジェクトです。

## 📁 プロジェクト構造

```
MlTddFSharp/
├── MlTddFSharp/              # メインプロジェクト
│   ├── Domain/               # ドメインモデル
│   │   └── Types.fs          # データ型定義
│   ├── Data/                 # データ処理
│   │   └── DataLoader.fs     # CSV ローダー
│   ├── Ml/                   # 機械学習モデル
│   │   └── IrisClassifier.fs # Iris 分類器
│   └── Program.fs            # エントリポイント
├── MlTddFSharp.Tests/        # テストプロジェクト
│   ├── IrisClassifierTests.fs
│   └── Main.fs
├── data/                     # データセット
│   └── iris.csv
├── model/                    # 訓練済みモデル保存先
├── notebook/                 # Jupyter Notebook
│   └── 01_iris_exploration.ipynb
└── script/                   # F# スクリプト
```

## 🚀 セットアップ

### 必要な環境

- .NET SDK 9.0 以上
- F# 9.0

### プロジェクトのビルド

```bash
cd MlTddFSharp
dotnet restore
dotnet build
```

### テストの実行

```bash
cd MlTddFSharp.Tests
dotnet run
```

または

```bash
cd MlTddFSharp
dotnet test
```

## 📓 探索的データ分析

### F# Interactive（FSI）でスクリプトを実行

コマンドラインから F# スクリプトを直接実行できます：

```bash
# プロジェクトディレクトリから
cd app/fsharp
dotnet fsi script/iris_exploration.fsx
```

または、F# Interactive を起動してから：

```bash
dotnet fsi
> #load "script/iris_exploration.fsx";;
```

### 利用可能なスクリプト

- `script/iris_exploration.fsx` - Iris データセットの探索と分析
  - データの基本統計量
  - モデルの訓練と評価
  - 混同行列の表示
  - 予測例の実行

### Jupyter Notebook の使用

Jupyter をお使いの方は、.NET Interactive をインストールすることで Notebook 形式でも実行できます：

```bash
# .NET Interactive のインストール（初回のみ）
dotnet tool install -g Microsoft.dotnet-interactive

# Jupyter Kernel の登録
dotnet interactive jupyter install

# Jupyter Lab の起動
jupyter lab
```

ブラウザが自動的に開きます。`notebook/` ディレクトリから `.ipynb` ファイルを開いてください。

### 利用可能な Notebook

- `01_iris_exploration.ipynb` - Iris データセットの探索と視覚化

## 🧪 実装済み機能

### ✅ 完了

- **IrisClassifier**: Iris 分類モデル
  - CSV ファイルからデータ読み込み
  - 80/20 でデータ分割
  - 多クラス分類（SdcaMaximumEntropy）
  - 予測機能
  - Result 型によるエラーハンドリング

### 📋 TODO

- モデルの保存・読み込み機能
- さらなるリファクタリング

## 🔧 開発ツール

- **Expecto**: テストフレームワーク
- **Fantomas**: コードフォーマッター
- **ML.NET**: 機械学習フレームワーク
- **Plotly.NET**: データ視覚化（Notebook 用）

## 📚 学習内容

このプロジェクトでは以下のスキルを習得できます：

- **TDD (Test-Driven Development)**: Red-Green-Refactor サイクル
- **F# 関数型プログラミング**: Result 型、パイプライン演算子
- **ML.NET**: 機械学習パイプラインの構築
- **データ分析**: Jupyter Notebook での探索的分析

## 🌸 Iris 分類モデル

### データセット

- 150 サンプル
- 3 クラス: Setosa、Versicolor、Virginica
- 4 特徴量: SepalLength、SepalWidth、PetalLength、PetalWidth

### モデル性能

- 精度: 80% 以上
- アルゴリズム: SdcaMaximumEntropy（最大エントロピー法）

## 📝 ライセンス

MIT License
