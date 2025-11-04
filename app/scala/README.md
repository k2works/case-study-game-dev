# Scala + Apache Spark - Machine Learning with TDD

Apache Spark MLlib を使用した機械学習モデルのサンプルプロジェクト。TDD（Test-Driven Development）アプローチで実装しています。

## 概要

このプロジェクトでは、以下を実現します：

- **分類問題**: Apache Spark MLlib を使用した Decision Tree による Iris 分類
- **回帰問題**: Linear Regression による Cinema 興行収入予測
- **TDD**: ScalaTest を使用したテスト駆動開発
- **複数の実行方法**: CLI スクリプト、Jupyter Notebook、sbt による実行
- **クロスプラットフォーム**: Linux/Mac/Windows 対応（一部制限あり）

## 技術スタック

- **Scala**: 2.13.12
- **Apache Spark**: 3.5.0
- **sbt**: 1.9.7
- **Java**: 17 または 21 推奨 ⚠️ **Java 25 は現在非対応**
- **ScalaTest**: 3.2.17
- **Jupyter Kernel**: Almond (Scala 2.13)

## プロジェクト構成

```
app/scala/
├── build.sbt                          # ビルド定義
├── .sbtopts                           # sbt Java オプション設定
├── run-with-java21.ps1                # Java 21 で実行する PowerShell スクリプト
├── src/
│   ├── main/scala/ml/
│   │   ├── IrisClassifier.scala       # Chapter 4: 分類モデル
│   │   ├── TrainIris.scala            # Iris 訓練スクリプト
│   │   ├── CinemaPredictor.scala      # Chapter 5: 回帰モデル
│   │   └── TrainCinema.scala          # Cinema 訓練スクリプト
│   └── test/scala/ml/
│       ├── IrisClassifierSpec.scala   # Iris テスト
│       └── CinemaPredictorSpec.scala  # Cinema テスト
├── scripts/
│   ├── train_iris.scala               # 訓練用スタンドアロンスクリプト
│   ├── evaluate_iris.scala            # 評価用スタンドアロンスクリプト
│   └── README.md                      # スクリプト詳細
├── notebooks/
│   ├── iris_exploration.ipynb         # Jupyter Notebook
│   └── SETUP.md                       # Notebook セットアップガイド
├── data/
│   ├── iris.csv                       # Iris データセット
│   └── cinema.csv                     # Cinema データセット
└── README.md                          # このファイル
```

## セットアップ

### 前提条件

- **Java**: 17 または 21 を推奨 ⚠️ **Java 25 は現在非対応**
- **sbt**: 1.9.7 以上
- **Scala**: 2.13.12（sbt が自動管理）

### インストール

```bash
# プロジェクトディレクトリに移動
cd app/scala

# 依存関係をダウンロード
sbt update

# テストを実行して動作確認
sbt test
```

### ⚠️ Java 25 の制約について

**現在、Java 25 では実行できません。**

**理由**:
- Java 25 で `Subject.getSubject()` メソッドが削除された
- Apache Spark 3.5.0 が使用する Hadoop 3.3.4 がこのメソッドに依存している
- Apache Spark 4.0 で Java 25 対応予定（リリース時期未定）

**推奨環境**:
- Java 17（LTS）
- Java 21（LTS）

**Java バージョンの確認**:
```bash
java -version
```

**Java 21 への切り替え方法（Scoop 使用時）**:
```bash
# Java 21 に切り替え
scoop reset openjdk21

# バージョン確認（新しいターミナルで）
java -version

# または、PowerShell スクリプトで実行
cd app/scala
powershell -ExecutionPolicy Bypass -File run-with-java21.ps1
```

## 使用方法

### 1. sbt から実行（推奨）

#### Iris 分類モデル（Chapter 4）

```bash
# モデルの訓練と評価
sbt "runMain ml.TrainIris"

# テストの実行
sbt "testOnly ml.IrisClassifierSpec"
```

**出力例:**
```
=== Iris Classification Model Training ===

Loading data from data/iris.csv...
Loaded 150 records

Preparing features...
Prepared 148 records (null values skipped)

Splitting data into training and test sets...
Training set: 102 records
Test set: 46 records

Training model...
Model training completed

Evaluating model...
Test Accuracy: 97.83%

=== Training Completed ===
```

#### Cinema 回帰モデル（Chapter 5）

```bash
# モデルの訓練と評価
sbt "runMain ml.TrainCinema"

# テストの実行
sbt "testOnly ml.CinemaPredictorSpec"
```

**出力例:**
```
=== Cinema Revenue Prediction Model Training ===

Loading data from data/cinema.csv...
Loaded 200 records

Preparing features...
Prepared 200 records (null values skipped)

Splitting data into training and test sets...
Training set: 140 records
Test set: 60 records

Training model...
Model training completed

Evaluating model...
Test R² Score: 82.45%

=== Training Completed ===
```

### 2. Jupyter Notebook で探索

対話的にデータ探索とモデル訓練を行う場合：

```bash
# Jupyter Notebook を起動
jupyter notebook

# notebooks/iris_exploration.ipynb を開く
```

詳細なセットアップ手順は [notebooks/SETUP.md](notebooks/SETUP.md) を参照してください。

### 3. スタンドアロンスクリプト（Linux/Mac のみ）

```bash
# Scala CLI を使用
scala scripts/train_iris.scala [data_path] [model_path]
```

詳細は [scripts/README.md](scripts/README.md) を参照してください。

## テスト

```bash
# すべてのテストを実行
sbt test

# 特定のテストを実行
sbt "testOnly ml.IrisClassifierSpec"
sbt "testOnly ml.CinemaPredictorSpec"

# カバレッジ付きでテスト
sbt clean coverage test coverageReport
```

**Iris 分類モデルのテスト内容:**
- データ読み込みのテスト
- 特徴量準備のテスト
- データ分割のテスト
- モデル訓練のテスト
- 精度評価のテスト

**Cinema 回帰モデルのテスト内容:**
- データ読み込みのテスト
- ジャンルの OneHot エンコーディングのテスト
- 特徴量統合のテスト
- データ分割のテスト
- LinearRegression モデル訓練のテスト
- R² スコア評価のテスト

## OS ごとの違い

### Linux/Mac 環境

✅ **すべての機能が利用可能:**
- モデルの保存・読み込み
- すべてのスクリプトが実行可能
- Jupyter Notebook

### Windows 環境

⚠️ **一部制限あり:**
- ✅ モデルの訓練と評価は正常に動作
- ❌ モデルの永続化（保存・読み込み）は無効
- ✅ Jupyter Notebook は利用可能
- ⚠️ スタンドアロンスクリプトは非推奨（sbt を使用）

**理由**: Hadoop の `winutils.exe` に関する制約

**対処法**: モデルは約 10 秒で再訓練できるため、Windows では都度訓練する方式を採用

## トラブルシューティング

### IntelliJ IDEA で Java モジュールアクセスエラー

**エラー例**:
```
java.lang.IllegalAccessError: class org.apache.spark.storage.StorageUtils$ cannot access class sun.nio.ch.DirectBuffer
```

**原因**: IntelliJ IDEA が Java 17/21 のモジュールアクセス制限を適用している

**解決方法 1: Run Configuration に VM options を追加**

1. IntelliJ IDEA で Run → Edit Configurations を開く
2. 該当するテストの設定を選択
3. "Modify options" → "Add VM options" を選択
4. 以下の VM options を追加:

```
--add-exports=java.base/sun.nio.ch=ALL-UNNAMED
--add-opens=java.base/sun.nio.ch=ALL-UNNAMED
--add-opens=java.base/java.nio=ALL-UNNAMED
--add-opens=java.base/java.lang=ALL-UNNAMED
--add-opens=java.base/java.lang.invoke=ALL-UNNAMED
--add-opens=java.base/java.util=ALL-UNNAMED
--add-opens=java.base/java.lang.reflect=ALL-UNNAMED
--add-opens=java.base/java.net=ALL-UNNAMED
--add-opens=java.base/java.io=ALL-UNNAMED
--add-opens=java.base/javax.security.auth.x500=ALL-UNNAMED
--add-opens=java.base/javax.security.auth=ALL-UNNAMED
```

**解決方法 2: sbt から実行（推奨）**

sbt からの実行は自動的に適切な Java オプションが適用されます：

```bash
sbt test
# または PowerShell スクリプトで
powershell -ExecutionPolicy Bypass -File run-with-java21.ps1
```

### IntelliJ IDEA で "value should is not a member of String" エラー

これは IntelliJ のインデックス問題です。sbt からは正常に実行できます：

```bash
sbt test
```

### Jupyter Notebook で Spark が起動しない

Java 17 のモジュールアクセス制限が原因です。詳細は [notebooks/SETUP.md](notebooks/SETUP.md#31-java-17-モジュールアクセスの設定windows-のみ) を参照してください。

### Clojure との出力パス競合

IntelliJ で以下のエラーが出る場合：
```
Output path is shared between: Module 'ml-tdd-project' production, Module 'ml-tdd-project' tests
```

`.iml` ファイルのテスト出力パスを `target/test-classes` に変更してください。

## 参考資料

- [Apache Spark MLlib Documentation](https://spark.apache.org/docs/latest/ml-guide.html)
- [ScalaTest User Guide](https://www.scalatest.org/user_guide)
- [Almond - Scala Kernel for Jupyter](https://almond.sh/)
- [Iris Dataset](https://archive.ics.uci.edu/ml/datasets/iris)

## ライセンス

このプロジェクトは学習目的のサンプルコードです。

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まず Issue を開いて変更内容を議論してください。
