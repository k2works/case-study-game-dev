package ml

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.apache.spark.sql.SparkSession

class BostonPredictorSpec extends AnyFlatSpec with Matchers {

  val spark: SparkSession = SparkSession.builder()
    .appName("BostonPredictorTest")
    .master("local[*]")
    .config("spark.driver.bindAddress", "127.0.0.1")
    .getOrCreate()

  spark.sparkContext.setLogLevel("ERROR")

  "BostonPredictor" should "データを読み込める" in {
    val predictor = BostonPredictor(spark)
    val df = predictor.loadData("data/Boston.csv")

    df.count() should be > 0L
    df.columns should contain allOf("CRIME", "RM", "LSTAT", "PTRATIO", "PRICE")
  }

  it should "カテゴリカル変数をエンコーディングできる" in {
    val predictor = BostonPredictor(spark)
    val df = predictor.loadData("data/Boston.csv")

    val encoded = predictor.encodeCategorical(df)

    // エンコード済みカラムが追加されているはず
    encoded.columns should contain("CRIME_vec")
  }

  it should "SQLTransformerで特徴量エンジニアリングできる" in {
    val predictor = BostonPredictor(spark)
    val df = predictor.loadData("data/Boston.csv")
    val encoded = predictor.encodeCategorical(df)

    val engineered = predictor.engineerFeatures(encoded)

    // 2乗項が追加されているはず
    engineered.columns should contain allOf("RM2", "LSTAT2", "PTRATIO2")

    // 交互作用項が追加されているはず
    engineered.columns should contain("RM_LSTAT")
  }

  it should "欠損値と外れ値を処理できる" in {
    val predictor = BostonPredictor(spark)
    val df = predictor.loadData("data/Boston.csv")
    val encoded = predictor.encodeCategorical(df)
    val engineered = predictor.engineerFeatures(encoded)

    val cleaned = predictor.cleanData(engineered)

    // 外れ値が除去されているはず（または同じ件数）
    cleaned.count() should be <= engineered.count()
  }

  it should "すべての特徴量を統合できる" in {
    val predictor = BostonPredictor(spark)
    val df = predictor.loadData("data/Boston.csv")
    val encoded = predictor.encodeCategorical(df)
    val engineered = predictor.engineerFeatures(encoded)
    val cleaned = predictor.cleanData(engineered)

    val assembled = predictor.assembleFeatures(cleaned)

    // features カラムが追加されているはず
    assembled.columns should contain("features")
  }

  it should "データを標準化できる" in {
    val predictor = BostonPredictor(spark)
    val df = predictor.loadData("data/Boston.csv")
    val encoded = predictor.encodeCategorical(df)
    val engineered = predictor.engineerFeatures(encoded)
    val cleaned = predictor.cleanData(engineered)
    val assembled = predictor.assembleFeatures(cleaned)

    val scaled = predictor.scaleFeatures(assembled)

    // scaled_features カラムが追加されているはず
    scaled.columns should contain("scaled_features")
  }

  it should "データを訓練用とテスト用に分割できる" in {
    val predictor = BostonPredictor(spark)
    val df = predictor.loadData("data/Boston.csv")
    val encoded = predictor.encodeCategorical(df)
    val engineered = predictor.engineerFeatures(encoded)
    val cleaned = predictor.cleanData(engineered)
    val assembled = predictor.assembleFeatures(cleaned)
    val scaled = predictor.scaleFeatures(assembled)

    val (trainData, testData) = predictor.splitData(scaled)

    trainData.count() should be > 0L
    testData.count() should be > 0L
  }

  it should "LinearRegressionモデルを訓練できる" in {
    val predictor = BostonPredictor(spark)
    val df = predictor.loadData("data/Boston.csv")
    val encoded = predictor.encodeCategorical(df)
    val engineered = predictor.engineerFeatures(encoded)
    val cleaned = predictor.cleanData(engineered)
    val assembled = predictor.assembleFeatures(cleaned)
    val scaled = predictor.scaleFeatures(assembled)
    val (trainData, testData) = predictor.splitData(scaled)

    val model = predictor.train(trainData)

    model should not be null
  }

  it should "モデルの性能を評価できる" in {
    val predictor = BostonPredictor(spark)
    val df = predictor.loadData("data/Boston.csv")
    val encoded = predictor.encodeCategorical(df)
    val engineered = predictor.engineerFeatures(encoded)
    val cleaned = predictor.cleanData(engineered)
    val assembled = predictor.assembleFeatures(cleaned)
    val scaled = predictor.scaleFeatures(assembled)
    val (trainData, testData) = predictor.splitData(scaled)
    val model = predictor.train(trainData)

    val r2 = predictor.evaluate(model, testData)

    r2 should be > 0.7  // R²が0.7以上なら合格
  }

  it should "モデルを保存してロードできる" in {
    // Windows環境ではモデル永続化をスキップ
    val osName = System.getProperty("os.name").toLowerCase
    if (osName.contains("win")) {
      cancel("Model persistence is not supported on Windows due to Hadoop limitations")
    }

    val predictor = BostonPredictor(spark)
    val df = predictor.loadData("data/Boston.csv")
    val encoded = predictor.encodeCategorical(df)
    val engineered = predictor.engineerFeatures(encoded)
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
}
