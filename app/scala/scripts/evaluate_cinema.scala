#!/usr/bin/env scala

// 評価スクリプト: 保存済みCinema回帰モデルの評価
// 使用方法: scala scripts/evaluate_cinema.scala [model_path] [data_path]

import org.apache.spark.sql.SparkSession
import org.apache.spark.ml.PipelineModel
import org.apache.spark.ml.evaluation.RegressionEvaluator
import org.apache.spark.ml.feature.{StringIndexer, OneHotEncoder, VectorAssembler}
import org.apache.spark.ml.Pipeline

object EvaluateCinemaScript {
  def main(args: Array[String]): Unit = {
    // SparkSession の作成
    val spark = SparkSession.builder()
      .appName("CinemaEvaluation")
      .master("local[*]")
      .config("spark.driver.bindAddress", "127.0.0.1")
      .getOrCreate()

    try {
      spark.sparkContext.setLogLevel("WARN")

      println("=" * 50)
      println("Cinema Model Evaluation")
      println("=" * 50)
      println()

      // パラメータ取得
      val modelPath = args.headOption.getOrElse("model/cinema_model")
      val dataPath = args.lift(1).getOrElse("data/cinema.csv")

      // データをロード
      println(s"Loading data from $dataPath...")
      val df = spark.read
        .option("header", "true")
        .option("inferSchema", "true")
        .csv(dataPath)
      println(s"Loaded ${df.count()} records")
      println()

      // ジャンルをOneHotエンコーディング
      println("Encoding genre...")
      val indexer = new StringIndexer()
        .setInputCol("genre")
        .setOutputCol("genre_index")

      val encoder = new OneHotEncoder()
        .setInputCol("genre_index")
        .setOutputCol("genre_vec")
        .setDropLast(false)

      val encodePipeline = new Pipeline().setStages(Array(indexer, encoder))
      val encodedDf = encodePipeline.fit(df).transform(df)

      // 特徴量を統合
      println("Assembling features...")
      val assembler = new VectorAssembler()
        .setInputCols(Array(
          "budget",
          "popularity",
          "runtime",
          "vote_average",
          "genre_vec"
        ))
        .setOutputCol("features")
        .setHandleInvalid("skip")

      val preparedDf = assembler.transform(encodedDf)
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
        val evaluator = new RegressionEvaluator()
          .setLabelCol("revenue")
          .setPredictionCol("prediction")

        // R² Score
        val r2 = evaluator.setMetricName("r2").evaluate(predictions)
        println(f"R² Score: ${r2 * 100}%.2f%%")

        // RMSE (Root Mean Squared Error)
        val rmse = evaluator.setMetricName("rmse").evaluate(predictions)
        println(f"RMSE: $rmse%.2f")

        // MAE (Mean Absolute Error)
        val mae = evaluator.setMetricName("mae").evaluate(predictions)
        println(f"MAE: $mae%.2f")
        println()

        // 予測結果のサンプル表示
        println("Sample predictions:")
        predictions.select("budget", "popularity", "runtime", "vote_average", "genre",
                          "revenue", "prediction")
          .show(10, truncate = false)

        println("=" * 50)
        println("Evaluation Completed Successfully")
        println("=" * 50)

      } catch {
        case e: Exception =>
          println(s"Error: Could not load model from $modelPath")
          println(s"Reason: ${e.getMessage}")
          println()
          println("Note: Model persistence is not available on Windows")
          println("      Please train a model first using train_cinema.scala on Linux/Mac")
          System.exit(1)
      }

    } finally {
      spark.stop()
    }
  }
}

EvaluateCinemaScript.main(args)
