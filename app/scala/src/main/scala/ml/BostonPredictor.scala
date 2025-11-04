package ml

import org.apache.spark.sql.{DataFrame, SparkSession}
import org.apache.spark.ml.{Pipeline, PipelineModel}
import org.apache.spark.ml.feature.{SQLTransformer, VectorAssembler, StandardScaler, StringIndexer, OneHotEncoder}
import org.apache.spark.ml.regression.LinearRegression
import org.apache.spark.ml.evaluation.RegressionEvaluator

class BostonPredictor(spark: SparkSession) {

  def loadData(path: String): DataFrame = {
    spark.read
      .option("header", "true")
      .option("inferSchema", "true")
      .csv(path)
  }

  def encodeCategorical(df: DataFrame): DataFrame = {
    // CRIME カテゴリカル変数のエンコーディング
    val crimeIndexer = new StringIndexer()
      .setInputCol("CRIME")
      .setOutputCol("CRIME_index")

    val crimeEncoder = new OneHotEncoder()
      .setInputCol("CRIME_index")
      .setOutputCol("CRIME_vec")

    val encodePipeline = new Pipeline().setStages(Array(
      crimeIndexer, crimeEncoder
    ))

    encodePipeline.fit(df).transform(df)
  }

  def engineerFeatures(df: DataFrame): DataFrame = {
    val featureEngineering = new SQLTransformer().setStatement("""
      SELECT *,
        RM * RM as RM2,
        LSTAT * LSTAT as LSTAT2,
        PTRATIO * PTRATIO as PTRATIO2,
        RM * LSTAT as RM_LSTAT,
        RM * PTRATIO as RM_PTRATIO
      FROM __THIS__
    """)

    featureEngineering.transform(df)
  }

  def cleanData(df: DataFrame): DataFrame = {
    // 異常値を除去（PRICE が 50 以上は外れ値として除去）
    df.filter("PRICE < 50 AND PRICE > 0")
      .filter("RM > 0 AND LSTAT > 0")
  }

  def assembleFeatures(df: DataFrame): DataFrame = {
    val assembler = new VectorAssembler()
      .setInputCols(Array(
        // カテゴリカル特徴量（エンコード済み）
        "CRIME_vec",
        // 数値特徴量
        "ZN", "INDUS", "CHAS", "NOX", "RM", "AGE", "DIS",
        "RAD", "TAX", "PTRATIO", "B", "LSTAT",
        // エンジニアリングした特徴量
        "RM2", "LSTAT2", "PTRATIO2", "RM_LSTAT", "RM_PTRATIO"
      ))
      .setOutputCol("features")
      .setHandleInvalid("skip")  // NULL値を含む行をスキップ

    assembler.transform(df)
  }

  def scaleFeatures(df: DataFrame): DataFrame = {
    val scaler = new StandardScaler()
      .setInputCol("features")
      .setOutputCol("scaled_features")
      .setWithMean(true)   // 平均を0にする
      .setWithStd(true)    // 標準偏差を1にする

    scaler.fit(df).transform(df)
  }

  def splitData(df: DataFrame, testRatio: Double = 0.3): (DataFrame, DataFrame) = {
    val Array(trainData, testData) = df.randomSplit(Array(0.7, 0.3), seed = 42)
    (trainData, testData)
  }

  def train(trainData: DataFrame): PipelineModel = {
    val lr = new LinearRegression()
      .setLabelCol("PRICE")
      .setFeaturesCol("scaled_features")
      .setMaxIter(100)
      .setRegParam(0.1)        // L2正則化
      .setElasticNetParam(0.0)  // 0=Ridge, 1=Lasso

    val pipeline = new Pipeline().setStages(Array(lr))
    pipeline.fit(trainData)
  }

  def evaluate(model: PipelineModel, testData: DataFrame): Double = {
    val predictions = model.transform(testData)

    val evaluator = new RegressionEvaluator()
      .setLabelCol("PRICE")
      .setPredictionCol("prediction")
      .setMetricName("r2")

    evaluator.evaluate(predictions)
  }

  def saveModel(model: PipelineModel, path: String): Unit = {
    model.write.overwrite().save(path)
  }

  def loadModel(path: String): PipelineModel = {
    PipelineModel.load(path)
  }
}

object BostonPredictor {
  def apply(spark: SparkSession): BostonPredictor = new BostonPredictor(spark)
}
