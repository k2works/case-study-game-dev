# MlTddFSharp - F# による機械学習 TDD プロジェクト

テスト駆動開発（TDD）で作る F# 機械学習プロジェクトです。

## 📁 プロジェクト構造

```
MlTddFSharp/
├── MlTddFSharp/              # メインプロジェクト
│   ├── Domain/               # ドメインモデル
│   │   └── Types.fs          # データ型定義（IrisData, CinemaData, SurvivedData, BostonData など）
│   ├── Data/                 # データ処理
│   │   └── DataLoader.fs     # CSV ローダー
│   ├── Ml/                   # 機械学習モデル
│   │   ├── IrisClassifier.fs      # Iris 分類器（多クラス分類）
│   │   ├── CinemaPredictor.fs     # Cinema 回帰モデル
│   │   ├── SurvivedPredictor.fs   # Survived 生存予測モデル（二値分類）
│   │   └── BostonPredictor.fs     # Boston 住宅価格予測モデル（高度な回帰）
│   └── Program.fs            # エントリポイント
├── MlTddFSharp.Tests/        # テストプロジェクト
│   ├── IrisClassifierTests.fs
│   ├── CinemaPredictorTests.fs
│   ├── SurvivedPredictorTests.fs
│   ├── BostonPredictorTests.fs
│   └── Main.fs
├── data/                     # データセット
│   ├── iris.csv
│   ├── cinema.csv
│   ├── Survived.csv
│   └── Boston.csv
├── model/                    # 訓練済みモデル保存先
├── notebook/                 # Jupyter Notebook
│   ├── 01_iris_exploration.ipynb
│   └── 02_cinema_exploration.ipynb
└── script/                   # F# スクリプト
    ├── iris_exploration.fsx
    ├── cinema_exploration.fsx
    ├── survived_exploration.fsx
    └── boston_exploration.fsx
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

- `script/cinema_exploration.fsx` - Cinema データセットの探索と分析
  - データの基本統計量
  - 欠損値の確認
  - 回帰モデルの訓練と評価
  - 実測値 vs 予測値の比較
  - 予測例の実行

- `script/survived_exploration.fsx` - Survived データセットの探索と分析
  - データの基本統計量とクラス分布
  - グループ別欠損値補完
  - 二値分類モデルの訓練と評価
  - 混同行列の表示
  - 予測例の実行

- `script/boston_exploration.fsx` - Boston データセットの探索と分析
  - データの基本統計量
  - 欠損値の確認と補完
  - 特徴量エンジニアリング（2 乗項 + 交互作用項）
  - データ標準化
  - 回帰モデルの訓練と評価
  - 実測値 vs 予測値の比較
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

- `notebook/01_iris_exploration.ipynb` - Iris データセットの探索と視覚化
- `notebook/02_cinema_exploration.ipynb` - Cinema データセットの探索と視覚化

## 🧪 実装済み機能

### ✅ 完了

- **IrisClassifier**: Iris 分類モデル（多クラス分類）
  - CSV ファイルからデータ読み込み
  - 80/20 でデータ分割
  - 多クラス分類（SdcaMaximumEntropy）
  - 予測機能
  - Result 型によるエラーハンドリング

- **CinemaPredictor**: Cinema 売上予測モデル（回帰）
  - CSV ファイルからデータ読み込み
  - 欠損値の補完（平均値で置換）
  - 回帰モデル（FastTree）
  - 予測機能
  - Result 型によるエラーハンドリング

- **SurvivedPredictor**: Survived 生存予測モデル（二値分類）
  - CSV ファイルからデータ読み込み
  - グループ別欠損値補完（Pclass と Survived でグループ化）
  - カテゴリカル変数のエンコーディング（Sex を OneHotEncoding）
  - 二値分類モデル（FastTree）
  - 予測機能
  - Result 型によるエラーハンドリング

- **BostonPredictor**: Boston 住宅価格予測モデル（高度な回帰）
  - CSV ファイルからデータ読み込み
  - 欠損値の補完（訓練データの平均値で置換）
  - 特徴量エンジニアリング（2 乗項 + 交互作用項で 3 個 → 7 個の特徴量）
  - データ標準化（NormalizeMinMax）
  - 回帰モデル（Sdca）
  - 予測機能（前処理パイプライン適用）
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

- 精度: 80% 以上（マクロ精度）
- アルゴリズム: SdcaMaximumEntropy（最大エントロピー法）

## 🎬 Cinema 売上予測モデル

### データセット

- 100 サンプル
- 目的変数: Sales（売上、万円）
- 4 特徴量: SNS1、SNS2、Actor（メディア露出）、Original（原作有無）

### モデル性能

- R^2（決定係数）: 約 64%
- 平均絶対誤差（MAE）: 約 391 万円
- アルゴリズム: FastTree（決定木ベースの回帰）

## 🚢 Survived 生存予測モデル

### データセット

- 891 サンプル（タイタニック乗客データ）
- 目的変数: Survived（生存 0/1）
- 特徴量: Pclass（客室クラス）、Sex（性別）、Age（年齢）
- クラス不均衡: 死亡 549 サンプル、生存 342 サンプル

### モデル性能

- 精度（Accuracy）: 約 78%
- AUC: 約 0.84
- F1 スコア: 約 0.71
- アルゴリズム: FastTree（決定木ベースの二値分類）
- 特徴: グループ別欠損値補完、カテゴリカルエンコーディング

## 🏠 Boston 住宅価格予測モデル

### データセット

- 506 サンプル（ボストン住宅データ）
- 目的変数: PRICE（住宅価格、$1000 単位）
- 基本特徴量: RM（平均部屋数）、LSTAT（低所得者の割合）、PTRATIO（教員 1 人当たりの児童生徒数）
- エンジニアリング後: 7 個の特徴量（元の 3 個 + 2 乗項 3 個 + 交互作用項 1 個）
- カテゴリカル変数: CRIME（犯罪率カテゴリ）

### モデル性能

- R²（決定係数）: 約 31%
- 平均絶対誤差（MAE）: 約 $6.7k
- 二乗平均平方根誤差（RMSE）: 約 $9.1k
- アルゴリズム: Sdca（確率的双対座標上昇法）
- 特徴: 特徴量エンジニアリング、データ標準化、欠損値補完

## 📝 ライセンス

MIT License
