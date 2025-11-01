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

**注意:** モデルの永続化機能は Windows の制約により削除されました。モデルは都度訓練する方式となっています（約10秒で完了）。

### 2. evaluate_iris.scala

**注意:** このスクリプトは保存されたモデルを読み込む前提のため、Windows 環境では使用できません。
代わりに Jupyter Notebook（`notebooks/iris_exploration.ipynb`）を使用してください。

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


## 注意事項

### Windows 環境での制限

Windows 環境では Hadoop の `winutils.exe` の問題により、モデルの保存・読み込みができません。

**現在の仕様:**
- モデルは都度訓練する方式（約10秒で完了）
- 永続化が必要な場合は WSL、Docker、または Linux/Mac 環境を使用

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
