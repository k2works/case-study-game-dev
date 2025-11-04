package ml

import org.apache.spark.sql.SparkSession

object TrainCinema {

  def main(args: Array[String]): Unit = {
    println("=== Cinema Revenue Prediction Model Training ===")
    println()

    // SparkSession の作成
    val spark = SparkSession.builder()
      .appName("CinemaRevenuePredictor")
      .master("local[*]")
      .config("spark.driver.bindAddress", "127.0.0.1")
      .config("spark.sql.warehouse.dir", "file:///C:/tmp/spark-warehouse")
      .getOrCreate()

    spark.sparkContext.setLogLevel("ERROR")

    try {
      // データパスの取得
      val dataPath = args.headOption.getOrElse("data/cinema.csv")

      println(s"Loading data from $dataPath...")
      val predictor = CinemaPredictor(spark)
      val df = predictor.loadData(dataPath)
      println(s"Loaded ${df.count()} records")
      println()

      // データの確認
      println("Data sample:")
      df.show(5, truncate = false)
      println()

      // 特徴量エンジニアリング
      println("Preparing features...")
      val encoded = predictor.encodeGenre(df)
      val assembled = predictor.assembleFeatures(encoded)
      println(s"Prepared ${assembled.count()} records (null values skipped)")
      println()

      // データ分割
      println("Splitting data into training and test sets...")
      val (trainData, testData) = predictor.splitData(assembled)
      println(s"Training set: ${trainData.count()} records")
      println(s"Test set: ${testData.count()} records")
      println()

      // モデル訓練
      println("Training model...")
      val model = predictor.train(trainData)
      println("Model training completed")
      println()

      // モデル評価
      println("Evaluating model...")
      val r2Score = predictor.evaluate(model, testData)
      println(f"Test R² Score: ${r2Score * 100}%.2f%%")
      println()

      // 予測例の表示
      println("Prediction examples:")
      val predictions = model.transform(testData)
      predictions.select("revenue", "prediction", "budget", "popularity", "genre")
        .show(10, truncate = false)

      // OS 検出
      val osName = System.getProperty("os.name").toLowerCase
      val isWindows = osName.contains("win")

      // モデルを保存（Windows以外の環境のみ）
      if (!isWindows) {
        val modelPath = if (args.length >= 2) args(1) else "model/cinema_model"
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
        println("      The model was trained successfully (10 seconds to retrain)")
        println()
      }

      println("=== Training Completed ===")

    } finally {
      spark.stop()
    }
  }
}
