# Scala + Apache Spark - Machine Learning with TDD

Apache Spark MLlib を使用した機械学習モデルのサンプルプロジェクト。TDD（Test-Driven Development）アプローチで実装しています。

## 概要

このプロジェクトでは、以下を実現します：

- **分類問題（基礎）**: Decision Tree による Iris 分類（Chapter 4）
- **回帰問題（基礎）**: Linear Regression による Cinema 興行収入予測（Chapter 5）
- **分類問題（実践）**: Logistic Regression による Survived 生存予測（Chapter 6）
- **回帰問題（高度）**: Linear Regression による Boston 住宅価格予測（Chapter 7）
- **REST API**: Akka HTTP による機械学習 API（Chapter 8）
- **TDD**: ScalaTest を使用したテスト駆動開発
- **複数の実行方法**: CLI スクリプト、Jupyter Notebook、sbt、REST API
- **クロスプラットフォーム**: Linux/Mac/Windows 対応（一部制限あり）

## 技術スタック

- **Scala**: 2.13.12
- **Apache Spark**: 3.5.0
- **sbt**: 1.9.7
- **Java**: 17 または 21 推奨 ⚠️ **Java 25 は現在非対応**
- **ScalaTest**: 3.2.17
- **Akka HTTP**: 10.5.3 (Chapter 8)
- **Circe**: 0.14.6 (Chapter 8)
- **Jupyter Kernel**: Almond (Scala 2.13)

## プロジェクト構成

```
app/scala/
├── build.sbt                          # ビルド定義
├── .sbtopts                           # sbt Java オプション設定
├── run-with-java21.ps1                # Java 21 で実行する PowerShell スクリプト
├── src/
│   ├── main/scala/
│   │   ├── ml/
│   │   │   ├── IrisClassifier.scala       # Chapter 4: 分類モデル（基礎）
│   │   │   ├── TrainIris.scala            # Iris 訓練スクリプト
│   │   │   ├── CinemaPredictor.scala      # Chapter 5: 回帰モデル（基礎）
│   │   │   ├── TrainCinema.scala          # Cinema 訓練スクリプト
│   │   │   ├── SurvivedClassifier.scala   # Chapter 6: 分類モデル（実践）
│   │   │   ├── TrainSurvived.scala        # Survived 訓練スクリプト
│   │   │   ├── BostonPredictor.scala      # Chapter 7: 回帰モデル（高度）
│   │   │   ├── TrainBoston.scala          # Boston 訓練スクリプト
│   │   │   └── api/                       # Chapter 8: REST API
│   │   │       ├── Models.scala           # リクエスト/レスポンスモデル
│   │   │       ├── ApiRoutes.scala        # HTTP ルーティング
│   │   │       ├── SparkSessionManager.scala  # Spark Session 管理
│   │   │       ├── domain/
│   │   │       │   └── ModelPredictor.scala   # モデル予測（Domain層）
│   │   │       └── service/
│   │   │           └── PredictionService.scala  # ビジネスロジック（Service層）
│   │   └── runServer.scala                # API サーバー起動
│   └── test/scala/ml/
│       ├── IrisClassifierSpec.scala   # Iris テスト
│       ├── CinemaPredictorSpec.scala  # Cinema テスト
│       ├── SurvivedClassifierSpec.scala  # Survived テスト
│       ├── BostonPredictorSpec.scala  # Boston テスト
│       └── api/
│           └── ModelsSpec.scala       # API モデルテスト
├── scripts/
│   ├── train_iris.scala               # Iris 訓練用スタンドアロンスクリプト
│   ├── evaluate_iris.scala            # Iris 評価用スタンドアロンスクリプト
│   ├── train_cinema.scala             # Cinema 訓練用スタンドアロンスクリプト
│   ├── evaluate_cinema.scala          # Cinema 評価用スタンドアロンスクリプト
│   ├── train_survived.scala           # Survived 訓練用スタンドアロンスクリプト
│   ├── evaluate_survived.scala        # Survived 評価用スタンドアロンスクリプト
│   └── README.md                      # スクリプト詳細
├── notebooks/
│   ├── iris_exploration.ipynb         # Iris Jupyter Notebook
│   ├── cinema_exploration.ipynb       # Cinema Jupyter Notebook
│   ├── survived_exploration.ipynb     # Survived Jupyter Notebook
│   └── SETUP.md                       # Notebook セットアップガイド
├── data/
│   ├── iris.csv                       # Iris データセット
│   ├── cinema.csv                     # Cinema データセット
│   ├── Survived.csv                   # Survived データセット
│   └── Boston.csv                     # Boston データセット
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

#### Survived 生存予測モデル（Chapter 6）

```bash
# モデルの訓練と評価
sbt "runMain ml.TrainSurvived"

# テストの実行
sbt "testOnly ml.SurvivedClassifierSpec"
```

**出力例:**
```
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

#### Boston 住宅価格予測モデル（Chapter 7）

```bash
# モデルの訓練と評価
sbt "runMain ml.TrainBoston"

# テストの実行
sbt "testOnly ml.BostonPredictorSpec"
```

### 2. ML API サーバーの起動（Chapter 8）

```bash
# API サーバーを起動
sbt "runMain runServer"
```

**出力例:**
```
==================================================
ML API Server Starting...
==================================================

✓ iris model loaded from model/iris_model
⚠ cinema model not found at model/cinema_model (skipping)
⚠ survived model not found at model/survived_model (skipping)
⚠ boston model not found at model/boston_model (skipping)

==================================================
Server online at http://localhost:8080/
==================================================

Available endpoints:
  GET  /api/health          - Health check
  POST /api/predict/iris    - Iris classification
  POST /api/predict/cinema  - Cinema revenue prediction
  POST /api/predict/survived - Survived prediction
  POST /api/predict/boston  - Boston price prediction

Press RETURN to stop...
```

**API の使用例（cURL）:**

```bash
# ヘルスチェック
curl http://localhost:8080/api/health

# Iris 予測
curl -X POST http://localhost:8080/api/predict/iris \
  -H "Content-Type: application/json" \
  -d '{"sepalLength": 5.1, "sepalWidth": 3.5, "petalLength": 1.4, "petalWidth": 0.2}'

# レスポンス例
{"prediction":"setosa"}

# Cinema 予測
curl -X POST http://localhost:8080/api/predict/cinema \
  -H "Content-Type: application/json" \
  -d '{"budget": 50000, "popularity": 85.5, "runtime": 120, "voteAverage": 7.5, "genre": "Action"}'

# Boston 予測
curl -X POST http://localhost:8080/api/predict/boston \
  -H "Content-Type: application/json" \
  -d '{"crim": 0.00632, "zn": 18.0, "indus": 2.31, "chas": 0, "nox": 0.538, "rm": 6.575, "age": 65.2, "dis": 4.09, "rad": 1, "tax": 296.0, "ptratio": 15.3, "b": 396.9, "lstat": 4.98}'
```

**注意**: Windows 環境ではモデルの永続化ができないため、API 起動前にモデルを訓練する必要があります（Linux/Mac のみ）。

### 3. Jupyter Notebook で探索

対話的にデータ探索とモデル訓練を行う場合：

```bash
# Jupyter Notebook を起動
jupyter notebook

# ノートブックを開く
# - notebooks/iris_exploration.ipynb (Iris 分類モデル)
# - notebooks/cinema_exploration.ipynb (Cinema 回帰モデル)
# - notebooks/survived_exploration.ipynb (Survived 生存予測モデル)
# - notebooks/boston_exploration.ipynb (Boston 住宅価格予測モデル)
```

詳細なセットアップ手順は [notebooks/SETUP.md](notebooks/SETUP.md) を参照してください。

### 4. スタンドアロンスクリプト（Linux/Mac のみ）

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
sbt "testOnly ml.SurvivedClassifierSpec"

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

**Survived 生存予測モデルのテスト内容:**
- データ読み込みのテスト
- Imputer による欠損値補完のテスト
- カテゴリカル変数エンコーディングのテスト
- 外れ値除去のテスト
- 特徴量統合のテスト
- データ分割のテスト
- LogisticRegression モデル訓練のテスト
- Accuracy 評価のテスト

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
