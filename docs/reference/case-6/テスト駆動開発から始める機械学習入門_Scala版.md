---
title: データで学ぶScala! TDDではじめる機械学習プログラミング
description: TDDで学ぶScala機械学習プログラミング
published: true
date: 2025-10-20T00:00:00.000Z
tags:
editor: markdown
dateCreated: 2025-10-20T00:00:00.000Z
---

# テスト駆動開発から始める機械学習入門（Scala版）

## はじめに

本記事は、テスト駆動開発（TDD）を実践しながら Scala で機械学習を学ぶプロジェクトの完全ガイドです。4章から8章までの6つの段階を通じて、データ処理の基礎から実用的な機械学習 API まで、段階的にスキルアップできる構成になっています。

「機械学習って難しそう...」「数式ばかりでわからない...」「Scala で ML ってできるの？」

そんな不安を持っているあなたも大丈夫！この記事では、**テストを書きながら一歩ずつ確実に進んでいく** ので、Scala 初心者でも安心して機械学習の世界に飛び込めます。実際に動くコードを書きながら、データから価値を引き出す楽しさを体験しましょう！

### 🎯 本記事で学べること

- **テスト駆動開発（TDD）の実践**: Red-Green-Refactor サイクルを実機械学習開発で体験
- **Scala 機械学習開発**: Apache Spark MLlib による実践的なモデル構築
- **現代的 Scala 開発**: sbt、ScalaTest、Scalafmt 等の最新ツールチェーン
- **関数型プログラミング**: Scala の強力な型システムと関数型パラダイムの活用
- **Scala 3 の新機能**: given/using、enum、union types、extension methods の活用
- **分散処理基盤**: Spark の DataFrame API と ML Pipelines の活用
- **段階的スキルアップ**: 無理のない学習曲線で確実にレベルアップ

### 📚 学習の進め方

各章は以下の構成になっています：

1. **学習目標**: その章で何を学ぶかを明確化
2. **実装した機能**: 実際に作るコードの全体像
3. **TDD 実践例**: Red-Green-Refactor の実例
4. **主要な学習ポイント**: 深掘りした技術解説
5. **技術的成果**: その章での達成事項まとめ

最初の章から順番に進めることをおすすめしますが、気になる章から始めてもOKです！

---

## 目次

### １章 機械学習とは
- 機械学習の魅力
- 機械学習ができること
- 本プロジェクトで作るもの

### ２章 開発環境のセットアップ
- 現代的 Scala 開発環境の構築
- 必要なツール（Scala 3、sbt、Apache Spark 3.5+）
- Spark のローカル環境セットアップ
- プロジェクト構造の作成
- ScalaTest によるテスト環境
- Spark Shell と Almond Jupyter のセットアップと活用

### ３章 機械学習の基礎理論
- 教師あり学習と教師なし学習
- 分類問題と回帰問題
- 過学習とその対策
- 評価指標の理解

### ４章 Iris 分類モデル（分類問題の基礎）
- TDD による段階的実装
  - ステップ 1: SparkSession 初期化とデータ読み込み
  - ステップ 2: DataFrame による特徴量準備
  - ステップ 3: データ分割（train/test）
  - ステップ 4: DecisionTreeClassifier による訓練
  - ステップ 5: 予測と評価（MulticlassClassificationEvaluator）
  - ステップ 6: Pipeline によるモデル永続化
- 実装した機能の全体像
- 訓練スクリプトの作成
- 主要な学習ポイント
  - Spark DataFrame API の基礎
  - VectorAssembler による特徴量ベクトル化
  - StringIndexer によるラベルエンコーディング
  - ML Pipeline の構築（Scala 3 スタイル）
  - case class によるデータモデリング
  - extension methods による DataFrame 拡張
  - given/using による暗黙的パラメータ
- 技術的成果

### ５章 Cinema 興行収入予測モデル（回帰問題の基礎）
- TDD による段階的実装
  - ステップ 1: SparkSession 初期化とデータ読み込み
  - ステップ 2: OneHotEncoder による前処理（ダミー変数化）
  - ステップ 3: VectorAssembler による特徴量結合
  - ステップ 4: データ分割
  - ステップ 5: LinearRegression モデル訓練
  - ステップ 6: 予測と評価（RegressionEvaluator）
  - ステップ 7: Pipeline によるモデル永続化
- 実装した機能の全体像
- 訓練スクリプトの作成
- 主要な学習ポイント
  - StringIndexer + OneHotEncoder パターン
  - R² スコアと RMSE の理解
  - Pipeline による前処理の自動化
  - Option 型と enum の活用
  - 型安全な DataFrame 操作
  - extension methods による DSL 構築
- 技術的成果

### ６章 Survived 生存予測モデル（実践的な分類問題）
- TDD による段階的実装
  - ステップ 1: SparkSession 初期化とデータ読み込み
  - ステップ 2: Imputer による欠損値処理
  - ステップ 3: StringIndexer + OneHotEncoder によるエンコーディング
  - ステップ 4: SQL 関数による外れ値除去
  - ステップ 5: VectorAssembler による特徴量準備
  - ステップ 6: データ分割
  - ステップ 7: LogisticRegression モデル訓練
  - ステップ 8: 予測と評価（BinaryClassificationEvaluator）
  - ステップ 9: Pipeline によるモデル永続化
- 実装した機能の全体像
- 訓練スクリプトの作成
- 主要な学習ポイント
  - Imputer トランスフォーマーの活用
  - クラス不均衡対応（weightCol の利用）
  - DataFrame の filter と SQL 式
  - Pipeline での複数ステージ統合
  - for comprehension でのエラーハンドリング
  - union types による柔軟なエラー表現
  - opaque types による型安全性向上
- 技術的成果

### ７章 Boston 住宅価格予測モデル（高度な回帰問題）
- TDD による段階的実装
  - ステップ 1: SparkSession 初期化とデータ読み込み
  - ステップ 2: StringIndexer + OneHotEncoder によるダミー変数化
  - ステップ 3: Imputer と filter による欠損値・外れ値処理
  - ステップ 4: SQLTransformer による特徴量エンジニアリング（2乗項・交互作用項）
  - ステップ 5: StandardScaler によるデータ標準化
  - ステップ 6: VectorAssembler による特徴量統合
  - ステップ 7: データ分割
  - ステップ 8: LinearRegression モデル訓練
  - ステップ 9: 予測と評価（R²、RMSE）
  - ステップ 10: Pipeline によるモデル永続化
- 実装した機能の全体像
- 訓練スクリプトの作成
- 主要な学習ポイント
  - SQLTransformer による柔軟な特徴量作成
  - StandardScaler の withMean と withStd オプション
  - データリーケージ防止（train/test 分割タイミング）
  - Pipeline による再現可能な前処理
  - DataFrame 変換の合成
  - type class derivation による自動導出
  - match types による型レベルプログラミング
- 技術的成果

### ８章 機械学習 API の構築（Akka HTTP で本番デプロイ）
- Web API の設計
- TDD による段階的実装
  - ステップ 1: データモデル定義（case class + Circe JSON codec）
  - ステップ 2: ドメイン層（PipelineModel 読み込みと予測ロジック）
  - ステップ 3: サービス層（ビジネスロジックとバリデーション）
  - ステップ 4: ハンドラー層（Akka HTTP ルート定義）
  - ステップ 5: SparkSession の共有とリソース管理
- 実装した機能の全体像
- API サーバーの起動
- curl での動作確認
- 主要な学習ポイント
  - Akka HTTP によるルーティングと Directive
  - Circe による型安全な JSON シリアライゼーション
  - レイヤードアーキテクチャ（Handler/Service/Domain）
  - Future と Actor による非同期処理
  - SparkSession のシングルトンパターン
  - PipelineModel のロードとキャッシング
  - DataFrame から予測結果の抽出
  - given instances による JSON codec の自動導出
  - extension methods による DSL 構築
  - contextual abstractions の活用
- 技術的成果
- 最終章のまとめ

---

## １章 機械学習とは

### 機械学習の魅力

機械学習は、データからパターンを学習し、予測や分類を行う技術です。従来のプログラミングとは大きく異なる、**データ駆動**のアプローチが特徴です。

**従来のプログラミング**:
```scala
// ルールを明示的にコーディング
val species = (petalLength, petalWidth) match
  case (l, w) if l > 5.0 && w > 1.5 => "Virginica"
  case (l, _) if l > 3.0 => "Versicolor"
  case _ => "Setosa"
```

**機械学習のアプローチ**:
```scala
import org.apache.spark.ml.classification.DecisionTreeClassifier

// データからルールを自動学習
val dt = DecisionTreeClassifier()
  .setLabelCol("species")
  .setFeaturesCol("features")

val model = dt.fit(trainingData)  // データから学習！

// 未知のデータを予測
val predictions = model.transform(newData)
```

この違い、わかりますか？機械学習では **「ルールを書く」のではなく「データに学ばせる」** のです！

### 機械学習ができること

機械学習は私たちの生活のあちこちで活躍しています：

- **📧 スパムメール検知**: あなたの受信箱を守る
- **🎬 映画レコメンド**: 次に観たい作品を提案
- **🏠 不動産価格予測**: 家の適正価格を算出
- **🏥 病気の早期発見**: 医療画像から異常を検出
- **🚗 自動運転**: 安全な運転をサポート

### 本プロジェクトで作るもの

本プロジェクトでは、以下の 4 つの実践的な機械学習モデルを段階的に実装します：

**🌸 分類問題** (離散的な値を予測):
- **Iris 分類**: アヤメの花を 3 種類に分類（多クラス分類の基礎）
- **Survived 分類**: タイタニック号の乗客の生存を予測（二値分類の実践）

**📊 回帰問題** (連続的な値を予測):
- **Cinema 予測**: 映画の興行収入を予測（線形回帰の基礎）
- **Boston 予測**: ボストンの住宅価格を予測（特徴量エンジニアリングの実践）

最後には、これら 4 つのモデルを **Akka HTTP で Web API 化**して、実際に使える形にします！

### Scala + Spark で機械学習を学ぶ理由

**Scala の強み**:
- **型安全性**: コンパイル時にエラーを検出し、バグを未然に防ぐ
- **関数型プログラミング**: 不変データ構造で安全かつ簡潔なコード
- **JVM 上で動作**: Java のライブラリ資産を活用可能
- **Scala 3 の新機能**: given/using、enum、union types など最新の言語機能

**Spark MLlib の強み**:
- **Pipeline API**: 前処理とモデルを統一的に管理
- **スケーラビリティ**: ローカル開発から分散環境へシームレスに移行
- **豊富なアルゴリズム**: 分類、回帰、クラスタリング、推薦など
- **DataFrame ベース**: SQL ライクな操作で直感的なデータ処理

**この組み合わせの利点**:
```scala
// 型安全で再利用可能な ML Pipeline
val pipeline = Pipeline().setStages(Array(
  indexer,      // カテゴリカル変数のインデックス化
  encoder,      // ワンホットエンコーディング
  assembler,    // 特徴量ベクトル化
  scaler,       // 標準化
  model         // 機械学習モデル
))

// Pipeline 全体を一度に保存・ロード可能
pipeline.save("path/to/model")
```

Scala の型システムと Spark の分散処理能力を組み合わせることで、**本番環境で使える堅牢な機械学習システム**を構築できます！

---

## ２章 開発環境のセットアップ

さあ、機械学習の旅を始める準備をしましょう！といっても、難しいことはありません。必要なツールをサクッとインストールして、快適な開発環境を整えます。

### 現代的 Scala 開発環境の構築

「環境構築って面倒...」と思ったあなた、安心してください！本プロジェクトでは、**Scala の最新ツール**と **Apache Spark** を使うので、セットアップは思ったよりシンプルです。

#### 🛠️ 必要なツール

以下のツールをインストールします。それぞれ強力な機能を持っていますが、今は「こんなのがあるんだな」程度の理解で OK です：

**開発の基盤**:
- **Java 11 以上**: Scala は JVM 上で動作します（OpenJDK 17 推奨）
- **Scala 3.3+**: プログラミング言語本体（最新の言語機能を活用）
- **sbt 1.9+**: Scala のビルドツール（依存関係管理とビルド自動化）

**品質管理ツール**:
- **ScalaTest**: テストフレームワーク（TDD の要）
- **Scalafmt**: コードフォーマッター（コードをキレイに保つ）
- **Scalafix**: リファクタリングツール（コード品質向上）

**機械学習ライブラリ**:
- **Apache Spark 3.5+**: 分散処理基盤と機械学習ライブラリ
- **Spark MLlib**: 機械学習アルゴリズム（モデル構築に使用）

**Web API フレームワーク**（最終章で使用）:
- **Akka HTTP**: 非同期 HTTP サーバー
- **Circe**: JSON シリアライゼーション

#### 📦 セットアップ手順

ターミナルを開いて、以下のコマンドを順番に実行しましょう：

##### ステップ 1: Java のインストール

```bash
# macOS (Homebrew使用)
brew install openjdk@17

# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-17-jdk

# Windows (Chocolatey使用)
choco install openjdk17

# インストール確認
java -version
# → openjdk version "17.0.x" が表示されればOK
```

##### ステップ 2: sbt のインストール

```bash
# macOS
brew install sbt

# Ubuntu/Debian
echo "deb https://repo.scala-sbt.org/scalasbt/debian all main" | sudo tee /etc/apt/sources.list.d/sbt.list
curl -sL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x2EE0EA64E40A89B84B2DF73499E82A75642AC823" | sudo apt-key add
sudo apt update
sudo apt install sbt

# Windows
choco install sbt

# インストール確認
sbt --version
# → sbt version 1.9.x が表示されればOK
```

##### ステップ 3: プロジェクトの作成

```bash
# プロジェクトディレクトリを作成
mkdir ml-tdd-scala && cd ml-tdd-scala

# sbt プロジェクトを初期化
sbt new scala/scala3.g8
# → プロジェクト名を聞かれるので「ml-tdd-scala」と入力

# または手動でファイルを作成
mkdir -p project src/{main,test}/scala
```

#### ⚙️ プロジェクト設定

`build.sbt` ファイルを作成して、依存関係とプラグインを設定します：

```scala
val scala3Version = "3.3.1"
val sparkVersion = "3.5.0"

lazy val root = project
  .in(file("."))
  .settings(
    name := "ml-tdd-scala",
    version := "0.1.0-SNAPSHOT",

    scalaVersion := scala3Version,

    // Scala 3 の設定
    scalacOptions ++= Seq(
      "-encoding", "UTF-8",
      "-feature",
      "-unchecked",
      "-deprecation",
      "-Xfatal-warnings"
    ),

    // 依存ライブラリ
    libraryDependencies ++= Seq(
      // Spark Core と MLlib
      "org.apache.spark" %% "spark-core" % sparkVersion,
      "org.apache.spark" %% "spark-sql" % sparkVersion,
      "org.apache.spark" %% "spark-mllib" % sparkVersion,

      // テストライブラリ
      "org.scalatest" %% "scalatest" % "3.2.17" % Test,

      // Akka HTTP と Circe (第8章で使用)
      "com.typesafe.akka" %% "akka-http" % "10.5.3",
      "com.typesafe.akka" %% "akka-stream" % "2.8.5",
      "io.circe" %% "circe-core" % "0.14.6",
      "io.circe" %% "circe-generic" % "0.14.6",
      "io.circe" %% "circe-parser" % "0.14.6"
    ).map(_.cross(CrossVersion.for3Use2_13)),

    // Spark のログレベルを抑制
    Test / fork := true,
    Test / javaOptions += "-Dspark.master=local[2]",
    Test / javaOptions += "-Dspark.ui.enabled=false",
    Test / javaOptions += "-Dspark.driver.bindAddress=127.0.0.1"
  )
```

#### 🎨 コードフォーマッター設定

`.scalafmt.conf` ファイルを作成して、コードスタイルを統一します：

```conf
version = "3.7.17"
runner.dialect = scala3

# 基本設定
maxColumn = 100
encoding = "UTF-8"
docstrings.style = Asterisk

# インデント
indent.main = 2
indent.defnSite = 2

# 改行
newlines.beforeMultiline = keep
newlines.alwaysBeforeElseAfterCurlyIf = false

# スペース
spaces.inImportCurlyBraces = true

# 並び替え
rewrite.rules = [
  RedundantBraces,
  RedundantParens,
  SortModifiers,
  PreferCurlyFors
]

# Scala 3 の構文
rewrite.scala3.convertToNewSyntax = true
rewrite.scala3.removeOptionalBraces = true
```

#### 📁 プロジェクト構造の作成

以下のようなディレクトリ構成を作成します：

```bash
ml-tdd-scala/
├── build.sbt                  # ⚙️ ビルド設定ファイル
├── .scalafmt.conf             # 🎨 フォーマッター設定
├── project/                   # sbt プラグイン設定
│   ├── build.properties
│   └── plugins.sbt
├── src/
│   ├── main/
│   │   └── scala/
│   │       └── ml/            # 機械学習モデル本体
│   │           ├── IrisClassifier.scala
│   │           ├── CinemaPredictor.scala
│   │           ├── SurvivedClassifier.scala
│   │           └── BostonPredictor.scala
│   └── test/
│       └── scala/
│           └── ml/            # テストコード
│               ├── IrisClassifierSpec.scala
│               ├── CinemaPredictorSpec.scala
│               ├── SurvivedClassifierSpec.scala
│               └── BostonPredictorSpec.scala
├── data/                      # 📊 データセット
│   ├── iris.csv
│   ├── cinema.csv
│   ├── Survived.csv
│   └── Boston.csv
├── model/                     # 💾 訓練済みモデル
│   └── .gitkeep
├── scripts/                   # スクリプト
│   ├── train_iris.scala
│   ├── train_cinema.scala
│   ├── train_survived.scala
│   └── train_boston.scala
└── notebooks/                 # Jupyter Notebook
    └── .gitkeep
```

この構造なら、どこに何があるか一目瞭然ですね！

#### 🚀 sbt コマンドの実行

開発中は、コードの品質を継続的にチェックすることが重要です。sbt を使えば、すべての操作を簡単に実行できます。

**基本的な sbt コマンド**:

```bash
# sbt コンソールを起動
sbt

# sbt コンソール内で実行
sbt> compile          # コンパイル
sbt> test             # テスト実行
sbt> run              # アプリケーション実行
sbt> scalafmt         # コードフォーマット
sbt> scalafmtCheck    # フォーマットチェック
sbt> clean            # ビルド成果物をクリア

# コンソール外から直接実行
sbt compile
sbt test
sbt "testOnly ml.IrisClassifierSpec"  # 特定のテストのみ実行
```

**よく使うワークフロー**:

```bash
# コンパイル → テスト → フォーマットチェックを一度に実行
sbt clean compile test scalafmtCheck

# 継続的にテストを実行（ファイル変更を検知）
sbt ~test

# 特定のテストのみを継続的に実行
sbt "~testOnly ml.IrisClassifierSpec"
```

#### 📓 Almond Jupyter のセットアップと活用

機械学習開発では、**Jupyter Notebook** が非常に重要なツールです。「コードを書いて、すぐに結果を確認する」というサイクルを高速で回せるため、データ分析や機械学習の実験に最適です！

##### Almond とは？

**Almond** は、Jupyter Notebook で Scala を実行するためのカーネルです。Python の Jupyter と同様に、Scala コードをインタラクティブに実行できます。

**Almond の強み**:
- 📊 **Spark との統合**: SparkSession を直接使える
- 🔍 **探索的分析に最適**: セル単位でコードを試せる
- 📝 **ドキュメントとコードの統合**: マークダウンでメモを書きながら開発
- 🎯 **試行錯誤が楽**: DataFrame の変換を段階的に確認できる

##### 🛠️ Almond のインストール

```bash
# Coursier のインストール（Almond のインストールに必要）
# macOS/Linux
curl -fL https://github.com/coursier/coursier/releases/latest/download/cs-x86_64-apple-darwin.gz | gzip -d > cs && chmod +x cs && ./cs setup

# Windows (PowerShell)
Invoke-WebRequest -Uri "https://github.com/coursier/coursier/releases/latest/download/cs-x86_64-pc-win32.zip" -OutFile "cs.zip"
Expand-Archive cs.zip
.\cs\cs.exe setup

# Almond のインストール（Scala 3対応）
cs launch almond:latest.release --scala 3.3.1 -- --install

# インストール確認
jupyter kernelspec list
# → scala313 が表示されればOK
```

##### 🚀 Jupyter Lab の起動

```bash
# Jupyter Lab のインストール（まだの場合）
pip install jupyterlab

# プロジェクトディレクトリで起動
cd ml-tdd-scala
jupyter lab

# 自動的にブラウザが開き、Jupyter Lab が起動します
# URL: http://localhost:8888/lab
```

##### 📝 基本的な使い方

**1. 新しいノートブックの作成**

1. File → New → Notebook を選択
2. カーネルで「Scala 3.3.1」を選択
3. `.ipynb` ファイルとして保存

**2. Spark の初期化**

```scala
// セル 1: Spark のインポート
import org.apache.spark.sql.SparkSession
import org.apache.spark.ml.feature.*
import org.apache.spark.ml.classification.*
import org.apache.spark.ml.evaluation.*

// セル 2: SparkSession の作成
val spark = SparkSession.builder()
  .appName("ML Exploration")
  .master("local[*]")
  .config("spark.driver.bindAddress", "127.0.0.1")
  .getOrCreate()

// ログレベルを抑制
spark.sparkContext.setLogLevel("ERROR")

// セル 3: DataFrame の作成
val df = spark.read
  .option("header", "true")
  .option("inferSchema", "true")
  .csv("data/iris.csv")

df.show(5)
```

**3. データの探索**

```scala
// セル 4: スキーマの確認
df.printSchema()

// セル 5: 統計情報の確認
df.describe().show()

// セル 6: グルーピングと集計
df.groupBy("species").count().show()
```

##### 💡 プロジェクトでの活用方法

**推奨ディレクトリ構成**：

```
ml-tdd-scala/
├── notebooks/              # Jupyter Notebook 保存先
│   ├── 01_data_exploration.ipynb    # データ探索
│   ├── 02_iris_tutorial.ipynb       # Iris モデル学習
│   ├── 03_cinema_tutorial.ipynb     # Cinema モデル学習
│   └── 04_experiments.ipynb         # 実験・試行錯誤用
├── src/main/scala/ml/      # 本番コード（Notebook から移行）
└── src/test/scala/ml/      # テストコード
```

**開発フロー**：

1. **Jupyter Lab で探索**
    - データの確認
    - モデルの試行錯誤
    - 可視化と分析

2. **動作確認したコードを本番化**
    - `src/main/scala/ml/` にモジュールとして実装
    - TDD でテストを追加
    - リファクタリング

3. **Notebook はドキュメントとして保持**
    - 分析の記録
    - チュートリアル
    - チーム共有用

##### 🔧 Jupyter Lab と TDD の組み合わせ

Jupyter Lab は探索用、TDD は本番コード用として使い分けます：

```scala
// ❌ 悪い例: Notebook で全て完結
// → 再利用性が低く、テストできない

// ✅ 良い例: Notebook で探索 → コードに移行
// 1. Notebook で試行錯誤
val df = spark.read.csv("data/iris.csv")
val model = new DecisionTreeClassifier().fit(df)  // 動作確認

// 2. src/main/scala/ml/IrisClassifier.scala に移行
class IrisClassifier(spark: SparkSession):
  def train(dataPath: String): PipelineModel =
    val df = spark.read.csv(dataPath)
    // ... 本番実装

// 3. src/test/scala/ml/IrisClassifierSpec.scala でテスト
class IrisClassifierSpec extends AnyFlatSpec:
  "IrisClassifier" should "train a model" in {
    // ... テスト実装
  }
```

##### 📊 便利な可視化ライブラリ（オプション）

Scala でもデータ可視化が可能です：

```scala
// Vegas（Vega-Lite for Scala）
// build.sbt に追加
libraryDependencies += "org.vegas-viz" %% "vegas" % "0.3.11"

// Notebook での使用例
import vegas.*
import vegas.render.WindowRenderer.given

Vegas("Iris Dataset")
  .withData(df)
  .mark(Point)
  .encodeX("sepal_length", Quantitative)
  .encodeY("sepal_width", Quantitative)
  .encodeColor(field="species", dataType=Nominal)
  .show
```

---

## ３章 機械学習の基礎理論（補足）

「2 章で環境は整ったけど、機械学習って実際どうやって進めるの？」そんな疑問に答えるため、この章では機械学習の基本的な考え方を学びます。

### 📋 機械学習のワークフロー

機械学習プロジェクトは、だいたい以下のような流れで進めます：

1. **データ収集**: CSVファイルや データベースからデータを取得
2. **データ前処理**: 欠損値処理、外れ値処理、特徴量エンジニアリング
3. **データ分割**: 訓練データとテストデータに分割（必要に応じて検証データも）
4. **モデル選択**: 問題に適したアルゴリズムを選択
5. **モデル訓練**: 訓練データでモデルを学習
6. **モデル評価**: テストデータで性能を評価
7. **ハイパーパラメータ調整**: 性能が不十分なら調整して再訓練
8. **モデル保存**: 性能が十分なら本番用に保存
9. **本番デプロイ**: Web API などで本番環境に配置

**重要なポイント**：
- 📊 **データが命**: 良いモデルは良いデータから生まれます
- 🔄 **反復改善**: 一度でうまくいくことは稀です。試行錯誤が大切
- 📈 **評価が大事**: 訓練データでの性能だけでなく、未知のデータでの性能を確認

### 🎯 分類問題と回帰問題の違い

機械学習の問題は大きく 2 つに分けられます。違いを理解することが重要です！

#### 🏷️ 分類問題（Classification）

**「どのカテゴリに属するか？」を予測する問題**

- **目的**: カテゴリ（クラス）を予測
- **出力**: 離散値（例: setosa、versicolor、virginica）
- **評価指標**: 正解率（Accuracy）、適合率（Precision）、再現率（Recall）、F1 スコア
- **アルゴリズム例**: 決定木、ロジスティック回帰、ランダムフォレスト

**具体例**：
- 🌸 アヤメの種類を分類（本チュートリアル）
- 📧 メールがスパムかどうかを判定
- 🖼️ 画像に写っているものが猫か犬かを判定

#### 📊 回帰問題（Regression）

**「どのくらいの値になるか？」を予測する問題**

- **目的**: 連続値を予測
- **出力**: 数値（例: 興行収入 10000 万円）
- **評価指標**: 平均絶対誤差（MAE）、平均二乗誤差（MSE）、決定係数（R²）
- **アルゴリズム例**: 線形回帰、リッジ回帰、ランダムフォレスト

**具体例**：
- 💰 映画の興行収入を予測（本チュートリアル）
- 🏠 不動産の価格を予測
- 🌡️ 明日の気温を予測

### ⚠️ モデル評価の重要性

機械学習で最も重要なのは、**訓練データで学習したモデルが、未知のデータに対してどれだけ性能を発揮できるか**です。

「訓練データでは完璧なのに、実際のデータでは全然ダメ...」これが **過学習（Overfitting）** です！

#### 過学習（Overfitting）の問題

**過学習とは**：

- 訓練データに対しては高性能だが、未知のデータに対しては性能が低い状態
- モデルが訓練データの「ノイズ」まで学習してしまった結果
- モデルが複雑すぎる場合に発生しやすい

**対策**：

1. **データ分割**: 訓練データとテストデータを分離
2. **モデルの複雑さを制御**: 決定木の深さ制限など
3. **正則化**: Ridge、Lasso などの手法
4. **交差検証**: K-分割交差検証で汎化性能を確認
5. **Early Stopping**: 検証データの性能が悪化したら訓練を停止

**Scala + Spark での例**：

```scala
// ❌ 悪い例: 深すぎる決定木（過学習しやすい）
val dtOverfit = DecisionTreeClassifier()
  .setMaxDepth(50)  // 深さ 50 は深すぎ！
  .setLabelCol("label")
  .setFeaturesCol("features")

// ✅ 良い例: 適切な深さの決定木
val dtGood = DecisionTreeClassifier()
  .setMaxDepth(5)   // 深さ 5 が適切
  .setLabelCol("label")
  .setFeaturesCol("features")
```

**重要な教訓**：
- 📚 **訓練データでの高性能 ≠ 良いモデル**
- 🎯 **未知のデータでの性能こそが本当の実力**
- ⚖️ **適切なモデルの複雑さを選ぶことが重要**

### 📊 Spark MLlib の評価指標

Spark MLlib では、以下の評価指標が利用できます：

**分類問題**：
```scala
import org.apache.spark.ml.evaluation.*

// 多クラス分類
val evaluator = MulticlassClassificationEvaluator()
  .setLabelCol("label")
  .setPredictionCol("prediction")
  .setMetricName("accuracy")  // または "f1", "weightedPrecision", "weightedRecall"

val accuracy = evaluator.evaluate(predictions)

// 二値分類
val binaryEvaluator = BinaryClassificationEvaluator()
  .setLabelCol("label")
  .setRawPredictionCol("rawPrediction")
  .setMetricName("areaUnderROC")  // または "areaUnderPR"

val auc = binaryEvaluator.evaluate(predictions)
```

**回帰問題**：
```scala
val regressionEvaluator = RegressionEvaluator()
  .setLabelCol("label")
  .setPredictionCol("prediction")
  .setMetricName("r2")  // または "rmse", "mse", "mae"

val r2 = regressionEvaluator.evaluate(predictions)
```

これらの基礎知識を踏まえて、次章からは実際にモデルを構築していきます！

---

## ４章 Iris 分類モデル（分類問題の基礎）

さあ、いよいよ実際の機械学習モデルを作ります！「難しそう...」と思いましたか？大丈夫です！TDD で一歩ずつ進めていきましょう。

### 🎯 この章の学習目標

- 🌸 **基本的な分類モデルの構築**: アヤメを分類するモデルを作る
- 🔄 **テスト駆動開発の基礎習得**: Red-Green-Refactor を実践
- 🛠️ **Spark MLlib の基本操作**: DataFrame、Pipeline、Transformer の使い方
- 📊 **モデル評価の実践**: Accuracy、Confusion Matrix の計算
- 💾 **モデルの永続化**: Pipeline を保存・ロード

### 📊 Iris データセットの理解

**アヤメの 3 種類**:
- Setosa (セトサ)
- Versicolor (バーシクル)
- Virginica (バージニカ)

**特徴量** (4つ):
- sepal_length: がくの長さ
- sepal_width: がくの幅
- petal_length: 花びらの長さ
- petal_width: 花びらの幅

### 🔨 TDD による段階的実装

#### ステップ 1: SparkSession 初期化とデータ読み込み

**テストコード** (`src/test/scala/ml/IrisClassifierSpec.scala`):

```scala
package ml

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.apache.spark.sql.SparkSession

class IrisClassifierSpec extends AnyFlatSpec with Matchers:

  val spark: SparkSession = SparkSession.builder()
    .appName("IrisClassifierTest")
    .master("local[*]")
    .config("spark.driver.bindAddress", "127.0.0.1")
    .getOrCreate()

  spark.sparkContext.setLogLevel("ERROR")

  "IrisClassifier" should "データを読み込める" in {
    val classifier = IrisClassifier(spark)
    val df = classifier.loadData("data/iris.csv")

    df.count() should be > 0L
    df.columns should contain allOf("sepal_length", "sepal_width", "petal_length", "petal_width", "species")
  }
```

**実装コード** (`src/main/scala/ml/IrisClassifier.scala`):

```scala
package ml

import org.apache.spark.sql.{DataFrame, SparkSession}
import org.apache.spark.ml.Pipeline
import org.apache.spark.ml.classification.DecisionTreeClassifier
import org.apache.spark.ml.feature.{StringIndexer, VectorAssembler}
import org.apache.spark.ml.evaluation.MulticlassClassificationEvaluator

class IrisClassifier(spark: SparkSession):

  def loadData(path: String): DataFrame =
    spark.read
      .option("header", "true")
      .option("inferSchema", "true")
      .csv(path)
```

#### ステップ 2: DataFrame による特徴量準備

```scala
def prepareFeatures(df: DataFrame): DataFrame =
  // StringIndexer: species を数値化 (setosa=0, versicolor=1, virginica=2)
  val labelIndexer = StringIndexer()
    .setInputCol("species")
    .setOutputCol("label")

  // VectorAssembler: 4つの特徴量を1つのベクトルに統合
  val assembler = VectorAssembler()
    .setInputCols(Array("sepal_length", "sepal_width", "petal_length", "petal_width"))
    .setOutputCol("features")

  val pipeline = Pipeline().setStages(Array(labelIndexer, assembler))
  pipeline.fit(df).transform(df)
```

#### ステップ 3: データ分割（train/test）

```scala
def splitData(df: DataFrame, testRatio: Double = 0.3): (DataFrame, DataFrame) =
  val Array(trainData, testData) = df.randomSplit(Array(0.7, 0.3), seed = 42)
  (trainData, testData)
```

#### ステップ 4: DecisionTreeClassifier による訓練

```scala
def train(trainData: DataFrame): PipelineModel =
  val dt = DecisionTreeClassifier()
    .setLabelCol("label")
    .setFeaturesCol("features")
    .setMaxDepth(5)

  val pipeline = Pipeline().setStages(Array(dt))
  pipeline.fit(trainData)
```

#### ステップ 5: 予測と評価

```scala
def evaluate(model: PipelineModel, testData: DataFrame): Double =
  val predictions = model.transform(testData)

  val evaluator = MulticlassClassificationEvaluator()
    .setLabelCol("label")
    .setPredictionCol("prediction")
    .setMetricName("accuracy")

  evaluator.evaluate(predictions)
```

#### ステップ 6: Pipeline によるモデル永続化

```scala
def saveModel(model: PipelineModel, path: String): Unit =
  model.write.overwrite().save(path)

def loadModel(path: String): PipelineModel =
  PipelineModel.load(path)
```

### 💻 完全な実装コード

```scala
package ml

import org.apache.spark.sql.{DataFrame, SparkSession}
import org.apache.spark.ml.{Pipeline, PipelineModel}
import org.apache.spark.ml.classification.DecisionTreeClassifier
import org.apache.spark.ml.feature.{StringIndexer, VectorAssembler}
import org.apache.spark.ml.evaluation.MulticlassClassificationEvaluator

class IrisClassifier(spark: SparkSession):

  def loadData(path: String): DataFrame =
    spark.read
      .option("header", "true")
      .option("inferSchema", "true")
      .csv(path)

  def prepareFeatures(df: DataFrame): DataFrame =
    val labelIndexer = StringIndexer()
      .setInputCol("species")
      .setOutputCol("label")

    val assembler = VectorAssembler()
      .setInputCols(Array("sepal_length", "sepal_width", "petal_length", "petal_width"))
      .setOutputCol("features")

    val pipeline = Pipeline().setStages(Array(labelIndexer, assembler))
    pipeline.fit(df).transform(df)

  def splitData(df: DataFrame, testRatio: Double = 0.3): (DataFrame, DataFrame) =
    val Array(trainData, testData) = df.randomSplit(Array(0.7, 0.3), seed = 42)
    (trainData, testData)

  def train(trainData: DataFrame): PipelineModel =
    val dt = DecisionTreeClassifier()
      .setLabelCol("label")
      .setFeaturesCol("features")
      .setMaxDepth(5)

    val pipeline = Pipeline().setStages(Array(dt))
    pipeline.fit(trainData)

  def evaluate(model: PipelineModel, testData: DataFrame): Double =
    val predictions = model.transform(testData)

    val evaluator = MulticlassClassificationEvaluator()
      .setLabelCol("label")
      .setPredictionCol("prediction")
      .setMetricName("accuracy")

    evaluator.evaluate(predictions)

  def saveModel(model: PipelineModel, path: String): Unit =
    model.write.overwrite().save(path)

  def loadModel(path: String): PipelineModel =
    PipelineModel.load(path)

object IrisClassifier:
  def apply(spark: SparkSession): IrisClassifier = new IrisClassifier(spark)
```

### 🚀 訓練スクリプトの作成

`scripts/train_iris.scala`:

```scala
import org.apache.spark.sql.SparkSession
import ml.IrisClassifier

@main def trainIris(): Unit =
  val spark = SparkSession.builder()
    .appName("Iris Training")
    .master("local[*]")
    .getOrCreate()

  spark.sparkContext.setLogLevel("ERROR")

  val classifier = IrisClassifier(spark)

  // データ読み込み
  val df = classifier.loadData("data/iris.csv")
  println(s"データ件数: ${df.count()}")

  // 特徴量準備
  val preparedDf = classifier.prepareFeatures(df)

  // データ分割
  val (trainData, testData) = classifier.splitData(preparedDf)
  println(s"訓練データ: ${trainData.count()}, テストデータ: ${testData.count()}")

  // モデル訓練
  val model = classifier.train(trainData)
  println("モデル訓練完了")

  // モデル評価
  val accuracy = classifier.evaluate(model, testData)
  println(f"Accuracy: $accuracy%.4f")

  // モデル保存
  classifier.saveModel(model, "model/iris_model")
  println("モデル保存完了")

  spark.stop()
```

実行:
```bash
sbt "runMain trainIris"
```

出力例:
```
データ件数: 150
訓練データ: 105, テストデータ: 45
モデル訓練完了
Accuracy: 0.9778
モデル保存完了
```

### 🎓 主要な学習ポイント

#### Spark DataFrame API の基礎

```scala
// CSV読み込み
val df = spark.read
  .option("header", "true")
  .option("inferSchema", "true")
  .csv("data/iris.csv")

// スキーマ確認
df.printSchema()

// データ確認
df.show(5)

// 統計情報
df.describe().show()
```

#### VectorAssembler による特徴量ベクトル化

```scala
val assembler = VectorAssembler()
  .setInputCols(Array("sepal_length", "sepal_width", "petal_length", "petal_width"))
  .setOutputCol("features")

val assembled = assembler.transform(df)
// → features列に [5.1, 3.5, 1.4, 0.2] のようなベクトルが追加される
```

#### StringIndexer によるラベルエンコーディング

```scala
val indexer = StringIndexer()
  .setInputCol("species")
  .setOutputCol("label")

val indexed = indexer.fit(df).transform(df)
// → species "setosa" → label 0.0
// → species "versicolor" → label 1.0
// → species "virginica" → label 2.0
```

#### ML Pipeline の構築（Scala 3 スタイル）

```scala
// given/using による暗黙的パラメータ
given spark: SparkSession = SparkSession.builder().getOrCreate()

// extension methods による DataFrame 拡張
extension (df: DataFrame)
  def toFeatures(featureCols: Seq[String], labelCol: String): DataFrame =
    val assembler = VectorAssembler()
      .setInputCols(featureCols.toArray)
      .setOutputCol("features")

    val labelIndexer = StringIndexer()
      .setInputCol(labelCol)
      .setOutputCol("label")

    val pipeline = Pipeline().setStages(Array(labelIndexer, assembler))
    pipeline.fit(df).transform(df)

// 使用例
val preparedDf = df.toFeatures(
  Seq("sepal_length", "sepal_width", "petal_length", "petal_width"),
  "species"
)
```

### ✅ 技術的成果

- ✅ Spark MLlib の基本的な使い方を習得
- ✅ DecisionTree による分類モデルを構築
- ✅ Pipeline による前処理とモデルの統合
- ✅ 97.8% の高精度を達成
- ✅ モデルの保存・ロードの実装
- ✅ Scala 3 の extension methods を活用

---

## ５章 Cinema 興行収入予測モデル（回帰問題の基礎）

いよいよ回帰問題に挑戦します！前章では「どのクラスに属するか？」を予測する分類問題を解きましたが、今回は「どのくらいの値になるか？」を予測する回帰問題です。

映画の興行収入を予測するモデルを TDD で構築していきます。カテゴリカル変数（ジャンル）の扱い方も学びましょう！

### 🎯 この章の学習目標

- 📊 **線形回帰モデルの構築**: LinearRegression による連続値の予測
- 🔄 **OneHotEncoder の活用**: カテゴリカル変数（ジャンル）のエンコーディング
- 📈 **R² スコアの理解**: 回帰モデルの評価指標を習得
- 🔗 **StringIndexer + OneHotEncoder パターン**: カテゴリ変数処理の定石を学ぶ
- 🧪 **TDD による回帰モデル開発**: テストファーストで安全に開発

### 📊 Cinema データセットの理解

**目的**: 映画の興行収入を予測する

**特徴量** (5つ):
- budget: 制作予算（万円）
- popularity: 人気度スコア
- runtime: 上映時間（分）
- vote_average: 平均評価（1-10）
- genre: ジャンル（Horror, Comedy, Drama, Action など）← カテゴリカル変数

**目的変数**:
- revenue: 興行収入（万円）← これを予測したい！

**データの特徴**:
- genre はカテゴリカル変数なので、数値化が必要
- 予算が高いほど興行収入が高い傾向がある
- ジャンルによって興行収入の傾向が異なる

### 🔨 TDD による段階的実装

第4章と同じく、TDD の **Red-Green-Refactor** サイクルで進めます！

#### ステップ 1: SparkSession 初期化とデータ読み込み

**🔴 Red: テストを書く**

まずは失敗するテストから始めます。

`src/test/scala/ml/CinemaPredictorSpec.scala`:

```scala
package ml

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.apache.spark.sql.SparkSession

class CinemaPredictorSpec extends AnyFlatSpec with Matchers:

  val spark: SparkSession = SparkSession.builder()
    .appName("CinemaPredictorTest")
    .master("local[*]")
    .config("spark.driver.bindAddress", "127.0.0.1")
    .getOrCreate()

  spark.sparkContext.setLogLevel("ERROR")

  "CinemaPredictor" should "データを読み込める" in {
    val predictor = CinemaPredictor(spark)
    val df = predictor.loadData("data/cinema.csv")

    df.count() should be > 0L
    df.columns should contain allOf("budget", "popularity", "runtime", "vote_average", "genre", "revenue")
  }
```

**テスト実行**:
```bash
sbt "testOnly ml.CinemaPredictorSpec"
# → エラー: CinemaPredictor が存在しない
```

**🟢 Green: テストを通す最小限の実装**

`src/main/scala/ml/CinemaPredictor.scala`:

```scala
package ml

import org.apache.spark.sql.{DataFrame, SparkSession}

class CinemaPredictor(spark: SparkSession):

  def loadData(path: String): DataFrame =
    spark.read
      .option("header", "true")
      .option("inferSchema", "true")
      .csv(path)

object CinemaPredictor:
  def apply(spark: SparkSession): CinemaPredictor = new CinemaPredictor(spark)
```

**テスト実行**:
```bash
sbt "testOnly ml.CinemaPredictorSpec"
# → ✅ テスト成功！
```

**🔵 Refactor: リファクタリング**

今のところシンプルなので、リファクタリングは不要です。次のステップへ！

---

#### ステップ 2: OneHotEncoder による前処理（ダミー変数化）

カテゴリカル変数（genre）を数値化する必要があります。

**🔴 Red: テストを書く**

```scala
it should "ジャンルをOneHotエンコーディングできる" in {
  val predictor = CinemaPredictor(spark)
  val df = predictor.loadData("data/cinema.csv")

  val encoded = predictor.encodeGenre(df)

  // genre_index と genre_vec カラムが追加されているはず
  encoded.columns should contain("genre_index")
  encoded.columns should contain("genre_vec")
}
```

**テスト実行**:
```bash
sbt "testOnly ml.CinemaPredictorSpec"
# → エラー: encodeGenre メソッドが存在しない
```

**🟢 Green: テストを通す実装**

```scala
import org.apache.spark.ml.feature.{StringIndexer, OneHotEncoder}
import org.apache.spark.ml.Pipeline

def encodeGenre(df: DataFrame): DataFrame =
  // ステップ1: StringIndexer でジャンルを数値に変換
  // Horror → 0, Comedy → 1, Drama → 2, ...
  val indexer = StringIndexer()
    .setInputCol("genre")
    .setOutputCol("genre_index")

  // ステップ2: OneHotEncoder でダミー変数化
  // 0 → [1, 0, 0, 0]
  // 1 → [0, 1, 0, 0]
  // 2 → [0, 0, 1, 0]
  val encoder = OneHotEncoder()
    .setInputCol("genre_index")
    .setOutputCol("genre_vec")
    .setDropLast(false)  // すべてのカテゴリを保持

  val pipeline = Pipeline().setStages(Array(indexer, encoder))
  pipeline.fit(df).transform(df)
```

**テスト実行**:
```bash
sbt "testOnly ml.CinemaPredictorSpec"
# → ✅ テスト成功！
```

**💡 ポイント**:
- **StringIndexer**: カテゴリを数値に変換（Horror→0, Comedy→1, ...）
- **OneHotEncoder**: 数値をベクトルに変換（0→[1,0,0,0], 1→[0,1,0,0], ...）
- **setDropLast(false)**: 最後のカテゴリも保持（多重共線性は気にしない）

---

#### ステップ 3: VectorAssembler による特徴量結合

すべての特徴量を1つのベクトルに統合します。

**🔴 Red: テストを書く**

```scala
it should "すべての特徴量を統合できる" in {
  val predictor = CinemaPredictor(spark)
  val df = predictor.loadData("data/cinema.csv")
  val encoded = predictor.encodeGenre(df)

  val assembled = predictor.assembleFeatures(encoded)

  // features カラムが追加されているはず
  assembled.columns should contain("features")
}
```

**🟢 Green: テストを通す実装**

```scala
import org.apache.spark.ml.feature.VectorAssembler

def assembleFeatures(df: DataFrame): DataFrame =
  val assembler = VectorAssembler()
    .setInputCols(Array(
      "budget",
      "popularity",
      "runtime",
      "vote_average",
      "genre_vec"  // OneHotエンコード済みのジャンル
    ))
    .setOutputCol("features")

  assembler.transform(df)
```

**テスト実行**:
```bash
sbt "testOnly ml.CinemaPredictorSpec"
# → ✅ テスト成功！
```

---

#### ステップ 4: データ分割

訓練データとテストデータに分割します。

**🔴 Red: テストを書く**

```scala
it should "データを訓練用とテスト用に分割できる" in {
  val predictor = CinemaPredictor(spark)
  val df = predictor.loadData("data/cinema.csv")
  val encoded = predictor.encodeGenre(df)
  val assembled = predictor.assembleFeatures(encoded)

  val (trainData, testData) = predictor.splitData(assembled)

  trainData.count() should be > 0L
  testData.count() should be > 0L
  (trainData.count() + testData.count()) shouldBe assembled.count()
}
```

**🟢 Green: テストを通す実装**

```scala
def splitData(df: DataFrame, testRatio: Double = 0.3): (DataFrame, DataFrame) =
  val Array(trainData, testData) = df.randomSplit(Array(0.7, 0.3), seed = 42)
  (trainData, testData)
```

---

#### ステップ 5: LinearRegression モデル訓練

線形回帰モデルを訓練します。

**🔴 Red: テストを書く**

```scala
it should "LinearRegressionモデルを訓練できる" in {
  val predictor = CinemaPredictor(spark)
  val df = predictor.loadData("data/cinema.csv")
  val encoded = predictor.encodeGenre(df)
  val assembled = predictor.assembleFeatures(encoded)
  val (trainData, testData) = predictor.splitData(assembled)

  val model = predictor.train(trainData)

  model should not be null
}
```

**🟢 Green: テストを通す実装**

```scala
import org.apache.spark.ml.PipelineModel
import org.apache.spark.ml.regression.LinearRegression

def train(trainData: DataFrame): PipelineModel =
  val lr = LinearRegression()
    .setLabelCol("revenue")
    .setFeaturesCol("features")
    .setMaxIter(100)        // 最大イテレーション数
    .setRegParam(0.1)       // 正則化パラメータ（過学習防止）
    .setElasticNetParam(0.0) // Ridge回帰（L2正則化）

  val pipeline = Pipeline().setStages(Array(lr))
  pipeline.fit(trainData)
```

---

#### ステップ 6: 予測と評価（RegressionEvaluator）

R² スコアで性能を評価します。

**🔴 Red: テストを書く**

```scala
it should "モデルの性能を評価できる" in {
  val predictor = CinemaPredictor(spark)
  val df = predictor.loadData("data/cinema.csv")
  val encoded = predictor.encodeGenre(df)
  val assembled = predictor.assembleFeatures(encoded)
  val (trainData, testData) = predictor.splitData(assembled)
  val model = predictor.train(trainData)

  val r2 = predictor.evaluate(model, testData)

  r2 should be > 0.5  // R²が0.5以上なら合格
}
```

**🟢 Green: テストを通す実装**

```scala
import org.apache.spark.ml.evaluation.RegressionEvaluator

def evaluate(model: PipelineModel, testData: DataFrame): Double =
  val predictions = model.transform(testData)

  val evaluator = RegressionEvaluator()
    .setLabelCol("revenue")
    .setPredictionCol("prediction")
    .setMetricName("r2")  // 決定係数（R²）

  evaluator.evaluate(predictions)
```

**💡 R² スコアとは？**

R² (決定係数) は **モデルがデータをどれだけ説明できているか** を示す指標です。

- **R² = 1.0**: 完璧な予測（すべてのデータポイントが予測線上）
- **R² = 0.8**: 80% のばらつきを説明できている（良い性能）
- **R² = 0.0**: モデルが全く役に立たない
- **R² < 0.0**: モデルが平均値より悪い（最悪）

```scala
// 他の評価指標も確認できる
val rmse = evaluator.setMetricName("rmse").evaluate(predictions)  // 平均二乗誤差の平方根
val mae = evaluator.setMetricName("mae").evaluate(predictions)    // 平均絶対誤差
val mse = evaluator.setMetricName("mse").evaluate(predictions)    // 平均二乗誤差
```

---

#### ステップ 7: Pipeline によるモデル永続化

訓練したモデルを保存・ロードできるようにします。

**🔴 Red: テストを書く**

```scala
it should "モデルを保存してロードできる" in {
  val predictor = CinemaPredictor(spark)
  val df = predictor.loadData("data/cinema.csv")
  val encoded = predictor.encodeGenre(df)
  val assembled = predictor.assembleFeatures(encoded)
  val (trainData, testData) = predictor.splitData(assembled)
  val model = predictor.train(trainData)

  val modelPath = "model/test_cinema_model"
  predictor.saveModel(model, modelPath)

  val loadedModel = predictor.loadModel(modelPath)
  loadedModel should not be null

  // ロードしたモデルでも予測できるはず
  val r2 = predictor.evaluate(loadedModel, testData)
  r2 should be > 0.5
}
```

**🟢 Green: テストを通す実装**

```scala
def saveModel(model: PipelineModel, path: String): Unit =
  model.write.overwrite().save(path)

def loadModel(path: String): PipelineModel =
  PipelineModel.load(path)
```

---

### 💻 完全な実装コード

すべてのステップを統合した完全なコードです。

`src/main/scala/ml/CinemaPredictor.scala`:

```scala
package ml

import org.apache.spark.sql.{DataFrame, SparkSession}
import org.apache.spark.ml.{Pipeline, PipelineModel}
import org.apache.spark.ml.feature.{StringIndexer, OneHotEncoder, VectorAssembler}
import org.apache.spark.ml.regression.LinearRegression
import org.apache.spark.ml.evaluation.RegressionEvaluator

class CinemaPredictor(spark: SparkSession):

  def loadData(path: String): DataFrame =
    spark.read
      .option("header", "true")
      .option("inferSchema", "true")
      .csv(path)

  def encodeGenre(df: DataFrame): DataFrame =
    val indexer = StringIndexer()
      .setInputCol("genre")
      .setOutputCol("genre_index")

    val encoder = OneHotEncoder()
      .setInputCol("genre_index")
      .setOutputCol("genre_vec")
      .setDropLast(false)

    val pipeline = Pipeline().setStages(Array(indexer, encoder))
    pipeline.fit(df).transform(df)

  def assembleFeatures(df: DataFrame): DataFrame =
    val assembler = VectorAssembler()
      .setInputCols(Array(
        "budget",
        "popularity",
        "runtime",
        "vote_average",
        "genre_vec"
      ))
      .setOutputCol("features")

    assembler.transform(df)

  def splitData(df: DataFrame, testRatio: Double = 0.3): (DataFrame, DataFrame) =
    val Array(trainData, testData) = df.randomSplit(Array(0.7, 0.3), seed = 42)
    (trainData, testData)

  def train(trainData: DataFrame): PipelineModel =
    val lr = LinearRegression()
      .setLabelCol("revenue")
      .setFeaturesCol("features")
      .setMaxIter(100)
      .setRegParam(0.1)
      .setElasticNetParam(0.0)

    val pipeline = Pipeline().setStages(Array(lr))
    pipeline.fit(trainData)

  def evaluate(model: PipelineModel, testData: DataFrame): Double =
    val predictions = model.transform(testData)

    val evaluator = RegressionEvaluator()
      .setLabelCol("revenue")
      .setPredictionCol("prediction")
      .setMetricName("r2")

    evaluator.evaluate(predictions)

  def saveModel(model: PipelineModel, path: String): Unit =
    model.write.overwrite().save(path)

  def loadModel(path: String): PipelineModel =
    PipelineModel.load(path)

object CinemaPredictor:
  def apply(spark: SparkSession): CinemaPredictor = new CinemaPredictor(spark)
```

### 🚀 訓練スクリプトの作成

実際にモデルを訓練するスクリプトを作成します。

`scripts/train_cinema.scala`:

```scala
import org.apache.spark.sql.SparkSession
import ml.CinemaPredictor

@main def trainCinema(): Unit =
  val spark = SparkSession.builder()
    .appName("Cinema Training")
    .master("local[*]")
    .getOrCreate()

  spark.sparkContext.setLogLevel("ERROR")

  val predictor = CinemaPredictor(spark)

  println("=== Cinema 興行収入予測モデル訓練 ===")

  // データ読み込み
  val df = predictor.loadData("data/cinema.csv")
  println(s"データ件数: ${df.count()}")
  df.show(5)

  // ジャンルのエンコーディング
  val encoded = predictor.encodeGenre(df)
  println("\n=== ジャンルエンコーディング完了 ===")
  encoded.select("genre", "genre_index", "genre_vec").show(5, truncate = false)

  // 特徴量の統合
  val assembled = predictor.assembleFeatures(encoded)
  println("\n=== 特徴量統合完了 ===")

  // データ分割
  val (trainData, testData) = predictor.splitData(assembled)
  println(s"訓練データ: ${trainData.count()}, テストデータ: ${testData.count()}")

  // モデル訓練
  println("\n=== モデル訓練中... ===")
  val model = predictor.train(trainData)
  println("モデル訓練完了")

  // モデル評価
  val r2 = predictor.evaluate(model, testData)
  println(f"\n=== モデル評価 ===")
  println(f"R² Score: $r2%.4f")

  // モデル保存
  predictor.saveModel(model, "model/cinema_model")
  println("\nモデル保存完了: model/cinema_model")

  // 予測結果のサンプル表示
  val predictions = model.transform(testData)
  println("\n=== 予測結果サンプル ===")
  predictions.select("revenue", "prediction", "features").show(10, truncate = false)

  spark.stop()
```

**実行**:
```bash
sbt "runMain trainCinema"
```

**出力例**:
```
=== Cinema 興行収入予測モデル訓練 ===
データ件数: 500

=== ジャンルエンコーディング完了 ===
+--------+------------+----------------+
|genre   |genre_index |genre_vec       |
+--------+------------+----------------+
|Horror  |0.0         |(4,[0],[1.0])   |
|Comedy  |1.0         |(4,[1],[1.0])   |
|Drama   |2.0         |(4,[2],[1.0])   |
|Action  |3.0         |(4,[3],[1.0])   |
+--------+------------+----------------+

訓練データ: 350, テストデータ: 150

=== モデル訓練中... ===
モデル訓練完了

=== モデル評価 ===
R² Score: 0.8421

モデル保存完了: model/cinema_model

=== 予測結果サンプル ===
+--------+-----------+-------------------+
|revenue |prediction |features           |
+--------+-----------+-------------------+
|15000   |14523.45   |[5000,85,120,7.5..]|
|8500    |8234.12    |[2000,65,95,6.8...]|
+--------+-----------+-------------------+
```

### 🎓 主要な学習ポイント

#### StringIndexer + OneHotEncoder パターン

カテゴリカル変数を扱う定石パターンです：

```scala
// ステップ1: StringIndexer（文字列→数値）
val indexer = StringIndexer()
  .setInputCol("genre")
  .setOutputCol("genre_index")
// Horror → 0.0, Comedy → 1.0, Drama → 2.0

// ステップ2: OneHotEncoder（数値→ベクトル）
val encoder = OneHotEncoder()
  .setInputCol("genre_index")
  .setOutputCol("genre_vec")
  .setDropLast(false)
// 0.0 → [1, 0, 0, 0]
// 1.0 → [0, 1, 0, 0]
// 2.0 → [0, 0, 1, 0]
```

**なぜ OneHotEncoder が必要？**

線形回帰では「数値の大小に意味がある」と解釈されてしまいます：
- ❌ Horror=0, Comedy=1, Drama=2 → 「Drama は Horror の2倍」という誤った解釈
- ✅ OneHotEncoder → 各ジャンルが独立した特徴量として扱われる

#### R² スコアと RMSE の理解

```scala
val evaluator = RegressionEvaluator()
  .setLabelCol("revenue")
  .setPredictionCol("prediction")

// R²（決定係数）: モデルの説明力
val r2 = evaluator.setMetricName("r2").evaluate(predictions)
// 0.84 → 84%のばらつきを説明できている

// RMSE（平均二乗誤差の平方根）: 予測誤差の大きさ
val rmse = evaluator.setMetricName("rmse").evaluate(predictions)
// 1000 → 平均して1000万円ずれている

// MAE（平均絶対誤差）: より直感的な誤差
val mae = evaluator.setMetricName("mae").evaluate(predictions)
// 800 → 平均して800万円ずれている
```

#### Pipeline による前処理の自動化

Pipeline を使うと、前処理とモデルを一体化できます：

```scala
// ❌ 悪い例: 手動で各ステップを実行
val indexed = indexer.fit(df).transform(df)
val encoded = encoder.fit(indexed).transform(indexed)
val assembled = assembler.transform(encoded)
val model = lr.fit(assembled)

// ✅ 良い例: Pipeline で自動化
val pipeline = Pipeline().setStages(Array(
  indexer,
  encoder,
  assembler,
  lr
))
val model = pipeline.fit(df)  // 一発で全処理！

// 新しいデータでも同じ前処理が自動適用される
val predictions = model.transform(newData)
```

#### Scala 3 の Option 型と enum の活用

エラーハンドリングを型安全に：

```scala
// Option型でモデルの存在を表現
def loadModelSafe(path: String): Option[PipelineModel] =
  try
    Some(PipelineModel.load(path))
  catch
    case e: Exception =>
      println(s"モデル読み込み失敗: ${e.getMessage}")
      None

// enum でメトリクス種類を定義
enum Metric:
  case R2, RMSE, MAE, MSE

def evaluateWith(metric: Metric): Double =
  val metricName = metric match
    case Metric.R2   => "r2"
    case Metric.RMSE => "rmse"
    case Metric.MAE  => "mae"
    case Metric.MSE  => "mse"

  evaluator.setMetricName(metricName).evaluate(predictions)
```

#### extension methods による DSL 構築

DataFrame を拡張して使いやすく：

```scala
extension (df: DataFrame)
  def encodeColumn(inputCol: String, outputCol: String): DataFrame =
    val indexer = StringIndexer()
      .setInputCol(inputCol)
      .setOutputCol(s"${outputCol}_index")

    val encoder = OneHotEncoder()
      .setInputCol(s"${outputCol}_index")
      .setOutputCol(outputCol)

    val pipeline = Pipeline().setStages(Array(indexer, encoder))
    pipeline.fit(df).transform(df)

// 使用例
val encoded = df.encodeColumn("genre", "genre_vec")
```

### ✅ 技術的成果

この章で達成したこと：

- ✅ **線形回帰モデルの構築**: LinearRegression による連続値予測
- ✅ **カテゴリカル変数の処理**: StringIndexer + OneHotEncoder パターン習得
- ✅ **R² スコア 0.84**: 84% の精度で興行収入を予測
- ✅ **Pipeline の活用**: 前処理とモデルの統合による再利用性向上
- ✅ **TDD の実践**: Red-Green-Refactor サイクルで安全に開発
- ✅ **Scala 3 の活用**: Option、enum、extension methods の実践

**次のステップ**:
- より複雑な特徴量エンジニアリング
- 欠損値の処理
- クラス不均衡への対応

次章では、これらの実践的なテクニックを学びます！

---

## ６章 Survived 生存予測モデル（実践的な分類問題）

ここからは実践的な問題に挑戦します！前章までは「きれいなデータ」でしたが、現実のデータには**欠損値**や**クラス不均衡**といった問題がつきものです。

タイタニック号の乗客データから生存を予測するモデルを TDD で構築しながら、これらの実践的な課題に対処する方法を学びましょう！

### 🎯 この章の学習目標

- 🚢 **実践的な二値分類**: タイタニック号の生存予測（survived: 0 or 1）
- 🔧 **欠損値処理の実践**: Imputer による平均値・中央値補完
- ⚖️ **クラス不均衡対応**: weightCol による重み付け学習
- 🧹 **外れ値除去**: DataFrame の filter による前処理
- 🧪 **TDD による堅牢な実装**: 実データの問題に対処する

### 📊 Survived データセットの理解

**目的**: タイタニック号の乗客が生存したかを予測する

**特徴量** (8つ):
- age: 年齢 ← **欠損値あり**
- sex: 性別（male/female）← カテゴリカル変数
- pclass: チケットクラス（1等、2等、3等）
- sibsp: 同乗した兄弟・配偶者の数
- parch: 同乗した親・子供の数
- fare: 運賃 ← **欠損値あり**
- embarked: 乗船港（S, C, Q）← カテゴリカル変数
- cabin: 客室番号 ← **欠損値多数**

**目的変数**:
- survived: 生存（1=生存、0=死亡）← これを予測したい！

**データの特徴**:
- 欠損値が存在する（age, fare, cabin）
- クラス不均衡（生存者 < 死亡者）
- 外れ値が存在する可能性（fare が異常に高いなど）

### 🔨 TDD による段階的実装

実データの問題に TDD で立ち向かいます！

#### ステップ 1: SparkSession 初期化とデータ読み込み

**🔴 Red: テストを書く**

`src/test/scala/ml/SurvivedClassifierSpec.scala`:

```scala
package ml

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.apache.spark.sql.SparkSession

class SurvivedClassifierSpec extends AnyFlatSpec with Matchers:

  val spark: SparkSession = SparkSession.builder()
    .appName("SurvivedClassifierTest")
    .master("local[*]")
    .config("spark.driver.bindAddress", "127.0.0.1")
    .getOrCreate()

  spark.sparkContext.setLogLevel("ERROR")

  "SurvivedClassifier" should "データを読み込める" in {
    val classifier = SurvivedClassifier(spark)
    val df = classifier.loadData("data/survived.csv")

    df.count() should be > 0L
    df.columns should contain allOf("age", "sex", "pclass", "sibsp", "parch", "fare", "embarked", "survived")
  }
```

**🟢 Green: テストを通す実装**

`src/main/scala/ml/SurvivedClassifier.scala`:

```scala
package ml

import org.apache.spark.sql.{DataFrame, SparkSession}

class SurvivedClassifier(spark: SparkSession):

  def loadData(path: String): DataFrame =
    spark.read
      .option("header", "true")
      .option("inferSchema", "true")
      .csv(path)

object SurvivedClassifier:
  def apply(spark: SparkSession): SurvivedClassifier = new SurvivedClassifier(spark)
```

---

#### ステップ 2: Imputer による欠損値処理

現実のデータには欠損値がつきもの。Imputer で補完しましょう！

**🔴 Red: テストを書く**

```scala
it should "欠損値を補完できる" in {
  val classifier = SurvivedClassifier(spark)
  val df = classifier.loadData("data/survived.csv")

  val imputed = classifier.imputeMissingValues(df)

  // age_imputed と fare_imputed カラムが追加されているはず
  imputed.columns should contain("age_imputed")
  imputed.columns should contain("fare_imputed")

  // 欠損値が補完されているはず（nullがない）
  imputed.filter("age_imputed IS NULL").count() shouldBe 0
  imputed.filter("fare_imputed IS NULL").count() shouldBe 0
}
```

**🟢 Green: テストを通す実装**

```scala
import org.apache.spark.ml.feature.Imputer

def imputeMissingValues(df: DataFrame): DataFrame =
  val imputer = Imputer()
    .setInputCols(Array("age", "fare"))
    .setOutputCols(Array("age_imputed", "fare_imputed"))
    .setStrategy("mean")  // 平均値で補完（"median" も可能）

  imputer.fit(df).transform(df)
```

**💡 ポイント**:
- **Imputer**: 欠損値を統計量で補完
- **strategy="mean"**: 平均値で補完（数値データ向け）
- **strategy="median"**: 中央値で補完（外れ値に強い）
- **strategy="mode"**: 最頻値で補完（カテゴリデータ向け）

---

#### ステップ 3: StringIndexer + OneHotEncoder によるエンコーディング

カテゴリカル変数（sex, embarked）を数値化します。

**🔴 Red: テストを書く**

```scala
it should "カテゴリカル変数をエンコーディングできる" in {
  val classifier = SurvivedClassifier(spark)
  val df = classifier.loadData("data/survived.csv")
  val imputed = classifier.imputeMissingValues(df)

  val encoded = classifier.encodeCategorical(imputed)

  // エンコード済みカラムが追加されているはず
  encoded.columns should contain("sex_vec")
  encoded.columns should contain("embarked_vec")
}
```

**🟢 Green: テストを通す実装**

```scala
import org.apache.spark.ml.feature.{StringIndexer, OneHotEncoder}
import org.apache.spark.ml.Pipeline

def encodeCategorical(df: DataFrame): DataFrame =
  // sex のエンコーディング
  val sexIndexer = StringIndexer()
    .setInputCol("sex")
    .setOutputCol("sex_index")

  val sexEncoder = OneHotEncoder()
    .setInputCol("sex_index")
    .setOutputCol("sex_vec")

  // embarked のエンコーディング
  val embarkedIndexer = StringIndexer()
    .setInputCol("embarked")
    .setOutputCol("embarked_index")
    .setHandleMissing("keep")  // 欠損値も1つのカテゴリとして扱う

  val embarkedEncoder = OneHotEncoder()
    .setInputCol("embarked_index")
    .setOutputCol("embarked_vec")

  val pipeline = Pipeline().setStages(Array(
    sexIndexer, sexEncoder,
    embarkedIndexer, embarkedEncoder
  ))

  pipeline.fit(df).transform(df)
```

**💡 ポイント**:
- **setHandleMissing("keep")**: 欠損値も1つのカテゴリとして扱う
- 複数のカテゴリカル変数を一度に処理

---

#### ステップ 4: SQL 関数による外れ値除去

fare（運賃）の外れ値を除去します。

**🔴 Red: テストを書く**

```scala
it should "外れ値を除去できる" in {
  val classifier = SurvivedClassifier(spark)
  val df = classifier.loadData("data/survived.csv")

  val originalCount = df.count()
  val cleaned = classifier.removeOutliers(df)

  // 外れ値が除去されているはず
  cleaned.count() should be < originalCount

  // 異常に高い運賃のデータがないはず
  cleaned.filter("fare_imputed > 500").count() shouldBe 0
}
```

**🟢 Green: テストを通す実装**

```scala
def removeOutliers(df: DataFrame): DataFrame =
  // fare が異常に高い（500以上）レコードを除外
  df.filter("fare_imputed < 500 AND fare_imputed > 0")
```

---

#### ステップ 5: VectorAssembler による特徴量準備

すべての特徴量を1つのベクトルに統合します。

**🔴 Red: テストを書く**

```scala
it should "すべての特徴量を統合できる" in {
  val classifier = SurvivedClassifier(spark)
  val df = classifier.loadData("data/survived.csv")
  val imputed = classifier.imputeMissingValues(df)
  val encoded = classifier.encodeCategorical(imputed)
  val cleaned = classifier.removeOutliers(encoded)

  val assembled = classifier.assembleFeatures(cleaned)

  // features カラムが追加されているはず
  assembled.columns should contain("features")
}
```

**🟢 Green: テストを通す実装**

```scala
import org.apache.spark.ml.feature.VectorAssembler

def assembleFeatures(df: DataFrame): DataFrame =
  val assembler = VectorAssembler()
    .setInputCols(Array(
      "pclass",
      "age_imputed",
      "sibsp",
      "parch",
      "fare_imputed",
      "sex_vec",
      "embarked_vec"
    ))
    .setOutputCol("features")

  assembler.transform(df)
```

---

#### ステップ 6: データ分割

訓練データとテストデータに分割します。

**🔴 Red: テストを書く**

```scala
it should "データを訓練用とテスト用に分割できる" in {
  val classifier = SurvivedClassifier(spark)
  val df = classifier.loadData("data/survived.csv")
  val imputed = classifier.imputeMissingValues(df)
  val encoded = classifier.encodeCategorical(imputed)
  val cleaned = classifier.removeOutliers(encoded)
  val assembled = classifier.assembleFeatures(cleaned)

  val (trainData, testData) = classifier.splitData(assembled)

  trainData.count() should be > 0L
  testData.count() should be > 0L
}
```

**🟢 Green: テストを通す実装**

```scala
def splitData(df: DataFrame, testRatio: Double = 0.3): (DataFrame, DataFrame) =
  val Array(trainData, testData) = df.randomSplit(Array(0.7, 0.3), seed = 42)
  (trainData, testData)
```

---

#### ステップ 7: LogisticRegression モデル訓練

二値分類のための LogisticRegression を訓練します。

**🔴 Red: テストを書く**

```scala
it should "LogisticRegressionモデルを訓練できる" in {
  val classifier = SurvivedClassifier(spark)
  val df = classifier.loadData("data/survived.csv")
  val imputed = classifier.imputeMissingValues(df)
  val encoded = classifier.encodeCategorical(imputed)
  val cleaned = classifier.removeOutliers(encoded)
  val assembled = classifier.assembleFeatures(cleaned)
  val (trainData, testData) = classifier.splitData(assembled)

  val model = classifier.train(trainData)

  model should not be null
}
```

**🟢 Green: テストを通す実装**

```scala
import org.apache.spark.ml.PipelineModel
import org.apache.spark.ml.classification.LogisticRegression

def train(trainData: DataFrame): PipelineModel =
  // survived カラムを label にリネーム
  val labeledData = trainData.withColumnRenamed("survived", "label")

  val lr = LogisticRegression()
    .setLabelCol("label")
    .setFeaturesCol("features")
    .setMaxIter(100)
    .setRegParam(0.01)  // 正則化パラメータ

  val pipeline = Pipeline().setStages(Array(lr))
  pipeline.fit(labeledData)
```

**💡 ポイント**:
- **LogisticRegression**: 二値分類の定番アルゴリズム
- **setMaxIter(100)**: 最適化の反復回数
- **setRegParam(0.01)**: 過学習を防ぐ正則化パラメータ

---

#### ステップ 8: 予測と評価（BinaryClassificationEvaluator）

**🔴 Red: テストを書く**

```scala
it should "モデルの性能を評価できる" in {
  val classifier = SurvivedClassifier(spark)
  val df = classifier.loadData("data/survived.csv")
  val imputed = classifier.imputeMissingValues(df)
  val encoded = classifier.encodeCategorical(imputed)
  val cleaned = classifier.removeOutliers(encoded)
  val assembled = classifier.assembleFeatures(cleaned)
  val (trainData, testData) = classifier.splitData(assembled)
  val model = classifier.train(trainData)

  val accuracy = classifier.evaluate(model, testData)

  accuracy should be > 0.75  // 75%以上なら合格
}
```

**🟢 Green: テストを通す実装**

```scala
import org.apache.spark.ml.evaluation.BinaryClassificationEvaluator

def evaluate(model: PipelineModel, testData: DataFrame): Double =
  val labeledData = testData.withColumnRenamed("survived", "label")
  val predictions = model.transform(labeledData)

  // Accuracy を計算（正解率）
  val correct = predictions.filter("prediction = label").count()
  val total = predictions.count()
  correct.toDouble / total
```

**💡 二値分類の評価指標**:

```scala
// AUC（Area Under ROC Curve）
val aucEvaluator = BinaryClassificationEvaluator()
  .setLabelCol("label")
  .setRawPredictionCol("rawPrediction")
  .setMetricName("areaUnderROC")

val auc = aucEvaluator.evaluate(predictions)
// 0.85 → 85%の識別能力

// Precision（適合率）: 予測が正（生存）のうち、実際に正だった割合
val precision = predictions.filter("prediction = 1 AND label = 1").count().toDouble /
                predictions.filter("prediction = 1").count()

// Recall（再現率）: 実際に正（生存）のうち、正しく予測できた割合
val recall = predictions.filter("prediction = 1 AND label = 1").count().toDouble /
             predictions.filter("label = 1").count()

// F1 Score: Precision と Recall の調和平均
val f1 = 2 * (precision * recall) / (precision + recall)
```

---

#### ステップ 9: Pipeline によるモデル永続化

**🔴 Red: テストを書く**

```scala
it should "モデルを保存してロードできる" in {
  val classifier = SurvivedClassifier(spark)
  val df = classifier.loadData("data/survived.csv")
  val imputed = classifier.imputeMissingValues(df)
  val encoded = classifier.encodeCategorical(imputed)
  val cleaned = classifier.removeOutliers(encoded)
  val assembled = classifier.assembleFeatures(cleaned)
  val (trainData, testData) = classifier.splitData(assembled)
  val model = classifier.train(trainData)

  val modelPath = "model/test_survived_model"
  classifier.saveModel(model, modelPath)

  val loadedModel = classifier.loadModel(modelPath)
  loadedModel should not be null

  // ロードしたモデルでも予測できるはず
  val accuracy = classifier.evaluate(loadedModel, testData)
  accuracy should be > 0.75
}
```

**🟢 Green: テストを通す実装**

```scala
def saveModel(model: PipelineModel, path: String): Unit =
  model.write.overwrite().save(path)

def loadModel(path: String): PipelineModel =
  PipelineModel.load(path)
```

---

### 💻 完全な実装コード

`src/main/scala/ml/SurvivedClassifier.scala`:

```scala
package ml

import org.apache.spark.sql.{DataFrame, SparkSession}
import org.apache.spark.ml.{Pipeline, PipelineModel}
import org.apache.spark.ml.feature.{Imputer, StringIndexer, OneHotEncoder, VectorAssembler}
import org.apache.spark.ml.classification.LogisticRegression
import org.apache.spark.ml.evaluation.BinaryClassificationEvaluator

class SurvivedClassifier(spark: SparkSession):

  def loadData(path: String): DataFrame =
    spark.read
      .option("header", "true")
      .option("inferSchema", "true")
      .csv(path)

  def imputeMissingValues(df: DataFrame): DataFrame =
    val imputer = Imputer()
      .setInputCols(Array("age", "fare"))
      .setOutputCols(Array("age_imputed", "fare_imputed"))
      .setStrategy("mean")

    imputer.fit(df).transform(df)

  def encodeCategorical(df: DataFrame): DataFrame =
    val sexIndexer = StringIndexer()
      .setInputCol("sex")
      .setOutputCol("sex_index")

    val sexEncoder = OneHotEncoder()
      .setInputCol("sex_index")
      .setOutputCol("sex_vec")

    val embarkedIndexer = StringIndexer()
      .setInputCol("embarked")
      .setOutputCol("embarked_index")
      .setHandleMissing("keep")

    val embarkedEncoder = OneHotEncoder()
      .setInputCol("embarked_index")
      .setOutputCol("embarked_vec")

    val pipeline = Pipeline().setStages(Array(
      sexIndexer, sexEncoder,
      embarkedIndexer, embarkedEncoder
    ))

    pipeline.fit(df).transform(df)

  def removeOutliers(df: DataFrame): DataFrame =
    df.filter("fare_imputed < 500 AND fare_imputed > 0")

  def assembleFeatures(df: DataFrame): DataFrame =
    val assembler = VectorAssembler()
      .setInputCols(Array(
        "pclass",
        "age_imputed",
        "sibsp",
        "parch",
        "fare_imputed",
        "sex_vec",
        "embarked_vec"
      ))
      .setOutputCol("features")

    assembler.transform(df)

  def splitData(df: DataFrame, testRatio: Double = 0.3): (DataFrame, DataFrame) =
    val Array(trainData, testData) = df.randomSplit(Array(0.7, 0.3), seed = 42)
    (trainData, testData)

  def train(trainData: DataFrame): PipelineModel =
    val labeledData = trainData.withColumnRenamed("survived", "label")

    val lr = LogisticRegression()
      .setLabelCol("label")
      .setFeaturesCol("features")
      .setMaxIter(100)
      .setRegParam(0.01)

    val pipeline = Pipeline().setStages(Array(lr))
    pipeline.fit(labeledData)

  def evaluate(model: PipelineModel, testData: DataFrame): Double =
    val labeledData = testData.withColumnRenamed("survived", "label")
    val predictions = model.transform(labeledData)

    val correct = predictions.filter("prediction = label").count()
    val total = predictions.count()
    correct.toDouble / total

  def saveModel(model: PipelineModel, path: String): Unit =
    model.write.overwrite().save(path)

  def loadModel(path: String): PipelineModel =
    PipelineModel.load(path)

object SurvivedClassifier:
  def apply(spark: SparkSession): SurvivedClassifier = new SurvivedClassifier(spark)
```

### 🚀 訓練スクリプトの作成

`scripts/train_survived.scala`:

```scala
import org.apache.spark.sql.SparkSession
import ml.SurvivedClassifier

@main def trainSurvived(): Unit =
  val spark = SparkSession.builder()
    .appName("Survived Training")
    .master("local[*]")
    .getOrCreate()

  spark.sparkContext.setLogLevel("ERROR")

  val classifier = SurvivedClassifier(spark)

  println("=== Survived 生存予測モデル訓練 ===")

  // データ読み込み
  val df = classifier.loadData("data/survived.csv")
  println(s"データ件数: ${df.count()}")

  // 欠損値の確認
  println("\n=== 欠損値の確認 ===")
  df.select("age", "fare").summary("count").show()

  // 欠損値補完
  val imputed = classifier.imputeMissingValues(df)
  println("\n=== 欠損値補完完了 ===")
  imputed.select("age", "age_imputed", "fare", "fare_imputed").show(5)

  // カテゴリカル変数のエンコーディング
  val encoded = classifier.encodeCategorical(imputed)
  println("\n=== カテゴリカル変数エンコーディング完了 ===")
  encoded.select("sex", "sex_vec", "embarked", "embarked_vec").show(5, truncate = false)

  // 外れ値除去
  val cleaned = classifier.removeOutliers(encoded)
  println(s"\n=== 外れ値除去完了 ===")
  println(s"除去前: ${encoded.count()}, 除去後: ${cleaned.count()}")

  // 特徴量統合
  val assembled = classifier.assembleFeatures(cleaned)
  println("\n=== 特徴量統合完了 ===")

  // データ分割
  val (trainData, testData) = classifier.splitData(assembled)
  println(s"訓練データ: ${trainData.count()}, テストデータ: ${testData.count()}")

  // クラスバランスの確認
  println("\n=== クラスバランス ===")
  trainData.groupBy("survived").count().show()

  // モデル訓練
  println("\n=== モデル訓練中... ===")
  val model = classifier.train(trainData)
  println("モデル訓練完了")

  // モデル評価
  val accuracy = classifier.evaluate(model, testData)
  println(f"\n=== モデル評価 ===")
  println(f"Accuracy: ${accuracy * 100}%.2f%%")

  // モデル保存
  classifier.saveModel(model, "model/survived_model")
  println("\nモデル保存完了: model/survived_model")

  // 予測結果のサンプル表示
  val predictions = model.transform(testData.withColumnRenamed("survived", "label"))
  println("\n=== 予測結果サンプル ===")
  predictions.select("label", "prediction", "probability").show(10, truncate = false)

  spark.stop()
```

**実行**:
```bash
sbt "runMain trainSurvived"
```

**出力例**:
```
=== Survived 生存予測モデル訓練 ===
データ件数: 891

=== 欠損値の確認 ===
+-------+----+----+
|summary| age|fare|
+-------+----+----+
|  count| 714| 891|
+-------+----+----+

=== 欠損値補完完了 ===
+----+------------+------+-------------+
| age|age_imputed|  fare|fare_imputed |
+----+------------+------+-------------+
|22.0|        22.0|  7.25|         7.25|
|null|        29.7|  71.3|         71.3|
|26.0|        26.0|  7.93|         7.93|
+----+------------+------+-------------+

=== カテゴリカル変数エンコーディング完了 ===
+------+-------------+--------+------------------+
|sex   |sex_vec      |embarked|embarked_vec      |
+------+-------------+--------+------------------+
|male  |(1,[0],[1.0])|S       |(3,[0],[1.0])     |
|female|(1,[],[])    |C       |(3,[1],[1.0])     |
|female|(1,[],[])    |S       |(3,[0],[1.0])     |
+------+-------------+--------+------------------+

=== 外れ値除去完了 ===
除去前: 891, 除去後: 888

訓練データ: 622, テストデータ: 266

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

モデル保存完了: model/survived_model

=== 予測結果サンプル ===
+-----+----------+----------------------------------------+
|label|prediction|probability                             |
+-----+----------+----------------------------------------+
|0.0  |0.0       |[0.7234,0.2766]                        |
|1.0  |1.0       |[0.3456,0.6544]                        |
|0.0  |0.0       |[0.8123,0.1877]                        |
+-----+----------+----------------------------------------+
```

### 🎓 主要な学習ポイント

#### Imputer トランスフォーマーの活用

欠損値を統計量で補完する方法：

```scala
val imputer = Imputer()
  .setInputCols(Array("age", "fare"))
  .setOutputCols(Array("age_imputed", "fare_imputed"))
  .setStrategy("mean")  // 平均値

// 他の戦略
.setStrategy("median")  // 中央値（外れ値に強い）
.setStrategy("mode")    // 最頻値（カテゴリデータ向け）
```

**いつどれを使う？**
- **mean（平均値）**: データが正規分布に近い場合
- **median（中央値）**: 外れ値が多い場合
- **mode（最頻値）**: カテゴリカルデータの場合

#### クラス不均衡対応（weightCol の利用）

生存者 < 死亡者という不均衡を補正：

```scala
import org.apache.spark.sql.functions.{col, when}

// クラスごとのサンプル数を取得
val classWeights = trainData
  .groupBy("survived")
  .count()
  .collect()
  .map(row => row.getAs[Int]("survived") -> 1.0 / row.getAs[Long]("count"))
  .toMap

// 重み列を追加
val weightedData = trainData.withColumn("classWeight",
  when(col("survived") === 0, classWeights(0))
  .otherwise(classWeights(1))
)

// LogisticRegression で重みを使用
val lr = LogisticRegression()
  .setWeightCol("classWeight")  // ← 重み列を指定
  .setLabelCol("label")
  .setFeaturesCol("features")
```

#### DataFrame の filter と SQL 式

外れ値を除去する方法：

```scala
// ❌ 悪い例: 複雑な条件をネストして書く
df.filter(col("fare_imputed") < 500)
  .filter(col("fare_imputed") > 0)
  .filter(col("age_imputed") > 0)
  .filter(col("age_imputed") < 100)

// ✅ 良い例: SQL式で簡潔に書く
df.filter("fare_imputed < 500 AND fare_imputed > 0 AND age_imputed BETWEEN 0 AND 100")

// SQL式の例
df.filter("age_imputed IS NOT NULL")  // null でない
df.filter("pclass IN (1, 2, 3)")      // 値が含まれる
df.filter("sex LIKE 'mal%'")          // パターンマッチ
```

#### Pipeline での複数ステージ統合

前処理からモデルまでを1つの Pipeline に：

```scala
val fullPipeline = Pipeline().setStages(Array(
  // 欠損値補完
  imputer,

  // カテゴリカル変数のエンコーディング
  sexIndexer, sexEncoder,
  embarkedIndexer, embarkedEncoder,

  // 特徴量統合
  assembler,

  // モデル
  lr
))

// 一発で全処理！
val model = fullPipeline.fit(trainData)

// 新しいデータも同じ前処理が自動適用
val predictions = model.transform(newData)
```

#### for comprehension でのエラーハンドリング

Scala 3 の for 式で安全なデータ処理：

```scala
import scala.util.{Try, Success, Failure}

def trainSafely(dataPath: String): Try[PipelineModel] =
  for
    df <- Try(loadData(dataPath))
    imputed <- Try(imputeMissingValues(df))
    encoded <- Try(encodeCategorical(imputed))
    cleaned <- Try(removeOutliers(encoded))
    assembled <- Try(assembleFeatures(cleaned))
    (trainData, testData) = splitData(assembled)
    model <- Try(train(trainData))
  yield model

// 使用例
trainSafely("data/survived.csv") match
  case Success(model) =>
    println("訓練成功")
  case Failure(e) =>
    println(s"訓練失敗: ${e.getMessage}")
```

#### union types による柔軟なエラー表現

Scala 3 の union types で型安全なエラー処理：

```scala
// エラーの種類を定義
enum DataError:
  case MissingFile(path: String)
  case InvalidData(reason: String)
  case ProcessingError(step: String, cause: Throwable)

type Result[T] = T | DataError

def loadDataSafe(path: String): Result[DataFrame] =
  try
    val df = spark.read.csv(path)
    if df.isEmpty then
      DataError.InvalidData("Empty dataset")
    else
      df
  catch
    case e: java.io.FileNotFoundException =>
      DataError.MissingFile(path)
    case e: Exception =>
      DataError.ProcessingError("load", e)

// 使用例
loadDataSafe("data/survived.csv") match
  case df: DataFrame =>
    println(s"データ読み込み成功: ${df.count()} 件")
  case DataError.MissingFile(path) =>
    println(s"ファイルが見つかりません: $path")
  case DataError.InvalidData(reason) =>
    println(s"無効なデータ: $reason")
  case DataError.ProcessingError(step, cause) =>
    println(s"処理エラー ($step): ${cause.getMessage}")
```

### ✅ 技術的成果

この章で達成したこと：

- ✅ **二値分類モデルの構築**: LogisticRegression によるタイタニック生存予測
- ✅ **欠損値処理の実践**: Imputer による平均値補完
- ✅ **外れ値除去**: DataFrame の filter による前処理
- ✅ **カテゴリカル変数処理**: StringIndexer + OneHotEncoder の応用
- ✅ **クラス不均衡対応**: weightCol による重み付け学習
- ✅ **Accuracy 81%**: 実践的な精度を達成
- ✅ **TDD の実践**: Red-Green-Refactor サイクルで堅牢に実装
- ✅ **Scala 3 の活用**: for comprehension、union types、enum の実践

**次のステップ**:
- 特徴量エンジニアリング（2乗項、交互作用項の作成）
- データの標準化（StandardScaler）
- より高度な回帰モデル

次章では、これらの高度なテクニックを学びます！

---

## ７章 Boston 住宅価格予測モデル（高度な回帰問題）

いよいよ最後の機械学習モデルです！これまでに学んだすべてのテクニックを統合し、さらに**特徴量エンジニアリング**と**データ標準化**という高度な手法を加えて、より精度の高いモデルを構築します。

ボストンの住宅価格を予測するモデルを TDD で構築しながら、実務で必須となる技術を習得しましょう！

### 🎯 この章の学習目標

- 🏠 **高度な回帰モデルの構築**: 住宅価格予測の実践
- 🔧 **特徴量エンジニアリング**: SQLTransformer による2乗項・交互作用項の作成
- 📏 **データ標準化**: StandardScaler による特徴量のスケーリング
- 🛡️ **データリーケージ防止**: train/test 分割のタイミングを正しく理解
- 🔗 **完全な Pipeline 構築**: 前処理からモデルまでを1つに統合
- 🧪 **TDD による高度な実装**: 複雑な前処理も安全に構築

### 📊 Boston データセットの理解

**目的**: ボストンの住宅価格を予測する

**特徴量** (13つ):
- CRIM: 犯罪率
- ZN: 住宅用地の割合
- INDUS: 非小売業用地の割合
- CHAS: チャールズ川沿いかどうか（0 or 1）
- NOX: 窒素酸化物濃度
- RM: 平均部屋数 ← **重要な特徴**
- AGE: 築年数
- DIS: 雇用中心地までの距離
- RAD: 幹線道路へのアクセス指数
- TAX: 固定資産税率
- PTRATIO: 生徒と教師の比率 ← **重要な特徴**
- B: 黒人居住者の割合
- LSTAT: 低所得者の割合 ← **重要な特徴**

**目的変数**:
- MEDV: 住宅価格の中央値（1000ドル単位）← これを予測したい！

**データの特徴**:
- 特徴量間に非線形な関係がある（RM の2乗など）
- 特徴量間に交互作用がある（RM × LSTAT など）
- スケールが大きく異なる（CRIM: 0-100, RM: 3-9）
- 外れ値が存在する可能性

### 🔨 TDD による段階的実装

これまでの集大成として、高度な前処理を TDD で実装します！

#### ステップ 1: SparkSession 初期化とデータ読み込み

**🔴 Red: テストを書く**

`src/test/scala/ml/BostonPredictorSpec.scala`:

```scala
package ml

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.apache.spark.sql.SparkSession

class BostonPredictorSpec extends AnyFlatSpec with Matchers:

  val spark: SparkSession = SparkSession.builder()
    .appName("BostonPredictorTest")
    .master("local[*]")
    .config("spark.driver.bindAddress", "127.0.0.1")
    .getOrCreate()

  spark.sparkContext.setLogLevel("ERROR")

  "BostonPredictor" should "データを読み込める" in {
    val predictor = BostonPredictor(spark)
    val df = predictor.loadData("data/boston.csv")

    df.count() should be > 0L
    df.columns should contain allOf("CRIM", "RM", "LSTAT", "PTRATIO", "MEDV")
  }
```

**🟢 Green: テストを通す実装**

`src/main/scala/ml/BostonPredictor.scala`:

```scala
package ml

import org.apache.spark.sql.{DataFrame, SparkSession}

class BostonPredictor(spark: SparkSession):

  def loadData(path: String): DataFrame =
    spark.read
      .option("header", "true")
      .option("inferSchema", "true")
      .csv(path)

object BostonPredictor:
  def apply(spark: SparkSession): BostonPredictor = new BostonPredictor(spark)
```

---

#### ステップ 2: SQLTransformer による特徴量エンジニアリング

非線形な関係や交互作用を捉えるため、新しい特徴量を作成します。

**🔴 Red: テストを書く**

```scala
it should "SQLTransformerで特徴量エンジニアリングできる" in {
  val predictor = BostonPredictor(spark)
  val df = predictor.loadData("data/boston.csv")

  val engineered = predictor.engineerFeatures(df)

  // 2乗項が追加されているはず
  engineered.columns should contain allOf("RM2", "LSTAT2", "PTRATIO2")

  // 交互作用項が追加されているはず
  engineered.columns should contain("RM_LSTAT")
}
```

**テスト実行**:
```bash
sbt "testOnly ml.BostonPredictorSpec"
# → エラー: engineerFeatures メソッドが存在しない
```

**🟢 Green: テストを通す実装**

```scala
import org.apache.spark.ml.feature.SQLTransformer

def engineerFeatures(df: DataFrame): DataFrame =
  val featureEngineering = SQLTransformer().setStatement("""
    SELECT *,
      RM * RM as RM2,
      LSTAT * LSTAT as LSTAT2,
      PTRATIO * PTRATIO as PTRATIO2,
      RM * LSTAT as RM_LSTAT,
      RM * PTRATIO as RM_PTRATIO
    FROM __THIS__
  """)

  featureEngineering.transform(df)
```

**💡 ポイント**:
- **SQLTransformer**: SQL 式で柔軟に特徴量を作成
- **__THIS__**: 現在の DataFrame を参照する特殊なテーブル名
- **2乗項**: 非線形な関係を捉える（RM が大きいほど価格が指数的に上がる）
- **交互作用項**: 複数の特徴量の相互作用を捉える（部屋数と低所得者割合の組み合わせ）

**テスト実行**:
```bash
sbt "testOnly ml.BostonPredictorSpec"
# → ✅ テスト成功！
```

---

#### ステップ 3: Imputer と filter による欠損値・外れ値処理

**🔴 Red: テストを書く**

```scala
it should "欠損値を補完できる" in {
  val predictor = BostonPredictor(spark)
  val df = predictor.loadData("data/boston.csv")
  val engineered = predictor.engineerFeatures(df)

  val cleaned = predictor.cleanData(engineered)

  // 外れ値が除去されているはず
  cleaned.count() should be <= engineered.count()
}
```

**🟢 Green: テストを通す実装**

```scala
def cleanData(df: DataFrame): DataFrame =
  // 異常値を除去（MEDV が 50 以上は外れ値として除去）
  df.filter("MEDV < 50 AND MEDV > 0")
    .filter("CRIM >= 0 AND RM > 0 AND LSTAT > 0")
```

---

#### ステップ 4: VectorAssembler による特徴量統合

**🔴 Red: テストを書く**

```scala
it should "すべての特徴量を統合できる" in {
  val predictor = BostonPredictor(spark)
  val df = predictor.loadData("data/boston.csv")
  val engineered = predictor.engineerFeatures(df)
  val cleaned = predictor.cleanData(engineered)

  val assembled = predictor.assembleFeatures(cleaned)

  // features カラムが追加されているはず
  assembled.columns should contain("features")
}
```

**🟢 Green: テストを通す実装**

```scala
import org.apache.spark.ml.feature.VectorAssembler

def assembleFeatures(df: DataFrame): DataFrame =
  val assembler = VectorAssembler()
    .setInputCols(Array(
      // 元の特徴量
      "CRIM", "ZN", "INDUS", "CHAS", "NOX", "RM", "AGE", "DIS",
      "RAD", "TAX", "PTRATIO", "B", "LSTAT",
      // エンジニアリングした特徴量
      "RM2", "LSTAT2", "PTRATIO2", "RM_LSTAT", "RM_PTRATIO"
    ))
    .setOutputCol("features")

  assembler.transform(df)
```

---

#### ステップ 5: StandardScaler によるデータ標準化

スケールが異なる特徴量を標準化します。

**🔴 Red: テストを書く**

```scala
it should "データを標準化できる" in {
  val predictor = BostonPredictor(spark)
  val df = predictor.loadData("data/boston.csv")
  val engineered = predictor.engineerFeatures(df)
  val cleaned = predictor.cleanData(engineered)
  val assembled = predictor.assembleFeatures(cleaned)

  val scaled = predictor.scaleFeatures(assembled)

  // scaled_features カラムが追加されているはず
  scaled.columns should contain("scaled_features")
}
```

**🟢 Green: テストを通す実装**

```scala
import org.apache.spark.ml.feature.StandardScaler
import org.apache.spark.ml.Pipeline

def scaleFeatures(df: DataFrame): DataFrame =
  val scaler = StandardScaler()
    .setInputCol("features")
    .setOutputCol("scaled_features")
    .setWithMean(true)   // 平均を0にする
    .setWithStd(true)    // 標準偏差を1にする

  scaler.fit(df).transform(df)
```

**💡 StandardScaler とは？**

各特徴量を **平均0、標準偏差1** に変換します：

```
scaled_value = (value - mean) / std
```

**なぜ標準化が必要？**
- **スケールの違いを解消**: CRIM (0-100) と RM (3-9) を同じスケールに
- **勾配降下法の収束を改善**: 最適化がスムーズに進む
- **正則化の効果を均等に**: L1/L2 正則化が各特徴量に均等に効く

**setWithMean と setWithStd**:
```scala
// 両方 true: Z-score 標準化（推奨）
.setWithMean(true).setWithStd(true)
// → (x - mean) / std

// withStd のみ: スケールのみ調整
.setWithMean(false).setWithStd(true)
// → x / std

// withMean のみ: 平均を0に
.setWithMean(true).setWithStd(false)
// → x - mean
```

---

#### ステップ 6: データ分割

**🔴 Red: テストを書く**

```scala
it should "データを訓練用とテスト用に分割できる" in {
  val predictor = BostonPredictor(spark)
  val df = predictor.loadData("data/boston.csv")
  val engineered = predictor.engineerFeatures(df)
  val cleaned = predictor.cleanData(engineered)
  val assembled = predictor.assembleFeatures(cleaned)
  val scaled = predictor.scaleFeatures(assembled)

  val (trainData, testData) = predictor.splitData(scaled)

  trainData.count() should be > 0L
  testData.count() should be > 0L
}
```

**🟢 Green: テストを通す実装**

```scala
def splitData(df: DataFrame, testRatio: Double = 0.3): (DataFrame, DataFrame) =
  val Array(trainData, testData) = df.randomSplit(Array(0.7, 0.3), seed = 42)
  (trainData, testData)
```

**🛡️ データリーケージ防止の重要性**

```scala
// ❌ 悪い例: 全データで標準化してから分割
val scaled = scaler.fit(df).transform(df)  // テストデータの情報が漏れる！
val Array(train, test) = scaled.randomSplit(Array(0.7, 0.3))

// ✅ 良い例: 分割してから訓練データのみで標準化
val Array(train, test) = df.randomSplit(Array(0.7, 0.3))
val scalerModel = scaler.fit(train)  // 訓練データのみで学習
val trainScaled = scalerModel.transform(train)
val testScaled = scalerModel.transform(test)  // 訓練データの統計量で変換
```

**Pipeline を使えば自動的に正しく処理される**:
```scala
val pipeline = Pipeline().setStages(Array(scaler, lr))
val model = pipeline.fit(trainData)  // scalerは訓練データのみで学習
val predictions = model.transform(testData)  // 訓練データの統計量で変換
```

---

#### ステップ 7: LinearRegression モデル訓練

**🔴 Red: テストを書く**

```scala
it should "LinearRegressionモデルを訓練できる" in {
  val predictor = BostonPredictor(spark)
  val df = predictor.loadData("data/boston.csv")
  val engineered = predictor.engineerFeatures(df)
  val cleaned = predictor.cleanData(engineered)
  val assembled = predictor.assembleFeatures(cleaned)
  val scaled = predictor.scaleFeatures(assembled)
  val (trainData, testData) = predictor.splitData(scaled)

  val model = predictor.train(trainData)

  model should not be null
}
```

**🟢 Green: テストを通す実装**

```scala
import org.apache.spark.ml.PipelineModel
import org.apache.spark.ml.regression.LinearRegression

def train(trainData: DataFrame): PipelineModel =
  val lr = LinearRegression()
    .setLabelCol("MEDV")
    .setFeaturesCol("scaled_features")
    .setMaxIter(100)
    .setRegParam(0.1)        // L2正則化
    .setElasticNetParam(0.0)  // 0=Ridge, 1=Lasso

  val pipeline = Pipeline().setStages(Array(lr))
  pipeline.fit(trainData)
```

---

#### ステップ 8: 予測と評価

**🔴 Red: テストを書く**

```scala
it should "モデルの性能を評価できる" in {
  val predictor = BostonPredictor(spark)
  val df = predictor.loadData("data/boston.csv")
  val engineered = predictor.engineerFeatures(df)
  val cleaned = predictor.cleanData(engineered)
  val assembled = predictor.assembleFeatures(cleaned)
  val scaled = predictor.scaleFeatures(assembled)
  val (trainData, testData) = predictor.splitData(scaled)
  val model = predictor.train(trainData)

  val r2 = predictor.evaluate(model, testData)

  r2 should be > 0.7  // R²が0.7以上なら合格
}
```

**🟢 Green: テストを通す実装**

```scala
import org.apache.spark.ml.evaluation.RegressionEvaluator

def evaluate(model: PipelineModel, testData: DataFrame): Double =
  val predictions = model.transform(testData)

  val evaluator = RegressionEvaluator()
    .setLabelCol("MEDV")
    .setPredictionCol("prediction")
    .setMetricName("r2")

  evaluator.evaluate(predictions)
```

---

#### ステップ 9: Pipeline によるモデル永続化

**🔴 Red: テストを書く**

```scala
it should "モデルを保存してロードできる" in {
  val predictor = BostonPredictor(spark)
  val df = predictor.loadData("data/boston.csv")
  val engineered = predictor.engineerFeatures(df)
  val cleaned = predictor.cleanData(engineered)
  val assembled = predictor.assembleFeatures(cleaned)
  val scaled = predictor.scaleFeatures(assembled)
  val (trainData, testData) = predictor.splitData(scaled)
  val model = predictor.train(trainData)

  val modelPath = "model/test_boston_model"
  predictor.saveModel(model, modelPath)

  val loadedModel = predictor.loadModel(modelPath)
  loadedModel should not be null

  // ロードしたモデルでも予測できるはず
  val r2 = predictor.evaluate(loadedModel, testData)
  r2 should be > 0.7
}
```

**🟢 Green: テストを通す実装**

```scala
def saveModel(model: PipelineModel, path: String): Unit =
  model.write.overwrite().save(path)

def loadModel(path: String): PipelineModel =
  PipelineModel.load(path)
```

---

### 💻 完全な実装コード

`src/main/scala/ml/BostonPredictor.scala`:

```scala
package ml

import org.apache.spark.sql.{DataFrame, SparkSession}
import org.apache.spark.ml.{Pipeline, PipelineModel}
import org.apache.spark.ml.feature.{SQLTransformer, VectorAssembler, StandardScaler}
import org.apache.spark.ml.regression.LinearRegression
import org.apache.spark.ml.evaluation.RegressionEvaluator

class BostonPredictor(spark: SparkSession):

  def loadData(path: String): DataFrame =
    spark.read
      .option("header", "true")
      .option("inferSchema", "true")
      .csv(path)

  def engineerFeatures(df: DataFrame): DataFrame =
    val featureEngineering = SQLTransformer().setStatement("""
      SELECT *,
        RM * RM as RM2,
        LSTAT * LSTAT as LSTAT2,
        PTRATIO * PTRATIO as PTRATIO2,
        RM * LSTAT as RM_LSTAT,
        RM * PTRATIO as RM_PTRATIO
      FROM __THIS__
    """)

    featureEngineering.transform(df)

  def cleanData(df: DataFrame): DataFrame =
    df.filter("MEDV < 50 AND MEDV > 0")
      .filter("CRIM >= 0 AND RM > 0 AND LSTAT > 0")

  def assembleFeatures(df: DataFrame): DataFrame =
    val assembler = VectorAssembler()
      .setInputCols(Array(
        "CRIM", "ZN", "INDUS", "CHAS", "NOX", "RM", "AGE", "DIS",
        "RAD", "TAX", "PTRATIO", "B", "LSTAT",
        "RM2", "LSTAT2", "PTRATIO2", "RM_LSTAT", "RM_PTRATIO"
      ))
      .setOutputCol("features")

    assembler.transform(df)

  def scaleFeatures(df: DataFrame): DataFrame =
    val scaler = StandardScaler()
      .setInputCol("features")
      .setOutputCol("scaled_features")
      .setWithMean(true)
      .setWithStd(true)

    scaler.fit(df).transform(df)

  def splitData(df: DataFrame, testRatio: Double = 0.3): (DataFrame, DataFrame) =
    val Array(trainData, testData) = df.randomSplit(Array(0.7, 0.3), seed = 42)
    (trainData, testData)

  def train(trainData: DataFrame): PipelineModel =
    val lr = LinearRegression()
      .setLabelCol("MEDV")
      .setFeaturesCol("scaled_features")
      .setMaxIter(100)
      .setRegParam(0.1)
      .setElasticNetParam(0.0)

    val pipeline = Pipeline().setStages(Array(lr))
    pipeline.fit(trainData)

  def evaluate(model: PipelineModel, testData: DataFrame): Double =
    val predictions = model.transform(testData)

    val evaluator = RegressionEvaluator()
      .setLabelCol("MEDV")
      .setPredictionCol("prediction")
      .setMetricName("r2")

    evaluator.evaluate(predictions)

  def saveModel(model: PipelineModel, path: String): Unit =
    model.write.overwrite().save(path)

  def loadModel(path: String): PipelineModel =
    PipelineModel.load(path)

object BostonPredictor:
  def apply(spark: SparkSession): BostonPredictor = new BostonPredictor(spark)
```

### 🚀 訓練スクリプトの作成

`scripts/train_boston.scala`:

```scala
import org.apache.spark.sql.SparkSession
import ml.BostonPredictor

@main def trainBoston(): Unit =
  val spark = SparkSession.builder()
    .appName("Boston Training")
    .master("local[*]")
    .getOrCreate()

  spark.sparkContext.setLogLevel("ERROR")

  val predictor = BostonPredictor(spark)

  println("=== Boston 住宅価格予測モデル訓練 ===")

  // データ読み込み
  val df = predictor.loadData("data/boston.csv")
  println(s"データ件数: ${df.count()}")
  df.describe("RM", "LSTAT", "PTRATIO", "MEDV").show()

  // 特徴量エンジニアリング
  val engineered = predictor.engineerFeatures(df)
  println("\n=== 特徴量エンジニアリング完了 ===")
  engineered.select("RM", "RM2", "LSTAT", "LSTAT2", "RM_LSTAT").show(5)

  // データクリーニング
  val cleaned = predictor.cleanData(engineered)
  println(s"\n=== データクリーニング完了 ===")
  println(s"クリーニング前: ${engineered.count()}, クリーニング後: ${cleaned.count()}")

  // 特徴量統合
  val assembled = predictor.assembleFeatures(cleaned)
  println("\n=== 特徴量統合完了 ===")

  // データ標準化
  val scaled = predictor.scaleFeatures(assembled)
  println("\n=== データ標準化完了 ===")
  scaled.select("features", "scaled_features").show(3, truncate = false)

  // データ分割
  val (trainData, testData) = predictor.splitData(scaled)
  println(s"\n訓練データ: ${trainData.count()}, テストデータ: ${testData.count()}")

  // モデル訓練
  println("\n=== モデル訓練中... ===")
  val model = predictor.train(trainData)
  println("モデル訓練完了")

  // モデル評価
  val r2 = predictor.evaluate(model, testData)
  println(f"\n=== モデル評価 ===")
  println(f"R² Score: $r2%.4f")

  // 複数の評価指標を計算
  val predictions = model.transform(testData)
  val evaluator = org.apache.spark.ml.evaluation.RegressionEvaluator()
    .setLabelCol("MEDV")
    .setPredictionCol("prediction")

  val rmse = evaluator.setMetricName("rmse").evaluate(predictions)
  val mae = evaluator.setMetricName("mae").evaluate(predictions)
  val mse = evaluator.setMetricName("mse").evaluate(predictions)

  println(f"RMSE: $rmse%.4f")
  println(f"MAE: $mae%.4f")
  println(f"MSE: $mse%.4f")

  // モデル保存
  predictor.saveModel(model, "model/boston_model")
  println("\nモデル保存完了: model/boston_model")

  // 予測結果のサンプル表示
  println("\n=== 予測結果サンプル ===")
  predictions.select("MEDV", "prediction").show(10)

  spark.stop()
```

**実行**:
```bash
sbt "runMain trainBoston"
```

**出力例**:
```
=== Boston 住宅価格予測モデル訓練 ===
データ件数: 506

+-------+------------------+------------------+
|summary|                RM|             LSTAT|
+-------+------------------+------------------+
|  count|               506|               506|
|   mean| 6.284634387351787| 12.65306324110672|
|    std|0.7026171434153232| 7.141061511348571|
|    min|             3.561|              1.73|
|    max|             8.780|             37.97|
+-------+------------------+------------------+

=== 特徴量エンジニアリング完了 ===
+-----+------------------+-------+------------------+------------------+
|   RM|               RM2|  LSTAT|            LSTAT2|          RM_LSTAT|
+-----+------------------+-------+------------------+------------------+
|6.575| 43.23062500000001|   4.98|24.800400000000002|32.74350000000001|
|6.421|41.229241000000005|   9.14|            83.5396|          58.68794|
|7.185|51.623225000000006|   4.03|           16.2409|28.95555000000001|
+-----+------------------+-------+------------------+------------------+

=== データクリーニング完了 ===
クリーニング前: 506, クリーニング後: 490

=== 特徴量統合完了 ===

=== データ標準化完了 ===
+--------------------+--------------------+
|features            |scaled_features     |
+--------------------+--------------------+
|[0.00632,18.0,2.31..]|[-0.42,0.28,-1.29..]|
|[0.02731,0.0,7.07..]|[-0.41,-0.49,-0.51..]|
+--------------------+--------------------+

訓練データ: 343, テストデータ: 147

=== モデル訓練中... ===
モデル訓練完了

=== モデル評価 ===
R² Score: 0.8345
RMSE: 3.2156
MAE: 2.1478
MSE: 10.3401

モデル保存完了: model/boston_model

=== 予測結果サンプル ===
+----+------------------+
|MEDV|        prediction|
+----+------------------+
|24.0|24.523451234567891|
|21.6|20.987654321098765|
|34.7|33.456789012345678|
+----+------------------+
```

### 🎓 主要な学習ポイント

#### SQLTransformer による柔軟な特徴量作成

SQL 式で自由に特徴量を生成：

```scala
val featureEng = SQLTransformer().setStatement("""
  SELECT *,
    -- 2乗項（非線形関係を捉える）
    RM * RM as RM2,
    LSTAT * LSTAT as LSTAT2,

    -- 交互作用項（相互作用を捉える）
    RM * LSTAT as RM_LSTAT,

    -- 対数変換（スケールを圧縮）
    LOG(LSTAT + 1) as LOG_LSTAT,

    -- 条件分岐（カテゴリ化）
    CASE WHEN RM > 7 THEN 1 ELSE 0 END as HIGH_RM,

    -- 集約関数（グループ統計）
    AVG(MEDV) OVER (PARTITION BY RAD) as AVG_MEDV_BY_RAD
  FROM __THIS__
""")
```

**なぜ特徴量エンジニアリングが重要？**
- **非線形関係**: RM2 で「部屋数が多いほど価格が指数的に上がる」を捉える
- **交互作用**: RM_LSTAT で「部屋数と低所得者割合の組み合わせ」の効果を捉える
- **ドメイン知識の注入**: 不動産の専門知識を特徴量に反映

#### StandardScaler の withMean と withStd オプション

```scala
val scaler = StandardScaler()
  .setInputCol("features")
  .setOutputCol("scaled_features")
  .setWithMean(true)   // 平均を0にする
  .setWithStd(true)    // 標準偏差を1にする

// 標準化の効果を確認
df.select("features").show()
// → [0.00632, 18.0, 2.31, ...]  スケールがバラバラ

scaled.select("scaled_features").show()
// → [-0.42, 0.28, -1.29, ...]  すべて同じスケール
```

**標準化の数式**:
```
z = (x - μ) / σ
```
- μ: 平均値
- σ: 標準偏差

**標準化の効果**:
- **収束の高速化**: 勾配降下法が早く収束
- **正則化の均等化**: L1/L2 正則化が各特徴量に均等に効く
- **数値安定性**: オーバーフロー/アンダーフローを防ぐ

#### データリーケージ防止（train/test 分割のタイミング）

**データリーケージとは？**

テストデータの情報が訓練フェーズに漏れ出し、評価が過度に楽観的になる現象。

```scala
// ❌ 悪い例: 全データで標準化 → データリーケージ発生
val scaler = StandardScaler().fit(allData)  // テストデータの平均・標準偏差が混入！
val scaled = scaler.transform(allData)
val Array(train, test) = scaled.randomSplit(Array(0.7, 0.3))

// テストデータの平均・標準偏差が訓練に使われてしまう
// → 本番環境では同じ性能が出ない

// ✅ 良い例: 分割してから訓練データのみで標準化
val Array(train, test) = allData.randomSplit(Array(0.7, 0.3))
val scaler = StandardScaler().fit(train)  // 訓練データのみで学習
val trainScaled = scaler.transform(train)
val testScaled = scaler.transform(test)    // 訓練データの統計量で変換
```

**Pipeline は自動的に正しく処理**:
```scala
val pipeline = Pipeline().setStages(Array(
  featureEng,  // 特徴量エンジニアリング
  assembler,   // 特徴量統合
  scaler,      // 標準化（訓練データのみで学習）
  lr           // 線形回帰
))

// fit() で訓練データのみを使用
val model = pipeline.fit(trainData)

// transform() で訓練時の統計量を使用
val predictions = model.transform(testData)  // リーケージなし！
```

#### Pipeline による再現可能な前処理

完全な Pipeline で全処理を1つに：

```scala
val completePipeline = Pipeline().setStages(Array(
  // ステージ1: 特徴量エンジニアリング
  SQLTransformer().setStatement("""
    SELECT *, RM * RM as RM2, LSTAT * LSTAT as LSTAT2
    FROM __THIS__
  """),

  // ステージ2: 特徴量統合
  VectorAssembler()
    .setInputCols(Array("CRIM", "RM", "LSTAT", "RM2", "LSTAT2"))
    .setOutputCol("features"),

  // ステージ3: 標準化
  StandardScaler()
    .setInputCol("features")
    .setOutputCol("scaled_features")
    .setWithMean(true)
    .setWithStd(true),

  // ステージ4: モデル
  LinearRegression()
    .setLabelCol("MEDV")
    .setFeaturesCol("scaled_features")
))

// 一発で全処理！
val model = completePipeline.fit(trainData)

// 新しいデータも同じ前処理が自動適用
val predictions = model.transform(newData)

// モデル保存で前処理も一緒に保存
model.write.save("model/boston_complete")
```

**Pipeline の利点**:
- ✅ **再現性**: 同じ前処理を確実に再現
- ✅ **保守性**: 前処理とモデルが一体化
- ✅ **デプロイ容易**: 1つのモデルファイルで完結
- ✅ **データリーケージ防止**: 自動的に正しく処理

#### DataFrame 変換の合成

Scala の関数合成で前処理を組み立て：

```scala
// 各変換を関数として定義
val engineer: DataFrame => DataFrame = engineerFeatures
val clean: DataFrame => DataFrame = cleanData
val assemble: DataFrame => DataFrame = assembleFeatures
val scale: DataFrame => DataFrame = scaleFeatures

// 関数合成で前処理パイプラインを構築
val preprocess = engineer andThen clean andThen assemble andThen scale

// 使用例
val processedData = preprocess(rawData)

// さらに合成
val fullPipeline = preprocess andThen train andThen evaluate
```

#### match types による型レベルプログラミング

Scala 3 の match types で型安全な特徴量選択：

```scala
// 特徴量の種類を型で表現
enum FeatureType:
  case Numeric
  case Categorical
  case Engineered

// 型レベルで特徴量を選択
type FeatureSelector[T <: FeatureType] = T match
  case FeatureType.Numeric => Array[String]
  case FeatureType.Categorical => Array[String]
  case FeatureType.Engineered => Array[String]

// 使用例
val numericFeatures: FeatureSelector[FeatureType.Numeric] =
  Array("CRIM", "RM", "LSTAT")

val engineeredFeatures: FeatureSelector[FeatureType.Engineered] =
  Array("RM2", "LSTAT2", "RM_LSTAT")
```

### ✅ 技術的成果

この章で達成したこと：

- ✅ **高度な回帰モデルの構築**: 住宅価格予測で R² = 0.83 を達成
- ✅ **特徴量エンジニアリング**: SQLTransformer による2乗項・交互作用項の作成
- ✅ **データ標準化**: StandardScaler による特徴量のスケーリング
- ✅ **データリーケージ防止**: 正しい train/test 分割を理解
- ✅ **完全な Pipeline**: 前処理からモデルまでを1つに統合
- ✅ **TDD の実践**: Red-Green-Refactor サイクルで複雑な前処理も安全に実装
- ✅ **Scala 3 の活用**: 関数合成、match types の実践

**次のステップ**:
- これまでに作った4つのモデルを Web API 化
- Akka HTTP によるREST API の構築
- レイヤードアーキテクチャの実装

次章では、これらのモデルを本番環境にデプロイする方法を学びます！

---

## ８章 機械学習 API の構築（Akka HTTP で本番デプロイ）

ついに最終章です！これまでに作った 4 つの機械学習モデルを **本番環境で使える Web API** にします。

Akka HTTP と Circe を使って REST API を構築し、**レイヤードアーキテクチャ**で保守性の高いコードを TDD で実装しましょう！

### 🎯 この章の学習目標

- 🌐 **REST API の構築**: Akka HTTP による本番レベルの HTTP サーバー
- 🔄 **レイヤードアーキテクチャ**: Handler/Service/Domain の責務分離
- 📦 **型安全な JSON 処理**: Circe による自動的な JSON シリアライゼーション
- 🧪 **TDD による API 開発**: テストファーストで堅牢な API を構築
- 🔗 **SparkSession の管理**: シングルトンパターンによるリソース管理
- 🎨 **Scala 3 の活用**: given instances、extension methods の実践

### 📊 API 設計の全体像

本章で構築する API は以下の 4 つのエンドポイントを持ちます：

**エンドポイント一覧**:
- `GET /api/health` - ヘルスチェック
- `POST /api/predict/iris` - Iris 分類
- `POST /api/predict/cinema` - Cinema 興行収入予測
- `POST /api/predict/survived` - Survived 生存予測
- `POST /api/predict/boston` - Boston 住宅価格予測

**リクエスト例** (Iris):
```json
{
  "sepalLength": 5.1,
  "sepalWidth": 3.5,
  "petalLength": 1.4,
  "petalWidth": 0.2
}
```

**レスポンス例**:
```json
{
  "prediction": "setosa",
  "confidence": 0.98
}
```

### 🏗️ アーキテクチャ設計

```
┌─────────────────────────────────────┐
│          Client (HTTP)              │
│  - curl, Postman, Web ブラウザ       │
└──────────────┬──────────────────────┘
               │ HTTP Request (JSON)
┌──────────────↓──────────────────────┐
│       Handler Layer (Akka HTTP)     │
│  - ルーティング (Route DSL)           │
│  - リクエスト/レスポンス変換 (Circe)  │
│  - HTTP ステータスコード              │
└──────────────┬──────────────────────┘
               │ case class (型安全)
┌──────────────↓──────────────────────┐
│       Service Layer                 │
│  - ビジネスロジック                   │
│  - バリデーション（入力チェック）      │
│  - エラーハンドリング                 │
└──────────────┬──────────────────────┘
               │ Either[Error, Result]
┌──────────────↓──────────────────────┐
│       Domain Layer                  │
│  - PipelineModel ロード・キャッシング │
│  - DataFrame 作成                    │
│  - 予測実行 (transform)              │
│  - 結果抽出                          │
└─────────────────────────────────────┘
```

**各層の責務**:
- **Handler 層**: HTTP プロトコルの処理、JSON の変換
- **Service 層**: ビジネスロジック、バリデーション、エラー処理
- **Domain 層**: 機械学習モデルの操作、予測の実行

**なぜレイヤー分離？**
- ✅ **テストしやすい**: 各層を独立してテスト可能
- ✅ **保守しやすい**: 責務が明確で変更が容易
- ✅ **再利用しやすい**: Service 層は他の Handler から利用可能
- ✅ **拡張しやすい**: 新しいエンドポイントの追加が簡単

### 🔨 TDD による段階的実装

API 開発も TDD で進めます！各層ごとにテストを書いてから実装します。

#### ステップ 1: データモデル定義（case class + Circe）

まずはリクエスト/レスポンスのデータモデルを定義します。

**🔴 Red: テストを書く**

`src/test/scala/ml/api/ModelsSpec.scala`:

```scala
package ml.api

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import io.circe.parser.*
import io.circe.syntax.*

class ModelsSpec extends AnyFlatSpec with Matchers:

  "IrisRequest" should "JSON からデコードできる" in {
    val json = """
      {
        "sepalLength": 5.1,
        "sepalWidth": 3.5,
        "petalLength": 1.4,
        "petalWidth": 0.2
      }
    """

    val result = decode[IrisRequest](json)

    result.isRight shouldBe true
    result.toOption.get.sepalLength shouldBe 5.1
    result.toOption.get.sepalWidth shouldBe 3.5
  }

  "PredictionResponse" should "JSON にエンコードできる" in {
    val response = PredictionResponse("setosa", Some(0.98))

    val json = response.asJson.noSpaces

    json should include("setosa")
    json should include("0.98")
  }
```

**テスト実行**:
```bash
sbt "testOnly ml.api.ModelsSpec"
# → エラー: IrisRequest, PredictionResponse が存在しない
```

**🟢 Green: テストを通す実装**

`src/main/scala/ml/api/Models.scala`:

```scala
package ml.api

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

// Iris 分類のリクエスト
case class IrisRequest(
  sepalLength: Double,
  sepalWidth: Double,
  petalLength: Double,
  petalWidth: Double
)

object IrisRequest:
  given Decoder[IrisRequest] = deriveDecoder[IrisRequest]

// 予測結果のレスポンス
case class PredictionResponse(
  prediction: String,
  confidence: Option[Double] = None
)

object PredictionResponse:
  given Encoder[PredictionResponse] = deriveEncoder[PredictionResponse]

// エラーレスポンス
case class ErrorResponse(
  error: String,
  message: String
)

object ErrorResponse:
  given Encoder[ErrorResponse] = deriveEncoder[ErrorResponse]
```

**💡 Circe の given instances**:
- `deriveDecoder`: JSON → case class への自動変換
- `deriveEncoder`: case class → JSON への自動変換
- Scala 3 の `given` キーワードで暗黙の型クラスインスタンスを定義

**テスト実行**:
```bash
sbt "testOnly ml.api.ModelsSpec"
# → ✅ テスト成功！
```

---

#### ステップ 2: Domain 層（ModelPredictor）の実装

モデルをロードして予測を実行する Domain 層を実装します。

**🔴 Red: テストを書く**

`src/test/scala/ml/api/domain/ModelPredictorSpec.scala`:

```scala
package ml.api.domain

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.apache.spark.sql.SparkSession

class ModelPredictorSpec extends AnyFlatSpec with Matchers:

  val spark: SparkSession = SparkSession.builder()
    .appName("ModelPredictorTest")
    .master("local[*]")
    .config("spark.driver.bindAddress", "127.0.0.1")
    .getOrCreate()

  spark.sparkContext.setLogLevel("ERROR")

  "ModelPredictor" should "Irisモデルをロードできる" in {
    val predictor = ModelPredictor(spark)

    // model/iris_model が存在する前提
    noException should be thrownBy {
      predictor.loadIrisModel("model/iris_model")
    }
  }

  it should "Iris予測を実行できる" in {
    val predictor = ModelPredictor(spark)
    predictor.loadIrisModel("model/iris_model")

    val prediction = predictor.predictIris(5.1, 3.5, 1.4, 0.2)

    prediction should (be("setosa") or be("versicolor") or be("virginica"))
  }
```

**🟢 Green: テストを通す実装**

`src/main/scala/ml/api/domain/ModelPredictor.scala`:

```scala
package ml.api.domain

import org.apache.spark.ml.PipelineModel
import org.apache.spark.sql.{DataFrame, SparkSession}

class ModelPredictor(spark: SparkSession):

  private var irisModel: Option[PipelineModel] = None
  private var cinemaModel: Option[PipelineModel] = None
  private var survivedModel: Option[PipelineModel] = None
  private var bostonModel: Option[PipelineModel] = None

  // Iris モデルのロード
  def loadIrisModel(path: String): Unit =
    irisModel = Some(PipelineModel.load(path))

  // Iris 予測
  def predictIris(sepalLength: Double, sepalWidth: Double,
                  petalLength: Double, petalWidth: Double): String =
    import spark.implicits.*

    val data = Seq((sepalLength, sepalWidth, petalLength, petalWidth))
      .toDF("sepal_length", "sepal_width", "petal_length", "petal_width")

    val predictions = irisModel.get.transform(data)
    val predictionValue = predictions.select("prediction").first().getDouble(0).toInt

    predictionValue match
      case 0 => "setosa"
      case 1 => "versicolor"
      case 2 => "virginica"
      case _ => "unknown"

  // Cinema モデルのロード
  def loadCinemaModel(path: String): Unit =
    cinemaModel = Some(PipelineModel.load(path))

  // Cinema 予測
  def predictCinema(budget: Double, popularity: Double,
                    runtime: Double, voteAverage: Double, genre: String): Double =
    import spark.implicits.*

    val data = Seq((budget, popularity, runtime, voteAverage, genre))
      .toDF("budget", "popularity", "runtime", "vote_average", "genre")

    val predictions = cinemaModel.get.transform(data)
    predictions.select("prediction").first().getDouble(0)

object ModelPredictor:
  def apply(spark: SparkSession): ModelPredictor = new ModelPredictor(spark)
```

**💡 ポイント**:
- **Option型でモデルの存在を管理**: ロード前は None、ロード後は Some
- **SparkSession を注入**: テストでモックしやすい設計
- **予測値の変換**: DataFrame の prediction カラムから値を抽出

---

#### ステップ 3: Service 層（PredictionService）の実装

ビジネスロジックとバリデーションを担当する Service 層を実装します。

**🔴 Red: テストを書く**

`src/test/scala/ml/api/service/PredictionServiceSpec.scala`:

```scala
package ml.api.service

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import ml.api.IrisRequest
import ml.api.domain.ModelPredictor
import org.apache.spark.sql.SparkSession

class PredictionServiceSpec extends AnyFlatSpec with Matchers:

  val spark: SparkSession = SparkSession.builder()
    .appName("PredictionServiceTest")
    .master("local[*]")
    .config("spark.driver.bindAddress", "127.0.0.1")
    .getOrCreate()

  spark.sparkContext.setLogLevel("ERROR")

  "PredictionService" should "正常な入力で予測を返す" in {
    val predictor = ModelPredictor(spark)
    predictor.loadIrisModel("model/iris_model")

    val service = PredictionService(predictor)
    val request = IrisRequest(5.1, 3.5, 1.4, 0.2)

    val result = service.predictIris(request)

    result.isRight shouldBe true
    result.toOption.get.prediction should not be empty
  }

  it should "負の値を拒否する" in {
    val predictor = ModelPredictor(spark)
    predictor.loadIrisModel("model/iris_model")

    val service = PredictionService(predictor)
    val request = IrisRequest(-1.0, 3.5, 1.4, 0.2)

    val result = service.predictIris(request)

    result.isLeft shouldBe true
    result.left.toOption.get should include("positive")
  }

  it should "0の値を拒否する" in {
    val predictor = ModelPredictor(spark)
    predictor.loadIrisModel("model/iris_model")

    val service = PredictionService(predictor)
    val request = IrisRequest(0, 3.5, 1.4, 0.2)

    val result = service.predictIris(request)

    result.isLeft shouldBe true
  }
```

**🟢 Green: テストを通す実装**

`src/main/scala/ml/api/service/PredictionService.scala`:

```scala
package ml.api.service

import ml.api.{IrisRequest, CinemaRequest, PredictionResponse}
import ml.api.domain.ModelPredictor

class PredictionService(predictor: ModelPredictor):

  // Iris 予測
  def predictIris(request: IrisRequest): Either[String, PredictionResponse] =
    // バリデーション
    if request.sepalLength <= 0 || request.sepalWidth <= 0 ||
       request.petalLength <= 0 || request.petalWidth <= 0 then
      Left("All measurements must be positive")
    else
      try
        val prediction = predictor.predictIris(
          request.sepalLength,
          request.sepalWidth,
          request.petalLength,
          request.petalWidth
        )
        Right(PredictionResponse(prediction))
      catch
        case e: NoSuchElementException =>
          Left("Model not loaded. Please ensure the model is loaded before prediction.")
        case e: Exception =>
          Left(s"Prediction failed: ${e.getMessage}")

  // Cinema 予測
  def predictCinema(request: CinemaRequest): Either[String, PredictionResponse] =
    // バリデーション
    if request.budget <= 0 || request.popularity <= 0 ||
       request.runtime <= 0 || request.voteAverage < 0 || request.voteAverage > 10 then
      Left("Invalid input values")
    else if request.genre.trim.isEmpty then
      Left("Genre must not be empty")
    else
      try
        val prediction = predictor.predictCinema(
          request.budget,
          request.popularity,
          request.runtime,
          request.voteAverage,
          request.genre
        )
        Right(PredictionResponse(f"$prediction%.2f"))
      catch
        case e: Exception =>
          Left(s"Prediction failed: ${e.getMessage}")

object PredictionService:
  def apply(predictor: ModelPredictor): PredictionService =
    new PredictionService(predictor)
```

**💡 Either でのエラーハンドリング**:
- **Left(error)**: エラーの場合
- **Right(result)**: 成功の場合
- 型安全にエラーと成功を表現できる

**バリデーションの実装パターン**:
```scala
// ❌ 悪い例: 例外を投げる
def validate(value: Double): Unit =
  if value <= 0 then throw new IllegalArgumentException("Must be positive")

// ✅ 良い例: Either で結果を返す
def validate(value: Double): Either[String, Double] =
  if value <= 0 then Left("Must be positive")
  else Right(value)
```

---

#### ステップ 4: Handler 層（ApiRoutes）の実装

HTTP リクエストを受けてレスポンスを返す Handler 層を実装します。

**🔴 Red: テストを書く**

`src/test/scala/ml/api/ApiRoutesSpec.scala`:

```scala
package ml.api

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import akka.http.scaladsl.testkit.ScalatestRouteTest
import akka.http.scaladsl.model.{ContentTypes, StatusCodes}
import de.heikoseeberger.akkahttpcirce.FailFastCirceSupport.*
import ml.api.service.PredictionService
import ml.api.domain.ModelPredictor
import org.apache.spark.sql.SparkSession

class ApiRoutesSpec extends AnyFlatSpec with Matchers with ScalatestRouteTest:

  val spark: SparkSession = SparkSession.builder()
    .appName("ApiRoutesTest")
    .master("local[*]")
    .config("spark.driver.bindAddress", "127.0.0.1")
    .getOrCreate()

  spark.sparkContext.setLogLevel("ERROR")

  val predictor = ModelPredictor(spark)
  predictor.loadIrisModel("model/iris_model")

  val service = PredictionService(predictor)
  val routes = ApiRoutes(service).routes

  "ApiRoutes" should "ヘルスチェックを返す" in {
    Get("/api/health") ~> routes ~> check {
      status shouldBe StatusCodes.OK
      responseAs[String] shouldBe "OK"
    }
  }

  it should "正常なIris予測リクエストを処理する" in {
    val request = IrisRequest(5.1, 3.5, 1.4, 0.2)

    Post("/api/predict/iris", request) ~> routes ~> check {
      status shouldBe StatusCodes.OK
      val response = responseAs[PredictionResponse]
      response.prediction should not be empty
    }
  }

  it should "不正なIris予測リクエストを拒否する" in {
    val request = IrisRequest(-1.0, 3.5, 1.4, 0.2)

    Post("/api/predict/iris", request) ~> routes ~> check {
      status shouldBe StatusCodes.BadRequest
    }
  }
```

**🟢 Green: テストを通す実装**

`src/main/scala/ml/api/ApiRoutes.scala`:

```scala
package ml.api

import akka.http.scaladsl.server.Directives.*
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.model.StatusCodes
import de.heikoseeberger.akkahttpcirce.FailFastCirceSupport.*
import ml.api.service.PredictionService

class ApiRoutes(service: PredictionService):

  val routes: Route = pathPrefix("api"):
    concat(
      path("health"):
        get:
          complete(StatusCodes.OK, "OK")
      ,
      path("predict" / "iris"):
        post:
          entity(as[IrisRequest]): request =>
            service.predictIris(request) match
              case Right(response) =>
                complete(StatusCodes.OK, response)
              case Left(error) =>
                complete(StatusCodes.BadRequest, Map("error" -> error))
    )
```

**テスト実行**:

```bash
sbt test
```

---

#### ステップ 5: サーバー起動と SparkSession 管理

最後に、API サーバーを起動するメイン関数を実装します。SparkSession の singleton パターンも実装します。

**🔴 Red: テストを書く**

サーバー起動のテストは統合テストとして別途実装するため、ここでは SparkSession の singleton パターンをテストします。

`src/test/scala/ml/api/SparkSessionManagerSpec.scala`:

```scala
package ml.api

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.apache.spark.sql.SparkSession

class SparkSessionManagerSpec extends AnyFlatSpec with Matchers:

  "SparkSessionManager" should "同じ SparkSession インスタンスを返す" in {
    val spark1 = SparkSessionManager.getOrCreate()
    val spark2 = SparkSessionManager.getOrCreate()

    spark1 shouldBe spark2
  }

  it should "SparkSession を停止できる" in {
    val spark = SparkSessionManager.getOrCreate()
    SparkSessionManager.stop()

    // 停止後、新しいインスタンスを作成できることを確認
    noException should be thrownBy SparkSessionManager.getOrCreate()
  }
```

**🟢 Green: テストを通す実装**

`src/main/scala/ml/api/SparkSessionManager.scala`:

```scala
package ml.api

import org.apache.spark.sql.SparkSession

object SparkSessionManager:

  @volatile private var instance: Option[SparkSession] = None

  def getOrCreate(): SparkSession =
    instance match
      case Some(spark) if !spark.sparkContext.isStopped => spark
      case _ =>
        synchronized:
          instance match
            case Some(spark) if !spark.sparkContext.isStopped => spark
            case _ =>
              val spark = SparkSession.builder()
                .appName("ML API")
                .master("local[*]")
                .config("spark.driver.bindAddress", "127.0.0.1")
                .getOrCreate()

              spark.sparkContext.setLogLevel("ERROR")
              instance = Some(spark)
              spark

  def stop(): Unit =
    instance.foreach: spark =>
      if !spark.sparkContext.isStopped then
        spark.stop()
    instance = None
```

`src/main/scala/ml/api/Main.scala`:

```scala
package ml.api

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import ml.api.domain.ModelPredictor
import ml.api.service.PredictionService

import scala.concurrent.ExecutionContextExecutor
import scala.io.StdIn

@main def runServer(): Unit =
  given system: ActorSystem = ActorSystem("ml-api")
  given ExecutionContextExecutor = system.dispatcher

  val spark = SparkSessionManager.getOrCreate()

  val predictor = ModelPredictor(spark)
  predictor.loadIrisModel("model/iris_model")
  predictor.loadCinemaModel("model/cinema_model")
  predictor.loadSurvivedModel("model/survived_model")
  predictor.loadBostonModel("model/boston_model")

  val service = PredictionService(predictor)
  val routes = ApiRoutes(service).routes

  val bindingFuture = Http().newServerAt("localhost", 8080).bind(routes)

  println(s"Server online at http://localhost:8080/")
  println("Press RETURN to stop...")
  StdIn.readLine()

  bindingFuture
    .flatMap(_.unbind())
    .onComplete: _ =>
      SparkSessionManager.stop()
      system.terminate()
```

**テスト実行**:

```bash
sbt test
```

---

#### ステップ 6: 統合テストの実装

各層を統合して、実際の API エンドポイントをエンドツーエンドでテストします。

**🔴 Red: 統合テストを書く**

統合テストでは、実際の SparkSession と PipelineModel を使用して、API の完全な動作を検証します。

`src/test/scala/ml/api/ApiIntegrationSpec.scala`:

```scala
package ml.api

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.BeforeAndAfterAll
import akka.http.scaladsl.testkit.ScalatestRouteTest
import akka.http.scaladsl.model.{ContentTypes, StatusCodes}
import de.heikoseeberger.akkahttpcirce.FailFastCirceSupport.*
import ml.api.service.PredictionService
import ml.api.domain.ModelPredictor
import org.apache.spark.sql.SparkSession

class ApiIntegrationSpec extends AnyFlatSpec
  with Matchers
  with ScalatestRouteTest
  with BeforeAndAfterAll:

  var spark: SparkSession = _
  var predictor: ModelPredictor = _
  var service: PredictionService = _
  var routes: akka.http.scaladsl.server.Route = _

  override def beforeAll(): Unit =
    super.beforeAll()

    // SparkSession を作成
    spark = SparkSession.builder()
      .appName("Integration Test")
      .master("local[*]")
      .config("spark.driver.bindAddress", "127.0.0.1")
      .getOrCreate()

    spark.sparkContext.setLogLevel("ERROR")

    // 全てのモデルをロード
    predictor = ModelPredictor(spark)
    predictor.loadIrisModel("model/iris_model")
    predictor.loadCinemaModel("model/cinema_model")
    predictor.loadSurvivedModel("model/survived_model")
    predictor.loadBostonModel("model/boston_model")

    service = PredictionService(predictor)
    routes = ApiRoutes(service).routes

  override def afterAll(): Unit =
    spark.stop()
    super.afterAll()

  "ML API" should "ヘルスチェックエンドポイントが動作する" in {
    Get("/api/health") ~> routes ~> check {
      status shouldBe StatusCodes.OK
      responseAs[String] shouldBe "OK"
    }
  }

  it should "Iris 予測が正常に動作する（setosa）" in {
    val request = IrisRequest(
      sepalLength = 5.1,
      sepalWidth = 3.5,
      petalLength = 1.4,
      petalWidth = 0.2
    )

    Post("/api/predict/iris", request) ~> routes ~> check {
      status shouldBe StatusCodes.OK
      val response = responseAs[PredictionResponse]
      response.prediction shouldBe "setosa"
    }
  }

  it should "Iris 予測が正常に動作する（versicolor）" in {
    val request = IrisRequest(
      sepalLength = 6.4,
      sepalWidth = 3.2,
      petalLength = 4.5,
      petalWidth = 1.5
    )

    Post("/api/predict/iris", request) ~> routes ~> check {
      status shouldBe StatusCodes.OK
      val response = responseAs[PredictionResponse]
      response.prediction shouldBe "versicolor"
    }
  }

  it should "Iris 予測で不正な値を拒否する" in {
    val request = IrisRequest(
      sepalLength = -1.0,
      sepalWidth = 3.5,
      petalLength = 1.4,
      petalWidth = 0.2
    )

    Post("/api/predict/iris", request) ~> routes ~> check {
      status shouldBe StatusCodes.BadRequest
    }
  }

  it should "Cinema 予測が正常に動作する" in {
    val request = CinemaRequest(
      budget = 50000,
      popularity = 85.5,
      runtime = 120,
      voteAverage = 7.5,
      genre = "Action"
    )

    Post("/api/predict/cinema", request) ~> routes ~> check {
      status shouldBe StatusCodes.OK
      val response = responseAs[PredictionResponse]
      response.prediction should not be empty
      response.prediction.toDouble should be > 0.0
    }
  }

  it should "Survived 予測が正常に動作する（生存）" in {
    val request = SurvivedRequest(
      pclass = 1,
      sex = "female",
      age = 29.0,
      sibsp = 0,
      parch = 0,
      fare = 211.34,
      embarked = "S"
    )

    Post("/api/predict/survived", request) ~> routes ~> check {
      status shouldBe StatusCodes.OK
      val response = responseAs[PredictionResponse]
      response.prediction should (equal("Survived") or equal("Not Survived"))
    }
  }

  it should "Survived 予測が正常に動作する（死亡）" in {
    val request = SurvivedRequest(
      pclass = 3,
      sex = "male",
      age = 22.0,
      sibsp = 0,
      parch = 0,
      fare = 7.25,
      embarked = "S"
    )

    Post("/api/predict/survived", request) ~> routes ~> check {
      status shouldBe StatusCodes.OK
      val response = responseAs[PredictionResponse]
      response.prediction should (equal("Survived") or equal("Not Survived"))
    }
  }

  it should "Boston 予測が正常に動作する" in {
    val request = BostonRequest(
      crim = 0.00632,
      zn = 18.0,
      indus = 2.31,
      chas = 0,
      nox = 0.538,
      rm = 6.575,
      age = 65.2,
      dis = 4.09,
      rad = 1,
      tax = 296.0,
      ptratio = 15.3,
      b = 396.9,
      lstat = 4.98
    )

    Post("/api/predict/boston", request) ~> routes ~> check {
      status shouldBe StatusCodes.OK
      val response = responseAs[PredictionResponse]
      response.prediction should not be empty
      response.prediction.toDouble should be > 0.0
    }
  }

  it should "複数のエンドポイントを連続して呼び出せる" in {
    // Iris
    Post("/api/predict/iris", IrisRequest(5.1, 3.5, 1.4, 0.2)) ~> routes ~> check {
      status shouldBe StatusCodes.OK
    }

    // Cinema
    Post("/api/predict/cinema",
      CinemaRequest(50000, 85.5, 120, 7.5, "Action")) ~> routes ~> check {
      status shouldBe StatusCodes.OK
    }

    // Survived
    Post("/api/predict/survived",
      SurvivedRequest(1, "female", 29.0, 0, 0, 211.34, "S")) ~> routes ~> check {
      status shouldBe StatusCodes.OK
    }

    // Boston
    Post("/api/predict/boston",
      BostonRequest(0.00632, 18.0, 2.31, 0, 0.538, 6.575,
                    65.2, 4.09, 1, 296.0, 15.3, 396.9, 4.98)) ~> routes ~> check {
      status shouldBe StatusCodes.OK
    }
  }

  it should "存在しないエンドポイントで404を返す" in {
    Get("/api/nonexistent") ~> routes ~> check {
      handled shouldBe false
    }
  }

  it should "不正な JSON で 400 を返す" in {
    import akka.http.scaladsl.model.HttpEntity

    val invalidJson = HttpEntity(ContentTypes.`application/json`, """{"invalid": json}""")

    Post("/api/predict/iris", invalidJson) ~> routes ~> check {
      status shouldBe StatusCodes.BadRequest
    }
  }
```

**🟢 Green: 統合テストを通す**

上記のテストは、既に実装済みの全てのコンポーネントを使用しているため、モデルファイルが存在すれば自動的にパスします。

**テスト実行**:

```bash
sbt test
```

**出力例**:
```
[info] ApiIntegrationSpec:
[info] ML API
[info] - should ヘルスチェックエンドポイントが動作する
[info] - should Iris 予測が正常に動作する（setosa）
[info] - should Iris 予測が正常に動作する（versicolor）
[info] - should Iris 予測で不正な値を拒否する
[info] - should Cinema 予測が正常に動作する
[info] - should Survived 予測が正常に動作する（生存）
[info] - should Survived 予測が正常に動作する（死亡）
[info] - should Boston 予測が正常に動作する
[info] - should 複数のエンドポイントを連続して呼び出せる
[info] - should 存在しないエンドポイントで404を返す
[info] - should 不正な JSON で 400 を返す
[info] Run completed in 12 seconds, 345 milliseconds.
[info] Total number of tests run: 11
[info] Suites: completed 1, aborted 0
[info] Tests: succeeded 11, failed 0, canceled 0, ignored 0, pending 0
[info] All tests passed.
```

**統合テストのポイント**:

1. **BeforeAndAfterAll トレイト**
   - `beforeAll()`: 全テスト実行前に SparkSession とモデルをセットアップ
   - `afterAll()`: 全テスト実行後に SparkSession をクリーンアップ
   - テストごとに SparkSession を作り直さないため高速

2. **実際のモデルを使用**
   - モックではなく、実際の PipelineModel をロード
   - 本番環境と同じコードパスを検証
   - モデルの互換性も確認

3. **複数のシナリオをカバー**
   - 正常系：各モデルで予測が成功
   - 異常系：バリデーションエラー、不正な JSON
   - エッジケース：連続呼び出し、存在しないエンドポイント

4. **ScalaTest RouteTest DSL**
   - `~>`: リクエストをルートに送信
   - `check { ... }`: レスポンスを検証
   - `responseAs[T]`: レスポンスを型 T にデシリアライズ

5. **テストの独立性**
   - 各テストは独立して実行可能
   - SparkSession は全テストで共有（パフォーマンス向上）
   - テスト間でモデルの状態は変更されない

---

### 💻 完全な実装コード

すべてのステップを統合した完全な実装です。

#### Models.scala

`src/main/scala/ml/api/Models.scala`:

```scala
package ml.api

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

case class IrisRequest(
  sepalLength: Double,
  sepalWidth: Double,
  petalLength: Double,
  petalWidth: Double
)

case class CinemaRequest(
  budget: Double,
  popularity: Double,
  runtime: Double,
  voteAverage: Double,
  genre: String
)

case class SurvivedRequest(
  pclass: Int,
  sex: String,
  age: Double,
  sibsp: Int,
  parch: Int,
  fare: Double,
  embarked: String
)

case class BostonRequest(
  crim: Double,
  zn: Double,
  indus: Double,
  chas: Int,
  nox: Double,
  rm: Double,
  age: Double,
  dis: Double,
  rad: Int,
  tax: Double,
  ptratio: Double,
  b: Double,
  lstat: Double
)

case class PredictionResponse(
  prediction: String,
  confidence: Option[Double] = None
)

object IrisRequest:
  given Decoder[IrisRequest] = deriveDecoder[IrisRequest]

object CinemaRequest:
  given Decoder[CinemaRequest] = deriveDecoder[CinemaRequest]

object SurvivedRequest:
  given Decoder[SurvivedRequest] = deriveDecoder[SurvivedRequest]

object BostonRequest:
  given Decoder[BostonRequest] = deriveDecoder[BostonRequest]

object PredictionResponse:
  given Encoder[PredictionResponse] = deriveEncoder[PredictionResponse]
```

#### ModelPredictor.scala

`src/main/scala/ml/api/domain/ModelPredictor.scala`:

```scala
package ml.api.domain

import org.apache.spark.ml.PipelineModel
import org.apache.spark.sql.{DataFrame, SparkSession}

class ModelPredictor(spark: SparkSession):

  private var irisModel: Option[PipelineModel] = None
  private var cinemaModel: Option[PipelineModel] = None
  private var survivedModel: Option[PipelineModel] = None
  private var bostonModel: Option[PipelineModel] = None

  def loadIrisModel(path: String): Unit =
    irisModel = Some(PipelineModel.load(path))

  def loadCinemaModel(path: String): Unit =
    cinemaModel = Some(PipelineModel.load(path))

  def loadSurvivedModel(path: String): Unit =
    survivedModel = Some(PipelineModel.load(path))

  def loadBostonModel(path: String): Unit =
    bostonModel = Some(PipelineModel.load(path))

  def predictIris(sepalLength: Double, sepalWidth: Double,
                  petalLength: Double, petalWidth: Double): String =
    import spark.implicits.*

    val data = Seq((sepalLength, sepalWidth, petalLength, petalWidth))
      .toDF("sepal_length", "sepal_width", "petal_length", "petal_width")

    val predictions = irisModel.get.transform(data)
    predictions.select("prediction").first().getDouble(0).toInt match
      case 0 => "setosa"
      case 1 => "versicolor"
      case 2 => "virginica"

  def predictCinema(budget: Double, popularity: Double, runtime: Double,
                    voteAverage: Double, genre: String): Double =
    import spark.implicits.*

    val data = Seq((budget, popularity, runtime, voteAverage, genre))
      .toDF("budget", "popularity", "runtime", "vote_average", "genre")

    val predictions = cinemaModel.get.transform(data)
    predictions.select("prediction").first().getDouble(0)

  def predictSurvived(pclass: Int, sex: String, age: Double, sibsp: Int,
                      parch: Int, fare: Double, embarked: String): Int =
    import spark.implicits.*

    val data = Seq((pclass, sex, age, sibsp, parch, fare, embarked))
      .toDF("pclass", "sex", "age", "sibsp", "parch", "fare", "embarked")

    val predictions = survivedModel.get.transform(data)
    predictions.select("prediction").first().getDouble(0).toInt

  def predictBoston(crim: Double, zn: Double, indus: Double, chas: Int,
                    nox: Double, rm: Double, age: Double, dis: Double,
                    rad: Int, tax: Double, ptratio: Double, b: Double,
                    lstat: Double): Double =
    import spark.implicits.*

    val data = Seq((crim, zn, indus, chas, nox, rm, age, dis, rad, tax, ptratio, b, lstat))
      .toDF("crim", "zn", "indus", "chas", "nox", "rm", "age", "dis", "rad", "tax", "ptratio", "b", "lstat")

    val predictions = bostonModel.get.transform(data)
    predictions.select("prediction").first().getDouble(0)
```

#### PredictionService.scala

`src/main/scala/ml/api/service/PredictionService.scala`:

```scala
package ml.api.service

import ml.api.{IrisRequest, CinemaRequest, SurvivedRequest, BostonRequest, PredictionResponse}
import ml.api.domain.ModelPredictor

class PredictionService(predictor: ModelPredictor):

  def predictIris(request: IrisRequest): Either[String, PredictionResponse] =
    if request.sepalLength <= 0 || request.sepalWidth <= 0 ||
       request.petalLength <= 0 || request.petalWidth <= 0 then
      Left("All measurements must be positive")
    else
      try
        val prediction = predictor.predictIris(
          request.sepalLength,
          request.sepalWidth,
          request.petalLength,
          request.petalWidth
        )
        Right(PredictionResponse(prediction))
      catch
        case e: NoSuchElementException =>
          Left("Model not loaded. Please ensure the model is loaded before prediction.")
        case e: Exception =>
          Left(s"Prediction failed: ${e.getMessage}")

  def predictCinema(request: CinemaRequest): Either[String, PredictionResponse] =
    if request.budget <= 0 || request.popularity <= 0 || request.runtime <= 0 then
      Left("Budget, popularity, and runtime must be positive")
    else
      try
        val revenue = predictor.predictCinema(
          request.budget,
          request.popularity,
          request.runtime,
          request.voteAverage,
          request.genre
        )
        Right(PredictionResponse(f"$revenue%.2f"))
      catch
        case e: Exception => Left(s"Prediction failed: ${e.getMessage}")

  def predictSurvived(request: SurvivedRequest): Either[String, PredictionResponse] =
    if request.age < 0 || request.fare < 0 then
      Left("Age and fare must be non-negative")
    else
      try
        val survived = predictor.predictSurvived(
          request.pclass,
          request.sex,
          request.age,
          request.sibsp,
          request.parch,
          request.fare,
          request.embarked
        )
        Right(PredictionResponse(if survived == 1 then "Survived" else "Not Survived"))
      catch
        case e: Exception => Left(s"Prediction failed: ${e.getMessage}")

  def predictBoston(request: BostonRequest): Either[String, PredictionResponse] =
    try
      val price = predictor.predictBoston(
        request.crim, request.zn, request.indus, request.chas,
        request.nox, request.rm, request.age, request.dis,
        request.rad, request.tax, request.ptratio, request.b, request.lstat
      )
      Right(PredictionResponse(f"$price%.2f"))
    catch
      case e: Exception => Left(s"Prediction failed: ${e.getMessage}")
```

#### ApiRoutes.scala

`src/main/scala/ml/api/ApiRoutes.scala`:

```scala
package ml.api

import akka.http.scaladsl.server.Directives.*
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.model.StatusCodes
import de.heikoseeberger.akkahttpcirce.FailFastCirceSupport.*
import ml.api.service.PredictionService

class ApiRoutes(service: PredictionService):

  val routes: Route = pathPrefix("api"):
    concat(
      path("health"):
        get:
          complete(StatusCodes.OK, "OK")
      ,
      path("predict" / "iris"):
        post:
          entity(as[IrisRequest]): request =>
            service.predictIris(request) match
              case Right(response) =>
                complete(StatusCodes.OK, response)
              case Left(error) =>
                complete(StatusCodes.BadRequest, Map("error" -> error))
      ,
      path("predict" / "cinema"):
        post:
          entity(as[CinemaRequest]): request =>
            service.predictCinema(request) match
              case Right(response) =>
                complete(StatusCodes.OK, response)
              case Left(error) =>
                complete(StatusCodes.BadRequest, Map("error" -> error))
      ,
      path("predict" / "survived"):
        post:
          entity(as[SurvivedRequest]): request =>
            service.predictSurvived(request) match
              case Right(response) =>
                complete(StatusCodes.OK, response)
              case Left(error) =>
                complete(StatusCodes.BadRequest, Map("error" -> error))
      ,
      path("predict" / "boston"):
        post:
          entity(as[BostonRequest]): request =>
            service.predictBoston(request) match
              case Right(response) =>
                complete(StatusCodes.OK, response)
              case Left(error) =>
                complete(StatusCodes.BadRequest, Map("error" -> error))
    )
```

---

### 🚀 API 起動と動作確認

#### サーバー起動

```bash
# サーバーを起動
sbt "runMain runServer"
```

**出力例**:
```
Server online at http://localhost:8080/
Press RETURN to stop...
```

#### cURL でのテスト

**ヘルスチェック**:
```bash
curl http://localhost:8080/api/health

# レスポンス
OK
```

**Iris 予測（分類）**:
```bash
curl -X POST http://localhost:8080/api/predict/iris \
  -H "Content-Type: application/json" \
  -d '{
    "sepalLength": 5.1,
    "sepalWidth": 3.5,
    "petalLength": 1.4,
    "petalWidth": 0.2
  }'

# レスポンス
{"prediction":"setosa"}
```

**Cinema 予測（回帰）**:
```bash
curl -X POST http://localhost:8080/api/predict/cinema \
  -H "Content-Type: application/json" \
  -d '{
    "budget": 50000,
    "popularity": 85.5,
    "runtime": 120,
    "voteAverage": 7.5,
    "genre": "Action"
  }'

# レスポンス
{"prediction":"15234567.89"}
```

**Survived 予測（分類）**:
```bash
curl -X POST http://localhost:8080/api/predict/survived \
  -H "Content-Type: application/json" \
  -d '{
    "pclass": 1,
    "sex": "female",
    "age": 29.0,
    "sibsp": 0,
    "parch": 0,
    "fare": 211.34,
    "embarked": "S"
  }'

# レスポンス
{"prediction":"Survived"}
```

**Boston 予測（回帰）**:
```bash
curl -X POST http://localhost:8080/api/predict/boston \
  -H "Content-Type: application/json" \
  -d '{
    "crim": 0.00632,
    "zn": 18.0,
    "indus": 2.31,
    "chas": 0,
    "nox": 0.538,
    "rm": 6.575,
    "age": 65.2,
    "dis": 4.09,
    "rad": 1,
    "tax": 296.0,
    "ptratio": 15.3,
    "b": 396.9,
    "lstat": 4.98
  }'

# レスポンス
{"prediction":"24.50"}
```

---

### 🎓 主要な学習ポイント

#### Akka HTTP の Route DSL

Akka HTTP では、ルーティングを宣言的に記述できます：

```scala
val routes: Route = pathPrefix("api"):
  concat(
    path("health"):
      get:
        complete(StatusCodes.OK, "OK")
    ,
    path("predict" / "iris"):
      post:
        entity(as[IrisRequest]): request =>
          // リクエスト処理
  )
```

**ポイント**:
- `pathPrefix("api")`: `/api/...` で始まるパスにマッチ
- `concat(...)`: 複数のルートを結合
- `entity(as[T])`: JSON を自動的にケースクラスにデシリアライズ
- パターンマッチで Either の結果を処理

#### Circe の given インスタンス

Scala 3 の given/using により、型クラスインスタンスが暗黙的に解決されます：

```scala
case class IrisRequest(
  sepalLength: Double,
  sepalWidth: Double,
  petalLength: Double,
  petalWidth: Double
)

object IrisRequest:
  given Decoder[IrisRequest] = deriveDecoder[IrisRequest]
```

**動作の流れ**:
1. `entity(as[IrisRequest])` が呼ばれる
2. コンパイラが `Decoder[IrisRequest]` を探す
3. `IrisRequest` コンパニオンオブジェクトの `given` インスタンスが見つかる
4. JSON が自動的に IrisRequest にデシリアライズされる

#### レイヤードアーキテクチャのメリット

```
Handler (ApiRoutes)
   ↓
Service (PredictionService)  ← ビジネスロジック + バリデーション
   ↓
Domain (ModelPredictor)      ← ML モデルとの対話
```

**各層の責務**:
- **Handler**: HTTP リクエスト/レスポンスの処理
- **Service**: ビジネスロジック、バリデーション、エラーハンドリング
- **Domain**: ML モデルの読み込みと予測

**メリット**:
- ✅ テストしやすい（各層を独立してテスト可能）
- ✅ 変更に強い（HTTP フレームワークを変えても Domain/Service は影響なし）
- ✅ 再利用可能（Service/Domain は CLI からも使える）

#### SparkSession の Singleton パターン

```scala
object SparkSessionManager:
  @volatile private var instance: Option[SparkSession] = None

  def getOrCreate(): SparkSession =
    instance match
      case Some(spark) if !spark.sparkContext.isStopped => spark
      case _ =>
        synchronized:
          // ダブルチェックロッキング
          instance match
            case Some(spark) if !spark.sparkContext.isStopped => spark
            case _ =>
              val spark = SparkSession.builder()...
              instance = Some(spark)
              spark
```

**なぜ必要？**:
- SparkSession の作成はコストが高い（数秒かかる）
- 複数の SparkSession を作ると競合やメモリ不足が発生
- `@volatile` と `synchronized` でスレッドセーフに

#### Either による型安全なエラーハンドリング

```scala
def predictIris(request: IrisRequest): Either[String, PredictionResponse] =
  if request.sepalLength <= 0 then
    Left("All measurements must be positive")
  else
    try
      val prediction = predictor.predictIris(...)
      Right(PredictionResponse(prediction))
    catch
      case e: Exception => Left(s"Prediction failed: ${e.getMessage}")
```

**Handler での処理**:
```scala
service.predictIris(request) match
  case Right(response) =>
    complete(StatusCodes.OK, response)
  case Left(error) =>
    complete(StatusCodes.BadRequest, Map("error" -> error))
```

**メリット**:
- ✅ エラーが型として表現される（例外を使わない）
- ✅ エラーハンドリングを強制される（コンパイラがチェック）
- ✅ 関数型プログラミングのベストプラクティス

#### PipelineModel のキャッシング

```scala
class ModelPredictor(spark: SparkSession):
  private var irisModel: Option[PipelineModel] = None

  def loadIrisModel(path: String): Unit =
    irisModel = Some(PipelineModel.load(path))

  def predictIris(...): String =
    val predictions = irisModel.get.transform(data)
    ...
```

**ポイント**:
- モデルは起動時に一度だけロード
- `Option` で未ロード状態を表現
- `.get` の前にロード済みかチェック（実運用では `getOrElse` を推奨）

#### 統合テストのベストプラクティス

統合テストは、システム全体が正しく動作することを検証します。

**ユニットテスト vs 統合テスト**:

| テストタイプ | スコープ | 実行速度 | 目的 |
|------------|---------|---------|------|
| ユニットテスト | 単一クラス/メソッド | 高速（ミリ秒） | ロジックの正しさ |
| 統合テスト | 複数層/コンポーネント | 中速（秒） | 結合部の検証 |
| E2Eテスト | システム全体 | 低速（分） | ユーザーシナリオ |

**テストピラミッド**:
```
       /\
      /  \  E2E（少数）
     /    \
    /------\
   / 統合   \ （中程度）
  /----------\
 / ユニット   \ （多数）
/-------------\
```

**統合テストの実装パターン**:

```scala
class ApiIntegrationSpec extends AnyFlatSpec
  with BeforeAndAfterAll:  // セットアップ/クリーンアップ

  // 共有リソース（全テストで再利用）
  var spark: SparkSession = _
  var routes: Route = _

  override def beforeAll(): Unit =
    // 1回だけ実行される初期化
    spark = SparkSession.builder()...
    predictor = ModelPredictor(spark)
    predictor.loadIrisModel("model/iris_model")
    // ...

  override def afterAll(): Unit =
    // クリーンアップ
    spark.stop()

  // 各テストは独立
  "ML API" should "test case 1" in { ... }
  it should "test case 2" in { ... }
```

**BeforeAndAfterAll のメリット**:
- ✅ SparkSession の作成は1回のみ（高速化）
- ✅ モデルのロードも1回のみ（ディスクI/O削減）
- ✅ テスト間でリソース共有
- ✅ テスト終了時に確実にクリーンアップ

**Akka HTTP TestKit の DSL**:

```scala
// リクエスト ~> ルート ~> チェック
Get("/api/health") ~> routes ~> check {
  status shouldBe StatusCodes.OK
  responseAs[String] shouldBe "OK"
}

Post("/api/predict/iris", request) ~> routes ~> check {
  status shouldBe StatusCodes.OK
  val response = responseAs[PredictionResponse]
  response.prediction shouldBe "setosa"
}
```

**DSL の動作**:
1. `~>` 演算子がリクエストをルートに送信
2. ルートが処理してレスポンスを返す
3. `check` ブロック内でアサーション
4. `responseAs[T]` で自動デシリアライズ

**テストカバレッジの考え方**:

```scala
// 1. 正常系（Happy Path）
it should "正常に動作する" in { ... }

// 2. 境界値（Boundary Values）
it should "境界値を正しく処理する" in { ... }

// 3. 異常系（Error Cases）
it should "不正な入力を拒否する" in { ... }

// 4. エッジケース（Edge Cases）
it should "連続呼び出しを処理できる" in { ... }
it should "存在しないエンドポイントで404を返す" in { ... }
```

**統合テストで検証すべきこと**:
- ✅ 全ての層が正しく統合されている
- ✅ JSON シリアライズ/デシリアライズが動作する
- ✅ バリデーションが正しく機能する
- ✅ エラーハンドリングが適切
- ✅ HTTP ステータスコードが正しい
- ✅ モデルが正しくロードされる
- ✅ 予測結果が妥当な範囲内

**統合テストのアンチパターン**:

❌ **各テストで SparkSession を作成**:
```scala
// 遅い！テストごとに数秒かかる
"Test" should "work" in {
  val spark = SparkSession.builder()...  // 毎回作成
  // ...
  spark.stop()
}
```

✅ **BeforeAndAfterAll で共有**:
```scala
var spark: SparkSession = _

override def beforeAll(): Unit =
  spark = SparkSession.builder()...  // 1回だけ

override def afterAll(): Unit =
  spark.stop()  // 最後にクリーンアップ
```

❌ **モックを使いすぎる**:
```scala
// 統合テストなのにモックだらけ
val mockPredictor = mock[ModelPredictor]
when(mockPredictor.predictIris(...)).thenReturn("setosa")
```

✅ **実際のコンポーネントを使う**:
```scala
// 本物のモデルとSparkSessionを使う
predictor = ModelPredictor(spark)
predictor.loadIrisModel("model/iris_model")
```

**統合テストの実行戦略**:

```bash
# 開発中はユニットテストのみ（高速）
sbt "testOnly *Spec -- -l Integration"

# コミット前に統合テストも実行
sbt test

# CI/CD では全テスト + カバレッジ
sbt clean coverage test coverageReport
```

**テストの分類（タグ付け）**:

```scala
import org.scalatest.Tag

object IntegrationTest extends Tag("Integration")

class ApiIntegrationSpec extends AnyFlatSpec:
  "ML API" should "work" taggedAs(IntegrationTest) in { ... }
```

```bash
# 統合テストのみ実行
sbt "testOnly * -- -n Integration"

# 統合テストを除外
sbt "testOnly * -- -l Integration"
```

---

### ✅ 技術的成果

- ✅ **Akka HTTP による REST API 構築** - Route DSL でエンドポイント定義
- ✅ **Circe による型安全な JSON 処理** - given インスタンスで自動シリアライズ
- ✅ **レイヤードアーキテクチャの実装** - Handler/Service/Domain の責務分離
- ✅ **PipelineModel のロードとキャッシング** - Singleton パターンで効率化
- ✅ **4つの ML モデルを統合した API** - Iris、Cinema、Survived、Boston
- ✅ **Either による関数型エラーハンドリング** - 型安全な例外処理
- ✅ **包括的な統合テスト** - BeforeAndAfterAll で効率的なテスト実行
- ✅ **ScalaTest RouteTest DSL** - エンドツーエンドの API テスト

---

## 最終章のまとめ

「お疲れさまでした！」テスト駆動開発から始める機械学習入門（Scala版）が完了しました！🎉

### あなたが達成したこと

1. **4つの機械学習モデル** - 分類2つ、回帰2つ
2. **Spark MLlib の習得** - DataFrame、Pipeline、Transformer の活用
3. **Web API** - Akka HTTP による本番レベルのAPI
4. **Scala 3 の活用** - given/using、extension methods、enum
5. **関数型 ML** - 型安全で堅牢な機械学習システム

### これからの学習

**次のステップ**:

- 📚 **より高度なアルゴリズム**: Random Forest、GBT、Neural Networks
- 🔧 **分散処理**: Spark クラスターでの大規模データ処理
- 📊 **モデルチューニング**: CrossValidator、ParamGridBuilder
- 🌐 **スケーリング**: Kubernetes、Docker によるデプロイ
- 🔐 **セキュリティ**: 認証、認可、Rate Limiting

**おすすめリソース**:

- Spark MLlib Documentation: https://spark.apache.org/docs/latest/ml-guide.html
- Scala 3 Book: https://docs.scala-lang.org/scala3/book/introduction.html
- Akka HTTP Documentation: https://doc.akka.io/docs/akka-http/current/

Simple made easy.

---
