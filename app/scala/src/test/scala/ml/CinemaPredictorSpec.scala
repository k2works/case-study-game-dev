package ml

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.apache.spark.sql.SparkSession

class CinemaPredictorSpec extends AnyFlatSpec with Matchers {

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

  it should "ジャンルをOneHotエンコーディングできる" in {
    val predictor = CinemaPredictor(spark)
    val df = predictor.loadData("data/cinema.csv")

    val encoded = predictor.encodeGenre(df)

    // genre_index と genre_vec カラムが追加されているはず
    encoded.columns should contain("genre_index")
    encoded.columns should contain("genre_vec")
  }

  it should "すべての特徴量を統合できる" in {
    val predictor = CinemaPredictor(spark)
    val df = predictor.loadData("data/cinema.csv")
    val encoded = predictor.encodeGenre(df)

    val assembled = predictor.assembleFeatures(encoded)

    // features カラムが追加されているはず
    assembled.columns should contain("features")
  }

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

  it should "LinearRegressionモデルを訓練できる" in {
    val predictor = CinemaPredictor(spark)
    val df = predictor.loadData("data/cinema.csv")
    val encoded = predictor.encodeGenre(df)
    val assembled = predictor.assembleFeatures(encoded)
    val (trainData, testData) = predictor.splitData(assembled)

    val model = predictor.train(trainData)

    model should not be null
  }

  it should "モデルの性能を評価できる" in {
    val predictor = CinemaPredictor(spark)
    val df = predictor.loadData("data/cinema.csv")
    val encoded = predictor.encodeGenre(df)
    val assembled = predictor.assembleFeatures(encoded)
    val (trainData, testData) = predictor.splitData(assembled)
    val model = predictor.train(trainData)

    val r2 = predictor.evaluate(model, testData)

    // R² スコアは0から1の範囲（1に近いほど良い）
    r2 should be >= 0.0
    r2 should be <= 1.0
  }
}
