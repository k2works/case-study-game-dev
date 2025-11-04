package ml

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.apache.spark.sql.SparkSession

class SurvivedClassifierSpec extends AnyFlatSpec with Matchers {

  val spark: SparkSession = SparkSession.builder()
    .appName("SurvivedClassifierTest")
    .master("local[*]")
    .config("spark.driver.bindAddress", "127.0.0.1")
    .getOrCreate()

  spark.sparkContext.setLogLevel("ERROR")

  "SurvivedClassifier" should "データを読み込める" in {
    val classifier = SurvivedClassifier(spark)
    val df = classifier.loadData("data/Survived.csv")

    df.count() should be > 0L
    df.columns should contain allOf("age", "sex", "pclass", "sibsp", "parch", "fare", "embarked", "survived")
  }

  it should "欠損値を補完できる" in {
    val classifier = SurvivedClassifier(spark)
    val df = classifier.loadData("data/Survived.csv")

    val imputed = classifier.imputeMissingValues(df)

    // age_imputed と fare_imputed カラムが追加されているはず
    imputed.columns should contain("age_imputed")
    imputed.columns should contain("fare_imputed")

    // 欠損値が補完されているはず（nullがない）
    imputed.filter("age_imputed IS NULL").count() shouldBe 0
    imputed.filter("fare_imputed IS NULL").count() shouldBe 0
  }

  it should "カテゴリカル変数をエンコーディングできる" in {
    val classifier = SurvivedClassifier(spark)
    val df = classifier.loadData("data/Survived.csv")
    val imputed = classifier.imputeMissingValues(df)

    val encoded = classifier.encodeCategorical(imputed)

    // エンコード済みカラムが追加されているはず
    encoded.columns should contain("sex_vec")
    encoded.columns should contain("embarked_vec")
  }

  it should "外れ値を除去できる" in {
    val classifier = SurvivedClassifier(spark)
    val df = classifier.loadData("data/Survived.csv")
    val imputed = classifier.imputeMissingValues(df)

    val originalCount = imputed.count()
    val cleaned = classifier.removeOutliers(imputed)

    // 外れ値が除去されているはず（または同じ件数）
    cleaned.count() should be <= originalCount

    // 異常に高い運賃のデータがないはず
    cleaned.filter("fare_imputed > 500").count() shouldBe 0
  }

  it should "すべての特徴量を統合できる" in {
    val classifier = SurvivedClassifier(spark)
    val df = classifier.loadData("data/Survived.csv")
    val imputed = classifier.imputeMissingValues(df)
    val encoded = classifier.encodeCategorical(imputed)
    val cleaned = classifier.removeOutliers(encoded)

    val assembled = classifier.assembleFeatures(cleaned)

    // features カラムが追加されているはず
    assembled.columns should contain("features")
  }

  it should "データを訓練用とテスト用に分割できる" in {
    val classifier = SurvivedClassifier(spark)
    val df = classifier.loadData("data/Survived.csv")
    val imputed = classifier.imputeMissingValues(df)
    val encoded = classifier.encodeCategorical(imputed)
    val cleaned = classifier.removeOutliers(encoded)
    val assembled = classifier.assembleFeatures(cleaned)

    val (trainData, testData) = classifier.splitData(assembled)

    trainData.count() should be > 0L
    testData.count() should be > 0L
  }

  it should "LogisticRegressionモデルを訓練できる" in {
    val classifier = SurvivedClassifier(spark)
    val df = classifier.loadData("data/Survived.csv")
    val imputed = classifier.imputeMissingValues(df)
    val encoded = classifier.encodeCategorical(imputed)
    val cleaned = classifier.removeOutliers(encoded)
    val assembled = classifier.assembleFeatures(cleaned)
    val (trainData, testData) = classifier.splitData(assembled)

    val model = classifier.train(trainData)

    model should not be null
  }

  it should "モデルの性能を評価できる" in {
    val classifier = SurvivedClassifier(spark)
    val df = classifier.loadData("data/Survived.csv")
    val imputed = classifier.imputeMissingValues(df)
    val encoded = classifier.encodeCategorical(imputed)
    val cleaned = classifier.removeOutliers(encoded)
    val assembled = classifier.assembleFeatures(cleaned)
    val (trainData, testData) = classifier.splitData(assembled)
    val model = classifier.train(trainData)

    val accuracy = classifier.evaluate(model, testData)

    accuracy should be > 0.7  // 70%以上なら合格
  }

  it should "モデルを保存してロードできる" in {
    // Windows環境ではモデル永続化をスキップ
    val osName = System.getProperty("os.name").toLowerCase
    if (osName.contains("win")) {
      cancel("Model persistence is not supported on Windows due to Hadoop limitations")
    }

    val classifier = SurvivedClassifier(spark)
    val df = classifier.loadData("data/Survived.csv")
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
    accuracy should be > 0.7
  }
}
