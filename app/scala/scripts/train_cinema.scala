#!/usr/bin/env scala

// 訓練スクリプト: Cinema回帰モデルの訓練と保存
// 使用方法: scala scripts/train_cinema.scala

import org.apache.spark.sql.SparkSession
import org.apache.spark.ml.{Pipeline, PipelineModel}
import org.apache.spark.ml.regression.LinearRegression
import org.apache.spark.ml.feature.{StringIndexer, OneHotEncoder, VectorAssembler}
import org.apache.spark.ml.evaluation.RegressionEvaluator

object TrainCinemaScript {
  def main(args: Array[String]): Unit = {
    // SparkSession の作成
    val spark = SparkSession.builder()
      .appName("CinemaTraining")
      .master("local[*]")
      .config("spark.driver.bindAddress", "127.0.0.1")
      .getOrCreate()

    try {
      spark.sparkContext.setLogLevel("WARN")

      println("=" * 50)
      println("Cinema Revenue Prediction Model Training")
      println("=" * 50)
      println()

      // データをロード
      val dataPath = args.headOption.getOrElse("data/cinema.csv")
      println(s"Loading data from $dataPath...")
      val df = spark.read
        .option("header", "true")
        .option("inferSchema", "true")
        .csv(dataPath)
      println(s"Loaded ${df.count()} records")
      println()

      // ジャンルをOneHotエンコーディング
      println("Encoding genre with OneHot encoding...")
      val indexer = new StringIndexer()
        .setInputCol("genre")
        .setOutputCol("genre_index")

      val encoder = new OneHotEncoder()
        .setInputCol("genre_index")
        .setOutputCol("genre_vec")
        .setDropLast(false)

      val encodePipeline = new Pipeline().setStages(Array(indexer, encoder))
      val encodedDf = encodePipeline.fit(df).transform(df)
      println("Genre encoding completed")
      println()

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

      val assembledDf = assembler.transform(encodedDf)
      println(s"Assembled ${assembledDf.count()} records (null values skipped)")
      println()

      // データを分割
      println("Splitting data into training and test sets...")
      val Array(trainData, testData) = assembledDf.randomSplit(Array(0.7, 0.3), seed = 42)
      println(s"Training set: ${trainData.count()} records")
      println(s"Test set: ${testData.count()} records")
      println()

      // モデルを訓練
      println("Training Linear Regression model...")
      val lr = new LinearRegression()
        .setLabelCol("revenue")
        .setFeaturesCol("features")
        .setMaxIter(100)
        .setRegParam(0.1)
        .setElasticNetParam(0.0)

      val pipeline = new Pipeline().setStages(Array(lr))
      val model = pipeline.fit(trainData)
      println("Model training completed")
      println()

      // モデルを評価
      println("Evaluating model on test set...")
      val predictions = model.transform(testData)
      val evaluator = new RegressionEvaluator()
        .setLabelCol("revenue")
        .setPredictionCol("prediction")
        .setMetricName("r2")

      val r2 = evaluator.evaluate(predictions)
      println(f"Test R² Score: ${r2 * 100}%.2f%%")
      println()

      // RMSE も表示
      evaluator.setMetricName("rmse")
      val rmse = evaluator.evaluate(predictions)
      println(f"Test RMSE: $rmse%.2f")
      println()

      // モデルを保存（オプション）
      // OS 検出: Windows ではスキップ
      val osName = System.getProperty("os.name").toLowerCase
      val isWindows = osName.contains("win")

      if (!isWindows) {
        val modelPath = args.lift(1).getOrElse("model/cinema_model")
        println(s"Saving model to $modelPath...")
        try {
          model.write.overwrite().save(modelPath)
          println("Model saved successfully")
        } catch {
          case e: Exception =>
            println(s"Warning: Could not save model (${e.getMessage})")
        }
        println()
      } else {
        println("Note: Model persistence is disabled on Windows due to Hadoop limitations")
        println("      The model can be retrained in about 10 seconds")
        println()
      }

      println("=" * 50)
      println("Training Completed Successfully")
      println("=" * 50)

    } finally {
      spark.stop()
    }
  }
}

TrainCinemaScript.main(args)
