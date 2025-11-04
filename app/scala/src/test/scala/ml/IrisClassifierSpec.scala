package ml

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.BeforeAndAfterAll
import org.apache.spark.sql.SparkSession

class IrisClassifierSpec extends AnyFlatSpec with BeforeAndAfterAll {

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

    assert(df.count() > 0)
    assert(df.columns.contains("sepal_length"))
    assert(df.columns.contains("sepal_width"))
    assert(df.columns.contains("petal_length"))
    assert(df.columns.contains("petal_width"))
    assert(df.columns.contains("species"))
  }

  it should "特徴量を準備できる" in {
    val df = classifier.loadData("data/iris.csv")
    val preparedDf = classifier.prepareFeatures(df)

    assert(preparedDf.columns.contains("features"))
    assert(preparedDf.columns.contains("label"))
  }

  it should "データを分割できる" in {
    val df = classifier.loadData("data/iris.csv")
    val preparedDf = classifier.prepareFeatures(df)
    val (trainData, testData) = classifier.splitData(preparedDf)

    assert(trainData.count() > 0)
    assert(testData.count() > 0)
    // prepareFeatures で null 値を持つ行がスキップされるため、合計は元のデータより少ない
    assert(trainData.count() + testData.count() == preparedDf.count())
  }

  it should "モデルを訓練できる" in {
    val df = classifier.loadData("data/iris.csv")
    val preparedDf = classifier.prepareFeatures(df)
    val (trainData, _) = classifier.splitData(preparedDf)

    val model = classifier.train(trainData)

    assert(model != null)
  }

  it should "モデルを評価できる" in {
    val df = classifier.loadData("data/iris.csv")
    val preparedDf = classifier.prepareFeatures(df)
    val (trainData, testData) = classifier.splitData(preparedDf)
    val model = classifier.train(trainData)

    val accuracy = classifier.evaluate(model, testData)

    assert(accuracy > 0.8)
    assert(accuracy <= 1.0)
  }

  // Windows環境ではHadoopのwinutils.exeが必要なため、このテストをスキップ
  // Linux/Mac環境では動作します
  ignore should "モデルを保存・ロードできる" in {
    val df = classifier.loadData("data/iris.csv")
    val preparedDf = classifier.prepareFeatures(df)
    val (trainData, testData) = classifier.splitData(preparedDf)
    val model = classifier.train(trainData)

    val modelPath = "model/iris_model_test"
    classifier.saveModel(model, modelPath)

    val loadedModel = classifier.loadModel(modelPath)
    val accuracy = classifier.evaluate(loadedModel, testData)

    assert(accuracy > 0.8)
  }
}
