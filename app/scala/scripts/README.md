# Scala Scripts - Machine Learning

このディレクトリには、機械学習モデルを訓練・評価するためのスクリプトが含まれています。

- **Iris Classification** (Chapter 4): Decision Tree による分類モデル
- **Cinema Revenue Prediction** (Chapter 5): Linear Regression による回帰モデル
- **Survived Life Prediction** (Chapter 6): Logistic Regression による生存予測モデル

## スクリプト一覧

### 1. train_iris.scala

Irisデータセットを使用してDecision Treeモデルを訓練します。

**使用方法:**

```bash
# sbtから実行
cd app/scala
sbt "runMain ml.TrainIris"

# または、Scalaスクリプトとして実行（要: scala CLI）
scala scripts/train_iris.scala [data_path] [model_path]
```

**パラメータ:**
- `data_path` (オプション): データファイルのパス（デフォルト: `data/iris.csv`）
- `model_path` (オプション): モデルの保存先（デフォルト: `model/iris_model`）

**出力:**
- 訓練データとテストデータの件数
- テストセットでの精度（Accuracy）
- 保存されたモデル（Linux/Mac のみ）

**注意:**
- Windows 環境ではモデルの永続化が無効化されています（Hadoop の制約）
- Linux/Mac 環境では自動的にモデルが保存されます
- Windows では都度訓練する方式（約10秒で完了）

### 2. evaluate_iris.scala

保存済みの Iris モデルを評価します（Linux/Mac のみ）。

**使用方法:**

```bash
# Scalaスクリプトとして実行（Linux/Mac）
scala scripts/evaluate_iris.scala [model_path] [data_path]
```

**パラメータ:**
- `model_path` (オプション): モデルファイルのパス（デフォルト: `model/iris_model`）
- `data_path` (オプション): データファイルのパス（デフォルト: `data/iris.csv`）

**出力:**
- Accuracy（精度）
- Weighted Precision（適合率）
- Weighted Recall（再現率）
- F1 Score
- 予測結果のサンプル

**注意:** Windows 環境では使用できません。代わりに Jupyter Notebook（`notebooks/iris_exploration.ipynb`）を使用してください。

### 3. train_cinema.scala

Cinemaデータセットを使用してLinear Regressionモデルを訓練します。

**使用方法:**

```bash
# sbtから実行
cd app/scala
sbt "runMain ml.TrainCinema"

# または、Scalaスクリプトとして実行（要: scala CLI）
scala scripts/train_cinema.scala [data_path] [model_path]
```

**パラメータ:**
- `data_path` (オプション): データファイルのパス（デフォルト: `data/cinema.csv`）
- `model_path` (オプション): モデルの保存先（デフォルト: `model/cinema_model`）

**出力:**
- 訓練データとテストデータの件数
- テストセットでの R² スコア
- RMSE（Root Mean Squared Error）
- 保存されたモデル（Linux/Mac のみ）

**注意:**
- Windows 環境ではモデルの永続化が無効化されています（Hadoop の制約）
- Linux/Mac 環境では自動的にモデルが保存されます
- Windows では都度訓練する方式（約10秒で完了）

### 4. evaluate_cinema.scala

保存済みの Cinema モデルを評価します（Linux/Mac のみ）。

**使用方法:**

```bash
# Scalaスクリプトとして実行（Linux/Mac）
scala scripts/evaluate_cinema.scala [model_path] [data_path]
```

**パラメータ:**
- `model_path` (オプション): モデルファイルのパス（デフォルト: `model/cinema_model`）
- `data_path` (オプション): データファイルのパス（デフォルト: `data/cinema.csv`）

**出力:**
- R² Score（決定係数）
- RMSE（Root Mean Squared Error）
- MAE（Mean Absolute Error）
- 予測結果のサンプル

**注意:** Windows 環境では使用できません。代わりに Jupyter Notebook（`notebooks/cinema_exploration.ipynb`）を使用してください。

### 5. train_survived.scala

Survived データセットを使用して Logistic Regression モデルを訓練します。

**使用方法:**

```bash
# sbtから実行
cd app/scala
sbt "runMain ml.TrainSurvived"

# または、Scalaスクリプトとして実行（要: scala CLI）
scala scripts/train_survived.scala [data_path] [model_path]
```

**パラメータ:**
- `data_path` (オプション): データファイルのパス（デフォルト: `data/Survived.csv`）
- `model_path` (オプション): モデルの保存先（デフォルト: `model/survived_model`）

**出力:**
- 訓練データとテストデータの件数
- テストセットでの精度（Accuracy）
- 欠損値補完の統計
- クラスバランスの情報
- 保存されたモデル（Linux/Mac のみ）

**注意:**
- Windows 環境ではモデルの永続化が無効化されています（Hadoop の制約）
- Linux/Mac 環境では自動的にモデルが保存されます
- Windows では都度訓練する方式（約10秒で完了）

### 6. evaluate_survived.scala

保存済みの Survived モデルを評価します（Linux/Mac のみ）。

**使用方法:**

```bash
# Scalaスクリプトとして実行（Linux/Mac）
scala scripts/evaluate_survived.scala [model_path] [data_path]
```

**パラメータ:**
- `model_path` (オプション): モデルファイルのパス（デフォルト: `model/survived_model`）
- `data_path` (オプション): データファイルのパス（デフォルト: `data/Survived.csv`）

**出力:**
- Accuracy（精度）
- AUC（Area Under ROC Curve）
- Precision（適合率）
- Recall（再現率）
- F1 Score
- 予測結果のサンプル

**注意:** Windows 環境では使用できません。代わりに sbt から `sbt "runMain ml.TrainSurvived"` を実行してください。

## 実行例

### Iris 訓練

```bash
$ cd app/scala
$ sbt "runMain ml.TrainIris"
==================================================
Iris Classification Model Training
==================================================

Loading data from data/iris.csv...
Loaded 150 records

Preparing features...
Prepared 148 records (null values skipped)

Splitting data into training and test sets...
Training set: 102 records
Test set: 46 records

Training Decision Tree model...
Model training completed

Evaluating model on test set...
Test Accuracy: 97.83%

==================================================
Training Completed Successfully
==================================================
```

### Cinema 訓練

```bash
$ cd app/scala
$ sbt "runMain ml.TrainCinema"
==================================================
Cinema Revenue Prediction Model Training
==================================================

Loading data from data/cinema.csv...
Loaded 200 records

Encoding genre with OneHot encoding...
Genre encoding completed

Assembling features...
Assembled 200 records (null values skipped)

Splitting data into training and test sets...
Training set: 140 records
Test set: 60 records

Training Linear Regression model...
Model training completed

Evaluating model on test set...
Test R² Score: 82.45%
Test RMSE: 15234.56

==================================================
Training Completed Successfully
==================================================
```

### Survived 訓練

```bash
$ cd app/scala
$ sbt "runMain ml.TrainSurvived"
==================================================
Survived 生存予測モデル訓練
==================================================

データ読み込み中: data/Survived.csv
データ件数: 891

=== 欠損値の確認 ===
+-------+----+----+
|summary| age|fare|
+-------+----+----+
|  count| 714| 891|
+-------+----+----+

=== 欠損値補完中... ===
欠損値補完完了

=== クラスバランス ===
+--------+-----+
|survived|count|
+--------+-----+
|       0|  385|
|       1|  237|
+--------+-----+

=== モデル訓練中... ===
モデル訓練完了

=== モデル評価 ===
Accuracy: 81.20%

==================================================
訓練完了
==================================================
```


## 注意事項

### OS ごとの動作の違い

**Linux/Mac 環境:**
- ✅ モデルの保存・読み込みが可能
- ✅ `train_iris.scala`, `train_cinema.scala`, `train_survived.scala` でモデルが自動保存される
- ✅ `evaluate_iris.scala`, `evaluate_cinema.scala`, `evaluate_survived.scala` で保存済みモデルを評価可能

**Windows 環境:**
- ❌ モデルの保存・読み込みが無効化（Hadoop の `winutils.exe` 問題）
- ✅ モデルの訓練と評価は正常に動作（約10秒で完了）
- ⚠️ `evaluate_*.scala` は使用不可（代わりに sbt から `runMain` を使用）

### 必要な環境

- **Scala**: 2.13.12
- **Apache Spark**: 3.5.0
- **sbt**: 1.9.7
- **Java**: 17 以上

## トラブルシューティング

### "No given instance of type org.scalactic.source.Position" エラー

IntelliJ IDEAでこのエラーが表示される場合がありますが、sbtからは正常に実行できます。

```bash
# sbtから実行してください
sbt "runMain ml.TrainIris"
```

### "Hadoop bin directory does not exist" エラー

Windows環境でモデルの保存時に発生します。訓練と評価は正常に実行できます。

## 関連ファイル

### Iris Classification (Chapter 4)

- **Notebook**: `../notebooks/iris_exploration.ipynb` - Jupyter Notebookでのインタラクティブな探索
- **Tests**: `../src/test/scala/ml/IrisClassifierSpec.scala` - ユニットテスト
- **Main Code**: `../src/main/scala/ml/IrisClassifier.scala` - コアの実装
- **Training Script**: `../src/main/scala/ml/TrainIris.scala` - 訓練スクリプト

### Cinema Revenue Prediction (Chapter 5)

- **Notebook**: `../notebooks/cinema_exploration.ipynb` - Jupyter Notebookでのインタラクティブな探索
- **Tests**: `../src/test/scala/ml/CinemaPredictorSpec.scala` - ユニットテスト
- **Main Code**: `../src/main/scala/ml/CinemaPredictor.scala` - コアの実装
- **Training Script**: `../src/main/scala/ml/TrainCinema.scala` - 訓練スクリプト

### Survived Life Prediction (Chapter 6)

- **Notebook**: `../notebooks/survived_exploration.ipynb` - Jupyter Notebookでのインタラクティブな探索
- **Tests**: `../src/test/scala/ml/SurvivedClassifierSpec.scala` - ユニットテスト
- **Main Code**: `../src/main/scala/ml/SurvivedClassifier.scala` - コアの実装
- **Training Script**: `../src/main/scala/ml/TrainSurvived.scala` - 訓練スクリプト
