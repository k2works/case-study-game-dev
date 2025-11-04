package ml

import org.apache.spark.sql.{DataFrame, SparkSession}
import org.apache.spark.ml.{Pipeline, PipelineModel}
import org.apache.spark.ml.classification.DecisionTreeClassifier
import org.apache.spark.ml.feature.{StringIndexer, VectorAssembler}
import org.apache.spark.ml.evaluation.MulticlassClassificationEvaluator

class IrisClassifier(spark: SparkSession) {

  def loadData(path: String): DataFrame = {
    spark.read
      .option("header", "true")
      .option("inferSchema", "true")
      .csv(path)
  }

  def prepareFeatures(df: DataFrame): DataFrame = {
    val labelIndexer = new StringIndexer()
      .setInputCol("species")
      .setOutputCol("label")

    val assembler = new VectorAssembler()
      .setInputCols(Array("sepal_length", "sepal_width", "petal_length", "petal_width"))
      .setOutputCol("features")
      .setHandleInvalid("skip")

    val pipeline = new Pipeline().setStages(Array(labelIndexer, assembler))
    pipeline.fit(df).transform(df)
  }

  def splitData(df: DataFrame, testRatio: Double = 0.3): (DataFrame, DataFrame) = {
    val Array(trainData, testData) = df.randomSplit(Array(0.7, 0.3), seed = 42)
    (trainData, testData)
  }

  def train(trainData: DataFrame): PipelineModel = {
    val dt = new DecisionTreeClassifier()
      .setLabelCol("label")
      .setFeaturesCol("features")
      .setMaxDepth(5)

    val pipeline = new Pipeline().setStages(Array(dt))
    pipeline.fit(trainData)
  }

  def evaluate(model: PipelineModel, testData: DataFrame): Double = {
    val predictions = model.transform(testData)

    val evaluator = new MulticlassClassificationEvaluator()
      .setLabelCol("label")
      .setPredictionCol("prediction")
      .setMetricName("accuracy")

    evaluator.evaluate(predictions)
  }

  def saveModel(model: PipelineModel, path: String): Unit = {
    model.write.overwrite().save(path)
  }

  def loadModel(path: String): PipelineModel = {
    PipelineModel.load(path)
  }
}

object IrisClassifier {
  def apply(spark: SparkSession): IrisClassifier = new IrisClassifier(spark)
}
