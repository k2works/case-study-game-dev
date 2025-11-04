package ml

import org.apache.spark.sql.{DataFrame, SparkSession}
import org.apache.spark.ml.{Pipeline, PipelineModel}
import org.apache.spark.ml.feature.{Imputer, StringIndexer, OneHotEncoder, VectorAssembler}
import org.apache.spark.ml.classification.LogisticRegression
import org.apache.spark.ml.evaluation.BinaryClassificationEvaluator

class SurvivedClassifier(spark: SparkSession) {

  def loadData(path: String): DataFrame = {
    val df = spark.read
      .option("header", "true")
      .option("inferSchema", "true")
      .csv(path)

    // カラム名を小文字に変換
    df.columns.foldLeft(df) { (currentDF, colName) =>
      currentDF.withColumnRenamed(colName, colName.toLowerCase)
    }
  }

  def imputeMissingValues(df: DataFrame): DataFrame = {
    val imputer = new Imputer()
      .setInputCols(Array("age", "fare"))
      .setOutputCols(Array("age_imputed", "fare_imputed"))
      .setStrategy("mean")

    imputer.fit(df).transform(df)
  }

  def encodeCategorical(df: DataFrame): DataFrame = {
    val sexIndexer = new StringIndexer()
      .setInputCol("sex")
      .setOutputCol("sex_index")

    val sexEncoder = new OneHotEncoder()
      .setInputCol("sex_index")
      .setOutputCol("sex_vec")

    val embarkedIndexer = new StringIndexer()
      .setInputCol("embarked")
      .setOutputCol("embarked_index")
      .setHandleInvalid("keep")

    val embarkedEncoder = new OneHotEncoder()
      .setInputCol("embarked_index")
      .setOutputCol("embarked_vec")

    val pipeline = new Pipeline().setStages(Array(
      sexIndexer, sexEncoder,
      embarkedIndexer, embarkedEncoder
    ))

    pipeline.fit(df).transform(df)
  }

  def removeOutliers(df: DataFrame): DataFrame = {
    df.filter("fare_imputed < 500 AND fare_imputed > 0")
  }

  def assembleFeatures(df: DataFrame): DataFrame = {
    val assembler = new VectorAssembler()
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
  }

  def splitData(df: DataFrame, testRatio: Double = 0.3): (DataFrame, DataFrame) = {
    val Array(trainData, testData) = df.randomSplit(Array(0.7, 0.3), seed = 42)
    (trainData, testData)
  }

  def train(trainData: DataFrame): PipelineModel = {
    val labeledData = trainData.withColumnRenamed("survived", "label")

    val lr = new LogisticRegression()
      .setLabelCol("label")
      .setFeaturesCol("features")
      .setMaxIter(100)
      .setRegParam(0.01)

    val pipeline = new Pipeline().setStages(Array(lr))
    pipeline.fit(labeledData)
  }

  def evaluate(model: PipelineModel, testData: DataFrame): Double = {
    val labeledData = testData.withColumnRenamed("survived", "label")
    val predictions = model.transform(labeledData)

    val correct = predictions.filter("prediction = label").count()
    val total = predictions.count()
    correct.toDouble / total
  }

  def saveModel(model: PipelineModel, path: String): Unit = {
    model.write.overwrite().save(path)
  }

  def loadModel(path: String): PipelineModel = {
    PipelineModel.load(path)
  }
}

object SurvivedClassifier {
  def apply(spark: SparkSession): SurvivedClassifier = new SurvivedClassifier(spark)
}
