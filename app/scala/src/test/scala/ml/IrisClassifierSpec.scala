package ml

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.BeforeAndAfterAll
import org.apache.spark.sql.SparkSession

class IrisClassifierSpec extends AnyFlatSpec with Matchers with BeforeAndAfterAll {

  var spark: SparkSession = _
  var classifier: IrisClassifier = _

  override def beforeAll(): Unit = {
    spark = SparkSession.builder()
      .appName("IrisClassifierTest")
      .master("local[*]")
      .config("spark.driver.bindAddress", "127.0.0.1")
      .config("spark.ui.enabled", "false")
      .getOrCreate()

    spark.sparkContext.setLogLevel("ERROR")
    classifier = IrisClassifier(spark)
  }

  override def afterAll(): Unit = {
    if (spark != null) {
      spark.stop()
    }
  }

  "IrisClassifier" should "データを読み込める" in {
    val df = classifier.loadData("data/iris.csv")

    df.count() should be > 0L
    df.columns should contain allOf("sepal_length", "sepal_width", "petal_length", "petal_width", "species")
  }

  it should "特徴量を準備できる" in {
    val df = classifier.loadData("data/iris.csv")
    val preparedDf = classifier.prepareFeatures(df)

    preparedDf.columns should contain allOf("features", "label")
  }

  it should "データを分割できる" in {
    val df = classifier.loadData("data/iris.csv")
    val preparedDf = classifier.prepareFeatures(df)
    val (trainData, testData) = classifier.splitData(preparedDf)

    trainData.count() should be > 0L
    testData.count() should be > 0L
    (trainData.count() + testData.count()) shouldEqual df.count()
  }

  it should "モデルを訓練できる" in {
    val df = classifier.loadData("data/iris.csv")
    val preparedDf = classifier.prepareFeatures(df)
    val (trainData, _) = classifier.splitData(preparedDf)

    val model = classifier.train(trainData)

    model should not be null
  }

  it should "モデルを評価できる" in {
    val df = classifier.loadData("data/iris.csv")
    val preparedDf = classifier.prepareFeatures(df)
    val (trainData, testData) = classifier.splitData(preparedDf)
    val model = classifier.train(trainData)

    val accuracy = classifier.evaluate(model, testData)

    accuracy should be > 0.8
    accuracy should be <= 1.0
  }

  it should "モデルを保存・ロードできる" in {
    val df = classifier.loadData("data/iris.csv")
    val preparedDf = classifier.prepareFeatures(df)
    val (trainData, testData) = classifier.splitData(preparedDf)
    val model = classifier.train(trainData)

    val modelPath = "model/iris_model_test"
    classifier.saveModel(model, modelPath)

    val loadedModel = classifier.loadModel(modelPath)
    val accuracy = classifier.evaluate(loadedModel, testData)

    accuracy should be > 0.8
  }
}
