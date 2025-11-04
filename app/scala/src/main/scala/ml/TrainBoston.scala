package ml

import org.apache.spark.sql.SparkSession

object TrainBoston {
  def main(args: Array[String]): Unit = {
    val spark = SparkSession.builder()
      .appName("Boston Training")
      .master("local[*]")
      .config("spark.driver.bindAddress", "127.0.0.1")
      .getOrCreate()

    try {
      spark.sparkContext.setLogLevel("ERROR")

      val predictor = BostonPredictor(spark)

      println("=".repeat(50))
      println("Boston 住宅価格予測モデル訓練")
      println("=".repeat(50))
      println()

      // データ読み込み
      println(s"データ読み込み中: data/Boston.csv")
      val df = predictor.loadData("data/Boston.csv")
      println(s"データ件数: ${df.count()}")
      println()

      // カテゴリカル変数のエンコーディング
      println("=== カテゴリカル変数エンコーディング中... ===")
      val encoded = predictor.encodeCategorical(df)
      println("カテゴリカル変数エンコーディング完了")
      encoded.select("CRIME", "CRIME_vec").show(5, truncate = false)

      // 特徴量エンジニアリング
      println("=== 特徴量エンジニアリング中... ===")
      val engineered = predictor.engineerFeatures(encoded)
      println("特徴量エンジニアリング完了")
      engineered.select("RM", "RM2", "LSTAT", "LSTAT2", "RM_LSTAT").show(5)

      // データクリーニング
      val cleaned = predictor.cleanData(engineered)
      println(s"\n=== データクリーニング完了 ===")
      println(s"クリーニング前: ${engineered.count()}, クリーニング後: ${cleaned.count()}")

      // 特徴量統合
      println("\n=== 特徴量統合中... ===")
      val assembled = predictor.assembleFeatures(cleaned)
      println(s"特徴量統合完了: ${assembled.count()} 件")
      println()

      // データ標準化
      println("=== データ標準化中... ===")
      val scaled = predictor.scaleFeatures(assembled)
      println("データ標準化完了")
      scaled.select("features", "scaled_features").show(3, truncate = false)

      // データ分割
      val (trainData, testData) = predictor.splitData(scaled)
      println(s"\n訓練データ: ${trainData.count()}, テストデータ: ${testData.count()}")

      // モデル訓練
      println("\n=== モデル訓練中... ===")
      val model = predictor.train(trainData)
      println("モデル訓練完了")
      println()

      // モデル評価
      println("=== モデル評価 ===")
      val r2 = predictor.evaluate(model, testData)
      println(f"R² Score: ${r2 * 100}%.2f%%")

      // 複数の評価指標を計算
      val predictions = model.transform(testData)
      val evaluator = new org.apache.spark.ml.evaluation.RegressionEvaluator()
        .setLabelCol("PRICE")
        .setPredictionCol("prediction")

      val rmse = evaluator.setMetricName("rmse").evaluate(predictions)
      val mae = evaluator.setMetricName("mae").evaluate(predictions)
      val mse = evaluator.setMetricName("mse").evaluate(predictions)

      println(f"RMSE: $rmse%.4f")
      println(f"MAE: $mae%.4f")
      println(f"MSE: $mse%.4f")
      println()

      // モデル保存（Windows以外）
      val osName = System.getProperty("os.name").toLowerCase
      if (!osName.contains("win")) {
        println("=== モデル保存中... ===")
        predictor.saveModel(model, "model/boston_model")
        println("モデル保存完了: model/boston_model")
      } else {
        println("Note: Model persistence is disabled on Windows due to Hadoop limitations")
        println("      The model can be retrained in about 10 seconds")
      }
      println()

      // 予測結果のサンプル表示
      println("=== 予測結果サンプル ===")
      predictions.select("PRICE", "prediction").show(10)

      println("=".repeat(50))
      println("訓練完了")
      println("=".repeat(50))

    } finally {
      spark.stop()
    }
  }
}
