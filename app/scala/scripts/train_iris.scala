#!/usr/bin/env scala

// 訓練スクリプト: Irisモデルの訓練と保存
// 使用方法: scala scripts/train_iris.scala

import org.apache.spark.sql.SparkSession
import org.apache.spark.ml.{Pipeline, PipelineModel}
import org.apache.spark.ml.classification.DecisionTreeClassifier
import org.apache.spark.ml.feature.{StringIndexer, VectorAssembler}
import org.apache.spark.ml.evaluation.MulticlassClassificationEvaluator

object TrainIrisScript {
  def main(args: Array[String]): Unit = {
    // SparkSession の作成
    val spark = SparkSession.builder()
      .appName("IrisTraining")
      .master("local[*]")
      .config("spark.driver.bindAddress", "127.0.0.1")
      .getOrCreate()

    try {
      spark.sparkContext.setLogLevel("WARN")

      println("=" * 50)
      println("Iris Classification Model Training")
      println("=" * 50)
      println()

      // データをロード
      val dataPath = args.headOption.getOrElse("data/iris.csv")
      println(s"Loading data from $dataPath...")
      val df = spark.read
        .option("header", "true")
        .option("inferSchema", "true")
        .csv(dataPath)
      println(s"Loaded ${df.count()} records")
      println()

      // 特徴量を準備
      println("Preparing features...")
      val labelIndexer = new StringIndexer()
        .setInputCol("species")
        .setOutputCol("label")

      val assembler = new VectorAssembler()
        .setInputCols(Array("sepal_length", "sepal_width", "petal_length", "petal_width"))
        .setOutputCol("features")
        .setHandleInvalid("skip")

      val prepPipeline = new Pipeline().setStages(Array(labelIndexer, assembler))
      val preparedDf = prepPipeline.fit(df).transform(df)
      println(s"Prepared ${preparedDf.count()} records (null values skipped)")
      println()

      // データを分割
      println("Splitting data into training and test sets...")
      val Array(trainData, testData) = preparedDf.randomSplit(Array(0.7, 0.3), seed = 42)
      println(s"Training set: ${trainData.count()} records")
      println(s"Test set: ${testData.count()} records")
      println()

      // モデルを訓練
      println("Training Decision Tree model...")
      val dt = new DecisionTreeClassifier()
        .setLabelCol("label")
        .setFeaturesCol("features")
        .setMaxDepth(5)

      val pipeline = new Pipeline().setStages(Array(dt))
      val model = pipeline.fit(trainData)
      println("Model training completed")
      println()

      // モデルを評価
      println("Evaluating model on test set...")
      val predictions = model.transform(testData)
      val evaluator = new MulticlassClassificationEvaluator()
        .setLabelCol("label")
        .setPredictionCol("prediction")
        .setMetricName("accuracy")

      val accuracy = evaluator.evaluate(predictions)
      println(f"Test Accuracy: ${accuracy * 100}%.2f%%")
      println()

      // モデルを保存（オプション）
      val modelPath = args.lift(1).getOrElse("model/iris_model")
      println(s"Saving model to $modelPath...")
      try {
        model.write.overwrite().save(modelPath)
        println("Model saved successfully")
      } catch {
        case e: Exception =>
          println(s"Warning: Could not save model (${e.getMessage})")
          println("This is expected on Windows without Hadoop winutils")
      }
      println()

      println("=" * 50)
      println("Training Completed Successfully")
      println("=" * 50)

    } finally {
      spark.stop()
    }
  }
}

TrainIrisScript.main(args)
