# Scala Scripts - Iris Classification

このディレクトリには、Irisデータセットの機械学習モデルを訓練・評価するためのスクリプトが含まれています。

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
- 保存されたモデル（Windows環境では保存不可の場合あり）

### 2. evaluate_iris.scala

保存済みのIrisモデルを評価します。

**使用方法:**

```bash
# Scalaスクリプトとして実行
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

## 実行例

### 訓練

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

### 評価

```bash
$ scala scripts/evaluate_iris.scala
==================================================
Iris Model Evaluation
==================================================

Loading data from data/iris.csv...
Loaded 150 records

Preparing features...
Prepared 148 records

Loading model from model/iris_model...
Model loaded successfully

Making predictions...
Accuracy: 97.83%
Weighted Precision: 97.92%
Weighted Recall: 97.83%
F1 Score: 97.85%

Sample predictions:
[予測結果のテーブル表示]
```

## 注意事項

### Windows環境でのモデル保存

Windows環境では、Hadoopの`winutils.exe`が必要なため、モデルの保存・読み込みが失敗する場合があります。

**回避策:**
1. Linux/Mac環境で実行
2. WSL (Windows Subsystem for Linux) を使用
3. モデル保存機能を使用せず、訓練のみ実行

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

- **Notebook**: `../notebooks/iris_exploration.ipynb` - Jupyter Notebookでのインタラクティブな探索
- **Tests**: `../src/test/scala/ml/IrisClassifierSpec.scala` - ユニットテスト
- **Main Code**: `../src/main/scala/ml/` - コアの実装
