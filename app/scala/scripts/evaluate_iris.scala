#!/usr/bin/env scala

// 評価スクリプト: 保存済みIrisモデルの評価
// 使用方法: scala scripts/evaluate_iris.scala [model_path] [data_path]

import org.apache.spark.sql.SparkSession
import org.apache.spark.ml.PipelineModel
import org.apache.spark.ml.evaluation.MulticlassClassificationEvaluator
import org.apache.spark.ml.feature.{StringIndexer, VectorAssembler}
import org.apache.spark.ml.Pipeline

object EvaluateIrisScript {
  def main(args: Array[String]): Unit = {
    // SparkSession の作成
    val spark = SparkSession.builder()
      .appName("IrisEvaluation")
      .master("local[*]")
      .config("spark.driver.bindAddress", "127.0.0.1")
      .getOrCreate()

    try {
      spark.sparkContext.setLogLevel("WARN")

      println("=" * 50)
      println("Iris Model Evaluation")
      println("=" * 50)
      println()

      // パラメータ取得
      val modelPath = args.headOption.getOrElse("model/iris_model")
      val dataPath = args.lift(1).getOrElse("data/iris.csv")

      // データをロード
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
      println(s"Prepared ${preparedDf.count()} records")
      println()

      // モデルをロード
      println(s"Loading model from $modelPath...")
      try {
        val model = PipelineModel.load(modelPath)
        println("Model loaded successfully")
        println()

        // 予測を実行
        println("Making predictions...")
        val predictions = model.transform(preparedDf)

        // 評価メトリクスを計算
        val evaluator = new MulticlassClassificationEvaluator()
          .setLabelCol("label")
          .setPredictionCol("prediction")

        // Accuracy
        val accuracy = evaluator.setMetricName("accuracy").evaluate(predictions)
        println(f"Accuracy: ${accuracy * 100}%.2f%%")

        // Weighted Precision
        val precision = evaluator.setMetricName("weightedPrecision").evaluate(predictions)
        println(f"Weighted Precision: ${precision * 100}%.2f%%")

        // Weighted Recall
        val recall = evaluator.setMetricName("weightedRecall").evaluate(predictions)
        println(f"Weighted Recall: ${recall * 100}%.2f%%")

        // F1 Score
        val f1 = evaluator.setMetricName("f1").evaluate(predictions)
        println(f"F1 Score: ${f1 * 100}%.2f%%")
        println()

        // 予測結果のサンプル表示
        println("Sample predictions:")
        predictions.select("sepal_length", "sepal_width", "petal_length", "petal_width",
                          "label", "prediction")
          .show(10, truncate = false)

        println("=" * 50)
        println("Evaluation Completed Successfully")
        println("=" * 50)

      } catch {
        case e: Exception =>
          println(s"Error: Could not load model from $modelPath")
          println(s"Reason: ${e.getMessage}")
          println()
          println("Please train a model first using train_iris.scala")
          System.exit(1)
      }

    } finally {
      spark.stop()
    }
  }
}

EvaluateIrisScript.main(args)
