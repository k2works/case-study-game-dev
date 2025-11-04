package ml

import org.apache.spark.sql.{DataFrame, SparkSession}
import org.apache.spark.ml.feature.{StringIndexer, OneHotEncoder, VectorAssembler}
import org.apache.spark.ml.Pipeline
import org.apache.spark.ml.PipelineModel
import org.apache.spark.ml.regression.LinearRegression
import org.apache.spark.ml.evaluation.RegressionEvaluator

class CinemaPredictor(spark: SparkSession) {

  def loadData(path: String): DataFrame = {
    spark.read
      .option("header", "true")
      .option("inferSchema", "true")
      .csv(path)
  }

  def encodeGenre(df: DataFrame): DataFrame = {
    // ステップ1: StringIndexer でジャンルを数値に変換
    // Horror → 0, Comedy → 1, Drama → 2, ...
    val indexer = new StringIndexer()
      .setInputCol("genre")
      .setOutputCol("genre_index")

    // ステップ2: OneHotEncoder でダミー変数化
    // 0 → [1, 0, 0, 0]
    // 1 → [0, 1, 0, 0]
    // 2 → [0, 0, 1, 0]
    val encoder = new OneHotEncoder()
      .setInputCol("genre_index")
      .setOutputCol("genre_vec")
      .setDropLast(false)  // すべてのカテゴリを保持

    val pipeline = new Pipeline().setStages(Array(indexer, encoder))
    pipeline.fit(df).transform(df)
  }

  def assembleFeatures(df: DataFrame): DataFrame = {
    val assembler = new VectorAssembler()
      .setInputCols(Array(
        "budget",
        "popularity",
        "runtime",
        "vote_average",
        "genre_vec"  // OneHotエンコード済みのジャンル
      ))
      .setOutputCol("features")
      .setHandleInvalid("skip")

    assembler.transform(df)
  }

  def splitData(df: DataFrame, testRatio: Double = 0.3): (DataFrame, DataFrame) = {
    val Array(trainData, testData) = df.randomSplit(Array(0.7, 0.3), seed = 42)
    (trainData, testData)
  }

  def train(trainData: DataFrame): PipelineModel = {
    val lr = new LinearRegression()
      .setLabelCol("revenue")
      .setFeaturesCol("features")
      .setMaxIter(100)         // 最大イテレーション数
      .setRegParam(0.1)        // 正則化パラメータ（過学習防止）
      .setElasticNetParam(0.0) // Ridge回帰（L2正則化）

    val pipeline = new Pipeline().setStages(Array(lr))
    pipeline.fit(trainData)
  }

  def evaluate(model: PipelineModel, testData: DataFrame): Double = {
    val predictions = model.transform(testData)

    val evaluator = new RegressionEvaluator()
      .setLabelCol("revenue")
      .setPredictionCol("prediction")
      .setMetricName("r2")  // R² スコア

    evaluator.evaluate(predictions)
  }
}

object CinemaPredictor {
  def apply(spark: SparkSession): CinemaPredictor = new CinemaPredictor(spark)
}
